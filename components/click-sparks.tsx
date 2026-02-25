"use client";

import { useEffect, useCallback, useRef } from "react";

// Lightning bolt SVG paths (small variations for variety)
const BOLTS = [
  "M7 0L4 6h3L3 12l7-7H6l3-5z",       // classic bolt
  "M6 0L3 5h3L2 11l8-6H5l4-5z",        // wider bolt
  "M8 0L5 5h2L3 12l7-7H7l3-5z",        // tall bolt
  "M6 0L2 6h3L1 11l9-6H5l4-5z",        // angled bolt
];

const COLORS = [
  "#f59e0b", // amber (accent)
  "#fbbf24", // yellow
  "#f97316", // orange
  "#fcd34d", // light yellow
  "#ffffff", // white flash
];

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
  color: string;
  bolt: string;
  life: number;
  maxLife: number;
}

export function ClickSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  const spawnSparks = useCallback((x: number, y: number) => {
    const count = 6 + Math.floor(Math.random() * 4); // 6-9 bolts
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 80 + Math.random() * 160;
      const maxLife = 0.4 + Math.random() * 0.3;
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40, // slight upward bias
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 12,
        scale: 0.6 + Math.random() * 0.8,
        opacity: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        bolt: BOLTS[Math.floor(Math.random() * BOLTS.length)],
        life: 0,
        maxLife,
      });
    }

    if (!activeRef.current) {
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to window
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dt = 1 / 60; // approximate frame delta
    const sparks = sparksRef.current;

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;

      if (s.life >= s.maxLife) {
        sparks.splice(i, 1);
        continue;
      }

      const progress = s.life / s.maxLife;

      // Physics
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 200 * dt; // gravity
      s.vx *= 0.98; // drag
      s.rotation += s.rotationSpeed * dt;

      // Fade out in second half of life
      s.opacity = progress < 0.5 ? 1 : 1 - (progress - 0.5) * 2;
      const currentScale = s.scale * (1 - progress * 0.3);

      // Draw the bolt
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.scale(currentScale, currentScale);
      ctx.globalAlpha = s.opacity;

      // Glow effect
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 6;

      // Draw bolt path
      ctx.fillStyle = s.color;
      const p = new Path2D(s.bolt);
      ctx.fill(p);

      ctx.restore();
    }

    if (sparks.length > 0) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      activeRef.current = false;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only spark on interactive elements
      if (
        target.closest("button, a, [role='button'], [data-spark], input[type='submit']")
      ) {
        spawnSparks(e.clientX, e.clientY);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, [spawnSparks]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    />
  );
}
