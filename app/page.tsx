"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  BatteryMedium,
  Boxes,
  ClipboardList,
  Landmark,
  MapPinned,
  Play,
  RotateCcw,
  ShieldAlert,
  Store,
  UsersRound,
  Truck,
  WalletCards
} from "lucide-react";
import { ActionResultPanel } from "@/components/ActionResultPanel";
import { GameModules, type ModuleId } from "@/components/GameModules";
import { DailyActionPanel } from "@/components/DailyActionPanel";
import { DayReportPanel } from "@/components/DayReportPanel";
import { FeedbackDock } from "@/components/FeedbackDock";
import { Leaderboard } from "@/components/Leaderboard";
import { LocationProfile } from "@/components/LocationProfile";
import { OpeningTasks } from "@/components/OpeningTasks";
import { PlayGuide } from "@/components/PlayGuide";
import { StartScreen } from "@/components/StartScreen";
import {
  advanceTradingDay,
  applyDailyAction,
  assignStaffTask,
  buyFromMarketplace,
  buyInventory,
  changeShelfFocus,
  createActionResult,
  createOpeningTasks,
  createInitialState,
  fireStaff,
  formatMoney,
  giveStaffRaise,
  hireStaff,
  paySupplierDebt,
  purchasePaymentLabels,
  runChamberApproval,
  runSgkControl,
  sellOnMarketplace
} from "@/game/engine";
import type { ActionDelta, ActionResult, DailyActionId, GameState, PurchasePayment, StartProfile, TimedTask } from "@/game/types";
import { isFirebaseConfigured } from "@/firebase/config";

const legacyStorageKey = "kirmizi-tabela-v4-state";
const storageKey = "kirmizi-tabela-v5-save";

const PharmacyWorld3D = dynamic(
  () => import("@/components/PharmacyWorld3D").then((module) => module.PharmacyWorld3D),
  {
    ssr: false,
    loading: () => (
      <section className="pharmacy-world is-loading">
        <div className="world-loader">
          <span>ECZANE</span>
          <strong>3D sahne hazırlanıyor</strong>
        </div>
      </section>
    )
  }
);

const moduleItems: { id: ModuleId; label: string }[] = [
  { id: "eczane", label: "Eczane" },
  { id: "depo", label: "Depo" },
  { id: "stok", label: "Raf/Stok" },
  { id: "sgk", label: "SGK" },
  { id: "personel", label: "Personel" },
  { id: "finans", label: "Finans" },
  { id: "pazar", label: "Pazar" }
];

type SavedGame = {
  version: 5;
  state: GameState;
  openingTasks: TimedTask[];
  hasGame: boolean;
};

function createSavePayload(state: GameState, openingTasks: TimedTask[], hasGame: boolean): SavedGame {
  return {
    version: 5,
    state,
    openingTasks,
    hasGame
  };
}

