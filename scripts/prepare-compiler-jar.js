import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const jarName = "bickspec-compiler-1.0.0.jar";
const projectJar = resolve(projectRoot, "resources", "compiler", jarName);
const siblingJar = resolve(projectRoot, "..", "bickspec-lang", "app", "target", jarName);

function isUsableFile(path) {
  return existsSync(path) && statSync(path).isFile() && statSync(path).size > 0;
}

if (isUsableFile(projectJar)) {
  console.log(`Compiler JAR ready: ${projectJar}`);
  process.exit(0);
}

if (isUsableFile(siblingJar)) {
  mkdirSync(dirname(projectJar), { recursive: true });
  copyFileSync(siblingJar, projectJar);
  console.log(`Copied compiler JAR from ${siblingJar}`);
  console.log(`Compiler JAR ready: ${projectJar}`);
  process.exit(0);
}

console.error("Compiler JAR not found. Build bickspec-lang with: mvn -f app/pom.xml package");
console.error(`Checked: ${projectJar}`);
console.error(`Checked: ${siblingJar}`);
process.exit(1);
