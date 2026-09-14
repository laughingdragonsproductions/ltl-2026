import festival from "../../data/festival.json";
import credentials from "../../data/credentials.json";
import passes from "../../data/passes.json";
import parking from "../../data/parking.json";
import stages from "../../data/stages.json";
import entrances from "../../data/entrances.json";
import vipZones from "../../data/vip-zones.json";
import foodZones from "../../data/food-zones.json";
import partners from "../../data/partners.json";
import kingdom from "../../data/kingdom.json";
import schedule from "../../data/schedule.json";
import bagPolicy from "../../data/bag-policy.json";
import sources from "../../data/sources.json";
import pois from "../../data/pois.json";

export type PassTier = "ga" | "vip" | "topshelf";

export const data = {
  festival,
  credentials,
  passes,
  parking,
  stages,
  entrances,
  vipZones,
  foodZones,
  partners,
  kingdom,
  schedule,
  bagPolicy,
  sources,
  pois,
};

export function getStageName(stageId: string): string {
  const stage = stages.stages.find((s) => s.id === stageId);
  return stage?.name ?? stageId;
}

export function tierHasAccess(
  userTier: PassTier,
  requiredTiers: string[] | undefined
): boolean {
  if (!requiredTiers || requiredTiers.length === 0) return true;
  if (requiredTiers.includes(userTier)) return true;
  if (userTier === "topshelf") return true;
  if (userTier === "vip" && requiredTiers.includes("ga")) return true;
  return false;
}
