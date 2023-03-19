import { UserPermission } from "./database/users";

interface NisruCommand {
    name: string;
    description: string;
    category: string;
    fileName: string;
    permissions: UserPermission[];
    options?: ApplicationCommandOption[];
    type?: 'complementary' | 'slash';
    execute: (interaction: CommandInteraction, ...args: any[]) => Promise<void>;
}

export type { NisruCommand };