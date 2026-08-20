const fs = require("fs");
const path = require("path");

const root = __dirname;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const missing = [];
let checked = 0;

for (const file of walk(root).filter((candidate) => candidate.endsWith(".md"))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split("#", 1)[0];
    if (!target || /^(?:https?:|mailto:)/.test(target) || target === "../../issues") continue;
    checked += 1;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) missing.push(`${path.relative(root, file)} -> ${target}`);
  }
}

if (missing.length) {
  throw new Error(`Missing local Markdown targets:\n${missing.join("\n")}`);
}

console.log(`${checked} local Markdown links resolve`);
