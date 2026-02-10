import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function PointsPopup({ points = 10, trigger = false }) {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!trigger || !popupRef.current) return;

    // Reset position
    gsap.set(popupRef.current, {
      opacity: 1,
      y: 0,
      x: 0,
    });

    // Animate floating up and fading out
    gsap.to(popupRef.current, {
      duration: 2,
      y: -100,
      opacity: 0,
      ease: 'power2.out',
    });
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div
      ref={popupRef}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
    >
      <div className="text-4xl font-bold font-fredoka text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500">
        +{points} XP
      </div>
    </div>
  );
}

export default PointsPopup;
