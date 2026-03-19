import { defineContentScript } from "wxt/utils/define-content-script";

import {
  buildProfileSnapshot,
  isProfileSnapshotRequest,
  type ProfileSnapshotResponse,
} from "../utils/profile-snapshot";

export default defineContentScript({
  matches: ["https://www.linkedin.com/in/*"],
  main() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isProfileSnapshotRequest(message)) {
        return false;
      }

      try {
        const response: ProfileSnapshotResponse = {
          ok: true,
          snapshot: buildProfileSnapshot(document, window.location.href),
        };

        sendResponse(response);
      } catch (error) {
        const response: ProfileSnapshotResponse = {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to read the profile page.",
        };

        sendResponse(response);
      }

      return false;
    });
  },
});
