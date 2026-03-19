import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    action: {
      default_icon: {
        16: "icon-16.png",
        32: "icon-32.png",
        48: "icon-48.png",
      },
      default_title: "LinkedIn Profile Snapshot",
    },
    name: "LinkedIn Profile Snapshot",
    description:
      "Extract visible LinkedIn profile details and copy the canonical profile URL in one click.",
    icons: {
      16: "icon-16.png",
      32: "icon-32.png",
      48: "icon-48.png",
      128: "icon-128.png",
    },
    permissions: ["clipboardWrite"],
    host_permissions: ["https://www.linkedin.com/in/*"],
  },
});
