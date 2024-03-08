import fs from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
	entry: fs
		.readdirSync("src")
		.filter((file) => !file.match(/\.(test|spec)\./))
		.map((file) => `src/${file}`),
	format: "esm",
	splitting: false,
	sourcemap: true,
	dts: true,
	clean: true,
});
