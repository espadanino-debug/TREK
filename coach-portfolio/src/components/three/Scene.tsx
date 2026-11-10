"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { gsap } from "@/lib/gsap";
import { pose } from "@/lib/sceneState";

const VOLT = "#c6ff00";
const HALF_PI = Math.PI / 2;

/* ── Hex dumbbell, built from primitives (no model to download) ───────── */

function Head({ side }: { side: 1 | -1 }) {
  return (
    <group position={[side * 1.28, 0, 0]} rotation={[0, 0, HALF_PI]}>
      {/* rubber hex body */}
      <mesh>
        <cylinderGeometry args={[0.86, 0.86, 0.62, 6]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.3} metalness={0.75} flatShading />
      </mesh>
      {/* chamfers */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.7, 0.86, 0.12, 6]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.3} metalness={0.75} flatShading />
      </mesh>
      <mesh position={[0, -0.37, 0]}>
        <cylinderGeometry args={[0.86, 0.7, 0.12, 6]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.3} metalness={0.75} flatShading />
      </mesh>
      {/* volt inlay band */}
      <mesh>
        <cylinderGeometry args={[0.868, 0.868, 0.05, 6]} />
        <meshBasicMaterial color={VOLT} toneMapped={false} />
      </mesh>
      {/* volt ring on the outer face */}
      <mesh position={[0, -side * 0.432, 0]} rotation={[HALF_PI, 0, 0]}>
        <ringGeometry args={[0.4, 0.46, 6]} />
        <meshBasicMaterial color={VOLT} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Dumbbell() {
  return (
    <group>
      {/* chrome bar */}
      <mesh rotation={[0, 0, HALF_PI]}>
        <cylinderGeometry args={[0.13, 0.13, 2.3, 32]} />
        <meshStandardMaterial color="#d9d9d9" roughness={0.16} metalness={1} />
      </mesh>
      {/* knurled grip */}
      <mesh rotation={[0, 0, HALF_PI]}>
        <cylinderGeometry args={[0.15, 0.15, 1.15, 24]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.6} metalness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.82, 0, 0]} rotation={[0, 0, HALF_PI]}>
          <cylinderGeometry args={[0.27, 0.27, 0.1, 32]} />
          <meshStandardMaterial color="#e6e6e6" roughness={0.12} metalness={1} />
        </mesh>
      ))}
      <Head side={1} />
      <Head side={-1} />
    </group>
  );
}

/* ── Orbit rings + dust ───────────────────────────────────────────────── */

function Rings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (a.current) a.current.rotation.z += d * 0.12;
    if (b.current) b.current.rotation.z -= d * 0.08;
  });
  return (
    <group>
      <mesh ref={a} rotation={[1.25, 0.2, 0]}>
        <torusGeometry args={[2.7, 0.006, 8, 160]} />
        <meshBasicMaterial color={VOLT} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={b} rotation={[1.5, -0.5, 0]}>
        <torusGeometry args={[3.3, 0.004, 8, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.16} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Deterministic pseudo-random spread so the field is stable per mount.
    const arr = new Float32Array(count * 3);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rnd() - 0.5) * 18;
      arr[i * 3 + 1] = (rnd() - 0.5) * 11;
      arr[i * 3 + 2] = (rnd() - 0.5) * 9 - 1.5;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const d = Math.min(dt, 0.05);
    ref.current.rotation.y += d * (0.015 + pose.boost * 0.05);
    ref.current.position.y += d * 0.04;
    if (ref.current.position.y > 1) ref.current.position.y = -1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={VOLT} size={0.028} sizeAttenuation transparent opacity={0.55} depthWrite={false} toneMapped={false} />
    </points>
  );
}

/* ── Rig: reads the shared pose and eases the scene toward it ─────────── */

function Rig({ reduce }: { reduce: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  useFrame((state, dt) => {
    const g = outer.current;
    const s = spin.current;
    if (!g || !s) return;
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    // Fit the object to narrow (portrait) viewports.
    const fit = THREE.MathUtils.clamp(viewport.width / 7.2, 0.5, 1);
    const float = reduce ? 0 : Math.sin(t * 0.9) * 0.08;
    const k = pose.intro;
    pose.boost = THREE.MathUtils.damp(pose.boost, 0, 2.5, d);

    // Reduced motion renders single frames on demand, so there is nothing
    // to ease over: jump straight to the target.
    const ease = (current: number, target: number, lambda: number) =>
      reduce ? target : THREE.MathUtils.damp(current, target, lambda, d);

    g.position.x = ease(g.position.x, pose.x, 5);
    g.position.y = ease(g.position.y, pose.y + float - (1 - k) * 0.9, 5);
    g.position.z = ease(g.position.z, pose.z, 5);
    g.scale.setScalar(ease(g.scale.x, pose.scale * fit * (0.65 + 0.35 * k), 5));

    g.rotation.x = ease(g.rotation.x, pose.rx + (1 - k) * 0.8 + pointer.current.y * 0.18, 4);
    g.rotation.z = ease(g.rotation.z, pose.rz - pointer.current.x * 0.12, 4);
    if (!reduce) s.rotation.y += d * (0.45 + pose.boost * 2.2);
  });

  return (
    <group ref={outer}>
      <group ref={spin} rotation={[0, 0.6, 0]}>
        <Dumbbell />
      </group>
      <Rings />
    </group>
  );
}

/* ── Render only while the scene is actually on screen ───────────────── */

function Driver({ reduce }: { reduce: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const tick = () => {
      if (pose.opacity * pose.intro > 0.01 && !document.hidden) invalidate();
    };
    if (reduce) {
      // Static frame, refreshed when the layout or scroll position changes.
      invalidate();
      const once = () => invalidate();
      window.addEventListener("scroll", once, { passive: true });
      window.addEventListener("resize", once);
      return () => {
        window.removeEventListener("scroll", once);
        window.removeEventListener("resize", once);
      };
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [invalidate, reduce]);
  return null;
}

export default function Scene({ reduce, lowPower }: { reduce: boolean; lowPower: boolean }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, lowPower ? 1.5 : 1.75]}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9], fov: 35 }}
      style={{ pointerEvents: "none" }}
    >
      <Driver reduce={reduce} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={3.2} />
      <pointLight position={[-5, -2, 2]} intensity={60} color={VOLT} />
      <pointLight position={[5, 3, -4]} intensity={40} color="#ffffff" />

      {/* Studio reflections drawn in-scene: no HDR file to fetch. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#050505"]} />
        <Lightformer form="rect" intensity={8} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={HALF_PI} />
        <Lightformer form="rect" intensity={3} position={[-6, 1, 2]} scale={[1.5, 8, 1]} rotation-y={HALF_PI} color={VOLT} />
        <Lightformer form="rect" intensity={6} position={[6, 0, 3]} scale={[1, 8, 1]} rotation-y={-HALF_PI} />
        <Lightformer form="ring" intensity={2} position={[0, -4, 4]} scale={4} color={VOLT} />
      </Environment>

      <Rig reduce={reduce} />
      <Dust count={lowPower ? 220 : 520} />
    </Canvas>
  );
}
