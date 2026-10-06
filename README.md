# BookMyShoot

A marketplace to find and book photographers, videographers, drone operators and editing
studios anywhere in India. Built with Next.js.

This is the Phase 1 build from the plan document: profiles with photos, rates and a live
calendar, search by state, district, city, date and shoot type, a near me search using the
browser location, booking requests with an in site reply, reviews from completed jobs only,
an admin approval queue and an admin verification queue.

There is **no payment gateway**. The site makes the introduction, blocks the date and keeps the
record. Advance and final payment are settled directly between the customer and the photographer.

---

## Running it

```bash
npm install
cp .env.example .env    # put your MongoDB address in it, see below
npm run seed            # cities, shoot types, your admin login and sample profiles
npm run dev             # http://localhost:3000
```

### The database

This runs on **MongoDB**. Put the address in `.env`:

```
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=bookmyshoot
```

For MongoDB Atlas, paste the connection string Atlas gives you, with your user and password in
it, and allow your IP in Atlas under Network Access.

If `MONGODB_URI` is left empty the site writes to a JSON file in `data/` instead. That is only so
you can open the site before MongoDB is set up. Put the real address in before you go live. The
seed prints which of the two it used, and the Admins tab shows it at the bottom of the page.

Collections: `users`, `cities`, `categories`, `photographers`, `rates`, `add_ons`,
`portfolio_items`, `enquiries`, `bookings`, `reviews`, `messages`, `notifications`,
`site_images`, `suggestions`, `admin_logs`. A profile keeps its shoot types and its busy dates
inside its own document, so there is no join table for either. Indexes are created on their own
the first time the app connects.

### Sample data

`npm run seed` creates 14 sample profiles with rates, photos, bookings and reviews, so the site
has something to show while you set it up. Every one of them is named "Sample ...", and sample
logins are marked `sample` in the database, so a real signup is never mixed up with one of them.

**Admin > Admins > Sample data** removes all of them with one button. You can also delete any
single profile from **Admin > Listings**.

`npm run seed:bare` does the same seed without any sample rows. That is the one for the day you
go live.

For a production build:

```bash
npm run build
npm run start
```

### Logins

After `npm run seed`:

| Role | Email | Password | Delete it? |
| --- | --- | --- | --- |
| Admin, yours | admin@bookmyshoot.in | admin123 | keep, change the password |
| Admin, sample | sample.admin@bookmyshoot.in | sample123 | delete whenever you want |
| Photographer, sample | sample-harman-studios@example.com | sample123 | goes with the sample data |
| Customer, sample | sample.customer@example.com | sample123 | goes with the sample data |

**Change the admin password before the site goes online.**

Every sample photographer uses `sample123` with the email pattern `<profile-slug>@example.com`.
The sample admin is there so you can see how the Admins tab works. Delete it from
**Admin > Admins** the moment you do not need it. The login you are signed in with, and the last
admin left, cannot be deleted, so you cannot lock yourself out.

---

## How a photographer gets on the site

1. He signs up at `/join`. The account is made straight away and he can fill in his profile,
   photos, rates and calendar at once.
2. His dashboard shows **Pending for verification, please wait about 1 hour**. Nothing of his is
   visible in search, on the home page or anywhere else, and his profile page opens only for him
   and for your admins.
3. You open **Admin, Approvals**, look at the profile as it will appear, and either approve it or
   reject it with a written reason. A rejection without a reason is not accepted.
4. The moment you approve, the profile goes live.
5. The **verified tick is a separate step**, on the Verification queue tab. Approval only means the
   profile is real and complete. The tick says what you actually checked about that person.

---

## What is in it

