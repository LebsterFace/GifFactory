import { exec, spawn } from "child_process";
import colorSchemes from "./colorSchemes.js";
const ANSI = colorSchemes.chosenScheme();
import 'dotenv/config';

const classpath = process.env.LEBJS_CLASSPATH;

const execPromise = (command: string, stdin: string | null = null): Promise<string> => {
	return new Promise((resolve, reject) => {
		const child = exec(command, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout.replace(/\r?\n/g, "\n"));
			}
		});

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

export type ParsedStdout =
	{ type: "ansi", value: string; } |
	{ type: "text", value: string; } |
	{ type: "newline"; };

const parseStdout = (output: string): ParsedStdout[] => {
	return output.split(/(\[\d{1,2}m|\n)/g).map(value => {
		if (value in ANSI) {
			return { type: "ansi", value: ANSI[value as keyof typeof ANSI] };
		} else if (value === "\n") {
			return { type: "newline" };
		} else {
			return { type: "text", value };
		}
	});
};

const LebJS = async (commands: string[]) => {
	const CMD = `java -cp ${classpath} xyz.lebster.Main --AST --gif`;
	console.log(CMD);

	const stdout = await execPromise(CMD, commands.join("\n"));
	return stdout.split("#[END-OF-OUTPUT]#").map(parseStdout);
};

export { LebJS, execPromise, spawnPromise };