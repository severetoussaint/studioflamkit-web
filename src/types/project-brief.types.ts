export type ProjectBriefCreatorStatus = 'creator' | 'social_presence' | 'none';
export type ProjectBriefRightsStatus = 'confirmed' | 'unsure' | 'needs_guidance';
export type ProjectBriefAudienceSizeBand =
  | '0'
  | '1_999'
  | '1k_9_9k'
  | '10k_49_9k'
  | '50k_249_9k'
  | '250k_999_9k'
  | '1m_plus';

export interface ProjectBriefSocialProfile {
  platform: string;
  url: string | null;
  audienceSizeBand: ProjectBriefAudienceSizeBand;
}

export interface ProjectBrief {
  id: string;
  manuscriptId: string;
  authorId: string;
  genre: string | null;
  targetAudience: string | null;
  creativeVision: string | null;
  desiredSensations: string[];
  productionPreferences: string | null;
  creativeReferences: string | null;
  mustAvoid: string | null;
  desiredDeliveryFormat: string | null;
  technicalPreferences: string | null;
  targetDate: string | null;
  additionalNotes: string | null;
  creatorStatus: ProjectBriefCreatorStatus;
  socialPlatforms: string[];
  socialProfiles: ProjectBriefSocialProfile[];
  creatorContentType: string | null;
  audienceSizeBand: ProjectBriefAudienceSizeBand | null;
  primarySocialUrl: string | null;
  projectGoal: string | null;
  distributionPlatforms: string[];
  promotionPlatforms: string[];
  rightsStatus: ProjectBriefRightsStatus;
  budgetBand: string | null;
  futureDistributionInterest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProjectBriefInput extends Omit<ProjectBrief, 'id' | 'createdAt' | 'updatedAt'> {}
