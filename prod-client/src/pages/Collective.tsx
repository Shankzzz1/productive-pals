// Collective.tsx
import { useNavigate } from "react-router-dom";

import DigitalTimer from "../pages/DigitalTimer";
import FocusStatsChart from "../pages/FocusStatsChart";
import TaskList from "../pages/Tasklist";
import RoomMembers from "./RoomMembers";

interface CollectProps {
  time: number;
  isRunning: boolean;
  mode: "pomodoro" | "shortBreak" | "longBreak";
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAdjustTime: (delta: number) => void;
  onModeChange: (mode: "pomodoro" | "shortBreak" | "longBreak") => void;
  participants?: string[];
  participantUsernames?: string[];
  currentUsername?: string;
}

export default function Collect({
  time,
  isRunning,
  onStart,
  onPause,
  onReset,
  onAdjustTime,
  participants = [],
  participantUsernames = [],
  currentUsername,
}: CollectProps) {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">

          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-3 flex flex-col">

            {/* Digital Timer */}
            <div className="bg-white rounded-lg shadow-sm border p-3 flex-shrink-0">
              <DigitalTimer
                time={time}
                isRunning={isRunning}
                onStart={onStart}
                onPause={onPause}
                onReset={onReset}
                onAdjustTime={onAdjustTime}
              />
            </div>

            {/* Task List */}
            <div className="bg-white rounded-lg shadow-sm border p-3 flex-1 min-h-0 overflow-hidden">
              {isLoggedIn ? (
                <TaskList />
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Login Required
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                      Login to manage tasks and track progress.
                    </p>

                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Login
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Room Members */}
            <div className="bg-white rounded-lg shadow-sm border p-3 flex-shrink-0">
              <RoomMembers
                participants={participants}
                participantUsernames={participantUsernames}
                currentUsername={currentUsername}
              />
            </div>
          </div>

          {/* Analytics Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
              {isLoggedIn ? (
                <FocusStatsChart />
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Productivity Analytics
                    </h2>

                    <p className="text-gray-500 mb-4">
                      Login to save focus sessions and view productivity graphs.
                    </p>

                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}