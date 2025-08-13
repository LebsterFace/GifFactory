const RESET = "\x1b[0m";

const BLACK = "\x1b[30m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";

const BRIGHT_BLACK = "\x1b[90m";
const BRIGHT_RED = "\x1b[91m";
const BRIGHT_GREEN = "\x1b[92m";
const BRIGHT_YELLOW = "\x1b[93m";
const BRIGHT_BLUE = "\x1b[94m";
const BRIGHT_MAGENTA = "\x1b[95m";
const BRIGHT_CYAN = "\x1b[96m";
const BRIGHT_WHITE = "\x1b[97m";

const BACKGROUND_BLACK = "\x1b[40m";
const BACKGROUND_RED = "\x1b[41m";
const BACKGROUND_GREEN = "\x1b[42m";
const BACKGROUND_YELLOW = "\x1b[43m";
const BACKGROUND_BLUE = "\x1b[44m";
const BACKGROUND_MAGENTA = "\x1b[45m";
const BACKGROUND_CYAN = "\x1b[46m";
const BACKGROUND_WHITE = "\x1b[47m";

const BACKGROUND_BRIGHT_BLACK = "\x1b[100m";
const BACKGROUND_BRIGHT_RED = "\x1b[101m";
const BACKGROUND_BRIGHT_GREEN = "\x1b[102m";
const BACKGROUND_BRIGHT_YELLOW = "\x1b[103m";
const BACKGROUND_BRIGHT_BLUE = "\x1b[104m";
const BACKGROUND_BRIGHT_MAGENTA = "\x1b[105m";
const BACKGROUND_BRIGHT_CYAN = "\x1b[106m";
const BACKGROUND_BRIGHT_WHITE = "\x1b[107m";

const BOLD = "\x1b[1m";
const UNDERLINE = "\x1b[4m";
const REVERSED = "\x1b[7m";

const UNUSED = {
	"\x1b[40m": null,
	"\x1b[41m": null,
	"\x1b[42m": null,
	"\x1b[43m": null,
	"\x1b[44m": null,
	"\x1b[45m": null,
	"\x1b[46m": null,
	"\x1b[47m": null,
	"\x1b[100m": null,
	"\x1b[101m": null,
	"\x1b[102m": null,
	"\x1b[103m": null,
	"\x1b[104m": null,
	"\x1b[105m": null,
	"\x1b[106m": null,
	"\x1b[107m": null,
	"\x1b[1m": null,
	"\x1b[4m": null,
	"\x1b[7m": null,
};

export default {
	chosenScheme() {
		return this.DRACULA;
	},

	VGA: {
		BACKGROUND: "rgb(0, 0, 0)",
		[RESET]: "rgb(255, 255, 255)",
		[BLACK]: "rgb(0, 0, 0)",
		[RED]: "rgb(128, 0, 0)",
		[GREEN]: "rgb(0, 128, 0)",
		[YELLOW]: "rgb(128, 128, 0)",
		[BLUE]: "rgb(0, 0, 128)",
		[MAGENTA]: "rgb(128, 0, 128)",
		[CYAN]: "rgb(0, 128, 128)",
		[WHITE]: "rgb(192, 192, 192)",
		[BRIGHT_BLACK]: "rgb(128, 128, 128)",
		[BRIGHT_RED]: "rgb(255, 0, 0)",
		[BRIGHT_GREEN]: "rgb(0, 255, 0)",
		[BRIGHT_YELLOW]: "rgb(255, 255, 0)",
		[BRIGHT_BLUE]: "rgb(0, 0, 255)",
		[BRIGHT_MAGENTA]: "rgb(255, 0, 255)",
		[BRIGHT_CYAN]: "rgb(0, 255, 255)",
		[BRIGHT_WHITE]: "rgb(255, 255, 255)"
	},
	UBUNTU: {
		BACKGROUND: "rgb(48, 10, 36)",
		[RESET]: "#eeeeec",
		[BLACK]: "#2e3436",
		[RED]: "#3465a4",
		[GREEN]: "#4e9a06",
		[YELLOW]: "#06989a",
		[BLUE]: "#cc0000",
		[MAGENTA]: "#75507b",
		[CYAN]: "#c4a000",
		[WHITE]: "#d3d7cf",
		[BRIGHT_BLACK]: "#555753",
		[BRIGHT_RED]: "#729fcf",
		[BRIGHT_GREEN]: "#8ae234",
		[BRIGHT_YELLOW]: "#34e2e2",
		[BRIGHT_BLUE]: "#ef2929",
		[BRIGHT_MAGENTA]: "#ad7fa8",
		[BRIGHT_CYAN]: "#fce94f",
		[BRIGHT_WHITE]: "#eeeeec",
	},
	DRACULA: {
		BACKGROUND: "#282a36",
		[RESET]: "#F8F8F2",
		[BLACK]: "#21222C",
		[RED]: "#FF5555",
		[GREEN]: "#50FA7B",
		[YELLOW]: "#F1FA8C",
		[BLUE]: "#BD93F9",
		[MAGENTA]: "#FF79C6",
		[CYAN]: "#8BE9FD",
		[WHITE]: "#F8F8F2",
		[BRIGHT_BLACK]: "#6272A4",
		[BRIGHT_RED]: "#FF6E6E",
		[BRIGHT_GREEN]: "#69FF94",
		[BRIGHT_YELLOW]: "#FFFFA5",
		[BRIGHT_BLUE]: "#D6ACFF",
		[BRIGHT_MAGENTA]: "#FF92DF",
		[BRIGHT_CYAN]: "#A4FFFF",
		[BRIGHT_WHITE]: "#FFFFFF",
	},
	ONEHALFDARK: {
		BACKGROUND: "#282C34",
		[RESET]: "#DCDFE4",
		[BLACK]: "#282C34",
		[BLUE]: "#61AFEF",
		[BRIGHT_BLACK]: "#5A6374",
		[BRIGHT_BLUE]: "#61AFEF",
		[BRIGHT_CYAN]: "#56B6C2",
		[BRIGHT_GREEN]: "#98C379",
		[BRIGHT_MAGENTA]: "#C678DD",
		[BRIGHT_RED]: "#E06C75",
		[BRIGHT_WHITE]: "#DCDFE4",
		[BRIGHT_YELLOW]: "#E5C07B",
		[CYAN]: "#56B6C2",
		[GREEN]: "#98C379",
		[MAGENTA]: "#C678DD",
		[RED]: "#E06C75",
		[WHITE]: "#DCDFE4",
		[YELLOW]: "#E5C07B"
	}
};