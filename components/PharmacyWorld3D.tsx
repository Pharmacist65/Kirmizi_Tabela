"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Text } from "@react-three/drei";
import type { Group } from "three";
import { getShelfProducts } from "@/data/retailProducts";
import { roleLabels, staffTasks } from "@/data/staff";
import type { ModuleId } from "@/components/GameModules";
import type { DayPhase, GameState, InventoryCategory } from "@/game/types";

type PharmacyWorld3DProps = {
  state: GameState;
  activeModule: ModuleId;
  setupLocked: boolean;
  onSelectModule: (module: ModuleId) => void;
};

type Vec3 = [number, number, number];

const kindColors = {
  prescription: "#eef5f2",
  otc: "#f7d88c",
  dermo: "#dcefff",
  medical: "#e8e6dd"
};

const zonePositions = {
  idle: [-0.35, 0, 1.15],
  counter: [0.2, 0, 0.45],
  sgk: [3.15, 0, -1.25],
  stock: [-3.35, 0, -1.25],
  dermo: [-2.75, 0, -2.18]
} satisfies Record<string, Vec3>;

const phaseLighting: Record<DayPhase, { sky: string; ambient: number; key: number }> = {
  morning: { sky: "#f6efe2", ambient: 0.66, key: 2.2 },
  open: { sky: "#edf6fb", ambient: 0.72, key: 2.65 },
  closing: { sky: "#f7e7d7", ambient: 0.58, key: 1.75 }
};

function taskZone(taskId?: string) {
  if (!taskId) return "idle";
  if (taskId.includes("sgk") || taskId.includes("rx")) return "sgk";
  if (taskId.includes("stock")) return "stock";
  if (taskId.includes("dermo")) return "dermo";
  if (taskId.includes("counter") || taskId.includes("patient")) return "counter";
  return "idle";
}

function taskLabel(taskId?: string) {
  if (!taskId) return "Beklemede";
  return staffTasks.find((task) => task.id === taskId)?.title ?? "Görevde";
}

function textColor(background: string) {
  const hex = background.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 164 ? "#1d2924" : "#ffffff";
}

function SelectableBox({
  active,
  color,
  module,
  onSelectModule,
  position,
  scale
}: {
  active?: boolean;
  color: string;
  module: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  position: Vec3;
  scale: Vec3;
}) {
  const handleClick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelectModule(module);
  };

  return (
    <mesh castShadow receiveShadow onClick={handleClick} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} emissive={active ? "#8b1220" : "#000000"} emissiveIntensity={active ? 0.16 : 0} roughness={0.72} />
    </mesh>
  );
}

function ZoneLabel({ label, position }: { label: string; position: Vec3 }) {
  return (
    <Html center distanceFactor={8} position={position}>
      <span className="world-hotspot">{label}</span>
    </Html>
  );
}

function ProductBox({ color, label, position }: { color: string; label: string; position: Vec3 }) {
  const labelColor = textColor(color);
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.19, 0.26, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <Text
        anchorX="center"
        anchorY="middle"
        color={labelColor}
        fontSize={0.033}
        maxWidth={0.16}
        position={[0, 0.005, 0.053]}
      >
        {label}
      </Text>
    </group>
  );
}

function ShelfUnit({
  item,
  index,
  onSelectModule
}: {
  item: InventoryCategory;
  index: number;
  onSelectModule: (module: ModuleId) => void;
}) {
  const products = getShelfProducts(item.id);
  const fillRatio = Math.max(0.04, Math.min(1, item.stock / item.capacity));
  const boxCount = Math.max(1, Math.round(fillRatio * 12));
  const x = -3.9 + (index % 4) * 1.38;
  const y = 0.66 + Math.floor(index / 4) * 1.06;
  const z = -2.65;
  const handleClick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelectModule(item.kind === "prescription" ? "sgk" : "stok");
  };

  return (
    <group onClick={handleClick} position={[x, y, z]}>
      <mesh castShadow receiveShadow scale={[1.08, 0.9, 0.24]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#879188" roughness={0.8} />
      </mesh>
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[0, -0.3 + row * 0.3, 0.17]} scale={[1.16, 0.025, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f7f8f2" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: boxCount }, (_, productIndex) => {
        const product = products[productIndex % Math.max(1, products.length)];
        const row = Math.floor(productIndex / 4);
        const col = productIndex % 4;
        const label = product?.label ?? item.name;
        const color = product?.color ?? kindColors[item.kind];
        return (
          <ProductBox
            color={color}
            key={`${item.id}-${productIndex}`}
            label={label}
            position={[-0.39 + col * 0.26, -0.28 + row * 0.3, 0.32]}
          />
        );
      })}
      <Text anchorX="center" anchorY="middle" color="#213028" fontSize={0.075} maxWidth={1} position={[0, 0.55, 0.33]}>
        {item.name}
      </Text>
    </group>
  );
}

