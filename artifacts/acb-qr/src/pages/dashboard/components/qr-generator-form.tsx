import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, Palette, Image as ImageIcon, Type, Settings2, Sparkles, Wand2 } from "lucide-react";

const schema = z.object({
  qrData: z.string().min(1, "QR Data is required"),
  dynamicContent: z.string().optional(),
  cornerColor: z.string().optional(),
  logoUrl: z.string().optional(),
  logoScale: z.coerce.number().min(0).max(0.4).optional(),
  whiteFill: z.boolean().optional(),
  whiteFillColor: z.string().optional(),
  highlightCorners: z.boolean().optional(),
  metadataFriendly: z.boolean().optional(),
  pageTitle: z.string().optional(),
  pageDescription: z.string().optional(),
  premiumFeatures: z.boolean().optional(),
  vocalIntroUrl: z.string().optional(),
  trackTraffic: z.boolean().optional(),
  tabsToOpen: z.coerce.number().min(1).max(10).optional(),
  textOverlay: z.object({
    text: z.string().optional(),
    font: z.enum(['bold', 'italic', 'cursive', 'normal']).optional(),
    size: z.coerce.number().min(8).max(200).optional(),
    x: z.coerce.number().min(0).max(100).optional(),
    y: z.coerce.number().min(0).max(100).optional(),
    color: z.string().optional(),
  }).optional()
});

type FormValues = z.infer<typeof schema>;

interface FormProps {
  onSubmit: (data: FormValues) => void;
  isGenerating: boolean;
}

export function QrGeneratorForm({ onSubmit, isGenerating }: FormProps) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      qrData: "https://replit.com",
      cornerColor: "#00E5FF",
      whiteFillColor: "#FFFFFF",
      logoScale: 0.2,
      tabsToOpen: 1,
      textOverlay: {
        font: "bold",
        size: 24,
        x: 50,
        y: 90,
        color: "#000000"
      }
    }
  });

  const premiumEnabled = watch("premiumFeatures");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      <div className="space-y-4">
        <h3 className="text-lg font-display flex items-center text-white">
          <Link2 className="w-5 h-5 mr-2 text-primary" /> Data Source
        </h3>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Target URL or Text *</label>
              <Input {...register("qrData")} placeholder="https://example.com" />
              {errors.qrData && <p className="text-xs text-destructive mt-1">{errors.qrData.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Dynamic Override URL (Optional)</label>
              <Input {...register("dynamicContent")} placeholder="https://api.example.com/redirect" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display flex items-center text-white">
          <Palette className="w-5 h-5 mr-2 text-primary" /> Appearance & Fill
        </h3>
        <Card>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between col-span-1 md:col-span-2 p-3 bg-secondary/30 rounded-xl border border-border/50">
              <div>
                <p className="font-medium text-white">Highlight Corners</p>
                <p className="text-xs text-muted-foreground">Apply custom color to the 3 finder squares</p>
              </div>
              <Controller
                name="highlightCorners"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Corner Color</label>
              <div className="flex gap-3">
                <Input type="color" {...register("cornerColor")} />
                <Input type="text" {...register("cornerColor")} className="flex-1" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Paint Bucket Fill</label>
                <Controller
                  name="whiteFill"
                  control={control}
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
              <div className="flex gap-3">
                <Input type="color" {...register("whiteFillColor")} />
                <Input type="text" {...register("whiteFillColor")} className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display flex items-center text-white">
          <ImageIcon className="w-5 h-5 mr-2 text-primary" /> Center Branding
        </h3>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Logo URL</label>
              <Input {...register("logoUrl")} placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Logo Scale (0.0 - 0.4)</label>
              <Input type="number" step="0.05" {...register("logoScale")} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display flex items-center text-white">
          <Type className="w-5 h-5 mr-2 text-primary" /> Text Overlay
        </h3>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Overlay Text</label>
              <Input {...register("textOverlay.text")} placeholder="SCAN ME" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Font Style</label>
                <select 
                  {...register("textOverlay.font")}
                  className="w-full h-11 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bold">Bold</option>
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Size (px)</label>
                <Input type="number" {...register("textOverlay.size")} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">X Pos (%)</label>
                <Input type="number" {...register("textOverlay.x")} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Y Pos (%)</label>
                <Input type="number" {...register("textOverlay.y")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display flex items-center text-white">
          <Settings2 className="w-5 h-5 mr-2 text-primary" /> Page Output Settings
        </h3>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50">
              <div>
                <p className="font-medium text-white">Metadata Friendly (SEO)</p>
                <p className="text-xs text-muted-foreground">Include alt text and meta tags</p>
              </div>
              <Controller
                name="metadataFriendly"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Page Title</label>
                <Input {...register("pageTitle")} placeholder="My Dynamic QR" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Tabs to Open</label>
                <Input type="number" {...register("tabsToOpen")} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Meta Description</label>
                <Input {...register("pageDescription")} placeholder="A dynamically generated QR page" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display flex items-center text-accent">
          <Sparkles className="w-5 h-5 mr-2" /> Premium Features
        </h3>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-accent/20">
              <div>
                <p className="font-medium text-accent">Enable Premium Features</p>
                <p className="text-xs text-muted-foreground">Unlock traffic tracking and vocal intros</p>
              </div>
              <Controller
                name="premiumFeatures"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
            
            {premiumEnabled && (
              <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Track Traffic Analytics</label>
                  <Controller
                    name="trackTraffic"
                    control={control}
                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Vocal Intro URL (Audio)</label>
                  <Input {...register("vocalIntroUrl")} placeholder="https://example.com/intro.mp3" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button type="submit" size="lg" className="w-full text-lg shadow-xl" isLoading={isGenerating}>
        <Wand2 className="w-5 h-5 mr-2" /> 
        Generate Algebraic Codex Build
      </Button>

    </form>
  );
}
