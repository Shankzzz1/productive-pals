// Collective.tsx
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
  // mode,
  onStart,
  onPause,
  onReset,
  onAdjustTime,
  // onModeChange
  participants = [],
  participantUsernames = [],
  currentUsername
}: CollectProps) {
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
              <TaskList />
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

          {/* Main Content / Charts */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
              <FocusStatsChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}