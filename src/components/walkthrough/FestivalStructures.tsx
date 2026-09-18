"use client";

import { Html, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { mapPercentToLocal } from "@/lib/georef";
import {
  structureLabelHeight,
  WALKTHROUGH_STRUCTURES,
  type GltfStructure,
  type ProceduralStructure,
  type WalkthroughStructure,
} from "@/lib/walkthrough-structures";

const STAGE_BLACK = "#111111";
const TRUSS = "#1a1a1a";
const TENT_WHITE = "#e8e8ea";
const VIP_WHITE = "#f4f4f5";
const EXPO_TAN = "#c4a574";
const SPEAKER = "#0a0a0a";

export function FestivalStructures() {
  return (
    <>
      {WALKTHROUGH_STRUCTURES.map((structure) => (
        <StructureNode key={structure.id} structure={structure} />
      ))}
    </>
  );
}

function StructureNode({ structure }: { structure: WalkthroughStructure }) {
  const [x, z] = mapPercentToLocal(structure.mapPosition);

  const labelH = structureLabelHeight(structure);

  return (
    <group position={[x, 0, z]} rotation={[0, structure.rotationY, 0]}>
      <StructureMesh structure={structure} />
      <StructureLabel name={structure.name} height={labelH} type={structure.type} />
    </group>
  );
}

function StructureMesh({ structure }: { structure: WalkthroughStructure }) {
  switch (structure.type) {
    case "gltf":
      return <GltfStructureMesh structure={structure} />;
    case "main-stage":
      return <MainStage structure={structure} />;
    case "secondary-stage":
      return <SecondaryStage structure={structure} />;
    case "tent-stage":
      return <TentStage structure={structure} />;
    case "vip-deck":
      return <VipDeck structure={structure} />;
    case "expo-hall":
      return <ExpoHall structure={structure} />;
    case "tent-row":
      return <TentRow structure={structure} />;
  }
}

function GltfStructureMesh({ structure }: { structure: GltfStructure }) {
  const scale = structure.scale ?? 1;
  const { scene } = useGLTF(structure.modelUrl);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ("castShadow" in child && typeof child.castShadow === "boolean") {
        child.castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={model} scale={scale} />;
}

const STRUCTURE_TYPE_LABEL: Record<ProceduralStructure["type"] | "gltf", string> = {
  "main-stage": "Main Stage",
  "secondary-stage": "Stage",
  "tent-stage": "Tent Stage",
  "vip-deck": "VIP Deck",
  "expo-hall": "Expo",
  "tent-row": "Vendors",
  gltf: "Structure",
};

function StructureLabel({
  name,
  height,
  type,
}: {
  name: string;
  height: number;
  type: WalkthroughStructure["type"];
}) {
  const typeLabel = STRUCTURE_TYPE_LABEL[type];

  return (
    <Html
      position={[0, height + 5, 0]}
      center
      distanceFactor={90}
      zIndexRange={[50, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#39ff14] ring-1 ring-[#39ff14]/50">
          {typeLabel}
        </span>
        <span className="whitespace-nowrap rounded bg-black/85 px-2.5 py-1 text-[11px] font-black text-white ring-1 ring-white/20">
          {name}
        </span>
      </div>
    </Html>
  );
}

/** Twin main stages — black truss frame + LED backdrop + speaker stacks */
function MainStage({ structure }: { structure: ProceduralStructure }) {
  const { width, depth, height } = structure;
  const legH = height * 0.85;
  const trussH = height * 0.15;

  return (
    <group>
      {/* Stage deck */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.8, depth]} />
        <meshStandardMaterial color={STAGE_BLACK} roughness={0.9} />
      </mesh>

      {/* Back wall / LED panel */}
      <mesh position={[0, legH / 2 + 0.8, -depth / 2 + 0.6]} castShadow>
        <boxGeometry args={[width * 0.92, legH, 1.2]} />
        <meshStandardMaterial
          color="#050505"
          emissive="#39ff14"
          emissiveIntensity={0.08}
          roughness={0.4}
        />
      </mesh>

      {/* Roof truss */}
      <mesh position={[0, legH + trussH / 2 + 0.8, 0]} castShadow>
        <boxGeometry args={[width, trussH, depth * 0.9]} />
        <meshStandardMaterial color={TRUSS} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Truss legs */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * (width / 2 - 1.5), legH / 2 + 0.8, -depth / 2 + 2]}
            castShadow
          >
            <boxGeometry args={[1.2, legH, 1.2]} />
            <meshStandardMaterial color={TRUSS} metalness={0.4} />
          </mesh>
          <mesh
            position={[side * (width / 2 - 1.5), legH / 2 + 0.8, depth / 2 - 2]}
            castShadow
          >
            <boxGeometry args={[1.2, legH, 1.2]} />
            <meshStandardMaterial color={TRUSS} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Speaker stacks — crowd side */}
      {[-0.35, 0, 0.35].map((offset, i) => (
        <mesh
          key={i}
          position={[offset * width, 3, depth / 2 + 1.5]}
          castShadow
        >
          <boxGeometry args={[2.5, 6, 2]} />
          <meshStandardMaterial color={SPEAKER} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function SecondaryStage({ structure }: { structure: ProceduralStructure }) {
  const { width, depth, height } = structure;
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.7, depth]} />
        <meshStandardMaterial color={STAGE_BLACK} />
      </mesh>
      <mesh position={[0, height / 2 + 0.35, -depth / 2 + 0.5]} castShadow>
        <boxGeometry args={[width * 0.85, height, 1]} />
        <meshStandardMaterial color="#151515" emissive="#9b30ff" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[0, height + 0.35, 0]} castShadow>
        <boxGeometry args={[width, 1.5, depth * 0.8]} />
        <meshStandardMaterial color={TRUSS} />
      </mesh>
    </group>
  );
}

/** Impact-style peaked tent stage */
function TentStage({ structure }: { structure: ProceduralStructure }) {
  const { width, depth, height } = structure;
  const ridge = Math.min(width, depth) * 0.55;

  return (
    <group>
      {/* Tent body — approx peaked roof with two slopes */}
      <mesh position={[0, height * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height * 0.5, depth]} />
        <meshStandardMaterial color={TENT_WHITE} roughness={0.95} />
      </mesh>
      {/* Ridge peak */}
      <mesh position={[0, height * 0.72, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[ridge, height * 0.45, 4, 1, false, Math.PI / 4]} />
        <meshStandardMaterial color={TENT_WHITE} roughness={0.9} side={2} />
      </mesh>
      {/* Open front (stage mouth) */}
      <mesh position={[0, height * 0.25, depth / 2 - 0.5]}>
        <boxGeometry args={[width * 0.6, height * 0.35, 0.3]} />
        <meshStandardMaterial color="#0a0a0a" emissive="#39ff14" emissiveIntensity={0.12} />
      </mesh>
    </group>
  );
}

/** Multi-level VIP viewing platform from drone reference */
function VipDeck({ structure }: { structure: ProceduralStructure }) {
  const { width, depth, height } = structure;
  const floorH = height / 2.2;

  return (
    <group>
      {[0, 1].map((level) => (
        <group key={level} position={[0, level * floorH + 0.3, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width * (1 - level * 0.08), 0.5, depth * (1 - level * 0.06)]} />
            <meshStandardMaterial color={VIP_WHITE} roughness={0.85} />
          </mesh>
          {/* Railing */}
          <mesh position={[0, 1.2, depth / 2 - 0.3]}>
            <boxGeometry args={[width * (1 - level * 0.08), 1.8, 0.15]} />
            <meshStandardMaterial color="#d4d4d8" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
      {/* Support columns */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}-${sz}`}
            position={[sx * (width / 2 - 2), height / 2, sz * (depth / 2 - 2)]}
            castShadow
          >
            <boxGeometry args={[0.8, height, 0.8]} />
            <meshStandardMaterial color="#d4d4d8" />
          </mesh>
        ))
      )}
    </group>
  );
}

function ExpoHall({ structure }: { structure: ProceduralStructure }) {
  const { width, depth, height } = structure;
  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={EXPO_TAN} roughness={0.95} />
    </mesh>
  );
}

function TentRow({ structure }: { structure: ProceduralStructure }) {
  const count = structure.count ?? 4;
  const tentW = structure.width / count;
  const { depth, height } = structure;

  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const offset = (i - (count - 1) / 2) * tentW;
        return (
          <group key={i} position={[offset, 0, 0]}>
            <mesh position={[0, height * 0.4, 0]} castShadow>
              <boxGeometry args={[tentW * 0.85, height * 0.6, depth]} />
              <meshStandardMaterial color={TENT_WHITE} roughness={0.95} />
            </mesh>
            <mesh position={[0, height * 0.85, 0]} castShadow>
              <coneGeometry args={[tentW * 0.45, height * 0.5, 4, 1, false, Math.PI / 4]} />
              <meshStandardMaterial color={TENT_WHITE} side={2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
