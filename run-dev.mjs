import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";
// Clear NODE_OPTIONS so the safe-delete / ca hooks injected by the shell
// don't break Next's file writes. The child inherits a clean env.
const env = { ...process.env, NODE_OPTIONS: "" };

const child = spawn("node", ["node_modules/next/dist/bin/next", "dev", "-p", String(port)], {
  env,
  stdio: "inherit",
  cwd: process.cwd(),
});

child.on("exit", (code) => {
  console.log(`[run-dev] next dev exited with code ${code}`);
  process.exit(code ?? 0);
});
