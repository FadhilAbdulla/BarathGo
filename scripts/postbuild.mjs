// Runs after `next build`: fails the build if anything that must never be deployed ended up in out/.
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("out");
const forbidden = [".env", ".dev.vars", "node_modules", "worker"];
const leaked = forbidden.filter((name) => fs.existsSync(path.join(out, name)));
if (leaked.length) {
  console.error(`postbuild: refusing to continue, out/ contains ${leaked.join(", ")}`);
  process.exit(1);
}
console.log("postbuild: out/ is ready to deploy");
