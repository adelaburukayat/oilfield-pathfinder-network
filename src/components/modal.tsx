import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open, onClose, onSave, title, subtitle, children, saveLabel = "Save changes",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  saveLabel?: string;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-background shadow-lift animate-in slide-in-from-bottom-4 sm:max-w-lg sm:rounded-3xl sm:slide-in-from-bottom-2">
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          {footer}
          <button onClick={onClose} className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
          {onSave && (
            <button onClick={onSave} className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep">
              {saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint, half }: { label: string; children: ReactNode; hint?: string; half?: boolean }) {
  return (
    <div className={half ? "sm:col-span-1 col-span-2" : "col-span-2"}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field" />;
}

export function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field h-auto py-3" />;
}

export function ChipSelect({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-sm transition-all ${on ? "border-primary bg-secondary text-secondary-foreground" : "border-input bg-card text-foreground hover:border-primary/50"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function SelectInput({ value, onChange, options, placeholder = "Select…" }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`field appearance-none bg-[length:16px] bg-[right_0.875rem_center] bg-no-repeat pr-10 ${value ? "" : "text-muted-foreground"}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23667' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
