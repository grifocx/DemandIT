import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Plus, Edit2, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Workflow() {
  const [activeTab, setActiveTab] = useState("phases");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"demand" | "project">("demand");
  const { toast } = useToast();

  // Fetch phases
  const { data: demandPhases, isLoading: demandPhasesLoading } = useQuery({
    queryKey: ['/api/phases', 'demand'],
    queryFn: () => fetch('/api/phases?type=demand').then(res => res.json()),
  });

  const { data: projectPhases, isLoading: projectPhasesLoading } = useQuery({
    queryKey: ['/api/phases', 'project'],
    queryFn: () => fetch('/api/phases?type=project').then(res => res.json()),
  });

  // Fetch statuses
  const { data: demandStatuses, isLoading: demandStatusesLoading } = useQuery({
    queryKey: ['/api/statuses', 'demand'],
    queryFn: () => fetch('/api/statuses?type=demand').then(res => res.json()),
  });

  const { data: projectStatuses, isLoading: projectStatusesLoading } = useQuery({
    queryKey: ['/api/statuses', 'project'],
    queryFn: () => fetch('/api/statuses?type=project').then(res => res.json()),
  });

  // Create phase mutation
  const createPhase = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create phase');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Phase created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/phases'] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create phase",
        variant: "destructive",
      });
    },
  });

  // Create status mutation
  const createStatus = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create status');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Status created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/statuses'] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create status",
        variant: "destructive",
      });
    },
  });

  const handleCreatePhase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const phases = selectedType === 'demand' ? demandPhases : projectPhases;
    const maxOrder = phases ? Math.max(...phases.map((p: any) => p.order), 0) : 0;
    
    createPhase.mutate({
      name: formData.get('name'),
      type: selectedType,
      order: maxOrder + 1,
    });
  };

  const handleCreateStatus = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createStatus.mutate({
      name: formData.get('name'),
      type: selectedType,
      color: formData.get('color'),
    });
  };

  const getStatusBadgeStyle = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colorMap[color] || 'bg-slate-100 text-slate-800';
  };

  const isLoading = demandPhasesLoading || projectPhasesLoading || demandStatusesLoading || projectStatusesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workflow Configuration</h1>
          <p className="text-slate-600">Configure phases and statuses for demands and projects</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workflow Configuration</h1>
          <p className="text-slate-600">Configure phases and statuses for demands and projects</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="phases" data-testid="tab-phases">Phases</TabsTrigger>
          <TabsTrigger value="statuses" data-testid="tab-statuses">Statuses</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Phase Configuration</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setActiveTab("phases")} data-testid="button-add-phase">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Phase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreatePhase}>
                  <DialogHeader>
                    <DialogTitle>Add New Phase</DialogTitle>
                    <DialogDescription>
                      Create a new phase for the workflow
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={selectedType} onValueChange={(value: "demand" | "project") => setSelectedType(value)}>
                        <SelectTrigger data-testid="select-phase-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demand">Demand</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Phase Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter phase name"
                        required
                        data-testid="input-phase-name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createPhase.isPending} data-testid="button-create-phase">
                      {createPhase.isPending ? "Creating..." : "Create Phase"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demand Phases</CardTitle>
                <CardDescription>Workflow phases for demand management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demandPhases?.map((phase: any, index: number) => (
                    <div key={phase.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`item-phase-${phase.id}`}>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{phase.name}</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                  {(!demandPhases || demandPhases.length === 0) && (
                    <div className="text-center py-4 text-slate-500">
                      No demand phases configured
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Phases</CardTitle>
                <CardDescription>Workflow phases for project management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectPhases?.map((phase: any, index: number) => (
                    <div key={phase.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`item-phase-${phase.id}`}>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{phase.name}</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                  {(!projectPhases || projectPhases.length === 0) && (
                    <div className="text-center py-4 text-slate-500">
                      No project phases configured
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Status Configuration</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setActiveTab("statuses")} data-testid="button-add-status">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateStatus}>
                  <DialogHeader>
                    <DialogTitle>Add New Status</DialogTitle>
                    <DialogDescription>
                      Create a new status for tracking progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={selectedType} onValueChange={(value: "demand" | "project") => setSelectedType(value)}>
                        <SelectTrigger data-testid="select-status-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demand">Demand</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Status Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter status name"
                        required
                        data-testid="input-status-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Select name="color" required>
                        <SelectTrigger data-testid="select-status-color">
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createStatus.isPending} data-testid="button-create-status">
                      {createStatus.isPending ? "Creating..." : "Create Status"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demand Statuses</CardTitle>
                <CardDescription>Status options for demand tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demandStatuses?.map((status: any) => (
                    <div key={status.id} className="flex items-center justify-between" data-testid={`item-status-${status.id}`}>
                      <Badge className={getStatusBadgeStyle(status.color)}>
                        {status.name}
                      </Badge>
                    </div>
                  ))}
                  {(!demandStatuses || demandStatuses.length === 0) && (
                    <div className="text-center py-4 text-slate-500">
                      No demand statuses configured
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Statuses</CardTitle>
                <CardDescription>Status options for project tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectStatuses?.map((status: any) => (
                    <div key={status.id} className="flex items-center justify-between" data-testid={`item-status-${status.id}`}>
                      <Badge className={getStatusBadgeStyle(status.color)}>
                        {status.name}
                      </Badge>
                    </div>
                  ))}
                  {(!projectStatuses || projectStatuses.length === 0) && (
                    <div className="text-center py-4 text-slate-500">
                      No project statuses configured
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}