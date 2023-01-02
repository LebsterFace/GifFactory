import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import * as path from "path";
import colorSchemes from "./colorSchemes.js";
import prettyBytes from 'pretty-bytes';
import { LebJS, spawnPromise, execPromise, ParsedStdout } from "./repl.js";

const Y_MARGIN = 40;
const X_MARGIN = Y_MARGIN;

const BUTTON_RADIUS = 8;
const BUTTON_SPACING = 12;
const BUTTON_GAP = BUTTON_SPACING + BUTTON_RADIUS * 2;

const BUTTONS_Y_MARGIN = 20 + BUTTON_RADIUS;
const BUTTONS_X_MARGIN = BUTTONS_Y_MARGIN;

const Y_PADDING = BUTTONS_Y_MARGIN + 25;
const X_PADDING = BUTTONS_X_MARGIN + -15;

const WIDTH = 1300 + 2 * X_PADDING;
const HEIGHT = 800 + 2 * Y_PADDING;

const canvas = createCanvas(WIDTH + 2 * X_MARGIN, HEIGHT + 2 * Y_MARGIN);
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
	lineHeight: 24
};

const PROMPT_LINE_HEIGHT = 1.1;
let CURRENT_LINE_HEIGHT = FONT_DEFAULTS.lineHeight;

const TEXT_START = 10 + X_MARGIN + X_PADDING;
const promptY = 10 + Y_MARGIN + Y_PADDING;

/********************************************************/

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number | { tl: number, tr: number, br: number, bl: number }} [radiusParam = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 */
function roundRect(
	x: number,
	y: number,
	width: number,
	height: number,
	radiusParam: number | { tl: number, tr: number, br: number, bl: number; } = 5
) {
	let radius: { tl: number, tr: number, br: number, bl: number; };
	if (typeof radiusParam === 'number') {
		radius = { tl: radiusParam, tr: radiusParam, br: radiusParam, bl: radiusParam };
	} else {
		radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radiusParam };
	}

	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
}

/********************************************************/

const renderPrompt = (text: string) => {
	ctx.fillStyle = ANSI["\x1b[0m"];
	ctx.fillText("> " + text, TEXT_START, promptY);
};

