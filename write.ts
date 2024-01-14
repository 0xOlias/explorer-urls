import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Absolute path to viem/chains/definitions directory.
const definitionsDir = process.env.VIEM_CHAINS_DIR!;

const results = JSON.parse(readFileSync(`./results-1705189173.json`, "utf8"));

const files = readdirSync(definitionsDir, { withFileTypes: true })
	.filter((f) => !f.isDirectory())
	.map((f) => f.name);

for (const file of files) {
	const filePath = path.join(definitionsDir, file);

	const chainKey = file.replace(".ts", "");
	const newBlockExplorers = results[chainKey];

	const contents = readFileSync(filePath, "utf8");
	const start = contents.indexOf("\n  blockExplorers: ");
	const end = contents.indexOf("\n  }", start) + 4;

	if (start === -1 || end === -1 || newBlockExplorers === undefined) continue;

	const updated = `${contents.substring(
		0,
		start,
	)}blockExplorers: ${JSON.stringify(
		newBlockExplorers.blockExplorers,
		null,
		2,
	)}${contents.substring(end)}`;

	writeFileSync(filePath, updated);
}
