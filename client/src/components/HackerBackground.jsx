import { useEffect, useRef } from 'react';

const HackerBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size - fixed height for hero section
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.min(window.innerHeight * 1.5, 1200); // Limit to hero section
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix-style characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>/\\|';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Array to track position of drops
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Drawing function
    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Calculate color - brighter at the front of the drop
        const gradient = ctx.createLinearGradient(0, drops[i] * fontSize, 0, (drops[i] + 1) * fontSize);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#dc143c');
        gradient.addColorStop(1, '#660000');

        ctx.fillStyle = gradient;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment Y coordinate
        drops[i]++;
      }
    };

    // Animation loop
    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default HackerBackground;
