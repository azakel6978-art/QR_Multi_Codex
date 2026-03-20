import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, History, LineChart, Cpu, Layers, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { QrGeneratorForm } from "./components/qr-generator-form";
import { QrPreview } from "./components/qr-preview";
import { QrTestResults } from "./components/qr-test-results";
import { SessionsList } from "./components/sessions-list";
import { TrafficReportView } from "./components/traffic-report";
import { NinePageBuilder } from "./components/nine-page-builder";
import { useGenerateQr, useTestQrCode } from "@workspace/api-client-react";
import { type QrSession, type QrTestResult } from "@workspace/api-client-react";

type ViewState = "generator" | "history" | "analytics" | "search";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewState>("generator");
  const [activeSession, setActiveSession] = useState<QrSession | null>(null);
  const [testResults, setTestResults] = useState<QrTestResult | null>(null);
  const [prefillUrl, setPrefillUrl] = useState<string | undefined>(undefined);

  const generateMutation = useGenerateQr();
  const testMutation = useTestQrCode();

  const handleGenerate = (data: any) => {
    setTestResults(null);
    generateMutation.mutate({ data }, {
      onSuccess: (session) => {
        setActiveSession(session);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const handleTest = () => {
    if (!activeSession) return;
    testMutation.mutate({
      data: { sessionId: activeSession.id }
    }, {
      onSuccess: (results) => {
        setTestResults(results);
      }
    });
  };

  const loadSession = (session: QrSession) => {
    setActiveSession(session);
    setTestResults(null);
    setActiveView("generator");
  };

  // Called from 9-page builder — pre-fills the QR generator with a URL
  const handleGenerateQrForUrl = (url: string, title: string, altText: string) => {
    setPrefillUrl(url);
    setActiveView("generator");
    // Give the view time to switch, then generate
    setTimeout(() => {
      generateMutation.mutate({
        data: {
          qrData: url,
          pageTitle: title,
          pageDescription: altText,
          metadataFriendly: true,
          highlightCorners: true,
          tabsToOpen: 1,
        }
      }, {
        onSuccess: (session) => {
          setActiveSession(session);
          setPrefillUrl(undefined);
        }
      });
    }, 400);
  };

  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none"
           style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/auth-bg.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-border/50 bg-card/80 backdrop-blur-xl z-20 flex flex-col items-center md:items-stretch py-8 shrink-0 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-center md:justify-start px-6 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="hidden md:block ml-4 text-xl font-display font-bold text-white tracking-tight">ACB <span className="text-primary">Studio</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 w-full">
          <NavItem
            icon={<QrCode />} label="Generator"
            active={activeView === "generator"}
            onClick={() => setActiveView("generator")}
          />
          <NavItem
            icon={<Globe />} label="9-Page Builder"
            active={activeView === "search"}
            onClick={() => setActiveView("search")}
          />
          <NavItem
            icon={<History />} label="History"
            active={activeView === "history"}
            onClick={() => setActiveView("history")}
          />
          <NavItem
            icon={<LineChart />} label="Analytics"
            active={activeView === "analytics"}
            onClick={() => setActiveView("analytics")}
            disabled={!activeSession?.trackTraffic}
          />
        </nav>

        <div className="px-6 mt-auto hidden md:block text-xs text-muted-foreground">
          <div className="flex items-center mb-2">
            <Layers className="w-4 h-4 mr-2" /> Codex Engine v2.4
          </div>
          <p>Algebraic Codex Build</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto z-10 relative">
        <div className="max-w-7xl mx-auto p-6 md:p-10">

          <AnimatePresence mode="wait">
            {activeView === "generator" && (
              <motion.div
                key="generator"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                <div className="lg:col-span-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-display text-white mb-2">Dynamic Codex Setup</h2>
                    <p className="text-muted-foreground">Configure your QR variables, tracking options, and visual algebraic overlays.</p>
                  </div>
                  <QrGeneratorForm
                    onSubmit={handleGenerate}
                    isGenerating={generateMutation.isPending}
                    prefillUrl={prefillUrl}
                  />
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
                  <QrPreview
                    session={activeSession}
                    onTest={handleTest}
                    isTesting={testMutation.isPending}
                  />
                  <QrTestResults results={testResults} />
                </div>
              </motion.div>
            )}

            {activeView === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <NinePageBuilder
                  onGenerateQrForUrl={handleGenerateQrForUrl}
                />
              </motion.div>
            )}

            {activeView === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-display text-white mb-2">Generated Sessions</h2>
                    <p className="text-muted-foreground">Access previously compiled algebraic builds.</p>
                  </div>
                </div>
                <SessionsList onSelect={loadSession} />
              </motion.div>
            )}

            {activeView === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-display text-white mb-2">Codex Telemetry</h2>
                  <p className="text-muted-foreground">Traffic breakdown for session: <span className="text-primary font-mono">{activeSession?.id.substring(0,8)}</span></p>
                </div>
                {activeSession ? (
                  <TrafficReportView sessionId={activeSession.id} />
                ) : (
                  <p className="text-muted-foreground">Select a session first.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, disabled }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-center md:justify-start px-4 py-3 rounded-xl transition-all duration-200 group relative",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/50",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground"
      )}
    >
      {active && (
        <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/10 rounded-xl" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      )}
      <span className={cn("relative z-10 shrink-0", active ? "text-primary" : "group-hover:text-white")}>
        {icon}
      </span>
      <span className={cn("hidden md:block ml-3 font-medium relative z-10 transition-colors", active ? "text-white" : "group-hover:text-white")}>
        {label}
      </span>
    </button>
  );
}
