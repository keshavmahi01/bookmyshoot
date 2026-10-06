import type { Metadata } from "next";
import { adminLogRows } from "@/lib/queries";
import { prettyDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Action log" };

export default async function AdminLogPage() {
  const rows = await adminLogRows();

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
            <th className="px-4 py-2">When</th>
            <th className="px-4 py-2">Admin</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Target</th>
            <th className="px-4 py-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line-soft last:border-0">
              <td className="px-4 py-2 text-ink-soft">{prettyDateTime(row.createdAt)}</td>
              <td className="px-4 py-2 font-medium">{row.actor}</td>
              <td className="px-4 py-2">{row.action}</td>
              <td className="px-4 py-2 text-ink-soft">{row.target}</td>
              <td className="px-4 py-2 text-ink-soft">{row.reason}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-ink-faint" colSpan={5}>
                Nothing logged yet. Every verification, pause and hidden review will appear here.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