### Public
| Page | Path |
| --- | --- |
| Home with city, date and shoot type search | `/` |
| Search results with filters and sorting | `/search` |
| Photographer profile, with his social links | `/p/[slug]` |
| Uploaded photos | `/media/[name]` |
| City plus shoot type landing page for Google | `/hire/[city]/[category]` |
| All shoot types | `/categories` |
| States, districts and cities | `/cities` |
| How it works | `/how-it-works` |
| Guides and city cost articles | `/guides`, `/guides/[slug]` |
| Compare up to three profiles | `/compare` |
| For photographers | `/join` |
| About, contact, help | `/about`, `/contact`, `/help` |
| Terms, privacy, cancellation, grievance officer | `/terms`, `/privacy`, `/cancellation`, `/grievance` |

### Chat, notifications and shortlist

- **Chat per booking** at `/messages/[enquiry]`, in our own database. Both sides see the whole
  thread, which is the record if there is ever an argument about what was agreed.
- **Notifications** with an unread count on the bell in the header, for new requests, replies,
  messages, approval and reviews. `/notifications` lists them.
- **Shortlist** up to three profiles from the search cards, kept in the browser so nobody has to log
  in, and compare them side by side at `/compare`.

### Photographer dashboard (`/dashboard`)
- Leads with accept or decline, and a quote box. Accepting blocks the date and creates a booking.
- Photos: upload one profile photo, a cover photo and as many gallery photos as you like, plus a
  highlight film link. Each photo must be under 5 MB, and the limit is checked the moment a file is
  picked, so the person reads a plain message instead of a failed upload. Photos are shrunk in the
  browser and resized again on the server, so a phone photo does not slow the site down.
- Bookings: upcoming, waiting to be closed, completed.
- Calendar: three month view plus a tap to switch the next 30 days between free and busy.
- Rates: add or remove rates per hour, per day, per week or as an event package, plus add on charges.
- Profile: bio, travel, gear, crew, delivery promise, weekly off, the total number of events covered
  so far, and links to his Instagram, Facebook, YouTube and website, with a profile strength meter.
- Reviews: one public reply per review.
- Invite: a referral link with a WhatsApp share, and a count of who joined through it.

### Customer account (`/account`)
A deliberately small page. The confirmed booking sits at the top with the date, place, agreed
amount and the photographer's phone number. Below it, requests still waiting for a reply, and
finished shoots with a review form that opens only after the job is marked complete.

### Admin (`/admin`)
- Overview with supply by city and enquiries nobody replied to.
- Verification queue with three levels, each one stating exactly what was checked.
- Listings: pause or restore a profile with a reason, or delete it for good. Sample rows carry a
  "sample" tag here.
- Approvals: every new profile waits here before it goes live, with approve and reject.
- Reviews: hide or unhide, and a reason is required.
- Pictures: upload the photo on each shoot type card, and upload a profile or cover photo on behalf
  of any photographer who has not added one yet.
- Admins: who can open this panel, add one, delete one, and the button that removes every sample
  row the seed created.
- Action log: every admin action with name, time and reason.
- Suggestions: everything sent from the box on the home page.
- Reports: enquiries, reply rate, booking rate, median reply time, demand by city, and CSV
  downloads of profiles, enquiries, bookings and reviews.

---

## How it is built

| Part | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, TypeScript, server components and server actions |
| Styling | Tailwind CSS v4, with a small set of shared classes in `app/globals.css` |
| Database | MongoDB through the official Node driver. A file store stands in when no MONGODB_URI is set |
| Auth | Email and password, scrypt hashed, signed HTTP only session cookie |
| Theme | Light and dark, following the device by default, with a toggle in the header that remembers the choice |
| Photo uploads | Shrunk in the browser, resized with sharp, written to `data/uploads`, served by `/media/[name]`. 5 MB limit per photo, checked on both sides |
| Placeholder images | Generated SVG from `/api/img/[seed]`, used until a real photo is uploaded |
| Location | Every city carries its district, state and coordinates, for district browsing and a near me search |

### Folder map

