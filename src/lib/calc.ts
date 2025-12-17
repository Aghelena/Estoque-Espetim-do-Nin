import type { Item, DayRecord } from "../app/store";

export function remaining(day: DayRecord, itemId: string) {
  const init = day.stockInitialByItem[itemId] ?? 0;
  const sold = day.soldByItem[itemId] ?? 0;
  return Math.max(0, init - sold);
}

export function totals(day: DayRecord) {
  const initial = Object.values(day.stockInitialByItem).reduce((a, b) => a + (b ?? 0), 0);
  const sold = Object.values(day.soldByItem).reduce((a, b) => a + (b ?? 0), 0);
  const rest = Math.max(0, initial - sold);
  return { initial, sold, rest };
}

export function grossRevenue(items: Item[], day: DayRecord) {
  const priceById = new Map(items.map((i) => [i.id, i.price]));
  return Object.entries(day.soldByItem).reduce((sum, [id, qty]) => {
    const p = priceById.get(id) ?? 0;
    return sum + (qty ?? 0) * p;
  }, 0);
}

export function totalUnits(day: DayRecord) {
  return Object.values(day.soldByItem).reduce((a, b) => a + (b ?? 0), 0);
}

export function topSoldItem(items: Item[], day: DayRecord, category?: Item["category"]) {
  const filtered = category ? items.filter((i) => i.category === category) : items;
  let best: { id: string; qty: number } | null = null;

  for (const it of filtered) {
    const qty = day.soldByItem[it.id] ?? 0;
    if (!best || qty > best.qty) best = { id: it.id, qty };
  }
  if (!best || best.qty === 0) return null;

  const item = items.find((i) => i.id === best!.id);
  return item ? { item, qty: best.qty } : null;
}

export function remainingClass(rest: number) {
  if (rest === 0) return "bg-red-500 text-white";
  if (rest <= 5) return "bg-yellow-300 text-black";
  return "bg-green-400 text-black";
}
