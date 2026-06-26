"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Text } from "@react-three/drei";
import type { Group } from "three";
import { getShelfProducts } from "@/data/retailProducts";
import { roleLabels, staffTasks } from "@/data/staff";
import type { ModuleId } from "@/components/GameModules";
import type { DayPhase, GameState, InventoryCategory, LocationType, StaffRole } from "@/game/types";

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
  idle: [-0.55, 0, 1.34],
  counter: [0.1, 0, 0.68],
  sgk: [3.65, 0, -1.25],
  stock: [-4.05, 0, -1.42],
  dermo: [-3.36, 0, -2.34]
} satisfies Record<string, Vec3>;

const phaseLighting: Record<DayPhase, { sky: string; ambient: number; key: number }> = {
  morning: { sky: "#91d7cf", ambient: 0.74, key: 2.45 },
  open: { sky: "#a8dfd8", ambient: 0.78, key: 2.75 },
  closing: { sky: "#f0cda9", ambient: 0.64, key: 1.95 }
};

const skinTones = ["#e7b68b", "#d59b70", "#f0c49c", "#bc7f5c"];
const hairColors = ["#2a211e", "#4a3328", "#6b4b36", "#20242b"];
const customerColors = ["#2f7a83", "#315f93", "#6f5b94", "#b87520", "#5e765f", "#8d4b55"];
const staffUniformColors: Record<StaffRole, string> = {
  pharmacist: "#b11e2b",
  technician: "#287a83",
  sgk: "#315f93",
  dermo: "#8a6a46",
  cashier: "#6f5b94",
  stock: "#5e765f"
};

type DioramaLandmark = {
  color: string;
  label: string;
  position: Vec3;
  scale: Vec3;
  module?: ModuleId;
};

type DioramaPreset = {
  groundColor: string;
  roadColor: string;
  roadPosition: Vec3;
  roadScale: Vec3;
  roadRotation?: Vec3;
  sgk: DioramaLandmark;
  depot: DioramaLandmark;
  context: DioramaLandmark[];
  trees: { position: Vec3; scale?: number }[];
  water?: { position: Vec3; scale: Vec3; color: string };
};

