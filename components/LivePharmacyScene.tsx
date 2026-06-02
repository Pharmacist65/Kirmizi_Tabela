import { ClipboardList, PackageCheck, UserRound, UsersRound } from "lucide-react";
import { roleLabels, staffTasks } from "@/data/staff";
import { shelfFocusLabels } from "@/game/engine";
import type { DayPhase, GameState } from "@/game/types";

type LivePharmacySceneProps = {
  state: GameState;
};

function stockCells(stock: number, capacity: number) {
  const filled = Math.round((stock / capacity) * 9);
  return Array.from({ length: 9 }, (_, index) => index < filled);
}

function taskLabel(taskId?: string) {
  if (!taskId) return "Beklemede";
  return staffTasks.find((task) => task.id === taskId)?.title ?? "Görevde";
}

const phaseLabels: Record<DayPhase, string> = {
  morning: "Sabah hazırlığı",
  open: "Açık eczane",
  closing: "Gün sonu"
};

function taskZone(taskId?: string) {
  if (!taskId) return "idle";
  if (taskId.includes("sgk") || taskId.includes("rx")) return "sgk";
  if (taskId.includes("stock")) return "stock";
  if (taskId.includes("dermo")) return "dermo";
  if (taskId.includes("counter") || taskId.includes("patient")) return "counter";
  return "idle";
}

export function LivePharmacyScene({ state }: LivePharmacySceneProps) {
  const report = state.lastDayReport;
  const queueSize = state.setupCompleted
    ? Math.min(8, Math.max(2, Math.round(state.traffic / 18) + Math.floor((report?.missedUnits ?? 0) / 5)))
    : 0;
  const soldToday = report?.soldUnits ?? 0;
  const missedToday = report?.missedUnits ?? 0;
  const footfall = Math.min(5, Math.max(2, Math.round(state.traffic / 24)));
  const mood = state.satisfaction < 45 ? "Baskılı" : state.satisfaction > 74 ? "Rahat" : "Yoğun";

  return (
    <section className="live-pharmacy-scene">
      <div className="scene-topline">
        <div>
          <h2>Canlı Eczane</h2>
          <p>{shelfFocusLabels[state.shelfFocus]} · satışlar raf, stok ve personel kararlarından doğar.</p>
        </div>
        <div className="scene-pills">
          <span>{state.timeLabel} · {phaseLabels[state.dayPhase]}</span>
          <span>{mood} akış</span>
          <span><PackageCheck size={15} /> Satılan {soldToday}</span>
          <span><UsersRound size={15} /> Kaçan {missedToday}</span>
        </div>
      </div>

      <div className="pharmacy-stage">
        <div className="storefront-band">
          <div className="red-strip" />
          <div className="storefront-center">
            <div className="front-blank-sign">ECZANE</div>
            <div className="mini-blade-sign">
              <div className="mini-neon-e">E</div>
            </div>
          </div>
          <div className="red-strip" />
        </div>

        <div className="stage-grid">
          <div className="shelf-wall">
            {state.inventory.slice(0, 6).map((item) => (
              <div className={`visual-shelf ${item.kind} ${item.stock / item.capacity < 0.22 ? "low" : ""}`} key={item.id}>
                <strong>{item.name}</strong>
                <div className="shelf-products">
                  {stockCells(item.stock, item.capacity).map((filled, index) => (
                    <i className={filled ? "filled" : ""} key={`${item.id}-${index}`} />
                  ))}
                </div>
                <span>{item.stock}/{item.capacity}</span>
              </div>
            ))}
          </div>

          <div className="counter-area">
            <div className="service-counter-live">
              <ClipboardList size={24} aria-hidden="true" />
              <strong>Banko</strong>
            </div>
            <div className="customer-queue">
              {queueSize ? (
                Array.from({ length: queueSize }, (_, index) => (
                  <span className={index >= queueSize - Math.min(2, missedToday) ? "impatient" : ""} key={index}>
                    <UserRound size={18} />
                  </span>
                ))
              ) : (
                <em>Kurulum bekleniyor</em>
              )}
            </div>
            <div className="customer-stream" aria-hidden="true">
              {state.setupCompleted &&
                Array.from({ length: footfall }, (_, index) => (
                  <span key={index} style={{ animationDelay: `${index * 620}ms` }}>
                    <UserRound size={15} />
                  </span>
                ))}
            </div>
          </div>

          <div className="staff-zones">
            {state.staff.slice(0, 4).map((person) => (
              <div className={`staff-token ${taskZone(person.assignedTaskId)}`} key={person.id}>
                <b>{person.name.slice(0, 1)}</b>
                <span>{roleLabels[person.role]}</span>
                <small>{taskLabel(person.assignedTaskId)}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
