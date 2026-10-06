import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="1 October 2026">
      <h2>1. What this platform is</h2>
      <p>
        {SITE.name} is a listing and introduction platform. We let customers find photographers,
        videographers, drone operators and editing studios, and send them a booking request. We are
        not the service provider. We do not shoot, edit or deliver any work ourselves.
      </p>
      <h2>2. The contract is between you and the photographer</h2>
      <p>
        Any shoot booked through this site is a contract between the customer and the photographer.
        Price, advance, delivery time, cancellation terms and ownership of the files are agreed
        between the two of you. {SITE.name} is not a party to that contract and does not guarantee
        that any shoot will take place or that the work will meet your expectations.
      </p>
      <h2>3. No payment is taken here</h2>
      <p>
        We do not collect payment for shoots. Do not send money to {SITE.name} for a booking. If
        anybody asks you to, report it to us at once.
      </p>
      <h2>4. Verification badges</h2>
      <p>
        A verification badge states only what we checked. The badge page sets out exactly what each
        level means. A badge is not a promise about the quality of anyone&apos;s work, their conduct,
        or whether they will turn up.
      </p>
      <h2>5. Content you upload</h2>
      <p>
        Photographers may upload only work they own or have the right to show. By uploading, you
        confirm you hold that right and that you have permission to display any people in the photos.
        We remove content on a valid complaint and may drop a profile back to an unverified level or
        remove it entirely.
      </p>
      <h2>6. Reviews</h2>
      <p>
        Only a customer whose booking was marked complete on this site may write a review. We do not
        write, edit or buy reviews. A review is hidden only for a stated reason, and that action is
        logged.
      </p>
      <h2>7. Account and conduct</h2>
      <p>
        Keep your login details safe. Do not post false information, impersonate anyone, scrape the
        site, or send unsolicited marketing to users you meet here.
      </p>
      <h2>8. Our liability</h2>
      <p>
        To the extent allowed by law, {SITE.name} is not liable for loss arising out of a shoot
        booked through the platform, including a photographer not turning up, poor work, late
        delivery or lost files.
      </p>
      <h2>9. Grievance officer</h2>
      <p>
        As required under the Information Technology rules, our grievance officer&apos;s name, email
        and address are published on the grievance page.
      </p>
      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of India. Courts at [city] have jurisdiction.</p>
    </LegalPage>
  );
}
