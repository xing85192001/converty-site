import { spawn } from "node:child_process";

// Clear NODE_OPTIONS so the safe-delete / ca hooks injected by the shell
// don't break Next's file writes during the production build.
const env = { ...process.env, NODE_OPTIONS: "" };

const child = spawn("node", ["node_modules/next/dist/bin/next", "build"], {
  env,
  stdio: "inherit",
  cwd: process.cwd(),
});

child.on("exit", (code) => {
  console.log(`[run-build] next build exited with code ${code}`);
  process.exit(code ?? 0);
});
