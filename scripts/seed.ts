/**
 * Fills the MongoDB database for BookMyShoot.
 *
 *   npm run seed         cities, shoot types, your admin login, and a set of
 *                        sample profiles so the site has something to show.
 *                        Every sample row is tagged, and Admin > Sample data
 *                        removes the whole lot with one button.
 *
 *   npm run seed:bare    the same without any sample rows. Use this one when
 *                        you go live and real people start signing up.
 *
 * Both wipe the database first.
 *
 * Which database it writes to depends on MONGODB_URI in your .env file. With
 * no MONGODB_URI it writes to the local JSON file instead, so the site still
 * runs before MongoDB is set up.
 */
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cols, storageLabel, usingMongo } from "../db/client";
import { blankPhotographer } from "../db/defaults";
import type {
  AddOn,
  Booking,
  Category,
  City,
  Enquiry,
  Photographer,
  PortfolioItem,
  Rate,
  RateType,
  Review,
  User,
} from "../db/schema";

const bare = process.argv.includes("--bare") || process.env.SEED_BARE === "1";
/** How many sample profiles to create. */
const SAMPLE_COUNT = 14;

let counter = 0;
const id = (p: string) => `${p}_${(counter += 1).toString().padStart(4, "0")}`;
const now = new Date();
const iso = (d: Date) => d.toISOString();
const dateOnly = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const plusDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
};
const hash = (pw: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};
const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function wipe() {
  if (usingMongo) {
    for (const store of Object.values(cols)) await store.deleteMany({});
  } else {
    const file =
      process.env.LOCAL_DB_FILE ?? path.join(process.cwd(), "data", "bookmyshoot.local.json");
    fs.rmSync(file, { force: true });
  }
}

