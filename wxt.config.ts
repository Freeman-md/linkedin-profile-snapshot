import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "LinkedIn Profile Snapshot",
    description:
      "Extract visible LinkedIn profile details and copy the canonical profile URL in one click.",
    permissions: ["clipboardWrite"],
    host_permissions: ["https://www.linkedin.com/in/*"],
  },
});
