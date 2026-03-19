import {
  PROFILE_SNAPSHOT_REQUEST_TYPE,
  type ProfileSnapshot,
  type ProfileSnapshotResponse,
} from "../../utils/profile-snapshot";
import { copyText } from "../../utils/clipboard";

type ViewState =
  | { kind: "loading" }
  | { kind: "unsupported"; message: string }
  | { kind: "ready"; snapshot: ProfileSnapshot }
  | { kind: "error"; message: string };

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Popup root element was not found.");
}

app.append(createShell());
renderState({ kind: "loading" });

void initialize();

async function initialize(): Promise<void> {
  try {
    const snapshot = await requestSnapshot();
    if (!snapshot) {
      renderState({
        kind: "unsupported",
        message:
          "Open a public LinkedIn profile page under linkedin.com/in/... and try again.",
      });
      return;
    }

    renderState({ kind: "ready", snapshot });
  } catch (error) {
    renderState({
      kind: "error",
      message: formatError(error),
    });
  }
}

async function requestSnapshot(): Promise<ProfileSnapshot | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return null;
  }

  let response: ProfileSnapshotResponse | undefined;
  try {
    response = (await chrome.tabs.sendMessage(tab.id, {
      type: PROFILE_SNAPSHOT_REQUEST_TYPE,
    })) as ProfileSnapshotResponse | undefined;
  } catch (_error) {
    return null;
  }

  if (!response) {
    return null;
  }

  if (!response.ok) {
    throw new Error(response.error);
  }

  if (!response.snapshot) {
    return null;
  }

  return response.snapshot;
}

function createShell(): HTMLElement {
  const shell = document.createElement("section");
  shell.className = "shell";
  shell.innerHTML = `
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --panel: rgba(255, 255, 255, 0.92);
        --panel-strong: #ffffff;
        --text: #102033;
        --muted: #617085;
        --accent: #0a66c2;
        --accent-strong: #004182;
        --border: rgba(16, 32, 51, 0.1);
        --success: #0f7d40;
        --warning: #9a5b00;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-width: 380px;
        background:
          radial-gradient(circle at top, rgba(10, 102, 194, 0.14), transparent 42%),
          linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
        color: var(--text);
        font-family: Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .shell {
        padding: 16px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 18px 40px rgba(16, 32, 51, 0.12);
        overflow: hidden;
      }

      .hero {
        padding: 18px 18px 14px;
        background: linear-gradient(135deg, rgba(10, 102, 194, 0.12), rgba(255, 255, 255, 0.6));
        border-bottom: 1px solid var(--border);
      }

      .eyebrow {
        margin: 0 0 6px;
        color: var(--accent-strong);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.14em;
      }

      h1 {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
      }

      .subtle {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .content {
        padding: 16px 18px 18px;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 14px;
      }

      button {
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 10px 14px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease;
      }

      button:hover {
        transform: translateY(-1px);
      }

      button:active {
        transform: translateY(0);
      }

      .primary {
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        color: white;
        box-shadow: 0 10px 18px rgba(10, 102, 194, 0.24);
      }

      .secondary {
        background: rgba(16, 32, 51, 0.06);
        color: var(--text);
      }

      .status {
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--muted);
      }

      .status.good {
        color: var(--success);
      }

      .status.bad {
        color: var(--warning);
      }

      .grid {
        display: grid;
        gap: 10px;
      }

      .field {
        border: 1px solid var(--border);
        border-radius: 16px;
        background: var(--panel-strong);
        padding: 12px 12px 10px;
      }

      .label {
        margin: 0 0 6px;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .value {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        word-break: break-word;
        white-space: pre-wrap;
      }

      .section {
        margin-top: 14px;
      }

      .section h2 {
        margin: 0 0 8px;
        font-size: 13px;
        color: var(--text);
      }

      .items {
        display: grid;
        gap: 8px;
      }

      .item {
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(16, 32, 51, 0.04);
        border: 1px solid rgba(16, 32, 51, 0.08);
        font-size: 13px;
        line-height: 1.45;
      }

      .empty {
        padding: 14px;
        border-radius: 16px;
        background: rgba(16, 32, 51, 0.04);
        color: var(--muted);
        font-size: 13px;
        line-height: 1.5;
      }

      .toast {
        margin-top: 10px;
        min-height: 18px;
        font-size: 12px;
        color: var(--success);
      }

      .json {
        max-height: 180px;
        overflow: auto;
      }
    </style>
    <div class="panel" id="panel">
      <div class="hero">
        <p class="eyebrow">LinkedIn Profile Snapshot</p>
        <h1 id="title">Loading profile data</h1>
        <p class="subtle" id="subtitle">Reading the active tab and extracting visible profile details.</p>
      </div>
      <div class="content" id="content"></div>
    </div>
  `;

  return shell;
}

