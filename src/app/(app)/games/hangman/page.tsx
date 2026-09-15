import { GameShell } from "@/components/games/GameShell";
import { GamePremiumGate } from "@/components/games/GamePremiumGate";
import { HangmanGame } from "@/components/games/HangmanGame";

export default function HangmanPage() {
  return (
    <GameShell title="Hangman" subtitle="Festival words — don't let the skull go limp.">
      <GamePremiumGate gameId="hangman" gameTitle="Hangman">
        <HangmanGame />
      </GamePremiumGate>
    </GameShell>
  );
}
