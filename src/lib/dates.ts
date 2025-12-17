export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekdayPT(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  const map = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  return map[d.getDay()];
}

export function getWeekDates(baseISO: string) {
  const base = new Date(baseISO + "T00:00:00");
  const dow = base.getDay(); // 0=dom
  const start = new Date(base);
  start.setDate(base.getDate() - dow); // domingo

  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out; // domingo..sábado
}
