import { GameShell } from "@/components/games/GameShell";
import { GamePremiumGate } from "@/components/games/GamePremiumGate";
import { BandMatcherGame } from "@/components/games/BandMatcherGame";

export default function BandMatcherPage() {
  return (
    <GameShell
      title="Band Matcher"
      subtitle="Flip tiles and match band logo pairs."
    >
      <GamePremiumGate gameId="band-matcher" gameTitle="Band Matcher">
        <BandMatcherGame />
      </GamePremiumGate>
    </GameShell>
  );
}
