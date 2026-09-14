import { CredentialsGuide } from "@/components/CredentialsGuide";

export default function CredentialsPage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Credentials Guide</h1>
      <p className="mt-2 text-zinc-400">
        RFID wristband vs VIP laminate — what each does, how to get them, and VIP vs Top Shelf
        differences.
      </p>
      <div className="mt-6">
        <CredentialsGuide />
      </div>
    </div>
  );
}
