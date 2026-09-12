"use client";

import { useState } from "react";
import type { Beach } from "@/lib/types";
import { STATUS_META } from "@/lib/types";

interface Props {
  beaches: Beach[];
  query: string;
  onQueryChange: (q: string) => void;
  results: Beach[];
  onSelect: (beach: Beach) => void;
}

export default function SearchBar({
  beaches,
  query,
  onQueryChange,
  results,
  onSelect,
}: Props) {
  const [focused, setFocused] = useState(false);
  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="mx-auto flex max-w-5xl items-start gap-3 px-4">
      {/* Search box */}
      <div className="relative flex-1">
        <div className="flex items-center gap-2 rounded-card border border-border bg-surface px-4 py-3 shadow-card">
          <svg
            className="h-5 w-5 shrink-0 text-ink-soft"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search a beach by name or lake"
            className="w-full bg-transparent text-base text-ink placeholder:text-ink-soft/70 focus:outline-none"
            aria-label="Search beaches"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="text-ink-soft hover:text-ink"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showDropdown && (
          <ul className="absolute z-[1000] mt-2 max-h-72 w-full overflow-auto rounded-card border border-border bg-surface p-1 shadow-card">
            {results.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink-soft">
                No beach matches “{query}”.
              </li>
            )}
            {results.map((b) => {
              const meta = STATUS_META[b.status];
              return (
                <li key={b.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(b)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-alt"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: meta.color }}
                      aria-hidden
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {b.name}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {b.location}
                      </span>
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: meta.tint, color: meta.color }}
                    >
                      {meta.short}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Notification bell */}
      <NotificationBell beaches={beaches} />
    </div>
  );
}

type Channel = "email" | "phone";

function NotificationBell({ beaches }: { beaches: Beach[] }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  // Demo-only: fire a real SMS/email now via /api/notify, without waiting for a
  // real status change. Sends on the active channel to the entered contact (or
  // the server's DEMO_ fallback if left blank).
  async function sendTestAlert() {
    setSending(true);
    setNotice(null);
    try {
      const payload: {
        mode: "test";
        phone?: string;
        email?: string;
        beachId?: string;
      } = { mode: "test" };
      if (channel === "phone") payload.phone = phone;
      else payload.email = email;
      if (selectedIds[0]) payload.beachId = selectedIds[0];

      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setNotice({ ok: true, text: `Sent: ${data.message}` });
      } else {
        setNotice({ ok: false, text: data.error || "Could not send the alert." });
      }
    } catch {
      setNotice({ ok: false, text: "Network error while sending the alert." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-card border border-border bg-surface text-ink shadow-card transition hover:bg-surface-alt"
        aria-label="Get beach alerts"
        aria-expanded={open}
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface" />
      </button>

      {open && (
        <div className="absolute right-0 z-[1000] mt-2 w-80 rounded-card border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold text-ink">Get morning alerts</p>
          <p className="mt-1 text-xs text-ink-soft">
            We will message you when a beach you follow closes or gets an
            advisory, before you drive.
          </p>

          {/* Channel toggle */}
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-alt p-1">
            <ChannelTab
              active={channel === "email"}
              onClick={() => setChannel("email")}
              label="Email"
            />
            <ChannelTab
              active={channel === "phone"}
              onClick={() => setChannel("phone")}
              label="Phone"
            />
          </div>

          {/* Contact input, based on channel */}
          <div className="mt-3">
            {channel === "email" ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm focus:outline-none"
                aria-label="Email address"
              />
            ) : (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(902) 555 0134"
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm focus:outline-none"
                aria-label="Phone number"
              />
            )}
          </div>

          {/* Beach multi select */}
          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold text-ink">
              Beaches to watch
            </p>
            <BeachMultiSelect
              beaches={beaches}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          </div>

          <button className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white">
            Notify me
          </button>

          {/* Demo-only live trigger */}
          <button
            onClick={sendTestAlert}
            disabled={sending}
            className="mt-2 w-full rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary-soft disabled:opacity-60"
          >
            {sending ? "Sending" : "Send test alert (demo)"}
          </button>

          {notice && (
            <p
              className="mt-2 rounded-lg px-3 py-2 text-xs"
              style={{
                background: notice.ok
                  ? "rgba(47, 174, 102, 0.14)"
                  : "rgba(224, 72, 61, 0.14)",
                color: notice.ok ? "var(--status-open)" : "var(--status-closed)",
              }}
              role="status"
            >
              {notice.text}
            </p>
          )}

          <p className="mt-2 text-[11px] text-ink-soft">
            Sign-up storage is not wired yet. The test button sends a real
            message now for the demo.
          </p>
        </div>
      )}
    </div>
  );
}

function ChannelTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-surface text-primary shadow-card"
          : "text-ink-soft hover:text-ink"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function BeachMultiSelect({
  beaches,
  selectedIds,
  onChange,
}: {
  beaches: Beach[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const allSelected =
    beaches.length > 0 && selectedIds.length === beaches.length;

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll() {
    onChange(allSelected ? [] : beaches.map((b) => b.id));
  }

  const summary =
    selectedIds.length === 0
      ? "Select beaches"
      : allSelected
        ? "All beaches"
        : `${selectedIds.length} selected`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-ink focus:outline-none"
        aria-expanded={open}
      >
        <span className={selectedIds.length ? "text-ink" : "text-ink-soft"}>
          {summary}
        </span>
        <svg
          className={`h-4 w-4 text-ink-soft transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[1100] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface p-1 shadow-card">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-alt">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="text-sm font-semibold text-ink">All beaches</span>
          </label>
          <div className="my-1 h-px bg-border" />
          {beaches.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-alt"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(b.id)}
                onChange={() => toggle(b.id)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm text-ink">{b.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
