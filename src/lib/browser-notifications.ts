const PERMISSION_ASKED_KEY = "ltl26-notification-permission-asked";

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function hasAskedNotificationPermission(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(PERMISSION_ASKED_KEY) === "1";
}

/** Must be called from a user gesture (toggle, button). */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  localStorage.setItem(PERMISSION_ASKED_KEY, "1");
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export type BrowserNotifyOptions = {
  title: string;
  body: string;
  tag?: string;
  url?: string;
};

/** Show a system notification when permitted (works better with tab backgrounded). */
export async function showBrowserNotification(opts: BrowserNotifyOptions): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const payload = {
    title: opts.title,
    body: opts.body,
    tag: opts.tag ?? "ltl26-alert",
    url: opts.url ?? "/schedule",
  };

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) {
      await reg.showNotification(payload.title, {
        body: payload.body,
        tag: payload.tag,
        icon: "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        data: { url: payload.url },
      });
      return;
    }
  } catch {
    /* fall through to page Notification */
  }

  try {
    const n = new Notification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: "/icons/icon-192.svg",
      data: { url: payload.url },
    });
    n.onclick = () => {
      window.focus();
      if (payload.url) window.location.href = payload.url;
      n.close();
    };
  } catch {
    /* ignore */
  }
}
