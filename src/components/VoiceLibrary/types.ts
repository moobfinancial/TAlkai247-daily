export type Voice = {
  id: number;
  name: string;
  gender: string;
  nationality: string;
  language: string;
  provider: string;
  traits: string[];
  isCloned?: boolean;
  audioUrl?: string;
};

export type Provider = {
  name: string;
  status: "Included" | "Premium";
  languages: string[];
};