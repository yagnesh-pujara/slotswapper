import React, { useState, useEffect } from "react";
import { eventsAPI } from "../utils/api";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getStatusText,
} from "../utils/helpers";
import toast from "react-hot-toast";
import CreateEventModal from "../components/CreateEventModal";
import { useSocket } from "../contexts/SocketContext";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Listen for socket events to refresh data
  useEffect(() => {
    if (socket) {
      socket.on("swap-accepted", fetchEvents);
      socket.on("swap-rejected", fetchEvents);

      return () => {
        socket.off("swap-accepted", fetchEvents);
        socket.off("swap-rejected", fetchEvents);
      };
    }
  }, [socket]);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      toast.error("Failed to fetch events");
      console.error("Fetch events error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await eventsAPI.update(eventId, { status: newStatus });
      toast.success(`Event status updated to ${getStatusText(newStatus)}`);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update event");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-600 mt-1">
            Manage your time slots and availability
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create Event</span>
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first event to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="card animate-slide-up hover:scale-105"
            >
              {/* Event Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {event.title}
                </h3>
                <span className={`badge ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
              </div>

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">{formatDate(event.startTime)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {event.status === "BUSY" && (
                  <button
                    onClick={() => handleStatusChange(event._id, "SWAPPABLE")}
                    className="flex-1 btn-success text-sm"
                  >
                    Make Swappable
                  </button>
                )}
                {event.status === "SWAPPABLE" && (
                  <button
                    onClick={() => handleStatusChange(event._id, "BUSY")}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Mark as Busy
                  </button>
                )}
                {event.status === "SWAP_PENDING" && (
                  <button
                    disabled
                    className="flex-1 btn-secondary text-sm opacity-50 cursor-not-allowed"
                  >
                    Swap Pending
                  </button>
                )}
                <button
                  onClick={() => handleDelete(event._id)}
                  disabled={event.status === "SWAP_PENDING"}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
