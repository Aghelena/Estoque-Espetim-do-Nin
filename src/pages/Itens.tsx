import { useEffect, useMemo, useState } from "react";
import { addItem, getDB, updateItem } from "../app/store";

export default function Itens() {
  const [tick, setTick] = useState(0);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<"espeto" | "bebida" | "outros">("espeto");
  const [price, setPrice] = useState<number>(10);

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    window.addEventListener("db:update", fn);
    return () => window.removeEventListener("db:update", fn);
  }, []);

  const db = getDB();
  const items = useMemo(
    () => [...db.items].sort((a, b) => a.name.localeCompare(b.name)),
    [tick]
  );

  function handleAdd() {
    if (!name.trim()) return;
    addItem({
      name: name.trim(),
      category,
      price: Math.max(0, Number(price) || 0),
      active: true,
    });
    setName("");
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="h1">Itens</h1>
          <p className="p">Cadastre produtos e preços para usar no estoque</p>
        </div>

        <div className="toolbar">
          <div className="chip-soft">
            Total cadastrados: <b className="mono">{items.length}</b>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-title">Novo item</div>
            <div className="section-subtitle">Nome • categoria • preço</div>
          </div>
        </div>

        <div className="form-grid">
          <input
            className="input"
            placeholder="Nome do item (ex: Queijo, Chopp...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value as "espeto" | "bebida" | "outros")}
          >
            <option value="espeto">Espeto</option>
            <option value="bebida">Bebida</option>
            <option value="outros">Outros</option>
          </select>

          <input
            className="input mono"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <button className="btn btn-primary" onClick={handleAdd}>
            Adicionar item
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-title">Lista de itens</div>
            <div className="section-subtitle">Edite preço e ative/desative</div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço (R$)</th>
                <th>Ativo</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={{ fontWeight: 900 }}>{it.name}</td>
                  <td>{it.category}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      className="input-sm mono"
                      value={it.price}
                      onChange={(e) =>
                        updateItem(it.id, { price: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </td>
                  <td>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={it.active}
                        onChange={(e) => updateItem(it.id, { active: e.target.checked })}
                      />
                      <span className="toggle-ui" />
                      <span className="toggle-text">{it.active ? "Ativo" : "Inativo"}</span>
                    </label>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)", padding: 18 }}>
                    Nenhum item cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
