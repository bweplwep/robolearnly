import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Bot, Code, Trophy, Cpu, Zap, Target } from "lucide-react";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showRegister, setShowRegister] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: RegisterUser) {
    try {
      const user = {
        id: crypto.randomUUID(),
        username: data.username,
        email: data.email,
        password: data.password,
      };
      
      storageService.saveUser(user);
      storageService.initializeProgress(user.id);
      
      toast({
        title: "Добро пожаловать!",
        description: `Здравствуйте, ${data.username}! Начните свой путь в робототехнике.`,
      });
      
      setLocation("/game");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать аккаунт. Попробуйте ещё раз.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">РобоКвест</h1>
          </div>
          <Button 
            onClick={() => setShowRegister(true)} 
            size="lg"
            data-testid="button-register-header"
          >
            Начать обучение
          </Button>
        </header>

        <section className="mb-24 text-center max-w-4xl mx-auto">
          <div className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent leading-tight">
                РобоКвест — Твоя Виртуальная Лаборатория Робототехники
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Собирай роботов, программируй их и решай увлекательные задачи в игровой форме
              </p>
              <Button 
                onClick={() => setShowRegister(true)} 
                size="lg" 
                className="text-lg px-8 py-6"
                data-testid="button-start-main"
              >
                <Zap className="w-5 h-5 mr-2" />
                Начать путешествие
              </Button>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Что это?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                РобоКвест — виртуальная лаборатория по робототехнике для школьников и студентов. 
                Вы собираете роботов из деталей, программируете их и решаете задачи в игровой форме. 
                Никакого дорогого оборудования — только браузер и ваше воображение!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-chart-2" />
              </div>
              <CardTitle className="text-2xl">Как работает?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Выберите уровень сложности</li>
                  <li>Соберите робота из моторов, датчиков и контроллера</li>
                  <li>Запрограммируйте команды движения</li>
                  <li>Запустите физическую симуляцию</li>
                  <li>Получите обратную связь и советы</li>
                  <li>Разблокируйте новые уровни!</li>
                </ol>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-chart-3" />
              </div>
              <CardTitle className="text-2xl">Зачем нужен?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Доступное обучение без дорогого оборудования</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cpu className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Развивает навыки программирования и инженерии</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Мотивация через баллы и достижения</span>
                  </li>
                </ul>
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="text-center py-12">
          <h3 className="text-3xl font-bold mb-4">Готовы начать?</h3>
          <p className="text-muted-foreground mb-8">
            Присоединяйтесь к тысячам студентов, изучающих робототехнику через практику
          </p>
          <Button 
            onClick={() => setShowRegister(true)} 
            size="lg"
            data-testid="button-register-footer"
          >
            Зарегистрироваться сейчас
          </Button>
        </section>
      </div>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Регистрация</DialogTitle>
            <DialogDescription>
              Создайте аккаунт, чтобы сохранить свой прогресс и достижения
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ivanov_ivan" 
                        {...field} 
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="ivan@example.com" 
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                data-testid="button-submit-register"
              >
                Создать аккаунт
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
