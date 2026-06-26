import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const outDir = path.join(process.cwd(), "public", "assets", "game", "models");

globalThis.FileReader ??= class NodeFileReader {
  result = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer()
      .then((buffer) => {
        this.result = buffer;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.onerror?.(error);
      });
  }
};

function material(color, extra = {}) {
  return new MeshStandardMaterial({ color, roughness: 0.62, ...extra });
}

function box(parent, name, color, position, scale, extra = {}) {
  const mesh = new Mesh(new BoxGeometry(), material(color, extra));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, name, color, position, radiusTop, radiusBottom, height, segments = 14, extra = {}) {
  const mesh = new Mesh(new CylinderGeometry(radiusTop, radiusBottom, height, segments), material(color, extra));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(parent, name, color, position, radius, scale = [1, 1, 1], extra = {}) {
  const mesh = new Mesh(new SphereGeometry(radius, 22, 16), material(color, extra));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cone(parent, name, color, position, radius, height, segments = 16, extra = {}) {
  const mesh = new Mesh(new ConeGeometry(radius, height, segments), material(color, extra));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function assetScene(name, group) {
  const scene = new Scene();
  scene.name = name;
  scene.add(group);
  return scene;
}

function makeAvatar({ name, coat, accent, pants, hair, skin = "#e4b58d", bag = true }) {
  const g = new Group();
  g.name = name;
  cylinder(g, "shadow", "#14221d", [0, 0.012, 0], 0.36, 0.36, 0.014, 32, { transparent: true, opacity: 0.2 });
  g.getObjectByName("shadow").rotation.x = Math.PI / 2;
  for (const x of [-0.095, 0.095]) {
    cylinder(g, `leg_${x}`, pants, [x, 0.22, 0], 0.052, 0.067, 0.42);
    box(g, `shoe_${x}`, "#f3f1e8", [x, 0.035, 0.07], [0.115, 0.04, 0.17]);
  }
  cylinder(g, "torso", coat, [0, 0.56, 0], 0.18, 0.255, 0.48, 8);
  box(g, "front_trim", accent, [0, 0.57, 0.15], [0.055, 0.39, 0.018]);
  cylinder(g, "neck", "#d9a982", [0, 0.82, 0], 0.07, 0.075, 0.08, 12);
  for (const x of [-0.255, 0.255]) {
    const arm = cylinder(g, `arm_${x}`, coat, [x, 0.48, 0.01], 0.043, 0.052, 0.42, 10);
    arm.rotation.z = x > 0 ? -0.28 : 0.28;
    sphere(g, `hand_${x}`, "#d9a982", [x, 0.27, 0.03], 0.052);
  }
  sphere(g, "head", skin, [0, 0.98, 0], 0.155);
  sphere(g, "hair", hair, [0, 1.07, -0.02], 0.15, [1.08, 0.58, 0.96]);
  sphere(g, "nose", "#ca8b69", [0.025, 0.97, 0.145], 1, [0.045, 0.024, 0.025]);
  for (const x of [-0.055, 0.055]) sphere(g, `eye_${x}`, "#1b1d21", [x, 1.005, 0.145], 1, [0.018, 0.022, 0.012]);
  box(g, "mouth", "#9a584d", [0, 0.94, 0.151], [0.052, 0.008, 0.01]);
  if (bag) box(g, "shoulder_bag", "#4b5e54", [0.24, 0.58, -0.12], [0.12, 0.34, 0.08]);
  return g;
}

function makeStreetBase() {
  const g = new Group();
  g.name = "street_base";
  sphere(g, "small_planet_ground", "#87a982", [0, -1.02, 0.18], 1, [8.8, 1.05, 5.05]);
  box(g, "asphalt", "#48534f", [0, -0.03, 1.28], [11.8, 0.08, 1.05]);
  box(g, "sidewalk", "#ddd9c9", [0, -0.005, -0.34], [11.6, 0.07, 2.35]);
  box(g, "curb", "#efe9da", [0, 0.035, 0.62], [11.8, 0.08, 0.08]);
  for (const x of [-3.8, -2.25, -0.7, 0.85, 2.4, 3.95]) box(g, `lane_${x}`, "#dfe4dc", [x, 0.025, 1.26], [0.52, 0.025, 0.035]);
  for (const x of [-0.72, -0.42, -0.12, 0.18, 0.48, 0.78]) box(g, `crosswalk_${x}`, "#f8f5e9", [x, 0.045, 1.75], [0.18, 0.028, 0.72]);
  for (const x of [-5.65, 5.65]) box(g, `edge_${x}`, "#66776c", [x, 0.1, 0.28], [0.12, 0.22, 3.05]);
  return g;
}

function makePharmacyFacade() {
  const g = new Group();
  g.name = "pharmacy_facade";
  box(g, "body", "#efe7dc", [0, 1.08, 0], [2, 2.16, 0.56]);
  box(g, "roof", "#34453f", [0, 2.26, 0.02], [2.22, 0.18, 0.64]);
  box(g, "red_sign", "#d71925", [0, 1.72, 0.32], [1.62, 0.26, 0.06], { emissive: "#6a0710", emissiveIntensity: 0.14 });
  box(g, "sign_cross_h", "#ffffff", [-0.68, 1.72, 0.37], [0.16, 0.04, 0.045]);
  box(g, "sign_cross_v", "#ffffff", [-0.68, 1.72, 0.375], [0.045, 0.16, 0.045]);
  box(g, "awning_bar", "#f7f3e7", [0, 1.2, 0.34], [1.82, 0.16, 0.54]);
  for (const [index, x] of [-0.72, -0.36, 0, 0.36, 0.72].entries()) box(g, `awning_${index}`, index % 2 === 0 ? "#e42b31" : "#fff7eb", [x, 1.13, 0.43], [0.18, 0.12, 0.44]);
  for (const x of [-0.44, 0.44]) box(g, `glass_door_${x}`, "#dbe9ea", [x, 0.53, 0.315], [0.36, 0.86, 0.045], { metalness: 0.08, transparent: true, opacity: 0.82 });
  box(g, "door_join", "#5f706b", [0, 0.52, 0.36], [0.038, 0.82, 0.04]);
  for (const x of [-0.9, 0.9]) box(g, `window_${x}`, "#d8eceb", [x, 0.62, 0.315], [0.28, 0.52, 0.04], { metalness: 0.05, transparent: true, opacity: 0.8 });
  box(g, "entry_step", "#cfc9b7", [0, 0.08, 0.53], [1.38, 0.12, 0.34]);
  return g;
}

function makeDeliveryTruck() {
  const g = new Group();
  g.name = "delivery_truck";
  box(g, "cargo", "#f8f4e7", [0, 0.34, 0], [0.82, 0.46, 0.42]);
  box(g, "cab", "#e6efe9", [-0.5, 0.28, 0.02], [0.36, 0.36, 0.4]);
  box(g, "red_logo", "#b21f2d", [0.08, 0.42, 0.23], [0.24, 0.07, 0.025]);
  for (const x of [-0.48, 0.42]) {
    const wheel = cylinder(g, `wheel_${x}`, "#17201d", [x, 0.08, 0.24], 0.105, 0.105, 0.06, 18);
    wheel.rotation.x = Math.PI / 2;
  }
  return g;
}

function makeDepotWarehouse() {
  const g = new Group();
  g.name = "depot_warehouse";
  box(g, "body", "#dfceb3", [0, 0.72, 0], [1.46, 1.44, 0.82]);
  box(g, "roof", "#3e5049", [0, 1.55, 0.02], [1.66, 0.18, 0.92]);
  box(g, "sign", "#f7f1dc", [0, 1.02, 0.45], [1.05, 0.24, 0.05]);
  box(g, "shutter", "#b9aa91", [-0.28, 0.38, 0.46], [0.48, 0.7, 0.045]);
  for (const y of [0.18, 0.34, 0.5]) box(g, `roll_${y}`, "#6c776e", [-0.28, y, 0.49], [0.5, 0.015, 0.025]);
  const truck = makeDeliveryTruck();
  truck.position.set(0.82, 0, 0.95);
  truck.rotation.y = -0.18;
  truck.scale.set(0.72, 0.72, 0.72);
  g.add(truck);
  return g;
}

function makeSgkOffice() {
  const g = new Group();
  g.name = "sgk_office";
  box(g, "body", "#d9e5e8", [0, 0.82, 0], [1.58, 1.64, 0.76]);
  box(g, "roof", "#3f575b", [0, 1.72, 0.02], [1.72, 0.18, 0.86]);
  box(g, "sign", "#f6fbff", [0, 1.08, 0.42], [1.1, 0.26, 0.05]);
  for (const x of [-0.54, 0, 0.54]) box(g, `column_${x}`, "#edf3ef", [x, 0.46, 0.45], [0.08, 0.82, 0.08]);
  box(g, "step", "#c5d1d0", [0, 0.08, 0.6], [1.32, 0.11, 0.36]);
  box(g, "flag", "#c51d2a", [0.74, 1.28, 0.47], [0.26, 0.16, 0.035]);
  return g;
}

function makeBankBranch() {
  const g = new Group();
  g.name = "bank_branch";
  box(g, "body", "#e8e4d8", [0, 0.52, 0], [1.18, 1.04, 0.58]);
  box(g, "roof", "#3a4b45", [0, 1.12, 0.02], [1.34, 0.16, 0.66]);
  box(g, "sign", "#fbfaf2", [0, 0.72, 0.33], [0.96, 0.26, 0.05]);
  box(g, "window", "#d9ebe9", [-0.38, 0.34, 0.35], [0.32, 0.5, 0.05], { metalness: 0.04 });
  box(g, "atm", "#68746d", [0.34, 0.36, 0.35], [0.34, 0.56, 0.055]);
  box(g, "atm_screen", "#b8d4da", [0.34, 0.48, 0.39], [0.22, 0.12, 0.025], { emissive: "#2a5962", emissiveIntensity: 0.08 });
  return g;
}

function makeStreetProps() {
  const g = new Group();
  g.name = "street_props";
  for (const [position, scale = 1] of [
    [[-5.2, 0, -1.7], 1],
    [[5.35, 0, -1.65], 1],
    [[1.95, 0, -2.25], 0.82]
  ]) {
    const tree = new Group();
    tree.name = `tree_${position[0]}`;
    tree.position.set(...position);
    tree.scale.set(scale, scale, scale);
    cylinder(tree, "trunk", "#765b3b", [0, 0.38, 0], 0.055, 0.075, 0.76, 10);
    sphere(tree, "leaf_main", "#4c9d67", [0, 0.9, 0], 0.46, [0.72, 0.54, 0.72]);
    sphere(tree, "leaf_side", "#3e8e5d", [0.22, 0.76, 0.06], 0.38, [0.48, 0.36, 0.48]);
    g.add(tree);
  }
  for (const position of [[-2.55, 0, 0.52], [3.72, 0, 0.55]]) {
    const lamp = new Group();
    lamp.name = `lamp_${position[0]}`;
    lamp.position.set(...position);
    cylinder(lamp, "pole", "#3a4743", [0, 0.48, 0], 0.025, 0.035, 0.96, 12);
    const arm = cylinder(lamp, "arm", "#3a4743", [0.14, 0.96, 0], 0.018, 0.018, 0.3, 10);
    arm.rotation.z = Math.PI / 2;
    sphere(lamp, "lamp_glow", "#fff4c5", [0.29, 0.93, 0], 1, [0.14, 0.09, 0.14], { emissive: "#c89b38", emissiveIntensity: 0.12 });
    g.add(lamp);
  }
  for (const x of [-4, -3.72, 4.02, 4.32]) {
    const c = new Group();
    c.name = `cone_${x}`;
    c.position.set(x, 0, 1.9);
    c.scale.set(0.58, 0.58, 0.58);
    cone(c, "orange_cone", "#ef8a23", [0, 0.16, 0], 0.12, 0.32);
    cylinder(c, "stripe", "#fff6e9", [0, 0.18, 0], 0.09, 0.09, 0.03, 16);
    c.getObjectByName("stripe").scale.y = 0.14;
    g.add(c);
  }
  return g;
}

async function exportGlb(group, fileName) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(assetScene(fileName.replace(".glb", ""), group), { binary: true });
  await writeFile(path.join(outDir, fileName), Buffer.from(result));
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const assets = [
    ["avatar_pharmacist_red.glb", makeAvatar({ name: "avatar_pharmacist_red", coat: "#b21f2d", accent: "#f7f1ec", pants: "#202a31", hair: "#242331" })],
    ["avatar_pharmacist_white.glb", makeAvatar({ name: "avatar_pharmacist_white", coat: "#f5f4ea", accent: "#b21f2d", pants: "#27333a", hair: "#242331" })],
    ["avatar_pharmacist_black.glb", makeAvatar({ name: "avatar_pharmacist_black", coat: "#20282a", accent: "#e0a13a", pants: "#171f24", hair: "#242331" })],
    ["avatar_customer.glb", makeAvatar({ name: "avatar_customer", coat: "#232a2c", accent: "#e0a13a", pants: "#202a31", hair: "#1f1c18", bag: false })],
    ["street_base.glb", makeStreetBase()],
    ["street_props.glb", makeStreetProps()],
    ["pharmacy_facade.glb", makePharmacyFacade()],
    ["depot_warehouse.glb", makeDepotWarehouse()],
    ["sgk_office.glb", makeSgkOffice()],
    ["bank_branch.glb", makeBankBranch()],
    ["delivery_truck.glb", makeDeliveryTruck()]
  ];

  for (const [fileName, group] of assets) {
    await exportGlb(group, fileName);
  }

  await writeFile(
    path.join(process.cwd(), "public", "assets", "game", "asset-manifest.json"),
    `${JSON.stringify({
      assetSet: "pharmacy-reboot-v1",
      source: "scripts/generate-game-assets.mjs",
      models: Object.fromEntries(assets.map(([fileName]) => [fileName.replace(".glb", ""), `/assets/game/models/${fileName}`]))
    }, null, 2)}\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
