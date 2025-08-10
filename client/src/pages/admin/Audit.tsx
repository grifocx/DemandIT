import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, History, Plus, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

export default function Audit() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>("all");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['/api/audit'],
  });

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Eye className="h-4 w-4 text-slate-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'portfolio':
        return 'bg-purple-100 text-purple-800';
      case 'program':
        return 'bg-indigo-100 text-indigo-800';
      case 'demand':
        return 'bg-yellow-100 text-yellow-800';
      case 'project':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getUserInitials = (email?: string) => {
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Filter audit logs based on search and filters
  const filteredLogs = (auditLogs || []).filter((log: any) => {
    const matchesSearch = !searchQuery || 
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.changeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.changedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntityType = entityTypeFilter === 'all' || log.entityType === entityTypeFilter;
    const matchesChangeType = changeTypeFilter === 'all' || log.changeType === changeTypeFilter;

    return matchesSearch && matchesEntityType && matchesChangeType;
  }) || [];

  const entityTypes = Array.from(new Set((auditLogs || []).map((log: any) => log.entityType)));
  const changeTypes = Array.from(new Set((auditLogs || []).map((log: any) => log.changeType)));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-slate-600">Track all changes made within the system</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-600">Track all changes made within the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription>
            Filter and search through system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by entity, change type, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-audit-search"
              />
            </div>
            
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-40" data-testid="select-entity-filter">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {entityTypes.map((type: string) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
              <SelectTrigger className="w-40" data-testid="select-change-filter">
                <SelectValue placeholder="Change Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Changes</SelectItem>
                {changeTypes.map((type: string) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No audit logs found</h3>
              <p className="text-slate-600">
                {(auditLogs || []).length === 0 
                  ? "No activity has been recorded yet."
                  : "No logs match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log: any) => (
                <div 
                  key={log.id} 
                  className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  data-testid={`item-audit-${log.id}`}
                >
                  <div className="flex-shrink-0">
                    {getChangeIcon(log.changeType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getChangeColor(log.changeType)}>
                          {log.changeType}
                        </Badge>
                        <Badge variant="outline" className={getEntityTypeColor(log.entityType)}>
                          {log.entityType}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-500" data-testid={`text-timestamp-${log.id}`}>
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-900 mb-1" data-testid={`text-description-${log.id}`}>
                      <span className="font-medium">{log.entityType}</span> {log.entityId} was {log.changeType}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-slate-600">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(log.changedBy)}
                        </AvatarFallback>
                      </Avatar>
                      <span data-testid={`text-user-${log.id}`}>by {log.changedBy}</span>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                          View details
                        </summary>
                        <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap font-mono">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}