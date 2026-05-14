import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, LockKeyhole, Play } from "lucide-react";
import {
  applyTaskCompletion,
  createActionResult,
  effectLabels,
  formatMoney,
  moneyEffectKeys,
  refreshTimedTasks,
  startTimedTask
} from "@/game/engine";
import type { ActionResult, GameState, TimedTask } from "@/game/types";

type OpeningTasksProps = {
  state: GameState;
  setState: (state: GameState) => void;
  tasks: TimedTask[];
  setTasks: (tasks: TimedTask[]) => void;
  setActionResult?: (result: ActionResult) => void;
};

function formatTaskEffects(task: TimedTask) {
  return Object.entries(task.effects)
    .map(([key, value]) => {
      const label = effectLabels[key as keyof typeof effectLabels];
      const formatted = moneyEffectKeys.has(key)
        ? formatMoney(Number(value))
        : `${Number(value) > 0 ? "+" : ""}${value}`;
      return `${label} ${formatted}`;
    })
    .join(" · ");
}

function remainingSeconds(task: TimedTask, now = Date.now()) {
  if (!task.startedAt || task.status !== "running") return task.demoDurationSeconds;
  return Math.max(0, Math.ceil(task.demoDurationSeconds - (now - task.startedAt) / 1000));
}

export function OpeningTasks({ state, setState, tasks, setTasks, setActionResult }: OpeningTasksProps) {
  const [now, setNow] = useState(() => Date.now());
  const refreshed = useMemo(() => refreshTimedTasks(tasks, now), [now, tasks]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (JSON.stringify(refreshed) !== JSON.stringify(tasks)) {
      setTasks(refreshed);
    }
  }, [refreshed, setTasks, tasks]);

  const handleStart = (taskId: string) => {
    setTasks(startTimedTask(tasks, taskId));
  };

  const handleCollect = (task: TimedTask) => {
    if (remainingSeconds(task, now) > 0) return;
    const next = applyTaskCompletion(state, task);
    setState(next);
    setActionResult?.(
      createActionResult(state, next, "Açılış görevi tamamlandı", `${task.title} tamamlandı. Ödüller ve etkiler işlendi.`)
    );
    const completed = tasks.map((item) =>
      item.id === task.id ? { ...item, status: "done" as const, completedAt: Date.now() } : item
    );
    setTasks(refreshTimedTasks(completed));
  };

  return (
    <section className="opening-tasks">
      <div className="panel-header">
        <div>
          <h3>Açılış Görevleri</h3>
          <div className="panel-note">Gerçek oyunda saatler sürebilir; demo için hızlandırıldı.</div>
        </div>
        <Clock3 size={19} aria-hidden="true" />
      </div>
      <div className="task-list">
        {tasks.map((task) => {
          const isDone = task.status === "done";
          const isRunning = task.status === "running";
          const isLocked = task.status === "locked";
          const remaining = remainingSeconds(task, now);
          const canComplete = isRunning && remaining === 0;
          return (
            <article className={`task-card ${task.status}`} key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <small>
                  Oyun süresi: {task.durationMinutes} dk · Demo: {task.demoDurationSeconds} sn
                </small>
                <em>{formatTaskEffects(task)}</em>
              </div>
              <button
                className="task-button"
                disabled={isLocked || isDone || (isRunning && !canComplete)}
                onClick={() => (isRunning ? handleCollect(task) : handleStart(task.id))}
              >
                {isLocked ? (
                  <>
                    <LockKeyhole size={16} /> Kilitli
                  </>
                ) : isDone ? (
                  <>
                    <CheckCircle2 size={16} /> Bitti
                  </>
                ) : isRunning ? (
                  <>
                    <CheckCircle2 size={16} /> {canComplete ? "Tamamla" : `${remaining} sn`}
                  </>
                ) : (
                  <>
                    <Play size={16} /> Başlat
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
