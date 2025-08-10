import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";

export default function PortfolioHealth() {
  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery({
    queryKey: ['/api/portfolios'],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['/api/programs'],
  });

  const isLoading = portfoliosLoading || projectsLoading || programsLoading;

  // Calculate portfolio health metrics
  const portfolioHealthData = portfolios.map((portfolio: any) => {
    // Get programs for this portfolio
    const portfolioPrograms = programs.filter((program: any) => 
      program.portfolioId === portfolio.id
    );
    
    // Get projects for all programs in this portfolio
    const portfolioProjects = projects.filter((project: any) => 
      portfolioPrograms.some((program: any) => program.id === project.programId)
    );

    const totalProjects = portfolioProjects.length;
    const activeProjects = portfolioProjects.filter((p: any) => p.status?.name === 'Active').length;
    const atRiskProjects = portfolioProjects.filter((p: any) => p.status?.name === 'At Risk').length;
    const completedProjects = portfolioProjects.filter((p: any) => p.status?.name === 'Completed').length;
    const onHoldProjects = portfolioProjects.filter((p: any) => p.status?.name === 'On Hold').length;

    const healthScore = totalProjects > 0 
      ? Math.round(((activeProjects + completedProjects) / totalProjects) * 100)
      : 0;

    const trend = atRiskProjects === 0 ? 'positive' : atRiskProjects < (totalProjects * 0.2) ? 'neutral' : 'negative';

    return {
      ...portfolio,
      totalProjects,
      activeProjects,
      atRiskProjects,
      completedProjects,
      onHoldProjects,
      healthScore,
      trend
    };
  }) || [];

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Portfolio Health</h1>
                <p className="text-slate-600">Monitor the overall health and performance of your portfolios</p>
              </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          </div>
        </main>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Portfolio Health</h1>
              <p className="text-slate-600">Monitor the overall health and performance of your portfolios</p>
            </div>

      {portfolioHealthData.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No portfolios found</h3>
              <p className="text-slate-600">Create your first portfolio to start tracking its health.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolioHealthData.map((portfolio: any) => (
            <Card key={portfolio.id} data-testid={`card-portfolio-${portfolio.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                  {getTrendIcon(portfolio.trend)}
                </div>
                <CardDescription>{portfolio.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Score</span>
                  <Badge 
                    className={getHealthBadgeColor(portfolio.healthScore)}
                    data-testid={`badge-health-${portfolio.id}`}
                  >
                    {portfolio.healthScore}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Projects</span>
                    <span className="font-medium" data-testid={`text-total-${portfolio.id}`}>
                      {portfolio.totalProjects}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Active</span>
                    <span className="font-medium text-green-600" data-testid={`text-active-${portfolio.id}`}>
                      {portfolio.activeProjects}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">At Risk</span>
                    <span className="font-medium text-red-600" data-testid={`text-at-risk-${portfolio.id}`}>
                      {portfolio.atRiskProjects}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-medium text-blue-600" data-testid={`text-completed-${portfolio.id}`}>
                      {portfolio.completedProjects}
                    </span>
                  </div>
                  {portfolio.onHoldProjects > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">On Hold</span>
                      <span className="font-medium text-yellow-600" data-testid={`text-on-hold-${portfolio.id}`}>
                        {portfolio.onHoldProjects}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}