import { GameShell } from "@/components/games/GameShell";
import { HangmanGame } from "@/components/games/HangmanGame";

export default function HangmanPage() {
  return (
    <GameShell title="Hangman" subtitle="Festival words — don't let the skull go limp.">
      <HangmanGame />
    </GameShell>
  );
}
