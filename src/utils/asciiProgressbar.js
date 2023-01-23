function asciiProgressbar({ percent, size, fullChar, emptyChar, middleChar, type = 0 }) {
	// type 0 ■■■■■■◧□□□□□□
	// type 1 ⬤⬤⬤⬤⬤⬤◐○○○○○○
	// type 2 ▰▰▰▰▰▰▱▱▱▱▱▱
	// type 3 ◼◼◼◼◼◼▭▭▭▭▭▭
	// type 4 ▣▣▣▣▣▣▢▢▢▢▢▢
	// type 5 ⬤⬤⬤⬤⬤⬤◯◯◯◯◯◯

	const types = [ {
		fullChar: '■',
		emptyChar: '□',
		middleChar: '◧',
	},
	{
		fullChar: '⬤',
		emptyChar: '○',
		middleChar: '◐',
	},
	{
		fullChar: '▰',
		emptyChar: '▱',
		middleChar: '◧',
	},
	{
		fullChar: '◼',
		emptyChar: '▭',
		middleChar: '◧',
	},
	{
		fullChar: '▣',
		emptyChar: '▢',
		middleChar: '◧',
	},
	{
		fullChar: '⬤',
		emptyChar: '◯',
		middleChar: '◐',
	} ]

	fullChar = fullChar || types[type].fullChar
	emptyChar = emptyChar || types[type].emptyChar
	middleChar = middleChar || types[type].middleChar
	size = size || 10
	percent = percent || 0
	percent = Math.min(percent, 100)
	percent = Math.max(percent, 0)

	const filled = Math.round(size * (percent / 100))
	const empty = size - filled

	const progress = fullChar.repeat(filled) + middleChar + emptyChar.repeat(empty)

	return progress
}

module.exports = asciiProgressbar