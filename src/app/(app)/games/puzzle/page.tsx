import { GameShell } from "@/components/games/GameShell";
import { SliderPuzzleGame } from "@/components/games/SliderPuzzleGame";

export default function PuzzlePage() {
  return (
    <GameShell title="LTL Slider" subtitle="Rebuild the festival art tile by tile.">
      <SliderPuzzleGame />
    </GameShell>
  );
}