const dioramaPresets: Record<LocationType, DioramaPreset> = {
  neighborhood: {
    groundColor: "#6f8f75",
    roadColor: "#59625e",
    roadPosition: [-1.8, -0.08, 4.08],
    roadScale: [11.6, 0.035, 0.48],
    sgk: { color: "#dceaf3", label: "SGK Kurumu", module: "sgk", position: [6.25, 0.48, -2.9], scale: [0.82, 0.96, 0.64] },
    depot: { color: "#eadfca", label: "Ecza Deposu", module: "depo", position: [-6.18, 0.36, 2.52], scale: [0.9, 0.68, 0.78] },
    context: [
      { color: "#f4efe3", label: "Apartman", position: [-6.08, 0.46, -2.4], scale: [0.72, 0.92, 0.62] },
      { color: "#ecf3e8", label: "Aile Sağlığı", position: [3.95, 0.38, -4.18], scale: [0.82, 0.76, 0.58] },
      { color: "#f8e8dd", label: "Pastane", position: [-3.8, 0.32, 4.55], scale: [0.62, 0.54, 0.5] }
    ],
    trees: [
      { position: [-4.7, 0, -3.55], scale: 0.9 },
      { position: [4.72, 0, -3.45], scale: 0.82 },
      { position: [-3.65, 0, 3.55], scale: 0.72 },
      { position: [4.72, 0, 2.72], scale: 0.68 }
    ]
  },
  hospital: {
    groundColor: "#76877d",
    roadColor: "#4f5855",
    roadPosition: [-0.2, -0.08, 4.16],
    roadScale: [12.6, 0.035, 0.62],
    sgk: { color: "#dceaf3", label: "SGK Teslim", module: "sgk", position: [5.95, 0.5, -2.86], scale: [0.86, 1.0, 0.64] },
    depot: { color: "#e6d4bd", label: "Nöbetçi Depo", module: "depo", position: [-6.2, 0.38, 2.75], scale: [0.92, 0.72, 0.82] },
    context: [
      { color: "#f7ecec", label: "Hastane", position: [3.55, 0.62, -4.38], scale: [1.28, 1.24, 0.72] },
      { color: "#e6edf2", label: "Poliklinik", position: [-5.84, 0.48, -2.92], scale: [0.82, 0.96, 0.58] },
      { color: "#fff4dd", label: "Taksi", position: [-4.4, 0.2, 4.52], scale: [0.52, 0.22, 0.32] }
    ],
    trees: [
      { position: [-4.65, 0, -3.7], scale: 0.62 },
      { position: [5.0, 0, -3.75], scale: 0.58 },
      { position: [4.88, 0, 2.84], scale: 0.52 }
    ]
  },
  avenue: {
    groundColor: "#82907f",
    roadColor: "#424a48",
    roadPosition: [-0.4, -0.08, 4.18],
    roadScale: [13.0, 0.035, 0.7],
    sgk: { color: "#dceaf3", label: "SGK Ofisi", module: "sgk", position: [6.14, 0.44, -2.55], scale: [0.78, 0.88, 0.58] },
    depot: { color: "#eadfca", label: "Şehir Deposu", module: "depo", position: [-6.2, 0.38, 2.8], scale: [0.92, 0.72, 0.82] },
    context: [
      { color: "#f9e8ee", label: "Dermo Mağaza", position: [4.2, 0.42, -4.25], scale: [0.92, 0.84, 0.56] },
      { color: "#e9edf5", label: "Banka", position: [-5.92, 0.42, -2.55], scale: [0.8, 0.84, 0.58] },
      { color: "#f3eddd", label: "Kafe", position: [-3.55, 0.28, 4.6], scale: [0.68, 0.48, 0.46] }
    ],
    trees: [
      { position: [-4.6, 0, -3.6], scale: 0.58 },
      { position: [-2.8, 0, 4.56], scale: 0.46 },
      { position: [2.4, 0, 4.52], scale: 0.46 },
      { position: [4.8, 0, 2.65], scale: 0.5 }
    ]
  },
  mall: {
    groundColor: "#858b88",
    roadColor: "#525b58",
    roadPosition: [-0.1, -0.08, 4.22],
    roadScale: [12.4, 0.035, 0.82],
    sgk: { color: "#dceaf3", label: "SGK Ofisi", module: "sgk", position: [6.1, 0.42, -2.72], scale: [0.78, 0.84, 0.58] },
    depot: { color: "#e5dccb", label: "AVM Mal Kabul", module: "depo", position: [-6.14, 0.36, 2.78], scale: [0.98, 0.68, 0.78] },
    context: [
      { color: "#e9edf2", label: "AVM", position: [3.62, 0.64, -4.34], scale: [1.38, 1.28, 0.74] },
      { color: "#f6f2e8", label: "Otopark", position: [-5.92, 0.24, -2.7], scale: [1.0, 0.48, 0.62] },
      { color: "#f7e6ea", label: "Plaza", position: [-3.9, 0.48, 4.6], scale: [0.72, 0.96, 0.48] }
    ],
    trees: [
      { position: [5.0, 0, 2.72], scale: 0.5 },
      { position: [-4.86, 0, 3.62], scale: 0.48 }
    ]
  },
  rural: {
    groundColor: "#7e9b66",
    roadColor: "#746b58",
    roadPosition: [-1.2, -0.08, 4.05],
    roadScale: [10.8, 0.035, 0.38],
    sgk: { color: "#dceaf3", label: "İlçe SGK", module: "sgk", position: [5.72, 0.4, -2.9], scale: [0.7, 0.8, 0.56] },
    depot: { color: "#d9c8a7", label: "Uzak Depo", module: "depo", position: [-6.05, 0.32, 2.52], scale: [0.82, 0.58, 0.68] },
    context: [
      { color: "#f2ead9", label: "İlçe Meydanı", position: [-5.72, 0.32, -2.5], scale: [0.76, 0.64, 0.58] },
      { color: "#e8f0dc", label: "ASM", position: [3.88, 0.32, -4.1], scale: [0.7, 0.64, 0.52] },
      { color: "#d5b875", label: "Tarla", position: [-3.8, 0.12, 4.5], scale: [0.9, 0.18, 0.56] }
    ],
    trees: [
      { position: [-4.8, 0, -3.5], scale: 1.05 },
      { position: [4.9, 0, -3.5], scale: 1.0 },
      { position: [-2.8, 0, 3.6], scale: 0.9 },
      { position: [3.1, 0, 3.68], scale: 0.82 }
    ]
  },
  touristic: {
    groundColor: "#85a982",
    roadColor: "#5c625c",
    roadPosition: [-0.8, -0.08, 4.08],
    roadScale: [11.2, 0.035, 0.46],
    sgk: { color: "#dceaf3", label: "SGK Noktası", module: "sgk", position: [5.9, 0.4, -2.88], scale: [0.74, 0.8, 0.56] },
    depot: { color: "#eadfca", label: "Sezon Deposu", module: "depo", position: [-6.06, 0.34, 2.62], scale: [0.86, 0.64, 0.72] },
    context: [
      { color: "#f7efe5", label: "Otel", position: [3.8, 0.52, -4.28], scale: [1.0, 1.04, 0.62] },
      { color: "#fff0c8", label: "Sahil", position: [-5.72, 0.22, -2.55], scale: [0.92, 0.42, 0.58] },
      { color: "#f5e6e2", label: "Pazar", position: [-3.75, 0.26, 4.54], scale: [0.72, 0.44, 0.46] }
    ],
    trees: [
      { position: [-4.8, 0, -3.48], scale: 0.75 },
      { position: [4.86, 0, -3.55], scale: 0.68 },
      { position: [3.2, 0, 3.68], scale: 0.62 }
    ],
    water: { position: [6.2, -0.16, 1.55], scale: [1.85, 0.04, 2.5], color: "#69c6cb" }
  },
  university: {
    groundColor: "#79927c",
    roadColor: "#53605b",
    roadPosition: [-0.7, -0.08, 4.08],
    roadScale: [11.6, 0.035, 0.5],
    sgk: { color: "#dceaf3", label: "SGK Ofisi", module: "sgk", position: [5.96, 0.42, -2.74], scale: [0.74, 0.84, 0.56] },
    depot: { color: "#eadfca", label: "Şehir Deposu", module: "depo", position: [-6.08, 0.36, 2.72], scale: [0.86, 0.68, 0.72] },
    context: [
      { color: "#e8edf7", label: "Kampüs", position: [3.72, 0.52, -4.26], scale: [1.0, 1.04, 0.62] },
      { color: "#f6eee1", label: "Yurt", position: [-5.84, 0.46, -2.55], scale: [0.74, 0.92, 0.58] },
      { color: "#f7e7dd", label: "Kafe", position: [-3.75, 0.28, 4.58], scale: [0.68, 0.48, 0.44] }
    ],
    trees: [
      { position: [-4.8, 0, -3.52], scale: 0.86 },
      { position: [4.82, 0, -3.58], scale: 0.8 },
      { position: [3.2, 0, 3.72], scale: 0.72 }
    ]
  },
  industrial: {
    groundColor: "#788176",
    roadColor: "#454f4b",
    roadPosition: [-0.4, -0.08, 4.18],
    roadScale: [12.6, 0.035, 0.62],
    sgk: { color: "#dceaf3", label: "SGK Ofisi", module: "sgk", position: [6.0, 0.42, -2.78], scale: [0.74, 0.84, 0.58] },
    depot: { color: "#d6c5ac", label: "Sanayi Deposu", module: "depo", position: [-6.12, 0.38, 2.78], scale: [0.96, 0.72, 0.82] },
    context: [
      { color: "#d7ddd9", label: "Sanayi", position: [3.82, 0.48, -4.2], scale: [1.05, 0.96, 0.62] },
      { color: "#ece4d8", label: "İş Merkezi", position: [-5.9, 0.46, -2.65], scale: [0.8, 0.92, 0.58] },
      { color: "#f0dfce", label: "Lokanta", position: [-3.62, 0.28, 4.58], scale: [0.7, 0.48, 0.44] }
    ],
    trees: [
      { position: [4.86, 0, 2.7], scale: 0.52 },
      { position: [-4.72, 0, -3.5], scale: 0.54 }
    ]
  }
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
  if (!taskId) return "Hazır";
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
        <boxGeometry args={[0.22, 0.3, 0.11]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <Text
        anchorX="center"
        anchorY="middle"
        color={labelColor}
        fontSize={0.036}
        maxWidth={0.18}
        position={[0, 0.006, 0.06]}
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
  const x = -4.28 + (index % 4) * 1.58;
  const y = 0.78 + Math.floor(index / 4) * 1.18;
  const z = -3.0;
  const handleClick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelectModule(item.kind === "prescription" ? "sgk" : "stok");
  };

  return (
    <group onClick={handleClick} position={[x, y, z]}>
      <mesh castShadow receiveShadow scale={[1.28, 1.04, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#879188" roughness={0.8} />
      </mesh>
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[0, -0.34 + row * 0.34, 0.21]} scale={[1.38, 0.025, 0.14]}>
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
            position={[-0.48 + col * 0.32, -0.31 + row * 0.34, 0.38]}
          />
        );
      })}
      <Text anchorX="center" anchorY="middle" color="#213028" fontSize={0.085} maxWidth={1.12} position={[0, 0.64, 0.39]}>
        {item.name}
      </Text>
    </group>
  );
}

