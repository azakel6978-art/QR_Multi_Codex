import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, QrCode, Activity } from "lucide-react";
import { type QrSession } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

interface QrPreviewProps {
  session: QrSession | null;
  onTest: () => void;
  isTesting: boolean;
}

export function QrPreview({ session, onTest, isTesting }: QrPreviewProps) {
  const handleDownload = () => {
    if (!session?.qrImageBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${session.qrImageBase64}`;
    link.download = `acb-qr-${session.id.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenTabs = () => {
    if (!session?.pageUrl) return;
    const tabs = session.tabsToOpen || 1;
    for (let i = 0; i < tabs; i++) {
      setTimeout(() => {
        window.open(session.pageUrl, "_blank");
      }, i * 200); // Slight delay to try avoiding aggressive popup blockers
    }
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-b from-card to-background border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg text-primary">
          <QrCode className="w-5 h-5 mr-2" />
          Active QR Output
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 pt-0">
        <AnimatePresence mode="wait">
          {session?.qrImageBase64 ? (
            <motion.div
              key="has-qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-sm flex flex-col items-center space-y-8"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                  <img
                    src={`data:image/png;base64,${session.qrImageBase64}`}
                    alt="Generated QR Code"
                    className="w-full h-auto aspect-square object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <Button onClick={handleDownload} variant="secondary" className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button onClick={handleOpenTabs} className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Tabs ({session.tabsToOpen || 1})
                </Button>
                <Button 
                  onClick={onTest} 
                  variant="outline" 
                  className="col-span-2 border-accent/50 text-accent hover:bg-accent/10"
                  isLoading={isTesting}
                >
                  <Activity className="w-4 h-4 mr-2" /> Run Reliability Test
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-qr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-muted-foreground"
            >
              <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-6">
                <QrCode className="w-12 h-12 opacity-20" />
              </div>
              <p className="text-sm font-medium">Configure and generate a QR code</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
