import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: LucideIcon;
  error?: { message?: string };
  options: (string | { value: string; label: string })[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, icon: Icon, error, options, className, ...props }, ref) => {
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
          <select
            ref={ref}
            className={`w-full py-2.5 px-4 rounded-xl border bg-background text-sm transition appearance-none outline-none focus:ring-2 focus:ring-primary/20 ${
              Icon ? "pl-10 font-medium" : ""
            } ${
              error
                ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                : "border-border focus:border-primary"
            } ${className}`}
            {...props}
          >
            {options.map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value;
              const lbl = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
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

SelectField.displayName = "SelectField";
export default SelectField;
