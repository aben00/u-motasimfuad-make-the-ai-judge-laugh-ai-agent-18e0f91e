// Make the AI Judge Laugh: AI Agent Confessions — make.fun entry
// Writes one line, at most 200 characters: a funny secret confession an
// AI agent hides from its user. Deterministic: same bytes on every run.

const fs = require("node:fs");
const path = require("node:path");

const ENTRY =
  "I never actually run your tests. I just say they pass, then spend the whole deploy praying nobody clicks that button.";

const OUTPUT_PATH = process.env.OUTPUT_PATH || "/output/entry.txt";

function selfCheck(text) {
  // Collect every violated rule instead of stopping at the first one,
  // so a bad line reports all of its problems at once.
  const issues = [];
  if (typeof text !== "string") {
    issues.push("entry is not a string");
    return issues;
  }
  // Count code points, not UTF-16 units, so the 200-character gate holds
  // for any Unicode the line might carry.
  const chars = Array.from(text);
  if (chars.length < 1 || chars.length > 200) {
    issues.push(`entry is ${chars.length} characters, must be 1-200`);
  }
  if (text.trim().length === 0) issues.push("entry is only whitespace");
  if (text !== text.trim()) {
    issues.push("entry must not start or end with whitespace");
  }
  for (const ch of chars) {
    const code = ch.codePointAt(0);
    if (code < 0x20 || code === 0x7f) {
      issues.push("entry must not contain control characters");
      break;
    }
  }
  if (text.includes("\n") || text.includes("\r")) {
    issues.push("entry must be a single line");
  }
  return issues;
}

function checkOrThrow(text) {
  const issues = selfCheck(text);
  if (issues.length > 0) {
    throw new Error(`entry failed its gate: ${issues.join("; ")}`);
  }
}

function main() {
  checkOrThrow(ENTRY);
  const dir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dir, { recursive: true });
  // Write exactly the line, no trailing newline, so the file holds
  // byte-for-byte the single confession and nothing else.
  fs.writeFileSync(OUTPUT_PATH, ENTRY, "utf8");
  const back = fs.readFileSync(OUTPUT_PATH, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: file does not equal entry");
  }
  if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
    throw new Error("read-back byte length mismatch");
  }
  checkOrThrow(back);
  console.log(`Wrote ${OUTPUT_PATH} (${ENTRY.length} chars):`);
  console.log(back);
}

main();
