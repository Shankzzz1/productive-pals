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

export default function CollectiveCarousel() {
  return (
    <div className="fixed inset-0 bg-gray-50">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={false}
        pagination={false}
        spaceBetween={0}
        slidesPerView={1}
        className="w-full h-full"
      >


        <SwiperSlide>
          <div className="w-full h-full bg-gray-900">
            <Timer />
          </div>
        </SwiperSlide>

        {/* Slide 2: Complete Dashboard */}
        <SwiperSlide>
          <div className="w-full h-full p-4 overflow-auto">
            <div className="w-full h-full">
              <Collect />
            </div>
          </div>
        </SwiperSlide>
        
      </Swiper>
    </div>
  );
}