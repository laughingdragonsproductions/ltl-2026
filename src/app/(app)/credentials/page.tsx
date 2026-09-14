import { CredentialsGuide } from "@/components/CredentialsGuide";

export default function CredentialsPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">Credentials</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        Wristbands, VIP credentials, and what to bring. Personalized by pass tier in the header.
      </p>
      <div className="mt-6">
        <CredentialsGuide />
      </div>
    </div>
  );
}
