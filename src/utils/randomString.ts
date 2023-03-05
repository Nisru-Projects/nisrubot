export default function randomString (size: number) : string {
	return Math.random().toString(36).substr(2, size)
}

