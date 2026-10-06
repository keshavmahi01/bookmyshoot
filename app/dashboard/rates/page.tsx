import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getPhotographerByUserId } from "@/lib/queries";
import { addAddOn, addRate, removeAddOn, removeRate } from "@/app/actions/photographer";
import { RATE_TYPES, rateLabel, rateUnit } from "@/lib/constants";
import { rupees } from "@/lib/format";

export const metadata: Metadata = { title: "Rates" };

export default async function RatesPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-bold">Your rates</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Switch on any of the four types. Customers see the lowest one as your starting price.
        </p>
        <div className="grid gap-3">
          {detail.rates.map((rate) => (
            <div key={rate.id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{rate.title}</p>
                <p className="text-xs uppercase tracking-wide text-ink-faint">{rateLabel(rate.type)}</p>
                <p className="mt-1 text-sm text-ink-soft">{rate.details}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {rupees(rate.amount)}
                  <span className="text-sm font-normal text-ink-faint"> / {rateUnit(rate.type)}</span>
                </p>
                <form action={removeRate} className="mt-2">
                  <input suppressHydrationWarning type="hidden" name="rateId" value={rate.id} />
                  <button suppressHydrationWarning className="text-xs font-semibold text-brand hover:underline" type="submit">
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
          {detail.rates.length === 0 ? (
            <div className="card p-5 text-sm text-ink-soft">
              No rates yet. A profile with no rate rarely gets an enquiry.
            </div>
          ) : null}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Add a rate</h2>
        <form action={addRate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="type">Rate type</label>
            <select suppressHydrationWarning id="type" name="type" className="field">
              {RATE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="title">Title</label>
            <input suppressHydrationWarning id="title" name="title" className="field" placeholder="Two day wedding, photo and video" required />
          </div>
          <div>
            <label className="field-label" htmlFor="amount">Amount in rupees</label>
            <input suppressHydrationWarning id="amount" name="amount" inputMode="numeric" className="field" required />
          </div>
          <div>
            <label className="field-label" htmlFor="minUnits">Minimum units</label>
            <input suppressHydrationWarning id="minUnits" name="minUnits" inputMode="numeric" className="field" defaultValue={1} />
          </div>
          <div>
            <label className="field-label" htmlFor="extraUnitRate">Extra hour or day rate</label>
            <input suppressHydrationWarning id="extraUnitRate" name="extraUnitRate" inputMode="numeric" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="details">What is included</label>
            <input suppressHydrationWarning id="details" name="details" className="field" placeholder="2 shooters, 300 photos, 1 album" />
          </div>
          <div className="sm:col-span-2">
            <button suppressHydrationWarning className="btn btn-primary" type="submit">Add rate</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-bold">Add on charges</h2>
        <p className="mb-3 text-sm text-ink-soft">
          List these openly. Hidden charges are the main reason customers argue later.
        </p>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {detail.addOns.map((a) => (
                <tr key={a.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-2 font-medium">{a.label}</td>
                  <td className="px-4 py-2 text-ink-faint">{a.note}</td>
                  <td className="px-4 py-2 text-right font-semibold">{rupees(a.amount)}</td>
                  <td className="px-4 py-2 text-right">
                    <form action={removeAddOn}>
                      <input suppressHydrationWarning type="hidden" name="addOnId" value={a.id} />
                      <button suppressHydrationWarning className="text-xs font-semibold text-brand hover:underline" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {detail.addOns.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-ink-faint" colSpan={4}>Nothing listed yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <form action={addAddOn} className="card mt-3 grid gap-3 p-5 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="label">Charge</label>
            <input suppressHydrationWarning id="label" name="label" className="field" placeholder="Drone coverage" required />
          </div>
          <div>
            <label className="field-label" htmlFor="addon-amount">Amount</label>
            <input suppressHydrationWarning id="addon-amount" name="amount" inputMode="numeric" className="field" required />
          </div>
          <div>
            <label className="field-label" htmlFor="note">Note</label>
            <input suppressHydrationWarning id="note" name="note" className="field" placeholder="per day, permissions extra" />
          </div>
          <div className="sm:col-span-3">
            <button suppressHydrationWarning className="btn btn-primary" type="submit">Add charge</button>
          </div>
        </form>
      </section>
    </div>
  );
}
