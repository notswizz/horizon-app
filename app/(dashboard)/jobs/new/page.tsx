"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const PROGRAM_OPTIONS = [
  { value: "HER", label: "HER (Home Energy Rebate)" },
  { value: "HEAR", label: "HEAR (Home Electrification & Appliance Rebate)" },
  { value: "both", label: "Both HER & HEAR" },
  { value: "GHEFA", label: "GHEFA" },
  { value: "IRA", label: "IRA" },
];

export default function NewJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    programType: "HER",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Homeowner name is required");
      return;
    }
    if (!form.location.trim()) {
      setError("Address is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        programType: form.programType === "both" ? "HER" : form.programType,
        notes: form.notes.trim(),
        createBoth: form.programType === "both",
      };

      const res = await fetch("/api/monday/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      const data = await res.json();
      router.push(`/jobs/${data.ids[0]}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to jobs
      </Link>

      <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
        <h1 className="text-lg font-bold mb-6">New Job</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">
              Homeowner Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="First Last"
              className="w-full px-3 py-2.5 rounded-xl bg-input border border-input-border text-foreground placeholder:text-muted text-sm focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">
              Address *
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="123 Main St, City, GA 30301"
              className="w-full px-3 py-2.5 rounded-xl bg-input border border-input-border text-foreground placeholder:text-muted text-sm focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-medium mb-1.5 block">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2.5 rounded-xl bg-input border border-input-border text-foreground placeholder:text-muted text-sm focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@email.com"
                className="w-full px-3 py-2.5 rounded-xl bg-input border border-input-border text-foreground placeholder:text-muted text-sm focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">
              Program Type
            </label>
            <div className="space-y-2">
              {PROGRAM_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.programType === opt.value
                      ? "bg-accent-muted border-accent"
                      : "bg-input border-input-border hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="programType"
                    value={opt.value}
                    checked={form.programType === opt.value}
                    onChange={(e) => update("programType", e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.programType === opt.value
                        ? "border-accent"
                        : "border-muted"
                    }`}
                  >
                    {form.programType === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Initial notes..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-input border border-input-border text-foreground placeholder:text-muted text-sm focus:border-input-focus focus:ring-1 focus:ring-input-focus outline-none resize-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving
              ? "Creating..."
              : form.programType === "both"
              ? "Create 2 Jobs (HER + HEAR)"
              : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
