/* trainwithnajib 3D scenes (Three.js).
   Source for assets/js/scene.js. Rebuild with: tools/build.sh
   One canvas per page: a procedural dumbbell, kettlebell or weight plates,
   lit in green, reacting to pointer, scroll and the goal picker. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Points,
  CylinderGeometry, TorusGeometry, SphereGeometry, BufferGeometry, BufferAttribute,
  MeshStandardMaterial, MeshBasicMaterial, PointsMaterial,
  DirectionalLight, PointLight, AmbientLight, PMREMGenerator,
  Color, ACESFilmicToneMapping, SRGBColorSpace, AdditiveBlending, MathUtils
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const GREEN = 0x3ee07f;

function materials() {
  return {
    rubber: new MeshStandardMaterial({ color: 0x121413, roughness: 0.62, metalness: 0.25 }),
    steel: new MeshStandardMaterial({ color: 0xb9beba, roughness: 0.28, metalness: 1 }),
    grip: new MeshStandardMaterial({ color: 0x5c615e, roughness: 0.55, metalness: 0.9 }),
    iron: new MeshStandardMaterial({ color: 0x252927, roughness: 0.5, metalness: 0.7 }),
    glow: new MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 1.6, roughness: 0.4, metalness: 0.2 })
  };
}

/* A hex head or plate lying on the X axis. */
function hex(radius, depth, mat) {
  const m = new Mesh(new CylinderGeometry(radius, radius, depth, 6, 1), mat);
  m.rotation.z = Math.PI / 2;
  return m;
}

function buildDumbbell(M) {
  const g = new Group();
  const bar = new Mesh(new CylinderGeometry(0.085, 0.085, 2.5, 32), M.steel);
  bar.rotation.z = Math.PI / 2;
  const grip = new Mesh(new CylinderGeometry(0.098, 0.098, 0.92, 32), M.grip);
  grip.rotation.z = Math.PI / 2;
  g.add(bar, grip);

  const plates = [];           // extra plates that slide on for heavier goals
  [-1, 1].forEach((s) => {
    const side = new Group();
    const head = hex(0.56, 0.5, M.rubber);
    const lip = hex(0.5, 0.58, M.rubber);
    const band = hex(0.574, 0.03, M.glow);
    const collar = new Mesh(new CylinderGeometry(0.15, 0.15, 0.12, 32), M.steel);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = -s * 0.35;
    side.add(head, lip, band, collar);
    side.position.x = s * 0.86;
    g.add(side);

    [0, 1].forEach((i) => {
      const p = new Group();
      p.add(hex(0.44 - i * 0.07, 0.13, M.iron), hex(0.449 - i * 0.07, 0.022, M.glow));
      p.userData = { side: s, on: s * (1.2 + i * 0.16), off: s * (1.9 + i * 0.25) };
      p.position.x = p.userData.off;
      p.scale.setScalar(0.001);
      plates.push(p);
      g.add(p);
    });
  });
  g.userData.plates = plates;
  g.rotation.set(0.42, -0.6, 0.28);
  return g;
}

function buildKettlebell(M) {
  const g = new Group();
  const body = new Mesh(new SphereGeometry(0.68, 48, 32), M.rubber);
  body.scale.y = 0.94;
  const base = new Mesh(new CylinderGeometry(0.4, 0.46, 0.1, 48), M.rubber);
  base.position.y = -0.62;
  const handle = new Mesh(new TorusGeometry(0.36, 0.075, 20, 48), M.steel);
  handle.position.y = 0.72;
  const band = new Mesh(new TorusGeometry(0.672, 0.014, 10, 64), M.glow);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.08;
  g.add(body, base, handle, band);
  g.rotation.set(0.25, -0.5, 0.18);
  return g;
}

function buildPlates(M) {
  const g = new Group();
  [[-0.2, 0, 0.15, 1], [0.62, 0.12, -0.45, 0.72]].forEach(([x, y, z, k], i) => {
    const p = new Group();
    const disc = new Mesh(new CylinderGeometry(0.95 * k, 0.95 * k, 0.15, 64), i ? M.iron : M.rubber);
    const rim = new Mesh(new TorusGeometry(0.95 * k, 0.045, 12, 64), M.rubber);
    rim.rotation.x = Math.PI / 2;
    const inner = new Mesh(new CylinderGeometry(0.52 * k, 0.52 * k, 0.19, 64), M.grip);
    const hub = new Mesh(new CylinderGeometry(0.14 * k, 0.14 * k, 0.24, 32), M.steel);
    const band = new Mesh(new TorusGeometry(0.74 * k, 0.013, 10, 64), M.glow);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.08;
    p.add(disc, rim, inner, hub, band);
    p.rotation.x = Math.PI / 2;
    p.position.set(x, y, z);
    g.add(p);
  });
  g.rotation.set(-0.5, -0.75, 0.14);
  return g;
}

