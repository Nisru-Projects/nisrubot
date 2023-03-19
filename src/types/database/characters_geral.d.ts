type CharacterGender = 'female' | 'male' | 'other';

interface CharacterEssence {
    name: string;
    gender: CharacterGender;
    element: string;
    race: string;
    constellation: string;
    gamemode: 'normal' | 'hard' | 'abyss';
}

type CharacterAttributes = Record<
  'strength' | 'dexterity' | 'intelligence' | 'constitution' | 'luck' | 'agility' | 'perception' |
  'charisma' |'willpower' | 'wisdom' | 'endurance' | 'faith' | 'spirit' | 'vitality' | 'insight' |
  'memory' | 'awareness' | 'focus' | 'accuracy' | 'evasion',
  number
>;

interface CharacterSkinPart {
    component: string;
    part: string;
    skin: string;
    color: string;
    position: { x: number; y: number };
    rotation: number;
    scale: number;
    opacity: number;
    flip: boolean;
    mirror: boolean;
    layer: number;
}

interface CharacterSkin {
    buffer: Buffer;
    parts: CharacterSkinPart[];
}

interface Character {
    character_id: string;
    exp: bigint;
    essence: CharacterEssence;
    attributes: CharacterAttributes;
    skin: CharacterSkin;
}

export type { Character, CharacterEssence, CharacterAttributes, CharacterSkin, CharacterSkinPart, CharacterGender };