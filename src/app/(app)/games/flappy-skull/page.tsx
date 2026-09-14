import { GameShell } from "@/components/games/GameShell";
import { FlappySkullGame } from "@/components/games/FlappySkullGame";

export default function FlappySkullPage() {
  return (
    <GameShell
      title="Flappy Skull"
      subtitle="Tap to fly. Unlock sunglasses at 5 jumps, headphones at 10."
    >
      <FlappySkullGame />
    </GameShell>
  );
}
