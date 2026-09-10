import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HeroCarousel.css';

// 輪播卡片資料
const slides = [
  {
    tag: '防詐與資安',
    title: '守護數位生活，從識詐開始',
    subtitle: '掌握最新防詐資訊，安心使用每項線上服務。',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85',
  },
  {
    tag: '便民服務',
    title: '案件服務，一次掌握',
    subtitle: '查詢案件進度、線上申報，服務隨時都在。',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  },
  {
    tag: '數位共融',
    title: '讓每個人都能自在連結',
    subtitle: '打造沒有距離的數位公共服務體驗。',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
  },
];

function HeroCarousel() {
  return (
    <section className="hero" aria-label="精選服務">

      {/* Swiper 輪播主內容與左右控制按鈕 */}
      <div className="carousel-frame">
        <button className="carousel-arrow prev" aria-label="上一張">
          ‹
        </button>

        <Swiper
          modules={[Navigation, Pagination]}
          className="carousel-track"
          centeredSlides
          slidesPerView={1.66}
          spaceBetween={20}
          navigation={{
            nextEl: '.next',
            prevEl: '.prev',
          }}
          pagination={{
            clickable: true,
            el: '.carousel-dots',
          }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 0 },
            768: { slidesPerView: 1.42, spaceBetween: 20 },
            901: { slidesPerView: 1.66, spaceBetween: 20 },
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide
              className="slide"
              key={slide.title}
              style={{ '--slide-image': `url(${slide.image})` }}
            >
              <div className="slide-shade" />
              <div className="slide-content">
                <p>{slide.tag}</p>
                <h2>{slide.title}</h2>
                <span>{slide.subtitle}</span>
                <a href="#service">
                  探索服務 <b>→</b>
                </a>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="carousel-arrow next" aria-label="下一張">
          ›
        </button>
      </div>

      {/* Swiper 自動產生的圓點指示器 */}
      <div className="carousel-dots" aria-label="輪播頁數" />
    </section>
  );
}

export default HeroCarousel;
