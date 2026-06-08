import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Game from "@/pages/game";
import NotFound from "@/pages/not-found";
import Disciplines from "@/pages/disciplines";      // ← disciplines (маленькая d)
import MathTasks from "@/pages/MathTasks";
import PhysicsTasks from "@/pages/PhysicsTasks";
import Profile from "@/pages/profile";              // ← profile (маленькая p)

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/disciplines" component={Disciplines} />
      <Route path="/math-tasks" component={MathTasks} />
      <Route path="/physics-tasks" component={PhysicsTasks} />
      <Route path="/game" component={Game} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;