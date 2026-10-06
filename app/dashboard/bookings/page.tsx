import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { bookingsForPhotographer, enquiriesForPhotographer, getPhotographerByUserId } from "@/lib/queries";
import { markBookingComplete } from "@/app/actions/enquiry";
import { prettyDate, rupees, toISODate } from "@/lib/format";
import type { Booking, Enquiry } from "@/db/schema";

export const metadata: Metadata = { title: "Bookings" };

type Row = { booking: Booking; enquiry: Enquiry | undefined };

function BookingTable({
  title,
  rows,
  showAction,
  empty,
}: {
  title: string;
  rows: Row[];
  showAction?: boolean;
  empty: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Event date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Agreed</th>
              <th className="px-4 py-2">Phone</th>
              {showAction ? <th className="px-4 py-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-ink-faint" colSpan={showAction ? 6 : 5}>{empty}</td>
              </tr>
            ) : (
              rows.map(({ booking, enquiry }) => (
                <tr key={booking.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-2 font-medium">{enquiry?.customerName ?? "Customer"}</td>
                  <td className="px-4 py-2">{prettyDate(booking.eventDate)}</td>
                  <td className="px-4 py-2 text-ink-soft">{enquiry?.eventType ?? ""}</td>
                  <td className="px-4 py-2">
                    {booking.amountAgreed ? rupees(booking.amountAgreed) : "—"}
                  </td>
                  <td className="px-4 py-2">{enquiry?.customerPhone ?? ""}</td>
                  {showAction ? (
                    <td className="px-4 py-2">
                      <form action={markBookingComplete}>
                        <input suppressHydrationWarning type="hidden" name="bookingId" value={booking.id} />
                        <button suppressHydrationWarning className="btn btn-ghost px-3 py-1 text-xs" type="submit">
                          Mark complete
                        </button>
                      </form>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function BookingsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  const all = await bookingsForPhotographer(detail.profile.id);
  const enquiryById = new Map(
    (await enquiriesForPhotographer(detail.profile.id)).map((e) => [e.id, e]),
  );
  const rows: Row[] = all.map((booking) => ({ booking, enquiry: enquiryById.get(booking.enquiryId) }));
  const today = toISODate(new Date());

  const upcoming = rows.filter((r) => r.booking.status === "CONFIRMED" && r.booking.eventDate >= today);
  const toClose = rows.filter((r) => r.booking.status === "CONFIRMED" && r.booking.eventDate < today);
  const done = rows.filter((r) => r.booking.status === "COMPLETED").slice(-10).reverse();

  return (
    <div className="space-y-8">
      <BookingTable title="Upcoming" rows={upcoming} empty="No confirmed bookings ahead." />
      <BookingTable
        title="Waiting to be closed"
        rows={toClose}
        showAction
        empty="Nothing waiting. Mark a job complete once the files are delivered, so the customer can review you."
      />
      <BookingTable title="Completed" rows={done} empty="No completed bookings yet." />
    </div>
  );
}
