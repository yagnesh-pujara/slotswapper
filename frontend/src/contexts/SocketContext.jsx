import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setConnected(true);
      // Join user's personal room
      newSocket.emit("join", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    // Listen for swap-related events
    newSocket.on("swap-request", (data) => {
      console.log("Received swap request:", data);
      toast.success("New swap request received!", {
        duration: 5000,
        icon: "🔔",
      });
    });

    newSocket.on("swap-accepted", (data) => {
      console.log("Swap accepted:", data);
      toast.success("Your swap request was accepted!", {
        duration: 5000,
        icon: "✅",
      });
    });

    newSocket.on("swap-rejected", (data) => {
      console.log("Swap rejected:", data);
      toast("Your swap request was rejected", {
        duration: 4000,
        icon: "❌",
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
