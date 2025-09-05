import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import Home from "./pages/Home";
import TaskList from "./pages/Tasklist";
import Timer from "./pages/Timer";
import FocusStatsChart from "./pages/FocusStatsChart";
import DigitalTimer from "./pages/DigitalTimer";
import CollectiveCarousel from "./pages/CollectiveCarousel";
import useTimer from "./Hook/useTimer"; // ⬅️ custom hook
import useRoomTimer from "./Hook/useRoomTimer"; // ⬅️ room-aware hook
import type { JSX } from "react";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Component to handle room-aware timer logic
function TimerProvider({ children }: { children: (timer: any) => JSX.Element }) {
  const location = useLocation();
  const state = location.state as { roomId?: string; username?: string } | null;
  
  // Get room info from navigation state or localStorage
  const roomId = state?.roomId || localStorage.getItem('roomId') || undefined;
  const username = state?.username || localStorage.getItem('username') || undefined;
  
  // Use room timer if roomId is present, otherwise use regular timer
  const timer = useRoomTimer({ roomId, username });
  
  return children(timer);
}

function App() {
  const timer = useTimer();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
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
            <TimerProvider>
              {(timer) => (
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
              )}
            </TimerProvider>
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
