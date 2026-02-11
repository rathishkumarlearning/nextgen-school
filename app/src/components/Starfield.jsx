import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let stars = [];
    let animId;

    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      stars = Array.from({length: 200}, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 1.5 + 0.3,
        s: Math.random() * 0.5 + 0.1,
        o: Math.random()
      }));
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        s.o += s.s * 0.01;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(Math.sin(s.o) + 1) / 3})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} id="starfield" />;
}