function dust(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = MathUtils.randFloatSpread(9);
    pos[i * 3 + 1] = MathUtils.randFloatSpread(6);
    pos[i * 3 + 2] = MathUtils.randFloat(-5, 1.5);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  return new Points(geo, new PointsMaterial({
    color: GREEN, size: 0.022, transparent: true, opacity: 0.55,
    blending: AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
}

export function mount(canvas, kind) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 6.2);

  scene.add(new AmbientLight(0xffffff, 0.15));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  const rimA = new PointLight(new Color(GREEN), 40, 12);
  rimA.position.set(-3.2, 1.2, -1.5);
  const rimB = new PointLight(new Color(GREEN), 22, 10);
  rimB.position.set(3, -2.2, 1);
  scene.add(key, rimA, rimB);

  const M = materials();
  const object = kind === "kettlebell" ? buildKettlebell(M) : kind === "plates" ? buildPlates(M) : buildDumbbell(M);
  const rig = new Group();       // pointer + scroll move the rig, idle motion moves the object
  rig.add(object);
  scene.add(rig);

  // thin orbit rings give the object a stage
  const lineMat = new MeshBasicMaterial({ color: 0x8b918d, transparent: true, opacity: 0.22 });
  const orbit = new Group();
  [2.05, 2.5].forEach((r, i) => {
    const o = new Mesh(new TorusGeometry(r, 0.004, 6, 160), lineMat);
    o.rotation.set(Math.PI / 2 + (i ? 0.5 : -0.25), i ? 0.4 : -0.2, 0);
    orbit.add(o);
  });
  scene.add(orbit);
  const particles = dust(260);
  scene.add(particles);

  const base = object.rotation.clone();
  const state = { px: 0, py: 0, tx: 0, ty: 0, scroll: 0, spin: 0, visible: true, running: false, scale: 1, offsetX: 0, offsetY: 0 };
  // where the object sits in the canvas (fractions of width / height) and how big it may get
  const pos = (canvas.getAttribute("data-pos") || "0.5,0.5").split(",").map(Number);
  const size = Number(canvas.getAttribute("data-size") || 1);
  const span = kind === "kettlebell" ? 2.3 : kind === "plates" ? 2.6 : 2.7;   // rough width in world units

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewH = 2 * camera.position.z * Math.tan(MathUtils.degToRad(camera.fov / 2));
    const viewW = viewH * camera.aspect;
    // portrait canvases (phones, the About card) keep the object in the upper part, clear of the text
    const portrait = h > w * 1.05;
    const px = portrait ? 0.5 : pos[0], py = portrait ? (h > w * 1.4 ? 0.21 : 0.34) : pos[1];
    state.scale = Math.min(size, (viewW * (portrait ? 0.62 : 0.84)) / span);
    state.offsetX = (px - 0.5) * viewW;
    state.offsetY = (0.5 - py) * viewH;
  }

  let last = performance.now(), t = 0;
  function frame(now) {
    if (!state.running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    state.px += (state.tx - state.px) * Math.min(1, dt * 4);
    state.py += (state.ty - state.py) * Math.min(1, dt * 4);

    object.rotation.x = base.x + Math.sin(t * 0.6) * 0.06 + state.spin * 0.35;
    object.rotation.y = base.y + t * 0.22 + state.spin * Math.PI * 2;
    object.position.y = (kind === "kettlebell" ? -0.38 : 0) + Math.sin(t * 0.9) * 0.06;

    rig.rotation.y = state.px * 0.45 + state.scroll * 1.4;
    rig.rotation.x = state.py * 0.3 + state.scroll * 0.5;
    rig.position.x = state.offsetX * (1 - state.scroll * 0.6);
    rig.position.y = state.offsetY + state.scroll * 0.5;
    rig.scale.setScalar(state.scale * (1 - state.scroll * 0.18) * (api.intro));

    orbit.rotation.z = t * 0.05;
    orbit.position.copy(rig.position);
    orbit.scale.setScalar(state.scale);
    particles.rotation.y = t * 0.012 + state.px * 0.05;
    particles.position.y = (t * 0.03) % 1;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function setRunning(on) {
    if (on === state.running) return;
    state.running = on;
    if (on) { last = performance.now(); requestAnimationFrame(frame); }
  }

  const ro = new ResizeObserver(layout);
  ro.observe(canvas);
  const io = new IntersectionObserver((e) => {
    state.visible = e[0].isIntersecting;
    setRunning(state.visible && !document.hidden);
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", () => setRunning(state.visible && !document.hidden));
  window.addEventListener("pointermove", (e) => {
    state.tx = (e.clientX / window.innerWidth) * 2 - 1;
    state.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const api = {
    intro: 1,                    // animated 0.6 -> 1 by the page on first show
    state,
    plates: object.userData.plates || [],
    setScroll(p) { state.scroll = p; },
    renderOnce() { layout(); renderer.render(scene, camera); }
  };
  layout();
  setRunning(true);
  return api;
}
