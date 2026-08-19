"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Hero() {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/hero-images", { cache: "no-store" })
      .then((res) => res.json())
      .then((images: string[]) => {
        if (images.length) setHeroImages(images);
      });
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (!heroImages.length) return null;

  return (
    <section className="relative -mt-16 h-[70svh] min-h-[420px] w-full overflow-hidden bg-sand sm:-mt-[72px] sm:h-[75svh] md:h-[85svh] lg:h-[100svh]">
      <div className="absolute inset-0 z-0">
        {heroImages.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            className={`object-cover transition-opacity duration-700 ${i === currentIndex ? "opacity-100" : "opacity-0"}`}
            sizes="100vw"
            priority={i === 0}
            unoptimized
          />
        ))}
      </div>
    </section>
  );
}
