import React, { useEffect, useRef } from 'react';

interface Wave {
  x: number;
  y: number;
  amplitude: number;
  frequency: number;
  speed: number;
  wavelength: number;
  color: string;
}

export default function WavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    // Создаем волны
    const waves: Wave[] = [
      { x: 0, y: canvas.height / 2, amplitude: 40, frequency: 0.02, speed: 0.02, wavelength: 100, color: '#3b82f6' },
      { x: 0, y: canvas.height / 3, amplitude: 30, frequency: 0.015, speed: 0.015, wavelength: 120, color: '#06b6d4' },
      { x: 0, y: canvas.height * 2/3, amplitude: 35, frequency: 0.025, speed: 0.025, wavelength: 80, color: '#8b5cf6' },
    ];
    
    // Точки для интерференции
    const points: Array<{x: number, y: number, size: number}> = [];
    for (let i = 0; i < 20; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 3
      });
    }
    
    // Анимация
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Темный фон
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() * 0.001;
      
      // Рисуем волны
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, wave.y);
        
        for (let x = 0; x < canvas.width; x++) {
          // Волновая функция
          const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;
          
          // Добавляем немного шума для реалистичности
          const noise = Math.sin(x * 0.05 + time) * 2;
          
          if (x === 0) {
            ctx.moveTo(x, y + noise);
          } else {
            ctx.lineTo(x, y + noise);
          }
        }
        
        // Градиент для волны
        const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude);
        gradient.addColorStop(0, `${wave.color}00`);
        gradient.addColorStop(0.5, `${wave.color}40`);
        gradient.addColorStop(1, `${wave.color}00`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Заливка под волной
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = `${wave.color}10`;
        ctx.fill();
      });
      
      // Рисуем точки интерференции
      points.forEach(point => {
        // Вычисляем интерференцию от всех волн
        let interference = 0;
        waves.forEach(wave => {
          const distance = Math.sqrt(Math.pow(point.x - canvas.width/2, 2) + Math.pow(point.y - wave.y, 2));
          interference += Math.sin(distance * wave.frequency - time * wave.speed) * wave.amplitude;
        });
        
        // Размер точки зависит от интерференции
        const size = point.size + Math.abs(interference) * 0.1;
        
        // Цвет зависит от фазы
        const phase = Math.sin(time + point.x * 0.01 + point.y * 0.01);
        const color = phase > 0 ? '#60a5fa' : '#38bdf8';
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        
        // Градиент для точки
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 2
        );
        gradient.addColorStop(0, `${color}80`);
        gradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Медленное движение точек
        point.x += Math.sin(time + point.y * 0.01) * 0.2;
        point.y += Math.cos(time + point.x * 0.01) * 0.2;
        
        // Ограничение границ
        if (point.x < 0) point.x = canvas.width;
        if (point.x > canvas.width) point.x = 0;
        if (point.y < 0) point.y = canvas.height;
        if (point.y > canvas.height) point.y = 0;
      });
      
      // Рисуем "силовые линии" между точками
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[j].x - points[i].x;
          const dy = points[j].y - points[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const opacity = 1 - (distance / 150);
            ctx.strokeStyle = `rgba(96, 165, 250, ${opacity * 0.2})`;
            
            // Пунктирные линии
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}