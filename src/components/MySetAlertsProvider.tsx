"use client";

import { SetAlertToast } from "@/components/SetAlertToast";
import { useMySetAlerts } from "@/hooks/use-my-set-alerts";

export function MySetAlertsProvider() {
  const { activeAlert, dismissAlert } = useMySetAlerts();

  if (!activeAlert) return null;

  return <SetAlertToast alert={activeAlert} onDismiss={dismissAlert} />;
}
