/** Readiness belongs to this page's edition and the bytes currently retained. */
interface EditionReply {
  type: "SYNGRAPHE_EDITION";
  edition: string;
  complete: boolean;
}

function inspectWorker(worker: ServiceWorker, repair = false): Promise<EditionReply | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const finish = (reply: EditionReply | null) => {
      clearTimeout(timeout);
      channel.port1.close();
      resolve(reply);
    };
    // Older published workers may not implement these messages. Silence does
    // not establish readiness. A repair has its own bounded network deadline.
    const timeout = setTimeout(() => finish(null), repair ? 30000 : 5000);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      const data = event.data;
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        data.type === "SYNGRAPHE_EDITION" &&
        "edition" in data &&
        typeof data.edition === "string" &&
        "complete" in data &&
        typeof data.complete === "boolean"
      )
        finish(data as EditionReply);
      else finish(null);
    };
    try {
      worker.postMessage(
        {
          type: repair ? "SYNGRAPHE_REPAIR_EDITION" : "SYNGRAPHE_INSPECT_EDITION",
          edition: __EDITION__,
        },
        [channel.port2],
      );
    } catch {
      finish(null);
    }
  });
}

export function prepareOffline(status: HTMLElement, reload: HTMLButtonElement): void {
  if (import.meta.env.DEV) {
    status.textContent =
      "Development preview · offline saving is available in the production build.";
    reload.hidden = true;
    return;
  }
  if (!("serviceWorker" in navigator)) {
    status.textContent =
      "Offline saving is unavailable in this browser. You can save an illustrated reading.";
    reload.hidden = true;
    return;
  }
  const container = navigator.serviceWorker;
  const check = document.createElement("button");
  check.type = "button";
  check.id = "offline-check";
  check.textContent = "Check offline copy";
  status.after(check);
  let registration: ServiceWorkerRegistration | undefined;
  let revision = 0;
  let verifiedCurrent = false;
  let installFailed = false;
  let incomplete = false;
  let repairing = false;
  const observedWorkers = new WeakSet<ServiceWorker>();
  const pending = () => {
    reload.hidden = true;
    check.disabled = Boolean(registration?.installing || registration?.waiting);
    check.textContent = "Retry offline saving";
    status.textContent = installFailed
      ? "This edition could not be saved offline. Keep this tab open to continue reading."
      : !registration || registration.installing || registration.waiting
        ? "Saving this edition for offline reading…"
        : "This edition is not saved offline. Keep this tab open to continue reading.";
  };
  const refresh = async () => {
    const currentRevision = ++revision;
    if (repairing) return;
    if (registration?.installing || registration?.waiting) {
      pending();
      return;
    }
    const worker = container.controller;
    if (!worker) {
      pending();
      // A navigation may finish after activation has enumerated its clients.
      if (registration?.active?.state === "activated")
        registration.active.postMessage({ type: "SYNGRAPHE_CLAIM_EDITION", edition: __EDITION__ });
      return;
    }
    status.textContent = "Checking the saved edition and source pages…";
    check.disabled = true;
    const reply = await inspectWorker(worker);
    // An older reply must not overwrite the current controller's state.
    if (currentRevision !== revision || worker !== container.controller) return;
    check.disabled = false;
    incomplete = reply?.edition === __EDITION__ && !reply.complete;
    if (reply?.edition === __EDITION__ && reply.complete) {
      verifiedCurrent = true;
      status.textContent = "Edition ready offline, including source pages";
      reload.hidden = true;
      check.textContent = "Check offline copy";
    } else if (incomplete) {
      status.textContent =
        "Offline copy is incomplete. Reconnect, then save the copy again. Your settings stay in this tab.";
      reload.hidden = true;
      check.textContent = "Save offline copy again";
    } else if (verifiedCurrent && reply?.complete && reply.edition !== __EDITION__) {
      status.textContent = "A different edition is now saved offline. Reload to read that edition.";
      reload.hidden = false;
      check.hidden = true;
    } else {
      pending();
    }
  };
  const observe = (worker: ServiceWorker | null) => {
    if (!worker || observedWorkers.has(worker)) return;
    observedWorkers.add(worker);
    let activated = worker.state === "activated";
    const changed = () => {
      if (worker.state === "activated") activated = true;
      if (worker.state === "redundant" && !activated) installFailed = true;
      void refresh();
    };
    worker.addEventListener("statechange", changed);
    changed();
  };
  reload.addEventListener("click", () => location.reload());
  container.addEventListener("controllerchange", () => {
    // The repair result belongs to the replaced worker, never to its successor.
    repairing = false;
    check.hidden = false;
    void refresh();
  });
  const register = () =>
    container
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: "none",
      })
      .then((result) => {
        if (registration !== result)
          result.addEventListener("updatefound", () => {
            installFailed = false;
            observe(result.installing);
          });
        registration = result;
        observe(result.installing);
        observe(result.waiting);
        observe(result.active);
        void refresh();
      })
      .catch(() => {
        installFailed = true;
        void refresh();
      });
  check.addEventListener("click", async () => {
    const worker = container.controller;
    if (!incomplete || !worker) {
      if (!verifiedCurrent) await register();
      await refresh();
      return;
    }
    repairing = true;
    ++revision;
    check.disabled = true;
    status.textContent = "Saving the complete offline copy again. Your settings stay in this tab…";
    const reply = await inspectWorker(worker, true);
    if (worker !== container.controller) return;
    repairing = false;
    await refresh();
    if (!reply?.complete && incomplete)
      status.textContent =
        "The offline copy could not be repaired. Reconnect and try saving again; your settings are still here.";
  });
  window.addEventListener("online", () => {
    installFailed = false;
    // Failed first installs may discard their registration altogether.
    if (registration?.active)
      registration.update().catch(() => {
        installFailed = true;
        void refresh();
      });
    else void register();
    void refresh();
  });
  window.addEventListener("offline", () => void refresh());
  window.addEventListener("focus", () => void refresh());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refresh();
  });
  void register();
}
