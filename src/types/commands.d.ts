import { UserPermission } from "./database/users";

interface NisruCommand {
    name: string;
    permissions: UserPermission[];
    description?: string;
    category?: string;
    fileName?: string;
    options?: ApplicationCommandOption[];
    type?: 'complementary' | 'slash';
    execute?: (interaction: CommandInteraction, ...args: any[]) => Promise<void>;
}

export type { NisruCommand };