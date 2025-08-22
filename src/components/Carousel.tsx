'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  src: string;
  alt?: string;
};

type Props = {
  /** Görseller listesi; boşsa placeholder slaytlar gösterilir */
  slides?: Slide[];
  /** Slide yüksekliği için Tailwind sınıfı */
  heightClass?: string;
  /** Aynı anda kaç slayt görünsün */
  perView?: number;

  /** Autoplay açık mı? (varsayılan: true) */
  autoPlay?: boolean;
  /** Slaytlar arasında bekleme aralığı (ms) – autoplay açıkken kullanılır (varsayılan: 3500) */
  slideInterval?: number;
  /** Geçiş animasyon süresi (ms) – “kayma hızı” (varsayılan: 1200 = daha yavaş ve akıcı) */
  slideSpeed?: number;
  /** Hover sırasında autoplay dursun mu? (varsayılan: true) */
  pauseOnHover?: boolean;
};

export default function Carousel({
  slides,
  heightClass = 'h-64 sm:h-72 md:h-80',
  perView = 1,
  autoPlay = true,
  slideInterval = 3500,
  slideSpeed = 3000,
  pauseOnHover = true,
}: Props) {
  const hasImages = Array.isArray(slides) && slides.length > 0;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Autoplay plugin (isteğe bağlı)
  const autoplayPlugin =
    !autoPlay
      ? undefined
      : (slider: any) => {
          let timeout: ReturnType<typeof setTimeout> | null = null;
          let mouseOver = false;

          const clearNextTimeout = () => {
            if (timeout) clearTimeout(timeout);
            timeout = null;
          };
          const queueNext = () => {
            clearNextTimeout();
            if (mouseOver) return;
            timeout = setTimeout(() => slider.next(), slideInterval);
          };

          slider.on('created', () => {
            setLoaded(true);
            if (pauseOnHover) {
              slider.container.addEventListener('mouseover', () => {
                mouseOver = true;
                clearNextTimeout();
              });
              slider.container.addEventListener('mouseout', () => {
                mouseOver = false;
                queueNext();
              });
            }
            queueNext();
          });

          // Kullanıcı etkileşimlerinde beklemeyi sıfırla/yeniden kur
          slider.on('dragStarted', clearNextTimeout);
          slider.on('animationEnded', queueNext);
          slider.on('updated', queueNext);
        };

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      defaultAnimation: {
        duration: slideSpeed,             // ms
        // easing: (t) => t,              // istersen easing de özelleştir
      },
      slides: { perView, spacing: 0 },
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    },
    autoplayPlugin ? [autoplayPlugin] : []
  );

  const placeholder = useMemo(
    () =>
      [1, 2, 3].map((i) => ({
        key: `ph-${i}`,
        content: (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-slate-600 to-slate-800">
            Slide {i}
          </div>
        ),
      })),
    []
  );

  return (
    <div className="relative">
      {/* Slider */}
      <div ref={sliderRef} className="keen-slider w-full overflow-hidden rounded-xl shadow mb-8">
        {hasImages
          ? slides!.map((s, i) => (
              <div key={s.src + i} className={`keen-slider__slide relative ${heightClass}`}>
                <Image
                  src={s.src}
                  alt={s.alt ?? `Slide ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i === 0}
                />
              </div>
            ))
          : placeholder.map((p) => (
              <div key={p.key} className={`keen-slider__slide ${heightClass}`}>
                {p.content}
              </div>
            ))}
      </div>

      {/* Oklar */}
      {/* {loaded && slider.current && (
        <>
          <button
            onClick={() => slider.current?.prev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => slider.current?.next()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )} */}

      {/* Noktalar — solda, hafif boşlukla */}
      {loaded && slider.current && (
        <div className="absolute bottom-3 left-4 flex gap-2">
          {Array.from({ length: slider.current.track.details.slides.length }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => slider.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full transition ${
                currentSlide === idx ? 'bg-white' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
