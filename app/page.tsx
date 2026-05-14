"use client";

import { useEffect, useState } from "react";
import {
  BatteryMedium,
  CalendarDays,
  ClipboardList,
  Landmark,
  MapPinned,
  RotateCcw,
  ShieldAlert,
  Store,
  Truck,
  WalletCards
} from "lucide-react";
import { ActionResultPanel } from "@/components/ActionResultPanel";
import { GameModules, type ModuleId } from "@/components/GameModules";
import { DailyActionPanel } from "@/components/DailyActionPanel";
import { DayReportPanel } from "@/components/DayReportPanel";
import { Leaderboard } from "@/components/Leaderboard";
import { LivePharmacyScene } from "@/components/LivePharmacyScene";
import { LocationProfile } from "@/components/LocationProfile";
import { OperationsBoard } from "@/components/OperationsBoard";
import { OpeningTasks } from "@/components/OpeningTasks";
import { PlayGuide } from "@/components/PlayGuide";
import { ReportPanel } from "@/components/ReportPanel";
import { SeasonTrack } from "@/components/SeasonTrack";
import { ScenarioStatus } from "@/components/ScenarioStatus";
import { StartScreen } from "@/components/StartScreen";
import { StatCard } from "@/components/StatCard";
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
  runChamberApproval,
  runSgkControl,
  sellOnMarketplace
} from "@/game/engine";
import type { ActionDelta, ActionResult, DailyActionId, GameState, PurchasePayment, StartProfile, TimedTask } from "@/game/types";
import { isFirebaseConfigured } from "@/firebase/config";

const storageKey = "kirmizi-tabela-v4-state";

export default function Home() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [openingTasks, setOpeningTasks] = useState<TimedTask[]>(() => createOpeningTasks());
  const [activeModule, setActiveModule] = useState<ModuleId>("eczane");
  const [hasGame, setHasGame] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<GameState>;
        const base = createInitialState(parsed.scenarioId);
        setState({ ...base, ...parsed, shelfFocus: parsed.shelfFocus ?? base.shelfFocus });
        setOpeningTasks(createOpeningTasks());
        setHasGame(true);
      } catch {
        setState(createInitialState());
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && hasGame) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [hasGame, hydrated, state]);

  const resetGame = () => {
    const fresh = createInitialState(state.scenarioId, {
      pharmacistName: state.pharmacistName,
      pharmacyName: state.pharmacyName,
      city: state.city,
      district: state.district,
      locationType: state.locationType,
      startMode: state.startMode
    });
    setState(fresh);
    setOpeningTasks(createOpeningTasks());
    setActionResult(null);
    window.localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  const startScenario = (scenarioId: string, profile: StartProfile) => {
    const fresh = createInitialState(scenarioId, profile);
    setState(fresh);
    setOpeningTasks(createOpeningTasks());
    setActionResult(null);
    setHasGame(true);
    window.localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  const pickNewScenario = () => {
    setHasGame(false);
    window.localStorage.removeItem(storageKey);
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
      payment === "cash" ? "Peşin depo alımı" : "Vadeli depo alımı",
      `${categoryName} rafa girdi. Vadeli alım bugün kasayı düşürmez; vade defterine yeni ödeme yazar.`,
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Store size={25} aria-hidden="true" />
          </div>
          <div>
            <h1>Kırmızı Tabela</h1>
            <p>{state.pharmacistName}</p>
          </div>
        </div>

        <section className="sidebar-section">
          <h2>Aktif Senaryo</h2>
          <div className="scenario-tile">
            <strong>{state.scenarioName}</strong>
            <span>
              {state.pharmacyName} · {state.city}/{state.district}.{" "}
              {setupLocked ? "Açılış hazırlığı sürüyor; günlük satış henüz kilitli." : "Günlük oyun açık."}
            </span>
          </div>
        </section>

        <LocationProfile state={state} />

        <section className="sidebar-section">
          <h2>Demo Durumu</h2>
          <div className="scenario-tile">
            <strong>{isFirebaseConfigured ? "Firebase hazır" : "Yerel demo modu"}</strong>
            <span>
              Firebase ayarları sonradan bağlanacak. Bu prototip ilerlemeyi tarayıcıda saklar.
            </span>
          </div>
        </section>

        <button className="ghost-button" onClick={resetGame}>
          <RotateCcw size={18} aria-hidden="true" />
          Senaryoyu sıfırla
        </button>
        <button className="ghost-button" onClick={pickNewScenario}>
          <MapPinned size={18} aria-hidden="true" />
          Yeni senaryo seç
        </button>
        <section className="module-nav">
          {[
            ["eczane", "Eczane"],
            ["depo", "Depo"],
            ["stok", "Raf/Stok"],
            ["sgk", "SGK"],
            ["personel", "Personeller"],
            ["finans", "Finans"],
            ["pazar", "Eczacı Pazarı"]
          ].map(([id, label]) => (
            <button
              className={`${activeModule === id ? "active" : ""} ${setupLocked && id !== "eczane" ? "locked" : ""}`}
              disabled={setupLocked && id !== "eczane"}
              key={id}
              onClick={() => setActiveModule(id as ModuleId)}
            >
              <ClipboardList size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </section>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>{state.pharmacyName}</h2>
            <p>
              {state.locationName}. Ay {state.month}, gün {state.currentDay}. Bugünkü karar kasayı, güveni ve
              enerjiyi birlikte etkileyecek.
            </p>
          </div>
          <div className="top-actions">
            <button className="icon-button" title="Takvim">
              <CalendarDays size={19} aria-hidden="true" />
            </button>
            <button className="primary-button" disabled={setupLocked} onClick={advanceDay}>
              {setupLocked ? "Açılış kilitli" : "Günü oynat"}
            </button>
          </div>
        </header>

        <section className="stat-grid">
          <StatCard label="Kasa" value={formatMoney(state.cash)} detail="Elden satış ve tahsilat sonrası" icon={WalletCards} />
          <StatCard label="Depo borcu" value={formatMoney(state.debt)} detail="Vade baskısı ve güven ilişkisi" icon={Truck} />
          <StatCard label="POS alacağı" value={formatMoney(state.posReceivable)} detail="Ertesi gün/blokeli tahsilatlar" icon={WalletCards} />
          <StatCard label="SGK alacağı" value={formatMoney(state.sgkReceivable)} detail="Bekleyen geri ödeme havuzu" icon={Landmark} />
          <StatCard label="Enerji" value={`${Math.round(state.energy)}/100`} detail="Düşerse hata ve tartışma riski artar" icon={BatteryMedium} />
          <StatCard label="Uyum riski" value={`${Math.round(state.complianceRisk)}/100`} detail="Dikkat, evrak ve süreç hassasiyeti" icon={ShieldAlert} />
        </section>

        <section className="tycoon-board">
          <div className="play-column">
            <LivePharmacyScene state={state} />
            <DailyActionPanel state={state} locked={setupLocked} onAction={dailyAction} />
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
          </div>
          <div className="right-game-rail">
            <ActionResultPanel result={actionResult} />
            <DayReportPanel report={state.lastDayReport} />
            <PlayGuide state={state} />
            <Leaderboard state={state} />
          </div>
        </section>

        {!setupLocked && (
          <>
            <ScenarioStatus state={state} />
            <OperationsBoard state={state} />
            <SeasonTrack state={state} />
            <ReportPanel state={state} />
          </>
        )}
      </main>
    </div>
  );
}
