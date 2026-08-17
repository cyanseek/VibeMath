import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { ROOT } from "./io";

const required = [
  "data/raw/vibemathed.snapshot.json",
  "skills/vibemath/SKILL.md",
  "public/api/v1/index.json",
  "README.md",
  "README.zh-CN.md",
];

let failed = false;
console.log(
  `Node ${process.version} (${Number(process.versions.node.split(".")[0]) >= 20 ? "ok" : "requires >=20"})`,
);
for (const path of required) {
  try {
    await access(resolve(ROOT, path));
    console.log(`ok  ${path}`);
  } catch {
    failed = true;
    console.error(`missing  ${path}`);
  }
}
if (failed) process.exitCode = 1;
