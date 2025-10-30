import React, { useState, useEffect } from "react";
import { swapsAPI, eventsAPI } from "../utils/api";
import { formatDate, formatTime } from "../utils/helpers";
import toast from "react-hot-toast";
import SwapRequestModal from "../components/SwapRequestModal";

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsResponse, myEventsResponse] = await Promise.all([
        swapsAPI.getSwappableSlots(),
        eventsAPI.getAll(),
      ]);

      setSwappableSlots(slotsResponse.data);
      setMySwappableSlots(
        myEventsResponse.data.filter((event) => event.status === "SWAPPABLE")
      );
    } catch (error) {
      toast.error("Failed to fetch marketplace data");
      console.error("Fetch marketplace error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot) => {
    if (mySwappableSlots.length === 0) {
      toast.error(
        "You need to have at least one swappable slot to request a swap"
      );
      return;
    }
    setSelectedSlot(slot);
    setShowSwapModal(true);
  };

  const handleSwapSuccess = () => {
    setShowSwapModal(false);
    setSelectedSlot(null);
    fetchData();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">
          Browse available time slots from other users
        </p>
      </div>

      {/* Info Banner */}
      {mySwappableSlots.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">
                No Swappable Slots
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to mark at least one of your events as "Swappable"
                before you can request swaps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      {swappableSlots.length === 0 ? (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Slots Available
          </h3>
          <p className="text-gray-600">
            There are currently no swappable slots from other users
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {swappableSlots.map((slot) => (
            <div
              key={slot._id}
              className="card animate-slide-up hover:scale-105"
            >
              {/* Slot Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {slot.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{slot.userId?.name || "Unknown User"}</span>
                </div>
              </div>

              {/* Slot Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
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
                  <span className="text-sm">{formatDate(slot.startTime)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
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
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRequestSwap(slot)}
                disabled={mySwappableSlots.length === 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedSlot && (
        <SwapRequestModal
          slot={selectedSlot}
          mySlots={mySwappableSlots}
          onClose={() => {
            setShowSwapModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={handleSwapSuccess}
        />
      )}
    </div>
  );
};

export default Marketplace;
