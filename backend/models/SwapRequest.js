const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    requestedSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

// Index for faster queries
swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ requestedUserId: 1, status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);