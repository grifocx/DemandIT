import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ProjectStatus() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: phases, isLoading: phasesLoading } = useQuery({
    queryKey: ['/api/phases'],
    queryFn: () => fetch('/api/phases?type=project').then(res => res.json()),
  });

  const isLoading = projectsLoading || phasesLoading;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'at risk':
        return 'bg-red-100 text-red-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPhaseProgress = (currentPhase: any, allPhases: any[]) => {
    if (!currentPhase || !allPhases?.length) return 0;
    const currentPhaseOrder = allPhases.find(p => p.id === currentPhase.id)?.order || 1;
    const maxOrder = Math.max(...allPhases.map(p => p.order));
    return Math.round((currentPhaseOrder / maxOrder) * 100);
  };

  const calculateProjectHealth = (project: any) => {
    let health = 100;
    
    // Deduct points based on status
    if (project.status?.name === 'At Risk') health -= 30;
    if (project.status?.name === 'On Hold') health -= 20;
    if (project.status?.name === 'Cancelled') health = 0;
    
    // Deduct points if project is overdue (assuming targetDate exists)
    if (project.targetDate && new Date(project.targetDate) < new Date()) {
      health -= 15;
    }
    
    return Math.max(0, health);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Status</h1>
          <p className="text-slate-600">Track progress and status across all active projects</p>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const projectPhases = phases?.filter((p: any) => p.type === 'project') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Status</h1>
        <p className="text-slate-600">Track progress and status across all active projects</p>
      </div>

      {!(projects || []).length ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
              <p className="text-slate-600">Create your first project to start tracking its progress.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(projects || []).map((project: any) => {
            const phaseProgress = getPhaseProgress(project.phase, projectPhases);
            const healthScore = calculateProjectHealth(project);
            
            return (
              <Card key={project.id} data-testid={`card-project-${project.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-1">
                          {project.program && (
                            <span className="text-sm">Program: {project.program.name}</span>
                          )}
                          {project.owner && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="text-sm">{project.owner.email}</span>
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        className={getStatusColor(project.status?.name)}
                        data-testid={`badge-status-${project.id}`}
                      >
                        {project.status?.name || 'No Status'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-slate-600" data-testid={`text-description-${project.id}`}>
                      {project.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Project Progress</span>
                      <span className="text-sm text-slate-600" data-testid={`text-progress-${project.id}`}>
                        {phaseProgress}%
                      </span>
                    </div>
                    <Progress value={phaseProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Current: {project.phase?.name || 'No Phase'}</span>
                      <span>Health: {healthScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Started:</span>
                        <span data-testid={`text-start-date-${project.id}`}>
                          {format(new Date(project.startDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {project.targetDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Target:</span>
                        <span 
                          className={new Date(project.targetDate) < new Date() ? 'text-red-600' : ''}
                          data-testid={`text-target-date-${project.id}`}
                        >
                          {format(new Date(project.targetDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {project.budget && (
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm font-medium">Budget</span>
                      <span className="font-mono" data-testid={`text-budget-${project.id}`}>
                        ${Number(project.budget).toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}