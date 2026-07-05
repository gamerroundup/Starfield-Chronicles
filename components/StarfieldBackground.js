'use client';

import { useEffect, useRef } from 'react';

export default function StarfieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          color: getRandomColor(),
          speed: Math.random() * 0.05 + 0.01,
          opacity: Math.random(),
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const getRandomColor = () => {
      const colors = [
        '#ffffff', 
        '#e0f2fe', 
        '#bae6fd', 
        '#00f0ff', // Cyan
        '#ff8a00', // Orange Accent
        '#c084fc'  // Violet Accent
      ];
      const r = Math.random();
      if (r < 0.8) return colors[0]; // Mostly white
      if (r < 0.9) return colors[1];
      if (r < 0.95) return colors[3]; // Cyan
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid pattern (subtle space-nav grid)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      stars.forEach(star => {
        // Pulse opacity
        star.opacity += star.speed * star.direction;
        if (star.opacity > 1 || star.opacity < 0.1) {
          star.direction *= -1;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-space-950"
    />
  );
}
