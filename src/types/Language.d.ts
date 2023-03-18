type LanguageName = string
type LanguageContent = object | any
type LanguageKey = string

type Language = {
	name: LanguageName
	content: LanguageContent
}

export type { Language, LanguageName, LanguageContent, LanguageKey }