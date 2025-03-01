export type TransparencyLevel =
  | "Full Disclosure"
  | "Partial Disclosure"
  | "No Disclosure"
  | "full"
  | "partial"
  | "none";
export type ContactType = "Personal" | "personal" | "Campaign";
export type Subcategory =
  | "Stranger"
  | "Business"
  | "Family"
  | "Friends"
  | "Other";

export interface Goal {
  id: string;
  title: string;
  callType: "Business" | "Personal";
  template: string;
  aiPrompt: string;
  urls: string[];
  files: string[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ContactType;
  goals?: Goal[];
  transparencyLevel: TransparencyLevel;
  subcategory?: Subcategory;
  customSubcategory?: string;
  campaignName?: string;
  tags?: string[];
}

export interface TimelineEvent {
  id: string;
  contactId: string;
  type: "Call" | "Email" | "Meeting" | "Note" | "Task";
  title: string;
  description: string;
  date: Date;
  completed: boolean;
  dueDate?: Date;
}