function StaffAvatar({ index, name, role, taskId }: { index: number; name: string; role: string; taskId?: string }) {
  const ref = useRef<Group>(null);
  const zone = taskZone(taskId);
  const base = zonePositions[zone];
  const spread: Vec3 = [base[0] + index * 0.2, base[1], base[2] + (index % 2) * 0.24];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 2.6 + index) * 0.025;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.8 + index) * 0.08;
  });

  return (
    <group ref={ref} position={spread}>
      <mesh castShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.48, 12]} />
        <meshStandardMaterial color={zone === "sgk" ? "#315f93" : zone === "stock" ? "#5e765f" : "#b11e2b"} roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.14, 18, 18]} />
        <meshStandardMaterial color="#e7b68b" roughness={0.55} />
      </mesh>
      <Text anchorX="center" anchorY="middle" color="#ffffff" fontSize={0.11} position={[0, 0.35, 0.145]}>
        {name.slice(0, 1)}
      </Text>
      <Html center distanceFactor={9} position={[0, 0.95, 0]}>
        <span className="world-person-label">
          {role} · {taskLabel(taskId)}
        </span>
      </Html>
    </group>
  );
}

function CustomerAvatar({ index, impatient }: { index: number; impatient: boolean }) {
  const ref = useRef<Group>(null);
  const x = -1.35 + index * 0.3;
  const z = 2.35 + index * 0.11;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 3 + index * 0.7) * 0.025;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.2 + index) * 0.16;
  });

  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.44, 12]} />
        <meshStandardMaterial color={impatient ? "#c55336" : "#2f7a83"} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.61, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#e4b58c" roughness={0.58} />
      </mesh>
    </group>
  );
}

function CustomerQueue({ state }: { state: GameState }) {
  const missed = state.lastDayReport?.missedUnits ?? 0;
  const queueCount = state.setupCompleted ? Math.min(9, Math.max(2, Math.round(state.traffic / 18) + Math.floor(missed / 5))) : 0;

  return (
    <group>
      {Array.from({ length: queueCount }, (_, index) => (
        <CustomerAvatar impatient={index >= queueCount - Math.min(3, missed)} index={index} key={index} />
      ))}
    </group>
  );
}

function DeliveryScooter({ activeModule, onSelectModule }: { activeModule: ModuleId; onSelectModule: (module: ModuleId) => void }) {
  const handleClick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelectModule("depo");
  };

  return (
    <group onClick={handleClick} position={[-4.4, 0, 2.82]} rotation={[0, 0.18, 0]}>
      <mesh castShadow position={[0, 0.25, 0]} scale={[0.64, 0.28, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={activeModule === "depo" ? "#b21f2d" : "#ded7c7"} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0.54, 0.18, 0.18]}>
        <torusGeometry args={[0.14, 0.035, 10, 22]} />
        <meshStandardMaterial color="#202320" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.54, 0.18, 0.18]}>
        <torusGeometry args={[0.14, 0.035, 10, 22]} />
        <meshStandardMaterial color="#202320" roughness={0.5} />
      </mesh>
      <Text anchorX="center" anchorY="middle" color="#7e1420" fontSize={0.14} position={[0, 0.42, 0.16]}>
        DEPO
      </Text>
    </group>
  );
}

