import { AlertTriangle, CheckCircle2, CircleDot, XCircle } from "lucide-react";
import { evaluateScenario, formatMoney } from "@/game/engine";
import type { GameState } from "@/game/types";

type ScenarioStatusProps = {
  state: GameState;
};

const statusIcon = {
  playing: CircleDot,
  warning: AlertTriangle,
  won: CheckCircle2,
  lost: XCircle
};

export function ScenarioStatus({ state }: ScenarioStatusProps) {
  const evaluation = evaluateScenario(state);
  const Icon = statusIcon[evaluation.status];

  return (
    <section className={`scenario-status ${evaluation.status}`}>
      <div className="panel-header">
        <div>
          <h3>{evaluation.title}</h3>
          <div className="panel-note">{evaluation.message}</div>
        </div>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="goal-checks">
        {evaluation.checks.map((check) => {
          const current = check.kind === "money" ? formatMoney(check.current) : Math.round(check.current).toString();
          const target = check.kind === "money" ? formatMoney(check.target) : Math.round(check.target).toString();
          return (
            <div className={check.met ? "met" : "miss"} key={check.label}>
              <span>{check.label}</span>
              <strong>{current}</strong>
              <small>
                {check.inverse ? "hedef üst sınır " : "hedef "}
                {target}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
