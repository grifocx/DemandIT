import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Portfolios from "@/pages/Portfolios";
import Programs from "@/pages/Programs";
import Demands from "@/pages/Demands";
import Projects from "@/pages/Projects";
import PortfolioHealth from "@/pages/reports/PortfolioHealth";
import ProjectStatus from "@/pages/reports/ProjectStatus";
import Users from "@/pages/admin/Users";
import Workflow from "@/pages/admin/Workflow";
import Audit from "@/pages/admin/Audit";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/portfolios" component={Portfolios} />
          <Route path="/programs" component={Programs} />
          <Route path="/demands" component={Demands} />
          <Route path="/projects" component={Projects} />
          <Route path="/reports/portfolio-health" component={PortfolioHealth} />
          <Route path="/reports/project-status" component={ProjectStatus} />
          <Route path="/admin/users" component={Users} />
          <Route path="/admin/workflow" component={Workflow} />
          <Route path="/admin/audit" component={Audit} />
        </>
      )}
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
