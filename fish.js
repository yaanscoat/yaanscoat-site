// the 3d fish swimming behind the card.
// it's drawn small and scaled up (see PIXEL) so it looks like pixel art.
// fish swim in from the sides or out of the dark far away, then leave and come back as new fish.
// move your mouse near one and it gets scared and swims off.

import * as THREE from "./assets/vendor/three.module.min.js";

const WATER = new THREE.Color("#070a0f"); // same as --water in style.css
const PIXEL = innerWidth < 700 ? 2 : 3; // how big each pixel is drawn
const FAR = 44;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SPEED = reduceMotion ? 0.3 : 1;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => {
  let r = Math.random() * list.reduce((sum, item) => sum + item.weight, 0);
  return list.find((item) => (r -= item.weight) <= 0) ?? list[0];
};

// ---------- textures ----------
// fish bodies are wrapped in a tiny canvas texture. across = around the body
// (the back is around x 48, the belly around x 16), down = nose to tail.

function canvasTexture(draw) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  draw(canvas.getContext("2d"));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

// koi: a base colour with blotches over the back
function koiTexture(base, blotches) {
  return canvasTexture((g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 64, 32);
    for (const color of blotches) {
      g.fillStyle = color;
      for (let i = 0, n = Math.round(rand(2, 4)); i < n; i++) {
        const x = rand(34, 62);
        const y = rand(4, 26);
        const rx = rand(6, 14);
        const ry = rand(3, 7);
        for (const shift of [-64, 0, 64]) {
          g.beginPath();
          g.ellipse(x + shift, y, rx, ry, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  });
}

// small schooling fish: dark back, silver belly, a stripe down the side
function silverTexture(back, belly, stripe) {
  return canvasTexture((g) => {
    for (let x = 0; x < 64; x++) {
      const toBack = (1 - Math.cos(((x - 16) / 64) * Math.PI * 2)) / 2; // 0 at belly, 1 at back
      g.fillStyle = toBack > 0.62 ? back : toBack > 0.45 ? stripe : belly;
      g.fillRect(x, 0, 1, 32);
    }
  });
}

// ---------- kinds of fish ----------

const SPECIES = [
  { weight: 3, size: [1.1, 1.6], fat: 1, speed: [0.8, 1.3], fin: "#f3e4d8", body: () => koiTexture("#f2ece2", ["#e0452b"]), school: [1, 1] },
  { weight: 2, size: [1, 1.5], fat: 1, speed: [0.8, 1.2], fin: "#ffc27a", body: () => koiTexture("#f08a2c", ["#ffd38a"]), school: [1, 1] },
  { weight: 1, size: [1, 1.4], fat: 1.05, speed: [0.7, 1.1], fin: "#2a2a30", body: () => koiTexture("#1d1d22", ["#d8402a", "#efe9de"]), school: [1, 1] },
  { weight: 2, size: [0.4, 0.55], fat: 0.72, speed: [2, 2.6], fin: "#9fb4c4", body: () => silverTexture("#2f5470", "#cfd9e0", "#7fa3bd"), school: [6, 11] },
  { weight: 1, size: [0.5, 0.65], fat: 0.85, speed: [1.6, 2.1], fin: "#e9d36b", body: () => silverTexture("#5a6b2e", "#e8e2c6", "#e3c84a"), school: [4, 7] },
];

// ---------- fish shape ----------
// built facing +x, nose at x 1, tail tip at about x -1.6. the side-to-side swish
// is done on the graphics card (see swimMaterial) so every fish can wiggle on its own.

const geometries = new Map();

function fishGeometry(fat) {
  if (geometries.has(fat)) return geometries.get(fat);
  const radius = (u) => (u <= 0 ? 0 : Math.max(0.035, 0.42 * fat * Math.sin(Math.PI * Math.pow(u, 0.62)) * (1 - 0.35 * u)));

  // body: a profile spun around, squashed sideways
  const profile = [];
  for (let i = 0, n = 22; i <= n; i++) {
    const u = 1 - i / n; // 1 = tail end, 0 = nose
    profile.push(new THREE.Vector2(radius(u), 1 - u * 2));
  }
  const body = new THREE.LatheGeometry(profile, 16);
  body.rotateZ(-Math.PI / 2);
  body.scale(1, 1, 0.6);

  const shape = (points) => {
    const s = new THREE.Shape();
    s.moveTo(...points[0]);
    for (const p of points.slice(1)) p.length === 4 ? s.quadraticCurveTo(...p) : s.lineTo(...p);
    return new THREE.ShapeGeometry(s, 6);
  };

  const tail = shape([[-0.9, 0], [-1.2, 0.18, -1.62, 0.5], [-1.4, 0.15, -1.38, 0], [-1.4, -0.15, -1.62, -0.5], [-1.2, -0.18, -0.9, 0]]);
  const top = 0.34 * fat;
  const dorsal = shape([[0.32, top - 0.06], [-0.02, top + 0.3], [-0.22, top + 0.12, -0.5, top - 0.12], [0.32, top - 0.06]]);
  const fin = () => shape([[0, 0], [-0.36, 0.3], [-0.16, 0]]);
  const leftFin = fin().rotateX(-(Math.PI / 2 + 0.4)).translate(0.38, -0.2 * fat, -0.15 * fat);
  const rightFin = fin().rotateX(Math.PI / 2 + 0.4).translate(0.38, -0.2 * fat, 0.15 * fat);

  const eyeX = 0.7;
  const eyeR = radius((1 - eyeX) / 2);
  const eyeZ = 0.6 * Math.sqrt(Math.max(0, eyeR * eyeR - 0.01)) - 0.01;
  const eyes = [1, -1].map((side) => new THREE.SphereGeometry(0.055 * Math.max(fat, 0.85), 8, 6).translate(eyeX, 0.1 * fat, side * eyeZ));

  const parts = { body, fins: [tail, dorsal, leftFin, rightFin], eyes };
  geometries.set(fat, parts);
  return parts;
}

// ---------- materials ----------

const toonSteps = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat);
toonSteps.minFilter = toonSteps.magFilter = THREE.NearestFilter;
toonSteps.needsUpdate = true;

function swimMaterial(options, swim) {
  const material = new THREE.MeshToonMaterial({ gradientMap: toonSteps, ...options });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, swim);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uSwim;\nuniform float uAmp;\nuniform float uFreq;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float tailness = clamp((0.75 - transformed.x) / 2.4, 0.0, 1.0);
        transformed.z += sin(transformed.x * uFreq - uSwim) * uAmp * tailness * tailness;`,
      );
  };
  material.customProgramCacheKey = () => "swim";
  return material;
}

// ---------- the scene ----------

function start() {
  const canvas = document.getElementById("water");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  } catch {
    canvas.hidden = true; // no webgl, the page still works with a plain background
    return;
  }
  renderer.setPixelRatio(1);
  renderer.setClearColor(WATER);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(WATER, 12, FAR);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, FAR + 10);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight(0x9cc8e0, 0x1a2430, 2));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.8);
  sun.position.set(2, 10, 5);
  scene.add(sun);

  // bits floating in the water
  const snowCount = 500;
  const snowPositions = new Float32Array(snowCount * 3);
  for (let i = 0; i < snowCount; i++) {
    snowPositions.set([rand(-30, 30), rand(-18, 18), rand(-FAR + 6, 8)], i * 3);
  }
  const snowGeometry = new THREE.BufferGeometry();
  snowGeometry.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));
  const snow = new THREE.Points(snowGeometry, new THREE.PointsMaterial({ color: 0x8fb3c8, size: 0.07, transparent: true, opacity: 0.55 }));
  scene.add(snow);

  // how much of the world you can see at a depth
  const view = (z) => {
    const halfH = (camera.position.z - z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return { halfW: halfH * camera.aspect, halfH };
  };

  // ---------- fish ----------

  const fish = [];
  const maxFish = innerWidth < 700 ? 22 : 34;

  function makeFish(species) {
    const parts = fishGeometry(species.fat);
    const swim = { uSwim: { value: rand(0, 10) }, uAmp: { value: 0.16 }, uFreq: { value: 2.6 } };
    const fins = swimMaterial({ color: species.fin, transparent: true, opacity: 0.75, side: THREE.DoubleSide }, swim);
    const group = new THREE.Group();
    group.rotation.order = "YZX";
    group.add(new THREE.Mesh(parts.body, swimMaterial({ map: species.body() }, swim)));
    for (const g of parts.fins) group.add(new THREE.Mesh(g, fins));
    const eye = swimMaterial({ color: 0x050505 }, swim);
    for (const g of parts.eyes) group.add(new THREE.Mesh(g, eye));
    return { group, swim, species };
  }

  // every fish in a school gets the same "seed", so they all turn the same way together
  function spawnSchool(firstTime) {
    const species = pick(SPECIES);
    const count = Math.min(Math.round(rand(...species.school)), maxFish - fish.length);
    if (count <= 0) return;

    const z = rand(-32, 0);
    const { halfW, halfH } = view(z);
    const fromSide = firstTime || Math.random() < 0.7;
    let x, y, yaw;
    if (fromSide) {
      const side = Math.random() < 0.5 ? -1 : 1;
      x = firstTime ? rand(-halfW, halfW) : side * (halfW + 3);
      y = rand(-halfH * 0.7, halfH * 0.7);
      yaw = (side === 1 ? Math.PI : 0) + rand(-0.35, 0.35);
    } else {
      // out of the dark, swimming towards you
      const far = view(-FAR + 6);
      x = rand(-far.halfW * 0.6, far.halfW * 0.6);
      y = rand(-far.halfH * 0.5, far.halfH * 0.5);
      yaw = -Math.PI / 2 + (x > 0 ? 1 : -1) * rand(0.4, 0.9); // drifts outwards as it gets closer
    }
    const startZ = fromSide ? z : -FAR + 6;
    const seed = rand(0, 100);
    const speed = rand(...species.speed);
    const size = rand(...species.size);

    for (let i = 0; i < count; i++) {
      const f = makeFish(species);
      const spread = count > 1 ? 1.6 : 0;
      f.pos = new THREE.Vector3(x + rand(-spread, spread) * 1.5, y + rand(-spread, spread), startZ + rand(-spread, spread));
      f.yaw = yaw + rand(-0.08, 0.08);
      f.pitch = 0;
      f.seed = seed;
      f.speed = speed * rand(0.92, 1.08);
      f.scared = 0;
      f.group.scale.setScalar(size * rand(0.9, 1.1));
      f.swim.uAmp.value = 0.12 + 0.05 * f.speed;
      fish.push(f);
      scene.add(f.group);
    }
  }

  function remove(f) {
    scene.remove(f.group);
    f.group.traverse((o) => {
      if (!o.material) return;
      o.material.map?.dispose();
      o.material.dispose();
    });
    fish.splice(fish.indexOf(f), 1);
  }

  // ---------- mouse ----------

  const pointer = { x: 0, y: 0, active: false };
  addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    pointer.active = true;
  });
  document.documentElement.addEventListener("pointerleave", () => (pointer.active = false));

  // ---------- resize ----------

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(Math.ceil(w / PIXEL), Math.ceil(h / PIXEL), false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  while (fish.length < maxFish * 0.75) spawnSchool(true);

  // ---------- every frame ----------

  const clock = new THREE.Clock();
  let time = 0;
  let nextSpawn = 0;
  const lookAt = new THREE.Vector3();

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05) * SPEED;
    time += dt;

    // camera drifts a little and leans towards the mouse
    camera.position.x += ((pointer.active ? pointer.x * 0.8 : 0) + Math.sin(time * 0.13) * 0.4 - camera.position.x) * 0.02;
    camera.position.y += ((pointer.active ? pointer.y * 0.5 : 0) + Math.sin(time * 0.17) * 0.25 - camera.position.y) * 0.02;
    camera.lookAt(lookAt);

    // floating bits drift up slowly
    const p = snowGeometry.attributes.position;
    for (let i = 0; i < snowCount; i++) {
      let y = p.getY(i) + dt * 0.15;
      if (y > 18) y = -18;
      p.setY(i, y);
    }
    p.needsUpdate = true;

    for (const f of [...fish]) {
      const { halfW, halfH } = view(f.pos.z);

      // wander: gentle turning that changes over time
      f.yaw += (Math.sin(time * 0.31 + f.seed) * 0.28 + Math.sin(time * 0.73 + f.seed * 2.1) * 0.14) * dt;
      let targetPitch = Math.sin(time * 0.4 + f.seed) * 0.18;

      // close to the camera: turn to swim sideways instead
      if (f.pos.z > 0) {
        const flat = Math.cos(f.yaw) >= 0 ? 0 : Math.PI;
        f.yaw += Math.atan2(Math.sin(flat - f.yaw), Math.cos(flat - f.yaw)) * Math.min(1, dt * 1.5);
      }

      // scared of the mouse
      if (pointer.active) {
        const dx = f.pos.x - pointer.x * halfW;
        const dy = f.pos.y - pointer.y * halfH;
        if (dx * dx + dy * dy < 4 && f.pos.z > -20) f.scared = 1;
        if (f.scared > 0.5) {
          const away = dx > 0 ? 0 : Math.PI;
          const turn = Math.atan2(Math.sin(away - f.yaw), Math.cos(away - f.yaw));
          f.yaw += turn * Math.min(1, dt * 4);
          targetPitch = Math.sign(dy) * 0.45;
        }
      }
      f.scared = Math.max(0, f.scared - dt * 0.6);
      f.pitch += (targetPitch - f.pitch) * Math.min(1, dt * 2);

      const speed = f.speed * (1 + f.scared * 2.2);
      const flat = Math.cos(f.pitch) * speed * dt;
      f.pos.x += Math.cos(f.yaw) * flat;
      f.pos.z -= Math.sin(f.yaw) * flat;
      f.pos.y += Math.sin(f.pitch) * speed * dt;

      f.group.position.copy(f.pos);
      f.group.rotation.set(0, f.yaw, f.pitch);
      f.swim.uSwim.value += dt * (3 + speed * 2.4);

      // gone off screen, too close, or too far: remove it, another will come
      const off = Math.abs(f.pos.x) > halfW + 5 || Math.abs(f.pos.y) > halfH + 4 || f.pos.z > 6 || f.pos.z < -FAR;
      if (off) remove(f);
    }

    if (time > nextSpawn && fish.length < maxFish) {
      spawnSchool(false);
      nextSpawn = time + rand(1.5, 4);
    }

    renderer.render(scene, camera);
  });
}

start();
