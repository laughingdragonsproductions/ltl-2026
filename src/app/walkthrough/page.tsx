import { WalkthroughLoader } from "@/components/walkthrough/WalkthroughLoader";

export default function WalkthroughPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Virtual Walkthrough</h1>
        <p className="mt-2 max-w-3xl text-zinc-400">
          First-person walk on the official festival map or open satellite imagery
          georeferenced to the Kentucky Expo Center. Use the guided VIP tour to hit
          entrances, lounges, and main stages in order.
        </p>
      </div>

      <WalkthroughLoader />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 p-5">
          <h2 className="font-bold text-orange-400">Web (now)</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Three.js walk mode with festival map ground texture, Esri satellite tiles,
            3D POI markers, and VIP zone overlays. Same data as the 2D map.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-5">
          <h2 className="font-bold text-orange-400">Unreal Engine (next)</h2>
          <p className="mt-2 text-sm text-zinc-400">
            See <code className="text-zinc-300">unreal/LTL2026/README.md</code> for
            Cesium + UE 5.8 setup. Export GeoJSON with{" "}
            <code className="text-zinc-300">npm run export:unreal</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
