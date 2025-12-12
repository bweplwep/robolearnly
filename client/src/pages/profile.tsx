import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Trophy, 
  Star, 
  Calendar, 
  Target, 
  Award, 
  Zap, 
  Clock, 
  TrendingUp,
  BookOpen,
  CheckCircle,
  Calculator,
  Atom,
  Bot,
  Settings,
  LogOut,
  Home,
  Brain,
  Rocket,
  Cpu,
  CircuitBoard,
  Microchip
} from "lucide-react";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

// Типы для статистики
interface UserStats {
  totalPoints: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  level: number;
  streak: number;
  lastActive: string;
}

interface DisciplineProgress {
  id: string;
  name: string;
  completed: number;
  total: number;
  points: number;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  bgColor: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  date?: string;
  color: string;
  gradient: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    completedTasks: 0,
    totalTasks: 40,
    completionRate: 0,
    level: 1,
    streak: 0,
    lastActive: new Date().toLocaleDateString('ru-RU')
  });
  
  const [disciplineProgress, setDisciplineProgress] = useState<DisciplineProgress[]>([
    {
      id: "math",
      name: "Математика",
      completed: 0,
      total: 20,
      points: 0,
      icon: Calculator,
      color: "text-blue-400",
      gradient: "from-blue-600 to-cyan-500",
      bgColor: "bg-gradient-to-r from-blue-600/20 to-cyan-500/10"
    },
    {
      id: "physics",
      name: "Физика",
      completed: 0,
      total: 15,
      points: 0,
      icon: Atom,
      color: "text-green-400",
      gradient: "from-green-600 to-emerald-500",
      bgColor: "bg-gradient-to-r from-green-600/20 to-emerald-500/10"
    },
    {
      id: "coding",
      name: "Программирование",
      completed: 0,
      total: 5,
      points: 0,
      icon: Bot,
      color: "text-purple-400",
      gradient: "from-purple-600 to-pink-500",
      bgColor: "bg-gradient-to-r from-purple-600/20 to-pink-500/10"
    }
  ]);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_steps",
      title: "Первые шаги",
      description: "Выполните первую задачу",
      icon: Target,
      unlocked: false,
      color: "text-blue-400",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "math_master",
      title: "Мастер математики",
      description: "Завершите все задачи по математике",
      icon: Calculator,
      unlocked: false,
      color: "text-blue-500",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: "physics_wizard",
      title: "Волшебник физики",
      description: "Завершите все задачи по физике",
      icon: Atom,
      unlocked: false,
      color: "text-green-500",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: "code_ninja",
      title: "Ниндзя кода",
      description: "Завершите все задачи по программированию",
      icon: Bot,
      unlocked: false,
      color: "text-purple-500",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      id: "week_streak",
      title: "Неделя прогресса",
      description: "Занимайтесь 7 дней подряд",
      icon: TrendingUp,
      unlocked: false,
      color: "text-yellow-500",
      gradient: "from-yellow-600 to-orange-500"
    },
    {
      id: "point_master",
      title: "Мастер баллов",
      description: "Наберите 500 баллов",
      icon: Trophy,
      unlocked: false,
      color: "text-yellow-400",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      id: "speed_learner",
      title: "Скоростное обучение",
      description: "Завершите 3 задачи за один день",
      icon: Zap,
      unlocked: false,
      color: "text-red-400",
      gradient: "from-red-500 to-orange-500"
    },
    {
      id: "complete_course",
      title: "Завершение курса",
      description: "Завершите все дисциплины",
      icon: Award,
      unlocked: false,
      color: "text-cyan-300",
      gradient: "from-cyan-500 to-blue-500"
    }
  ]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Получаем текущего пользователя
    const currentUser = storageService.getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
      
      // Загружаем прогресс пользователя
      const progress = storageService.getUserProgress(currentUser.id);
      if (progress) {
        // Считаем статистику
        const completedTasks = (progress.math?.completed || 0) + 
                               (progress.physics?.completed || 0) + 
                               (progress.coding?.completed || 0);
        
        const totalPoints = (progress.math?.points || 0) + 
                           (progress.physics?.points || 0) + 
                           (progress.coding?.points || 0);
        
        const completionRate = Math.round((completedTasks / 40) * 100);
        const level = Math.floor(totalPoints / 100) + 1;
        
        setStats({
          totalPoints,
          completedTasks,
          totalTasks: 40,
          completionRate,
          level,
          streak: progress.streak || 0,
          lastActive: new Date().toLocaleDateString('ru-RU')
        });
        
        // Обновляем прогресс по дисциплинам
        setDisciplineProgress(prev => prev.map(disc => ({
          ...disc,
          completed: progress[disc.id as keyof typeof progress]?.completed || 0,
          points: progress[disc.id as keyof typeof progress]?.points || 0
        })));
        
        // Проверяем достижения
        checkAchievements(completedTasks, totalPoints, progress);
      }
    } else {
      // Если пользователь не найден, перенаправляем на главную
      toast({
        title: "Требуется вход",
        description: "Пожалуйста, войдите в систему для просмотра профиля",
        variant: "destructive"
      });
      setLocation("/");
    }
  };

  const checkAchievements = (completedTasks: number, totalPoints: number, progress: any) => {
    const updatedAchievements = achievements.map(ach => {
      let unlocked = ach.unlocked;
      
      switch (ach.id) {
        case "first_steps":
          unlocked = completedTasks > 0;
          break;
        case "math_master":
          unlocked = progress.math?.completed === 20;
          break;
        case "physics_wizard":
          unlocked = progress.physics?.completed === 15;
          break;
        case "code_ninja":
          unlocked = progress.coding?.completed === 5;
          break;
        case "week_streak":
          unlocked = false; // Можно добавить логику для отслеживания
          break;
        case "point_master":
          unlocked = totalPoints >= 500;
          break;
        case "speed_learner":
          unlocked = false; // Можно добавить логику для отслеживания
          break;
        case "complete_course":
          unlocked = progress.math?.completed === 20 && 
                     progress.physics?.completed === 15 && 
                     progress.coding?.completed === 5;
          break;
      }
      
      return { 
        ...ach, 
        unlocked,
        date: unlocked ? new Date().toLocaleDateString('ru-RU') : undefined
      };
    });
    
    setAchievements(updatedAchievements);
  };

  const handleLogout = () => {
    storageService.clearCurrentUser();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы"
    });
    setLocation("/");
  };

  const handleDisciplineClick = (disciplineId: string) => {
    if (disciplineId === "math") {
      setLocation("/math-tasks");
    } else if (disciplineId === "physics") {
      setLocation("/physics-tasks");
    } else if (disciplineId === "coding") {
      setLocation("/game?discipline=robotics");
    }
  };

  const getLevelProgress = () => {
    return (stats.totalPoints % 100);
  };

  const getNextLevelPoints = () => {
    return 100 - (stats.totalPoints % 100);
  };

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-200">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

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
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 z-0" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLocation("/")}
                className="hover:bg-blue-500/20"
              >
                <Home className="w-5 h-5 text-cyan-300" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <User className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Профиль</h1>
                  <p className="text-sm text-cyan-200">Ваш прогресс в RoboLearnly</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => setLocation("/disciplines")}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                К обучению
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Profile Card */}
              <Card className="bg-gray-900/70 backdrop-blur-md border-cyan-500/20 hover-elevate">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Ваш профиль</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-500/20"
                      onClick={() => toast({
                        title: "Настройки",
                        description: "Раздел настроек в разработке"
                      })}
                    >
                      <Settings className="w-4 h-4 text-cyan-300" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-cyan-500/30">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-2xl">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
                    <p className="text-cyan-200 text-sm mb-4">{user.email}</p>
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-none">
                      <Trophy className="w-3 h-3 mr-1" />
                      Уровень {stats.level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Дата регистрации
                      </span>
                      <span className="text-cyan-300">Сегодня</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Последний вход
                      </span>
                      <span className="text-cyan-300">Сегодня</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Серия активности
                      </span>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">{stats.streak} дней</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level Progress */}
              <Card className="bg-gray-900/70 backdrop-blur-md border-cyan-500/20 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-cyan-400" />
                    Прогресс уровня
                  </CardTitle>
                  <CardDescription className="text-cyan-200">
                    До следующего уровня: {getNextLevelPoints()} баллов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Уровень {stats.level}</span>
                      <span className="text-cyan-300">{getLevelProgress()}/100 баллов</span>
                    </div>
                    <Progress 
                      value={getLevelProgress()} 
                      className="h-2 bg-gray-800"
                    />
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/30" />
                      <span className="text-yellow-300">{stats.totalPoints} всего баллов</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-md border-cyan-500/20 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Быстрая статистика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-200">Достижения</span>
                      <span className="text-white font-bold">
                        {unlockedAchievements}/{totalAchievements}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-200">Задачи выполнено</span>
                      <span className="text-white font-bold">
                        {stats.completedTasks}/{stats.totalTasks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-200">Процент завершения</span>
                      <span className="text-white font-bold">{stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-200">Средний балл</span>
                      <span className="text-white font-bold">
                        {stats.completedTasks > 0 
                          ? Math.round(stats.totalPoints / stats.completedTasks) 
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/70 backdrop-blur-sm mb-6">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Обзор
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Достижения
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Discipline Progress */}
                  <Card className="bg-gray-900/70 backdrop-blur-md border-cyan-500/20 hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CircuitBoard className="w-5 h-5 text-cyan-400" />
                        Прогресс по дисциплинам
                      </CardTitle>
                      <CardDescription className="text-cyan-200">
                        Продолжайте обучение, чтобы разблокировать новые возможности
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {disciplineProgress.map((discipline) => {
                          const progressPercent = (discipline.completed / discipline.total) * 100;
                          const Icon = discipline.icon;
                          
                          return (
                            <div 
                              key={discipline.id}
                              className={`p-4 rounded-lg border border-gray-700 hover:border-cyan-500/40 cursor-pointer transition-all duration-300 hover:bg-gray-800/30 ${discipline.bgColor}`}
                              onClick={() => handleDisciplineClick(discipline.id)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg ${discipline.bgColor} flex items-center justify-center border border-cyan-500/30`}>
                                    <Icon className={`w-5 h-5 ${discipline.color}`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white">{discipline.name}</h4>
                                    <p className="text-sm text-cyan-200">{discipline.points} баллов</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                                  {discipline.completed}/{discipline.total}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">
                                    Прогресс: {progressPercent.toFixed(0)}%
                                  </span>
                                  <span className="text-cyan-300">
                                    {discipline.completed} из {discipline.total} задач
                                  </span>
                                </div>
                                <Progress 
                                  value={progressPercent} 
                                  className="h-2 bg-gray-800"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full h-8 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                >
                                  {discipline.completed === discipline.total ? (
                                    <>🎉 Все задачи выполнены!</>
                                  ) : discipline.completed > 0 ? (
                                    <>Продолжить обучение →</>
                                  ) : (
                                    <>Начать обучение →</>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-md border-cyan-500/20 hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Microchip className="w-5 h-5 text-cyan-400" />
                        Что дальше?
                      </CardTitle>
                      <CardDescription className="text-cyan-200">
                        Рекомендации для вашего прогресса
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {disciplineProgress
                          .filter(d => d.completed < d.total)
                          .slice(0, 2)
                          .map((discipline) => (
                            <div key={discipline.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${discipline.bgColor} flex items-center justify-center`}>
                                  <discipline.icon className={`w-4 h-4 ${discipline.color}`} />
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    Продолжить {discipline.name.toLowerCase()}
                                  </p>
                                  <p className="text-cyan-200 text-xs">
                                    Осталось {discipline.total - discipline.completed} задач
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                className={`bg-gradient-to-r ${discipline.gradient} text-white border-none`}
                                onClick={() => handleDisciplineClick(discipline.id)}
                              >
                                Продолжить
                              </Button>
                            </div>
                          ))}
                        
                        {disciplineProgress.every(d => d.completed === d.total) && (
                          <div className="text-center py-4">
                            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                            <h4 className="text-xl font-bold text-white mb-2">Поздравляем! 🎉</h4>
                            <p className="text-cyan-200 mb-4">
                              Вы завершили все дисциплины! Вы - настоящий мастер робототехники!
                            </p>
                            <Button 
                              className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white"
                              onClick={() => setLocation("/")}
                            >
                              <Rocket className="w-4 h-4 mr-2" />
                              Начать новый проект
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements">
                  <Card className="bg-gray-900/70 backdrop-blur-md border-cyan-500/20 hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        Ваши достижения
                      </CardTitle>
                      <CardDescription className="text-cyan-200">
                        {unlockedAchievements} из {totalAchievements} разблокировано
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Achievement Progress */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-200">Прогресс достижений</span>
                          <span className="text-white font-bold">
                            {Math.round((unlockedAchievements / totalAchievements) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(unlockedAchievements / totalAchievements) * 100} 
                          className="h-2 bg-gray-800"
                        />
                      </div>

                      {/* Achievements Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => {
                          const Icon = achievement.icon;
                          const isUnlocked = achievement.unlocked;
                          
                          return (
                            <div 
                              key={achievement.id}
                              className={`p-4 rounded-lg border transition-all duration-300 ${
                                isUnlocked 
                                  ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/30 hover:border-cyan-500/50' 
                                  : 'bg-gray-800/30 border-gray-700 hover:border-gray-600 opacity-70'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  isUnlocked
                                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30'
                                    : 'bg-gray-700/50 border border-gray-600'
                                }`}>
                                  <Icon className={`w-6 h-6 ${
                                    isUnlocked ? achievement.color : 'text-gray-500'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-semibold ${
                                      isUnlocked ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {achievement.title}
                                    </h4>
                                    {isUnlocked ? (
                                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Получено
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                                        Заблокировано
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={`text-sm ${
                                    isUnlocked ? 'text-cyan-200' : 'text-gray-500'
                                  }`}>
                                    {achievement.description}
                                  </p>
                                  {isUnlocked && achievement.date && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      Получено: {achievement.date}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-900/70 backdrop-blur-md border-cyan-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Недавняя активность
              </CardTitle>
              <CardDescription className="text-cyan-200">
                Ваши последние действия на платформе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Example activity items */}
                {disciplineProgress
                  .filter(d => d.completed > 0)
                  .map((discipline) => {
                    const Icon = discipline.icon;
                    const recentDate = new Date();
                    recentDate.setDate(recentDate.getDate() - discipline.completed % 3);
                    
                    return (
                      <div key={discipline.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                        <div className={`w-10 h-10 rounded-lg ${discipline.bgColor} flex items-center justify-center border border-cyan-500/30`}>
                          <Icon className={`w-5 h-5 ${discipline.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            Выполнены задачи по {discipline.name.toLowerCase()}
                          </p>
                          <p className="text-cyan-200 text-xs">
                            +{discipline.points} баллов • {discipline.completed} задач завершено
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">
                            {recentDate.toLocaleDateString('ru-RU')}
                          </p>
                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-none text-xs">
                            +{Math.floor(discipline.points / discipline.completed || 0)} баллов/задачу
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                
                {stats.completedTasks === 0 && (
                  <div className="text-center py-6">
                    <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Активность отсутствует</p>
                    <p className="text-gray-500 text-sm mt-1">Начните обучение, чтобы увидеть здесь свою активность</p>
                    <Button 
                      className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                      onClick={() => setLocation("/disciplines")}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Начать обучение
                    </Button>
                  </div>
                )}
              </div>
              
              {stats.completedTasks > 0 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => toast({
                      title: "История активности",
                      description: "Полная история активности в разработке"
                    })}
                  >
                    Показать всю историю
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}