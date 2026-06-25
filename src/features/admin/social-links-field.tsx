"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

import {
  SOCIAL_ICON_OPTIONS,
  SocialIcon,
} from "./social-icons";

export type SocialLinkItem = { name: string; url: string; icon: string };

function asLinks(value: unknown): SocialLinkItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((it) => {
    const o = (it ?? {}) as Record<string, unknown>;
    return {
      name: typeof o.name === "string" ? o.name : "",
      url: typeof o.url === "string" ? o.url : "",
      icon: typeof o.icon === "string" ? o.icon : "website",
    };
  });
}

/** Add/remove/edit footer social links, each with a name, URL and icon
 * (chosen from a popup of available icons). */
export function SocialLinksField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: SocialLinkItem[]) => void;
}) {
  const links = asLinks(value);
  const [picker, setPicker] = useState<number | null>(null);

  function update(i: number, patch: Partial<SocialLinkItem>) {
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function remove(i: number) {
    onChange(links.filter((_, idx) => idx !== i));
    setPicker(null);
  }
  function add() {
    onChange([...links, { name: "", url: "", icon: "instagram" }]);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {links.length === 0 && (
        <p className="text-xs text-ink/45">
          No social links yet — add your first below.
        </p>
      )}

      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          {/* Icon picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="Choose icon"
              title="Choose icon"
              onClick={() => setPicker((p) => (p === i ? null : i))}
              className="inline-flex h-10 w-10 items-center justify-center border border-ink/15 bg-white text-ink transition hover:border-primary hover:text-primary"
            >
              <SocialIcon icon={link.icon} />
            </button>
            {picker === i && (
              <>
                {/* click-away */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setPicker(null)}
                />
                <div className="absolute left-0 top-12 z-30 w-64 border border-ink/15 bg-white p-2 shadow-card-hover">
                  <div className="grid grid-cols-4 gap-1">
                    {SOCIAL_ICON_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        title={opt.label}
                        aria-label={opt.label}
                        aria-pressed={link.icon === opt.key}
                        onClick={() => {
                          update(i, { icon: opt.key });
                          setPicker(null);
                        }}
                        className={`inline-flex h-12 flex-col items-center justify-center gap-0.5 transition ${
                          link.icon === opt.key
                            ? "bg-primary text-white"
                            : "text-ink/70 hover:bg-ink/5"
                        }`}
                      >
                        <SocialIcon icon={opt.key} />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Input
            value={link.name}
            placeholder="Name (e.g. Instagram)"
            onChange={(e) => update(i, { name: e.target.value })}
            className="w-40"
          />
          <Input
            value={link.url}
            placeholder="https://…"
            onChange={(e) => update(i, { url: e.target.value })}
            className="flex-1"
          />
          <button
            type="button"
            aria-label={`Remove ${link.name || "link"}`}
            title="Remove"
            onClick={() => remove(i)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex h-9 w-fit items-center gap-1.5 border border-dashed border-ink/25 px-3 text-sm font-medium text-ink/70 transition hover:border-primary hover:text-primary"
      >
        <span className="text-base leading-none">+</span> Add link
      </button>
    </div>
  );
}
