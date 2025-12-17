import { loadJSON, saveJSON } from "./storage";

export type ItemCategory = "espeto" | "bebida" | "outros";

export type Item = {
  id: string;
  name: string;
  category: ItemCategory;
  price: number; // em reais (ex: 10)
  active: boolean;
};

export type DayRecord = {
  date: string; // YYYY-MM-DD
  stockInitialByItem: Record<string, number>;
  soldByItem: Record<string, number>;
  restocked: boolean;
  closed: boolean; // FECHAR DIA trava edição
  closedAt?: string; // ISO string
};

export type DB = {
  items: Item[];
  days: Record<string, DayRecord>; // date -> record
};

const KEY = "estoque_db_v2";

const seed: DB = {
  items: [
    { id: "vaca", name: "Vaca", category: "espeto", price: 10, active: true },
    { id: "medalhao", name: "Medalhão", category: "espeto", price: 10, active: true },
    { id: "kafta", name: "Kafta", category: "espeto", price: 10, active: true },
  ],
  days: {},
};

let db: DB = loadJSON(KEY, seed);

function emit() {
  window.dispatchEvent(new Event("db:update"));
}

export function getDB() {
  return db;
}

export function setDB(next: DB) {
  db = next;
  saveJSON(KEY, db);
  emit();
}

export function ensureDay(date: string): DayRecord {
  const existing = db.days[date];
  if (existing) return existing;

  const day: DayRecord = {
    date,
    stockInitialByItem: {},
    soldByItem: {},
    restocked: false,
    closed: false,
  };

  setDB({ ...db, days: { ...db.days, [date]: day } });
  return day;
}

export function upsertDay(date: string, patch: Partial<DayRecord>) {
  const current = ensureDay(date);
  setDB({
    ...db,
    days: {
      ...db.days,
      [date]: { ...current, ...patch },
    },
  });
}

export function updateDayQty(
  date: string,
  type: "stock" | "sold",
  itemId: string,
  qty: number
) {
  const day = ensureDay(date);
  if (day.closed) return; // trava edição

  const key = type === "stock" ? "stockInitialByItem" : "soldByItem";
  const nextQty = Math.max(0, Math.floor(Number.isFinite(qty) ? qty : 0));

  setDB({
    ...db,
    days: {
      ...db.days,
      [date]: {
        ...day,
        [key]: {
          ...day[key],
          [itemId]: nextQty,
        },
      },
    },
  });
}

export function closeDay(date: string) {
  const day = ensureDay(date);
  if (day.closed) return;

  upsertDay(date, { closed: true, closedAt: new Date().toISOString() });
}

export function reopenDay(date: string) {
  const day = ensureDay(date);
  if (!day.closed) return;
  upsertDay(date, { closed: false });
}

export function addItem(item: Omit<Item, "id">) {
  const id = slugify(item.name);
  const uniqueId = makeUniqueId(id, db.items.map((i) => i.id));
  setDB({ ...db, items: [...db.items, { ...item, id: uniqueId }] });
}

export function updateItem(id: string, patch: Partial<Omit<Item, "id">>) {
  setDB({
    ...db,
    items: db.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
  });
}

export function deleteItem(id: string) {
  // mantém histórico do dia: só desativa ao invés de apagar definitivo
  updateItem(id, { active: false });
}

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function makeUniqueId(base: string, used: string[]) {
  if (!used.includes(base)) return base;
  let i = 2;
  while (used.includes(`${base}_${i}`)) i++;
  return `${base}_${i}`;
}