function AvatarLimb({
  color,
  position,
  rotation = [0, 0, 0],
  scale
}: {
  color: string;
  position: Vec3;
  rotation?: Vec3;
  scale: Vec3;
}) {
  return (
    <mesh castShadow position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.62} />
    </mesh>
  );
}

function HumanoidAvatar({
  accentColor,
  bodyColor,
  hairColor,
  impatient,
  initial,
  jacket,
  label,
  labelOffset,
  roleBadge,
  skinTone
}: {
  accentColor?: string;
  bodyColor: string;
  hairColor: string;
  impatient?: boolean;
  initial?: string;
  jacket?: boolean;
  label?: string;
  labelOffset?: Vec3;
  roleBadge?: string;
  skinTone: string;
}) {
  const shoeColor = "#263028";
  const legColor = jacket ? "#233047" : "#27343f";

  return (
    <group>
      <mesh receiveShadow position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.26, 0.16, 0.01]}>
        <cylinderGeometry args={[1, 1, 1, 28]} />
        <meshStandardMaterial color="#1a241f" transparent opacity={0.22} roughness={1} />
      </mesh>

      <AvatarLimb color={legColor} position={[-0.065, 0.18, 0]} scale={[0.07, 0.28, 0.075]} />
      <AvatarLimb color={legColor} position={[0.065, 0.18, 0]} scale={[0.07, 0.28, 0.075]} />
      <AvatarLimb color={shoeColor} position={[-0.065, 0.035, 0.035]} scale={[0.09, 0.04, 0.13]} />
      <AvatarLimb color={shoeColor} position={[0.065, 0.035, 0.035]} scale={[0.09, 0.04, 0.13]} />

      <mesh castShadow position={[0, 0.48, 0]} scale={[0.28, 0.42, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={bodyColor} roughness={0.58} />
      </mesh>

      {jacket && (
        <>
          <AvatarLimb color="#f6f8f4" position={[-0.075, 0.49, 0.086]} scale={[0.115, 0.4, 0.025]} />
          <AvatarLimb color="#f6f8f4" position={[0.075, 0.49, 0.086]} scale={[0.115, 0.4, 0.025]} />
          <AvatarLimb color={accentColor ?? "#b11e2b"} position={[0, 0.5, 0.104]} scale={[0.025, 0.36, 0.02]} />
        </>
      )}

      <AvatarLimb color={bodyColor} position={[-0.215, 0.49, 0.02]} rotation={[0, 0, -0.18]} scale={[0.07, 0.34, 0.07]} />
      <AvatarLimb color={bodyColor} position={[0.215, 0.49, 0.02]} rotation={[0, 0, 0.18]} scale={[0.07, 0.34, 0.07]} />
      <mesh castShadow position={[-0.235, 0.29, 0.025]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color={skinTone} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0.235, 0.29, 0.025]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color={skinTone} roughness={0.58} />
      </mesh>

      <mesh castShadow position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshStandardMaterial color={skinTone} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.87, -0.012]} scale={[1.05, 0.46, 0.96]}>
        <sphereGeometry args={[0.15, 18, 18]} />
        <meshStandardMaterial color={hairColor} roughness={0.72} />
      </mesh>

      {initial && (
        <Text anchorX="center" anchorY="middle" color={jacket ? "#1f2f26" : "#ffffff"} fontSize={0.095} position={[0, 0.51, 0.176]}>
          {initial}
        </Text>
      )}

      {!jacket && (
        <mesh castShadow position={[0.2, 0.42, -0.055]} rotation={[0, 0.18, 0]} scale={[0.12, 0.18, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={accentColor ?? "#ede3c7"} roughness={0.64} />
        </mesh>
      )}

      {impatient && (
        <Text anchorX="center" anchorY="middle" color="#b21f2d" fontSize={0.13} position={[0.19, 1.02, 0]}>
          !
        </Text>
      )}

      {roleBadge && (
        <Text anchorX="center" anchorY="middle" color="#ffffff" fontSize={0.052} maxWidth={0.34} position={[0, 0.26, 0.115]}>
          {roleBadge}
        </Text>
      )}

      {label && (
        <Html center distanceFactor={8.4} position={labelOffset ?? [0, 1.12, 0]}>
          <span className="world-person-label">{label}</span>
        </Html>
      )}
    </group>
  );
}

