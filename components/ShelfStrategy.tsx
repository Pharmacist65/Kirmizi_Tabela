import { ClipboardList, LayoutGrid, PackageCheck, ShoppingBag, Sparkles } from "lucide-react";
import { shelfFocusLabels } from "@/game/engine";
import type { GameState, ShelfFocus } from "@/game/types";

type ShelfStrategyProps = {
  state: GameState;
  onChange: (focus: ShelfFocus) => void;
};

const options: Array<{
  focus: ShelfFocus;
  icon: typeof LayoutGrid;
  detail: string;
}> = [
  {
    focus: "balanced",
    icon: LayoutGrid,
    detail: "Her kategori dengede; sürprizlere karşı daha güvenli."
  },
  {
    focus: "prescription",
    icon: ClipboardList,
    detail: "Reçete akışı hızlanır, SGK alacağı artabilir."
  },
  {
    focus: "dermo",
    icon: Sparkles,
    detail: "Peşin kasa ve marj güçlenir, stok baskısı artar."
  },
  {
    focus: "otc",
    icon: ShoppingBag,
    detail: "Hızlı satış rafları peşin nakdi destekler."
  },
  {
    focus: "flow",
    icon: PackageCheck,
    detail: "Banko akışı rahatlar, enerji ve memnuniyet toparlanır."
  }
];

export function ShelfStrategy({ state, onChange }: ShelfStrategyProps) {
  return (
    <section className="strategy-panel">
      <div className="panel-header compact">
        <div>
          <h3>Eczane Düzeni</h3>
          <div className="panel-note">Raf ve banko odağı günlük algoritmaya yansır.</div>
        </div>
      </div>
      <div className="strategy-list">
        {options.map((option) => {
          const Icon = option.icon;
          const active = state.shelfFocus === option.focus;
          return (
            <button
              className={`strategy-button ${active ? "active" : ""}`}
              key={option.focus}
              onClick={() => onChange(option.focus)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>
                <strong>{shelfFocusLabels[option.focus]}</strong>
                <span>{option.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
