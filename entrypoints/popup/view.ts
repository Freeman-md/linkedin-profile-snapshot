import type { ProfileSnapshot } from "../../utils/profile-snapshot";
import { POPUP_STYLES } from "./styles";

export type ViewState =
  | { kind: "loading" }
  | { kind: "unsupported"; message: string }
  | { kind: "ready"; snapshot: ProfileSnapshot }
  | { kind: "error"; message: string };

export interface SnapshotActions {
  copyProfileUrl(snapshot: ProfileSnapshot): Promise<void>;
  copyFullDetails(snapshot: ProfileSnapshot): Promise<void>;
}

export interface PopupView {
  render(state: ViewState): void;
  showToast(message: string, tone?: "success" | "error"): void;
}

export function createPopupView(
  root: HTMLDivElement,
  actions: SnapshotActions,
): PopupView {
  root.replaceChildren(createShell());

  return {
    render(state) {
      renderState(state, actions);
    },
    showToast(message, tone = "success") {
      updateToast(message, tone);
    },
  };
}

function createShell(): HTMLElement {
  const shell = document.createElement("section");
  shell.className = "shell";
  shell.innerHTML = `
    <style>${POPUP_STYLES}</style>
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

function renderState(state: ViewState, actions: SnapshotActions): void {
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
      return;
    }
    case "unsupported": {
      title.textContent = "Profile not available";
      subtitle.textContent = "This tab is not a supported LinkedIn profile page.";
      content.append(createStatus(state.message, "status bad"));
      return;
    }
    case "error": {
      title.textContent = "Unable to load";
      subtitle.textContent = "The extension hit an unexpected issue.";
      content.append(createStatus(state.message, "status bad"));
      return;
    }
    case "ready": {
      title.textContent = state.snapshot.name || "LinkedIn profile";
      subtitle.textContent =
        state.snapshot.headline || "Visible profile details captured from the page.";
      content.append(renderSnapshot(state.snapshot, actions));
      return;
    }
  }
}

function renderSnapshot(
  snapshot: ProfileSnapshot,
  actions: SnapshotActions,
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  toolbar.append(
    createButton("Copy Full Details", () => actions.copyFullDetails(snapshot), "primary"),
    createButton("Copy LinkedIn URL", () => actions.copyProfileUrl(snapshot), "secondary"),
  );

  fragment.append(toolbar, createToast(), renderFields(snapshot));

  if (snapshot.about) {
    fragment.append(
      renderTextSection("About", snapshot.about),
    );
  }

  if (snapshot.recentActivity.length > 0) {
    fragment.append(
      renderDetailBlocksSection("Recent activity", snapshot.recentActivity),
    );
  }

  if (snapshot.experiences.length > 0) {
    fragment.append(
      renderDetailBlocksSection("Experience details", snapshot.experiences),
    );
  }

  const otherSections = renderSections(snapshot);
  if (otherSections) {
    fragment.append(otherSections);
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

function renderSections(snapshot: ProfileSnapshot): HTMLElement | null {
  const visibleSections = snapshot.sections.filter((section) => {
    const normalizedTitle = section.title.toLowerCase();
    return normalizedTitle !== "about" && normalizedTitle !== "activity" && normalizedTitle !== "experience";
  });

  if (visibleSections.length === 0) {
    return null;
  }

  const section = document.createElement("div");
  section.className = "section";

  const heading = document.createElement("h2");
  heading.textContent = "Other visible sections";

  const items = document.createElement("div");
  items.className = "items";

  for (const profileSection of visibleSections) {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<strong>${escapeHtml(profileSection.title)}</strong><br />${escapeHtml(
      profileSection.items.join(" • "),
    )}`;
    items.append(item);
  }

  section.append(heading, items);
  return section;
}

function renderTextSection(title: string, content: string): HTMLElement {
  const section = document.createElement("div");
  section.className = "section";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const body = document.createElement("div");
  body.className = "field";

  const value = document.createElement("p");
  value.className = "value";
  value.textContent = content;

  body.append(value);
  section.append(heading, body);
  return section;
}

function renderDetailBlocksSection(
  title: string,
  blocks: ProfileSnapshot["recentActivity"],
): HTMLElement {
  const section = document.createElement("div");
  section.className = "section";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const items = document.createElement("div");
  items.className = "items";

  for (const block of blocks) {
    const item = document.createElement("div");
    item.className = "item";
    const details = block.details.length > 0 ? `<br />${escapeHtml(block.details.join(" • "))}` : "";
    item.innerHTML = `<strong>${escapeHtml(block.title)}</strong>${details}`;
    items.append(item);
  }

  section.append(heading, items);
  return section;
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

function updateToast(message: string, tone: "success" | "error"): void {
  const toast = document.querySelector<HTMLElement>('[data-toast="true"]');
  if (!toast) {
    return;
  }

  toast.className = tone === "error" ? "toast error" : "toast";
  toast.textContent = message;

  window.setTimeout(() => {
    if (toast.textContent === message) {
      toast.className = "toast";
      toast.textContent = "";
    }
  }, 1500);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
