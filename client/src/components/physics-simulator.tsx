import { useEffect, useRef, useState } from "react";
import type { RobotConfig, ProgramCommand, LevelId } from "@shared/schema";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface SimulatorProps {
  robotConfig: RobotConfig;
  command: ProgramCommand;
  levelId: LevelId;
  onSuccess: () => void;
  onFailure: (message: string) => void;
  isResetting?: boolean;
  physicsSettings?: {
    gravity: number;
    friction: number;
    timeScale: number;
    wind: number;
  };
}

interface RobotState {
  x: number;
  y: number;
  angle: number; // в градусах, 0 = смотрит ВПРАВО
  isMoving: boolean;
}

interface LevelElement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PhysicsSimulator({ 
  robotConfig, 
  command, 
  levelId, 
  onSuccess, 
  onFailure,
  isResetting = false,
  physicsSettings = { gravity: 0.5, friction: 0.8, timeScale: 1.0, wind: 0 }
}: SimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const commandIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [robotState, setRobotState] = useState<RobotState>({
    x: 100,
    y: 200,
    angle: 0, // 0° = смотрит ВПРАВО (красная грань справа)
    isMoving: false
  });

  const [simulationTime, setSimulationTime] = useState(0);
  const [currentCommand, setCurrentCommand] = useState<ProgramCommand | null>(null);
  const [cargoPosition, setCargoPosition] = useState({ x: 150, y: 180 });

  // Используем useRef для изменяемых данных
  const levelDataRef = useRef({
    target: { x: 700, y: 200, width: 60, height: 60 },
    obstacles: [] as LevelElement[],
    hasCargo: false
  });

  // Инициализация уровня
  useEffect(() => {
    console.log("Initializing level:", levelId);
    
    if (levelId === 1) {
      levelDataRef.current = {
        target: { x: 700, y: 200, width: 60, height: 60 },
        obstacles: [],
        hasCargo: false
      };
    } else if (levelId === 2) {
      levelDataRef.current = {
        target: { x: 700, y: 200, width: 60, height: 60 },
        obstacles: [
          { x: 300, y: 200, width: 50, height: 100 },
          { x: 500, y: 200, width: 50, height: 100 }
        ],
        hasCargo: false
      };
    } else if (levelId === 3) {
      levelDataRef.current = {
        target: { x: 700, y: 200, width: 80, height: 80 },
        obstacles: [
          { x: 400, y: 200, width: 50, height: 100 }
        ],
        hasCargo: true
      };
      setCargoPosition({ x: 150, y: 180 });
    }

    resetSimulation();
  }, [levelId]);

  // Отрисовка сцены
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка пола
    ctx.fillStyle = '#2d2d4d';
    ctx.fillRect(0, 350, canvas.width, 50);

    // Отрисовка препятствий
    ctx.fillStyle = '#ef4444';
    levelDataRef.current.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height/2, obstacle.width, obstacle.height);
    });

    // Отрисовка цели
    ctx.fillStyle = '#10b981';
    const target = levelDataRef.current.target;
    ctx.fillRect(
      target.x - target.width/2, 
      target.y - target.height/2, 
      target.width, 
      target.height
    );

    // Отрисовка груза (для уровня 3)
    if (levelDataRef.current.hasCargo) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(
        cargoPosition.x - 15,
        cargoPosition.y - 15,
        30,
        30
      );
    }

    // Отрисовка робота
    drawRobot(ctx, robotState.x, robotState.y, robotState.angle);
  };

  // Отрисовка робота
  const drawRobot = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180); // Угол в стандартной системе координат

    // Тело робота
    const width = robotConfig.motors === 2 ? 50 : 40;
    const height = 30;
    
    ctx.fillStyle = robotConfig.microcontroller === "arduino" ? "#3b82f6" : "#8b5cf6";
    ctx.fillRect(-width/2, -height/2, width, height);
    
    // Передняя часть (нос робота) - красный прямоугольник справа
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width/2 - 10, -5, 10, 10);
    
    // Колёса
    ctx.fillStyle = '#333333';
    ctx.fillRect(-width/2, -height/2 - 5, width, 5);
    ctx.fillRect(-width/2, height/2, width, 5);

    ctx.restore();
  };

  // Проверка столкновений
  const checkCollisions = () => {
    const robotWidth = robotConfig.motors === 2 ? 50 : 40;
    const robotHeight = 30;

    // Проверка достижения цели
    const target = levelDataRef.current.target;
    const robotLeft = robotState.x - robotWidth/2;
    const robotRight = robotState.x + robotWidth/2;
    const robotTop = robotState.y - robotHeight/2;
    const robotBottom = robotState.y + robotHeight/2;

    const targetLeft = target.x - target.width/2;
    const targetRight = target.x + target.width/2;
    const targetTop = target.y - target.height/2;
    const targetBottom = target.y + target.height/2;

    if (robotRight > targetLeft && robotLeft < targetRight &&
        robotBottom > targetTop && robotTop < targetBottom) {
      
      if (levelId === 3 && levelDataRef.current.hasCargo) {
        // Для уровня 3 проверяем, что груз тоже у цели
        const cargoLeft = cargoPosition.x - 15;
        const cargoRight = cargoPosition.x + 15;
        const cargoTop = cargoPosition.y - 15;
        const cargoBottom = cargoPosition.y + 15;

        if (cargoRight > targetLeft && cargoLeft < targetRight &&
            cargoBottom > targetTop && cargoTop < targetBottom) {
          handleSuccess();
        }
      } else {
        handleSuccess();
      }
    }

    // Проверка столкновения с препятствиями
    for (const obstacle of levelDataRef.current.obstacles) {
      const obstacleLeft = obstacle.x - obstacle.width/2;
      const obstacleRight = obstacle.x + obstacle.width/2;
      const obstacleTop = obstacle.y - obstacle.height/2;
      const obstacleBottom = obstacle.y + obstacle.height/2;

      if (robotRight > obstacleLeft && robotLeft < obstacleRight &&
          robotBottom > obstacleTop && robotTop < obstacleBottom) {
        handleFailure("Робот столкнулся с препятствием! Попробуйте изменить траекторию.");
        return;
      }
    }

    // Проверка выхода за границы
    if (robotState.x < 20 || robotState.x > 780 || robotState.y < 20 || robotState.y > 330) {
      handleFailure("Робот вышел за границы поля!");
    }
  };

  // Анимация
  useEffect(() => {
    const animate = () => {
      drawScene();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [robotState, levelId, robotConfig, cargoPosition]);

  // Обработка входящих команд
  useEffect(() => {
    console.log("Command received:", command);
    
    if (command.speed > 0 && !robotState.isMoving) {
      console.log("Executing new command");
      executeCommand(command);
    }
  }, [command]);

  // Обработка сброса
  useEffect(() => {
    if (isResetting) {
      console.log("Manual reset triggered");
      resetSimulation();
    }
  }, [isResetting]);

  const stopCurrentCommand = () => {
    if (commandIntervalRef.current) {
      clearInterval(commandIntervalRef.current);
      commandIntervalRef.current = null;
    }
    setRobotState(prev => ({ ...prev, isMoving: false }));
    setCurrentCommand(null);
  };

  const executeCommand = (cmd: ProgramCommand) => {
    console.log("Starting command execution:", cmd);
    
    stopCurrentCommand(); // Останавливаем предыдущую команду

    setCurrentCommand(cmd);
    setRobotState(prev => ({ ...prev, isMoving: true }));
    setSimulationTime(0);

    // Отменяем автосброс при начале новой команды
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }

    const startTime = Date.now();
    const duration = cmd.duration;

    console.log(`Command: ${getCommandName(cmd)}, Duration: ${duration}ms`);

    commandIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setRobotState(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newAngle = prev.angle;

        // ПРОСТАЯ И ПОНЯТНАЯ ЛОГИКА ДВИЖЕНИЯ:
        // Робот смотрит ВПРАВО (0°), красная грань справа - это перед
        
        if (cmd.direction === 0) {
          // ДВИЖЕНИЕ ВПЕРЕД - по направлению взгляда (ВПРАВО)
          const distance = cmd.speed * 2 * progress;
          const rad = prev.angle * Math.PI / 180;
          newX = prev.x + Math.cos(rad) * distance; // Движение по X
          newY = prev.y + Math.sin(rad) * distance; // Движение по Y
        } 
        else if (cmd.direction === 180) {
          // ДВИЖЕНИЕ НАЗАД - против направления взгляда (ВЛЕВО)
          const distance = cmd.speed * 2 * progress;
          const rad = prev.angle * Math.PI / 180;
          newX = prev.x - Math.cos(rad) * distance; // Движение назад по X
          newY = prev.y - Math.sin(rad) * distance; // Движение назад по Y
        }
        else if (cmd.direction > 0) {
          // ПОВОРОТ НАПРАВО (по часовой стрелке)
          const rotationAmount = 2 * progress; // Медленный поворот
          newAngle = (prev.angle + rotationAmount) % 360;
        }
        else if (cmd.direction < 0) {
          // ПОВОРОТ НАЛЕВО (против часовой стрелки)
          const rotationAmount = 2 * progress; // Медленный поворот
          newAngle = (prev.angle - rotationAmount) % 360;
        }

        // Обновляем позицию груза если робот его везет
        if (levelId === 3 && levelDataRef.current.hasCargo) {
          const cargoDistance = 40;
          const cargoRad = newAngle * Math.PI / 180;
          const newCargoX = newX + Math.cos(cargoRad) * cargoDistance;
          const newCargoY = newY + Math.sin(cargoRad) * cargoDistance;
          setCargoPosition({ x: newCargoX, y: newCargoY });
        }

        // Проверяем границы
        newX = Math.max(25, Math.min(775, newX));
        newY = Math.max(25, Math.min(325, newY));

        return {
          x: newX,
          y: newY,
          angle: newAngle,
          isMoving: progress < 1
        };
      });

      setSimulationTime(elapsed);

      // Проверяем столкновения
      checkCollisions();

      // Завершаем выполнение команды
      if (progress >= 1) {
        stopCurrentCommand();
        console.log("Command execution completed");
      }
    }, 16); // ~60fps
  };

  const handleSuccess = () => {
    console.log("Success! Mission accomplished");
    stopCurrentCommand();
    onSuccess();
    
    // Автосброс через 3 секунды после успеха
    setTimeout(() => {
      resetSimulation();
    }, 3000);
  };

  const handleFailure = (message: string) => {
    console.log("Failure:", message);
    stopCurrentCommand();
    onFailure(message);
    
    // Автосброс через 3 секунды после неудачи
    setTimeout(() => {
      resetSimulation();
    }, 3000);
  };

  const resetSimulation = () => {
    console.log("Resetting simulation");
    
    stopCurrentCommand();
    
    // Отменяем автосброс
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }
    
    setRobotState({
      x: 100,
      y: 200,
      angle: 0, // 0° = смотрит ВПРАВО
      isMoving: false
    });
    
    setCurrentCommand(null);
    setSimulationTime(0);
    
    if (levelId === 3) {
      setCargoPosition({ x: 150, y: 180 });
    }
  };

  // Автосброс только когда программа полностью завершена (все команды выполнены)
  useEffect(() => {
    // Если пришла команда с speed=0 (стоп) и до этого было движение
    if (command.speed === 0 && !robotState.isMoving && currentCommand === null) {
      console.log("Program completed, scheduling auto-reset");
      
      // Отменяем предыдущий автосброс
      if (autoResetTimeoutRef.current) {
        clearTimeout(autoResetTimeoutRef.current);
      }
      
      // Запускаем автосброс через 3 секунды после завершения ВСЕЙ программы
      autoResetTimeoutRef.current = setTimeout(() => {
        console.log("Auto-reset after full program completion");
        resetSimulation();
      }, 3000);
    }
  }, [command, robotState.isMoving, currentCommand]);

  // Получение читаемого названия команды
  const getCommandName = (cmd: ProgramCommand) => {
    if (cmd.direction === 0) return "ВПЕРЕД";
    if (cmd.direction === 180) return "НАЗАД";
    if (cmd.direction > 0) return "ПОВОРОТ ВПРАВО";
    if (cmd.direction < 0) return "ПОВОРОТ НАЛЕВО";
    return "ОЖИДАНИЕ";
  };

  // Получение направления взгляда
  const getDirectionText = (angle: number) => {
    if (angle >= 315 || angle < 45) return "→ Смотрит ВПРАВО";
    if (angle >= 45 && angle < 135) return "↓ Смотрит ВНИЗ";
    if (angle >= 135 && angle < 225) return "← Смотрит ВЛЕВО";
    if (angle >= 225 && angle < 315) return "↑ Смотрит ВВЕРХ";
    return "↗ Под углом";
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={800}
          height={400}
          className="w-full border-2 border-border rounded-lg bg-slate-900"
          data-testid="canvas-simulator"
        />
        
        {/* Статус симуляции */}
        <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-600">
          <div className="text-sm font-medium text-white">
            {robotState.isMoving ? "🚀 Выполняется" : "✅ Готов"}
            {currentCommand && ` | ${getCommandName(currentCommand)}`}
          </div>
        </div>
        
        {/* Координаты робота */}
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-600">
          <div className="text-xs text-white">
            X: {Math.round(robotState.x)} 
            <br />
            Y: {Math.round(robotState.y)}
            <br /> 
            Угол: {Math.round(robotState.angle)}°
          </div>
        </div>

        {/* Направление робота */}
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-600">
          <div className="text-xs text-white">
            {getDirectionText(robotState.angle)}
          </div>
        </div>
      </div>

      {/* Элементы управления */}
      <div className="flex items-center gap-3 justify-center">
        <Button
          onClick={resetSimulation}
          variant="outline"
          size="lg"
          className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Сброс позиции
        </Button>
      </div>

      {/* Информация о команде */}
      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <div className="text-sm text-slate-300">
          <strong>Текущая команда:</strong>{" "}
          {currentCommand ? (
            <>
              🎯 {getCommandName(currentCommand)}
              {" | Сила: "}{currentCommand.speed}
              {" | Прогресс: "}{Math.round((simulationTime / currentCommand.duration) * 100)}%
            </>
          ) : (
            "⏳ Ожидание команд..."
          )}
        </div>
      </div>

      <Alert className="bg-slate-800/50 border-slate-700">
        <AlertDescription className="text-sm text-slate-300">
          <strong>Управление роботом:</strong>
          <br />• <strong>ВПЕРЕД</strong> - движение в направлении КРАСНОЙ ГРАНИ (вправо)
          <br />• <strong>НАЗАД</strong> - движение против направления красной грани (влево)  
          <br />• <strong>ПОВОРОТ ВПРАВО</strong> - вращение по часовой стрелке
          <br />• <strong>ПОВОРОТ ВЛЕВО</strong> - вращение против часовой стрелки
          <br />
          <strong>Начальная ориентация:</strong> Робот смотрит ВПРАВО (0°) - красная грань справа
          <br />
          <strong>Автосброс:</strong> Только после выполнения всей программы
        </AlertDescription>
      </Alert>
    </div>
  );
}