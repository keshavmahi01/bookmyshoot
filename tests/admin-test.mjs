/**
 * Checks the admin side: adding and deleting an admin, deleting one profile,
 * and the button that removes every sample row.
 *
 * Run it on a freshly seeded database, because it deletes the sample data.
 *
 *   npm run build && npm run start
 *   BASE_URL=http://localhost:3000 node tests/admin-test.mjs
 *   npm run seed
 */
import { chromium } from "playwright";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const out = [];
const check = (n, ok, x = "") => { const l = `${ok ? "PASS" : "FAIL"}  ${n}${x ? " :: " + x : ""}`; out.push(l); console.log(l); };
const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1360, height: 1100 } });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

// log in as the real admin
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.fill("#email", "admin@bookmyshoot.in");
await page.fill("#password", "admin123");
await page.click('button:has-text("Log in")');
await page.waitForURL(/\/admin/, { timeout: 15000 });

// 1. the Admins tab
await page.goto(BASE + "/admin/team", { waitUntil: "networkidle" });
check("admins tab loads", await page.locator("text=Add an admin").isVisible());
check("sample admin listed", await page.locator('td:has-text("Sample Admin")').first().isVisible());
check("own login cannot be deleted", (await page.locator('tr:has-text("this is you") button:has-text("Delete")').count()) === 0);
const samplesBefore = await page.locator("text=sample profiles and").first().innerText();
check("sample counts shown", /\d+/.test(samplesBefore), samplesBefore.replace(/\s+/g, " ").slice(0, 60));
await page.screenshot({ path: "admin-tab.png", fullPage: true });

// 2. add an admin, then delete it again
await page.fill("#admin-name", "Second Admin");
await page.fill("#admin-email", "second.admin@bookmyshoot.in");
await page.fill("#admin-phone", "9000000044");
await page.fill("#admin-password", "second123");
await page.click('button:has-text("Add admin")');
await page.waitForTimeout(2000);
check("admin added", await page.locator('td:has-text("Second Admin")').first().isVisible());

await page.locator('tr:has-text("Second Admin") button:has-text("Delete")').click();
await page.waitForTimeout(2000);
check("admin deleted", (await page.locator('td:has-text("Second Admin")').count()) === 0);

// 3. the sample admin goes when he wants it gone
await page.locator('tr:has-text("Sample Admin") button:has-text("Delete")').click();
await page.waitForTimeout(2000);
check("sample admin deleted", (await page.locator('td:has-text("Sample Admin")').count()) === 0);

// 4. one profile deleted from the listings tab
await page.goto(BASE + "/admin/listings", { waitUntil: "networkidle" });
const rowsBefore = await page.locator("tbody tr").count();
check("sample badge on listings", (await page.locator('span:has-text("sample")').count()) > 0);
const first = page.locator("tbody tr").first();
await first.locator('input[name="reason"]').nth(1).fill("Not a real profile");
await first.locator('button:has-text("Delete")').click();
await page.waitForTimeout(2500);
const rowsAfter = await page.locator("tbody tr").count();
check("profile deleted", rowsAfter === rowsBefore - 1, `${rowsBefore} -> ${rowsAfter}`);

// 5. the delete is written to the action log
await page.goto(BASE + "/admin/log", { waitUntil: "networkidle" });
check("delete written to the log", await page.locator("text=Deleted profile").first().isVisible());

// 6. remove every sample row in one go
await page.goto(BASE + "/admin/team", { waitUntil: "networkidle" });
await page.click('button:has-text("Remove all sample data")');
await page.waitForTimeout(4000);
check("sample data gone", await page.locator("text=This is a clean database").isVisible());
await page.screenshot({ path: "admin-tab-clean.png", fullPage: true });

// 7. the site still works with nothing listed
await page.goto(BASE + "/search", { waitUntil: "networkidle" });
check("search page still fine", (await page.locator("article").count()) === 0);
await page.goto(BASE + "/", { waitUntil: "networkidle" });
check("home still fine with no profiles", await page.locator("h1").first().isVisible());

check("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
await b.close();
console.log("");
console.log(out.filter((l) => l.startsWith("FAIL")).length ? "SOME FAILED" : "ALL PASS");
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
