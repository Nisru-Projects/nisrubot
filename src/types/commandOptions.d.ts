import { ApplicationCommandOption } from "discord.js";

interface NisruCommand {
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
    permissions?: UserPermission[];
    type?: 'complementary' | 'slash';
}

export type { NisruCommand };