export interface Voice {
  id: number | string;
  name: string;
  gender: string;
  nationality: string;
  language: string;
  provider: string;
  traits: string[];
  isCloned?: boolean;
  audioUrl?: string;
  preview_url?: string;
  eleven_labs_id?: string;
  category?: string;
  available_for_tiers?: string[];
};

export interface Provider {
  name: string;
  status: "Included" | "Premium";
  languages: string[];
};