```
app/
  actions/         server actions: auth, enquiry and booking, photographer, admin
  api/img/         placeholder image generator
  media/           serves uploaded photos from data/uploads
  admin/           admin panel
  dashboard/       photographer dashboard
  account/         customer account
  hire/            city plus shoot type SEO pages
  p/[slug]/        public profile
components/        logo, header, footer, search bar, cards, filters, gallery, calendar, forms
db/                document types, the MongoDB client, the file store stand in
lib/               constants, formatting, auth helpers, geo distance, storage, all queries
scripts/seed.ts    cities, shoot types, your admin login and the sample rows
tests/e2e.mjs      browser test of the main flows
tests/admin-test.mjs  browser test of the admin deletes and the sample data button
```

### Tests

```bash
npm i -D playwright && npx playwright install chromium
npm run build && npm run start
BASE_URL=http://localhost:3000 node tests/e2e.mjs
BASE_URL=http://localhost:3000 node tests/admin-test.mjs
npm run seed        # reset the sample data afterwards
```

The test covers search, profile, gallery, sending an enquiry, the photographer accepting it,
the calendar toggle, adding a rate, saving the profile, photo uploads, the near me and district
searches, the admin verification flow and the admin log, plus a check that nothing scrolls
sideways on a phone. `tests/admin-test.mjs` covers adding and deleting an admin, deleting a
profile, and the button that clears the sample data. It empties the sample rows as it runs, so
seed again afterwards.

---

## The home page

Top to bottom: a hero with photos sliding behind the booking box, a slider of profiles you can book
today, the shoot types, a price guide, real work, how it works, and the FAQ beside a suggestion box.

- **Hero slideshow.** Ten to fifteen wide photos crossfading behind the search box. Upload yours in
  Admin, Pictures, under "Home page slideshow", and reorder or remove them there. Until you do, the
  site shows plain generated pictures so nothing looks broken.
- **Front page slider.** Profiles slide on their own, pause when the mouse is over them, and have
  arrows. Pick which profiles appear in Admin, Pictures, under "Front page slider". Turn them all
  off and the site falls back to the highest rated profiles on its own.
- **Trust line** under the search box: no payment on the site, only people free on your date,
  reviews only from finished jobs.
- **Shoot types** with a live count of profiles in each.
- **Price guide** worked out from the starting rates on live profiles, not a made up number.
- **Real work** from approved profiles.
- **FAQ on the left, a suggestion box on the right.** Anyone can leave a suggestion without logging
  in. They land in Admin, Suggestions, where you can mark them done or delete them.

## Search engines

- JSON-LD on every page that matters: the profile as a ProfessionalService with its rating and
  price, the city pages as an ItemList with an FAQ, guides as Articles, and breadcrumbs throughout.
- `sitemap.xml` covers every city, shoot type, guide and live profile.
- The guides in `content/guides.ts` are plain text files. Edit them, add more, no database needed.

## Installable on a phone

A web app manifest and a service worker make the site installable from the browser, with an offline
page when the network drops. Nothing private is ever cached: the dashboard, admin, account,
messages and notifications are skipped on purpose.

## Keeping spam out

The enquiry form has a hidden field that only a bot fills in, a check that rejects a form submitted
in under three seconds, and a limit of six requests an hour per phone number and two a day to the
same photographer.

## Look and feel

- **Dark by default, light on request.** The site opens dark. The toggle in the header switches to
  light and the choice is remembered. A small script runs before the first paint, so the page never
  flashes the wrong colour.
- **One brand colour,** a deep violet, on neutral charcoal. Green, amber and red appear only as
  status colours, never as the theme.
- **The hero.** Blurred pictures of every shoot type slide slowly behind the search box, and a
  camera at the side throws a beam of light onto it. Both are decoration: they are hidden from
  screen readers and ignore the mouse.
- **Movement.** Cards lift and their picture leans in on hover, header links grow an underline, and
  the primary button catches a sweep of light. Every one of these stops when the device asks for
  reduced motion, which is a setting many people use.

## Putting real pictures in

Three ways, use whichever suits you.

1. **Photographer uploads his own.** Dashboard, Photos tab: profile photo, cover photo and gallery
   photos. This is the normal route once the site is live.
