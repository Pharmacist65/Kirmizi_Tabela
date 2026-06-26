"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import { BatteryMedium, Mail, Play, RotateCcw, Store, WalletCards } from "lucide-react";
import type { Group } from "three";
import { Vector3 } from "three";

type SceneArea = "street" | "pharmacy";
type ScenarioId = "new" | "takeover" | "crisis";
type OutfitId = "red" | "white" | "black";
type HotspotId = "pharmacy-door" | "depot" | "sgk-building" | "bank" | "counter" | "shelf" | "storage" | "pos" | "sgk-desk" | "exit";
type Vec3 = [number, number, number];

type Hotspot = {
  id: HotspotId;
  label: string;
  position: Vec3;
  radius: number;
};

type TravelIntent = {
  hotspotId: HotspotId;
  position: Vec3;
  scene: SceneArea;
  nonce: number;
};

type GameLog = {
  time: string;
  text: string;
};

type RebootState = {
  scenarioId: ScenarioId;
  scene: SceneArea;
  day: number;
  time: number;
  cash: number;
  debt: number;
  sgkReceivable: number;
  posReceivable: number;
  stock: number;
  storageBoxes: number;
  openedBoxes: number;
  served: number;
  missed: number;
  queue: number;
  energy: number;
  satisfaction: number;
  complianceRisk: number;
  outfit: OutfitId;
  currentGoal: string;
  log: GameLog[];
  dayClosed: boolean;
};

const scenarioCards: {
  id: ScenarioId;
  title: string;
  subtitle: string;
  cash: number;
  debt: number;
  stock: number;
  queue: number;
  goal: string;
}[] = [
  {
    id: "new",
    title: "Sıfırdan Açılış",
    subtitle: "Önce koli, raf ve ilk hasta akışı kurulur.",
    cash: 420000,
    debt: 0,
    stock: 18,
    queue: 2,
    goal: "Depoya git, ilk koliyi getir ve eczane içinde rafa diz."
  },
  {
    id: "takeover",
    title: "Borçlu Devralma",
    subtitle: "Hazır hasta var ama depo borcu ve eksik raf baskısı var.",
    cash: 80000,
    debt: 240000,
    stock: 37,
    queue: 4,
    goal: "Eczaneye gir, bankodaki kuyruğu erit ve depo borcunu büyütmeden stok tamamla."
  },
  {
    id: "crisis",
    title: "12 Aylık Kriz",
    subtitle: "Yoğun SGK, düşük enerji, yüksek kaçan hasta riski.",
    cash: 125000,
    debt: 310000,
    stock: 28,
    queue: 5,
    goal: "SGK riskini kontrol et, sonra bankoda hastaları kaçırmadan hizmet ver."
  }
];

const outfitCards: { id: OutfitId; label: string; coat: string; accent: string; pants: string }[] = [
  { id: "red", label: "Kırmızı önlük", coat: "#b21f2d", accent: "#f7f1ec", pants: "#202a31" },
  { id: "white", label: "Beyaz önlük", coat: "#f5f4ea", accent: "#b21f2d", pants: "#27333a" },
  { id: "black", label: "Siyah forma", coat: "#20282a", accent: "#e0a13a", pants: "#171f24" }
];

const streetHotspots: Hotspot[] = [
  { id: "pharmacy-door", label: "Eczaneye gir", position: [0, 0, -1.05], radius: 1.25 },
  { id: "depot", label: "Depodan koli al", position: [-4.65, 0, 0.25], radius: 1.45 },
  { id: "sgk-building", label: "SGK binası", position: [4.45, 0, -0.15], radius: 1.35 },
  { id: "bank", label: "Banka / POS", position: [2.7, 0, 2.18], radius: 1.18 }
];

const pharmacyHotspots: Hotspot[] = [
  { id: "counter", label: "Bankoda hasta karşıla", position: [-0.35, 0, 0.55], radius: 1.05 },
  { id: "shelf", label: "Rafı kontrol et", position: [-2.15, 0, -1.35], radius: 1.05 },
  { id: "storage", label: "Depo odası / koli", position: [2.25, 0, -1.3], radius: 1.08 },
  { id: "pos", label: "POS tahsilatı", position: [0.92, 0, 0.48], radius: 0.92 },
  { id: "sgk-desk", label: "SGK dosyası", position: [2.25, 0, 0.92], radius: 0.98 },
  { id: "exit", label: "Sokağa çık", position: [0, 0, 2.28], radius: 1.05 }
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}

function formatTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function createInitialState(scenarioId: ScenarioId, outfit: OutfitId): RebootState {
  const scenario = scenarioCards.find((item) => item.id === scenarioId) ?? scenarioCards[0];
  return {
    scenarioId,
    scene: "street",
    day: 1,
    time: 8 * 60 + 30,
    cash: scenario.cash,
    debt: scenario.debt,
    sgkReceivable: scenario.id === "new" ? 0 : 110000,
    posReceivable: scenario.id === "new" ? 0 : 18000,
    stock: scenario.stock,
    storageBoxes: 0,
    openedBoxes: 0,
    served: 0,
    missed: 0,
    queue: scenario.queue,
    energy: scenario.id === "crisis" ? 58 : 74,
    satisfaction: scenario.id === "crisis" ? 55 : 68,
    complianceRisk: scenario.id === "new" ? 16 : 28,
    outfit,
    currentGoal: scenario.goal,
    log: [{ time: "08:30", text: `${scenario.title} başladı. İlk hedef: ${scenario.goal}` }],
    dayClosed: false
  };
}

function pushLog(state: RebootState, text: string, timeDelta = 20): RebootState {
  const nextTime = Math.min(19 * 60, state.time + timeDelta);
  return {
    ...state,
    time: nextTime,
    dayClosed: nextTime >= 19 * 60,
    log: [{ time: formatTime(nextTime), text }, ...state.log].slice(0, 6)
  };
}

function getHotspots(scene: SceneArea) {
  return scene === "street" ? streetHotspots : pharmacyHotspots;
}

function getActionLabel(target: HotspotId | null, state: RebootState) {
  if (!target) return "Yakındaki hedefe yaklaş";
  if (target === "pharmacy-door") return "Eczaneye gir";
  if (target === "exit") return "Sokağa çık";
  if (target === "depot") return state.storageBoxes > 0 ? "Teslim alınan koli var" : "12 adetlik ilk koliyi al";
  if (target === "sgk-building" || target === "sgk-desk") return "SGK dosyasını kontrol et";
  if (target === "bank" || target === "pos") return "POS mutabakatını işle";
  if (target === "storage") return state.storageBoxes > 0 ? "Koliyi aç" : state.openedBoxes > 0 ? "Açılan koliyi rafa taşı" : "Depoda koli yok";
  if (target === "shelf") return state.openedBoxes > 0 ? "Açılan koliyi rafa diz" : "Raf eksiklerini kontrol et";
  return state.queue > 0 ? "Hastayı karşıla" : "Kuyruk boş";
}

