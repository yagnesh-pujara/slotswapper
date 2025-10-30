const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const events = await Event.find({ userId: req.userId })
            .sort({ startTime: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Server error fetching events' });
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', [
    auth,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, startTime, endTime } = req.body;

        // Validate time range
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ error: 'End time must be after start time' });
        }

        // Create event
        const event = new Event({
            title,
            startTime,
            endTime,
            userId: req.userId,
            status: 'BUSY'
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Server error creating event' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, startTime, endTime, status } = req.body;

        // Find event
        const event = await Event.findOne({ _id: req.params.id, userId: req.userId });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Don't allow updating if swap is pending
        if (event.status === 'SWAP_PENDING' && status !== 'SWAP_PENDING') {
            return res.status(400).json({ error: 'Cannot update event with pending swap' });
        }

        // Update fields
        if (title) event.title = title;
        if (startTime) event.startTime = startTime;
        if (endTime) event.endTime = endTime;
        if (status) event.status = status;

        await event.save();
        res.json(event);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Server error updating event' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, userId: req.userId });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Don't allow deleting if swap is pending
        if (event.status === 'SWAP_PENDING') {
            return res.status(400).json({ error: 'Cannot delete event with pending swap' });
        }

        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Server error deleting event' });
    }
});

module.exports = router;