2. **Admin uploads for him.** Admin, Pictures tab. Most photographers will not fill their profile at
   the start, so you can do it for them, with their permission. The same page holds the picture on
   each shoot type card that shows on the home page.
3. **Bulk import from a folder.** Drop files into `import-images/` named after the slug, then run:

   ```bash
   npm run import-images
   ```

   `import-images/categories/wedding.jpg` fills the Wedding photography card.
   `import-images/photographers/harman-studios-cover.jpg` fills that profile's cover photo.
   `import-images/README.txt` lists every file name.

Any card with no real picture falls back to a generated gradient, so the site never looks broken.
The three floating cards on the home page are simply the top three Work verified profiles, so they
show real photos as soon as those profiles have a cover photo.

Only upload pictures you own or have bought a licence for.

## If an upload fails

Server actions in Next.js carry a request size limit. It is set to 32 MB in `next.config.ts`
(`experimental.serverActions.bodySizeLimit`). Without that, a large photo fails with a bare
"Failed to fetch" and nothing in the logs. If you ever raise the 5 MB per photo limit in
`components/file-picker.tsx` and `lib/storage.ts`, raise this one too.

## How the database layer is put together

Everything goes through `db/client.ts`, which exports one object called `cols` with a handle per
collection. The calls are the MongoDB ones: `find`, `findOne`, `insertOne`, `updateOne`,
`deleteMany` and so on, with normal MongoDB filters.

```ts
const live = await cols.photographers.find(
  { status: "APPROVED", active: true, categoryIds: weddingId },
  { sort: { jobsCompleted: -1 }, limit: 10 },
);
```

Two small things that layer does for you:

- The application `id` is stored as the MongoDB `_id`, and the mapping happens in that one file,
  so the rest of the code only ever says `id`.
- With no `MONGODB_URI` the same calls run against a JSON file, which is how the site works before
  MongoDB is set up. The application code is identical either way.

So if you ever want to move to another database, `db/client.ts` is the only file to rewrite.

---

## Before this goes live

These are build level gaps, not bugs. They are deliberate, and each one is a known next step.

1. **Phone OTP login.** Right now it is email and password. Indian users expect an OTP. Add MSG91
   or Twilio and keep the same session code.
1b. **Tell the photographer when he is approved.** Approval works, but he only finds out by opening
   his dashboard. Send an SMS or a WhatsApp message from the approve action.
2. **Move photo storage off the server disk.** Uploads work and are resized, but they are written
   to `data/uploads` on the machine running the app. On a host with a read only filesystem, such as
   Vercel, replace the two functions in `lib/storage.ts` with an S3 or Cloudinary upload. Nothing
   else in the code changes.
3. **Chat between the two sides.** Today the phone number opens on acceptance. A message thread per
   booking keeps a record, which matters when there is a dispute.
4. **WhatsApp and SMS alerts** for new leads, through the official WhatsApp Business API only.
   Unofficial tools get the number banned.
5. **Verification document upload.** The admin can set a level, but photographers cannot yet send
   ID documents through the site. Keep those out of the public photo folder when you add it.
6. **Legal pages.** `/terms`, `/privacy`, `/cancellation` and `/grievance` are working drafts with
   placeholders in square brackets. Have a lawyer finalise them and fill the grievance officer's real
   name, email and address before launch.
7. **Rate limiting and spam control** on the enquiry form, and an abuse report button on photos.
8. **Set `SESSION_SECRET`** to a long random value in production. The one in `.env.example` is a
   placeholder.

## Environment variables

```
MONGODB_URI=mongodb://127.0.0.1:27017 # empty means the local JSON file
MONGODB_DB=bookmyshoot                # optional, this is the default
UPLOAD_DIR=./data/uploads             # optional, this is the default
SESSION_SECRET=<long random string>
SITE_URL=https://your-domain.in       # used by sitemap.xml and robots.txt
```
