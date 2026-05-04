'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Gas Cylinder 3D Mesh ─────────────────────────────── */
function GasCylinder({ position = [0, 0, 0], color = '#3b82f6', scale = 1 }) {
  const meshRef = useRef();
  const valveRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Main cylinder body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 2.2, 32]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Top dome */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>

      {/* Bottom dome */}
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>

      {/* Valve neck */}
      <mesh ref={valveRef} position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.4, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Valve wheel */}
      <mesh position={[0, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Protective cap ring */}
      <mesh position={[0, 1.35, 0]}>
        <torusGeometry args={[0.28, 0.04, 8, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Label band */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.3, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.8}
          opacity={0.15}
          transparent
        />
      </mesh>

      {/* Bottom ring */}
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.15, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Floating Molecules ───────────────────────────────── */
function Molecule({ position, color, size = 0.08 }) {
  const ref = useRef();
  const speed = useMemo(() => 0.3 + Math.random() * 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.5;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7 + offset) * 0.3;
      ref.current.rotation.x += 0.01;
      ref.current.rotation.z += 0.008;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <MeshDistortMaterial
        color={color}
        speed={2}
        distort={0.3}
        radius={1}
        transparent
        opacity={0.7}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

/* ─── Mouse-following light ────────────────────────────── */
function MouseLight() {
  const lightRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = (state.pointer.x * viewport.width) / 2;
      lightRef.current.position.y = (state.pointer.y * viewport.height) / 2;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      color="#06b6d4"
      intensity={2}
      distance={8}
      position={[0, 0, 3]}
    />
  );
}

/* ─── Scene ────────────────────────────────────────────── */
function Scene() {
  const moleculePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 20; i++) {
      positions.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4 - 1,
        ],
        color: ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
        size: 0.04 + Math.random() * 0.08,
      });
    }
    return positions;
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#e2e8f0" />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#3b82f6" />
      <MouseLight />

      {/* Main cylinder - Oxygen (Blue) */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <GasCylinder position={[0, 0, 0]} color="#3b82f6" scale={1.2} />
      </Float>

      {/* Secondary cylinders */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <GasCylinder position={[-2.5, -0.5, -1.5]} color="#8b5cf6" scale={0.7} />
      </Float>

      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.6}>
        <GasCylinder position={[2.8, 0.3, -2]} color="#06b6d4" scale={0.6} />
      </Float>

      {/* Floating molecules */}
      {moleculePositions.map((mol, i) => (
        <Molecule key={i} position={mol.position} color={mol.color} size={mol.size} />
      ))}

      {/* Sparkle particles */}
      <Sparkles count={80} scale={10} size={1.5} speed={0.4} color="#3b82f6" opacity={0.3} />
      <Sparkles count={40} scale={8} size={1} speed={0.3} color="#06b6d4" opacity={0.2} />

      <Environment preset="night" />
    </>
  );
}

/* ─── Exported Component ───────────────────────────────── */
export default function GasCylinder3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