export default function Home() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [openingTasks, setOpeningTasks] = useState<TimedTask[]>(() => createOpeningTasks());
  const [activeModule, setActiveModule] = useState<ModuleId>("eczane");
  const [hasGame, setHasGame] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<SavedGame> | Partial<GameState>;
        const savedState = "state" in parsed && parsed.state ? parsed.state : (parsed as Partial<GameState>);
        const savedTasks = "openingTasks" in parsed ? parsed.openingTasks : null;
        const base = createInitialState(savedState.scenarioId);
        setState({ ...base, ...savedState, shelfFocus: savedState.shelfFocus ?? base.shelfFocus });
        setOpeningTasks(savedTasks?.length ? savedTasks : createOpeningTasks());
        setHasGame("hasGame" in parsed ? Boolean(parsed.hasGame) : true);
        window.localStorage.removeItem(legacyStorageKey);
      } catch {
        setState(createInitialState());
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && hasGame) {
      window.localStorage.setItem(storageKey, JSON.stringify(createSavePayload(state, openingTasks, hasGame)));
    }
  }, [hasGame, hydrated, openingTasks, state]);

  const resetGame = () => {
    const fresh = createInitialState(state.scenarioId, {
      pharmacistName: state.pharmacistName,
      pharmacyName: state.pharmacyName,
      city: state.city,
      district: state.district,
      locationType: state.locationType,
      startMode: state.startMode
    });
    const tasks = createOpeningTasks();
    setState(fresh);
    setOpeningTasks(tasks);
    setActionResult(null);
    window.localStorage.setItem(storageKey, JSON.stringify(createSavePayload(fresh, tasks, true)));
  };

  const startScenario = (scenarioId: string, profile: StartProfile) => {
    const fresh = createInitialState(scenarioId, profile);
    const tasks = createOpeningTasks();
    setState(fresh);
    setOpeningTasks(tasks);
    setActionResult(null);
    setHasGame(true);
    window.localStorage.setItem(storageKey, JSON.stringify(createSavePayload(fresh, tasks, true)));
  };

  const pickNewScenario = () => {
    setHasGame(false);
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(legacyStorageKey);
  };

  const performAction = (
    title: string,
    description: string,
    updater: (current: GameState) => GameState,
    extraDeltas?: (before: GameState, after: GameState) => ActionDelta[]
  ) => {
    setState((current) => {
      const next = updater(current);
      setActionResult(createActionResult(current, next, title, description, extraDeltas?.(current, next) ?? []));
      return next;
    });
  };

  const setupLocked = state.startMode === "new" && !state.setupCompleted;

  const blockIfSetupLocked = () => {
    if (!setupLocked) return false;
    setActionResult({
      title: "Açılış kilitli",
      description: "Sıfırdan açılışta önce kurulum görevlerini bitirmen gerekiyor. Satış, depo, SGK, POS ve pazar modülleri açılış gününden sonra açılır.",
      deltas: []
    });
    return true;
  };

  const buyStock = (categoryId: string, payment: PurchasePayment) => {
    if (blockIfSetupLocked()) return;
    const categoryName = state.inventory.find((item) => item.id === categoryId)?.name ?? "Stok";
    performAction(
      payment === "cash" ? "Peşin depo alımı" : `${purchasePaymentLabels[payment]} depo alımı`,
      payment === "cash"
        ? `${categoryName} rafa girdi. Peşin alım kasayı bugün düşürür ama iskonto ve depo güveni kazandırır.`
        : `${categoryName} rafa girdi. Vadeli alım bugün kasayı düşürmez; vade defterine yeni ödeme yazar.`,
      (current) => buyInventory(current, categoryId, 10, payment),
      (before, after) => {
        const beforeUnits = before.inventory.reduce((sum, item) => sum + item.stock, 0);
        const afterUnits = after.inventory.reduce((sum, item) => sum + item.stock, 0);
        return [{ label: "Toplam stok", before: beforeUnits, after: afterUnits, delta: afterUnits - beforeUnits, kind: "count" }];
      }
    );
  };

  const advanceDay = () => {
    if (blockIfSetupLocked()) return;
    performAction(
      "Gün ilerledi",
      "Raflardan satış oldu; nakit, SGK alacağı, özel sigorta alacağı, stok ve XP güncellendi.",
      advanceTradingDay,
      (before, after) => {
        const beforeUnits = before.inventory.reduce((sum, item) => sum + item.stock, 0);
        const afterUnits = after.inventory.reduce((sum, item) => sum + item.stock, 0);
        return [{ label: "Toplam stok", before: beforeUnits, after: afterUnits, delta: afterUnits - beforeUnits, kind: "count" }];
      }
    );
  };

  const assignTask = (personId: string, taskId: string) => {
    if (blockIfSetupLocked()) return;
    performAction("Personel görevi", "Görev kişinin becerisine göre iyi ya da kötü sonuç verdi.", (current) =>
      assignStaffTask(current, personId, taskId)
    );
  };

  const hire = (candidateId: string) => {
    if (blockIfSetupLocked()) return;
    performAction("Personel işe alındı", "Ekip büyüdü; maaş gideri artarken operasyon kapasitesi güçlendi.", (current) =>
      hireStaff(current, candidateId)
    );
  };

  const fire = (personId: string) => {
    if (blockIfSetupLocked()) return;
    performAction("Personel çıkarıldı", "Maaş gideri azalır ama moral ve hizmet akışı darbe alır.", (current) =>
      fireStaff(current, personId)
    );
  };

  const raise = (personId: string) => {
    if (blockIfSetupLocked()) return;
    performAction("Maaş zammı", "Aylık gider arttı, personel morali ve performansı toparlandı.", (current) =>
      giveStaffRaise(current, personId)
    );
  };

  const sgkControl = () => {
    if (blockIfSetupLocked()) return;
    performAction("SGK kontrolü", "Kesinti riski düştü; para değil personel/enerji kapasitesi harcandı.", runSgkControl);
  };

  const chamberApproval = () => {
    if (blockIfSetupLocked()) return;
    performAction("Oda onayı", "C grubu / sıralı-kotalı reçete dosyası için oda onayı masrafı işlendi.", runChamberApproval);
  };

  const payDebt = () => {
    if (blockIfSetupLocked()) return;
    performAction("Depo ödemesi", "Borç azaldı, depo güveni arttı.", paySupplierDebt);
  };

  const marketplaceBuy = (categoryId: string) => {
    if (blockIfSetupLocked()) return;
    performAction("Eczacı pazarından alım", "Ürün hızlı bulundu; varsa pazar bakiyesi, yoksa kasa kullanıldı.", (current) =>
      buyFromMarketplace(current, categoryId)
    );
  };

  const marketplaceSell = (categoryId: string) => {
    if (blockIfSetupLocked()) return;
    performAction("Eczacı pazarına satış", "Fazla stok pazara çıktı; ödeme yaklaşık 3 hafta sonra bakiyeye düşecek.", (current) =>
      sellOnMarketplace(current, categoryId)
    );
  };

  const dailyAction = (actionId: DailyActionId) => {
    if (blockIfSetupLocked()) return;
    performAction("Günlük aksiyon", "Günün hazırlık, açık eczane veya kapanış aksiyonlarından biri işlendi.", (current) =>
      applyDailyAction(current, actionId)
    );
  };

  if (!hasGame) {
    return <StartScreen onStart={startScenario} />;
  }

  const selectModule = (module: ModuleId) => {
    if (setupLocked && module !== "eczane") {
      blockIfSetupLocked();
      return;
    }
    setActiveModule(module);
  };

  return (
    <>
      <div className="game-shell-3d">
        <PharmacyWorld3D
          activeModule={activeModule}
          onSelectModule={selectModule}
          setupLocked={setupLocked}
          state={state}
        />

        <header className="world-topbar">
          <div className="world-brand">
            <div className="brand-mark">
              <Store size={24} aria-hidden="true" />
            </div>
            <div>
              <h1>Kırmızı Tabela</h1>
              <p>
                {state.pharmacyName} · {state.city}/{state.district}
              </p>
            </div>
          </div>

          <div className="world-metrics" aria-label="Oyun göstergeleri">
            <span>
              <WalletCards size={16} aria-hidden="true" />
              Kasa <b>{formatMoney(state.cash)}</b>
            </span>
            <span>
              <Truck size={16} aria-hidden="true" />
              Depo <b>{formatMoney(state.debt)}</b>
            </span>
            <span>
              <Landmark size={16} aria-hidden="true" />
              SGK <b>{formatMoney(state.sgkReceivable)}</b>
            </span>
            <span>
              <BatteryMedium size={16} aria-hidden="true" />
              Enerji <b>{Math.round(state.energy)}</b>
            </span>
          </div>

          <div className="world-top-actions">
            <button className="ghost-button compact" onClick={pickNewScenario}>
              <MapPinned size={17} aria-hidden="true" />
              Senaryo
            </button>
            <button className="primary-button compact" disabled={setupLocked} onClick={advanceDay}>
              <Play size={17} aria-hidden="true" />
              {setupLocked ? "Açılış kilitli" : "Günü oynat"}
            </button>
          </div>
        </header>

        <aside className="world-side world-side-left">
          <section className="world-panel">
            <div className="world-panel-head">
              <span>{state.pharmacistName}</span>
              <strong>{state.scenarioName}</strong>
            </div>
            <p>
              {setupLocked
                ? "Sıfırdan açılışta raf, POS, SGK, oda ve depo kurulumları tamamlanmadan satış başlamaz."
                : `${state.timeLabel}. Bugünün akışı raf, personel ve vade kararlarına göre değişiyor.`}
            </p>
          </section>

          <LocationProfile state={state} />

          <section className="world-panel world-system-panel">
            <div>
              <span>Demo Durumu</span>
              <strong>{isFirebaseConfigured ? "Firebase bağlı" : "Yerel kayıt"}</strong>
            </div>
            <div>
              <span>Uyum riski</span>
              <strong>{Math.round(state.complianceRisk)}/100</strong>
            </div>
            <div>
              <span>Personel morali</span>
              <strong>{Math.round(state.staffMorale)}/100</strong>
            </div>
          </section>

          <div className="world-side-actions">
            <button className="ghost-button" onClick={resetGame}>
              <RotateCcw size={18} aria-hidden="true" />
              Senaryoyu sıfırla
            </button>
            <button className="ghost-button" onClick={pickNewScenario}>
              <MapPinned size={18} aria-hidden="true" />
              Yeni senaryo seç
            </button>
          </div>
        </aside>

        <aside className="world-side world-side-right">
          <nav className="world-module-dock" aria-label="Oyun modülleri">
            {moduleItems.map(({ id, label }) => (
            <button
              className={`${activeModule === id ? "active" : ""} ${setupLocked && id !== "eczane" ? "locked" : ""}`}
              disabled={setupLocked && id !== "eczane"}
              key={id}
              onClick={() => selectModule(id)}
            >
              <ClipboardList size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
          </nav>

          <section className="world-module-panel">
            {setupLocked ? (
                <OpeningTasks
                  state={state}
                  setState={setState}
                  tasks={openingTasks}
                  setTasks={setOpeningTasks}
                  setActionResult={setActionResult}
                />
              ) : (
                <GameModules
                  activeModule={activeModule}
                  state={state}
                  onBuyInventory={buyStock}
                  onAdvanceDay={advanceDay}
                  onShelfFocus={(focus) => performAction("Raf odağı değişti", "Satış dağılımı bir sonraki gün bu odağa göre değişecek.", (current) => changeShelfFocus(current, focus))}
                  onAssignStaff={assignTask}
                  onHireStaff={hire}
                  onFireStaff={fire}
                  onRaiseStaff={raise}
                  onSgkControl={sgkControl}
                  onChamberApproval={chamberApproval}
                  onMarketplaceBuy={marketplaceBuy}
                  onMarketplaceSell={marketplaceSell}
                  onPayDebt={payDebt}
                />
              )}
          </section>
        </aside>

        <section className="world-bottom-strip">
          <div className="world-result-stack">
            <ActionResultPanel result={actionResult} />
            <DayReportPanel report={state.lastDayReport} />
          </div>
          <div className="world-action-stack">
            <DailyActionPanel state={state} locked={setupLocked} onAction={dailyAction} />
          </div>
          <div className="world-intel-stack">
            <PlayGuide state={state} />
            <Leaderboard state={state} />
          </div>
        </section>

        <div className="world-status-ribbon">
          <span>
            <Boxes size={15} aria-hidden="true" />
            Stok sağlığı {Math.round(state.stockHealth)}/100
          </span>
          <span>
            <UsersRound size={15} aria-hidden="true" />
            Memnuniyet {Math.round(state.satisfaction)}/100
          </span>
          <span>
            <ShieldAlert size={15} aria-hidden="true" />
            SGK uyum riski {Math.round(state.complianceRisk)}/100
          </span>
        </div>
      </div>
      <FeedbackDock state={state} />
    </>
  );
}
