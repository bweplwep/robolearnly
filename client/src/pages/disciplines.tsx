import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Atom, 
  Bot, 
  ArrowRight, 
  Star, 
  Zap, 
  Target, 
  Clock, 
  Cpu, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  User, // Добавляем импорт User
  Trophy, // Добавляем для отображения баллов
  Brain // Для прогресса
} from "lucide-react";
import { storageService } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";

export default function Disciplines() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [disciplineProgress, setDisciplineProgress] = useState<any[]>([]);

  useEffect(() => {
    // Загружаем данные пользователя
    const currentUser = storageService.getUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Загружаем статистику
      const stats = storageService.getUserStats(currentUser.id);
      setUserStats(stats);
      
      // Загружаем прогресс по дисциплинам
      const progress = storageService.getDisciplineProgress(currentUser.id);
      setDisciplineProgress(progress);
    }
  }, []);

  const disciplines = [
    {
      id: "math",
      title: "Математика для роботов",
      description: "Геометрия, скорость и тригонометрия для точной навигации и расчетов траекторий движения роботов",
      icon: Calculator,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/5",
      iconColor: "text-blue-400",
      features: [
        "Расчет скорости и времени движения",
        "Тригонометрия для навигации",
        "Геометрические построения",
        "Оптимизация маршрутов"
      ],
      level: "Начальный",
      tasks: "20 практических задач",
      time: "1-2 часа",
      maxPoints: 650
    },
    {
      id: "physics", 
      title: "Физика роботов",
      description: "Механика, электричество и энергетика - физические основы работы двигателей, датчиков и систем питания",
      icon: Atom,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/5", 
      iconColor: "text-green-400",
      features: [
        "Законы Ньютона и движение",
        "Электрические цепи и мощность",
        "Силы трения и сопротивление",
        "Энергия и КПД систем"
      ],
      level: "Средний",
      tasks: "15 интерактивных экспериментов",
      time: "2-3 часа",
      maxPoints: 300
    },
    {
      id: "coding",
      title: "Программирование роботов",
      description: "Практическое кодирование: от управления батареей до сложных алгоритмов анализа данных сенсоров",
      icon: Bot,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/5",
      iconColor: "text-purple-400",
      features: [
        "Управление энергией и зарядкой",
        "Алгоритмы патрулирования",
        "Обработка данных датчиков",
        "Функции автономной навигации"
      ],
      level: "Продвинутый",
      tasks: "5 проектов на Python",
      time: "3-4 часа",
      maxPoints: 120
    }
  ];

  const handleDisciplineSelect = (disciplineId: string) => {
    if (disciplineId === "math") {
      setLocation("/math-tasks");
    } else if (disciplineId === "physics") {
      setLocation("/physics-tasks");
    } else if (disciplineId === "coding") {
      setLocation("/game?discipline=robotics");
    }
  };

  // Функция для получения прогресса по дисциплине
  const getDisciplineProgress = (disciplineId: string) => {
    const progress = disciplineProgress.find(d => d.id === disciplineId);
    return progress || { completed: 0, total: 0, points: 0, progress: 0 };
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Более темный оверлей для лучшей читаемости */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-900/80 z-0" />
      
      {/* Основной контент поверх фона */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-500/30">
                  <Bot className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">RoboLearnly</h1>
                  <p className="text-sm text-cyan-200">Образовательная платформа</p>
                </div>
              </div>
              
              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-cyan-500/20">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-medium">
                      {userStats?.totalPoints || 0} баллов
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation("/profile")}
                    className="text-cyan-300 hover:text-white hover:bg-cyan-500/20 border border-cyan-500/30"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Профиль
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                Выберите дисциплину
              </h1>
              <p className="text-xl text-cyan-100 max-w-2xl mx-auto font-medium">
                Постройте путь от фундаментальной математики до продвинутого программирования роботов
              </p>
              
              {userStats && (
                <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/20">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-200">Уровень {userStats.level}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-300">Прогресс: {userStats.completionRate}%</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300">Активность: {userStats.streak} дней</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Learning Path Visualization */}
          <div className="max-w-6xl mx-auto mb-16">
            <Card className="bg-gray-900/60 backdrop-blur-md border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  Путь обучения в робототехнике
                </CardTitle>
                <CardDescription className="text-cyan-100">
                  Пройдите все три уровня, чтобы стать экспертом в робототехнике
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Learning Path Timeline */}
                  <div className="relative">
                    {/* Main timeline line */}
                    <div className="absolute left-0 right-0 top-6 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 z-0"></div>
                    
                    {/* Steps */}
                    <div className="grid grid-cols-3 gap-4 relative z-10">
                      {disciplines.map((discipline, index) => {
                        const progress = getDisciplineProgress(discipline.id);
                        return (
                          <div key={discipline.id} className="text-center">
                            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                              index === 0 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                              index === 1 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                              "bg-gradient-to-r from-purple-500 to-pink-500"
                            }`}>
                              <discipline.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-white text-sm mb-1">{discipline.title.split(" ")[0]}</h3>
                            <div className="flex items-center justify-center gap-1 text-xs text-cyan-200">
                              <Star className="w-3 h-3" />
                              <span>{discipline.level}</span>
                            </div>
                            {progress.progress > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-300 mb-1">
                                  {progress.completed}/{progress.total} задач
                                </div>
                                <Progress 
                                  value={progress.progress} 
                                  className="h-1.5 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-500"
                                />
                              </div>
                            )}
                            {index < disciplines.length - 1 && (
                              <ArrowRight className="w-5 h-5 text-blue-400 mx-auto mt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Path Description */}
                  <div className="bg-gradient-to-r from-blue-900/30 via-green-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-center text-cyan-100">
                      <strong>Рекомендуемый путь:</strong> Начните с математики, затем изучите физику, 
                      и завершите программированием. Каждая дисциплина строится на знаниях предыдущей.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disciplines grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {disciplines.map((discipline) => {
              const progress = getDisciplineProgress(discipline.id);
              const isStarted = progress.completed > 0;
              const isCompleted = progress.completed === progress.total;
              
              return (
                <Card 
                  key={discipline.id} 
                  className="hover-elevate group cursor-pointer bg-gray-900/70 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02] relative"
                  onClick={() => handleDisciplineSelect(discipline.id)}
                >
                  {/* Индикатор прогресса */}
                  {progress.progress > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <div className="w-10 h-10">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="rgba(59, 130, 246, 0.3)"
                              strokeWidth="2"
                              strokeDasharray="100, 100"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="rgb(34, 211, 238)"
                              strokeWidth="2"
                              strokeDasharray={`${progress.progress}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-300">
                              {progress.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Значок завершения */}
                  {isCompleted && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl ${discipline.bgColor} flex items-center justify-center border ${discipline.iconColor.replace('text-', 'border-')}/20`}>
                        <discipline.icon className={`w-7 h-7 ${discipline.iconColor}`} />
                      </div>
                      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 px-3 py-1 rounded-full border border-blue-500/20">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400/30" />
                        <span className="text-xs font-medium text-yellow-300">{discipline.level}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl flex items-center gap-2 text-white">
                      {discipline.title}
                      <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-2 transition-all duration-300" />
                    </CardTitle>
                    <CardDescription className="text-cyan-100 leading-relaxed">
                      {discipline.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {discipline.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Progress Bar */}
                    {progress.completed > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-cyan-300">Прогресс</span>
                          <span className="text-cyan-300">
                            {progress.completed}/{progress.total} задач • {progress.points} баллов
                          </span>
                        </div>
                        <Progress 
                          value={progress.progress} 
                          className="h-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-500"
                        />
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex items-center justify-between mb-6 text-sm">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <BookOpen className="w-4 h-4" />
                        <span>{discipline.tasks}</span>
                      </div>
                      <div className="flex items-center gap-2 text-cyan-300">
                        <Clock className="w-4 h-4" />
                        <span>{discipline.time}</span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full bg-gradient-to-r ${discipline.color} hover:opacity-90 text-white shadow-lg`}
                      size="lg"
                    >
                      {isCompleted ? (
                        <>
                          <Star className="w-4 h-4 mr-2 fill-white" />
                          Завершено
                        </>
                      ) : isStarted ? (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Продолжить
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Начать обучение
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Общая статистика */}
          {userStats && userStats.completedTasks > 0 && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-md border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Ваш общий прогресс
                  </CardTitle>
                  <CardDescription className="text-cyan-200">
                    Продолжайте в том же духе!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-blue-500/20">
                      <div className="text-2xl font-bold text-white mb-1">{userStats.totalPoints}</div>
                      <div className="text-sm text-cyan-300">Всего баллов</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-green-500/20">
                      <div className="text-2xl font-bold text-white mb-1">{userStats.completedTasks}/{userStats.totalTasks}</div>
                      <div className="text-sm text-green-300">Задач выполнено</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-yellow-500/20">
                      <div className="text-2xl font-bold text-white mb-1">{userStats.completionRate}%</div>
                      <div className="text-sm text-yellow-300">Процент завершения</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-purple-500/20">
                      <div className="text-2xl font-bold text-white mb-1">{userStats.level}</div>
                      <div className="text-sm text-purple-300">Уровень</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional info - MODERN CARD */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-white to-gray-50 p-10 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-gray-800 mb-2">Не знаете с чего начать?</h3>
                  <p className="text-gray-600 text-lg">
                    Мы поможем вам построить оптимальный путь обучения
                  </p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md"
                  onClick={() => setLocation("/math-tasks")}
                >
                  Начать с математики
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-lg text-blue-800 mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Этап 1: Математика
                  </h4>
                  <p className="text-blue-700">
                    <strong className="text-blue-800">Основа всех расчетов.</strong> Изучите геометрию, тригонометрию и скорость для точного управления роботами. Без математики невозможно понять, как робот движется и ориентируется в пространстве.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <h4 className="font-semibold text-lg text-green-800 mb-3 flex items-center gap-2">
                    <Atom className="w-5 h-5" />
                    Этап 2: Физика
                  </h4>
                  <p className="text-green-700">
                    <strong className="text-green-800">Физические законы работы.</strong> Узнайте о механике, электричестве и энергетике. Поймите, как двигатели, датчики и системы питания позволяют роботу взаимодействовать с реальным миром.
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <h4 className="font-semibold text-lg text-purple-800 mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Этап 3: Программирование
                  </h4>
                  <p className="text-purple-700">
                    <strong className="text-purple-800">Интеллектуальное управление.</strong> Научитесь создавать алгоритмы для автономной работы роботов. От управления батареей до анализа данных сенсоров и сложной навигации.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 p-6 rounded-xl border border-gray-200">
                  <p className="text-gray-700 text-center font-medium">
                    <span className="text-blue-600">Математика</span> → <span className="text-green-600">Физика</span> → <span className="text-purple-600">Программирование</span> — это последовательный путь к мастерству в робототехнике!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}