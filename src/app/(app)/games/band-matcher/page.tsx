import { GameShell } from "@/components/games/GameShell";
import { GamePremiumGate } from "@/components/games/GamePremiumGate";
import { BandMatcherPlaceholder } from "@/components/games/BandMatcherPlaceholder";

export default function BandMatcherPage() {
  return (
    <GameShell
      title="Band Matcher"
      subtitle="Flip tiles and match band logo pairs."
    >
      <GamePremiumGate gameId="band-matcher" gameTitle="Band Matcher">
        <BandMatcherPlaceholder />
      </GamePremiumGate>
    </GameShell>
  );
}
