export default interface Sanitizer {
    sanitize(text: string): string;
}