import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import Home from "./pages/Home";
import TaskList from "./pages/Tasklist";
import Timer from "./pages/Timer";
import FocusStatsChart from "./pages/FocusStatsChart";
import DigitalTimer from "./pages/DigitalTimer";
import CollectiveCarousel from "./pages/CollectiveCarousel";
import useTimer from "./Hook/useTimer"; // ⬅️ custom hook
import type { JSX } from "react";
import CreateRoom from "./pages/CreateRoom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const timer = useTimer();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route
          path="/digital"
          element={
            <DigitalTimer
              time={timer.time}
              isRunning={timer.isRunning}
              onStart={timer.onStart}
              onPause={timer.onPause}
              onReset={timer.onReset}
              onAdjustTime={timer.onAdjustTime}
            />
          }
        />
        <Route
          path="/collect"
          element={
            <CollectiveCarousel
              time={timer.time}
              isRunning={timer.isRunning}
              mode={timer.mode}
              onStart={timer.onStart}
              onPause={timer.onPause}
              onReset={timer.onReset}
              onAdjustTime={timer.onAdjustTime}
              onModeChange={timer.onModeChange}
            />
          }
        />
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
          path="/timer"
          element={
            <ProtectedRoute>
              <Timer
                time={timer.time}
                isRunning={timer.isRunning}
                mode={timer.mode}
                onStart={timer.onStart}
                onPause={timer.onPause}
                onReset={timer.onReset}
                onModeChange={timer.onModeChange}
              />
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
