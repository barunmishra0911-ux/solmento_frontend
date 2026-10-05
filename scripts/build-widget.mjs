import { build } from "vite";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await build({
  configFile: false,
  root,
  publicDir: false,
  build: {
    outDir: path.join(root, "public/widget"),
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: path.join(root, "src/widget/chatbot-widget.js"),
      name: "SolmentoChatbotWidget",
      formats: ["iife"],
      fileName: () => "chatbot-widget.min.js",
    },
  },
});

const clientMin = path.join(root, "public/widget/chatbot-widget.min.js");
const serverWidgetDir = path.resolve(root, "../server/public/widget");
const serverMin = path.join(serverWidgetDir, "chatbot-widget.min.js");
try {
  await fs.mkdir(serverWidgetDir, { recursive: true });
  await fs.copyFile(clientMin, serverMin);
  console.log("Successfully synchronized widget bundle to server/public/widget/chatbot-widget.min.js");
} catch (err) {
  console.warn("Could not copy widget to server public widget directory:", err.message);
}
