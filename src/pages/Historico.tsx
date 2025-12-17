import { useEffect, useMemo, useState } from "react";
import { ensureDay, getDB } from "../app/store";
import { DayPicker } from "../components/DayPicker";
import { StatCard } from "../components/StatCard";
import { grossRevenue, totals, topSoldItem } from "../lib/calc";
import { exportDayCSV, exportDayXLSX } from "../lib/export";
import { weekdayPT } from "../lib/dates";

export default function Historico() {
  const [tick, setTick] = useState(0);
  const [date, setDate] = useState(() => {
    const keys = Object.keys(getDB().days).sort();
    return keys.at(-1) ?? new Date().toISOString().slice(0, 10);
  });

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
  const top = useMemo(() => topSoldItem(items, day, "espeto"), [tick, date]);

  const savedDates = useMemo(() => Object.keys(db.days).sort().reverse(), [tick]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="h1">Histórico</h1>
          <p className="p">{weekdayPT(date)} • {date}</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-item">
            <span className="toolbar-label">Data</span>
            <DayPicker value={date} onChange={setDate} />
          </div>

          <button className="btn" onClick={() => exportDayCSV(items, day)}>
            Exportar CSV
          </button>

          <button className="btn" onClick={() => exportDayXLSX(items, day)}>
            Exportar Excel
          </button>

          <div className="chip-soft">
            Status: <b>{day.closed ? "Fechado" : "Aberto"}</b>
          </div>
        </div>
      </div>

      {/* KPIs no mesmo estilo */}
      <div className="kpi-section">
        <div className="kpi-card kpi-stock">
          <StatCard label="Estoque Inicial" value={t.initial} />
        </div>

        <div className="kpi-card kpi-sold">
          <StatCard label="Vendidos" value={t.sold} />
        </div>

        <div className="kpi-card kpi-revenue">
          <StatCard
            label="Receita Bruta"
            value={revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          />
        </div>
      </div>

      <div className="grid-2">
        {/* Datas salvas */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="section-title">Datas registradas</div>
              <div className="section-subtitle">Clique para abrir o dia</div>
            </div>
            <div className="chip-soft">{savedDates.length} dias</div>
          </div>

          <div className="list">
            {savedDates.length === 0 ? (
              <div className="empty">Nenhum registro ainda.</div>
            ) : (
              savedDates.map((d) => (
                <button
                  key={d}
                  className={`list-item ${d === date ? "list-item-active" : ""}`}
                  onClick={() => setDate(d)}
                >
                  <div className="list-main">
                    <div className="list-title">{weekdayPT(d)} • {d}</div>
                    <div className="list-sub">{db.days[d]?.closed ? "Fechado" : "Aberto"}</div>
                  </div>
                  <span className="list-arrow">›</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="section-title">Resumo do dia</div>
              <div className="section-subtitle">Indicadores rápidos</div>
            </div>
          </div>

          <div className="summary">
            <div className="summary-row">
              <span>Restantes estimados</span>
              <b className="mono">{t.rest}</b>
            </div>
            <div className="summary-row">
              <span>Mais vendido (espeto)</span>
              <b>{top ? `${top.item.name} (${top.qty})` : "-"}</b>
            </div>
            <div className="summary-row">
              <span>Estoque reposto</span>
              <b>{day.restocked ? "Sim" : "Não"}</b>
            </div>
            <div className="summary-row">
              <span>Fechado em</span>
              <b>{day.closedAt ? new Date(day.closedAt).toLocaleString("pt-BR") : "-"}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
