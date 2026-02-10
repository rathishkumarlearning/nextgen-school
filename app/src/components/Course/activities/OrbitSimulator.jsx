import React, { useState, useEffect, useRef } from 'react';

export default function OrbitSimulator() {
  const [gravity, setGravity] = useState(3);
  const [distance, setDistance] = useState(3);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let angle = 0;

    const drawOrbit = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const orbitRadius = 50 + distance * 20;
      const speed = (gravity * 0.02);

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw orbit path
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw sun
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw planet
      angle += speed;
      const planetX = centerX + Math.cos(angle) * orbitRadius;
      const planetY = centerY + Math.sin(angle) * orbitRadius;

      ctx.fillStyle = '#3b82f6';
      ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(planetX, planetY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw velocity indicator
      const nextAngle = angle + speed;
      const nextX = centerX + Math.cos(nextAngle) * orbitRadius;
      const nextY = centerY + Math.sin(nextAngle) * orbitRadius;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(planetX, planetY);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawOrbit);
    };

    drawOrbit();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gravity, distance]);

  const getOrbitStatus = () => {
    const gravityForce = gravity;
    const centrifugalForce = distance;

    if (gravityForce > centrifugalForce * 1.2) {
      return { text: 'Too close! Planet falls into sun! ☀️', color: 'text-red-400' };
    } else if (gravityForce < centrifugalForce * 0.8) {
      return { text: 'Too far! Planet flies away! 🛸', color: 'text-orange-400' };
    } else {
      return { text: 'Stable orbit! Perfect balance! ✓', color: 'text-green-400' };
    }
  };

  const status = getOrbitStatus();

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <div className="bg-slate-900 border border-glass-border rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full"
        />
      </div>

      {/* Controls */}
      <div className="bg-bg2 border border-glass-border rounded-xl p-6 space-y-6">
        {/* Gravity Control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-text">Gravity Force</label>
            <span className="text-xl">{gravity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={gravity}
            onChange={(e) => setGravity(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
            <span>Weak</span>
            <div className="flex-1 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded" />
            <span>Strong</span>
          </div>
        </div>

        {/* Distance Control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-text">Distance from Sun</label>
            <span className="text-xl">{distance}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
            <span>Close</span>
            <div className="flex-1 h-1 bg-gradient-to-r from-yellow-500 to-blue-500 rounded" />
            <span>Far</span>
          </div>
        </div>

        {/* Status */}
        <div className={`p-4 rounded-lg bg-bg3 border border-glass-border text-center ${status.color}`}>
          <div className="font-bold text-lg">{status.text}</div>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-4 text-sm text-text-secondary">
          <p className="mb-2">Adjust the gravity and distance sliders to keep the planet in a stable orbit around the sun!</p>
          <ul className="space-y-1 text-xs">
            <li>• Too much gravity: planet crashes into sun</li>
            <li>• Too little gravity: planet escapes into space</li>
            <li>• Perfect balance: stable orbit maintained</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
