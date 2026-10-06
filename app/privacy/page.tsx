import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="1 October 2026">
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, mobile number, email and password, which is stored hashed.</li>
        <li>For photographers: city, work samples, rates, calendar, gear and identity documents sent for verification.</li>
        <li>For customers: the details you put in a booking request, such as date, venue, budget and your message.</li>
        <li>Basic usage logs, such as pages visited and the device used, to keep the site working.</li>
      </ul>
      <h2>Why we collect it</h2>
      <p>
        To run the listing and booking service, to verify photographers, to show accurate search
        results, to contact you about a booking and to deal with complaints.
      </p>
      <h2>Who sees your details</h2>
      <p>
        A customer&apos;s phone number is shown only to the photographer the request was sent to. It
        is not sold, shared with other photographers or used for marketing by anyone else. Identity
        documents sent for verification are seen only by our verification team and are never shown on
        the site.
      </p>
      <h2>Your rights</h2>
      <p>
        Under the Digital Personal Data Protection Act you may ask us for a copy of your data, ask us
        to correct it, or ask us to delete your account. Write to {SITE.email} and we will act within
        30 days.
      </p>
      <h2>How long we keep it</h2>
      <p>
        Account and booking records are kept while your account is open and for as long as the law
        requires afterwards. Verification documents are deleted once the badge is withdrawn or the
        account is closed.
      </p>
      <h2>Cookies</h2>
      <p>
        We use one cookie to keep you logged in. We do not run advertising trackers on this site.
      </p>
      <h2>Contact</h2>
      <p>Write to {SITE.email} for anything about your data.</p>
    </LegalPage>
  );
}
