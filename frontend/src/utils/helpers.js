export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'BUSY':
            return 'badge-busy';
        case 'SWAPPABLE':
            return 'badge-swappable';
        case 'SWAP_PENDING':
            return 'badge-pending';
        default:
            return 'badge-busy';
    }
};

export const getStatusText = (status) => {
    switch (status) {
        case 'BUSY':
            return 'Busy';
        case 'SWAPPABLE':
            return 'Swappable';
        case 'SWAP_PENDING':
            return 'Swap Pending';
        default:
            return status;
    }
};

export const isPastDate = (dateString) => {
    return new Date(dateString) < new Date();
};

export const formatDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = (end - start) / (1000 * 60 * 60);
    return `${durationInHours} ${durationInHours === 1 ? 'hour' : 'hours'}`;
};

export const sortEventsByDate = (events, order = 'asc') => {
    return [...events].sort((a, b) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
};