"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clone, Html, Text, useGLTF } from "@react-three/drei";
import { BatteryMedium, Mail, Play, RotateCcw, Store, WalletCards } from "lucide-react";
import type { Group } from "three";
import { Vector3 } from "three";
import { GameBootLoader } from "@/components/GameBootLoader";
import {
  createInitialState,
  formatMoney,
  formatTime,
  getActionLabel,
  getHotspots,
  outfitCards,
  resolveInteraction,
  scenarioCards,
  type Hotspot,
  type HotspotId,
  type OutfitId,
  type RebootState,
  type ScenarioId,
  type SceneArea,
  type TravelIntent,
  type Vec3
} from "@/game/reboot";

const MODEL_PATHS = {
  avatarCustomer: "/assets/game/models/avatar_customer.glb",
  avatarPharmacistBlack: "/assets/game/models/avatar_pharmacist_black.glb",
  avatarPharmacistRed: "/assets/game/models/avatar_pharmacist_red.glb",
  avatarPharmacistWhite: "/assets/game/models/avatar_pharmacist_white.glb",
  bankBranch: "/assets/game/models/bank_branch.glb",
  depotWarehouse: "/assets/game/models/depot_warehouse.glb",
  pharmacyFacade: "/assets/game/models/pharmacy_facade.glb",
  sgkOffice: "/assets/game/models/sgk_office.glb",
  streetBase: "/assets/game/models/street_base.glb",
  streetProps: "/assets/game/models/street_props.glb"
} as const;

Object.values(MODEL_PATHS).forEach((modelPath) => useGLTF.preload(modelPath));

type ModelAssetName = keyof typeof MODEL_PATHS;

function AssetModel({ name, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }: { name: ModelAssetName; position?: Vec3; rotation?: Vec3; scale?: Vec3 }) {
  const gltf = useGLTF(MODEL_PATHS[name]);
  return <Clone object={gltf.scene} position={position} rotation={rotation} scale={scale} />;
}

function AvatarModel({ outfit, scale = 1 }: { outfit: OutfitId; scale?: number }) {
  const name = outfit === "white" ? "avatarPharmacistWhite" : outfit === "black" ? "avatarPharmacistBlack" : "avatarPharmacistRed";
  return <AssetModel name={name} scale={[scale, scale, scale]} />;
}

function CustomerModel({ scale = 1 }: { scale?: number }) {
  return <AssetModel name="avatarCustomer" scale={[scale, scale, scale]} />;
}

function HotspotMarker({ active, hotspot, onTravel }: { active: boolean; hotspot: Hotspot; onTravel: (hotspot: Hotspot) => void }) {
  return (
    <group position={hotspot.position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[hotspot.radius * 0.38, hotspot.radius * 0.38, 0.035, 32]} />
        <meshStandardMaterial color={active ? "#b21f2d" : "#f6f3e8"} emissive={active ? "#82131d" : "#000000"} emissiveIntensity={active ? 0.25 : 0} />
      </mesh>
      <Html center distanceFactor={5.7} position={[0, 0.42, 0]}>
        <button className={`reboot-world-label ${active ? "active" : ""}`} onClick={(event) => {
          event.stopPropagation();
          onTravel(hotspot);
        }}>
          {hotspot.label}
        </button>
      </Html>
    </group>
  );
}

