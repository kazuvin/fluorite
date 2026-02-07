export type HSL = { h: number; s: number; l: number };

export function hslToHex(hsl: HSL): string {
	const h = ((hsl.h % 360) + 360) % 360;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r: number;
	let g: number;
	let b: number;

	if (h < 60) {
		[r, g, b] = [c, x, 0];
	} else if (h < 120) {
		[r, g, b] = [x, c, 0];
	} else if (h < 180) {
		[r, g, b] = [0, c, x];
	} else if (h < 240) {
		[r, g, b] = [0, x, c];
	} else if (h < 300) {
		[r, g, b] = [x, 0, c];
	} else {
		[r, g, b] = [c, 0, x];
	}

	const toHex = (v: number) =>
		Math.round((v + m) * 255)
			.toString(16)
			.toUpperCase()
			.padStart(2, "0");

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
