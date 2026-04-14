"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// ================================================================
// FormField — Input tunggal dengan label kelas pekerja (Shadcn Light)
// ================================================================
interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: string; // Teks ikon untuk Material Symbols, misal: "person"
}

export function FormField({
  label,
  error,
  hint,
  icon,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
        <input
          {...props}
          className={`
            w-full py-2 px-3 ${icon ? "pl-10" : ""} 
            bg-white border text-slate-900 placeholder-slate-400 text-sm rounded-md
            transition-colors duration-200 outline-none
            focus:border-primary focus:ring-1 focus:ring-primary
            disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
            ${error ? "border-destructive focus:ring-destructive" : "border-slate-300 hover:border-slate-400"}
            ${className ?? ""}
          `}
        />
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

// ================================================================
// TextAreaField
// ================================================================
interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, className, ...props }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        {...props}
        className={`
          w-full py-2 px-3 bg-white border text-slate-900 placeholder-slate-400 text-sm rounded-md
          transition-colors duration-200 outline-none resize-none
          focus:border-primary focus:ring-1 focus:ring-primary
          disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
          ${error ? "border-destructive focus:ring-destructive" : "border-slate-300 hover:border-slate-400"}
          ${className ?? ""}
        `}
      />
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

// ================================================================
// SelectField
// ================================================================
interface SelectOption { value: string; label: string }
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  label, value, onChange, options, placeholder, error, disabled
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full py-2 pl-3 pr-10 bg-white border text-slate-900 text-sm rounded-md
            transition-colors duration-200 outline-none appearance-none cursor-pointer
            focus:border-primary focus:ring-1 focus:ring-primary
            disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
            ${error ? "border-destructive" : "border-slate-300 hover:border-slate-400"}
          `}
        >
          {placeholder && <option value="" className="text-slate-400">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-500">
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

// ================================================================
// BobotSlider
// ================================================================
interface BobotSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color?: string; // Tailwind text color class, misal: "text-indigo-600"
}

export function BobotSlider({ label, value, onChange, color }: BobotSliderProps) {
  // Extract accent color from text color if possible, or just default to primary
  const accentClass = color ? color.replace("text-", "accent-") : "accent-primary";
  const textClass = color || "text-primary";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className={`text-sm font-medium ${textClass}`}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 ${accentClass}`}
      />
    </div>
  );
}

// ================================================================
// SubmitButton
// ================================================================
interface SubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  icon?: string;
}

export function SubmitButton({
  loading, disabled, label = "Simpan", loadingLabel = "Menyimpan...", onClick, variant = "primary", icon
}: SubmitButtonProps) {
  
  let baseClass = "w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ";
  
  if (variant === "primary") {
    baseClass += "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary";
  } else if (variant === "danger") {
    baseClass += "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive";
  } else if (variant === "outline") {
    baseClass += "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-300";
  } else {
    // secondary
    baseClass += "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-slate-300";
  }

  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClass}
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          {loadingLabel}
        </>
      ) : (
        <>
          {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
          {label}
        </>
      )}
    </button>
  );
}

// ================================================================
// ErrorBanner
// ================================================================
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">error</span>
      <p>{message}</p>
    </div>
  );
}

// ================================================================
// SuccessBanner
// ================================================================
export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-md flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">check_circle</span>
      <p>{message}</p>
    </div>
  );
}

// ================================================================
// AvatarInitial
// ================================================================
export function AvatarInitial({ name, size = 40 }: { name: string; size?: number }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

  return (
    <div
      className="flex-shrink-0 rounded-full bg-accent text-primary flex items-center justify-center font-medium border border-primary/10"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
