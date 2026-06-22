import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: { message?: string };
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon: Icon, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground block">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          )}
          <input
            ref={ref}
            className={`w-full py-2.5 px-4 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
              Icon ? "pl-10" : ""
            } ${
              error
                ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                : "border-border focus:border-primary"
            } ${className}`}
            {...props}
          />
        </div>
        {error?.message && (
          <p className="text-xs text-destructive mt-1 font-medium animate-in fade-in duration-200">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