function resolveInteraction(state: RebootState, target: HotspotId | null): RebootState {
  if (!target || state.dayClosed) return state;

  if (target === "pharmacy-door") {
    const nextGoal = state.storageBoxes > 0
      ? "Depo odasına git, koliyi aç, sonra raf istasyonuna diz."
      : "İçeride banko, raf, depo odası, POS ve SGK masası fiziksel istasyonlar.";
    return {
      ...pushLog({ ...state, scene: "pharmacy", currentGoal: nextGoal }, "Eczane kapısından içeri girdin.", 5),
      scene: "pharmacy"
    };
  }

  if (target === "exit") {
    return {
      ...pushLog({ ...state, scene: "street", currentGoal: "Dışarıda depo, SGK ve banka binalarına yürüyerek git." }, "Sokağa çıktın.", 5),
      scene: "street"
    };
  }

  if (target === "depot") {
    if (state.storageBoxes > 0) return pushLog(state, "Depo kuryesi zaten bir koliyi teslim etti; eczane depo odasında aç.", 5);
    const next = {
      ...state,
      storageBoxes: state.storageBoxes + 1,
      debt: state.debt + 18500,
      currentGoal: "Eczaneye gir, depo odasında koliyi aç ve raflara diz."
    };
    return pushLog(next, "Ecza deposundan 45 gün vadeli 12 adetlik koli aldın. Borç arttı, koli eczane depo odasına gitti.", 25);
  }

  if (target === "storage") {
    if (state.storageBoxes > 0) {
      const next = { ...state, storageBoxes: state.storageBoxes - 1, openedBoxes: state.openedBoxes + 1, currentGoal: "Rafa git ve açılan koliyi diz." };
      return pushLog(next, "Koliyi açtın: parasetamol, ibuprofen, bebek destek ve OTC hızlı dönen ürünler çıktı.", 15);
    }
    if (state.openedBoxes > 0) {
      return pushLog(state, "Açılmış koli rafta bekliyor. Raf istasyonuna git ve ürünleri diz.", 5);
    }
    return pushLog(state, "Depo odasında açılacak koli yok. Önce dışarıdaki depoya git.", 5);
  }

  if (target === "shelf") {
    if (state.openedBoxes > 0) {
      const next = { ...state, openedBoxes: state.openedBoxes - 1, stock: Math.min(100, state.stock + 22), satisfaction: Math.min(100, state.satisfaction + 3), currentGoal: "Bankoya geç ve hastaları karşıla." };
      return pushLog(next, "Açılan koliyi rafa dizdin. Ürün bulunurluğu ve memnuniyet arttı.", 20);
    }
    const next = { ...state, currentGoal: state.stock < 35 ? "Raf kritik; dışarıdaki depodan koli al." : "Raf yeterli; bankoda hasta karşıla." };
    return pushLog(next, `Raf kontrolü: doluluk %${state.stock}. ${state.stock < 35 ? "Eksik raf satış kaçırabilir." : "Bugünlük güvenli."}`, 10);
  }

  if (target === "counter") {
    if (state.queue <= 0) return pushLog(state, "Bankoda bekleyen hasta yok. Raf veya SGK işlerini kontrol et.", 5);
    const stockPenalty = state.stock <= 0;
    const sold = stockPenalty ? 0 : 1;
    const next = {
      ...state,
      queue: Math.max(0, state.queue - 1),
      stock: Math.max(0, state.stock - (sold ? 6 : 0)),
      cash: state.cash + (sold ? 540 : 0),
      posReceivable: state.posReceivable + (sold ? 420 : 0),
      sgkReceivable: state.sgkReceivable + (sold ? 920 : 0),
      served: state.served + sold,
      missed: state.missed + (stockPenalty ? 1 : 0),
      satisfaction: Math.max(0, Math.min(100, state.satisfaction + (stockPenalty ? -7 : 2))),
      currentGoal: state.queue > 1 ? "Kuyruk bitene kadar bankoda kal veya raf eksikse depoya koş." : "Kuyruk azaldı; POS ve SGK dosyasını kontrol et."
    };
    return pushLog(next, stockPenalty ? "Hasta istediği ürünü bulamadı ve çıktı. Kaçan satış yazıldı." : "Bir hastayı karşıladın. Nakit, POS ve SGK alacağı ayrı ayrı yazıldı.", 28);
  }

  if (target === "pos" || target === "bank") {
    const collected = Math.min(state.posReceivable, 4500);
    const next = { ...state, cash: state.cash + collected, posReceivable: state.posReceivable - collected, currentGoal: "POS kontrol edildi; SGK veya bankoya dön." };
    return pushLog(next, collected > 0 ? `${formatMoney(collected)} POS alacağı kasaya geçti.` : "Bekleyen POS tahsilatı yok.", 18);
  }

  if (target === "sgk-building" || target === "sgk-desk") {
    const next = {
      ...state,
      complianceRisk: Math.max(0, state.complianceRisk - 8),
      energy: Math.max(0, state.energy - 5),
      currentGoal: "SGK riski düştü; şimdi banko ve raf akışını dengele."
    };
    return pushLog(next, "SGK dosyalarını kontrol ettin. Kesinti riski düştü ama enerji harcadın.", 30);
  }

  return state;
}

