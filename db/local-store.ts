/**
 * A small MongoDB stand in that keeps everything in one JSON file.
 *
 * It is here only so the site runs when no MongoDB server is set up yet. It
 * understands the same calls and the same query operators that this project
 * uses, so the application code is the same either way. Set MONGODB_URI and
 * the real driver is used instead.
 */
import fs from "node:fs";
import path from "node:path";

export type Doc = Record<string, unknown>;
type Filter = Record<string, unknown>;

const file =
  process.env.LOCAL_DB_FILE ?? path.join(process.cwd(), "data", "bookmyshoot.local.json");

type Shape = Record<string, Doc[]>;

let data: Shape = {};
let loadedAt = -1;

function mtime() {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return -1;
  }
}

/** Reload when another process (the seed script) has rewritten the file. */
function load() {
  const stamp = mtime();
  if (stamp === loadedAt) return;
  if (stamp === -1) {
    data = {};
    loadedAt = -1;
    return;
  }
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8")) as Shape;
  } catch {
    data = {};
  }
  loadedAt = stamp;
}

function save() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 1));
  loadedAt = mtime();
}

function bucket(name: string) {
  load();
  if (!data[name]) data[name] = [];
  return data[name];
}

function reach(doc: Doc, pathExpr: string): unknown {
  if (!pathExpr.includes(".")) return doc[pathExpr];
  let current: unknown = doc;
  for (const part of pathExpr.split(".")) {
    if (current === null || current === undefined) return undefined;
    current = (current as Doc)[part];
  }
  return current;
}

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => same(x, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as Doc);
    const kb = Object.keys(b as Doc);
    return ka.length === kb.length && ka.every((k) => same((a as Doc)[k], (b as Doc)[k]));
  }
  return false;
}

/** Mongo treats a field holding an array as a match if any element matches. */
function hits(actual: unknown, wanted: unknown) {
  if (same(actual, wanted)) return true;
  return Array.isArray(actual) && actual.some((item) => same(item, wanted));
}

function compare(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  const sa = a === null || a === undefined ? "" : String(a);
  const sb = b === null || b === undefined ? "" : String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function operators(actual: unknown, expr: Doc): boolean {
  for (const [op, wanted] of Object.entries(expr)) {
    switch (op) {
      case "$eq":
        if (!hits(actual, wanted)) return false;
        break;
      case "$ne":
        if (hits(actual, wanted)) return false;
        break;
      case "$in":
        if (!(wanted as unknown[]).some((w) => hits(actual, w))) return false;
        break;
      case "$nin":
        if ((wanted as unknown[]).some((w) => hits(actual, w))) return false;
        break;
      case "$gt":
        if (!(compare(actual, wanted) > 0)) return false;
        break;
      case "$gte":
        if (!(compare(actual, wanted) >= 0)) return false;
        break;
      case "$lt":
        if (!(compare(actual, wanted) < 0)) return false;
        break;
      case "$lte":
        if (!(compare(actual, wanted) <= 0)) return false;
        break;
      case "$exists":
        if ((actual !== undefined) !== Boolean(wanted)) return false;
        break;
      case "$all":
        if (!Array.isArray(actual)) return false;
        if (!(wanted as unknown[]).every((w) => actual.some((item) => same(item, w)))) return false;
        break;
      case "$regex": {
        const flags = typeof expr.$options === "string" ? expr.$options : "";
        const re = wanted instanceof RegExp ? wanted : new RegExp(String(wanted), flags);
        if (typeof actual !== "string" || !re.test(actual)) return false;
        break;
      }
      case "$options":
        break;
      case "$not":
        if (matches({ __v: actual } as Doc, { __v: wanted } as Filter)) return false;
        break;
      case "$elemMatch": {
        if (!Array.isArray(actual)) return false;
        if (!actual.some((item) => matches(item as Doc, wanted as Filter))) return false;
        break;
      }
      default:
        throw new Error(`local store: operator ${op} is not supported`);
    }
  }
  return true;
}

function isOperatorExpression(value: unknown) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    Object.keys(value as Doc).every((k) => k.startsWith("$"))
  );
}

export function matches(doc: Doc, filter: Filter = {}): boolean {
  for (const [key, wanted] of Object.entries(filter)) {
    if (key === "$or") {
      if (!(wanted as Filter[]).some((f) => matches(doc, f))) return false;
      continue;
    }
    if (key === "$and") {
      if (!(wanted as Filter[]).every((f) => matches(doc, f))) return false;
      continue;
    }
    if (key === "$nor") {
      if ((wanted as Filter[]).some((f) => matches(doc, f))) return false;
      continue;
    }
    const actual = reach(doc, key);
    if (wanted instanceof RegExp) {
      if (typeof actual !== "string" || !wanted.test(actual)) return false;
      continue;
    }
    if (isOperatorExpression(wanted)) {
      if (!operators(actual, wanted as Doc)) return false;
      continue;
    }
    if (!hits(actual, wanted)) return false;
  }
  return true;
}

