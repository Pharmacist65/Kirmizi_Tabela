import { ClipboardCheck, CreditCard, FileStack, Truck } from "lucide-react";
import {
  paymentChannels,
  prescriptionGroups,
  sgkCalendarRules,
  supplierTermPatterns
} from "@/data/pharmacySystems";
import { formatMoney } from "@/game/engine";
import type { GameState } from "@/game/types";

type OperationsBoardProps = {
  state: GameState;
};

function getMonthDay(state: GameState) {
  return ((state.currentDay - 1) % 30) + 1;
}

function getActiveSgkPhase(day: number) {
  if (day <= 7) return sgkCalendarRules[0];
  if (day <= 15) return sgkCalendarRules[1];
  if (day === 16) return sgkCalendarRules[2];
  return sgkCalendarRules[3];
}

export function OperationsBoard({ state }: OperationsBoardProps) {
  const day = getMonthDay(state);
  const phase = getActiveSgkPhase(day);
  const termHint = supplierTermPatterns[state.month % supplierTermPatterns.length];

  return (
    <section className="operations-board">
      <div className="panel-header">
        <div>
          <h3>Operasyon Masası</h3>
          <div className="panel-note">Ayın {day}. günü: {phase.title}</div>
        </div>
        <ClipboardCheck size={19} aria-hidden="true" />
      </div>

      <div className="operations-grid">
        <div className="operation-block sgk">
          <div className="operation-title">
            <FileStack size={17} aria-hidden="true" />
            <strong>SGK Döngüsü</strong>
          </div>
          <p>{phase.description}</p>
          <small>{phase.gameRisk}</small>
          <div className="mini-ledger">
            <span>SGK alacağı</span>
            <strong>{formatMoney(state.sgkReceivable)}</strong>
          </div>
        </div>

        <div className="operation-block">
          <div className="operation-title">
            <CreditCard size={17} aria-hidden="true" />
            <strong>Ödeme Kanalları</strong>
          </div>
          <div className="channel-list">
            {paymentChannels.map((channel) => (
              <span key={channel.id}>{channel.name}</span>
            ))}
          </div>
          <div className="mini-ledger">
            <span>POS oranı</span>
            <strong>%{state.posCommissionRate.toFixed(2)}</strong>
          </div>
          <div className="mini-ledger">
            <span>Özel sigorta alacağı</span>
            <strong>{formatMoney(state.privateInsuranceReceivable)}</strong>
          </div>
        </div>

        <div className="operation-block">
          <div className="operation-title">
            <Truck size={17} aria-hidden="true" />
            <strong>Depo Vadesi</strong>
          </div>
          <p>{termHint}</p>
          <small>Ciro ve depo güveni arttıkça vade pazarlığı güçlenir.</small>
          <div className="mini-ledger">
            <span>Depo güveni</span>
            <strong>{Math.round(state.supplierTrust)}/100</strong>
          </div>
        </div>
      </div>

      <div className="rx-strip">
        {prescriptionGroups.map((group) => (
          <div key={group.id}>
            <span>{group.name}</span>
            <strong>{group.risk}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