function StoreShell({
  activeModule,
  onSelectModule,
  state
}: {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  state: GameState;
}) {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[9.4, 0.04, 6.9]} />
        <meshStandardMaterial color="#e4e6dc" roughness={0.84} />
      </mesh>
      <mesh receiveShadow position={[0, 1.25, -3.18]}>
        <boxGeometry args={[9.4, 2.5, 0.16]} />
        <meshStandardMaterial color="#f8f7ef" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[-4.66, 1, 0]}>
        <boxGeometry args={[0.16, 2, 6.9]} />
        <meshStandardMaterial color="#ece6dd" roughness={0.78} />
      </mesh>
      <mesh position={[0, 2.55, -3.02]} scale={[3.2, 0.42, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e51823" emissive="#a0121b" emissiveIntensity={0.28} roughness={0.46} />
      </mesh>
      <Text anchorX="center" anchorY="middle" color="#ffffff" fontSize={0.34} position={[0, 2.56, -2.93]}>
        {state.pharmacyName || "KIRMIZI TABELA"}
      </Text>
      <mesh position={[4.44, 1.35, -1.4]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1, 0.9, 0.12]} />
        <meshStandardMaterial color="#e51823" emissive="#e51823" emissiveIntensity={0.38} roughness={0.4} />
      </mesh>
      <Text anchorX="center" anchorY="middle" color="#ffffff" fontSize={0.62} position={[4.35, 1.35, -1.4]} rotation={[0, -Math.PI / 2, 0]}>
        E
      </Text>
      {state.inventory.map((item, index) => (
        <ShelfUnit item={item} index={index} key={item.id} onSelectModule={onSelectModule} />
      ))}
      <SelectableBox active={activeModule === "eczane"} color="#cfd6ce" module="eczane" onSelectModule={onSelectModule} position={[0, 0.42, 0.05]} scale={[2.55, 0.72, 0.75]} />
      <Text anchorX="center" anchorY="middle" color="#27322a" fontSize={0.16} position={[0, 0.86, 0.46]}>
        BANKO
      </Text>
      <SelectableBox active={activeModule === "sgk"} color="#e4eef7" module="sgk" onSelectModule={onSelectModule} position={[3.25, 0.42, -1.32]} scale={[1.15, 0.72, 0.72]} />
      <SelectableBox active={activeModule === "finans"} color="#ede3c7" module="finans" onSelectModule={onSelectModule} position={[1.65, 0.55, 0.68]} scale={[0.52, 0.32, 0.38]} />
      <SelectableBox active={activeModule === "pazar"} color="#dde9e2" module="pazar" onSelectModule={onSelectModule} position={[3.35, 0.34, 1.35]} scale={[1.12, 0.58, 0.62]} />
      <SelectableBox active={activeModule === "personel"} color="#f1d8d7" module="personel" onSelectModule={onSelectModule} position={[-1.9, 0.08, 0.72]} scale={[1.3, 0.05, 0.7]} />
      <ZoneLabel label="Raflar" position={[-2.05, 2.12, -2.32]} />
      <ZoneLabel label="Banko" position={[0, 1.25, 0.62]} />
      <ZoneLabel label="SGK" position={[3.25, 1.1, -1.05]} />
      <ZoneLabel label="Finans" position={[1.65, 1.03, 0.88]} />
      <DeliveryScooter activeModule={activeModule} onSelectModule={onSelectModule} />
    </group>
  );
}

function PharmacyScene({
  activeModule,
  onSelectModule,
  setupLocked,
  state
}: {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  setupLocked: boolean;
  state: GameState;
}) {
  const lighting = phaseLighting[state.dayPhase];
  const staff = useMemo(() => state.staff.slice(0, 6), [state.staff]);

  return (
    <>
      <color args={[lighting.sky]} attach="background" />
      <ambientLight intensity={lighting.ambient} />
      <directionalLight castShadow intensity={lighting.key} position={[4.5, 8, 5.5]} shadow-mapSize={[1024, 1024]} />
      <pointLight color="#e51823" intensity={1.3} position={[0, 2.72, -2.4]} />
      <StoreShell activeModule={activeModule} onSelectModule={onSelectModule} state={state} />
      {!setupLocked && <CustomerQueue state={state} />}
      {staff.map((person, index) => (
        <StaffAvatar
          index={index}
          key={person.id}
          name={person.name}
          role={roleLabels[person.role]}
          taskId={person.assignedTaskId}
        />
      ))}
      <OrbitControls
        enableDamping
        enablePan={false}
        maxDistance={11}
        maxPolarAngle={Math.PI / 2.45}
        minDistance={7.2}
        minPolarAngle={Math.PI / 4.7}
        target={[0, 0.65, -0.35]}
      />
    </>
  );
}

export function PharmacyWorld3D({ activeModule, onSelectModule, setupLocked, state }: PharmacyWorld3DProps) {
  const report = state.lastDayReport;
  const sold = report?.soldUnits ?? 0;
  const missed = report?.missedUnits ?? 0;

  return (
    <section className="pharmacy-world">
      <Canvas camera={{ fov: 42, position: [6.8, 5.7, 7.4] }} dpr={[1, 1.7]} shadows>
        <Suspense fallback={null}>
          <PharmacyScene activeModule={activeModule} onSelectModule={onSelectModule} setupLocked={setupLocked} state={state} />
        </Suspense>
      </Canvas>
      <div className="world-readout">
        <span>{state.timeLabel}</span>
        <span>{setupLocked ? "Açılış hazırlığı" : `${sold} satış · ${missed} kaçan`}</span>
        <span>{state.locationName}</span>
      </div>
    </section>
  );
}