function PlayerController({
  hotspots,
  initialPosition,
  onTargetChange,
  onTravelComplete,
  scene,
  outfit,
  travelIntent
}: {
  hotspots: Hotspot[];
  initialPosition: Vec3;
  onTargetChange: (target: HotspotId | null) => void;
  onTravelComplete: (target: HotspotId) => void;
  scene: SceneArea;
  outfit: OutfitId;
  travelIntent: TravelIntent | null;
}) {
  const ref = useRef<Group>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastTargetRef = useRef<HotspotId | null>(null);
  const lastTravelRef = useRef<number | null>(null);
  const { camera } = useThree();
  const bounds = scene === "street" ? { minX: -5.8, maxX: 5.6, minZ: -2.4, maxZ: 3.2 } : { minX: -3.05, maxX: 3.05, minZ: -2.28, maxZ: 2.42 };

  useEffect(() => {
    keysRef.current = {};
    lastTargetRef.current = null;
    onTargetChange(null);
    if (!ref.current) return;
    ref.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
  }, [initialPosition[0], initialPosition[1], initialPosition[2], onTargetChange, scene]);

  useEffect(() => {
    const tracked = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    const down = (event: KeyboardEvent) => {
      if (!tracked.has(event.code)) return;
      event.preventDefault();
      keysRef.current[event.code] = true;
    };
    const up = (event: KeyboardEvent) => {
      if (!tracked.has(event.code)) return;
      event.preventDefault();
      keysRef.current[event.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const keys = keysRef.current;
    const manualDx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    const manualDz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
    let dx = manualDx;
    let dz = manualDz;

    if (manualDx === 0 && manualDz === 0 && travelIntent?.scene === scene) {
      const toX = travelIntent.position[0] - ref.current.position.x;
      const toZ = travelIntent.position[2] - ref.current.position.z;
      const distance = Math.hypot(toX, toZ);
      if (distance <= 0.08) {
        ref.current.position.set(travelIntent.position[0], 0, travelIntent.position[2]);
        if (lastTravelRef.current !== travelIntent.nonce) {
          lastTravelRef.current = travelIntent.nonce;
          onTravelComplete(travelIntent.hotspotId);
        }
      } else {
        dx = toX;
        dz = toZ;
      }
    }

    if (dx !== 0 || dz !== 0) {
      const length = Math.hypot(dx, dz) || 1;
      const speed = scene === "street" ? 2.15 : 1.65;
      const nextX = Math.max(bounds.minX, Math.min(bounds.maxX, ref.current.position.x + (dx / length) * speed * delta));
      const nextZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, ref.current.position.z + (dz / length) * speed * delta));
      ref.current.position.set(nextX, 0, nextZ);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }

    const playerPosition = ref.current.position;
    const nearest = hotspots.find((hotspot) => {
      const distance = Math.hypot(playerPosition.x - hotspot.position[0], playerPosition.z - hotspot.position[2]);
      return distance <= hotspot.radius;
    });
    const nextTarget = nearest?.id ?? null;
    if (nextTarget !== lastTargetRef.current) {
      lastTargetRef.current = nextTarget;
      onTargetChange(nextTarget);
    }

    const cameraOffset = scene === "street" ? new Vector3(0.45, 2.35, 4.55) : new Vector3(0.55, 2.0, 4.0);
    const desired = new Vector3(playerPosition.x, 0, playerPosition.z).add(cameraOffset);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(playerPosition.x, 0.72, playerPosition.z);
  });

  return (
    <group ref={ref}>
      <AvatarModel outfit={outfit} />
      <Html center distanceFactor={7.6} position={[0, 1.34, 0]}>
        <span className="reboot-player-label">Eczacı</span>
      </Html>
    </group>
  );
}

function StreetScene({
  activeTarget,
  onTargetChange,
  onTravel,
  onTravelComplete,
  state,
  travelIntent
}: {
  activeTarget: HotspotId | null;
  onTargetChange: (target: HotspotId | null) => void;
  onTravel: (hotspot: Hotspot) => void;
  onTravelComplete: (target: HotspotId) => void;
  state: RebootState;
  travelIntent: TravelIntent | null;
}) {
  const hotspots = useMemo(() => getHotspots("street"), []);
  return (
    <>
      <color attach="background" args={["#8bdcd2"]} />
      <ambientLight intensity={0.78} />
      <directionalLight castShadow intensity={2.55} position={[4, 7, 5]} shadow-mapSize={[1536, 1536]} />
      <StreetDiorama />
      <PharmacyFacade />
      <DepotWarehouse />
      <SgkOffice />
      <BankBranch />
      <StreetDetails />

      {hotspots.map((hotspot) => (
        <HotspotMarker active={activeTarget === hotspot.id || travelIntent?.hotspotId === hotspot.id} hotspot={hotspot} key={hotspot.id} onTravel={onTravel} />
      ))}
      <NpcLine count={state.queue} />
      <PlayerController hotspots={hotspots} initialPosition={[0, 0, 2.65]} onTargetChange={onTargetChange} onTravelComplete={onTravelComplete} outfit={state.outfit} scene="street" travelIntent={travelIntent} />
    </>
  );
}

