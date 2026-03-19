import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: ["https://www.linkedin.com/in/*"],
  main() {
    chrome.runtime.onMessage.addListener((_message, _sender, _sendResponse) => {
      return false;
    });
  },
});
