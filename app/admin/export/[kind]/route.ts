import { NextRequest } from "next/server";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";

/** CSV download of the main tables, for admins only. */

function csv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell === null || cell === undefined ? "" : String(cell);
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ kind: string }> },
) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Not allowed", { status: 403 });
  }

  const { kind } = await context.params;
  let rows: (string | number | null | undefined)[][] = [];

  if (kind === "profiles") {
    const cityById = new Map((await cols.cities.find()).map((c) => [c.id, c]));
    const ownerById = new Map((await cols.users.find()).map((u) => [u.id, u]));
    rows = [
      ["name", "slug", "city", "district", "state", "status", "verification", "phone", "email",
        "events_covered", "jobs_completed", "cancellations", "joined", "referred_by"],
      ...(await cols.photographers.find()).map((p) => {
        const city = cityById.get(p.cityId);
        const owner = ownerById.get(p.userId);
        return [
          p.displayName, p.slug, city?.name, city?.district, city?.state, p.status,
          p.verification, owner?.phone, owner?.email, p.eventsCovered, p.jobsCompleted,
          p.cancellations, p.createdAt.slice(0, 10), p.referredBy,
        ];
      }),
    ];
  } else if (kind === "enquiries") {
    const nameById = new Map(
      (await cols.photographers.find()).map((p) => [p.id, p.displayName]),
    );
    rows = [
      ["created", "photographer", "customer", "phone", "event_date", "type", "city", "budget",
        "status", "quote"],
      ...(await cols.enquiries.find()).map((e) => [
        e.createdAt.slice(0, 10), nameById.get(e.photographerId), e.customerName,
        e.customerPhone, e.eventDate, e.eventType, e.cityName, e.budget, e.status, e.quoteAmount,
      ]),
    ];
  } else if (kind === "bookings") {
    const nameById = new Map(
      (await cols.photographers.find()).map((p) => [p.id, p.displayName]),
    );
    const enquiryById = new Map((await cols.enquiries.find()).map((e) => [e.id, e]));
    rows = [
      ["created", "photographer", "customer", "event_date", "amount", "status"],
      ...(await cols.bookings.find()).map((b) => [
        b.createdAt.slice(0, 10), nameById.get(b.photographerId),
        enquiryById.get(b.enquiryId)?.customerName, b.eventDate, b.amountAgreed, b.status,
      ]),
    ];
  } else if (kind === "reviews") {
    const nameById = new Map(
      (await cols.photographers.find()).map((p) => [p.id, p.displayName]),
    );
    rows = [
      ["created", "photographer", "author", "quality", "punctuality", "delivery", "value",
        "communication", "hidden", "comment"],
      ...(await cols.reviews.find()).map((r) => [
        r.createdAt.slice(0, 10), nameById.get(r.photographerId), r.authorName, r.quality,
        r.punctuality, r.delivery, r.value, r.communication, r.hidden ? "yes" : "no", r.comment,
      ]),
    ];
  } else {
    return new Response("Unknown export", { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookmyshoot-${kind}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
