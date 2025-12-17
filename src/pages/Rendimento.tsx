import { useEffect, useMemo, useState } from "react";
import { ensureDay, getDB } from "../app/store";
import { DayPicker } from "../components/DayPicker";
import { exportWeekXLSX } from "../lib/export";
import { getWeekDates, weekdayPT, todayISO } from "../lib/dates";
import { grossRevenue, totalUnits, topSoldItem } from "../lib/calc";

export default function Rendimento() {
  const [tick, setTick] = useState(0);
  const [baseDate, setBaseDate] = useState(todayISO());

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    window.addEventListener("db:update", fn);
    return () => window.removeEventListener("db:update", fn);
  }, []);

  const db = getDB();
  const items = db.items;

  const dates = useMemo(() => getWeekDates(baseDate), [baseDate]); // domingo..sábado

  // segunda..domingo
  const mondayToSunday = useMemo(() => {
    const sunday = dates[0];
    const monToSat = dates.slice(1);
    return [...monToSat, sunday];
  }, [dates]);

  const rows = mondayToSunday.map((date) => {
    const day = ensureDay(date);
    const top = topSoldItem(items, day, "espeto");
    const units = totalUnits(day);
    const revenue = grossRevenue(items, day);
    return { date, day, top, units, revenue };
  });

  const totalRevenue = rows.reduce((a, r) => a + r.revenue, 0);
  const totalUnitsWeek = rows.reduce((a, r) => a + r.units, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="h1">Rendimento (Semana)</h1>
          <p className="p">Selecione uma data para definir a semana</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-item">
            <span className="toolbar-label">Semana de</span>
            <DayPicker value={baseDate} onChange={setBaseDate} />
          </div>

          <button className="btn" onClick={() => exportWeekXLSX(db, baseDate)}>
            Exportar Excel da semana
          </button>

          <div className="chip-soft">
            Total: <b className="mono">{totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
          </div>
        </div>
      </div>

      <div className="kpi-section">
        <div className="kpi-card kpi-stock">
          <div className="kpi-mini">
            <div className="kpi-mini-label">Unidades na semana</div>
            <div className="kpi-mini-value mono">{totalUnitsWeek}</div>
          </div>
        </div>

        <div className="kpi-card kpi-sold">
          <div className="kpi-mini">
            <div className="kpi-mini-label">Dias fechados</div>
            <div className="kpi-mini-value mono">
              {rows.filter(r => r.day.closed).length}
            </div>
          </div>
        </div>

        <div className="kpi-card kpi-revenue">
          <div className="kpi-mini">
            <div className="kpi-mini-label">Receita total</div>
            <div className="kpi-mini-value mono">
              {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-title">Resumo por dia</div>
            <div className="section-subtitle">Mais vendido • unidades • receita</div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Data</th>
                <th>Mais vendido (Espeto)</th>
                <th>Unidades</th>
                <th>Receita</th>
                <th>Reposto</th>
                <th>Fechado</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <td style={{ fontWeight: 900 }}>{weekdayPT(r.date)}</td>
                  <td className="mono">{r.date}</td>
                  <td>{r.top ? `${r.top.item.name} (${r.top.qty})` : "-"}</td>
                  <td className="mono">{r.units}</td>
                  <td className="mono">{r.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{r.day.restocked ? "✅" : "—"}</td>
                  <td>{r.day.closed ? "✅" : "—"}</td>
                </tr>
              ))}

              <tr style={{ background: "#f8fafc" }}>
                <td colSpan={3} style={{ fontWeight: 950 }}>TOTAL</td>
                <td className="mono" style={{ fontWeight: 950 }}>{totalUnitsWeek}</td>
                <td className="mono" style={{ fontWeight: 950 }}>
                  {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
