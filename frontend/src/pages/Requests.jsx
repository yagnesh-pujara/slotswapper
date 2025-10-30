import React, { useState, useEffect } from "react";
import { swapsAPI } from "../utils/api";
import { formatDate, formatTime } from "../utils/helpers";
import toast from "react-hot-toast";
import { useSocket } from "../contexts/SocketContext";

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const { socket } = useSocket();

  useEffect(() => {
    fetchRequests();
  }, []);

  // Listen for socket events to refresh data
  useEffect(() => {
    if (socket) {
      socket.on("swap-request", fetchRequests);
      socket.on("swap-accepted", fetchRequests);
      socket.on("swap-rejected", fetchRequests);

      return () => {
        socket.off("swap-request", fetchRequests);
        socket.off("swap-accepted", fetchRequests);
        socket.off("swap-rejected", fetchRequests);
      };
    }
  }, [socket]);

  const fetchRequests = async () => {
    try {
      const response = await swapsAPI.getRequests();
      setIncomingRequests(response.data.incoming);
      setOutgoingRequests(response.data.outgoing);
    } catch (error) {
      toast.error("Failed to fetch swap requests");
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accept) => {
    setProcessing({ ...processing, [requestId]: true });

    try {
      await swapsAPI.respondToRequest(requestId, accept);
      toast.success(accept ? "Swap accepted!" : "Swap rejected");
      fetchRequests();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to respond to swap request"
      );
    } finally {
      setProcessing({ ...processing, [requestId]: false });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
        <p className="text-gray-600 mt-1">
          Manage your incoming and outgoing swap requests
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Incoming Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Incoming Requests
            </h2>
            <span className="badge badge-pending">
              {incomingRequests.length}
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="card text-center py-12">
              <div className="inline-block w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-600">No incoming requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((request) => (
                <div key={request._id} className="card animate-slide-up">
                  {/* Requester Info */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {request.requesterId?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.requesterId?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-600">wants to swap</p>
                    </div>
                  </div>

                  {/* Swap Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* They Offer */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-2">
                        They Offer
                      </p>
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {request.requesterSlotId?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(request.requesterSlotId?.startTime)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(request.requesterSlotId?.startTime)} -{" "}
                        {formatTime(request.requesterSlotId?.endTime)}
                      </p>
                    </div>

                    {/* Your Slot */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-900 mb-2">
                        Your Slot
                      </p>
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {request.requestedSlotId?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(request.requestedSlotId?.startTime)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(request.requestedSlotId?.startTime)} -{" "}
                        {formatTime(request.requestedSlotId?.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleResponse(request._id, true)}
                      disabled={processing[request._id]}
                      className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing[request._id] ? "Processing..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleResponse(request._id, false)}
                      disabled={processing[request._id]}
                      className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Outgoing Requests
            </h2>
            <span className="badge badge-pending">
              {outgoingRequests.length}
            </span>
          </div>

          {outgoingRequests.length === 0 ? (
            <div className="card text-center py-12">
              <div className="inline-block w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <p className="text-gray-600">No outgoing requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingRequests.map((request) => (
                <div key={request._id} className="card animate-slide-up">
                  {/* Requested User Info */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {request.requestedUserId?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Requested from{" "}
                        {request.requestedUserId?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Waiting for response
                      </p>
                    </div>
                  </div>

                  {/* Swap Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* You Offer */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-2">
                        You Offer
                      </p>
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {request.requesterSlotId?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(request.requesterSlotId?.startTime)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(request.requesterSlotId?.startTime)} -{" "}
                        {formatTime(request.requesterSlotId?.endTime)}
                      </p>
                    </div>

                    {/* They Have */}
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-purple-900 mb-2">
                        They Have
                      </p>
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {request.requestedSlotId?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(request.requestedSlotId?.startTime)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(request.requestedSlotId?.startTime)} -{" "}
                        {formatTime(request.requestedSlotId?.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <span className="badge badge-pending flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Pending Response
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
