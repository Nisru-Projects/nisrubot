type UserPermission = string;

interface User {
    id: number;
    discord_id: bigint | string;
    permissions: UserPermission[];
    access_token: string;
    refresh_token: string;
    created_at: Date;
    updated_at: Date;
    characters: string[];
    selected_character: string;
}

export type { User, UserPermission };