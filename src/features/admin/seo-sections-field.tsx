"use client";

import { Input } from "@/components/ui/input";

export type SeoSectionItem = { heading: string; body: string };

function asSections(value: unknown): SeoSectionItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((it) => {
    const o = (it ?? {}) as Record<string, unknown>;
    return {
      heading: typeof o.heading === "string" ? o.heading : "",
      body: typeof o.body === "string" ? o.body : "",
    };
  });
}

/** Add/remove/edit the home-page SEO content blocks. Each block has a heading
 * and a body; `{store}` is replaced with the store name on the storefront, and
 * blank lines in the body separate paragraphs. */
export function SeoSectionsField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: SeoSectionItem[]) => void;
}) {
  const sections = asSections(value);

  function update(i: number, patch: Partial<SeoSectionItem>) {
    onChange(sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function remove(i: number) {
    onChange(sections.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...sections, { heading: "", body: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.length === 0 && (
        <p className="text-xs text-ink/45">
          No content sections — add your first below.
        </p>
      )}

      {sections.map((section, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border border-ink/10 bg-surface/40 p-3"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center bg-ink/5 text-[11px] font-semibold text-ink/50">
              {i + 1}
            </span>
            <Input
              value={section.heading}
              placeholder="Heading (e.g. {store} — No. 1 Suppliers…)"
              onChange={(e) => update(i, { heading: e.target.value })}
              className="flex-1"
            />
            <button
              type="button"
              aria-label="Remove section"
              title="Remove section"
              onClick={() => remove(i)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-red-600 transition hover:bg-red-50 hover:text-red-700"
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
          <textarea
            value={section.body}
            placeholder="Body text. Leave a blank line between paragraphs. Use {store} for the store name."
            onChange={(e) => update(i, { body: e.target.value })}
            rows={5}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex h-9 w-fit items-center gap-1.5 border border-dashed border-ink/25 px-3 text-sm font-medium text-ink/70 transition hover:border-primary hover:text-primary"
      >
        <span className="text-base leading-none">+</span> Add section
      </button>
    </div>
  );
}
