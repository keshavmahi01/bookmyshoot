/**
 * Database access for BookMyShoot.
 *
 * Set MONGODB_URI and every call below goes to that MongoDB server, local or
 * Atlas. Leave it unset and the same calls go to a JSON file instead, so the
 * site still runs before MongoDB is set up. Nothing else in the app changes.
 *
 *   MONGODB_URI=mongodb://127.0.0.1:27017
 *   MONGODB_DB=bookmyshoot
 *
 * Documents are stored with the application `id` as the MongoDB `_id`. The
 * mapping happens here, so the rest of the code only ever sees `id`.
 */
import { MongoClient, type Collection, type Db, type Document } from "mongodb";
import { localCollection } from "./local-store";
import type {
  AddOn,
  AdminLog,
  AppNotification,
  Booking,
  Category,
  City,
  Enquiry,
  Message,
  Photographer,
  PortfolioItem,
  Rate,
  Review,
  SiteImage,
  Suggestion,
  User,
} from "./schema";

export const MONGODB_URI = process.env.MONGODB_URI ?? "";
export const MONGODB_DB = process.env.MONGODB_DB ?? "bookmyshoot";
export const usingMongo = MONGODB_URI.length > 0;

export type Filter = Record<string, unknown>;
export type SortSpec = Record<string, 1 | -1>;
export type FindOptions = { sort?: SortSpec; skip?: number; limit?: number };
export type Update = Record<string, Record<string, unknown>>;

type Row = { id: string };

/** Rename the `id` key to `_id`, including inside $and / $or / $nor. */
function mapFilter(filter: Filter = {}): Document {
  const out: Document = {};
  for (const [key, value] of Object.entries(filter)) {
    if (key === "$or" || key === "$and" || key === "$nor") {
      out[key] = (value as Filter[]).map(mapFilter);
    } else if (key === "id") {
      out._id = value;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function mapSort(sort?: SortSpec) {
  if (!sort) return undefined;
  const out: SortSpec = {};
  for (const [key, dir] of Object.entries(sort)) out[key === "id" ? "_id" : key] = dir;
  return out;
}

function toDoc<T extends Row>(row: T): Document {
  const { id, ...rest } = row;
  return { _id: id, ...rest };
}

function fromDoc<T extends Row>(doc: Document | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest } as T;
}

function mapUpdate(update: Update): Document {
  const out: Document = {};
  for (const [op, body] of Object.entries(update)) {
    const fields: Document = {};
    for (const [key, value] of Object.entries(body)) {
      if (key === "id") continue; // the _id of a document never changes
      fields[key] = value;
    }
    out[op] = fields;
  }
  return out;
}

export type Store<T extends Row> = {
  find(filter?: Filter, options?: FindOptions): Promise<T[]>;
  findOne(filter?: Filter, options?: FindOptions): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  countDocuments(filter?: Filter): Promise<number>;
  insertOne(doc: T): Promise<T>;
  insertMany(docs: T[]): Promise<void>;
  updateOne(filter: Filter, update: Update): Promise<number>;
  updateById(id: string, update: Update): Promise<number>;
  setById(id: string, patch: Partial<T>): Promise<number>;
  updateMany(filter: Filter, update: Update): Promise<number>;
  deleteOne(filter: Filter): Promise<number>;
  deleteById(id: string): Promise<number>;
  deleteMany(filter: Filter): Promise<number>;
};

declare global {
  var __bookmyshootMongo: Promise<Db> | undefined;
}

function openMongo() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  return client.connect().then(async (c) => {
    const db = c.db(MONGODB_DB);
    await ensureIndexes(db);
    return db;
  });
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ phone: 1 }, { unique: true }),
    db.collection("cities").createIndex({ slug: 1 }, { unique: true }),
    db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
    db.collection("photographers").createIndex({ slug: 1 }, { unique: true }),
    db.collection("photographers").createIndex({ userId: 1 }, { unique: true }),
    db.collection("photographers").createIndex({ status: 1, active: 1 }),
    db.collection("photographers").createIndex({ cityId: 1 }),
    db.collection("photographers").createIndex({ categoryIds: 1 }),
    db.collection("rates").createIndex({ photographerId: 1 }),
    db.collection("add_ons").createIndex({ photographerId: 1 }),
    db.collection("portfolio_items").createIndex({ photographerId: 1 }),
    db.collection("enquiries").createIndex({ photographerId: 1, createdAt: -1 }),
    db.collection("enquiries").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("bookings").createIndex({ enquiryId: 1 }, { unique: true }),
    db.collection("bookings").createIndex({ photographerId: 1 }),
    db.collection("reviews").createIndex({ bookingId: 1 }, { unique: true }),
    db.collection("reviews").createIndex({ photographerId: 1 }),
    db.collection("messages").createIndex({ enquiryId: 1, createdAt: 1 }),
    db.collection("notifications").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("site_images").createIndex({ slot: 1, position: 1 }),
    db.collection("suggestions").createIndex({ createdAt: -1 }),
    db.collection("admin_logs").createIndex({ createdAt: -1 }),
  ]);
}

export function database() {
  if (!usingMongo) throw new Error("MONGODB_URI is not set");
  if (!globalThis.__bookmyshootMongo) globalThis.__bookmyshootMongo = openMongo();
  return globalThis.__bookmyshootMongo;
}

