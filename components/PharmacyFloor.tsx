import { Boxes, ClipboardList, UsersRound } from "lucide-react";
import { shelfFocusLabels } from "@/game/engine";
import type { GameState } from "@/game/types";

type PharmacyFloorProps = {
  state: GameState;
};

export function PharmacyFloor({ state }: PharmacyFloorProps) {
  const queueCount = Math.max(2, Math.min(5, Math.round((100 - state.satisfaction) / 13)));
  const staffCount = Math.max(2, Math.min(4, Math.round(state.staffMorale / 24)));
  const shelfZones = [
    { id: "prescription", label: "Reçete", value: Math.round(state.stockHealth), tone: "green" },
    { id: "otc", label: "OTC", value: Math.round(state.otcPotential), tone: "amber" },
    { id: "dermo", label: "Dermo", value: Math.round(state.dermoPotential), tone: "red" }
  ];

  return (
    <section className="scene-panel">
      <div className="panel-header">
        <div>
          <h3>Canlı Eczane</h3>
          <div className="panel-note">Aktif düzen: {shelfFocusLabels[state.shelfFocus]}</div>
        </div>
        <div className="event-meta">Ay {state.month} / Gün {state.currentDay}</div>
      </div>
      <div className="pharmacy-floor">
        <div className="shopfront">
          <div className="sign-board">KIRMIZI TABELA ECZANESİ</div>
          <div className="glass-door">
            <span>Açık</span>
          </div>
          <div className="window-display">
            <span>Dermo</span>
            <span>OTC</span>
            <span>Destek</span>
          </div>
        </div>

        <div className="floor-zone prescription-zone">
          <div className="zone-title">
            <span>Reçete & Banko</span>
            <ClipboardList size={18} aria-hidden="true" />
          </div>
          <div className={`service-counter ${state.shelfFocus === "flow" ? "focused" : ""}`}>
            <div className="counter-line" />
            <div className="counter-person pharmacist">E</div>
            {Array.from({ length: staffCount }).map((_, index) => (
              <div className="staff" key={index}>P</div>
            ))}
            <div className="cash-register">₺</div>
          </div>
          <div className="traffic-lane">
            <span>Danışma</span>
            <span>Reçete</span>
            <span>Kasa</span>
          </div>
          <div className="zone-title">
            <span>Bekleyen Müşteri</span>
            <UsersRound size={18} aria-hidden="true" />
          </div>
          <div className="queue-row">
            {Array.from({ length: queueCount }).map((_, index) => (
              <div className={`customer customer-${index + 1}`} key={index}>M</div>
            ))}
          </div>
          <div className="pulse">
            <strong>{state.lastReport}</strong>
            <span>Kırmızı Tabela bugün de nakit, güven ve enerji dengesinde ayakta kalmaya çalışıyor.</span>
          </div>
        </div>

        <div className="floor-zone shelves-zone">
          <div className="zone-title">
            <span>Raf & Stok Alanı</span>
            <Boxes size={18} aria-hidden="true" />
          </div>
          <div className="shelf-row enhanced">
            {shelfZones.map((zone) => (
              <div
                className={`shelf shelf-${zone.tone} ${state.shelfFocus === zone.id ? "active" : ""}`}
                title={`${zone.label} rafı`}
                key={zone.id}
              >
                <div className="shelf-label">{zone.label}</div>
                <div className="mini-products">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <i key={index} />
                  ))}
                </div>
                <span>{zone.value}/100</span>
              </div>
            ))}
          </div>
          <div className={`cold-chain ${state.shelfFocus === "prescription" ? "active" : ""}`}>
            <span>Soğuk Zincir</span>
            <strong>{state.shelfFocus === "prescription" ? "Öncelikli" : "Normal"}</strong>
          </div>
          <div className="pulse">
            <strong>Stok sağlığı {Math.round(state.stockHealth)}/100</strong>
            <span>
              Düşük stok hasta memnuniyetini, fazla stok kasa akışını zorlar. İlk demo bu gerilimin üstüne kuruldu.
            </span>
          </div>
          <div className="pulse">
            <strong>Uyum riski {Math.round(state.complianceRisk)}/100</strong>
            <span>Gerçek tıbbi işlem değil; oyunda evrak, dikkat ve süreç kalitesi olarak soyutlandı.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