const bgImage = await loadImage("bg-blurred.png");
const clearScreen = () => {
	ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
	// ctx.fillStyle = ANSI.BACKGROUND;
	ctx.fillStyle = MACOS_COLORS.BACKGROUND;
	roundRect(X_MARGIN, Y_MARGIN, WIDTH, HEIGHT, 20);
	// ctx.stroke();
	ctx.save();
	ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
	ctx.shadowBlur = 6;
	ctx.fill();
	ctx.restore();

	ctx.beginPath();
	ctx.fillStyle = MACOS_COLORS.CLOSE;
	ctx.arc(X_MARGIN + BUTTONS_X_MARGIN + BUTTON_GAP * 0, Y_MARGIN + BUTTONS_Y_MARGIN, BUTTON_RADIUS, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = MACOS_COLORS.MINIMIZE;
	ctx.arc(X_MARGIN + BUTTONS_X_MARGIN + BUTTON_GAP * 1, Y_MARGIN + BUTTONS_Y_MARGIN, BUTTON_RADIUS, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = MACOS_COLORS.MAXIMIZE;
	ctx.arc(X_MARGIN + BUTTONS_X_MARGIN + BUTTON_GAP * 2, Y_MARGIN + BUTTONS_Y_MARGIN, BUTTON_RADIUS, 0, Math.PI * 2);
	ctx.fill();
};

const renderOutput = (data: ParsedStdout[], cursorY: number) => {
	let cursorX = TEXT_START;
	for (const node of data) {
		if (node.type === "text") {
			ctx.fillText(node.value, cursorX, cursorY);
			cursorX += ctx.measureText(node.value).width;
		} else if (node.type === "ansi") {
			ctx.fillStyle = node.value;
		} else if (node.type === "newline") {
			cursorX = TEXT_START;
			cursorY += CURRENT_LINE_HEIGHT;
		}
	}
};

let frame = 0;

const writeFrame = (buffer: Buffer) => {
	fs.writeFileSync("./frames/frame-" + frame + ".png", buffer);
	updateBar();
};

const renderFrames = async (command: WrappedCommand) => {
	if (command.fontSize) {
		ctx.font = command.fontSize + "px " + FONT_DEFAULTS.family;
		CURRENT_LINE_HEIGHT = command.fontSize + 2;
	} else {
		ctx.font = FONT_DEFAULTS.size + "px " + FONT_DEFAULTS.family;
		CURRENT_LINE_HEIGHT = FONT_DEFAULTS.lineHeight;
	}

	const prompts = Array.from({ length: command.text.length }, (_, i) =>
		command.text.slice(0, i + 1));

	for (const currentPrompt of prompts) {
		clearScreen();
		renderPrompt(currentPrompt);
		writeFrame(canvas.toBuffer());
		frame++;
	}

	clearScreen();
	renderPrompt(command.text);
	renderOutput(command.data, promptY + PROMPT_LINE_HEIGHT * CURRENT_LINE_HEIGHT);
	writeFrame(canvas.toBuffer());
	frame++;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const transparentBuffer = canvas.toBuffer();
	for (let i = 0; i < command.delay; i++) {
		writeFrame(transparentBuffer);
		frame++;
	}
};

const deleteFrames = () => {
	const files = fs.readdirSync("./frames");
	for (const file of files) {
		fs.unlinkSync(path.join("./frames", file));
	}
};

const BAR_WIDTH = 80;
const updateBar = () => {
	const percentage = frame / numFrames;
	const filled = Math.floor(percentage * BAR_WIDTH);
	const empty = BAR_WIDTH - filled;
	const bar = `${(percentage * 100).toFixed(2).padStart(6)}% [${'='.repeat(filled)}${' '.repeat(empty)}] (${frame.toString().padStart(numFrames.toString().length)} / ${numFrames})`;
	process.stdout.write("\r" + bar);
};

interface Command {
	delay: number;
	text: string;
	fontSize?: number;
};

interface WrappedCommand extends Command {
	data: ParsedStdout[];
}

const commands: Command[] = [
	{ delay: 5, text: "1 + 2 * 3" },
	{ delay: 5, text: "('Hello' + 'world').slice(3, 9)" },
	{ delay: 7, text: "Number.prototype.cube = function() { return this ** 3 }" },
	{ delay: 5, text: "(1 + 1).cube()" },
	{ delay: 6, text: "let naturals = [...Number.range(1, 10)]" },
	{ delay: 2, text: "naturals" },
	{ delay: 7, text: "let cubes = naturals.map(n => n.cube())" },
	{ delay: 3, text: "cubes" },
	{ delay: 7, text: "let [one, eight, ...{ length: numOthers }] = cubes" },
	{ delay: 5, text: "console.log(one + eight * numOthers)" },
];

const fps = 18;

const numFrames = commands.reduce((acc, command) => {
	const delayFrames = command.delay * fps;
	const typingFrames = command.text.length;
	return acc + delayFrames + typingFrames + 1;
}, 0);

if (fs.existsSync("demo.gif")) {
	console.log("Deleting existing GIF...");
	fs.unlinkSync("demo.gif");
}

if (!fs.existsSync("./frames")) {
	fs.mkdirSync("./frames");
}

deleteFrames();

const data = await LebJS(commands.map(command => command.text));
const wrappedCommands = commands.map((command, i) => ({
	...command,
	delay: command.delay * fps,
	data: data[i]
}));

console.log("Rendering frames...");
for (const w of wrappedCommands)
	renderFrames(w);

console.log('\x1B[2K\r' + "FFMPEGing GIF...");
await spawnPromise([
	"ffmpeg",
	`-framerate ${fps}`,
	"-i frames/frame-%d.png",
	'-vf split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
	"demo.gif",
	"-hide_banner", "-loglevel error", "-stats"
].join(" "));

console.log("Done!", "Filesize:", prettyBytes(fs.statSync("demo.gif").size));
await execPromise("demo.gif");
console.log("Deleting intermediate files...");
deleteFrames();