function calculateLevel(exp: number) {
	return Math.floor(Math.pow(exp, 1 / 3))
}

function calculateMaxExp(level: number) {
	return Math.pow(level + 1, 3)
}

function calculateExpToNextLevel(exp: number) {
	return Math.min(Math.pow(calculateLevel(exp) + 1, 3), Math.pow(70, 3))
}

function percentageToNextLevel(exp: number) {
	if (exp == 0) return 0
	const level = calculateLevel(exp)
	const maxExp = calculateMaxExp(level)
	const expToNextLevel = calculateExpToNextLevel(exp)
	return (expToNextLevel / maxExp) * 100
}

export { calculateLevel, calculateMaxExp, calculateExpToNextLevel, percentageToNextLevel }