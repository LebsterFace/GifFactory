import { exec, spawn } from "child_process";
import colorSchemes from "./colorSchemes.js";
import { readFile } from "fs/promises";
const ANSI = colorSchemes.chosenScheme();

const config = JSON.parse(await readFile("./config.json", "utf-8")) as {
	"LebJS Classpath"?: string;
};

const classpath = config["LebJS Classpath"];
if (classpath === undefined) {
	console.error("Classpath not defined in config. Please set the 'LebJS Classpath' option");
	process.exit(1);
}

const execPromise = (command: string, stdin: string | null = null): Promise<string> => {
	return new Promise((resolve, reject) => {
		const child = exec(command, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout.replace(/\r?\n/g, "\n"));
			}
		});

		child.stderr!.pipe(process.stderr);
		if (stdin !== null) {
			child.stdin!.write(stdin);
			child.stdin!.end();
		}
	});
};

const spawnPromise = (command: string) => {
	return new Promise((resolve, reject) => {
		const parts = command.split(" ");
		const child = spawn(parts.shift()!, parts);

		child.stdin.end();
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);

		child.once("close", (code, signal) => {
			resolve({ code, signal });
		});

		child.once("error", (error) => {
			reject(error);
		});
	});
};

export type Output =
	{ type: "ansi", value: string; } |
	{ type: "text", value: string; } |
	{ type: "newline"; };

const parseStdout = (output: string): Output[] => {
	return output.split(/(\x1B\[\d{1,2}m|\n)/g).map(value => {
		if (value in ANSI) {
			return { type: "ansi", value: ANSI[value as keyof typeof ANSI] } as const;
		} else if (value === "\n") {
			return { type: "newline" } as const;
		} else {
			return { type: "text", value } as const;
		}
	}).filter(({ type, value }) => {
		if (type === "text" && value === "") return false;
		return true;
	});
};

const LebJS = async (commands: string[]) => {
	const CMD = `java -cp ${classpath} xyz.lebster.Main --gif`;
	console.log(CMD);

	const stdout = await execPromise(CMD, commands.join("\n"));
	return stdout.split("#[END-OF-OUTPUT]#").map(parseStdout);
};

export { LebJS, execPromise, spawnPromise };