function applyUpdate(doc: Doc, update: Doc) {
  for (const [op, body] of Object.entries(update)) {
    const fields = body as Doc;
    switch (op) {
      case "$set":
        for (const [k, v] of Object.entries(fields)) doc[k] = v;
        break;
      case "$unset":
        for (const k of Object.keys(fields)) delete doc[k];
        break;
      case "$inc":
        for (const [k, v] of Object.entries(fields)) {
          doc[k] = (typeof doc[k] === "number" ? (doc[k] as number) : 0) + Number(v);
        }
        break;
      case "$push":
        for (const [k, v] of Object.entries(fields)) {
          const list = Array.isArray(doc[k]) ? (doc[k] as unknown[]) : [];
          if (v && typeof v === "object" && "$each" in (v as Doc)) {
            list.push(...((v as Doc).$each as unknown[]));
          } else {
            list.push(v);
          }
          doc[k] = list;
        }
        break;
      case "$addToSet":
        for (const [k, v] of Object.entries(fields)) {
          const list = Array.isArray(doc[k]) ? (doc[k] as unknown[]) : [];
          if (!list.some((item) => same(item, v))) list.push(v);
          doc[k] = list;
        }
        break;
      case "$pull":
        for (const [k, v] of Object.entries(fields)) {
          const list = Array.isArray(doc[k]) ? (doc[k] as unknown[]) : [];
          doc[k] = list.filter((item) =>
            isOperatorExpression(v) || (v && typeof v === "object" && !Array.isArray(v))
              ? !matches(item as Doc, v as Filter) && !same(item, v)
              : !same(item, v),
          );
        }
        break;
      default:
        throw new Error(`local store: update operator ${op} is not supported`);
    }
  }
}

function ordered(list: Doc[], sort?: Record<string, 1 | -1>) {
  if (!sort) return list;
  const keys = Object.entries(sort);
  return [...list].sort((a, b) => {
    for (const [key, dir] of keys) {
      const diff = compare(reach(a, key), reach(b, key));
      if (diff !== 0) return dir === -1 ? -diff : diff;
    }
    return 0;
  });
}

export type FindOptions = {
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
};

/** The same calls the MongoDB driver offers, for the part of it we use. */
export function localCollection(name: string) {
  return {
    async find(filter: Filter = {}, options: FindOptions = {}) {
      let rows = bucket(name).filter((d) => matches(d, filter));
      rows = ordered(rows, options.sort);
      if (options.skip) rows = rows.slice(options.skip);
      if (options.limit) rows = rows.slice(0, options.limit);
      return rows.map((d) => structuredClone(d));
    },
    async findOne(filter: Filter = {}, options: FindOptions = {}) {
      const rows = await this.find(filter, { ...options, limit: 1 });
      return rows[0] ?? null;
    },
    async countDocuments(filter: Filter = {}) {
      return bucket(name).filter((d) => matches(d, filter)).length;
    },
    async insertOne(doc: Doc) {
      bucket(name).push(structuredClone(doc));
      save();
    },
    async insertMany(docs: Doc[]) {
      if (docs.length === 0) return;
      bucket(name).push(...docs.map((d) => structuredClone(d)));
      save();
    },
    async updateOne(filter: Filter, update: Doc) {
      const row = bucket(name).find((d) => matches(d, filter));
      if (!row) return 0;
      applyUpdate(row, update);
      save();
      return 1;
    },
    async updateMany(filter: Filter, update: Doc) {
      const rows = bucket(name).filter((d) => matches(d, filter));
      for (const row of rows) applyUpdate(row, update);
      if (rows.length) save();
      return rows.length;
    },
    async deleteOne(filter: Filter) {
      const list = bucket(name);
      const at = list.findIndex((d) => matches(d, filter));
      if (at === -1) return 0;
      list.splice(at, 1);
      save();
      return 1;
    },
    async deleteMany(filter: Filter) {
      const list = bucket(name);
      const keep = list.filter((d) => !matches(d, filter));
      const removed = list.length - keep.length;
      data[name] = keep;
      if (removed) save();
      return removed;
    },
  };
}

export function localReset() {
  data = {};
  save();
}
