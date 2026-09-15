import { redirect } from "next/navigation";

/** Legacy URL — editor now lives at /overlay */
export default function OverlayAdjustRedirect() {
  redirect("/overlay");
}
