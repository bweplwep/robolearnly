import { useEffect, useRef, useState } from "react";
import type { RobotConfig, ProgramCommand, LevelId } from "@shared/schema";
import { Button } from "./ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

declare const Matter: any;

interface SimulatorProps {
  robotConfig: RobotConfig;
  command: ProgramCommand;
  levelId: LevelId;
  onSuccess: () => void;
  onFailure: (message: string) => void;
}

export function PhysicsSimulator({ robotConfig, command, levelId, onSuccess, onFailure }: SimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const robotRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const collisionHandlerRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { Engine, Render, World, Bodies, Body, Events } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1 },
    });
    engineRef.current = engine;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 400,
        wireframes: false,
        background: "#1a1a2e",
      },
    });
    renderRef.current = render;

    const ground = Bodies.rectangle(400, 390, 810, 20, { 
      isStatic: true,
      render: { fillStyle: "#3d3d5c" }
    });

    const leftWall = Bodies.rectangle(0, 200, 20, 400, { 
      isStatic: true,
      render: { fillStyle: "#3d3d5c" }
    });

    const rightWall = Bodies.rectangle(800, 200, 20, 400, { 
      isStatic: true,
      render: { fillStyle: "#3d3d5c" }
    });

    let obstacles: any[] = [];
    let target: any;
    let cargo: any = null;

    if (levelId === 1) {
      target = Bodies.rectangle(700, 340, 60, 60, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: "#10b981" },
      });
    } else if (levelId === 2) {
      obstacles = [
        Bodies.rectangle(300, 330, 50, 100, {
          isStatic: true,
          render: { fillStyle: "#ef4444" },
        }),
        Bodies.rectangle(500, 330, 50, 100, {
          isStatic: true,
          render: { fillStyle: "#ef4444" },
        }),
      ];
      target = Bodies.rectangle(700, 340, 60, 60, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: "#10b981" },
      });
    } else if (levelId === 3) {
      cargo = Bodies.rectangle(150, 320, 30, 30, {
        render: { fillStyle: "#eab308" },
        density: 0.002,
      });
      obstacles = [
        Bodies.rectangle(400, 330, 50, 100, {
          isStatic: true,
          render: { fillStyle: "#ef4444" },
        }),
      ];
      target = Bodies.rectangle(700, 340, 80, 80, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: "#10b981" },
      });
    }

    const robotWidth = robotConfig.motors === 2 ? 50 : 40;
    const robotHeight = 40;
    const robot = Bodies.rectangle(100, 340, robotWidth, robotHeight, {
      density: 0.001,
      friction: 0.3,
      restitution: 0.3,
      render: { 
        fillStyle: robotConfig.microcontroller === "arduino" ? "#3b82f6" : "#8b5cf6"
      },
    });
    robotRef.current = robot;

    const allBodies = [ground, leftWall, rightWall, robot, target, ...obstacles];
    if (cargo) allBodies.push(cargo);

    World.add(engine.world, allBodies);

    Render.run(render);

    collisionHandlerRef.current = (event: any) => {
      if (hasEndedRef.current) return;
      
      const pairs = event.pairs;
      for (const pair of pairs) {
        if ((pair.bodyA === robot && pair.bodyB === target) ||
            (pair.bodyA === target && pair.bodyB === robot)) {
          if (levelId === 3 && cargo) {
            const cargoInTarget = Matter.Bounds.overlaps(cargo.bounds, target.bounds);
            if (cargoInTarget && simulationTime < 30000) {
              stopSimulation();
              onSuccess();
            }
          } else {
            stopSimulation();
            onSuccess();
          }
        }

        if ((pair.bodyA === robot || pair.bodyB === robot)) {
          const other = pair.bodyA === robot ? pair.bodyB : pair.bodyA;
          if (obstacles.includes(other)) {
            stopSimulation();
            onFailure("Робот столкнулся с препятствием! Попробуйте изменить траекторию.");
          }
        }
      }
    };

    Events.on(engine, "collisionStart", collisionHandlerRef.current);

    return () => {
      if (collisionHandlerRef.current) {
        Events.off(engine, "collisionStart", collisionHandlerRef.current);
      }
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (runnerRef.current) {
        const { Runner } = Matter;
        Runner.stop(runnerRef.current);
      }
    };
  }, [levelId, robotConfig]);

  function startSimulation() {
    if (!engineRef.current || !robotRef.current || isRunning) return;

    hasEndedRef.current = false;
    setIsRunning(true);
    setSimulationTime(0);

    const { Runner, Body } = Matter;
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engineRef.current);

    const speedMultiplier = robotConfig.motors === 2 ? 1.2 : 1.0;
    const sensorBonus = robotConfig.sensor !== "none" ? 0.1 : 0;
    const finalSpeed = command.speed * speedMultiplier * (1 + sensorBonus);

    const forceX = Math.cos((command.direction * Math.PI) / 180) * finalSpeed * 0.001;
    const forceY = Math.sin((command.direction * Math.PI) / 180) * finalSpeed * 0.001;

    Body.applyForce(robotRef.current, robotRef.current.position, { x: forceX, y: forceY });

    timerRef.current = setInterval(() => {
      if (hasEndedRef.current) return;
      
      setSimulationTime(prev => {
        const newTime = prev + 100;
        if (hasEndedRef.current) return prev;
        
        if (levelId === 3 && newTime >= 30000) {
          stopSimulation();
          onFailure("Время вышло! Попробуйте быстрее доставить груз.");
          return newTime;
        }
        if (newTime >= command.duration) {
          stopSimulation();
        }
        return newTime;
      });
    }, 100);

    fallTimeoutRef.current = setTimeout(() => {
      if (hasEndedRef.current) return;
      if (robotRef.current && robotRef.current.position.y > 450) {
        stopSimulation();
        onFailure("Робот упал! Добавьте стабилизаторы или уменьшите скорость.");
      }
    }, command.duration);
  }

  function stopSimulation() {
    hasEndedRef.current = true;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (fallTimeoutRef.current) {
      clearTimeout(fallTimeoutRef.current);
      fallTimeoutRef.current = null;
    }
    
    if (runnerRef.current) {
      const { Runner } = Matter;
      Runner.stop(runnerRef.current);
      runnerRef.current = null;
    }
    
    setIsRunning(false);
  }

  function resetSimulation() {
    if (!engineRef.current || !robotRef.current) return;

    stopSimulation();

    const { Body } = Matter;
    Body.setPosition(robotRef.current, { x: 100, y: 340 });
    Body.setVelocity(robotRef.current, { x: 0, y: 0 });
    Body.setAngle(robotRef.current, 0);
    Body.setAngularVelocity(robotRef.current, 0);

    setSimulationTime(0);
    hasEndedRef.current = false;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full border-2 border-border rounded-lg"
          data-testid="canvas-simulator"
        />
        {levelId === 3 && (
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-4 py-2 rounded-lg border border-border">
            <div className="text-sm font-medium" data-testid="text-timer">
              Время: {(simulationTime / 1000).toFixed(1)}с / 30.0с
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-center">
        <Button
          onClick={startSimulation}
          disabled={isRunning || !command.speed}
          size="lg"
          data-testid="button-run-simulation"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Идёт симуляция...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Запустить симуляцию
            </>
          )}
        </Button>
        <Button
          onClick={resetSimulation}
          variant="outline"
          size="lg"
          data-testid="button-reset-simulation"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Сброс
        </Button>
      </div>

      <Alert data-testid="alert-simulator-hint">
        <AlertDescription className="text-sm" data-testid="text-simulator-hint">
          <strong>Подсказка:</strong> Синий цвет — ваш робот. Зелёный — цель. Красный — препятствия. 
          {levelId === 3 && " Жёлтый — груз для доставки."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
