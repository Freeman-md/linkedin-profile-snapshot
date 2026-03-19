import {
  PROFILE_SNAPSHOT_REQUEST_TYPE,
  type ProfileSnapshot,
  type ProfileSnapshotResponse,
} from "../../utils/profile-snapshot";
import { copyText } from "../../utils/clipboard";
import { createPopupView } from "./view";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Popup root element was not found.");
}

const view = createPopupView(app, {
  async copyProfileUrl(snapshot) {
    await copyWithFeedback(snapshot.profileUrl, "LinkedIn URL copied.");
  },
  async copyFullDetails(snapshot) {
    await copyWithFeedback(
      JSON.stringify(snapshot, null, 2),
      "Full profile details copied.",
    );
  },
});

view.render({ kind: "loading" });
void initialize();

async function initialize(): Promise<void> {
  try {
    const snapshot = await requestSnapshot();
    if (!snapshot) {
      view.render({
        kind: "unsupported",
        message: "Open a LinkedIn profile page under linkedin.com/in/... and try again.",
      });
      return;
    }

    view.render({ kind: "ready", snapshot });
  } catch (error) {
    view.render({
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
  } catch {
    return null;
  }

  if (!response) {
    return null;
  }

  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.snapshot ?? null;
}

async function copyWithFeedback(value: string, successMessage: string): Promise<void> {
  try {
    await copyText(value);
    view.showToast(successMessage);
  } catch {
    view.showToast("Copy failed. Try again.", "error");
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred.";
}
