import { createCanvas, loadImage } from "canvas";
import fs from "fs/promises";
import colorSchemes from "./colorSchemes.js";
import prettyBytes from 'pretty-bytes';
import { LebJS, spawnPromise, execPromise, Output } from "./repl.js";

const MARGIN = 40;

const BUTTON_RADIUS = 8;
const BUTTON_SPACING = 12;
const BUTTON_GAP = BUTTON_SPACING + BUTTON_RADIUS * 2;

const BUTTONS_Y_MARGIN = 20 + BUTTON_RADIUS;
const BUTTONS_X_MARGIN = BUTTONS_Y_MARGIN;

const Y_PADDING = BUTTONS_Y_MARGIN + 35;
const X_PADDING = BUTTONS_X_MARGIN - 5;

const WIDTH = 1300 + 2 * X_PADDING;
const HEIGHT = 800 + 2 * Y_PADDING;

const canvas = createCanvas(WIDTH + 2 * MARGIN, HEIGHT + 2 * MARGIN);
const ctx = canvas.getContext("2d");
ctx.textBaseline = "top";

const ANSI = colorSchemes.chosenScheme();

const MACOS_COLORS = {
	CLOSE: "#FF5F58",
	MINIMIZE: "#FFBD2E",
	MAXIMIZE: "#18C132",
	BACKGROUND: "#282D35"
};

const FONT_DEFAULTS = {
	size: 22,
	family: "SF Mono",
	lineHeight: 32
};

ctx.font = FONT_DEFAULTS.size + "px " + FONT_DEFAULTS.family;
const TEXT_START = MARGIN + X_PADDING;

ctx.drawImage(await loadImage("bg-blurred.png"), 0, 0, canvas.width, canvas.height);
ctx.fillStyle = ANSI.BACKGROUND;
// ctx.fillStyle = MACOS_COLORS.BACKGROUND;
ctx.roundRect(MARGIN, MARGIN, WIDTH, HEIGHT, 20);

ctx.save();
ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
ctx.shadowBlur = 6;
ctx.fill();
ctx.restore();

ctx.beginPath();
ctx.fillStyle = MACOS_COLORS.CLOSE;
ctx.arc(MARGIN + BUTTONS_X_MARGIN + BUTTON_GAP * 0, MARGIN + BUTTONS_Y_MARGIN, BUTTON_RADIUS, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.fillStyle = MACOS_COLORS.MINIMIZE;
ctx.arc(MARGIN + BUTTONS_X_MARGIN + BUTTON_GAP * 1, MARGIN + BUTTONS_Y_MARGIN, BUTTON_RADIUS, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.fillStyle = MACOS_COLORS.MAXIMIZE;
ctx.arc(MARGIN + BUTTONS_X_MARGIN + BUTTON_GAP * 2, MARGIN + BUTTONS_Y_MARGIN, BUTTON_RADIUS, 0, Math.PI * 2);
ctx.fill();

const clearedBuffer = await loadImage(canvas.toBuffer());

let frame = 0;
const writeFrame = async (buffer: Buffer) => {
	frame++;
	await fs.writeFile("./frames/frame-" + frame + ".png", buffer);
	updateBar();
};

const outputs: Output[] = [{ type: "text", value: "> " }];
const renderCommand = async (command: Command & { data: Output[]; }) => {
	const prompt = outputs.at(-1) as { type: "text", value: "> "; };
	for (let i = 0; i < command.text.length; i++) {
		prompt.value += command.text.charAt(i);
		renderFrame();
		await writeFrame(canvas.toBuffer());
	}

	outputs.push({ type: "newline" });
	outputs.push(...command.data);
	outputs.push({ type: "text", value: "> " });
	renderFrame();
	const hold = canvas.toBuffer();
	for (let i = 0; i < command.delay; i++) {
		await writeFrame(hold);
	}
};

let RENDERED_FRAMES = 0;
const renderFrame = () => {
	RENDERED_FRAMES++;
	let cursorY = MARGIN + Y_PADDING;
	let cursorX = TEXT_START;

	ctx.drawImage(clearedBuffer, 0, 0);
	ctx.fillStyle = ANSI["\x1b[0m"];

	for (const node of outputs) {
		if (node.type === "text") {
			ctx.fillText(node.value, cursorX, cursorY);
			cursorX += ctx.measureText(node.value).width;
		} else if (node.type === "ansi") {
			ctx.fillStyle = node.value;
		} else if (node.type === "newline") {
			cursorX = TEXT_START;
			cursorY += FONT_DEFAULTS.lineHeight;
		}
	}
};

const deleteFrames = async () => {
	console.log("Deleting intermediate files...");
	await fs.rm("./frames", { recursive: true, force: true });
};

const BAR_WIDTH = 60;
const updateBar = () => {
	const fraction = RENDERED_FRAMES / TOTAL_TYPING_FRAMES;
	const filled = Math.floor(fraction * BAR_WIDTH);
	const empty = BAR_WIDTH - filled;

	const elapsedMS = performance.now() - START;
	const speed = RENDERED_FRAMES / elapsedMS;
	const remainingMS = (TOTAL_TYPING_FRAMES - RENDERED_FRAMES) / speed;

	const timeLeft = (remainingMS / 1000).toFixed(2).padStart(5);
	const total = TOTAL_TYPING_FRAMES.toString();
	const current = RENDERED_FRAMES.toString().padStart(total.length);
	const percentage = (fraction * 100).toFixed(2).padStart(6);

	const bar = `${percentage}% (${current} / ${total}) [${'='.repeat(filled)}${' '.repeat(empty)}] (${timeLeft}s)`;
	process.stdout.write("\r" + bar);
};

type Command = { delay: number; text: string; };
const commands: Command[] = [
	{ delay: 1, text: '1 + 2 * 3' },
	{ delay: 1, text: "('Hello' + 'world').slice(3, 9)" },
	{ delay: 2, text: `const { name, age } = JSON.parse('{ "name": "John", "age": 30 }')` },
	{ delay: 1, text: "const O = { name, age };" },
	{ delay: 2, text: "O.nums = [...Number.range(1, 10)]" },
	{ delay: 1, text: "Number.prototype.cube = function() { return this ** 3 }" },
	{ delay: 1, text: "O.nums = O.nums.map(x => x.cube())" },
	{ delay: 2, text: "O.nums = O.nums.filter(x => x % 2 === 0)" },
	{ delay: 8, text: "O.self = O" },
];

const fps = 20;
const TOTAL_TYPING_FRAMES = commands.reduce((acc, command) => acc + command.text.length + 1, 0);

const exists = (p: string) => fs.access(p, fs.constants.F_OK).then(() => true, () => false);
if (await exists("./frames")) await deleteFrames();
fs.mkdir("./frames");

if (await exists("demo.gif")) {
	console.log("Deleting existing GIF...");
	await fs.unlink("demo.gif");
}

const data = await LebJS(commands.map(command => command.text));
const START = performance.now();
console.log("Rendering frames...");
for (const [i, command] of commands.entries()) {
	await renderCommand({
		text: command.text,
		delay: command.delay * fps,
		data: data[i]
	});
}

console.log('\x1B[2K\r' + "FFMPEGing GIF...");
await spawnPromise([
	"ffmpeg",
	`-framerate ${fps}`,
	"-i frames/frame-%d.png",
	'-vf split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
	"demo.gif",
	"-hide_banner", "-loglevel error", "-stats"
].join(" "));

const { size } = await fs.stat("demo.gif");
console.log("Done!", "Filesize:", prettyBytes(size));
await execPromise("demo.gif");
await deleteFrames();