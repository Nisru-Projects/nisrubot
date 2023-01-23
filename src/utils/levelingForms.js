function calculateLevel(exp) {
	return Math.floor(Math.pow(exp, 1 / 3))
}

function calculateMaxExp(level) {
	return Math.pow(level + 1, 3)
}

function calculateExpToNextLevel(exp) {
	return Math.pow(calculateLevel(exp) + 1, 3) - exp
}

function percentageToNextLevel(exp) {
	if (exp == 0) return 0
	const level = calculateLevel(exp)
	const maxExp = calculateMaxExp(level)
	const expToNextLevel = calculateExpToNextLevel(exp)
	console.log(expToNextLevel, maxExp, level)
	return (expToNextLevel / maxExp) * 100
}

module.exports = {
	calculateLevel,
	calculateMaxExp,
	calculateExpToNextLevel,
	percentageToNextLevel,
}