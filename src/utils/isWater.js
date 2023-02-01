module.exports = (checkAreaCanvas, checkAreaCtx) => {
	let waterInArea = 0
	let totalInArea = 0

	const waterColors = [
		[54, 152, 155],
		[124, 153, 196],
		[139, 165, 203],
		[150, 170, 201],
		[107, 139, 188],
		[109, 134, 174],
		[128, 154, 193],
		[212, 212, 212],
		[123, 128, 137],
		[126, 154, 197],
		[130, 146, 169],
		[124, 152, 195],
		[105, 137, 186],
		[106, 138, 187],
		[104, 136, 185],
		[122, 151, 194],
		[123, 152, 195],
		[138, 164, 202],
		[137, 163, 201],
		[103, 135, 184],
		[107, 139, 187],
		[120, 149, 192],
		[152, 175, 209],
		[151, 174, 208],
		[150, 173, 207],
		[149, 172, 206],
		[142, 163, 195],
		[147, 169, 202],
		[135, 161, 199],
		[136, 158, 190],
		[116, 123, 132],
		[144, 166, 198],
	]

	const notWaterColors = [
		[0, 0, 0],
		[183, 207, 217],
		[255, 255, 255],
		[117, 123, 133],
		[116, 123, 133],
		[126, 136, 149],
		[234, 239, 246],
		[120, 126, 134],
		[126, 138, 155],
		[126, 130, 137],
	]

	const colors = {}
	const usedColors = []
	const waterColorsUsed = []

	const isSimilarColor = (color1, color2, tolerance) => {
		const distance = Math.sqrt(
			Math.pow(color1[0] - color2[0], 2) +
			Math.pow(color1[1] - color2[1], 2) +
			Math.pow(color1[2] - color2[2], 2),
		)
		return distance <= tolerance
	}

	for (let x = 0; x < checkAreaCanvas.width; x++) {
		for (let y = 0; y < checkAreaCanvas.height; y++) {
			const pixel = checkAreaCtx.getImageData(x, y, 1, 1).data
			const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
			if (notWaterColors.some(notWaterColor => notWaterColor[0] === pixel[0] && notWaterColor[1] === pixel[1] && notWaterColor[2] === pixel[2])) {
				continue
			}
			if (colors[color]) {
				colors[color]++
			}
			else {
				colors[color] = 1
			}

			let isWater = false

			for (const waterColor of waterColors) {
				if (isSimilarColor(pixel, waterColor, 3)) {
					isWater = true
					break
				}
			}

			if (isWater) {
				waterInArea++
				if (!waterColorsUsed.includes(color)) {
					waterColorsUsed.push(color)
				}
			}
			totalInArea++

			if (!usedColors.includes(color)) {
				usedColors.push(color)
			}

		}
	}

	const waterPercentage = (waterInArea / totalInArea).toFixed(4)

	if (waterPercentage > 0.4) {
		const notUsedColors = usedColors.filter(color => !waterColorsUsed.includes(color) && colors[color] / totalInArea > 0.01)
		if (notUsedColors.length > 0) {
			console.log(notUsedColors.map(color => `CheckWater: ${color}: ${colors[color]} (${(colors[color] / totalInArea * 100).toFixed(2)}%)`))
		}
	}

	return {
		waterPercentage,
	}
}