import { useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface CarouselProps {
  slides: Slide[];
  autoPlayInterval?: number;
}

export function Carousel({ slides, autoPlayInterval = 5000 }: CarouselProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .swiper-button-next, .swiper-button-prev {
        color: ${isDark ? '#FFFFFF' : '#333333'};
        background: ${isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .swiper-button-next:after, .swiper-button-prev:after {
        font-size: 18px;
        font-weight: bold;
      }
      
      .swiper-pagination-bullet {
        background: ${isDark ? '#2A2A2A' : '#E5E5E5'};
        opacity: 1;
      }
      
      .swiper-pagination-bullet-active {
        background: #F0B90B;
      }
      
      .slide-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 24px;
        background: ${isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isDark]);

  return (
    <div className="w-full h-full">
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        pagination={{ 
          clickable: true,
          el: '.swiper-pagination',
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        autoplay={{
          delay: autoPlayInterval,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide 
            key={slide.id}
            className="w-[65%] h-[80%] self-center rounded-xl overflow-hidden"
          >
            <div 
              className="w-full h-full rounded-xl"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={`slide-content`}>
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  {slide.title}
                </h2>
                <p className={`${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                  {slide.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Navigation et pagination explicites */}
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
        <div className="swiper-pagination"></div>
      </Swiper>
    </div>
  );
} 