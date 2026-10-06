import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/photo";
import { Notice } from "@/components/ui";
import { markThreadRead, sendMessage, threadAccess, threadMessages } from "@/app/actions/chat";
import { prettyDate, prettyDateTime, rupees } from "@/lib/format";

export const metadata: Metadata = { title: "Messages" };

type Props = { params: Promise<{ id: string }> };

export default async function ThreadPage({ params }: Props) {
  const { id } = await params;
  const access = await threadAccess(id);
  if (!access) notFound();

  await markThreadRead(id);
  const list = await threadMessages(id);
  const { enquiry, profile, role } = access;
  const backHref = role === "PHOTOGRAPHER" ? "/dashboard" : "/account";
  const otherName = role === "PHOTOGRAPHER" ? enquiry.customerName : profile.displayName;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={backHref} className="text-sm font-semibold text-brand hover:underline">
        Back
      </Link>

      <header className="card mt-4 p-4">
        <div className="flex items-center gap-3">
          {role === "CUSTOMER" ? (
            <Avatar src={profile.avatarPath} name={profile.displayName} size={44} />
          ) : (
            <Avatar name={enquiry.customerName} size={44} />
          )}
          <div className="min-w-0">
            <p className="font-bold">{otherName}</p>
            <p className="truncate text-sm text-ink-soft">
              {enquiry.eventType} &middot; {prettyDate(enquiry.eventDate)} &middot; {enquiry.cityName}
            </p>
          </div>
          <span className="ml-auto rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-faint">
            {enquiry.status.toLowerCase()}
          </span>
        </div>
        {enquiry.quoteAmount ? (
          <p className="mt-3 border-t border-line-soft pt-3 text-sm text-ink-soft">
            Quote: <strong className="text-ink">{rupees(enquiry.quoteAmount)}</strong>
            {enquiry.quoteNote ? ` · ${enquiry.quoteNote}` : ""}
          </p>
        ) : null}
      </header>

      <Notice tone="info">
        Keep the money talk here in writing. If there is ever a complaint, this thread is the record
        both sides can point to. No payment goes through BookMyShoot.
      </Notice>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            No messages yet. Say hello and ask whatever you need to know.
          </p>
        ) : (
          list.map((m) => {
            const mine = m.senderRole === role;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-brand text-white"
                      : "border border-line bg-surface text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-ink-faint"}`}>
                    {prettyDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={sendMessage} className="card mt-5 p-3">
        <input type="hidden" name="enquiryId" value={id} />
        <label className="sr-only" htmlFor="body">Your message</label>
        <textarea
          id="body"
          name="body"
          rows={3}
          className="field"
          placeholder="Type your message"
          required
          maxLength={2000}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-faint">Both sides can see everything in this thread.</p>
          <button className="btn btn-primary" type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}
