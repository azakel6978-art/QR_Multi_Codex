import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { type QrTestResult } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export function QrTestResults({ results }: { results: QrTestResult | null }) {
  if (!results) return null;

  const confidencePct = Math.round(results.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-accent/30 shadow-lg shadow-accent/5">
        <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
          <CardTitle className="flex items-center text-lg text-accent">
            {results.scannable ? <ShieldCheck className="w-5 h-5 mr-2" /> : <ShieldAlert className="w-5 h-5 mr-2" />}
            Scan Reliability Report
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className={confidencePct > 80 ? "text-emerald-400" : confidencePct > 50 ? "text-amber-400" : "text-destructive"}>
                {confidencePct}%
              </span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${confidencePct > 80 ? 'bg-emerald-500' : confidencePct > 50 ? 'bg-amber-500' : 'bg-destructive'}`}
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={results.scannable ? "success" : "destructive"}>
              {results.scannable ? "Scannable" : "Not Scannable"}
            </Badge>
            {results.logoConflict && (
              <Badge variant="destructive">Logo Conflict</Badge>
            )}
            {results.cornerConflict && (
              <Badge variant="warning">Corner Contrast Issue</Badge>
            )}
          </div>

          {(results.issues?.length > 0 || results.warnings?.length > 0 || results.recommendations?.length > 0) && (
            <div className="space-y-4">
              {results.issues?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-destructive flex items-center">
                    <XCircle className="w-4 h-4 mr-1.5" /> Issues
                  </h4>
                  <ul className="space-y-1">
                    {results.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-muted-foreground bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.warnings?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-amber-400 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5" /> Warnings
                  </h4>
                  <ul className="space-y-1">
                    {results.warnings.map((warning, i) => (
                      <li key={i} className="text-xs text-muted-foreground bg-amber-500/10 px-3 py-2 rounded-md border border-amber-500/20">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {results.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-muted-foreground bg-emerald-500/10 px-3 py-2 rounded-md border border-emerald-500/20">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