function StaffAvatar({
  index,
  name,
  role,
  roleLabel,
  taskId
}: {
  index: number;
  name: string;
  role: StaffRole;
  roleLabel: string;
  taskId?: string;
}) {
  const ref = useRef<Group>(null);
  const zone = taskZone(taskId);
  const base = zonePositions[zone];
  const spread: Vec3 = [base[0] + index * 0.24, base[1], base[2] + (index % 2) * 0.25];
  const bodyColor = staffUniformColors[role] ?? "#b11e2b";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 2.6 + index) * 0.025;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.8 + index) * 0.08;
  });

  return (
    <group ref={ref} position={spread}>
      <HumanoidAvatar
        accentColor={bodyColor}
        bodyColor={bodyColor}
        hairColor={hairColors[index % hairColors.length]}
        initial={name.slice(0, 1)}
        jacket
        label={`${roleLabel} · ${taskLabel(taskId)}`}
        labelOffset={[0, 1.12 + (index % 2) * 0.16, 0]}
        roleBadge={zone === "sgk" ? "SGK" : zone === "stock" ? "STOK" : "BANKO"}
        skinTone={skinTones[index % skinTones.length]}
      />
    </group>
  );
}

function CustomerAvatar({ index, impatient }: { index: number; impatient: boolean }) {
  const ref = useRef<Group>(null);
  const x = -1.8 + index * 0.36;
  const z = 2.28 + (index % 2) * 0.18 + Math.floor(index / 2) * 0.1;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 3 + index * 0.7) * 0.025;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.2 + index) * 0.16;
  });

  return (
    <group ref={ref} position={[x, 0, z]}>
      <HumanoidAvatar
        accentColor="#ede3c7"
        bodyColor={impatient ? "#c55336" : customerColors[index % customerColors.length]}
        hairColor={hairColors[(index + 2) % hairColors.length]}
        impatient={impatient}
        skinTone={skinTones[(index + 1) % skinTones.length]}
      />
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

function DeliveryScooter({
  activeModule,
  onSelectModule,
  position = [-5.05, 0, 3.14]
}: {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  position?: Vec3;
}) {
  const handleClick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelectModule("depo");
  };

  return (
    <group onClick={handleClick} position={position} rotation={[0, 0.18, 0]}>
      <mesh castShadow position={[0, 0.25, 0]} scale={[0.58, 0.24, 0.24]}>
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

function DioramaTree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.045, 0.065, 0.36, 8]} />
        <meshStandardMaterial color="#7b5d3e" roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 0.47, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#3f8f5e" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0.09, 0.58, -0.04]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#2f7d5c" roughness={0.72} />
      </mesh>
    </group>
  );
}

