import { Activity, CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/game/engine";
import type { TurnOutcome } from "@/game/types";

type OutcomePanelProps = {
  outcome: TurnOutcome | null;
};

export function OutcomePanel({ outcome }: OutcomePanelProps) {
  if (!outcome) {
    return (
      <section className="outcome-panel empty">
        <div className="event-meta">
          <span>NASIL OYNANIR</span>
          <Activity size={18} aria-hidden="true" />
        </div>
        <h3>Bugünün sırası</h3>
        <ol>
          <li>Eczane düzenini seç.</li>
          <li>Günün karar kartındaki seçeneklerden birini uygula.</li>
          <li>Ne olduğunu bu panelde gör, sonra yeni güne geç.</li>
        </ol>
      </section>
    );
  }

  return (
    <section className="outcome-panel">
      <div className="event-meta">
        <span>NE OLDU?</span>
        <CheckCircle2 size={18} aria-hidden="true" />
      </div>
      <h3>{outcome.eventTitle}</h3>
      <p>
        Günlük hamle: <strong>{outcome.actionTitle}</strong>. Karar: <strong>{outcome.choiceLabel}</strong>.
        {" "}
        {outcome.surpriseTitle}: {outcome.surpriseDescription}
      </p>
      <div className="delta-list">
        {outcome.deltas.map((delta) => {
          const positive = delta.delta > 0;
          const display =
            delta.kind === "money"
              ? `${positive ? "+" : ""}${formatMoney(delta.delta)}`
              : `${positive ? "+" : ""}${Math.round(delta.delta)}`;
          return (
            <div className={positive ? "up" : "down"} key={delta.key}>
              <span>{delta.label}</span>
              <strong>{display}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
