"use client";

import { useEffect, useState } from "react";

export type HeroSlide = { src: string; caption: string };

/**
 * Photos sliding behind the booking box. Decoration only, so it is hidden from
 * screen readers, and it stops changing when the device asks for less motion.
 */
export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div aria-hidden="true" className="hero-show pointer-events-none absolute inset-0 overflow-hidden">
      {slides.map((slide, i) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={slide.src + i}
          src={slide.src}
          alt=""
          className={`hero-show-img ${i === index ? "is-on" : ""}`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="hero-show-veil" />
    </div>
  );
}
