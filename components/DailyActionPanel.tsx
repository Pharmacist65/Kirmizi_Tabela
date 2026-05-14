import { Clock3, ListChecks } from "lucide-react";
import { dailyActions } from "@/data/dailyActions";
import { formatMoney } from "@/game/engine";
import type { DailyActionId, DailyActionPhase, GameState } from "@/game/types";

type DailyActionPanelProps = {
  state: GameState;
  locked: boolean;
  onAction: (actionId: DailyActionId) => void;
};

const phaseLabels: Record<DailyActionPhase, string> = {
  morning: "08:30-09:30 Sabah hazırlığı",
  open: "09:30-18:30 Açık eczane",
  closing: "18:30-19:00 Gün sonu"
};

const riskLabels = {
  low: "Düşük risk",
  medium: "Orta risk",
  high: "Yüksek risk"
};

export function DailyActionPanel({ state, locked, onAction }: DailyActionPanelProps) {
  return (
    <section className="daily-action-panel">
      <div className="panel-header">
        <div>
          <h3>Günlük Aksiyon Listesi</h3>
          <div className="panel-note">
            {locked ? "Açılış tamamlanmadan günlük aksiyonlar kilitli." : `${state.timeLabel} · ${phaseLabels[state.dayPhase]}`}
          </div>
        </div>
        <Clock3 size={19} aria-hidden="true" />
      </div>
      {(["morning", "open", "closing"] as DailyActionPhase[]).map((phase) => (
        <div className="daily-phase-block" key={phase}>
          <div className="daily-phase-title">
            <ListChecks size={16} aria-hidden="true" />
            <strong>{phaseLabels[phase]}</strong>
          </div>
          <div className="daily-action-list">
            {dailyActions
              .filter((action) => action.phase === phase)
              .map((action) => (
                <button disabled={locked} key={action.id} onClick={() => onAction(action.id)}>
                  <span>
                    <strong>{action.title}</strong>
                    <small>{action.description}</small>
                    <em>
                      {action.durationMinutes} dk · {action.cost ? formatMoney(action.cost) : "Masrafsız"} · {riskLabels[action.risk]}
                    </em>
                  </span>
                  <b>{action.expectedEffect}</b>
                </button>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
