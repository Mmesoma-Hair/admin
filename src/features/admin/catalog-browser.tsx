"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { adminCall } from "@/lib/admin-client";
import type { AdminProduct } from "@/types/catalog";

type View = "grid" | "list";
const STORAGE_KEY = "admin_catalog_view";

export function CatalogBrowser({ products }: { products: AdminProduct[] }) {
  const [view, setView] = useState<View>("grid");
  const [items, setItems] = useState<AdminProduct[]>(products);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as View | null;
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);

  // Keep local state in sync if the server re-renders with fresh products.
  useEffect(() => {
    setItems(products);
  }, [products]);

  function choose(v: View) {
    setView(v);
    window.localStorage.setItem(STORAGE_KEY, v);
  }

  async function remove(p: AdminProduct) {
    if (
      !window.confirm(
        `Delete "${p.title}"? This permanently removes the product and its variants.`,
      )
    )
      return;
    setError(null);
    setDeletingId(p.id);
    try {
      await adminCall(`/catalog/products/${p.id}/`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== p.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Banner tone="error">{error}</Banner>}

      <div className="flex justify-end">
        <div className="inline-flex border border-ink/15 bg-white">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-label={`${v} view`}
              aria-pressed={view === v}
              onClick={() => choose(v)}
              className={`inline-flex h-9 w-10 items-center justify-center transition ${
                view === v
                  ? "bg-primary text-white"
                  : "text-ink/60 hover:bg-ink/5"
              }`}
            >
              {v === "grid" ? <GridIcon /> : <ListIcon />}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No products yet. Create your first one.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col border border-ink/10 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
            >
              <Link href={`/catalog/${p.id}`} className="flex flex-1 flex-col">
                <div className="relative aspect-square overflow-hidden bg-surface">
                  {p.primary_image ? (
                    <Image
                      src={p.primary_image}
                      alt={p.title}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-ink/30">
                      No image
                    </span>
                  )}
                  {!p.is_active && (
                    <span className="absolute left-2 top-2">
                      <Badge tone="danger">inactive</Badge>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <span className="truncate text-sm font-medium text-ink group-hover:text-primary">
                    {p.title}
                  </span>
                  <span className="text-xs text-ink/50">
                    {p.variant_count} variant{p.variant_count === 1 ? "" : "s"}
                    {p.price_from ? ` · from ${p.price_from}` : ""}
                  </span>
                </div>
              </Link>
              <DeleteButton
                onClick={() => remove(p)}
                disabled={deletingId === p.id}
                title={`Delete ${p.title}`}
                className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur transition hover:bg-red-600 hover:text-white disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((p) => (
                <tr key={p.id} className="transition hover:bg-ink/[0.015]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/catalog/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-ink/10 bg-surface">
                        {p.primary_image ? (
                          <Image
                            src={p.primary_image}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">
                          {p.title}
                        </span>
                        <span className="font-mono text-xs text-ink/45">
                          /p/{p.short_id}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.variant_count}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {p.price_from ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.is_active ? "success" : "danger"}>
                      {p.is_active ? "active" : "inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      onClick={() => remove(p)}
                      disabled={deletingId === p.id}
                      title={`Delete ${p.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeleteButton({
  onClick,
  disabled,
  title,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={className}
    >
      <TrashIcon />
    </button>
  );
}

function TrashIcon() {
  return (
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
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