function PharmacyScene({
  activeTarget,
  onTargetChange,
  onTravel,
  onTravelComplete,
  state,
  travelIntent
}: {
  activeTarget: HotspotId | null;
  onTargetChange: (target: HotspotId | null) => void;
  onTravel: (hotspot: Hotspot) => void;
  onTravelComplete: (target: HotspotId) => void;
  state: RebootState;
  travelIntent: TravelIntent | null;
}) {
  const hotspots = useMemo(() => getHotspots("pharmacy"), []);
  const shelfCount = Math.max(2, Math.round(state.stock / 10));
  return (
    <>
      <color attach="background" args={["#dce5dc"]} />
      <ambientLight intensity={0.82} />
      <directionalLight castShadow intensity={2.25} position={[3, 5, 4]} />
      <mesh receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[7.4, 5.6, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#d9ded4" roughness={0.76} />
      </mesh>
      <Wall position={[0, 1.22, -2.62]} scale={[7.4, 2.44, 0.12]} />
      <Wall position={[-3.72, 1.12, 0]} scale={[0.12, 2.24, 5.25]} />
      <Wall position={[3.72, 1.12, 0]} scale={[0.12, 2.24, 5.25]} />
      <mesh castShadow position={[-0.35, 0.42, 0.42]} scale={[2.4, 0.62, 0.58]}>
        <boxGeometry />
        <meshStandardMaterial color="#eee5d8" roughness={0.68} />
      </mesh>
      <Text color="#1f2c27" fontSize={0.22} position={[-0.35, 0.86, 0.75]}>
        BANKO
      </Text>
      <ShelfWall count={shelfCount} />
      <StorageBoxes closed={state.storageBoxes} opened={state.openedBoxes} />
      <Desk label="SGK" position={[2.25, 0.48, 0.92]} color="#d8e8ef" />
      <Desk label="POS" position={[0.92, 0.42, 0.48]} color="#f7f8f2" />
      {hotspots.map((hotspot) => (
        <HotspotMarker active={activeTarget === hotspot.id || travelIntent?.hotspotId === hotspot.id} hotspot={hotspot} key={hotspot.id} onTravel={onTravel} />
      ))}
      <InteriorQueue count={state.queue} />
      <PlayerController hotspots={hotspots} initialPosition={[0, 0, 2.05]} onTargetChange={onTargetChange} onTravelComplete={onTravelComplete} outfit={state.outfit} scene="pharmacy" travelIntent={travelIntent} />
    </>
  );
}

function StreetDiorama() {
  return <AssetModel name="streetBase" />;
}

function PharmacyFacade() {
  return (
    <group position={[0, 0, -1.82]}>
      <AssetModel name="pharmacyFacade" />
      <Text color="#fff" fontSize={0.14} maxWidth={1.08} position={[0.2, 1.72, 0.385]}>
        KIRMIZI TABELA
      </Text>
    </group>
  );
}

function DepotWarehouse() {
  return (
    <group position={[-4.72, 0, -0.32]} rotation={[0, 0.05, 0]}>
      <AssetModel name="depotWarehouse" />
      <Text color="#25352e" fontSize={0.11} maxWidth={0.92} position={[0, 1.02, 0.49]}>
        ECZA DEPOSU
      </Text>
      <Text color="#b21f2d" fontSize={0.08} position={[0.9, 0.32, 1.12]}>
        ecza
      </Text>
    </group>
  );
}

function SgkOffice() {
  return (
    <group position={[4.65, 0, -0.62]} rotation={[0, -0.04, 0]}>
      <AssetModel name="sgkOffice" />
      <Text color="#293c40" fontSize={0.18} position={[0, 1.08, 0.46]}>
        SGK
      </Text>
    </group>
  );
}

function BankBranch() {
  return (
    <group position={[2.9, 0, 0.58]} rotation={[0, -0.08, 0]}>
      <AssetModel name="bankBranch" />
      <Text color="#23342e" fontSize={0.13} maxWidth={0.9} position={[0, 0.72, 0.37]}>
        BANKA POS
      </Text>
    </group>
  );
}

function StreetDetails() {
  return <AssetModel name="streetProps" />;
}

function Wall({ position, scale }: { position: Vec3; scale: Vec3 }) {
  return (
    <mesh receiveShadow position={position} scale={scale}>
      <boxGeometry />
      <meshStandardMaterial color="#cfd7d0" roughness={0.78} />
    </mesh>
  );
}

function ShelfWall({ count }: { count: number }) {
  return (
    <group position={[-2.15, 0, -1.75]}>
      {[0, 1, 2].map((rack) => (
        <group key={rack} position={[rack * 0.82, 0, 0]}>
          <mesh castShadow position={[0, 0.75, 0]} scale={[0.62, 1.45, 0.18]}>
            <boxGeometry />
            <meshStandardMaterial color="#7f8a82" roughness={0.74} />
          </mesh>
          {[0, 1, 2, 3].map((row) => (
            <mesh castShadow key={row} position={[0, 0.22 + row * 0.32, 0.13]} scale={[0.68, 0.035, 0.12]}>
              <boxGeometry />
              <meshStandardMaterial color="#f6f7ef" roughness={0.62} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: count }, (_, index) => (
        <mesh castShadow key={index} position={[-0.52 + (index % 6) * 0.26, 0.28 + Math.floor(index / 6) * 0.32, 0.25]} scale={[0.1, 0.16, 0.07]}>
          <boxGeometry />
          <meshStandardMaterial color={index % 3 === 0 ? "#f7d88c" : index % 3 === 1 ? "#dcefff" : "#eef5f2"} roughness={0.58} />
        </mesh>
      ))}
    </group>
  );
}

function StorageBoxes({ closed, opened }: { closed: number; opened: number }) {
  return (
    <group position={[2.25, 0, -1.3]}>
      {Array.from({ length: Math.max(1, closed + opened) }, (_, index) => (
        <mesh castShadow key={index} position={[index * 0.18, 0.17 + index * 0.08, 0]} rotation={[0, index * 0.08, 0]} scale={[0.42, 0.3, 0.34]}>
          <boxGeometry />
          <meshStandardMaterial color={index < opened ? "#f7f1dc" : "#d8b985"} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Desk({ color, label, position }: { color: string; label: string; position: Vec3 }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0, 0]} scale={[0.72, 0.46, 0.48]}>
        <boxGeometry />
        <meshStandardMaterial color={color} roughness={0.66} />
      </mesh>
      <Text color="#203129" fontSize={0.12} position={[0, 0.34, 0.28]}>
        {label}
      </Text>
    </group>
  );
}

function NpcLine({ count }: { count: number }) {
  return (
    <group>
      {Array.from({ length: Math.min(5, count) }, (_, index) => (
        <group key={index} position={[-0.85 - index * 0.42, 0, 0.92 + index * 0.14]} rotation={[0, 0.08, 0]} scale={[0.68, 0.68, 0.68]}>
          <CustomerModel />
        </group>
      ))}
    </group>
  );
}

function InteriorQueue({ count }: { count: number }) {
  return (
    <group>
      {Array.from({ length: Math.min(5, count) }, (_, index) => (
        <group key={index} position={[-1.2 - index * 0.36, 0, 1.4 + index * 0.18]} scale={[0.72, 0.72, 0.72]}>
          <CustomerModel />
        </group>
      ))}
    </group>
  );
}

function RebootScene({
  activeTarget,
  onTargetChange,
  onTravel,
  onTravelComplete,
  state,
  travelIntent
}: {
  activeTarget: HotspotId | null;
  onTargetChange: (target: HotspotId | null) => void;
  onTravel: (hotspot: Hotspot) => void;
  onTravelComplete: (target: HotspotId) => void;
  state: RebootState;
  travelIntent: TravelIntent | null;
}) {
  if (state.scene === "pharmacy") {
    return <PharmacyScene activeTarget={activeTarget} onTargetChange={onTargetChange} onTravel={onTravel} onTravelComplete={onTravelComplete} state={state} travelIntent={travelIntent} />;
  }

  return <StreetScene activeTarget={activeTarget} onTargetChange={onTargetChange} onTravel={onTravel} onTravelComplete={onTravelComplete} state={state} travelIntent={travelIntent} />;
}

export function RebootGame() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>("new");
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitId>("red");
  const [game, setGame] = useState<RebootState | null>(null);
  const [activeTarget, setActiveTarget] = useState<HotspotId | null>(null);
  const [travelIntent, setTravelIntent] = useState<TravelIntent | null>(null);
  const [booting, setBooting] = useState(false);
  const bootTimerRef = useRef<number | null>(null);
  const actionLabel = game ? getActionLabel(activeTarget, game) : "";

  const startGame = () => {
    const nextGame = createInitialState(selectedScenario, selectedOutfit);
    setBooting(true);
    setActiveTarget(null);
    setTravelIntent(null);
    if (bootTimerRef.current) window.clearTimeout(bootTimerRef.current);
    bootTimerRef.current = window.setTimeout(() => {
      setGame(nextGame);
      setBooting(false);
      bootTimerRef.current = null;
    }, 720);
  };

  const resetGame = () => {
    if (bootTimerRef.current) window.clearTimeout(bootTimerRef.current);
    setGame(null);
    setActiveTarget(null);
    setTravelIntent(null);
    setBooting(false);
  };

  const interact = () => {
    setGame((current) => (current ? resolveInteraction(current, activeTarget) : current));
  };

  const travelToHotspot = (hotspot: Hotspot) => {
    if (!game) return;
    setTravelIntent({ hotspotId: hotspot.id, position: hotspot.position, scene: game.scene, nonce: Date.now() });
  };

  const completeTravel = (target: HotspotId) => {
    setActiveTarget(target);
    setTravelIntent(null);
  };

  useEffect(() => {
    setTravelIntent(null);
    setActiveTarget(null);
  }, [game?.scene]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" && event.code !== "Enter") return;
      event.preventDefault();
      interact();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useEffect(() => {
    return () => {
      if (bootTimerRef.current) window.clearTimeout(bootTimerRef.current);
    };
  }, []);

  if (!game) {
    return (
      <main className="reboot-game reboot-start">
        <section className="reboot-start-panel">
          <div className="reboot-brand">
            <span><Store size={28} aria-hidden="true" /></span>
            <div>
              <h1>Kırmızı Tabela</h1>
              <p>Karakterle oynanan eczane işletme simülasyonu</p>
            </div>
          </div>
          <div className="reboot-start-grid">
            <section>
              <h2>Senaryo</h2>
              <div className="reboot-choice-grid">
                {scenarioCards.map((scenario) => (
                  <button className={selectedScenario === scenario.id ? "active" : ""} key={scenario.id} onClick={() => setSelectedScenario(scenario.id)}>
                    <strong>{scenario.title}</strong>
                    <span>{scenario.subtitle}</span>
                    <em>{formatMoney(scenario.cash)} kasa · {formatMoney(scenario.debt)} borç</em>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h2>Avatar</h2>
              <div className="reboot-choice-grid outfit">
                {outfitCards.map((outfit) => (
                  <button className={selectedOutfit === outfit.id ? "active" : ""} key={outfit.id} onClick={() => setSelectedOutfit(outfit.id)}>
                    <span className="outfit-swatch" style={{ background: outfit.coat }} />
                    <strong>{outfit.label}</strong>
                  </button>
                ))}
              </div>
              <button className="reboot-start-button" onClick={startGame}>
                <Play size={18} aria-hidden="true" />
                Oyuna gir
              </button>
            </section>
          </div>
        </section>
        {booting && <GameBootLoader label="Eczane, depo ve SGK rotası kuruluyor" />}
      </main>
    );
  }

  return (
    <main className="reboot-game">
      <Canvas camera={{ fov: 54, position: [0, 2.4, 6] }} dpr={[1, 1.7]} shadows>
        <Suspense fallback={null}>
          <RebootScene activeTarget={activeTarget} onTargetChange={setActiveTarget} onTravel={travelToHotspot} onTravelComplete={completeTravel} state={game} travelIntent={travelIntent} />
        </Suspense>
      </Canvas>

      <header className="reboot-hud">
        <div className="reboot-brand compact">
          <span><Store size={22} aria-hidden="true" /></span>
          <div>
            <strong>Kırmızı Tabela</strong>
            <small>{game.scene === "street" ? "Mahalle haritası" : "Eczane içi"} · Gün {game.day} · {formatTime(game.time)}</small>
          </div>
        </div>
        <div className="reboot-metrics">
          <span><WalletCards size={15} /> Kasa <b>{formatMoney(game.cash)}</b></span>
          <span>Depo <b>{formatMoney(game.debt)}</b></span>
          <span>SGK <b>{formatMoney(game.sgkReceivable)}</b></span>
          <span>Stok <b>%{game.stock}</b></span>
          <span><BatteryMedium size={15} /> Enerji <b>{game.energy}</b></span>
        </div>
        <button onClick={resetGame}>
          <RotateCcw size={16} aria-hidden="true" />
          Sıfırla
        </button>
      </header>

      <section className="reboot-objective">
        <span>Aktif hedef</span>
        <strong>{game.currentGoal}</strong>
      </section>

      <section className="reboot-interact">
        <span>{activeTarget ? "Yakındaki etkileşim" : travelIntent ? "Yürüyor" : "Yaklaş"}</span>
        <strong>{actionLabel}</strong>
        <button disabled={!activeTarget || game.dayClosed} onClick={interact}>
          {game.dayClosed ? "Gün kapandı" : "Etkileş"}
        </button>
      </section>

      <aside className="reboot-tablet">
        <h2>Operasyon</h2>
        <div className="reboot-tablet-grid">
          <span>Hasta kuyruğu <b>{game.queue}</b></span>
          <span>Hizmet <b>{game.served}</b></span>
          <span>Kaçan <b>{game.missed}</b></span>
          <span>POS alacağı <b>{formatMoney(game.posReceivable)}</b></span>
          <span>Uyum riski <b>{game.complianceRisk}/100</b></span>
          <span>Memnuniyet <b>{game.satisfaction}/100</b></span>
        </div>
        <div className="reboot-log">
          {game.log.map((item, index) => (
            <p key={`${item.time}-${index}`}><b>{item.time}</b> {item.text}</p>
          ))}
        </div>
      </aside>

      {game.dayClosed && (
        <section className="reboot-day-end">
          <h2>Gün Sonu</h2>
          <p>{game.served} hasta hizmet aldı, {game.missed} satış kaçtı. POS ve SGK alacakları kasadan ayrı takip edildi.</p>
          <button onClick={() => setGame((current) => current ? { ...current, day: current.day + 1, time: 8 * 60 + 30, dayClosed: false, queue: current.queue + 3, currentGoal: "Yeni gün başladı; rafı ve kuyruğu kontrol et.", log: [{ time: "08:30", text: "Yeni gün başladı." }, ...current.log].slice(0, 6) } : current)}>
            Yeni güne geç
          </button>
        </section>
      )}

      <a className="reboot-feedback" href="mailto:cihangir.akman@hotmail.com?subject=Kirmizi%20Tabela%20hata%20ve%20istek">
        <Mail size={18} aria-hidden="true" />
        Hata / istek bildir
      </a>
    </main>
  );
}
