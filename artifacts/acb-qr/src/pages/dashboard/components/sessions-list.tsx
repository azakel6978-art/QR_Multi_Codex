import React from "react";
import { useListSessions, useDeleteSession } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Calendar, Link2, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { type QrSession } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  onSelect: (session: QrSession) => void;
}

export function SessionsList({ onSelect }: Props) {
  const { data: sessions, isLoading } = useListSessions();
  const deleteMutation = useDeleteSession();
  const queryClient = useQueryClient();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/qr/sessions"] });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sessions?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
        <p>No saved sessions found.</p>
        <p className="text-sm mt-1">Generate your first QR code to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <Card 
          key={session.id} 
          className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          onClick={() => onSelect(session)}
        >
          <CardContent className="p-0">
            <div className="aspect-video bg-white/5 p-6 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-50 z-10 pointer-events-none"></div>
              <img 
                src={`data:image/png;base64,${session.qrImageBase64}`} 
                alt="QR Thumbnail" 
                className="w-full h-full object-contain relative z-0 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                {session.trackTraffic && (
                  <div className="bg-accent text-white p-1.5 rounded-md shadow-lg" title="Traffic Tracking Enabled">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                )}
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(session.id, e)}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-white truncate flex items-center">
                    <Link2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                    {session.pageTitle || session.qrData}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {session.qrData}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {format(new Date(session.createdAt), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center font-mono">
                  {session.tabsToOpen} tab{session.tabsToOpen !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