function renderState(state: ViewState): void {
  const title = document.querySelector<HTMLElement>("#title");
  const subtitle = document.querySelector<HTMLElement>("#subtitle");
  const content = document.querySelector<HTMLElement>("#content");

  if (!title || !subtitle || !content) {
    return;
  }

  content.replaceChildren();

  switch (state.kind) {
    case "loading": {
      title.textContent = "Inspecting active tab";
      subtitle.textContent = "Waiting for a LinkedIn profile page response.";
      content.append(createStatus("Loading the profile snapshot...", "status"));
      break;
    }
    case "unsupported": {
      title.textContent = "Profile not available";
      subtitle.textContent = "This tab is not a supported LinkedIn profile page.";
      content.append(createStatus(state.message, "status bad"));
      break;
    }
    case "error": {
      title.textContent = "Unable to load";
      subtitle.textContent = "The extension hit an unexpected issue.";
      content.append(createStatus(state.message, "status bad"));
      break;
    }
    case "ready": {
      title.textContent = state.snapshot.name || "LinkedIn profile";
      subtitle.textContent = state.snapshot.headline || "Visible profile details captured from the page.";
      content.append(renderSnapshot(state.snapshot));
      break;
    }
  }
}

function renderSnapshot(snapshot: ProfileSnapshot): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  toolbar.append(
    createButton("Copy LinkedIn URL", async () => {
      await copyText(snapshot.profileUrl);
      updateToast("LinkedIn URL copied.");
    }, "primary"),
    createButton("Copy JSON", async () => {
      await copyText(JSON.stringify(snapshot, null, 2));
      updateToast("Snapshot JSON copied.");
    }, "secondary"),
  );

  fragment.append(toolbar, createToast(), renderFields(snapshot));

  if (snapshot.sections.length > 0) {
    const sections = document.createElement("div");
    sections.className = "section";

    const heading = document.createElement("h2");
    heading.textContent = "Visible sections";
    sections.append(heading);

    const items = document.createElement("div");
    items.className = "items";

    for (const section of snapshot.sections) {
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `<strong>${escapeHtml(section.title)}</strong><br />${escapeHtml(section.items.join(" • "))}`;
      items.append(item);
    }

    sections.append(items);
    fragment.append(sections);
  }

  return fragment;
}

function renderFields(snapshot: ProfileSnapshot): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "grid";

  const fields: Array<[string, string]> = [
    ["Profile URL", snapshot.profileUrl],
    ["Page title", snapshot.pageTitle],
    ["Name", snapshot.name],
    ["Headline", snapshot.headline],
    ["Location", snapshot.location],
    ["Summary", snapshot.summary],
    ["Captured at", snapshot.capturedAt],
  ];

  for (const [label, value] of fields) {
    if (!value) {
      continue;
    }

    grid.append(createField(label, value));
  }

  return grid;
}

function createField(label: string, value: string): HTMLElement {
  const field = document.createElement("div");
  field.className = "field";

  const labelElement = document.createElement("p");
  labelElement.className = "label";
  labelElement.textContent = label;

  const valueElement = document.createElement("p");
  valueElement.className = "value";
  valueElement.textContent = value;

  field.append(labelElement, valueElement);
  return field;
}

function createButton(
  label: string,
  onClick: () => Promise<void>,
  className: "primary" | "secondary",
): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await onClick();
    } finally {
      button.disabled = false;
    }
  });
  return button;
}

function createStatus(message: string, className: string): HTMLElement {
  const status = document.createElement("p");
  status.className = className;
  status.textContent = message;
  return status;
}

function createToast(): HTMLElement {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.toast = "true";
  return toast;
}

function updateToast(message: string): void {
  const toast = document.querySelector<HTMLElement>('[data-toast="true"]');
  if (!toast) {
    return;
  }

  toast.textContent = message;
  window.setTimeout(() => {
    if (toast.textContent === message) {
      toast.textContent = "";
    }
  }, 1500);
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred.";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
