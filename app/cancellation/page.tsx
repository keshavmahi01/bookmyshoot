import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = { title: "Cancellation policy" };

export default function CancellationPage() {
  return (
    <LegalPage title="Cancellation policy" updated="1 October 2026">
      <p>
        No money passes through BookMyShoot, so refunds are settled between the customer and the
        photographer. This page sets out what we expect from both sides, and what we record.
      </p>
      <h2>If the customer cancels</h2>
      <ul>
        <li>Tell the photographer as early as you can, in the chat, so it is recorded.</li>
        <li>Any advance already paid is refunded on the terms the two of you agreed in writing.</li>
        <li>The date is released on the photographer&apos;s calendar once he marks the booking cancelled.</li>
      </ul>
      <h2>If the photographer cancels</h2>
      <ul>
        <li>Any advance taken should be returned in full unless the written agreement says otherwise.</li>
        <li>The cancellation is counted on his public profile for the next 12 months.</li>
        <li>Repeated cancellations lead to a verification badge being withdrawn, and then removal.</li>
      </ul>
      <h2>What we recommend you agree in writing</h2>
      <ul>
        <li>How much advance is payable, and when.</li>
        <li>How much of it is refundable, and up to how many days before the event.</li>
        <li>What happens if the event is postponed rather than cancelled.</li>
        <li>Who pays travel and stay already booked.</li>
      </ul>
      <h2>Disputes</h2>
      <p>
        Raise a complaint from your account and our team will look at the chat record of the booking.
        We can suspend a profile and record what happened, but we cannot order a refund, because the
        payment never came to us.
      </p>
    </LegalPage>
  );
}
