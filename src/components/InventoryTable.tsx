import type { DayRecord, Item } from "../app/store";
import { remaining } from "../lib/calc";

function remainingBadgeClass(rest: number) {
  if (rest === 0) return "badge badge-danger";
  if (rest <= 5) return "badge badge-warning";
  return "badge badge-success";
}

export function InventoryTable({
  items,
  day,
  locked,
  onChangeStock,
  onChangeSold,
}: {
  items: Item[];
  day: DayRecord;
  locked: boolean;
  onChangeStock: (itemId: string, qty: number) => void;
  onChangeSold: (itemId: string, qty: number) => void;
}) {
  const active = items.filter((i) => i.active);

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Estoque</th>
            <th>Vendidos</th>
            <th>Restantes</th>
          </tr>
        </thead>

        <tbody>
          {active.map((it) => {
            const rest = remaining(day, it.id);
            return (
              <tr key={it.id}>
                <td style={{ fontWeight: 900 }}>{it.name}</td>

                <td>
                  <input
                    type="number"
                    min={0}
                    disabled={locked}
                    className="input-sm mono"
                    value={day.stockInitialByItem[it.id] ?? 0}
                    onChange={(e) => onChangeStock(it.id, Number(e.target.value))}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    min={0}
                    disabled={locked}
                    className="input-sm mono"
                    value={day.soldByItem[it.id] ?? 0}
                    onChange={(e) => onChangeSold(it.id, Number(e.target.value))}
                  />
                </td>

                <td>
                  <span className={remainingBadgeClass(rest)}>{rest}</span>
                </td>
              </tr>
            );
          })}

          {active.length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: "var(--muted)", padding: 18 }}>
                Nenhum item ativo. Vá em “Itens” e cadastre/ative produtos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