function DioramaBuilding({
  active,
  color,
  label,
  module,
  onSelectModule,
  position,
  scale
}: {
  active?: boolean;
  color: string;
  label: string;
  module?: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  position: Vec3;
  scale: Vec3;
}) {
  const handleClick = (event: ThreeEvent<PointerEvent>) => {
    if (!module) return;
    event.stopPropagation();
    onSelectModule(module);
  };

  return (
    <group onClick={handleClick} position={position}>
      <mesh castShadow receiveShadow scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} emissive={active ? "#7e1420" : "#000000"} emissiveIntensity={active ? 0.12 : 0} roughness={0.68} />
      </mesh>
      <mesh castShadow position={[0, scale[1] * 0.54, 0]} scale={[scale[0] * 1.08, 0.08, scale[2] * 1.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f6f3e8" roughness={0.7} />
      </mesh>
      {[-0.22, 0, 0.22].map((x) => (
        <mesh key={x} position={[x * scale[0], 0.08, scale[2] * 0.51]} scale={[0.08, 0.1, 0.012]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#dbe9e6" roughness={0.35} />
        </mesh>
      ))}
      <Text anchorX="center" anchorY="middle" color="#223029" fontSize={0.12} maxWidth={scale[0] * 0.9} position={[0, scale[1] + 0.16, scale[2] * 0.52]}>
        {label}
      </Text>
    </group>
  );
}

function DistrictDiorama({
  activeModule,
  locationType,
  onSelectModule
}: {
  activeModule: ModuleId;
  locationType: LocationType;
  onSelectModule: (module: ModuleId) => void;
}) {
  const preset = dioramaPresets[locationType] ?? dioramaPresets.neighborhood;
  const roadMarks = [-3.8, -2.4, -1, 0.4, 1.8, 3.2];
  const visibleDepot = { ...preset.depot, position: [-2.55, 0.36, 2.92] as Vec3 };
  const visibleSgk = { ...preset.sgk, position: [3.55, 0.44, 2.42] as Vec3 };
  const scooterPosition: Vec3 = [visibleDepot.position[0] + 0.66, 0, visibleDepot.position[2] - 0.28];

  return (
    <group>
      <mesh receiveShadow position={[0, -0.19, 0.35]} rotation={[0, Math.PI / 10, 0]} scale={[7.2, 0.16, 5.25]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshStandardMaterial color={preset.groundColor} roughness={0.88} />
      </mesh>
      {preset.water && (
        <mesh receiveShadow position={preset.water.position} scale={preset.water.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={preset.water.color} roughness={0.48} transparent opacity={0.82} />
        </mesh>
      )}
      <mesh receiveShadow position={preset.roadPosition} rotation={preset.roadRotation ?? [0, 0, 0]} scale={preset.roadScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={preset.roadColor} roughness={0.82} />
      </mesh>
      {roadMarks.map((x) => (
        <mesh key={x} position={[preset.roadPosition[0] + x, -0.055, preset.roadPosition[2]]} scale={[0.36, 0.012, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f7f1d2" roughness={0.5} />
        </mesh>
      ))}
      <DioramaBuilding
        active={activeModule === "sgk"}
        color={visibleSgk.color}
        label={visibleSgk.label}
        module="sgk"
        onSelectModule={onSelectModule}
        position={visibleSgk.position}
        scale={visibleSgk.scale}
      />
      <DioramaBuilding
        active={activeModule === "depo"}
        color={visibleDepot.color}
        label={visibleDepot.label}
        module="depo"
        onSelectModule={onSelectModule}
        position={visibleDepot.position}
        scale={visibleDepot.scale}
      />
      {preset.context.map((item) => (
        <DioramaBuilding
          color={item.color}
          key={item.label}
          label={item.label}
          module={item.module}
          onSelectModule={onSelectModule}
          position={item.position}
          scale={item.scale}
        />
      ))}
      {preset.trees.map((tree, index) => (
        <DioramaTree key={`${tree.position.join("-")}-${index}`} position={tree.position} scale={tree.scale} />
      ))}
      <DeliveryScooter activeModule={activeModule} onSelectModule={onSelectModule} position={scooterPosition} />
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
  const facadeName = (state.pharmacyName || "Kırmızı Tabela").replace(/\s+Eczanesi$/i, "");
  const signText = facadeName.length > 22 ? "ECZANE" : facadeName;

  return (
    <group>
      <DistrictDiorama activeModule={activeModule} locationType={state.locationType} onSelectModule={onSelectModule} />
      <mesh receiveShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[10.9, 0.04, 7.7]} />
        <meshStandardMaterial color="#e7eadf" roughness={0.84} />
      </mesh>
      <mesh receiveShadow position={[0, 1.12, -3.64]}>
        <boxGeometry args={[10.9, 2.24, 0.16]} />
        <meshStandardMaterial color="#fbf8ed" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[-5.38, 0.92, 0]}>
        <boxGeometry args={[0.16, 1.84, 7.7]} />
        <meshStandardMaterial color="#ece6dd" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[5.38, 0.92, -1.02]}>
        <boxGeometry args={[0.16, 1.84, 5.25]} />
        <meshStandardMaterial color="#eef2ec" roughness={0.78} />
      </mesh>
      <mesh position={[0, 2.48, -3.48]} scale={[3.05, 0.38, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e51823" emissive="#a0121b" emissiveIntensity={0.28} roughness={0.46} />
      </mesh>
      <Text anchorX="center" anchorY="middle" color="#ffffff" fontSize={0.23} maxWidth={2.78} position={[0, 2.49, -3.39]}>
        {signText}
      </Text>
      <mesh position={[5.06, 1.55, -1.62]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1, 0.9, 0.12]} />
        <meshStandardMaterial color="#e51823" emissive="#e51823" emissiveIntensity={0.38} roughness={0.4} />
      </mesh>
      <Text anchorX="center" anchorY="middle" color="#ffffff" fontSize={0.62} position={[4.97, 1.55, -1.62]} rotation={[0, -Math.PI / 2, 0]}>
        E
      </Text>
      {state.inventory.map((item, index) => (
        <ShelfUnit item={item} index={index} key={item.id} onSelectModule={onSelectModule} />
      ))}
      <SelectableBox active={activeModule === "eczane"} color="#cfd6ce" module="eczane" onSelectModule={onSelectModule} position={[0.12, 0.48, 0.16]} scale={[3.22, 0.86, 0.94]} />
      <Text anchorX="center" anchorY="middle" color="#27322a" fontSize={0.18} position={[0.12, 0.99, 0.65]}>
        BANKO
      </Text>
      <SelectableBox active={activeModule === "sgk"} color="#e4eef7" module="sgk" onSelectModule={onSelectModule} position={[3.68, 0.48, -1.2]} scale={[1.34, 0.86, 0.88]} />
      <SelectableBox active={activeModule === "finans"} color="#ede3c7" module="finans" onSelectModule={onSelectModule} position={[1.95, 0.55, 0.88]} scale={[0.62, 0.34, 0.44]} />
      <SelectableBox active={activeModule === "pazar"} color="#dde9e2" module="pazar" onSelectModule={onSelectModule} position={[3.72, 0.36, 1.58]} scale={[1.22, 0.62, 0.68]} />
      <SelectableBox active={activeModule === "personel"} color="#f1d8d7" module="personel" onSelectModule={onSelectModule} position={[-2.25, 0.08, 0.9]} scale={[1.5, 0.05, 0.78]} />
      <ZoneLabel label="Raflar" position={[-2.22, 2.38, -2.72]} />
      <ZoneLabel label="Banko" position={[0.12, 1.42, 0.8]} />
      <ZoneLabel label="SGK dosya" position={[3.68, 1.24, -0.95]} />
      <ZoneLabel label="Finans" position={[1.95, 1.05, 1.12]} />
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
      <pointLight color="#f4d36f" intensity={0.75} position={[-4.6, 1.3, 3.6]} />
      <StoreShell activeModule={activeModule} onSelectModule={onSelectModule} state={state} />
      {!setupLocked && <CustomerQueue state={state} />}
      {staff.map((person, index) => (
        <StaffAvatar
          index={index}
          key={person.id}
          name={person.name}
          role={person.role}
          roleLabel={roleLabels[person.role]}
          taskId={person.assignedTaskId}
        />
      ))}
      <OrbitControls
        enableDamping
        enablePan={false}
        maxDistance={10.5}
        maxPolarAngle={Math.PI / 2.45}
        minDistance={6.1}
        minPolarAngle={Math.PI / 5}
        target={[-0.12, 0.78, -0.25]}
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
      <Canvas camera={{ fov: 40, position: [6.6, 5.35, 7.15] }} dpr={[1, 1.7]} shadows>
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
