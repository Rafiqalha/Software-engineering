"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";

// ================================================================
// FormField — Input tunggal dengan label dan glowing focus ring
// ================================================================
interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
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
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full py-2.5 px-3 ${icon ? "pl-9" : ""} 
            bg-white/5 border rounded-xl text-white placeholder-gray-600 text-sm
            transition-all duration-200 outline-none
            focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:bg-white/[0.07]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/20"}
            ${className ?? ""}
          `}
        />
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ================================================================
// TextAreaField — Textarea dengan styling identik FormField
// ================================================================
interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, className, ...props }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <textarea
        {...props}
        className={`
          w-full py-2.5 px-3 bg-white/5 border rounded-xl text-white placeholder-gray-600 text-sm
          transition-all duration-200 outline-none resize-none
          focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:bg-white/[0.07]
          ${error ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/20"}
          ${className ?? ""}
        `}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ================================================================
// SelectField — Dropdown dengan styling premium
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
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full py-2.5 px-3 bg-white/5 border rounded-xl text-white text-sm
          transition-all duration-200 outline-none appearance-none
          focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500/60" : "border-white/10 hover:border-white/20"}
        `}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1.25rem" }}
      >
        {placeholder && <option value="" className="bg-[#111114]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#111114]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ================================================================
// BobotSlider — Khusus untuk input bobot MK dengan live preview
// ================================================================
interface BobotSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color?: string; // tailwind text color class
}

export function BobotSlider({ label, value, onChange, color = "text-indigo-400" }: BobotSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 1.3, color: "#818cf8" }}
          animate={{ scale: 1, color: "#ffffff" }}
          className={`text-base font-bold tabular-nums ${color}`}
        >
          {value}%
        </motion.span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-white/10"
      />
    </div>
  );
}

// ================================================================
// SubmitButton — Tombol submit premium dengan loading state
// ================================================================
interface SubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
  variant?: "primary" | "danger";
}

export function SubmitButton({
  loading, disabled, label = "Simpan", loadingLabel = "Menyimpan...", onClick, variant = "primary"
}: SubmitButtonProps) {
  const gradientClass = variant === "danger"
    ? "from-red-600 to-rose-600 shadow-red-500/20"
    : "from-indigo-600 to-violet-600 shadow-indigo-500/20";

  return (
    <motion.button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      className={`
        w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white
        bg-gradient-to-r ${gradientClass} shadow-lg
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </>
      ) : label}
    </motion.button>
  );
}

// ================================================================
// ErrorBanner — Tampilkan error dari server action
// ================================================================
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl"
    >
      {message}
    </motion.div>
  );
}

// ================================================================
// SuccessBanner
// ================================================================
export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3 rounded-xl"
    >
      {message}
    </motion.div>
  );
}

// ================================================================
// AvatarInitial — Avatar berbasis inisial nama
// ================================================================
const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-purple-500 to-fuchsia-600",
];

export function AvatarInitial({ name, size = 40 }: { name: string; size?: number }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  const colorIndex =
    name.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <div
      className={`flex-shrink-0 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIndex]} flex items-center justify-center font-bold text-white shadow-lg`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
