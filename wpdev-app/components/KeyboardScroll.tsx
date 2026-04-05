"use client";
import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export default function KeyboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load images
  useEffect(() => {
    let isMounted = true;
    const frameCount = 120;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `/frames/frame_${i}.webp`;
      img.onload = () => {
        if (!isMounted) return;
        loadedCount++;
        loadedImages[i] = img; // maintain order
        if (loadedCount === frameCount) {
          setImages([...loadedImages]);
          setLoaded(true);
        }
      };
      // For immediate fallback if cached
      if (img.complete && img.naturalHeight !== 0) {
        // Just empty handling, onload covers it mostly, 
        // but robust loading can be added if needed
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Framer motion scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Text transforms removed as requested

  // Canvas drawing
  const renderCanvas = (progress: number) => {
    if (!canvasRef.current || images.length === 0) return;
    
    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    // Clamp between 0 and 119
    const frameIndex = Math.max(0, Math.min(
      images.length - 1,
      Math.floor(progress * images.length)
    ));

    const img = images[frameIndex];
    if (!img) return;

    const canvas = canvasRef.current;
    
    // Setup devicePixelRatio for sharpness
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Only resize canvas if needed
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.scale(dpr, dpr);
    } else {
      // If we don't resize, we have to clear it before drawing
      context.clearRect(0, 0, rect.width, rect.height);
    }

    // Object fit "contain" logic
    const hRatio = rect.width / img.width;
    const vRatio = rect.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    
    const centerShift_x = (rect.width - img.width * ratio) / 2;
    const centerShift_y = (rect.height - img.height * ratio) / 2;

    context.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (loaded) {
      requestAnimationFrame(() => renderCanvas(latest));
    }
  });

  // Render initial frame on load or resize
  useEffect(() => {
    const handleResize = () => renderCanvas(scrollYProgress.get());
    if (loaded) {
      renderCanvas(scrollYProgress.get());
      window.addEventListener("resize", handleResize);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [loaded]);

  return (
    <div className="relative bg-[#ECECEC]">
      {/* Loading State */}
      {!loaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ECECEC] transition-opacity duration-500">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-black/80 animate-spin mb-4" />
          <p className="text-black/60 text-sm font-medium tracking-wide">Loading WpDev sequence&hellip;</p>
        </div>
      )}

      {/* 400vh container for scrolling */}
      <div ref={containerRef} className="h-[400vh] w-full relative">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
           
           <canvas
             ref={canvasRef}
             className="absolute top-0 left-0 w-full h-full"
           />

           {/* Overlays removed to only show the scrollable background */}

        </div>
      </div>
    </div>
  );
}