// ---------------------------------------------------------------- cities
const cityRows: Omit<City, "id">[] = [
  { slug: "chandigarh", name: "Chandigarh", district: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, popular: true },
  { slug: "mohali", name: "Mohali", district: "SAS Nagar", state: "Punjab", lat: 30.7046, lng: 76.7179, popular: true },
  { slug: "zirakpur", name: "Zirakpur", district: "SAS Nagar", state: "Punjab", lat: 30.6425, lng: 76.8173, popular: true },
  { slug: "kharar", name: "Kharar", district: "SAS Nagar", state: "Punjab", lat: 30.7460, lng: 76.6469, popular: false },
  { slug: "dera-bassi", name: "Dera Bassi", district: "SAS Nagar", state: "Punjab", lat: 30.5890, lng: 76.8420, popular: false },
  { slug: "panchkula", name: "Panchkula", district: "Panchkula", state: "Haryana", lat: 30.6942, lng: 76.8606, popular: true },
  { slug: "ambala", name: "Ambala", district: "Ambala", state: "Haryana", lat: 30.3782, lng: 76.7767, popular: false },
  { slug: "patiala", name: "Patiala", district: "Patiala", state: "Punjab", lat: 30.3398, lng: 76.3869, popular: false },
  { slug: "ludhiana", name: "Ludhiana", district: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, popular: true },
  { slug: "jalandhar", name: "Jalandhar", district: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762, popular: false },
  { slug: "amritsar", name: "Amritsar", district: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, popular: true },
  { slug: "shimla", name: "Shimla", district: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, popular: false },
  { slug: "delhi", name: "Delhi", district: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, popular: true },
  { slug: "gurugram", name: "Gurugram", district: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, popular: true },
  { slug: "noida", name: "Noida", district: "Gautam Buddh Nagar", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, popular: false },
  { slug: "jaipur", name: "Jaipur", district: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, popular: true },
  { slug: "lucknow", name: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, popular: false },
  { slug: "dehradun", name: "Dehradun", district: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, popular: false },
  { slug: "mumbai", name: "Mumbai", district: "Mumbai Suburban", state: "Maharashtra", lat: 19.0760, lng: 72.8777, popular: true },
  { slug: "pune", name: "Pune", district: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, popular: false },
  { slug: "bengaluru", name: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", lat: 12.9716, lng: 77.5946, popular: true },
  { slug: "hyderabad", name: "Hyderabad", district: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, popular: false },
];
const cityList = cityRows.map((c) => ({ id: id("city"), ...c })) as City[];
const cityBySlug = new Map(cityList.map((c) => [c.slug, c]));

// ------------------------------------------------------------ categories
const categoryRows = [
  {
    slug: "wedding",
    name: "Wedding photography",
    singular: "Wedding photographer",
    description:
      "Full wedding coverage, from roka and mehndi to the reception, photos and video together.",
    popular: true,
  },
  {
    slug: "pre-wedding",
    name: "Pre wedding shoots",
    singular: "Pre wedding photographer",
    description: "Couple shoots before the wedding, on location, with styling and edits.",
    popular: true,
  },
  {
    slug: "birthday",
    name: "Birthday and family events",
    singular: "Birthday photographer",
    description: "Birthdays, anniversaries, baby shoots and small family functions.",
    popular: true,
  },
  {
    slug: "corporate",
    name: "Corporate events",
    singular: "Corporate event photographer",
    description: "Conferences, award nights, product launches and office portraits.",
    popular: true,
  },
  {
    slug: "ad-film",
    name: "Ad films and brand shoots",
    singular: "Ad film maker",
    description: "Brand films, fashion shoots and campaign stills with a full crew.",
    popular: true,
  },
  {
    slug: "product",
    name: "Product and e-commerce",
    singular: "Product photographer",
    description: "Catalogue photos for Amazon, Flipkart and your own online store.",
    popular: true,
  },
  {
    slug: "documentary",
    name: "Documentary and interviews",
    singular: "Documentary film maker",
    description: "Long form shoots, interviews, NGO films and case study videos.",
    popular: false,
  },
  {
    slug: "real-estate",
    name: "Real estate and architecture",
    singular: "Real estate photographer",
    description: "Property walkthroughs, interiors, hotels and builder projects.",
    popular: false,
  },
  {
    slug: "drone",
    name: "Drone and aerial",
    singular: "Drone operator",
    description: "Aerial photos and video for events, property and films.",
    popular: true,
  },
  {
    slug: "editing",
    name: "Editing and album design",
    singular: "Photo and video editor",
    description: "Colour grading, album design, reels and same day edits.",
    popular: false,
  },
];
const categoryList: Category[] = categoryRows.map((c) => ({
  id: id("cat"),
  imagePath: null,
  ...c,
}));
const catBySlug = new Map(categoryList.map((c) => [c.slug, c]));

// --------------------------------------------------------- sample profiles
type Spec = {
  name: string;
  city: string;
  tagline: string;
  cats: string[];
  gender: "MALE" | "FEMALE" | "TEAM";
  years: number;
  team: number;
  verification: "LISTED" | "ID_VERIFIED" | "WORK_VERIFIED";
  languages: string;
  travelKm: number;
  allIndia?: boolean;
  drone?: boolean;
  backup?: boolean;
  second?: boolean;
  album?: boolean;
  raw?: boolean;
  deliveryDays: number;
  responseHours: number;
  jobs: number;
  repeat: number;
  cancellations: number;
  gear: string;
  rates: {
    type: string;
    title: string;
    amount: number;
    minUnits?: number;
    extra?: number;
    details: string;
  }[];
};

const allSpecs: Spec[] = [
  {
    name: "Harman Studios",
    city: "chandigarh",
    tagline: "Candid wedding stories across Punjab and Himachal",
    cats: ["wedding", "pre-wedding", "drone"],
    gender: "TEAM",
    years: 11,
    team: 6,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English,Punjabi",
    travelKm: 400,
    drone: true,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 25,
    responseHours: 2,
    jobs: 148,
    repeat: 31,
    cancellations: 0,
    gear: "2x Sony A7 IV, 1x A7 III backup, 24-70 GM, 35mm 1.4, 85mm 1.8, Godox lights, DJI RS3 gimbal, DJI Mavic 3",
    rates: [
      { type: "PACKAGE", title: "Two day wedding, photo and video", amount: 145000, details: "2 photographers, 2 cinematographers, 1 album of 250 photos, 1 teaser reel" },
      { type: "DAILY", title: "Single function day", amount: 42000, minUnits: 1, extra: 6000, details: "Up to 10 hours, 1 photographer and 1 cinematographer" },
      { type: "WEEKLY", title: "Destination wedding week", amount: 310000, minUnits: 5, details: "5 day block, travel and stay extra" },
    ],
  },
  {
    name: "Simran Kaur Photography",
    city: "mohali",
    tagline: "Woman photographer for weddings and family functions",
    cats: ["wedding", "birthday", "pre-wedding"],
    gender: "FEMALE",
    years: 7,
    team: 2,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English,Punjabi",
    travelKm: 250,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 18,
    responseHours: 1,
    jobs: 96,
    repeat: 22,
    cancellations: 1,
    gear: "Canon R6 Mark II, R6 backup, 24-105 F4, 50mm 1.2, 70-200 F2.8, Profoto B10",
    rates: [
      { type: "PACKAGE", title: "Wedding day package", amount: 78000, details: "1 day, 2 shooters, 300 edited photos, 1 album" },
      { type: "HOURLY", title: "Family function, hourly", amount: 4500, minUnits: 3, extra: 4000, details: "Minimum 3 hours, 60 edited photos per hour" },
      { type: "DAILY", title: "Full day coverage", amount: 32000, details: "10 hours, 1 shooter" },
    ],
  },
  {
    name: "Frame Nine Films",
    city: "zirakpur",
    tagline: "Ad films, brand shoots and product video",
    cats: ["ad-film", "product", "corporate"],
    gender: "TEAM",
    years: 9,
    team: 8,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English,Punjabi",
    travelKm: 600,
    allIndia: true,
    drone: true,
    backup: true,
    second: true,
    raw: true,
    deliveryDays: 14,
    responseHours: 3,
    jobs: 112,
    repeat: 44,
    cancellations: 0,
    gear: "Sony FX6, FX3, Canon C70, Aputure 600D, Easyrig, Ronin 4D, DJI Mavic 3 Cine",
    rates: [
      { type: "DAILY", title: "Ad film shoot day", amount: 95000, details: "Director, DOP, 4 crew, lights and grip" },
      { type: "PACKAGE", title: "Brand film, concept to final cut", amount: 320000, details: "Script, 2 shoot days, edit, grade, music" },
      { type: "HOURLY", title: "Product video, studio", amount: 7500, minUnits: 4, details: "Minimum 4 hours in our Zirakpur studio" },
    ],
  },
  {
    name: "Panchkula Lens Co",
    city: "panchkula",
    tagline: "Birthdays, baby shoots and small functions, friendly rates",
    cats: ["birthday", "wedding", "editing"],
    gender: "MALE",
    years: 4,
    team: 2,
    verification: "ID_VERIFIED",
    languages: "Hindi,English",
    travelKm: 120,
    album: true,
    deliveryDays: 12,
    responseHours: 4,
    jobs: 61,
    repeat: 14,
    cancellations: 2,
    gear: "Nikon Z6 II, 24-70 F2.8, 50mm 1.8, 2x Godox AD200",
    rates: [
      { type: "HOURLY", title: "Birthday and baby shoot", amount: 2800, minUnits: 2, extra: 2500, details: "Minimum 2 hours, 50 edited photos per hour" },
      { type: "DAILY", title: "Full function day", amount: 18000, details: "8 hours, 250 edited photos" },
      { type: "PACKAGE", title: "Small wedding, one day", amount: 45000, details: "1 photographer, 1 video, album of 150 photos" },
    ],
  },
  {
    name: "Ludhiana Wedding Co",
    city: "ludhiana",
    tagline: "Traditional and candid wedding coverage since 2012",
    cats: ["wedding", "pre-wedding", "birthday"],
    gender: "TEAM",
    years: 13,
    team: 7,
    verification: "WORK_VERIFIED",
    languages: "Hindi,Punjabi",
    travelKm: 350,
    drone: true,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 30,
    responseHours: 6,
    jobs: 203,
    repeat: 48,
    cancellations: 3,
    gear: "3x Canon R6, 2x 5D Mark IV backup, full light kit, 2 gimbals, DJI Air 3",
    rates: [
      { type: "PACKAGE", title: "Three day wedding", amount: 185000, details: "Full crew, 2 albums, highlight film, teaser" },
      { type: "DAILY", title: "Per function", amount: 38000, extra: 5000, details: "Up to 10 hours" },
      { type: "WEEKLY", title: "Wedding week block", amount: 240000, minUnits: 5, details: "5 days, same crew throughout" },
    ],
  },
  {
    name: "Amritsar Story House",
    city: "amritsar",
    tagline: "Documentary style weddings and NGO films",
    cats: ["wedding", "documentary", "pre-wedding"],
    gender: "MALE",
    years: 8,
    team: 3,
    verification: "ID_VERIFIED",
    languages: "Hindi,English,Punjabi",
    travelKm: 300,
    backup: true,
    raw: true,
    deliveryDays: 21,
    responseHours: 5,
    jobs: 74,
    repeat: 19,
    cancellations: 1,
    gear: "Sony A7S III, A7 III, 16-35 GM, 24-70 GM, Rode wireless, Zoom H6",
    rates: [
      { type: "PACKAGE", title: "Wedding, two days", amount: 92000, details: "Photo and film, documentary style, no posed shots" },
      { type: "DAILY", title: "Documentary shoot day", amount: 25000, details: "Interview setup, 2 cameras, audio" },
      { type: "WEEKLY", title: "Long documentary block", amount: 135000, minUnits: 6, details: "6 days, travel extra" },
    ],
  },
  {
    name: "Studio Indigo Delhi",
    city: "delhi",
    tagline: "Fashion, e-commerce and catalogue photography",
    cats: ["product", "ad-film", "corporate"],
    gender: "TEAM",
    years: 10,
    team: 5,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English",
    travelKm: 200,
    allIndia: true,
    backup: true,
    raw: true,
    deliveryDays: 7,
    responseHours: 2,
    jobs: 265,
    repeat: 97,
    cancellations: 1,
    gear: "Phase One XF, Canon R5, Profoto D2 kit, cyclorama studio in Okhla",
    rates: [
      { type: "HOURLY", title: "Studio hour, catalogue", amount: 6000, minUnits: 3, details: "Studio, lights and one assistant included" },
      { type: "DAILY", title: "Full studio day", amount: 42000, details: "Up to 80 products or 6 model looks" },
      { type: "PACKAGE", title: "Per product, bulk catalogue", amount: 350, minUnits: 100, details: "Minimum 100 products, white background, 3 angles each" },
    ],
  },
  {
    name: "Gurugram Drone Works",
    city: "gurugram",
    tagline: "Licensed drone pilots for events, property and films",
    cats: ["drone", "real-estate", "ad-film"],
    gender: "TEAM",
    years: 6,
    team: 3,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English",
    travelKm: 500,
    allIndia: true,
    drone: true,
    backup: true,
    raw: true,
    deliveryDays: 5,
    responseHours: 3,
    jobs: 130,
    repeat: 38,
    cancellations: 0,
    gear: "DJI Inspire 3, Mavic 3 Cine, FPV rig, DGCA certified pilots",
    rates: [
      { type: "HOURLY", title: "Aerial coverage, hourly", amount: 9000, minUnits: 2, details: "2 hour minimum, raw clips handed over same day" },
      { type: "DAILY", title: "Drone crew day", amount: 48000, details: "Pilot, spotter, 2 drones, all permissions paperwork" },
      { type: "PACKAGE", title: "Property film package", amount: 65000, details: "Aerial plus ground walkthrough, 2 minute edit" },
    ],
  },
  {
    name: "Jaipur Heritage Frames",
    city: "jaipur",
    tagline: "Destination weddings in forts and havelis",
    cats: ["wedding", "pre-wedding", "drone"],
    gender: "TEAM",
    years: 12,
    team: 9,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English",
    travelKm: 800,
    allIndia: true,
    drone: true,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 35,
    responseHours: 4,
    jobs: 178,
    repeat: 26,
    cancellations: 2,
    gear: "Sony A1 x2, A7 IV x3, FX3, full prime set, Mavic 3, 3 gimbals",
    rates: [
      { type: "WEEKLY", title: "Destination wedding, 5 days", amount: 450000, minUnits: 5, details: "Full crew, 2 albums, films, drone, travel extra" },
      { type: "PACKAGE", title: "Two day wedding in Jaipur", amount: 210000, details: "Photo, film, drone, album" },
      { type: "DAILY", title: "Per day, local", amount: 55000, details: "10 hours, 2 shooters" },
    ],
  },
  {
    name: "Mumbai Motion Lab",
    city: "mumbai",
    tagline: "Brand films, reels and celebrity shoots",
    cats: ["ad-film", "corporate", "editing"],
    gender: "TEAM",
    years: 9,
    team: 11,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English,Marathi",
    travelKm: 300,
    allIndia: true,
    backup: true,
    second: true,
    raw: true,
    deliveryDays: 10,
    responseHours: 2,
    jobs: 221,
    repeat: 88,
    cancellations: 1,
    gear: "Arri Alexa Mini, Sony Venice rental tie up, full grip truck, DaVinci suite",
    rates: [
      { type: "DAILY", title: "Commercial shoot day", amount: 185000, details: "Director, DOP, full unit, lights and grip" },
      { type: "PACKAGE", title: "Reel pack, 10 reels", amount: 120000, details: "One shoot day, 10 edited reels with captions" },
      { type: "HOURLY", title: "Edit and grade suite", amount: 4000, minUnits: 4, details: "Editor and colourist time, minimum 4 hours" },
    ],
  },
  {
    name: "Pune Candid Co",
    city: "pune",
    tagline: "Small weddings and engagement shoots, no fuss",
    cats: ["wedding", "pre-wedding", "birthday"],
    gender: "MALE",
    years: 5,
    team: 2,
    verification: "ID_VERIFIED",
    languages: "Hindi,English,Marathi",
    travelKm: 200,
    backup: true,
    album: true,
    deliveryDays: 20,
    responseHours: 8,
    jobs: 54,
    repeat: 11,
    cancellations: 1,
    gear: "Fujifilm X-T5, X-H2, 16-55 F2.8, 56mm 1.2, 2x Godox AD200",
    rates: [
      { type: "PACKAGE", title: "Intimate wedding", amount: 62000, details: "1 day, 2 shooters, 250 photos, 1 album" },
      { type: "DAILY", title: "Single day", amount: 26000, details: "8 hours" },
      { type: "HOURLY", title: "Engagement shoot", amount: 3500, minUnits: 2, details: "2 hour minimum, 40 edited photos" },
    ],
  },
  {
    name: "Bengaluru Tech Events",
    city: "bengaluru",
    tagline: "Conference and startup event coverage, same day photos",
    cats: ["corporate", "documentary", "product"],
    gender: "TEAM",
    years: 7,
    team: 4,
    verification: "WORK_VERIFIED",
    languages: "English,Hindi,Kannada",
    travelKm: 300,
    allIndia: true,
    backup: true,
    second: true,
    raw: true,
    deliveryDays: 3,
    responseHours: 1,
    jobs: 189,
    repeat: 71,
    cancellations: 0,
    gear: "Canon R5 x3, 24-70, 70-200, 16-35, on site editing station",
    rates: [
      { type: "DAILY", title: "Conference day", amount: 38000, details: "2 photographers, same day gallery by 10 pm" },
      { type: "HOURLY", title: "Half day event", amount: 5500, minUnits: 4, details: "Minimum 4 hours" },
      { type: "PACKAGE", title: "Three day summit", amount: 145000, details: "Photo, video, highlight film, daily gallery" },
    ],
  },
  {
    name: "Hyderabad Frame Lab",
    city: "hyderabad",
    tagline: "South Indian weddings and temple ceremonies",
    cats: ["wedding", "pre-wedding", "editing"],
    gender: "TEAM",
    years: 10,
    team: 5,
    verification: "ID_VERIFIED",
    languages: "Telugu,Hindi,English",
    travelKm: 400,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 28,
    responseHours: 6,
    jobs: 134,
    repeat: 29,
    cancellations: 2,
    gear: "Sony A7 IV x3, 24-70 GM, 85mm GM, Godox strobes, 2 gimbals",
    rates: [
      { type: "PACKAGE", title: "Traditional wedding, 2 days", amount: 125000, details: "Photo, film, album, muhurtham coverage" },
      { type: "DAILY", title: "Per function", amount: 34000, details: "10 hours" },
      { type: "WEEKLY", title: "Full wedding week", amount: 195000, minUnits: 5, details: "5 days, same crew" },
    ],
  },
  {
    name: "Shimla Hills Photography",
    city: "shimla",
    tagline: "Hill station pre wedding and destination shoots",
    cats: ["pre-wedding", "wedding", "drone"],
    gender: "MALE",
    years: 6,
    team: 2,
    verification: "ID_VERIFIED",
    languages: "Hindi,English",
    travelKm: 250,
    drone: true,
    backup: true,
    deliveryDays: 15,
    responseHours: 12,
    jobs: 48,
    repeat: 9,
    cancellations: 1,
    gear: "Nikon Z8, Z6 II, 24-120, 85mm 1.8, DJI Mini 4 Pro",
    rates: [
      { type: "PACKAGE", title: "Pre wedding in the hills, 2 days", amount: 58000, details: "2 locations, 2 outfits, 80 edited photos, 1 reel" },
      { type: "DAILY", title: "Shoot day", amount: 22000, details: "8 hours, drone included" },
      { type: "HOURLY", title: "Short shoot", amount: 3200, minUnits: 3, details: "Minimum 3 hours" },
    ],
  },
  {
    name: "Dehradun Property Shots",
    city: "dehradun",
    tagline: "Hotels, resorts and builder project photography",
    cats: ["real-estate", "drone", "product"],
    gender: "MALE",
    years: 5,
    team: 2,
    verification: "LISTED",
    languages: "Hindi,English",
    travelKm: 300,
    drone: true,
    raw: true,
    deliveryDays: 6,
    responseHours: 10,
    jobs: 37,
    repeat: 12,
    cancellations: 0,
    gear: "Canon R6, 14mm, tilt shift 24mm, tripod, DJI Mini 4 Pro",
    rates: [
      { type: "PACKAGE", title: "Hotel shoot package", amount: 35000, details: "Up to 20 rooms and common areas, 60 edited photos" },
      { type: "DAILY", title: "Property day rate", amount: 16000, details: "8 hours, drone included" },
      { type: "HOURLY", title: "Single flat or showroom", amount: 2800, minUnits: 2, details: "Minimum 2 hours" },
    ],
  },
  {
    name: "Lucknow Nawabi Weddings",
    city: "lucknow",
    tagline: "Big fat weddings with a full crew and two albums",
    cats: ["wedding", "birthday", "drone"],
    gender: "TEAM",
    years: 14,
    team: 10,
    verification: "ID_VERIFIED",
    languages: "Hindi,English",
    travelKm: 400,
    drone: true,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 40,
    responseHours: 9,
    jobs: 240,
    repeat: 52,
    cancellations: 5,
    gear: "Canon R6 x4, 5D Mark IV x2, full light truck, 3 gimbals, DJI Air 3",
    rates: [
      { type: "PACKAGE", title: "Four day wedding", amount: 230000, details: "Full crew, 2 albums, films, drone, LED wall feed" },
      { type: "DAILY", title: "Per function", amount: 45000, extra: 7000, details: "Up to 12 hours" },
      { type: "WEEKLY", title: "Week long block", amount: 290000, minUnits: 6, details: "6 days" },
    ],
  },
  {
    name: "Gurpreet Singh Films",
    city: "chandigarh",
    tagline: "One man crew for small shoots, quick delivery",
    cats: ["birthday", "corporate", "editing"],
    gender: "MALE",
    years: 3,
    team: 1,
    verification: "LISTED",
    languages: "Hindi,English,Punjabi",
    travelKm: 150,
    deliveryDays: 8,
    responseHours: 3,
    jobs: 29,
    repeat: 7,
    cancellations: 0,
    gear: "Sony A7 III, 28-70, 50mm 1.8, Godox V1",
    rates: [
      { type: "HOURLY", title: "Event hour", amount: 2200, minUnits: 2, extra: 2000, details: "Minimum 2 hours, 40 edited photos per hour" },
      { type: "DAILY", title: "Day rate", amount: 14000, details: "8 hours" },
    ],
  },
  {
    name: "Mohali Studio 42",
    city: "mohali",
    tagline: "E-commerce catalogue shoots with same week delivery",
    cats: ["product", "editing", "corporate"],
    gender: "TEAM",
    years: 6,
    team: 4,
    verification: "ID_VERIFIED",
    languages: "Hindi,English,Punjabi",
    travelKm: 100,
    backup: true,
    raw: true,
    deliveryDays: 5,
    responseHours: 2,
    jobs: 87,
    repeat: 41,
    cancellations: 1,
    gear: "Canon R5, 100mm macro, 24-70, studio with cyclorama and light tent",
    rates: [
      { type: "PACKAGE", title: "Per product, white background", amount: 250, minUnits: 50, details: "Minimum 50 products, 4 angles each" },
      { type: "HOURLY", title: "Studio hour", amount: 3500, minUnits: 3, details: "Studio, lights and assistant" },
      { type: "DAILY", title: "Full studio day", amount: 24000, details: "Up to 60 products" },
    ],
  },
  {
    name: "Anjali Verma Photography",
    city: "delhi",
    tagline: "Woman photographer for maternity, newborn and family",
    cats: ["birthday", "pre-wedding", "wedding"],
    gender: "FEMALE",
    years: 8,
    team: 2,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English",
    travelKm: 150,
    backup: true,
    album: true,
    deliveryDays: 14,
    responseHours: 2,
    jobs: 142,
    repeat: 55,
    cancellations: 0,
    gear: "Sony A7 IV, 35mm 1.4, 85mm 1.8, home studio setup with soft lights",
    rates: [
      { type: "HOURLY", title: "Maternity or newborn session", amount: 5000, minUnits: 2, details: "2 hours, 40 edited photos, props included" },
      { type: "PACKAGE", title: "Family album package", amount: 28000, details: "3 hour session, 100 photos, printed album" },
      { type: "DAILY", title: "Full day family event", amount: 30000, details: "10 hours" },
    ],
  },
  {
    name: "Zirakpur Event Crew",
    city: "zirakpur",
    tagline: "Budget friendly coverage for banquet hall functions",
    cats: ["birthday", "wedding", "corporate"],
    gender: "TEAM",
    years: 4,
    team: 3,
    verification: "LISTED",
    languages: "Hindi,Punjabi",
    travelKm: 80,
    album: true,
    deliveryDays: 15,
    responseHours: 7,
    jobs: 44,
    repeat: 10,
    cancellations: 3,
    gear: "Canon 90D x2, 18-135, 50mm 1.8, 2 softbox lights",
    rates: [
      { type: "DAILY", title: "Function day", amount: 12000, details: "8 hours, 200 edited photos" },
      { type: "HOURLY", title: "Short function", amount: 1800, minUnits: 3, details: "Minimum 3 hours" },
      { type: "PACKAGE", title: "Wedding, one day, photo and video", amount: 38000, details: "2 shooters, album of 120 photos" },
    ],
  },
  {
    name: "Bengaluru Product Studio",
    city: "bengaluru",
    tagline: "Food, jewellery and gadget photography",
    cats: ["product", "ad-film", "editing"],
    gender: "TEAM",
    years: 7,
    team: 4,
    verification: "ID_VERIFIED",
    languages: "English,Hindi,Kannada",
    travelKm: 120,
    backup: true,
    raw: true,
    deliveryDays: 6,
    responseHours: 4,
    jobs: 96,
    repeat: 43,
    cancellations: 1,
    gear: "Canon R5, 100mm macro, focus stacking rail, Broncolor lights, food styling table",
    rates: [
      { type: "DAILY", title: "Studio day, food or jewellery", amount: 36000, details: "Includes stylist and props" },
      { type: "HOURLY", title: "Studio hour", amount: 5000, minUnits: 3, details: "Minimum 3 hours" },
      { type: "PACKAGE", title: "Menu shoot, 40 dishes", amount: 85000, details: "2 days, styling, 40 final images" },
    ],
  },
  {
    name: "Mumbai Wedding Diaries",
    city: "mumbai",
    tagline: "City weddings, beach ceremonies and sangeet films",
    cats: ["wedding", "pre-wedding", "drone"],
    gender: "TEAM",
    years: 11,
    team: 8,
    verification: "WORK_VERIFIED",
    languages: "Hindi,English,Marathi,Gujarati",
    travelKm: 400,
    allIndia: true,
    drone: true,
    backup: true,
    second: true,
    album: true,
    deliveryDays: 30,
    responseHours: 3,
    jobs: 196,
    repeat: 34,
    cancellations: 1,
    gear: "Sony A1, A7 IV x3, FX3, full prime set, 3 gimbals, DJI Mavic 3",
    rates: [
      { type: "PACKAGE", title: "Mumbai wedding, 2 days", amount: 240000, details: "Photo, film, drone, 2 albums, sangeet film" },
      { type: "DAILY", title: "Per function day", amount: 68000, details: "12 hours, 2 photographers, 2 cinematographers" },
      { type: "WEEKLY", title: "Destination block", amount: 520000, minUnits: 5, details: "5 days anywhere in India, travel extra" },
    ],
  },
  {
    name: "Panchkula Edit House",
    city: "panchkula",
    tagline: "Editing only, album design and reels for other photographers",
    cats: ["editing"],
    gender: "TEAM",
    years: 5,
    team: 6,
    verification: "ID_VERIFIED",
    languages: "Hindi,English,Punjabi",
    travelKm: 0,
    allIndia: true,
    raw: true,
    deliveryDays: 7,
    responseHours: 2,
    jobs: 310,
    repeat: 180,
    cancellations: 0,
    gear: "Calibrated edit suites, DaVinci Resolve, Lightroom, album design software",
    rates: [
      { type: "PACKAGE", title: "Wedding album design, 150 photos", amount: 9000, details: "3 rounds of changes included" },
      { type: "HOURLY", title: "Video edit hour", amount: 1200, minUnits: 5, details: "Minimum 5 hours" },
      { type: "DAILY", title: "Editor for a day", amount: 7000, details: "8 hours, remote" },
    ],
  },
  {
    name: "Jaipur Film Collective",
    city: "jaipur",
    tagline: "Documentary films, NGO work and interview shoots",
    cats: ["documentary", "corporate", "ad-film"],
    gender: "TEAM",
    years: 8,
    team: 5,
    verification: "ID_VERIFIED",
    languages: "Hindi,English",
    travelKm: 600,
    allIndia: true,
    backup: true,
    raw: true,
    deliveryDays: 20,
    responseHours: 5,
    jobs: 68,
    repeat: 25,
    cancellations: 1,
    gear: "Sony FX6, FX30, Sennheiser kit, Aputure lights, interview backdrop set",
    rates: [
      { type: "DAILY", title: "Documentary shoot day", amount: 42000, details: "Director, DOP, sound, lights" },
      { type: "WEEKLY", title: "Field shoot week", amount: 230000, minUnits: 6, details: "6 days, travel extra" },
      { type: "PACKAGE", title: "Case study film, 5 minutes", amount: 150000, details: "Research, 2 shoot days, edit, subtitles" },
    ],
  },
  {
    name: "Patiala Royal Studio",
    city: "patiala",
    tagline: "Punjabi weddings, roka and sagan coverage",
    cats: ["wedding", "birthday", "pre-wedding"],
    gender: "TEAM",
    years: 9,
    team: 4,
    verification: "ID_VERIFIED",
    languages: "Hindi,Punjabi",
    travelKm: 200,
    backup: true,
    album: true,
    deliveryDays: 22,
    responseHours: 6,
    jobs: 88,
    repeat: 21,
    cancellations: 1,
    gear: "Canon R6 x2, 24-70 F2.8, 85mm 1.8, Godox lights, 1 gimbal",
    rates: [
      { type: "PACKAGE", title: "Wedding, two days", amount: 88000, details: "Photo and video, album of 200 photos" },
      { type: "DAILY", title: "Per function", amount: 24000, details: "10 hours, 1 photographer and 1 video" },
      { type: "HOURLY", title: "Small function", amount: 2600, minUnits: 3, details: "Minimum 3 hours" },
    ],
  },
  {
    name: "Jalandhar Reel Factory",
    city: "jalandhar",
    tagline: "Wedding reels, same day edits and sangeet films",
    cats: ["wedding", "editing", "ad-film"],
    gender: "TEAM",
    years: 5,
    team: 4,
    verification: "LISTED",
    languages: "Hindi,Punjabi,English",
    travelKm: 250,
    backup: true,
    deliveryDays: 10,
    responseHours: 5,
    jobs: 52,
    repeat: 16,
    cancellations: 1,
    gear: "Sony A7 IV x2, FX30, DJI RS3, Aputure 300X, edit suite",
    rates: [
      { type: "PACKAGE", title: "Sangeet film and 5 reels", amount: 55000, details: "One shoot day, edits in 7 days" },
      { type: "DAILY", title: "Shoot day", amount: 21000, details: "10 hours, 2 crew" },
      { type: "HOURLY", title: "Short shoot", amount: 2800, minUnits: 3, details: "Minimum 3 hours" },
    ],
  },
  {
    name: "Noida Corporate Lens",
    city: "noida",
    tagline: "Office shoots, team portraits and event coverage",
    cats: ["corporate", "product", "documentary"],
    gender: "MALE",
    years: 7,
    team: 2,
    verification: "ID_VERIFIED",
    languages: "Hindi,English",
    travelKm: 150,
    backup: true,
    raw: true,
    deliveryDays: 4,
    responseHours: 3,
    jobs: 118,
    repeat: 49,
    cancellations: 0,
    gear: "Nikon Z8, Z6 II, 24-70 F2.8, 70-200 F2.8, portable studio lights",
    rates: [
      { type: "DAILY", title: "Corporate day rate", amount: 28000, details: "2 cameras, same day selects" },
      { type: "HOURLY", title: "Half day", amount: 4200, minUnits: 4, details: "Minimum 4 hours" },
      { type: "PACKAGE", title: "Team portrait pack, 40 people", amount: 45000, details: "One day, retouched headshots" },
    ],
  },
  {
    name: "Kharar Candid Studio",
    city: "kharar",
    tagline: "Budget friendly wedding and birthday coverage nearby",
    cats: ["wedding", "birthday", "pre-wedding"],
    gender: "MALE",
    years: 3,
    team: 2,
    verification: "LISTED",
    languages: "Hindi,Punjabi",
    travelKm: 80,
    album: true,
    deliveryDays: 14,
    responseHours: 4,
    jobs: 26,
    repeat: 6,
    cancellations: 0,
    gear: "Canon R10 x2, 18-150, 50mm 1.8, 2 softbox lights",
    rates: [
      { type: "DAILY", title: "Function day", amount: 11000, details: "8 hours, 180 edited photos" },
      { type: "HOURLY", title: "Short shoot", amount: 1600, minUnits: 2, details: "Minimum 2 hours" },
      { type: "PACKAGE", title: "Wedding day, photo and video", amount: 34000, details: "2 shooters, album of 120 photos" },
    ],
  },
];
const specs = allSpecs.slice(0, SAMPLE_COUNT);

// ----------------------------------------------------------------- users
const adminUser: User = {
  id: id("usr"),
  name: "BookMyShoot Admin",
  email: "admin@bookmyshoot.in",
  phone: "9000000001",
  passwordHash: hash("admin123"),
  role: "ADMIN",
  sample: false,
  createdAt: iso(now),
};

// A second admin login, clearly marked, so you can see how the team tab works
// and delete it the moment you do not need it.
const sampleAdmin: User = {
  id: id("usr"),
  name: "Sample Admin",
  email: "sample.admin@bookmyshoot.in",
  phone: "9000000002",
  passwordHash: hash("sample123"),
  role: "ADMIN",
  sample: true,
  createdAt: iso(now),
};

const sampleCustomer: User = {
  id: id("usr"),
  name: "Sample Customer",
  email: "sample.customer@example.com",
  phone: "9811111111",
  passwordHash: hash("sample123"),
  role: "CUSTOMER",
  sample: true,
  createdAt: iso(now),
};

const userRows: User[] = bare ? [adminUser] : [adminUser, sampleAdmin, sampleCustomer];

const photographerRows: Photographer[] = [];
const rateRows: Rate[] = [];
const addOnRows: AddOn[] = [];
const portfolioRows: PortfolioItem[] = [];
const enquiryRows: Enquiry[] = [];
const bookingRows: Booking[] = [];
const reviewRows: Review[] = [];

const reviewerNames = [
  "Ritu Bansal", "Amandeep Singh", "Karan Mehta", "Priya Nair", "Sahil Gupta",
  "Deepika Rao", "Mohit Jain", "Sneha Kulkarni", "Rahul Chadha", "Pooja Arora",
  "Vikram Sethi", "Megha Tandon", "Arun Prasad", "Nisha Bhatia", "Tarun Malhotra",
];
const comments = [
  "The team reached on time and handled both families very well. Photos came exactly as promised.",
  "Good work overall. Delivery took a few days longer than promised but the album quality made up for it.",
  "Very easy to work with. They understood what we wanted after one call and did not need constant instructions.",
  "Photos are lovely. Video edit could have been tighter but we are happy with the whole package.",
  "Professional from the first call to the final delivery. Would book again without thinking.",
  "They managed a very crowded function without missing any important moment. Worth the money.",
  "Clear pricing, no hidden charges added later. That alone was a relief.",
  "Quality is excellent. They were a little slow on WhatsApp replies during the booking stage.",
];

let reviewerIndex = 0;
let commentIndex = 0;

if (!bare) {
  specs.forEach((spec, index) => {
    // Every sample profile says so in its own name, so a real signup is never
    // mistaken for one of these.
    const displayName = `Sample ${spec.name}`;
    const slug = slugify(displayName);
    const user: User = {
      id: id("usr"),
      name: displayName,
      email: `${slug}@example.com`,
      phone: `98${String(10000000 + index * 137).slice(0, 8)}`,
      passwordHash: hash("sample123"),
      role: "PHOTOGRAPHER",
      sample: true,
      createdAt: iso(plusDays(-400 + index * 7)),
    };
    userRows.push(user);

    const photographerId = id("pho");
    const city = cityBySlug.get(spec.city)!;
    const pending = index >= specs.length - 2;

    photographerRows.push(
      blankPhotographer({
        id: photographerId,
        slug,
        userId: user.id,
        displayName,
        cityId: city.id,
        tagline: spec.tagline,
        bio:
          `${displayName} is based in ${city.name} and has been shooting since ${new Date().getFullYear() - spec.years}. ` +
          `The team is ${spec.team} people. ${spec.tagline}. ` +
          `We talk through the full plan before the event, share a shot list, and keep one backup camera on every job.`,
        categoryIds: spec.cats
          .map((c) => catBySlug.get(c)?.id)
          .filter((v): v is string => Boolean(v)),
        travelKm: spec.travelKm,
        travelsAllIndia: spec.allIndia ?? false,
        yearsExperience: spec.years,
        teamSize: spec.team,
        languages: spec.languages.split(",").map((l) => l.trim()),
        gender: spec.gender,
        verification: spec.verification,
        verifiedNote:
          spec.verification === "WORK_VERIFIED"
            ? "ID checked, original files of 3 shoots checked, 2 past clients spoken to."
            : spec.verification === "ID_VERIFIED"
              ? "Government ID matched with the profile name."
              : "",
        verifiedAt: spec.verification === "LISTED" ? null : iso(plusDays(-120 + index)),
        instagram: `https://instagram.com/${slug.replace(/-/g, "")}`,
        facebook: index % 3 === 0 ? `https://facebook.com/${slug}` : "",
        youtube: index % 4 === 0 ? `https://youtube.com/@${slug.replace(/-/g, "")}` : "",
        website: index % 2 === 0 ? `https://${slug}.example.com/` : "",
        gear: spec.gear,
        backupGear: spec.backup ?? false,
        droneAvailable: spec.drone ?? false,
        secondShooter: spec.second ?? false,
        ownEditing: true,
        deliveryDays: spec.deliveryDays,
        photosPerDay: 200 + ((index * 37) % 300),
        rawFiles: spec.raw ?? false,
        albumIncluded: spec.album ?? false,
        responseHours: spec.responseHours,
        eventsCovered: spec.jobs + spec.years * 24,
        jobsCompleted: spec.jobs,
        repeatClients: spec.repeat,
        cancellations: spec.cancellations,
        weeklyOff: index % 5 === 0 ? [1] : [],
        featured: spec.verification === "WORK_VERIFIED" && index < 8,
        featuredOrder: index,
        status: pending ? "PENDING" : "APPROVED",
        reviewNote: pending ? "" : "Approved during setup.",
        reviewedAt: pending ? null : iso(plusDays(-100 + index)),
        active: true,
        sample: true,
        // Busy dates: a few in the next two months.
        blocked: [3 + (index % 11), 12 + (index % 17), 26 + (index % 13), 41 + (index % 19)].map(
          (offset) => ({
            date: dateOnly(plusDays(offset)),
            status: offset % 3 === 0 ? ("HOLD" as const) : ("BUSY" as const),
            note: offset % 3 === 0 ? "On hold for another client" : "Booked",
          }),
        ),
        lastActiveAt: iso(plusDays(-(index % 9))),
        createdAt: user.createdAt,
      }),
    );

    spec.rates.forEach((r) => {
      rateRows.push({
        id: id("rate"),
        photographerId,
        type: r.type as RateType,
        title: r.title,
        amount: r.amount,
        minUnits: r.minUnits ?? 1,
        extraUnitRate: r.extra ?? null,
        details: r.details,
        active: true,
      });
    });

    const baseAddOns = [
      { label: `Travel beyond ${spec.travelKm} km`, amount: 18, note: "per km, two way" },
      { label: "Stay and food, out of city", amount: 3500, note: "per night per crew member" },
      { label: "Extra edited photos, per 50", amount: 4000, note: "beyond the package count" },
    ];
    if (spec.drone) {
      baseAddOns.push({
        label: "Drone coverage",
        amount: 15000,
        note: "per day, permissions extra",
      });
    }
    if (spec.album) {
      baseAddOns.push({
        label: "Extra printed album",
        amount: 12000,
        note: "same design, 150 photos",
      });
    }
    baseAddOns.push({
      label: "Same day edit reel",
      amount: 9000,
      note: "delivered before the function ends",
    });
    baseAddOns.forEach((a) =>
      addOnRows.push({
        id: id("addon"),
        photographerId,
        label: a.label,
        amount: a.amount,
        note: a.note,
      }),
    );

    const year = new Date().getFullYear();
    for (let i = 0; i < 12; i += 1) {
      const catSlug = spec.cats[i % spec.cats.length];
      const cat = catBySlug.get(catSlug)!;
      portfolioRows.push({
        id: id("port"),
        photographerId,
        kind: "PHOTO",
        title: `${cat.name.split(" ")[0]} shoot, ${city.name}`,
        categorySlug: catSlug,
        year: year - (i % 3),
        seed: `${slug}-${i}`,
        imagePath: null,
        videoUrl: null,
        position: i,
      });
    }
    portfolioRows.push({
      id: id("port"),
      photographerId,
      kind: "VIDEO",
      title: "Highlight film",
      categorySlug: spec.cats[0],
      year,
      seed: `${slug}-film`,
      imagePath: null,
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      position: 50,
    });

    // Past bookings with reviews, so the ratings on the cards are worked out
    // from real rows and not typed in by hand.
    const reviewCount = Math.min(6, Math.max(1, Math.round(spec.jobs / 35)));
    for (let i = 0; i < reviewCount; i += 1) {
      const enquiryId = id("enq");
      const eventDate = dateOnly(plusDays(-(20 + i * 23)));
      const rate = spec.rates[i % spec.rates.length];
      enquiryRows.push({
        id: enquiryId,
        photographerId,
        userId: null,
        customerName: reviewerNames[reviewerIndex % reviewerNames.length],
        customerPhone: `9${String(700000000 + reviewerIndex * 1234567).slice(0, 9)}`,
        customerEmail: "",
        eventDate,
        endDate: null,
        eventType: catBySlug.get(spec.cats[0])!.name,
        rateType: rate.type,
        hours: rate.type === "HOURLY" ? 4 : null,
        cityName: city.name,
        venue: "",
        budget: rate.amount,
        message: "Booked through BookMyShoot.",
        status: "ACCEPTED",
        quoteAmount: rate.amount,
        quoteNote: "",
        respondedAt: iso(plusDays(-(21 + i * 23))),
        createdAt: iso(plusDays(-(22 + i * 23))),
      });
      const bookingId = id("bok");
      bookingRows.push({
        id: bookingId,
        enquiryId,
        photographerId,
        eventDate,
        amountAgreed: rate.amount,
        status: "COMPLETED",
        completedAt: iso(plusDays(-(19 + i * 23))),
        createdAt: iso(plusDays(-(21 + i * 23))),
      });
      const base = spec.verification === "WORK_VERIFIED" ? 5 : 4;
      const jitter = (n: number) => Math.max(3, Math.min(5, base - ((i + n + index) % 2)));
      reviewRows.push({
        id: id("rev"),
        bookingId,
        photographerId,
        authorName: reviewerNames[reviewerIndex % reviewerNames.length],
        quality: jitter(0),
        punctuality: jitter(1),
        delivery: jitter(2),
        value: jitter(3),
        communication: jitter(1),
        comment: comments[commentIndex % comments.length],
        reply: i === 0 ? "Thank you for booking with us, it was a lovely function." : null,
        hidden: false,
        hiddenReason: null,
        createdAt: iso(plusDays(-(17 + i * 23))),
      });
      reviewerIndex += 1;
      commentIndex += 1;
    }
  });

  // Open leads, so the photographer dashboard has something in it.
  const openEnquiries = [
    { name: "Ritika Jindal", phone: "9815600122", days: 48, type: "Wedding photography", rateType: "PACKAGE", budget: 150000, message: "Two day wedding at a farmhouse near Dera Bassi. We need photos, video and drone." },
    { name: "Aman Bhatti", phone: "9988001122", days: 21, type: "Pre wedding shoots", rateType: "DAILY", budget: 40000, message: "One day pre wedding shoot in Kasauli. Two outfit changes." },
    { name: "Harleen Kaur", phone: "9876512340", days: 65, type: "Wedding photography", rateType: "WEEKLY", budget: 300000, message: "Destination wedding in Udaipur, five days. Please share what travel costs extra." },
  ];
  openEnquiries.forEach((e, i) => {
    enquiryRows.push({
      id: id("enq"),
      photographerId: photographerRows[0].id,
      userId: sampleCustomer.id,
      customerName: e.name,
      customerPhone: e.phone,
      customerEmail: "",
      eventDate: dateOnly(plusDays(e.days)),
      endDate: null,
      eventType: e.type,
      rateType: e.rateType,
      hours: null,
      cityName: "Chandigarh",
      venue: "",
      budget: e.budget,
      message: e.message,
      status: "NEW",
      quoteAmount: null,
      quoteNote: "",
      respondedAt: null,
      createdAt: iso(plusDays(-(i + 1))),
    });
  });

  // One booking coming up and one finished, so the customer account page and
  // the admin numbers are not empty.
  const acceptedId = id("enq");
  const acceptedDate = dateOnly(plusDays(34));
  enquiryRows.push({
    id: acceptedId,
    photographerId: photographerRows[1].id,
    userId: sampleCustomer.id,
    customerName: sampleCustomer.name,
    customerPhone: sampleCustomer.phone,
    customerEmail: sampleCustomer.email,
    eventDate: acceptedDate,
    endDate: null,
    eventType: "Wedding photography",
    rateType: "PACKAGE",
    hours: null,
    cityName: "Mohali",
    venue: "Hyatt Regency, Sector 17",
    budget: 78000,
    message: "One day wedding, about 250 guests. We want candid photos and a short reel.",
    status: "ACCEPTED",
    quoteAmount: 82000,
    quoteNote: "2 shooters, 300 edited photos, 1 printed album, 1 reel. Travel inside tricity free.",
    respondedAt: iso(plusDays(-2)),
    createdAt: iso(plusDays(-3)),
  });
  bookingRows.push({
    id: id("bok"),
    enquiryId: acceptedId,
    photographerId: photographerRows[1].id,
    eventDate: acceptedDate,
    amountAgreed: 82000,
    status: "CONFIRMED",
    completedAt: null,
    createdAt: iso(plusDays(-2)),
  });

  const pastId = id("enq");
  const pastDate = dateOnly(plusDays(-14));
  enquiryRows.push({
    id: pastId,
    photographerId: photographerRows[3].id,
    userId: sampleCustomer.id,
    customerName: sampleCustomer.name,
    customerPhone: sampleCustomer.phone,
    customerEmail: sampleCustomer.email,
    eventDate: pastDate,
    endDate: null,
    eventType: "Birthday and family events",
    rateType: "HOURLY",
    hours: 3,
    cityName: "Panchkula",
    venue: "",
    budget: 9000,
    message: "Birthday at home, about 3 hours.",
    status: "ACCEPTED",
    quoteAmount: 9000,
    quoteNote: "3 hours, 150 edited photos.",
    respondedAt: iso(plusDays(-18)),
    createdAt: iso(plusDays(-19)),
  });
  bookingRows.push({
    id: id("bok"),
    enquiryId: pastId,
    photographerId: photographerRows[3].id,
    eventDate: pastDate,
    amountAgreed: 9000,
    status: "COMPLETED",
    completedAt: iso(plusDays(-12)),
    createdAt: iso(plusDays(-18)),
  });
}

async function run() {
  await wipe();

  await cols.cities.insertMany(cityList);
  await cols.categories.insertMany(categoryList);
  await cols.users.insertMany(userRows);
  await cols.photographers.insertMany(photographerRows);
  await cols.rates.insertMany(rateRows);
  await cols.addOns.insertMany(addOnRows);
  await cols.portfolio.insertMany(portfolioRows);
  await cols.enquiries.insertMany(enquiryRows);
  await cols.bookings.insertMany(bookingRows);
  await cols.reviews.insertMany(reviewRows);

  console.log(`Seeded into ${storageLabel()}.`);
  console.log("");
  console.log(`  cities         ${cityList.length}`);
  console.log(`  categories     ${categoryList.length}`);
  console.log(`  users          ${userRows.length}`);
  console.log(`  photographers  ${photographerRows.length}`);
  console.log(`  rates          ${rateRows.length}`);
  console.log(`  portfolio      ${portfolioRows.length}`);
  console.log(`  enquiries      ${enquiryRows.length}`);
  console.log(`  bookings       ${bookingRows.length}`);
  console.log(`  reviews        ${reviewRows.length}`);
  console.log("");
  console.log("Your admin login:");
  console.log("  admin@bookmyshoot.in          (admin123)");
  if (!bare) {
    console.log("");
    console.log("Sample logins, delete them whenever you want:");
    console.log("  sample.admin@bookmyshoot.in   (sample123)  second admin");
    console.log(`  ${userRows[3].email}  (sample123)  photographer dashboard`);
    console.log("  sample.customer@example.com   (sample123)  customer account");
    console.log("");
    console.log(`${photographerRows.length} sample profiles were created, each one named "Sample ...".`);
    console.log("Admin > Admins has a button that removes all of them, and the sample logins, in one click.");
  }
  console.log("");
  console.log("Change the admin password before you put this online.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
