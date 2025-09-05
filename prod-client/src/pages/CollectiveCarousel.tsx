// CollectiveCarousel.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";

import Timer from "./Timer";
import Collect from "./Collective";

interface CarouselProps {
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

export default function CollectiveCarousel({
  time,
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
  onAdjustTime,
  onModeChange,
  participants = [],
  participantUsernames = [],
  currentUsername
}: CarouselProps) {
  return (
    <div className="fixed inset-0 bg-gray-50">
      <Swiper modules={[Navigation, Pagination]} navigation={false} pagination={false} spaceBetween={0} slidesPerView={1} className="w-full h-full">
        {/* Slide 1: Circular Timer */}
        <SwiperSlide>
          <div className="w-full h-full bg-gray-900">
            <Timer
              time={time}
              isRunning={isRunning}
              mode={mode}
              onStart={onStart}
              onPause={onPause}
              onReset={onReset}
              onModeChange={onModeChange}
            />
          </div>
        </SwiperSlide>

        {/* Slide 2: Full Dashboard */}
        <SwiperSlide>
          <div className="w-full h-full p-4 overflow-auto bg-gray-50">
            <Collect
              time={time}
              isRunning={isRunning}
              mode={mode}
              onStart={onStart}
              onPause={onPause}
              onReset={onReset}
              onAdjustTime={onAdjustTime}
              onModeChange={onModeChange}
              participants={participants}
              participantUsernames={participantUsernames}
              currentUsername={currentUsername}
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}