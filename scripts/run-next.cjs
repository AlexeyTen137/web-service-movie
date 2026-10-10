const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const command = process.argv[2] || "dev";
let runtime = root;
if (root.includes("#")) {
  const hash = crypto
    .createHash("sha256")
    .update(root)
    .digest("hex")
    .slice(0, 10);
  runtime = path.join(os.tmpdir(), `frame-runtime-${hash}`);
  fs.mkdirSync(runtime, { recursive: true });
  const files = [
    "app",
    "components",
    "lib",
    "public",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next-env.d.ts",
    "postcss.config.mjs",
    "next.config.js",
    ".env.local",
    ".env",
  ];
  const copy = (name) => {
    const src = path.join(root, name);
    if (fs.existsSync(src))
      fs.cpSync(src, path.join(runtime, name), { recursive: true });
  };
  files.forEach(copy);
  const marker = path.join(runtime, ".dependencies-version");
  const version = fs.readFileSync(path.join(root, "package-lock.json"), "utf8");
  if (!fs.existsSync(marker) || fs.readFileSync(marker, "utf8") !== version) {
    console.log("FRAME: preparing a runtime path compatible with Next.js…");
    fs.cpSync(
      path.join(root, "node_modules"),
      path.join(runtime, "node_modules"),
      { recursive: true },
    );
    fs.writeFileSync(marker, version);
  }
  if (command === "dev") {
    for (const dir of ["app", "components", "lib", "public"]) {
      let timer;
      fs.watch(path.join(root, dir), { recursive: true }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => copy(dir), 100);
      });
    }
  }
  console.log(
    `FRAME: runtime ${runtime}; source files remain in your workspace.`,
  );
}
const args = [command];
if (command === "dev" || command === "start")
  args.push("--hostname", "0.0.0.0");
const child = spawn(
  process.execPath,
  [
    path.join(runtime, "node_modules/next/dist/bin/next"),
    ...args,
    ...process.argv.slice(3),
  ],
  { cwd: runtime, stdio: "inherit", env: process.env },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
