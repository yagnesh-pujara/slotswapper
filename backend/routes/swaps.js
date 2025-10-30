const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/swaps/swappable-slots
// @desc    Get all swappable slots from other users
// @access  Private
router.get('/swappable-slots', auth, async (req, res) => {
    try {
        // Find all swappable events that don't belong to the current user
        const swappableSlots = await Event.find({
            status: 'SWAPPABLE',
            userId: { $ne: req.userId }
        })
            .populate('userId', 'name email')
            .sort({ startTime: 1 });

        res.json(swappableSlots);
    } catch (error) {
        console.error('Get swappable slots error:', error);
        res.status(500).json({ error: 'Server error fetching swappable slots' });
    }
});

// @route   POST /api/swaps/request
// @desc    Create a swap request
// @access  Private
router.post('/request', [
    auth,
    body('mySlotId').notEmpty().withMessage('Your slot ID is required'),
    body('theirSlotId').notEmpty().withMessage('Their slot ID is required')
], async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            return res.status(400).json({ errors: errors.array() });
        }

        const { mySlotId, theirSlotId } = req.body;

        // Verify slots can't be the same
        if (mySlotId === theirSlotId) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Cannot swap a slot with itself' });
        }

        // Find both slots
        const mySlot = await Event.findOne({ _id: mySlotId, userId: req.userId }).session(session);
        const theirSlot = await Event.findById(theirSlotId).session(session);

        // Validate my slot
        if (!mySlot) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Your slot not found' });
        }

        if (mySlot.status !== 'SWAPPABLE') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Your slot must be swappable' });
        }

        // Validate their slot
        if (!theirSlot) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Requested slot not found' });
        }

        if (theirSlot.status !== 'SWAPPABLE') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Requested slot is not available for swapping' });
        }

        // Can't swap with your own slot
        if (theirSlot.userId.toString() === req.userId.toString()) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Cannot request swap with your own slot' });
        }

        // Check if swap request already exists
        const existingRequest = await SwapRequest.findOne({
            $or: [
                {
                    requesterId: req.userId,
                    requesterSlotId: mySlotId,
                    requestedSlotId: theirSlotId,
                    status: 'PENDING'
                },
                {
                    requesterId: req.userId,
                    requesterSlotId: theirSlotId,
                    requestedSlotId: mySlotId,
                    status: 'PENDING'
                }
            ]
        }).session(session);

        if (existingRequest) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Swap request already exists' });
        }

        // Create swap request
        const swapRequest = new SwapRequest({
            requesterId: req.userId,
            requestedUserId: theirSlot.userId,
            requesterSlotId: mySlotId,
            requestedSlotId: theirSlotId,
            status: 'PENDING'
        });

        await swapRequest.save({ session });

        // Update both slots to SWAP_PENDING
        mySlot.status = 'SWAP_PENDING';
        theirSlot.status = 'SWAP_PENDING';

        await mySlot.save({ session });
        await theirSlot.save({ session });

        await session.commitTransaction();

        // Populate the swap request for response
        await swapRequest.populate([
            { path: 'requesterId', select: 'name email' },
            { path: 'requestedUserId', select: 'name email' },
            { path: 'requesterSlotId' },
            { path: 'requestedSlotId' }
        ]);

        // Emit socket event to the requested user
        const io = req.app.get('io');
        io.to(theirSlot.userId.toString()).emit('swap-request', {
            swapRequest,
            message: 'New swap request received'
        });

        res.status(201).json(swapRequest);
    } catch (error) {
        await session.abortTransaction();
        console.error('Create swap request error:', error);
        res.status(500).json({ error: 'Server error creating swap request' });
    } finally {
        session.endSession();
    }
});

// @route   GET /api/swaps/requests
// @desc    Get all swap requests (incoming and outgoing)
// @access  Private
router.get('/requests', auth, async (req, res) => {
    try {
        // Get incoming requests (requests made to me)
        const incomingRequests = await SwapRequest.find({
            requestedUserId: req.userId,
            status: 'PENDING'
        })
            .populate('requesterId', 'name email')
            .populate('requesterSlotId')
            .populate('requestedSlotId')
            .sort({ createdAt: -1 });

        // Get outgoing requests (requests I made)
        const outgoingRequests = await SwapRequest.find({
            requesterId: req.userId,
            status: 'PENDING'
        })
            .populate('requestedUserId', 'name email')
            .populate('requesterSlotId')
            .populate('requestedSlotId')
            .sort({ createdAt: -1 });

        res.json({
            incoming: incomingRequests,
            outgoing: outgoingRequests
        });
    } catch (error) {
        console.error('Get swap requests error:', error);
        res.status(500).json({ error: 'Server error fetching swap requests' });
    }
});

// @route   POST /api/swaps/response/:requestId
// @desc    Accept or reject a swap request
// @access  Private
router.post('/response/:requestId', [
    auth,
    body('accept').isBoolean().withMessage('Accept must be true or false')
], async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            return res.status(400).json({ errors: errors.array() });
        }

        const { accept } = req.body;
        const { requestId } = req.params;

        // Find swap request
        const swapRequest = await SwapRequest.findById(requestId).session(session);

        if (!swapRequest) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Verify user is the requested user
        if (swapRequest.requestedUserId.toString() !== req.userId.toString()) {
            await session.abortTransaction();
            return res.status(403).json({ error: 'Not authorized to respond to this request' });
        }

        // Check if already responded
        if (swapRequest.status !== 'PENDING') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Swap request already processed' });
        }

        // Find both events
        const requesterSlot = await Event.findById(swapRequest.requesterSlotId).session(session);
        const requestedSlot = await Event.findById(swapRequest.requestedSlotId).session(session);

        if (!requesterSlot || !requestedSlot) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'One or both slots not found' });
        }

        // Verify both slots are still in SWAP_PENDING
        if (requesterSlot.status !== 'SWAP_PENDING' || requestedSlot.status !== 'SWAP_PENDING') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Slots are no longer in pending state' });
        }

        if (accept) {
            // ACCEPT: Swap the ownership and set to BUSY
            const tempUserId = requesterSlot.userId;
            requesterSlot.userId = requestedSlot.userId;
            requestedSlot.userId = tempUserId;

            requesterSlot.status = 'BUSY';
            requestedSlot.status = 'BUSY';

            swapRequest.status = 'ACCEPTED';

            await requesterSlot.save({ session });
            await requestedSlot.save({ session });
            await swapRequest.save({ session });

            await session.commitTransaction();

            // Emit socket event to requester
            const io = req.app.get('io');
            io.to(swapRequest.requesterId.toString()).emit('swap-accepted', {
                swapRequest,
                message: 'Your swap request was accepted'
            });

            res.json({
                message: 'Swap accepted successfully',
                swapRequest
            });
        } else {
            // REJECT: Set both slots back to SWAPPABLE
            requesterSlot.status = 'SWAPPABLE';
            requestedSlot.status = 'SWAPPABLE';

            swapRequest.status = 'REJECTED';

            await requesterSlot.save({ session });
            await requestedSlot.save({ session });
            await swapRequest.save({ session });

            await session.commitTransaction();

            // Emit socket event to requester
            const io = req.app.get('io');
            io.to(swapRequest.requesterId.toString()).emit('swap-rejected', {
                swapRequest,
                message: 'Your swap request was rejected'
            });

            res.json({
                message: 'Swap rejected',
                swapRequest
            });
        }
    } catch (error) {
        await session.abortTransaction();
        console.error('Respond to swap error:', error);
        res.status(500).json({ error: 'Server error responding to swap request' });
    } finally {
        session.endSession();
    }
});

module.exports = router;