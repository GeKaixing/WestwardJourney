export interface EventChoice {
  label: string;
  description: string;
  effects: Array<{
    effectType: string;
    value?: number;
    target?: string;
    buffType?: string;
    cardReward?: string[];
    relicReward?: string[];
    removeCard?: boolean;
    transformCard?: boolean;
  }>;
  condition?: {
    stat?: string;
    minValue?: number;
    maxValue?: number;
    hasRelic?: string;
  };
}

export interface EventConfig {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: EventChoice[];
  actRestriction?: number[];
  oneTimeOnly?: boolean;
}
