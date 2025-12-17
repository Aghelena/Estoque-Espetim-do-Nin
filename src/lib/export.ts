import * as XLSX from "xlsx";
import type { DB, DayRecord, Item } from "../app/store";
import { grossRevenue, remaining, totalUnits, topSoldItem } from "./calc";
import { weekdayPT, getWeekDates } from "./dates";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportDayCSV(items: Item[], day: DayRecord) {
  const header = ["Tipo", "Estoque", "Vendidos", "Restantes", "Preço", "Receita"];
  const rows = items.map((it) => {
    const estoque = day.stockInitialByItem[it.id] ?? 0;
    const vendidos = day.soldByItem[it.id] ?? 0;
    const rest = remaining(day, it.id);
    const receita = vendidos * (it.price ?? 0);
    return [it.name, estoque, vendidos, rest, it.price, receita];
  });

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  downloadBlob(`estoque_${day.date}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function exportDayXLSX(items: Item[], day: DayRecord) {
  const data = [
    ["Tipo", "Estoque", "Vendidos", "Restantes", "Preço", "Receita"],
    ...items.map((it) => {
      const estoque = day.stockInitialByItem[it.id] ?? 0;
      const vendidos = day.soldByItem[it.id] ?? 0;
      const rest = remaining(day, it.id);
      const receita = vendidos * (it.price ?? 0);
      return [it.name, estoque, vendidos, rest, it.price, receita];
    }),
    [],
    ["Data", day.date],
    ["Receita bruta", grossRevenue(items, day)],
    ["Unidades vendidas", totalUnits(day)],
    ["Estoque reposto", day.restocked ? "Sim" : "Não"],
    ["Fechado", day.closed ? "Sim" : "Não"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dia");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(`estoque_${day.date}.xlsx`, new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
}

export function exportWeekXLSX(db: DB, baseDateISO: string) {
  const dates = getWeekDates(baseDateISO); // domingo..sábado
  const items = db.items;

  const sheetRows = [
    ["Dia", "Data", "Mais vendido (Espeto)", "Vendas (Unidades)", "Receita Bruta (R$)", "Estoque Reposto", "Fechado"],
  ];

  for (const date of dates) {
    const day = db.days[date];
    const top = day ? topSoldItem(items, day, "espeto") : null;
    const units = day ? totalUnits(day) : 0;
    const revenue = day ? grossRevenue(items, day) : 0;

    sheetRows.push([
      weekdayPT(date),
      date,
      top ? `${top.item.name} (${top.qty})` : "-",
      units,
      revenue,
      day?.restocked ? "Sim" : "Não",
      day?.closed ? "Sim" : "Não",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rendimento");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(`rendimento_semana_${baseDateISO}.xlsx`, new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
}
