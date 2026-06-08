import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, loginUserSchema, type RegisterUser, type LoginUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Bot, Code, Trophy, Cpu, Zap, Target, CircuitBoard, Microchip, CpuIcon } from "lucide-react";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleAnimatedBackground from "@/components/SimpleAnimatedBackground";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const { toast } = useToast();
  
  // Добавляем лог для отладки
  useEffect(() => {
    console.log('Landing компонент загружен');
    console.log('Canvas доступен:', !!document.createElement('canvas').getContext);
  }, []);

  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onRegisterSubmit(data: RegisterUser) {
    try {
      const user = {
        id: crypto.randomUUID(),
        username: data.username,
        email: data.email,
        password: data.password,
      };
      
      storageService.saveUser(user);
      storageService.setCurrentUser(user.id);
      storageService.initializeProgress(user.id);
      
      toast({
        title: "Добро пожаловать!",
        description: `Здравствуйте, ${data.username}! Начните свой путь в робототехнике.`,
      });
      
      registerForm.reset();
      loginForm.reset();
      setShowAuth(false);
      setLocation("/disciplines");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать аккаунт. Попробуйте ещё раз.",
        variant: "destructive",
      });
    }
  }

  function onLoginSubmit(data: LoginUser) {
    try {
      const user = storageService.getUserByEmail(data.email);
      
      if (!user) {
        toast({
          title: "Ошибка",
          description: "Пользователь с таким email не найден",
          variant: "destructive",
        });
        return;
      }
      
      if (user.password !== data.password) {
        toast({
          title: "Ошибка",
          description: "Неверный пароль",
          variant: "destructive",
        });
        return;
      }
      
      storageService.setCurrentUser(user.id);
      const progress = storageService.getProgressForUser(user.id);
      if (!progress) {
        storageService.initializeProgress(user.id);
      }
      
      toast({
        title: "С возвращением!",
        description: `Рады снова видеть вас, ${user.username}!`,
      });
      
      loginForm.reset();
      registerForm.reset();
      setShowAuth(false);
      setLocation("/disciplines");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось войти в аккаунт. Попробуйте ещё раз.",
        variant: "destructive",
      });
    }
  }

  const openAuthDialog = (mode: "register" | "login" = "register") => {
    setAuthMode(mode);
    
    if (mode === "register") {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
    
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* Простая анимация */}
      <SimpleAnimatedBackground />
      
      {/* Темный оверлей для читаемости */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-blue-900/60 to-gray-900/80" />
      
      {/* Основной контент */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                <CircuitBoard className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">RoboLearnly</h1>
            </div>
            <Button 
              onClick={() => openAuthDialog("register")} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg"
            >
              Начать обучение
            </Button>
          </header>

          <section className="mb-24 text-center max-w-4xl mx-auto">
            <div className="relative py-16">
              <div className="relative">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-tight drop-shadow-lg">
                  Виртуальная лаборатория робототехники
                </h2>
                <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto font-medium drop-shadow">
                  Собирайте схемы, программируйте микроконтроллеры и создавайте роботов будущего
                </p>
                <Button 
                  onClick={() => openAuthDialog("register")} 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-xl"
                >
                  <Microchip className="w-5 h-5 mr-2" />
                  Начать проект
                </Button>
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            <Card className="bg-gray-900/70 backdrop-blur-sm border-blue-500/30">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-400/30 flex items-center justify-center mb-4">
                  <CircuitBoard className="w-8 h-8 text-cyan-300" />
                </div>
                <CardTitle className="text-2xl text-white">Что это?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed text-gray-200">
                  RoboLearnly — цифровая лаборатория электроники и робототехники. 
                  Создавайте виртуальные схемы, программируйте микроконтроллеры 
                  и тестируйте роботов в реалистичной симуляции.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/70 backdrop-blur-sm border-blue-500/30">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-400/30 flex items-center justify-center mb-4">
                  <Code className="w-8 h-8 text-cyan-300" />
                </div>
                <CardTitle className="text-2xl text-white">Как работает?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed text-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-300 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Выберите дисциплину</h4>
                        <p className="text-sm text-gray-300">Математика, Физика или Программирование</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-300 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Изучите теорию</h4>
                        <p className="text-sm text-gray-300">Визуализации и пошаговые объяснения</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-300 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Решайте задачи</h4>
                        <p className="text-sm text-gray-300">Применяйте знания на практике</p>
                      </div>
                    </div>
                  </div>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/70 backdrop-blur-sm border-blue-500/30">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-400/30 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-cyan-300" />
                </div>
                <CardTitle className="text-2xl text-white">Преимущества</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed text-gray-200">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Безопасное обучение без риска</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CpuIcon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Реалистичная симуляция</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Геймификация обучения</span>
                    </li>
                  </ul>
                </CardDescription>
              </CardContent>
            </Card>
          </section>

          <section className="text-center py-16 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-3xl backdrop-blur-sm border border-blue-500/30 mb-8">
            <h3 className="text-3xl font-bold mb-4 text-white">Создайте первый проект</h3>
            <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к сообществу инженеров и робототехников
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => openAuthDialog("register")} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg"
              >
                Зарегистрироваться
              </Button>
              <Button 
                onClick={() => openAuthDialog("login")} 
                size="lg"
                variant="outline"
                className="border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
              >
                Войти в аккаунт
              </Button>
            </div>
          </section>

          {/* Подсказка про анимацию */}
          <div className="text-center text-sm text-gray-400 mt-8 pb-4">
            <p>Проведите мышью по экрану, чтобы увидеть интерактивную анимацию!</p>
          </div>
        </div>
      </div>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-md border-blue-500/40">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-white">
              {authMode === "register" ? "Создание аккаунта" : "Вход в систему"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              {authMode === "register" 
                ? "Начните проектировать электронные схемы" 
                : "Войдите, чтобы продолжить работу"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "register" | "login")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/90">
              <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                Регистрация
              </TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                Вход
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Имя пользователя</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ivanov_ivan" 
                            {...field} 
                            className="bg-gray-800/90 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="ivan@example.com" 
                            {...field} 
                            className="bg-gray-800/90 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Пароль</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-gray-800/90 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white" 
                    size="lg"
                  >
                    Создать аккаунт
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="ivan@example.com" 
                            {...field} 
                            className="bg-gray-800/90 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Пароль</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-gray-800/90 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white" 
                    size="lg"
                  >
                    Войти в систему
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          

        </DialogContent>
      </Dialog>
    </div>
  );
}