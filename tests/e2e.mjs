/**
 * End to end check of the main flows.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   npm run build && npm run start      (in one terminal)
 *   node tests/e2e.mjs                  (in another)
 *
 * It writes real data into the database, so run `npm run seed` afterwards
 * to get back to clean demo data.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = [];
const check = (name, ok, extra = "") => {
  const line = `${ok ? "PASS" : "FAIL"}  ${name}${extra ? " :: " + extra : ""}`;
  results.push(line);
  console.log(line);
};

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

// 1. Home search
await page.goto(BASE, { waitUntil: "networkidle" });
await page.selectOption("#city", "mohali");
await page.selectOption("#category", "wedding");
await page.click('button[type="submit"]:has-text("Search")');
await page.waitForURL(/\/search\?/);
const cards = await page.locator("article").count();
check("home search returns results", cards > 0, `${cards} cards`);

// 2. Open a profile
await page.goto(`${BASE}/p/sample-simran-kaur-photography`, { waitUntil: "networkidle" });
check("profile loads", (await page.locator("h1").first().innerText()).includes("Simran"));
check("rates shown", await page.locator("text=Rates").first().isVisible());
check("calendar shown", await page.locator("text=Availability").first().isVisible());

// 3. Gallery lightbox
await page.locator("section:has(h2:text('Work')) button").first().click();
await page.waitForTimeout(400);
check("gallery lightbox opens", await page.locator('[role="dialog"]').isVisible());
await page.locator('[role="dialog"] button:has-text("Close")').click();

// 4. Send an enquiry as a guest
await page.fill("#customerName", "Test Customer");
await page.fill("#customerPhone", "9876543210");
const d = new Date(); d.setDate(d.getDate() + 90);
const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
await page.fill("#eventDate", iso);
await page.fill("#cityName", "Mohali");
await page.fill("#budget", "80000");
await page.fill("#message", "Automated test enquiry");
await page.click('button:has-text("Send booking request")');
await page.waitForTimeout(2500);
check("enquiry submitted", await page.locator("text=Request sent").isVisible());

// 5. Photographer logs in and sees the lead
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill("#email", "sample-simran-kaur-photography@example.com");
await page.fill("#password", "sample123");
await page.click('button:has-text("Log in")');
await page.waitForURL(/\/dashboard/, { timeout: 15000 });
await page.locator("text=New requests").first().waitFor({ timeout: 15000 }).catch(() => {});
check("photographer dashboard loads", await page.locator("text=New requests").first().isVisible());
await page.locator("text=Test Customer").first().waitFor({ timeout: 15000 }).catch(() => {});
check("new lead visible", await page.locator("text=Test Customer").first().isVisible());

// 6. Accept the lead
await page.locator('form:has(button:has-text("Accept and block date"))').first().locator('input[name="quoteAmount"]').fill("85000");
await page.locator('form:has(button:has-text("Accept and block date"))').first().locator('input[name="quoteNote"]').fill("2 shooters, album included");
await page.click('button:has-text("Accept and block date")');
await page.waitForTimeout(2500);
check("lead accepted", !(await page.locator('button:has-text("Accept and block date")').first().isVisible().catch(() => false)) || (await page.locator("text=ACCEPTED").first().isVisible().catch(() => false)));

// 7. Calendar toggle
await page.goto(`${BASE}/dashboard/calendar`, { waitUntil: "networkidle" });
const calSection = page.locator('section:has(h2:text("Mark the next 30 days"))');
const firstBtn = calSection.locator('form button[type="submit"]').first();
const before = await firstBtn.innerText();
await firstBtn.click();
await page.waitForTimeout(1800);
const after = await page.locator('section:has(h2:text("Mark the next 30 days")) form button[type="submit"]').first().innerText();
check("calendar date toggles", before !== after, `${before.replace(/\n/g," ")} -> ${after.replace(/\n/g," ")}`);

// 8. Rates page add a rate
await page.goto(`${BASE}/dashboard/rates`, { waitUntil: "networkidle" });
await page.fill("#title", "Test hourly rate");
await page.fill("#amount", "3999");
await page.click('button:has-text("Add rate")');
await page.waitForTimeout(1500);
check("rate added", await page.locator("text=Test hourly rate").first().isVisible());

// 9. Profile edit save
await page.goto(`${BASE}/dashboard/profile`, { waitUntil: "networkidle" });
await page.fill("#tagline", "Woman photographer for weddings and family functions");
await page.click('button:has-text("Save profile")');
await page.waitForTimeout(1500);
check("profile saved", await page.locator("#tagline").inputValue() === "Woman photographer for weddings and family functions");

// 10. Admin
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator('form button:has-text("Log out")').first().click().catch(() => {});
await page.waitForTimeout(800);
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill("#email", "admin@bookmyshoot.in");
await page.fill("#password", "admin123");
await page.click('button:has-text("Log in")');
await page.waitForURL(/\/admin/, { timeout: 15000 });
await page.locator("text=Waiting for verification").first().waitFor({ timeout: 15000 }).catch(() => {});
check("admin overview loads", await page.locator("text=Waiting for verification").first().isVisible());
await page.goto(`${BASE}/admin/verification`, { waitUntil: "networkidle" });
const vForm = page.locator('form:has(button:has-text("Save"))').first();
await vForm.locator('select[name="level"]').selectOption("ID_VERIFIED");
await vForm.locator('input[name="reason"]').fill("Automated test");
await vForm.locator('button:has-text("Save")').click();
await page.waitForTimeout(2000);
await page.goto(`${BASE}/admin/log`, { waitUntil: "networkidle" });
await page.locator("text=Automated test").first().waitFor({ timeout: 15000 }).catch(() => {});
check("admin action logged", await page.locator("text=Automated test").first().isVisible());

// 11. Mobile layout, no horizontal scroll
const mob = await ctx.newPage();
await mob.setViewportSize({ width: 390, height: 844 });
await mob.goto(`${BASE}/p/sample-harman-studios`, { waitUntil: "networkidle" });
const overflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("no horizontal scroll on phone", overflow <= 2, `overflow ${overflow}px`);

// 12. Photo uploads
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHUlEQVQoz2P8z8Dwn4GKgIlhVIPRGEY1GNUwqgEAZtcD8RVMMU8AAAAASUVORK5CYII=",
  "base64",
);
const asFile = (name) => ({ name, mimeType: "image/png", buffer: png });

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator('form button:has-text("Log out")').first().click().catch(() => {});
await page.waitForTimeout(800);
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill("#email", "sample-harman-studios@example.com");
await page.fill("#password", "sample123");
await page.click('button:has-text("Log in")');
await page.waitForURL(/\/dashboard/, { timeout: 15000 });

await page.goto(`${BASE}/dashboard/photos`, { waitUntil: "networkidle" });
await page.locator('section:has(h2:text("Profile photo")) input[type=file]').setInputFiles(asFile("me.png"));
await page.locator('button:has-text("Upload profile photo")').click();
await page.waitForTimeout(3000);
check("profile photo uploads", await page.locator("text=Profile photo updated").isVisible());

await page.locator('section:has(h2:text("Your work")) input[type=file]').setInputFiles([asFile("a.png"), asFile("b.png")]);
await page.locator('button:has-text("Add to my work")').click();
await page.waitForTimeout(4000);
check("gallery photos upload", await page.locator("text=2 photos added").isVisible());

await page.goto(`${BASE}/p/sample-harman-studios`, { waitUntil: "networkidle" });
const avatarSrc = await page.locator("header img").nth(1).getAttribute("src");
check("uploaded photo shows on the profile", Boolean(avatarSrc?.startsWith("/media/")), avatarSrc ?? "");

// 13. Near me search
await page.goto(`${BASE}/search?lat=30.70&lng=76.72&radius=50`, { waitUntil: "networkidle" });
check("near me search works", await page.locator("text=within 50 km of you").isVisible());
check("distance shown on cards", await page.locator("text=km away").first().isVisible());

// 14. District search
await page.goto(`${BASE}/search?district=SAS%20Nagar`, { waitUntil: "networkidle" });
check("district search works", (await page.locator("article").count()) > 0);

check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(results.join("\n"));
await browser.close();
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
