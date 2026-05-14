import { ArrowRight, Sparkles } from "lucide-react";
import { effectLabels, formatMoney, moneyEffectKeys } from "@/game/engine";
import type { EventTemplate } from "@/game/types";

type DecisionCardProps = {
  event: EventTemplate;
  onChoose: (choiceIndex: number) => void;
};

export function DecisionCard({ event, onChoose }: DecisionCardProps) {
  return (
    <aside className="event-panel">
      <div className="event-meta">
        <span>{event.category.toUpperCase()}</span>
        <Sparkles size={18} aria-hidden="true" />
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <div className="choice-list">
        {event.choices.map((choice, index) => (
          <button className="choice-button" key={choice.label} onClick={() => onChoose(index)}>
            <ArrowRight size={18} aria-hidden="true" />
            <span>
              <strong>{choice.label}</strong>
              <span>{choice.detail}</span>
              <em>
                {Object.entries(choice.effects)
                  .map(([key, value]) => {
                    const label = effectLabels[key as keyof typeof effectLabels];
                    const formatted = moneyEffectKeys.has(key)
                      ? formatMoney(Number(value))
                      : `${Number(value) > 0 ? "+" : ""}${value}`;
                    return `${label} ${formatted}`;
                  })
                  .join(" · ")}
              </em>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
