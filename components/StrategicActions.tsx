import { strategicActions } from "@/data/actions";
import { effectLabels, formatMoney, moneyEffectKeys } from "@/game/engine";
import type { GameState, StrategicActionId } from "@/game/types";

type StrategicActionsProps = {
  state: GameState;
  onChoose: (actionId: StrategicActionId) => void;
};

export function StrategicActions({ state, onChoose }: StrategicActionsProps) {
  return (
    <section className="strategy-panel">
      <div className="panel-header compact">
        <div>
          <h3>Bugünkü Hamle</h3>
          <div className="panel-note">Her gün bir ana yönetim hamlesi seç.</div>
        </div>
      </div>
      <div className="action-list">
        {strategicActions.map((action) => {
          const active = state.dailyActionId === action.id;
          return (
            <button
              className={`action-button ${active ? "active" : ""}`}
              key={action.id}
              onClick={() => onChoose(action.id)}
            >
              <span>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
                <em>{action.bestFor}</em>
              </span>
              <small>
                {Object.entries(action.effects)
                  .map(([key, value]) => {
                    const label = effectLabels[key as keyof typeof effectLabels];
                    const formatted = moneyEffectKeys.has(key)
                      ? formatMoney(Number(value))
                      : `${Number(value) > 0 ? "+" : ""}${value}`;
                    return `${label} ${formatted}`;
                  })
                  .join(" · ") || "Ek etki yok"}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
