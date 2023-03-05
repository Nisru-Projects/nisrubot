type OptionMode = 'development' | 'production'

interface DatabaseOptions {
	BOT_TOKEN: string
	BOT_ID: string
	DB_HOST: string
	DB_PORT: number
	DB_USER: string
	DB_PASSWORD: string
	DB_DATABASE: string
}

interface ConfigOptions {
	emeraldtoken: string
	OPENAI_API_KEY: string
	development: DatabaseOptions
	production: DatabaseOptions
	mode: OptionMode
}

declare module 'config.json' {
    const value: ConfigOptions
    export default value
}

export type { ConfigOptions, OptionMode, DatabaseOptions }