function AvatarModel({ outfit, scale = 1 }: { outfit: OutfitId; scale?: number }) {
  const selected = outfitCards.find((item) => item.id === outfit) ?? outfitCards[0];
  return (
    <group scale={[scale, scale, scale]}>
      <mesh receiveShadow position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.32, 0.22, 0.01]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshStandardMaterial color="#1b2420" transparent opacity={0.18} />
      </mesh>
      <mesh castShadow position={[-0.08, 0.16, 0]} scale={[0.07, 0.28, 0.075]}>
        <boxGeometry />
        <meshStandardMaterial color={selected.pants} roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0.08, 0.16, 0]} scale={[0.07, 0.28, 0.075]}>
        <boxGeometry />
        <meshStandardMaterial color={selected.pants} roughness={0.62} />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh castShadow key={x} position={[x, 0.035, 0.045]} scale={[0.095, 0.04, 0.13]}>
          <boxGeometry />
          <meshStandardMaterial color="#f2eee5" roughness={0.52} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.48, 0]} scale={[0.28, 0.42, 0.16]}>
        <boxGeometry />
        <meshStandardMaterial color={selected.coat} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 0.49, 0.092]} scale={[0.035, 0.36, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color={selected.accent} roughness={0.58} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh castShadow key={x} position={[x, 0.49, 0.02]} rotation={[0, 0, x > 0 ? 0.18 : -0.18]} scale={[0.07, 0.34, 0.07]}>
          <boxGeometry />
          <meshStandardMaterial color={selected.coat} roughness={0.62} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.79, 0]}>
        <sphereGeometry args={[0.15, 22, 22]} />
        <meshStandardMaterial color="#e7b68b" roughness={0.52} />
      </mesh>
      <mesh castShadow position={[0, 0.89, -0.012]} scale={[1.12, 0.46, 1]}>
        <sphereGeometry args={[0.15, 18, 18]} />
        <meshStandardMaterial color="#26232d" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0.23, 0.5, -0.12]} rotation={[0, -0.16, 0]} scale={[0.1, 0.3, 0.07]}>
        <boxGeometry />
        <meshStandardMaterial color="#48594f" roughness={0.72} />
      </mesh>
    </group>
  );
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

    const cameraOffset = scene === "street" ? new Vector3(0.9, 2.35, 5.2) : new Vector3(0.55, 2.0, 4.0);
    const desired = new Vector3(playerPosition.x, 0, playerPosition.z).add(cameraOffset);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(playerPosition.x, 0.72, playerPosition.z);
  });

  return (
    <group ref={ref}>
      <AvatarModel outfit={outfit} />
      <Html center distanceFactor={7.2} position={[0, 1.16, 0]}>
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
      <color attach="background" args={["#7fd6cf"]} />
      <ambientLight intensity={0.75} />
      <directionalLight castShadow intensity={2.4} position={[4, 7, 5]} />
      <mesh receiveShadow position={[0, -8.85, 0]} scale={[8.5, 8.5, 8.5]}>
        <sphereGeometry args={[1, 96, 36]} />
        <meshStandardMaterial color="#aebbac" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[0, -0.035, 1.35]} rotation={[-Math.PI / 2, 0, 0]} scale={[12, 1.25, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#58625f" roughness={0.8} />
      </mesh>
      <mesh receiveShadow position={[0, -0.02, 0.08]} rotation={[-Math.PI / 2, 0, 0]} scale={[12, 1.65, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#e9e4d7" roughness={0.72} />
      </mesh>

      <Building label="KIRMIZI TABELA" color="#efe8dd" sign="#e51d2a" position={[0, 0, -1.65]} scale={[1.65, 2.2, 0.48]} />
      <Building label="ECZA DEPOSU" color="#ead8bd" sign="#f7f2df" position={[-4.65, 0, -0.55]} scale={[1.28, 1.35, 0.62]} />
      <Building label="SGK" color="#dce7ed" sign="#f7fbff" position={[4.45, 0, -0.75]} scale={[1.35, 1.55, 0.62]} />
      <Building label="BANKA POS" color="#dedbd0" sign="#ffffff" position={[2.7, 0, 2.72]} scale={[1.05, 1.1, 0.5]} />

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

function Building({ color, label, position, scale, sign }: { color: string; label: string; position: Vec3; scale: Vec3; sign: string }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, scale[1] / 2, 0]} scale={scale}>
        <boxGeometry />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, scale[1] + 0.11, 0.02]} scale={[scale[0] * 1.08, 0.16, scale[2] * 1.06]}>
        <boxGeometry />
        <meshStandardMaterial color="#4f5d57" roughness={0.68} />
      </mesh>
      <mesh castShadow position={[0, scale[1] * 0.78, scale[2] * 0.54]} scale={[scale[0] * 0.78, 0.24, 0.04]}>
        <boxGeometry />
        <meshStandardMaterial color={sign} roughness={0.52} />
      </mesh>
      <Text color={sign === "#e51d2a" ? "#fff" : "#203129"} fontSize={0.13} maxWidth={scale[0] * 1.2} position={[0, scale[1] * 0.78, scale[2] * 0.6]}>
        {label}
      </Text>
    </group>
  );
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
        <group key={index} position={[-1.5 - index * 0.46, 0, 1.92 - index * 0.08]} scale={[0.74, 0.74, 0.74]}>
          <AvatarModel outfit={index % 2 === 0 ? "black" : "white"} />
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
          <AvatarModel outfit={index % 2 === 0 ? "black" : "white"} />
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
  const actionLabel = game ? getActionLabel(activeTarget, game) : "";

  const startGame = () => {
    setGame(createInitialState(selectedScenario, selectedOutfit));
    setActiveTarget(null);
    setTravelIntent(null);
  };

  const resetGame = () => {
    setGame(null);
    setActiveTarget(null);
    setTravelIntent(null);
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
      </main>
    );
  }

  return (
    <main className="reboot-game">
      <Canvas camera={{ fov: 54, position: [0, 2.4, 6] }} dpr={[1, 1.7]} shadows>
        <RebootScene activeTarget={activeTarget} onTargetChange={setActiveTarget} onTravel={travelToHotspot} onTravelComplete={completeTravel} state={game} travelIntent={travelIntent} />
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
