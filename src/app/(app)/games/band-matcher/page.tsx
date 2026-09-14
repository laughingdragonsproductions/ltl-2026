import { GameShell } from "@/components/games/GameShell";
import { BandMatcherPlaceholder } from "@/components/games/BandMatcherPlaceholder";

export default function BandMatcherPage() {
  return (
    <GameShell
      title="Band Matcher"
      subtitle="Flip tiles and match band logo pairs."
    >
      <BandMatcherPlaceholder />
    </GameShell>
  );
}
