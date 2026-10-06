import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import { listSuggestions } from "@/lib/queries";
import { deleteSuggestion, markSuggestionHandled } from "@/app/actions/suggestions";
import { prettyDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Suggestions" };

export default async function SuggestionsPage() {
  const rows = await listSuggestions();
  const open = rows.filter((r) => !r.handled);

  return (
    <div className="space-y-4">
      <Notice tone="info">
        These come from the box on the home page. {open.length} still open. The quickest wins on a
        site like this usually come from reading these, not from guessing.
      </Notice>

      {rows.length === 0 ? (
        <div className="card p-6 text-sm text-ink-soft">Nothing yet.</div>
      ) : (
        rows.map((row) => (
          <article key={row.id} className={`card p-5 ${row.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{row.name || "Someone"}</p>
                {row.contact ? <p className="text-sm text-ink-soft">{row.contact}</p> : null}
              </div>
              <span className="text-xs text-ink-faint">{prettyDateTime(row.createdAt)}</span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{row.body}</p>

            <div className="mt-4 flex gap-2 border-t border-line-soft pt-3">
              <form action={markSuggestionHandled}>
                <input type="hidden" name="id" value={row.id} />
                <button className="btn btn-ghost px-3 py-1 text-xs" type="submit">
                  {row.handled ? "Reopen" : "Mark done"}
                </button>
              </form>
              <form action={deleteSuggestion}>
                <input type="hidden" name="id" value={row.id} />
                <button className="px-2 text-xs font-semibold text-brand hover:underline" type="submit">
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
