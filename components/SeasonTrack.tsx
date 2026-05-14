import { CalendarDays, Goal } from "lucide-react";
import { evaluateScenario, formatMoney } from "@/game/engine";
import type { GameState } from "@/game/types";

type SeasonTrackProps = {
  state: GameState;
};

export function SeasonTrack({ state }: SeasonTrackProps) {
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const evaluation = evaluateScenario(state);

  return (
    <section className="season-track">
      <div className="panel-header">
        <div>
          <h3>12 Aylık Serüven</h3>
          <div className="panel-note">Ay {state.month} devam ediyor</div>
        </div>
        <CalendarDays size={19} aria-hidden="true" />
      </div>
      <div className="month-line">
        {months.map((month) => (
          <span className={month === state.month ? "active" : month < state.month ? "done" : ""} key={month}>
            {month}
          </span>
        ))}
      </div>
      <div className="goal-grid">
        <div>
          <Goal size={17} aria-hidden="true" />
          <span>Başarı puanı</span>
          <strong>{Math.round(evaluation.checks.at(-1)?.current ?? 0)}/100</strong>
        </div>
        <div>
          <span>Hedef kasa</span>
          <strong>{formatMoney(250000)}</strong>
        </div>
        <div>
          <span>Mevcut kasa</span>
          <strong>{formatMoney(state.cash)}</strong>
        </div>
      </div>
    </section>
  );
}
