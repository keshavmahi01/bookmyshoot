/**
 * BookMyShoot data model (MongoDB).
 *
 * Every collection stores plain documents. The `id` field you see here is the
 * document `_id` in MongoDB; the store layer maps between the two so the rest
 * of the app only ever deals with `id`.
 *
 * Collections
 *   users              people who signed up (customer, photographer, admin)
 *   cities             the city list, with district, state and map point
 *   categories         shoot types
 *   photographers      one profile per photographer, with its shoot types and
 *                      busy dates kept inside the same document
 *   rates              price lines for a profile
 *   add_ons            extras for a profile
 *   portfolio_items    photos and videos of a profile
 *   enquiries          what a customer sends
 *   bookings           an accepted enquiry
 *   reviews            feedback after a finished job
 *   messages           chat inside an enquiry
 *   notifications      bell items
 *   site_images        pictures the admin uploads for the home page
 *   suggestions        the suggestion box on the home page
 *   admin_logs         every admin action
 */

export type Role = "CUSTOMER" | "PHOTOGRAPHER" | "ADMIN";
export type ProfileStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Verification = "LISTED" | "ID_VERIFIED" | "WORK_VERIFIED";
export type Gender = "MALE" | "FEMALE" | "TEAM";
export type RateType = "HOURLY" | "DAILY" | "WEEKLY" | "PACKAGE";
export type EnquiryStatus = "NEW" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type BlockStatus = "BUSY" | "HOLD";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  /** Set on the rows the seed creates, so the admin can spot and delete them. */
  sample: boolean;
  createdAt: string;
};

export type City = {
  id: string;
  slug: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  popular: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  singular: string;
  description: string;
  imagePath: string | null;
  popular: boolean;
};

/** A date the photographer is not free. Kept inside the profile document. */
export type BlockedDate = {
  date: string; // YYYY-MM-DD
  status: BlockStatus;
  note: string;
};

export type Photographer = {
  id: string;
  slug: string;
  userId: string;
  displayName: string;
  tagline: string;
  bio: string;
  avatarPath: string | null;
  coverPath: string | null;

  instagram: string;
  facebook: string;
  youtube: string;
  website: string;

  cityId: string;
  travelKm: number;
  travelsAllIndia: boolean;

  /** Shoot types, kept on the profile instead of a join collection. */
  categoryIds: string[];
  /** Busy and held dates, kept on the profile. */
  blocked: BlockedDate[];

  yearsExperience: number;
  teamSize: number;
  languages: string[];
  gender: Gender;

  verification: Verification;
  verifiedNote: string;
  verifiedAt: string | null;

  gear: string;
  backupGear: boolean;
  droneAvailable: boolean;
  secondShooter: boolean;
  ownEditing: boolean;

  deliveryDays: number;
  photosPerDay: number;
  rawFiles: boolean;
  albumIncluded: boolean;

  responseHours: number;
  eventsCovered: number;
  jobsCompleted: number;
  repeatClients: number;
  cancellations: number;

  referredBy: string;
  featured: boolean;
  featuredOrder: number;
  /** Weekly off days, 0 is Sunday. */
  weeklyOff: number[];

  status: ProfileStatus;
  reviewNote: string;
  reviewedAt: string | null;
  active: boolean;
  /** True for the profiles the seed creates. */
  sample: boolean;
  lastActiveAt: string;
  createdAt: string;
};

export type Rate = {
  id: string;
  photographerId: string;
  type: RateType;
  title: string;
  amount: number;
  minUnits: number;
  extraUnitRate: number | null;
  details: string;
  active: boolean;
};

export type AddOn = {
  id: string;
  photographerId: string;
  label: string;
  amount: number;
  note: string;
};

export type PortfolioItem = {
  id: string;
  photographerId: string;
  kind: "PHOTO" | "VIDEO";
  title: string;
  categorySlug: string;
  year: number;
  seed: string;
  imagePath: string | null;
  videoUrl: string | null;
  position: number;
};

export type Enquiry = {
  id: string;
  photographerId: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  endDate: string | null;
  eventType: string;
  rateType: string;
  hours: number | null;
  cityName: string;
  venue: string;
  budget: number | null;
  message: string;
  status: EnquiryStatus;
  quoteAmount: number | null;
  quoteNote: string;
  respondedAt: string | null;
  createdAt: string;
};

export type Booking = {
  id: string;
  enquiryId: string;
  photographerId: string;
  eventDate: string;
  amountAgreed: number | null;
  status: BookingStatus;
  completedAt: string | null;
  createdAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  photographerId: string;
  authorName: string;
  quality: number;
  punctuality: number;
  delivery: number;
  value: number;
  communication: number;
  comment: string;
  reply: string | null;
  hidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  enquiryId: string;
  senderUserId: string | null;
  senderRole: "CUSTOMER" | "PHOTOGRAPHER";
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  kind: "LEAD" | "REPLY" | "MESSAGE" | "APPROVAL" | "REVIEW";
  title: string;
  body: string;
  link: string;
  readAt: string | null;
  createdAt: string;
};

export type SiteImage = {
  id: string;
  slot: string;
  imagePath: string;
  caption: string;
  position: number;
  active: boolean;
  createdAt: string;
};

export type Suggestion = {
  id: string;
  name: string;
  contact: string;
  body: string;
  handled: boolean;
  createdAt: string;
};

export type AdminLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  createdAt: string;
};
