"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/main/FP-home-banner-1.jpg",
  "/main/G-008.jpg",
  "/main/slide-03.jpg",
];

const INTERVAL_MS = 4000;

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "621px" }}
    >
      {SLIDES.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: idx === active ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            priority={idx === 0}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
