"use client";

import { useState, useEffect, useCallback } from "react";
import type { WebsiteSlide } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderProps {
  slides: WebsiteSlide[];
  company: { name: string; slogan: string | null; websiteHeroTitle: string | null; websiteHeroSubtitle: string | null };
  accentColor?: string;
  overlay?: string;
  height?: string;
}

export function HeroSlider({ slides, company, accentColor = "#2563eb", overlay = "bg-black/40", height = "min-h-[70vh]" }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const heroTitle = company.websiteHeroTitle || company.slogan || "Rent Your Perfect Car";
  const heroSubtitle = company.websiteHeroSubtitle || "Browse our selection of quality vehicles. Affordable rates, reliable cars.";

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const next = useCallback(() => {
    if (slides.length <= 1) return;
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    if (slides.length <= 1) return;
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const currentSlide = slides[current];

  // If no slides, show simple hero
  if (slides.length === 0) {
    return (
      <section className={`relative flex ${height} items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800`}>
        <div className="relative z-10 px-6 text-center text-white">
          <h1 className="text-4xl font-bold md:text-6xl">{heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">{heroSubtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative ${height} overflow-hidden`}>
      {/* Background image */}
      {currentSlide?.imageUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
        />
      )}
      <div className={`absolute inset-0 ${overlay}`} />

      {/* Content */}
      <div className={`relative z-10 flex ${height} items-center justify-center px-6`}>
        <div className={`text-center text-white transition-all duration-500 ${isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"}`}>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {currentSlide?.title || heroTitle}
          </h1>
          {(currentSlide?.subtitle || heroSubtitle) && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
              {currentSlide?.subtitle || heroSubtitle}
            </p>
          )}
          {currentSlide?.buttonText && (
            <a
              href={currentSlide.buttonLink || "#cars"}
              className="mt-8 inline-block rounded-full px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              {currentSlide.buttonText}
            </a>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
