"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import clsx from "clsx";
import { updateJob } from "@/lib/hooks";
import { STATUS_COLORS } from "@/lib/constants";

interface EditableFieldProps {
  jobId: string;
  columnId: string;
  value: string;
  label?: string;
  multiline?: boolean;
  type?: "text" | "date";
  className?: string;
}

export function EditableField({
  jobId,
  columnId,
  value,
  label,
  multiline = false,
  type = "text",
  className,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const el = inputRef.current;
      if (el instanceof HTMLTextAreaElement) {
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    }
  }, [editing]);

  async function handleSave() {
    if (draft === value) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await updateJob(jobId, columnId, draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(value);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  }

  if (editing) {
    const InputComponent = multiline ? "textarea" : "input";
    return (
      <div className={clsx("space-y-1.5", className)}>
        {label && (
          <label className="text-xs text-muted font-medium">{label}</label>
        )}
        <div className="relative">
          <InputComponent
            ref={inputRef as never}
            type={!multiline ? type : undefined}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={multiline ? 5 : undefined}
            className={clsx(
              "w-full px-4 py-3 rounded-xl bg-input border border-input-focus/50 text-foreground text-sm leading-relaxed focus:border-input-focus focus:ring-2 focus:ring-input-focus/20 outline-none resize-y transition-all",
              multiline && "min-h-[120px]"
            )}
            disabled={saving}
          />
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted text-xs font-medium hover:bg-card-hover transition-colors"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
            <span className="text-[10px] text-muted ml-auto">
              {multiline ? "Esc to cancel" : "Enter to save, Esc to cancel"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && (
        <label className="text-xs text-muted font-medium">{label}</label>
      )}
      <div
        onClick={() => setEditing(true)}
        className={clsx(
          "group relative rounded-xl cursor-pointer transition-all",
          "hover:bg-background border border-transparent hover:border-border",
          "px-4 py-3",
          value ? "min-h-[44px]" : "min-h-[44px] flex items-center"
        )}
      >
        {value ? (
          <p className="text-[13.5px] text-foreground/85 leading-[1.7] whitespace-pre-wrap pr-6">
            {value}
          </p>
        ) : (
          <span className="text-sm text-muted/50 italic">Click to add...</span>
        )}
        <Pencil className="w-3.5 h-3.5 text-muted/40 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        {saved && (
          <span className="absolute top-3 right-3 text-xs text-success font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

interface EditableStatusProps {
  jobId: string;
  columnId: string;
  value: string;
  options: readonly string[];
  renderValue: (val: string) => React.ReactNode;
}

export function EditableStatus({
  jobId,
  columnId,
  value,
  options,
  renderValue,
}: EditableStatusProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, openUp: false });

  const updatePos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(options.length * 44 + 16, 320);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight + 16 && rect.top > dropdownHeight;
    setPos({
      top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
      left: Math.max(8, rect.right - 220),
      openUp,
    });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    updatePos();

    function handleClick(e: MouseEvent) {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    function handleScroll() { updatePos(); }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePos]);

  async function handleSelect(newValue: string) {
    if (newValue === value) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await updateJob(jobId, columnId, newValue);
      setOpen(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="cursor-pointer disabled:opacity-50 transition-opacity"
      >
        {renderValue(value)}
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-card border border-border rounded-2xl shadow-xl py-2 min-w-[220px] max-h-[320px] overflow-y-auto"
          style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {options.map((opt) => {
            const sc = STATUS_COLORS[opt] ?? { dot: "bg-gray-400" };
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={clsx(
                  "w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm hover:bg-card-hover transition-colors",
                  opt === value && "text-accent font-medium"
                )}
              >
                <span className={clsx("w-2 h-2 rounded-full shrink-0", sc.dot)} />
                {opt}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
