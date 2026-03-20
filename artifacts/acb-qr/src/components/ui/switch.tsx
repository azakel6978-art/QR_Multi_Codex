import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div className="h-6 w-11 rounded-full bg-secondary transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:bg-primary">
          <div
            className={cn(
              "absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-gray-300 bg-white transition-all content-[''] peer-checked:translate-x-full peer-checked:border-white",
              checked ? "translate-x-full" : "translate-x-0"
            )}
          />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
