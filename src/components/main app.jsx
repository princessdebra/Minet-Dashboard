import React, { useState, useEffect, useMemo } from "react";
import DashboardLanding from "../pages/DashboardLanding";
import WonAccountsPage from "../pages/WonAccountsPage";
import LostAccountsPage from "../pages/LostAccountsPage";
import MarketSharePage from "../pages/MarketSharePage";
import RevenueWalkPage from "../pages/RevenueWalkPage";
import LoginScreen from "../pages/LoginScreen";
import SignupScreen from "../pages/SignupScreen";
import ForgotPasswordScreen from "../pages/ForgotPasswordScreen";
import AdminUsersPage from "../pages/AdminUsersPage";
import { API_URL } from "../constants";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser);
    return parsedUser && typeof parsedUser === "object" ? parsedUser : null;
  } catch (error) {
    console.error("Error reading stored user data:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// Main App Component
const App = () => {
  const initialUser = useMemo(() => getStoredUser(), []);

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [currentScreen, setCurrentScreen] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => initialUser !== null
  );
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    setCurrentPage("dashboard");
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentScreen("login");
    setCurrentPage("dashboard");
    setDashboardData(null);
    localStorage.removeItem("user");
  };

  const handleNavigate = (page) => {
    // Check if user has permission to access the page
    if (!currentUser) return;

    const userRole = currentUser.role || "normal";
    const restrictedPages = ["revenue-walk"];

    // Normal users can only access won-accounts, lost-accounts, and market-share
    if (userRole === "normal" && restrictedPages.includes(page)) {
      alert("You do not have permission to access this page.");
      return;
    }

    setCurrentPage(page);
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
  };

  // Fetch dashboard data from the backend API
  useEffect(() => {
    if (isAuthenticated) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          const response = await fetch(API_URL + "/api/dashboard-data");
          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
          }

          const data = await response.json();

          if (data && Object.keys(data).length > 0) {
            setDashboardData(data);
          } else {
            setError("Backend returned empty or invalid data.");
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [isAuthenticated]); // Fetch data when authentication changes

  if (!isAuthenticated) {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToSignup={() => setCurrentScreen("signup")}
            onNavigateToForgotPassword={() =>
              setCurrentScreen("forgot-password")
            }
          />
        );
      case "signup":
        return (
          <SignupScreen
            onSignup={handleLogin}
            onNavigateToLogin={() => setCurrentScreen("login")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordScreen
            onResetPassword={() => setCurrentScreen("login")}
            onNavigateToLogin={() => setCurrentScreen("login")}
          />
        );
      default:
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToSignup={() => setCurrentScreen("signup")}
            onNavigateToForgotPassword={() =>
              setCurrentScreen("forgot-password")
            }
          />
        );
    }
  }

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">
          Loading dashboard data...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
          Error: {error}
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">
          No dashboard data available. Please check the backend or console for
          errors.
        </div>
      );
    }

    switch (currentPage) {
      case "won-accounts":
        return (
          <WonAccountsPage
            onBack={() => setCurrentPage("dashboard")}
            dashboardData={dashboardData}
            userRole={currentUser?.role}
          />
        );
      case "lost-accounts":
        return (
          <LostAccountsPage
            onBack={() => setCurrentPage("dashboard")}
            dashboardData={dashboardData}
            userRole={currentUser?.role}
          />
        );
      case "market-share":
        return (
          <MarketSharePage
            onBack={() => setCurrentPage("dashboard")}
            dashboardData={dashboardData}
            userRole={currentUser?.role}
          />
        );
      case "revenue-walk":
        return (
          <RevenueWalkPage
            onBack={() => setCurrentPage("dashboard")}
            dashboardData={dashboardData}
            userRole={currentUser?.role}
          />
        );
      case "admin-users":
        return currentUser?.role === "admin" ? (
          <AdminUsersPage onBack={() => setCurrentPage("dashboard")} />
        ) : (
          <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
            Access Denied: Admin privileges required
          </div>
        );
      default:
        return (
          <DashboardLanding
            onNavigate={handleNavigate}
            dashboardData={dashboardData}
            onLogout={handleLogout}
            isLoading={loading}
            error={error}
            currentUser={currentUser}
          />
        );
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default App;
