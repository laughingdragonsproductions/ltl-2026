import structuresData from "../../data/walkthrough-structures.json";

export type ProceduralStructureType =
  | "main-stage"
  | "secondary-stage"
  | "tent-stage"
  | "vip-deck"
  | "expo-hall"
  | "tent-row";

export type StructureType = ProceduralStructureType | "gltf";

type StructureBase = {
  id: string;
  name: string;
  mapPosition: { x: number; y: number };
  rotationY: number;
  stageId?: string;
  notes?: string;
};

export type ProceduralStructure = StructureBase & {
  type: ProceduralStructureType;
  width: number;
  depth: number;
  height: number;
  count?: number;
};

export type GltfStructure = StructureBase & {
  type: "gltf";
  modelUrl: string;
  scale?: number;
  /** Label float height when model bounds unknown */
  labelHeight?: number;
};

export type WalkthroughStructure = ProceduralStructure | GltfStructure;

export function isGltfStructure(s: WalkthroughStructure): s is GltfStructure {
  return s.type === "gltf";
}

export function structureLabelHeight(s: WalkthroughStructure): number {
  if (isGltfStructure(s)) return s.labelHeight ?? 15;
  return s.height;
}

export const WALKTHROUGH_STRUCTURES: WalkthroughStructure[] =
  structuresData.structures as WalkthroughStructure[];

export const STRUCTURE_STAGE_IDS = new Set(
  WALKTHROUGH_STRUCTURES.map((s) => s.stageId).filter(Boolean) as string[]
);
