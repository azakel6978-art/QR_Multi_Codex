import React from "react";
import { useGetTrafficReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Eye, ArrowUpRight, Activity } from "lucide-react";
import { format } from "date-fns";

export function TrafficReportView({ sessionId }: { sessionId: string }) {
  const { data: report, isLoading, error } = useGetTrafficReport(sessionId);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-primary animate-pulse">Loading Analytics...</div>;
  }

  if (error || !report) {
    return (
      <Card className="border-dashed border-muted">
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Activity className="w-8 h-8 mb-2 opacity-50" />
          <p>No traffic data available yet.</p>
          <p className="text-xs mt-1">Make sure tracking is enabled and the QR has been scanned.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(report.sources || {}).map(([name, value]) => ({
    name: name || "Direct",
    visits: value
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-background border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Scans / Visits</p>
              <h2 className="text-4xl font-display text-white">{report.totalVisits}</h2>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-background border-accent/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-accent/10 text-accent">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Unique Devices</p>
              <h2 className="text-4xl font-display text-white">{report.uniqueVisitors}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#151A23', border: '1px solid #2A303C', borderRadius: '8px' }}
                  />
                  <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough source data</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Pings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.recentVisits?.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-white">{visit.source || "Direct Traffic"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md">{visit.userAgent}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(visit.visitedAt), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
