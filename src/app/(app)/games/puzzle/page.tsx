import { GameShell } from "@/components/games/GameShell";
import { GamePremiumGate } from "@/components/games/GamePremiumGate";
import { SliderPuzzleGame } from "@/components/games/SliderPuzzleGame";

export default function PuzzlePage() {
  return (
    <GameShell title="LTL Slider" subtitle="Rebuild the festival art tile by tile.">
      <GamePremiumGate gameId="puzzle" gameTitle="LTL Slider">
        <SliderPuzzleGame />
      </GamePremiumGate>
    </GameShell>
  );
}
