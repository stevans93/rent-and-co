import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/pagination';

export default function Slider<T>(
    {
        slidesPerView,
        navButtonClass,
        data,
        Card,
        showPagination
    }
        :
        {
            slidesPerView?: number;
            navButtonClass: string;
            paginationClass?: string;
            data: T[];
            Card: React.FC<{ data: T }>;
            showPagination: boolean;
        }
) {
    return (
        <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={slidesPerView}
            spaceBetween={20}
            direction="horizontal"
            grabCursor={true}
            pagination={showPagination ? {
                clickable: true,
                dynamicBullets: true,
                el: '.swiper-paginationn',
            } : false}
            navigation={{
                nextEl: `.swiper-button-next-${navButtonClass}`,
                prevEl: `.swiper-button-prev-${navButtonClass}`,
            }}
            breakpoints={{
                0: { slidesPerView: Math.max(1, Math.floor(Number(slidesPerView) * 0.25)) },
                520: { slidesPerView: Math.max(1, Math.floor(Number(slidesPerView) * 0.5)) },
                950: { slidesPerView: Math.max(1, Math.floor(Number(slidesPerView) * 0.75)) },
                1200: { slidesPerView: slidesPerView }
            }}
        >
            {data.map((item, index) => (
                <SwiperSlide key={index}>
                    <Card data={item} />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}