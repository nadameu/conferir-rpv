export default function padStart(text: string, minLength: number, paddingText: string): string {
	let result = text;
	while (result.length < minLength) {
		result = paddingText + result;
	}
	return result;
}
