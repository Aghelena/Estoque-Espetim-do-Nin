import { useEffect, useMemo, useState } from "react";
import {
  closeDay,
  ensureDay,
  getDB,
  reopenDay,
  updateDayQty,
  upsertDay,
} from "../app/store";
import { InventoryTable } from "../components/InventoryTable";
import { DayPicker } from "../components/DayPicker";
import { StatCard } from "../components/StatCard";
import { grossRevenue, totals } from "../lib/calc";
import { exportDayCSV, exportDayXLSX } from "../lib/export";
import { todayISO, weekdayPT } from "../lib/dates";

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    window.addEventListener("db:update", fn);
    return () => window.removeEventListener("db:update", fn);
  }, []);

  const db = getDB();
  const day = ensureDay(date);
  const items = db.items;

  const t = useMemo(() => totals(day), [tick, date]);
  const revenue = useMemo(() => grossRevenue(items, day), [tick, date]);
  const locked = day.closed;

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-head">
        <div>
          <h1 className="h1">Estoque do Dia</h1>
          <p className="p">
            {weekdayPT(date)} • {date} {day.closed ? "• Fechado" : ""}
          </p>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="toolbar-item">
            <span className="toolbar-label"> </span>
            <DayPicker value={date} onChange={setDate} />
          </div>

          <label className={`check ${locked ? "check-disabled" : ""}`}>
            <input
              type="checkbox"
              checked={day.restocked}
              disabled={locked}
              onChange={(e) => upsertDay(date, { restocked: e.target.checked })}
            />
            <span>Estoque reposto</span>
          </label>

          <button className="btn" onClick={() => exportDayCSV(items, day)}>
            Exportar CSV
          </button>

          <button className="btn" onClick={() => exportDayXLSX(items, day)}>
            Exportar Excel
          </button>

          {!day.closed ? (
            <button className="btn btn-primary" onClick={() => closeDay(date)}>
              Fechar dia
            </button>
          ) : (
            <button className="btn btn-dark" onClick={() => reopenDay(date)}>
              Reabrir
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-section">
        <div className="kpi-card kpi-stock">
          <StatCard label="Total em Estoque" value={t.initial} />
        </div>

        <div className="kpi-card kpi-sold">
          <StatCard label="Total Vendidos" value={t.sold} />
        </div>

        <div className="kpi-card kpi-revenue">
          <StatCard
            label="Receita Bruta"
            value={revenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-title">Movimentação do dia</div>
            <div className="section-subtitle">Preencha estoque inicial e vendas para calcular restantes</div>
          </div>
        </div>

        <InventoryTable
          items={items}
          day={day}
          locked={locked}
          onChangeStock={(id, qty) => updateDayQty(date, "stock", id, qty)}
          onChangeSold={(id, qty) => updateDayQty(date, "sold", id, qty)}
        />
      </div>

      {/* AVISO */}
      {locked && (
        <div className="notice">
          <b>Dia fechado:</b> edição travada. Use <b>Reabrir</b> se precisar corrigir.
        </div>
      )}
    </div>
  );
}
