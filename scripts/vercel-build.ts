import { spawnSync } from "node:child_process";

const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (process.env.DATABASE_URL) {
  console.log("[vercel-build] DATABASE_URL set, running db:push...");
  run("bun", ["run", "db:push"]);
} else {
  console.warn(
    "[vercel-build] DATABASE_URL not set, skipping db:push (run manually after first deploy)"
  );
}

run("bun", ["run", "build"]);
