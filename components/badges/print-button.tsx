"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
      onClick={() => window.print()}
    >
      列印 / 另存 PDF
    </button>
  );
}
