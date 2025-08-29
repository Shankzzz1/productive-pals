import DigitalTimer from "../pages/DigitalTimer";
import FocusStatsChart from "../pages/FocusStatsChart";
import TaskList from "../pages/Tasklist";

export default function collect() {
  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
          
          {/* Left Sidebar - Compact */}
          <div className="lg:col-span-4 space-y-3 flex flex-col">
            {/* Timer - Reduced padding */}
            <div className="bg-white rounded-lg shadow-sm border p-3 flex-shrink-0">
              <DigitalTimer />
            </div>

            {/* Task List - Flexible height */}
            <div className="bg-white rounded-lg shadow-sm border p-3 flex-1 min-h-0 overflow-hidden">
              <TaskList />
            </div>

            {/* Placeholder - Minimal height */}
            <div className="bg-white rounded-lg shadow-sm border p-3 h-24 flex-shrink-0">
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Future Component
              </div>
            </div>
          </div>

          {/* Main Content / Charts - Full height */}
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