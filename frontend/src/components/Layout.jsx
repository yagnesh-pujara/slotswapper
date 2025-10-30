import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useEffect } from "react";
const Layout = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  useEffect(() => {
    // The path is available as `location.pathname`
    console.log("Current path:", location.pathname);
  }, [location]);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                {/* <span className="text-white font-bold text-xl">SS</span> */}
                <img
                  src="/slotswapper.png"
                  alt="SlotSwapper Logo"
                  className="w-8 h-8"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">
                SlotSwapper
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/marketplace" className={navLinkClass}>
                Marketplace
              </NavLink>
              <NavLink to="/requests" className={navLinkClass}>
                Requests
              </NavLink>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {connected ? "Connected" : "Offline"}
                </span>
              </div>

              {/* User Name */}
              <span className="text-gray-700 font-medium">{user?.name}</span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
