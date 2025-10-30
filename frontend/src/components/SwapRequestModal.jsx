import React, { useState } from "react";
import { swapsAPI } from "../utils/api";
import { formatDate, formatTime } from "../utils/helpers";
import toast from "react-hot-toast";

const SwapRequestModal = ({ slot, mySlots, onClose, onSuccess }) => {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select one of your slots to offer");
      return;
    }

    setLoading(true);

    try {
      await swapsAPI.createRequest({
        mySlotId: selectedSlot,
        theirSlotId: slot._id,
      });

      toast.success("Swap request sent successfully!");
      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to create swap request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-slide-up">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Request Slot Swap
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Slot They're Offering */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Slot You Want
            </h3>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <p className="font-bold text-gray-900 mb-2">{slot.title}</p>
              <div className="flex items-center text-gray-600 text-sm mb-1">
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
                <span>Owner: {slot.userId?.name}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-1">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(slot.startTime)}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>

          {/* Select Your Slot */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Select Your Slot to Offer
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mySlots.map((mySlot) => (
                <label
                  key={mySlot._id}
                  className={`block cursor-pointer transition-all duration-200 ${
                    selectedSlot === mySlot._id
                      ? "ring-2 ring-blue-500"
                      : "hover:ring-2 hover:ring-gray-300"
                  }`}
                >
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="selectedSlot"
                        value={mySlot._id}
                        checked={selectedSlot === mySlot._id}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-2">
                          {mySlot.title}
                        </p>
                        <div className="flex items-center text-gray-600 text-sm mb-1">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{formatDate(mySlot.startTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {formatTime(mySlot.startTime)} -{" "}
                            {formatTime(mySlot.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Request..." : "Send Swap Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal;
