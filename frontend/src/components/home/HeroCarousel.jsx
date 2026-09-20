import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import page1 from '../../image/page1.gif';
import page2 from '../../image/page2.gif';
import page3 from '../../image/page3.gif';
import './HeroCarousel.css';

const slides = [page1, page2, page3];

function HeroCarousel() {
    return (
        <section className="hero" aria-label="首頁輪播圖片">
            <div className="carousel-frame">
                <button className="carousel-arrow prev" type="button" aria-label="上一張">&#8249;</button>

                <Swiper
                    modules={[Navigation, Pagination]}
                    className="carousel-track"
                    centeredSlides
                    slidesPerView={1.66}
                    spaceBetween={20}
                    navigation={{ nextEl: '.next', prevEl: '.prev' }}
                    pagination={{ clickable: true, el: '.carousel-dots' }}
                    breakpoints={{
                        0: { slidesPerView: 1, spaceBetween: 0 },
                        768: { slidesPerView: 1.42, spaceBetween: 20 },
                        901: { slidesPerView: 1.66, spaceBetween: 20 },
                    }}
                >
                    {slides.map((image, index) => (
                        <SwiperSlide className="slide" key={index}>
                            <img className="slide-image" src={image} alt={`首頁輪播圖 ${index + 1}`} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button className="carousel-arrow next" type="button" aria-label="下一張">&#8250;</button>
            </div>

            <div className="carousel-dots" aria-label="輪播頁碼" />
        </section>
    );
}

export default HeroCarousel;