function mongoStore<T extends Row>(name: string): Store<T> {
  const handle = async () => (await database()).collection(name) as Collection<Document>;
  const store: Store<T> = {
    async find(filter = {}, options = {}) {
      const col = await handle();
      let cursor = col.find(mapFilter(filter));
      const sort = mapSort(options.sort);
      if (sort) cursor = cursor.sort(sort);
      if (options.skip) cursor = cursor.skip(options.skip);
      if (options.limit) cursor = cursor.limit(options.limit);
      const rows = await cursor.toArray();
      return rows.map((r) => fromDoc<T>(r)!) as T[];
    },
    async findOne(filter = {}, options = {}) {
      const col = await handle();
      return fromDoc<T>(await col.findOne(mapFilter(filter), { sort: mapSort(options.sort) }));
    },
    findById(id) {
      return store.findOne({ id });
    },
    async countDocuments(filter = {}) {
      const col = await handle();
      return col.countDocuments(mapFilter(filter));
    },
    async insertOne(doc) {
      const col = await handle();
      await col.insertOne(toDoc(doc));
      return doc;
    },
    async insertMany(docs) {
      if (docs.length === 0) return;
      const col = await handle();
      await col.insertMany(docs.map(toDoc));
    },
    async updateOne(filter, update) {
      const col = await handle();
      const res = await col.updateOne(mapFilter(filter), mapUpdate(update));
      return res.modifiedCount;
    },
    updateById(id, update) {
      return store.updateOne({ id }, update);
    },
    setById(id, patch) {
      return store.updateOne({ id }, { $set: patch as Record<string, unknown> });
    },
    async updateMany(filter, update) {
      const col = await handle();
      const res = await col.updateMany(mapFilter(filter), mapUpdate(update));
      return res.modifiedCount;
    },
    async deleteOne(filter) {
      const col = await handle();
      const res = await col.deleteOne(mapFilter(filter));
      return res.deletedCount;
    },
    deleteById(id) {
      return store.deleteOne({ id });
    },
    async deleteMany(filter) {
      const col = await handle();
      const res = await col.deleteMany(mapFilter(filter));
      return res.deletedCount;
    },
  };
  return store;
}

function fileStore<T extends Row>(name: string): Store<T> {
  const col = localCollection(name);
  const store: Store<T> = {
    async find(filter = {}, options = {}) {
      const rows = await col.find(mapFilter(filter), { ...options, sort: mapSort(options.sort) });
      return rows.map((r) => fromDoc<T>(r)!) as T[];
    },
    async findOne(filter = {}, options = {}) {
      return fromDoc<T>(
        await col.findOne(mapFilter(filter), { ...options, sort: mapSort(options.sort) }),
      );
    },
    findById(id) {
      return store.findOne({ id });
    },
    countDocuments(filter = {}) {
      return col.countDocuments(mapFilter(filter));
    },
    async insertOne(doc) {
      await col.insertOne(toDoc(doc));
      return doc;
    },
    insertMany(docs) {
      return col.insertMany(docs.map(toDoc));
    },
    updateOne(filter, update) {
      return col.updateOne(mapFilter(filter), mapUpdate(update));
    },
    updateById(id, update) {
      return store.updateOne({ id }, update);
    },
    setById(id, patch) {
      return store.updateOne({ id }, { $set: patch as Record<string, unknown> });
    },
    updateMany(filter, update) {
      return col.updateMany(mapFilter(filter), mapUpdate(update));
    },
    deleteOne(filter) {
      return col.deleteOne(mapFilter(filter));
    },
    deleteById(id) {
      return store.deleteOne({ id });
    },
    deleteMany(filter) {
      return col.deleteMany(mapFilter(filter));
    },
  };
  return store;
}

function store<T extends Row>(name: string): Store<T> {
  return usingMongo ? mongoStore<T>(name) : fileStore<T>(name);
}

/** Every collection in the database. */
export const cols = {
  users: store<User>("users"),
  cities: store<City>("cities"),
  categories: store<Category>("categories"),
  photographers: store<Photographer>("photographers"),
  rates: store<Rate>("rates"),
  addOns: store<AddOn>("add_ons"),
  portfolio: store<PortfolioItem>("portfolio_items"),
  enquiries: store<Enquiry>("enquiries"),
  bookings: store<Booking>("bookings"),
  reviews: store<Review>("reviews"),
  messages: store<Message>("messages"),
  notifications: store<AppNotification>("notifications"),
  siteImages: store<SiteImage>("site_images"),
  suggestions: store<Suggestion>("suggestions"),
  adminLogs: store<AdminLog>("admin_logs"),
};

export const COLLECTION_NAMES = [
  "users",
  "cities",
  "categories",
  "photographers",
  "rates",
  "add_ons",
  "portfolio_items",
  "enquiries",
  "bookings",
  "reviews",
  "messages",
  "notifications",
  "site_images",
  "suggestions",
  "admin_logs",
] as const;

export function storageLabel() {
  return usingMongo ? `MongoDB ${MONGODB_DB}` : "local JSON file (MONGODB_URI not set)";
}
