import { CharacterAttributes } from "../types/database/characters_geral"

type CharacterAttributesKeys = keyof CharacterAttributes

function mergeAttributes (currentAttributes: CharacterAttributes, newAttributes: CharacterAttributes) : CharacterAttributes {
	const attributes = Object.keys(currentAttributes) as CharacterAttributesKeys[]
	const newAttributesKeys = Object.keys(newAttributes) as CharacterAttributesKeys[]
	const attributesToMerge = attributes.filter(attribute => newAttributesKeys.includes(attribute))
	const attributesToKeep = attributes.filter(attribute => !newAttributesKeys.includes(attribute))
	const attributesToMergeValues = attributesToMerge.map(attribute => newAttributes[attribute])
	const attributesToKeepValues = attributesToKeep.map(attribute => currentAttributes[attribute])
	return Object.assign({}, ...attributesToMergeValues, ...attributesToKeepValues)
}

export default mergeAttributes