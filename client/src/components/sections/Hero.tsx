"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Hero() {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/hero-images")
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
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden bg-sand sm:h-[70vh] lg:h-[80vh]">
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
          />
        ))}
      </div>
    </section>
  );
}
