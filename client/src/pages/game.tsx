import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { PhysicsSimulator } from "@/components/physics-simulator";
import { storageService } from "@/lib/storage";
import { LEVELS, getLevelById } from "@/lib/levels";
import { useToast } from "@/hooks/use-toast";
import type { RobotConfig, ProgramCommand, LevelId, UserProgress, MotorCount, SensorType, MicrocontrollerType } from "@shared/schema";
import { Bot, Code, Trophy, Lock, CheckCircle, Circle, Download, LogOut } from "lucide-react";

export default function Game() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(1);
  const [robotConfig, setRobotConfig] = useState<RobotConfig>({
    motors: 2,
    sensor: "none",
    microcontroller: "arduino",
  });
  const [command, setCommand] = useState<ProgramCommand>({
    speed: 5,
    direction: 0,
    duration: 5000,
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isRobotBuilt, setIsRobotBuilt] = useState(false);

  useEffect(() => {
    const user = storageService.getUser();
    if (!user) {
      setLocation("/");
      return;
    }

    let userProgress = storageService.getProgress();
    if (!userProgress) {
      userProgress = storageService.initializeProgress(user.id);
    }

    setProgress(userProgress);
    if (userProgress.robotConfig) {
      setRobotConfig(userProgress.robotConfig);
      setIsRobotBuilt(true);
    }
    if (userProgress.lastCommand) {
      setCommand(userProgress.lastCommand);
    }
  }, [setLocation]);

  function handleBuildRobot() {
    storageService.updateRobotConfig(robotConfig);
    setIsRobotBuilt(true);
    setFeedback({
      type: "success",
      message: `Робот успешно собран! Конфигурация: ${robotConfig.motors} мотор(ов), датчик ${getSensorName(robotConfig.sensor)}, контроллер ${robotConfig.microcontroller.toUpperCase()}.`,
    });
    toast({
      title: "Робот собран!",
      description: "Теперь можно программировать команды.",
    });
  }

  function handleUpdateCommand() {
    storageService.updateCommand(command);
    setFeedback({
      type: "info",
      message: "Команда обновлена. Нажмите 'Запустить симуляцию' для тестирования.",
    });
  }

  function handleSuccess() {
    if (!progress) return;

    const level = getLevelById(selectedLevel, progress.completedLevels);
    if (!level.completed) {
      storageService.completeLevel(selectedLevel, level.pointsReward);
      const updatedProgress = storageService.getProgress();
      setProgress(updatedProgress);

      setFeedback({
        type: "success",
        message: `🎉 Уровень пройден! Вы получили ${level.pointsReward} баллов!`,
      });

      toast({
        title: "Поздравляем!",
        description: `Вы успешно прошли уровень "${level.title}" и заработали ${level.pointsReward} баллов!`,
      });
    }
  }

  function handleFailure(message: string) {
    setFeedback({
      type: "error",
      message: `❌ ${message}`,
    });
  }

  function getSensorName(sensor: SensorType): string {
    const names = {
      none: "нет",
      line: "линия",
      ultrasonic: "ультразвуковой",
    };
    return names[sensor];
  }

  function generateArduinoCode(): string {
    const code = `
// Автоматически сгенерированный код для Arduino
// Конфигурация робота

#define MOTOR_COUNT ${robotConfig.motors}
#define SENSOR_TYPE "${robotConfig.sensor.toUpperCase()}"
#define CONTROLLER "${robotConfig.microcontroller.toUpperCase()}"

// Настройки движения
int speed = ${command.speed};
int direction = ${command.direction};
int duration = ${command.duration};

void setup() {
  Serial.begin(9600);
  pinMode(9, OUTPUT);  // Мотор 1
  ${robotConfig.motors === 2 ? 'pinMode(10, OUTPUT); // Мотор 2' : ''}
  ${robotConfig.sensor !== "none" ? `pinMode(A0, INPUT);  // Датчик ${robotConfig.sensor}` : ''}
}

void loop() {
  // Основная логика движения
  analogWrite(9, speed * 25);
  ${robotConfig.motors === 2 ? 'analogWrite(10, speed * 25);' : ''}
  
  ${robotConfig.sensor !== "none" ? `
  // Чтение датчика
  int sensorValue = analogRead(A0);
  if (sensorValue > 500) {
    // Обнаружено препятствие - корректировка курса
    analogWrite(9, speed * 15);
  }` : ''}
  
  delay(duration);
  
  // Остановка
  analogWrite(9, 0);
  ${robotConfig.motors === 2 ? 'analogWrite(10, 0);' : ''}
  delay(1000);
}
`;
    return code.trim();
  }

  function handleExportCode() {
    const code = generateArduinoCode();
    navigator.clipboard.writeText(code);
    toast({
      title: "Код скопирован!",
      description: "Arduino-код скопирован в буфер обмена.",
    });
  }

  function handleLogout() {
    storageService.clearUser();
    setLocation("/");
  }

  if (!progress) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  const levels = [1, 2, 3].map(id => getLevelById(id as LevelId, progress.completedLevels));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">РобоКвест</h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {levels.map(level => (
                  <div
                    key={level.id}
                    className="flex flex-col items-center gap-1"
                    data-testid={`badge-level-${level.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      level.completed 
                        ? "bg-chart-2 border-chart-2 text-white" 
                        : level.unlocked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {level.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : level.unlocked ? (
                        <Circle className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{level.id}</span>
                  </div>
                ))}
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-2 bg-chart-3/10 px-4 py-2 rounded-lg">
                <Trophy className="w-5 h-5 text-chart-3" />
                <span className="text-lg font-semibold" data-testid="text-points">
                  {progress.points}
                </span>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Конструктор робота
                </CardTitle>
                <CardDescription>Соберите робота из доступных компонентов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motors">Количество моторов</Label>
                  <Select
                    value={String(robotConfig.motors)}
                    onValueChange={(value) => setRobotConfig({ ...robotConfig, motors: Number(value) as MotorCount })}
                    disabled={isRobotBuilt}
                  >
                    <SelectTrigger id="motors" data-testid="select-motors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 мотор</SelectItem>
                      <SelectItem value="2">2 мотора</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensor">Тип датчика</Label>
                  <Select
                    value={robotConfig.sensor}
                    onValueChange={(value) => setRobotConfig({ ...robotConfig, sensor: value as SensorType })}
                    disabled={isRobotBuilt}
                  >
                    <SelectTrigger id="sensor" data-testid="select-sensor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Нет датчика</SelectItem>
                      <SelectItem value="line">Датчик линии</SelectItem>
                      <SelectItem value="ultrasonic">Ультразвуковой</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="microcontroller">Микроконтроллер</Label>
                  <Select
                    value={robotConfig.microcontroller}
                    onValueChange={(value) => setRobotConfig({ ...robotConfig, microcontroller: value as MicrocontrollerType })}
                    disabled={isRobotBuilt}
                  >
                    <SelectTrigger id="microcontroller" data-testid="select-microcontroller">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arduino">Arduino</SelectItem>
                      <SelectItem value="lego">Lego Mindstorms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isRobotBuilt ? (
                  <Button 
                    onClick={handleBuildRobot} 
                    className="w-full"
                    data-testid="button-build-robot"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Собрать робота
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsRobotBuilt(false)} 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-rebuild-robot"
                  >
                    Изменить конфигурацию
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Программирование
                </CardTitle>
                <CardDescription>Задайте команды для робота</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="speed">Скорость (1-10)</Label>
                  <Input
                    id="speed"
                    type="number"
                    min="1"
                    max="10"
                    value={command.speed}
                    onChange={(e) => setCommand({ ...command, speed: Number(e.target.value) })}
                    disabled={!isRobotBuilt}
                    data-testid="input-speed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction">Направление (градусы, 0-359)</Label>
                  <Input
                    id="direction"
                    type="number"
                    min="0"
                    max="359"
                    value={command.direction}
                    onChange={(e) => setCommand({ ...command, direction: Number(e.target.value) })}
                    disabled={!isRobotBuilt}
                    data-testid="input-direction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Длительность (мс)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1000"
                    max="30000"
                    step="1000"
                    value={command.duration}
                    onChange={(e) => setCommand({ ...command, duration: Number(e.target.value) })}
                    disabled={!isRobotBuilt}
                    data-testid="input-duration"
                  />
                </div>

                <Button 
                  onClick={handleUpdateCommand} 
                  className="w-full" 
                  disabled={!isRobotBuilt}
                  data-testid="button-update-command"
                >
                  Обновить команду
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Экспорт кода
                </CardTitle>
                <CardDescription>Скопируйте код для Arduino</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={generateArduinoCode()}
                  readOnly
                  className="font-mono text-xs h-32 resize-none"
                  data-testid="textarea-arduino-code"
                />
                <Button 
                  onClick={handleExportCode} 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-export-code"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Копировать код
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Физическая симуляция</CardTitle>
                <CardDescription>Тестируйте робота в виртуальной среде</CardDescription>
              </CardHeader>
              <CardContent>
                {isRobotBuilt ? (
                  <PhysicsSimulator
                    robotConfig={robotConfig}
                    command={command}
                    levelId={selectedLevel}
                    onSuccess={handleSuccess}
                    onFailure={handleFailure}
                  />
                ) : (
                  <Alert data-testid="alert-robot-not-built">
                    <AlertDescription data-testid="text-build-robot-first">
                      Сначала соберите робота в конструкторе слева
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {feedback && (
              <Alert 
                variant={feedback.type === "error" ? "destructive" : "default"}
                data-testid={`alert-${feedback.type}`}
              >
                <AlertTitle data-testid="alert-title">
                  {feedback.type === "success" ? "Успех!" : feedback.type === "error" ? "Ошибка" : "Информация"}
                </AlertTitle>
                <AlertDescription data-testid="alert-description">{feedback.message}</AlertDescription>
              </Alert>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">Уровни заданий</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {levels.map(level => (
                  <Card 
                    key={level.id} 
                    className={`${!level.unlocked ? "opacity-50" : "hover-elevate"} ${selectedLevel === level.id ? "ring-2 ring-primary" : ""}`}
                    data-testid={`card-level-${level.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={level.completed ? "default" : level.unlocked ? "outline" : "secondary"}>
                          {level.difficulty === "easy" ? "Легко" : level.difficulty === "medium" ? "Средне" : "Сложно"}
                        </Badge>
                        {level.completed && <CheckCircle className="w-5 h-5 text-chart-2" />}
                        {!level.unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <CardTitle className="text-lg">{level.title}</CardTitle>
                      <CardDescription className="text-sm">{level.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{level.objective}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-chart-3">
                          <Trophy className="w-4 h-4" />
                          <span>+{level.pointsReward}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedLevel(level.id)}
                          disabled={!level.unlocked}
                          variant={selectedLevel === level.id ? "default" : "outline"}
                          data-testid={`button-select-level-${level.id}`}
                        >
                          {selectedLevel === level.id ? "Выбран" : "Выбрать"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
