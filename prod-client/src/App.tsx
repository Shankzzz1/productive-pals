import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import Home from "./pages/Home";
import TaskList from "./pages/Tasklist";
import Timer from "./pages/Timer";
import FocusStatsChart from "./pages/FocusStatsChart";
import type { JSX } from "react";
import DigitalTimer from "./pages/DigitalTimer";

import CollectiveCarousel from "./pages/CollectiveCarousel";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/digital" element={<DigitalTimer />} />
        <Route path="/collect" element={<CollectiveCarousel/>} />
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route
          path="/task"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Timer"
          element={
            <ProtectedRoute>
              <Timer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <FocusStatsChart />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
