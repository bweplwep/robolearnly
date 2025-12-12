import React, { useEffect, useRef } from 'react';

interface Gear {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  teeth: number;
  color: string;
}

interface Symbol {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  symbol: string;
  color: string;
}

export default function GearsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Установка размеров
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    // Создаем шестеренки
    const gears: Gear[] = [];
    const symbols: Symbol[] = [];
    
    // Функция для рисования шестеренки
    const drawGear = (gear: Gear) => {
      ctx.save();
      ctx.translate(gear.x, gear.y);
      ctx.rotate(gear.rotation);
      
      // Внешняя окружность
      ctx.beginPath();
      ctx.arc(0, 0, gear.size, 0, Math.PI * 2);
      ctx.fillStyle = `${gear.color}20`;
      ctx.fill();
      
      // Зубья шестеренки
      ctx.strokeStyle = gear.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < gear.teeth; i++) {
        const angle = (i * 2 * Math.PI) / gear.teeth;
        const innerRadius = gear.size * 0.7;
        const outerRadius = gear.size;
        
        // Внешняя точка зуба
        const x1 = Math.cos(angle) * outerRadius;
        const y1 = Math.sin(angle) * outerRadius;
        
        // Внутренняя точка
        const angle2 = angle + Math.PI / gear.teeth;
        const x2 = Math.cos(angle2) * innerRadius;
        const y2 = Math.sin(angle2) * innerRadius;
        
        // Следующая внешняя точка
        const angle3 = angle + 2 * Math.PI / gear.teeth;
        const x3 = Math.cos(angle3) * outerRadius;
        const y3 = Math.sin(angle3) * outerRadius;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
      }
      
      ctx.closePath();
      ctx.stroke();
      
      // Центр шестеренки
      ctx.beginPath();
      ctx.arc(0, 0, gear.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = gear.color;
      ctx.fill();
      
      ctx.restore();
    };
    
    // Функция для рисования математического символа
    const drawSymbol = (symbol: Symbol) => {
      ctx.save();
      ctx.translate(symbol.x, symbol.y);
      ctx.rotate(symbol.rotation);
      
      ctx.font = `${symbol.size}px Arial`;
      ctx.fillStyle = symbol.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol.symbol, 0, 0);
      
      // Легкое свечение
      ctx.shadowBlur = 10;
      ctx.shadowColor = symbol.color;
      ctx.fillText(symbol.symbol, 0, 0);
      ctx.shadowBlur = 0;
      
      ctx.restore();
    };
    
    // Инициализация объектов
    const initObjects = () => {
      // Создаем шестеренки
      const gearColors = ['#3b82f6', '#06b6d4', '#8b5cf6'];
      for (let i = 0; i < 5; i++) {
        gears.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 30 + Math.random() * 50,
          speed: (Math.random() - 0.5) * 0.01,
          rotation: 0,
          teeth: 8 + Math.floor(Math.random() * 10),
          color: gearColors[Math.floor(Math.random() * gearColors.length)]
        });
      }
      
      // Создаем математические символы
      const mathSymbols = ['∫', '∑', 'π', '∞', 'θ', 'Δ', '√', '≈', '≠', '≤', '≥', 'α', 'β', 'γ'];
      const symbolColors = ['#60a5fa', '#38bdf8', '#818cf8', '#a78bfa'];
      
      for (let i = 0; i < 15; i++) {
        symbols.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 20 + Math.random() * 30,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          rotation: 0,
          symbol: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
          color: `${symbolColors[Math.floor(Math.random() * symbolColors.length)]}40`
        });
      }
    };
    
    initObjects();
    
    // Анимация
    const animate = () => {
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Темный фон
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Обновляем и рисуем шестеренки
      gears.forEach(gear => {
        gear.rotation += gear.speed;
        
        // Медленное плавающее движение
        gear.x += Math.sin(Date.now() * 0.001 + gear.size) * 0.1;
        gear.y += Math.cos(Date.now() * 0.001 + gear.size) * 0.1;
        
        // Обработка границ
        if (gear.x < -gear.size * 2) gear.x = canvas.width + gear.size * 2;
        if (gear.x > canvas.width + gear.size * 2) gear.x = -gear.size * 2;
        if (gear.y < -gear.size * 2) gear.y = canvas.height + gear.size * 2;
        if (gear.y > canvas.height + gear.size * 2) gear.y = -gear.size * 2;
        
        drawGear(gear);
      });
      
      // Обновляем и рисуем символы
      symbols.forEach(symbol => {
        symbol.x += symbol.speedX;
        symbol.y += symbol.speedY;
        symbol.rotation += 0.002;
        
        // Отскок от границ
        if (symbol.x < 0 || symbol.x > canvas.width) symbol.speedX *= -1;
        if (symbol.y < 0 || symbol.y > canvas.height) symbol.speedY *= -1;
        
        // Ограничение позиций
        symbol.x = Math.max(10, Math.min(canvas.width - 10, symbol.x));
        symbol.y = Math.max(10, Math.min(canvas.height - 10, symbol.y));
        
        drawSymbol(symbol);
      });
      
      // Рисуем соединения между шестеренками
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < gears.length; i++) {
        for (let j = i + 1; j < gears.length; j++) {
          const dx = gears[j].x - gears[i].x;
          const dy = gears[j].y - gears[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 300) {
            const opacity = 1 - (distance / 300);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.2})`;
            ctx.setLineDash([5, 10]);
            ctx.beginPath();
            ctx.moveTo(gears[i].x, gears[i].y);
            ctx.lineTo(gears[j].x, gears[j].y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Обработчики событий
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