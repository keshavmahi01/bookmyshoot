export const SITE = {
  name: "BookMyShoot",
  tagline: "Find and book a verified photographer anywhere in India",
  email: "hello@bookmyshoot.in",
  phone: "+91 00000 00000",
};

export const RATE_TYPES = [
  { value: "HOURLY", label: "Per hour", unit: "hour" },
  { value: "DAILY", label: "Per day", unit: "day" },
  { value: "WEEKLY", label: "Per week", unit: "week" },
  { value: "PACKAGE", label: "Event package", unit: "event" },
] as const;

export type RateType = (typeof RATE_TYPES)[number]["value"];

export const rateUnit = (type: string) =>
  RATE_TYPES.find((r) => r.value === type)?.unit ?? "event";

export const rateLabel = (type: string) =>
  RATE_TYPES.find((r) => r.value === type)?.label ?? "Package";

export const VERIFICATION = {
  LISTED: {
    label: "Listed",
    short: "Listed",
    note: "Phone number and email checked.",
    tone: "muted",
  },
  ID_VERIFIED: {
    label: "ID verified",
    short: "ID verified",
    note: "Government ID matched with the profile name and a selfie check done.",
    tone: "blue",
  },
  WORK_VERIFIED: {
    label: "Work verified",
    short: "Work verified",
    note: "ID verified, original files of 3 shoots checked and 2 past clients spoken to.",
    tone: "green",
  },
} as const;

export const LANGUAGES = [
  "Hindi",
  "English",
  "Punjabi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const BUDGET_BANDS = [
  { value: "", label: "Any budget" },
  { value: "0-15000", label: "Under 15,000" },
  { value: "15000-35000", label: "15,000 to 35,000" },
  { value: "35000-75000", label: "35,000 to 75,000" },
  { value: "75000-150000", label: "75,000 to 1.5 lakh" },
  { value: "150000-0", label: "Above 1.5 lakh" },
];

export const SORT_OPTIONS = [
  { value: "best", label: "Best match" },
  { value: "rating", label: "Highest rated" },
  { value: "price_low", label: "Starting price, low to high" },
  { value: "price_high", label: "Starting price, high to low" },
  { value: "experience", label: "Most experienced" },
];
