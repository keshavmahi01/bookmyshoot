import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = { title: "Grievance officer" };

export default function GrievancePage() {
  return (
    <LegalPage title="Grievance officer" updated="1 October 2026">
      <p>
        As required under the Information Technology (Intermediary Guidelines and Digital Media Ethics
        Code) Rules, the details of our grievance officer are published below. Fill in your real
        details here before the site goes live.
      </p>
      <h2>Officer details</h2>
      <ul>
        <li>Name: [officer name]</li>
        <li>Designation: Grievance Officer</li>
        <li>Email: grievance@[your-domain]</li>
        <li>Address: [registered office address]</li>
        <li>Phone: [phone number], working hours 10 am to 6 pm, Monday to Friday</li>
      </ul>
      <h2>What you can report</h2>
      <ul>
        <li>A photo on this site that belongs to you and was uploaded by someone else.</li>
        <li>A photo that shows you or your family and that you want taken down.</li>
        <li>A fake profile, a false claim or a misleading review.</li>
        <li>Any other content you believe breaks the law.</li>
      </ul>
      <h2>How fast we act</h2>
      <p>
        We acknowledge a complaint within 24 hours and resolve it within 15 days. Content that must
        come down by law is removed within 36 hours of a valid notice.
      </p>
    </LegalPage>
  );
}
