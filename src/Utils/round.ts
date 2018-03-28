export default function round(num, digits = 0) {
	const exp = Math.pow(10, digits);
	return Math.round(num * exp) / exp;
}
