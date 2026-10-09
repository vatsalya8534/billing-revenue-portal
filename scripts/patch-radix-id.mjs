import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [
  {
    file: path.join(root, "node_modules/@radix-ui/react-id/dist/index.mjs"),
    layoutEffect: "useLayoutEffect",
  },
  {
    file: path.join(root, "node_modules/@radix-ui/react-id/dist/index.js"),
    layoutEffect: "(0, import_react_use_layout_effect.useLayoutEffect)",
  },
];

const pattern =
  /function useId\(deterministicId\) \{[\s\S]*?\n\}/;

for (const target of targets) {
  if (!fs.existsSync(target.file)) continue;

  const source = fs.readFileSync(target.file, "utf8");
  if (source.includes("const reactId = useReactId()")) continue;

  const next = source.replace(
    pattern,
    `function useId(deterministicId) {
  const reactId = useReactId();
  const [fallbackId, setFallbackId] = React.useState();
  ${target.layoutEffect}(() => {
    if (!deterministicId && !reactId) {
      setFallbackId((current) => current ?? String(count++));
    }
  }, [deterministicId, reactId]);
  if (deterministicId) return deterministicId;
  if (reactId) return \`radix-\${reactId}\`;
  return fallbackId ? \`radix-\${fallbackId}\` : "";
}`,
  );

  if (next === source) {
    throw new Error(`Could not patch ${target.file}`);
  }

  fs.writeFileSync(target.file, next);
}
