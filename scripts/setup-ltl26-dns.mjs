/**
 * Point ltl26.com at Vercel via Cloudflare DNS.
 *
 * Uses project-specific CNAME from `vercel domains verify ltl26.com`.
 * Re-run verify if Vercel changes the target.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone → DNS → Edit for ltl26.com
 *
 * Usage:
 *   set CLOUDFLARE_API_TOKEN=...
 *   node scripts/setup-ltl26-dns.mjs
 */
const ZONE_NAME = "ltl26.com";
const ZONE_ID = "7ea186031607cf40b1df4b81cc46694b";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN?.trim();

/** @see `npx vercel domains verify ltl26.com` → recommended.cname[0] */
const VERCEL_CNAME = "c54f8827fb1cb323.vercel-dns-017.com";

const RECORDS = [
  { type: "CNAME", name: "@", content: VERCEL_CNAME, proxied: false },
  { type: "CNAME", name: "www", content: VERCEL_CNAME, proxied: false },
];

if (!TOKEN) {
  console.error("Missing CLOUDFLARE_API_TOKEN (Zone DNS Edit for ltl26.com)");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(JSON.stringify(json.errors ?? json, null, 2));
  }
  return json;
}

function recordName(spec) {
  return spec.name === "@" ? ZONE_NAME : `${spec.name}.${ZONE_NAME}`;
}

async function listRecords() {
  const { result } = await cf(`/zones/${ZONE_ID}/dns_records?per_page=100`);
  return result;
}

async function upsertRecord(spec) {
  const fqdn = recordName(spec);
  const existing = (await listRecords()).filter((r) => r.name === fqdn);

  const body = {
    type: spec.type,
    name: spec.name,
    content: spec.content,
    ttl: 1,
    proxied: spec.proxied,
  };

  const sameType = existing.filter((r) => r.type === spec.type);
  if (sameType.length > 0) {
    await cf(`/zones/${ZONE_ID}/dns_records/${sameType[0].id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    console.log(`updated ${spec.type} ${spec.name} → ${spec.content}`);
  } else {
    await cf(`/zones/${ZONE_ID}/dns_records`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    console.log(`created ${spec.type} ${spec.name} → ${spec.content}`);
  }

  // Remove conflicting apex A if we use CNAME @
  if (spec.name === "@" && spec.type === "CNAME") {
    for (const r of existing.filter((row) => row.type === "A")) {
      await cf(`/zones/${ZONE_ID}/dns_records/${r.id}`, { method: "DELETE" });
      console.log(`removed conflicting A ${r.content}`);
    }
  }
}

try {
  console.log(`Configuring DNS for ${ZONE_NAME} (zone ${ZONE_ID})…`);
  for (const record of RECORDS) {
    await upsertRecord(record);
  }
  console.log("Done. Propagation usually 5–15 minutes.");
  console.log("Verify: npx vercel domains verify ltl26.com");
} catch (err) {
  console.error(err.message ?? err);
  process.exit(1);
}
