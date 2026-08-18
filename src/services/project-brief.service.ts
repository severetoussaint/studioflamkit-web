import { supabaseClient } from '@/lib/supabase/client';
import type {
  ProjectBrief,
  SaveProjectBriefInput,
  ProjectBriefAudienceSizeBand,
  ProjectBriefCreatorStatus,
  ProjectBriefRightsStatus,
} from '@/types/project-brief.types';

function mapRow(row: Record<string, unknown>): ProjectBrief {
  return {
    id: String(row.id),
    manuscriptId: String(row.manuscript_id),
    authorId: String(row.author_id),
    genre: (row.genre as string | null) ?? null,
    targetAudience: (row.target_audience as string | null) ?? null,
    creativeVision: (row.creative_vision as string | null) ?? null,
    desiredSensations: Array.isArray(row.desired_sensations) ? (row.desired_sensations as string[]) : [],
    productionPreferences: (row.production_preferences as string | null) ?? null,
    creativeReferences: (row.creative_references as string | null) ?? null,
    mustAvoid: (row.must_avoid as string | null) ?? null,
    desiredDeliveryFormat: (row.desired_delivery_format as string | null) ?? null,
    technicalPreferences: (row.technical_preferences as string | null) ?? null,
    targetDate: (row.target_date as string | null) ?? null,
    additionalNotes: (row.additional_notes as string | null) ?? null,
    creatorStatus: (row.creator_status as ProjectBriefCreatorStatus) ?? 'none',
    socialPlatforms: Array.isArray(row.social_platforms) ? (row.social_platforms as string[]) : [],
    creatorContentType: (row.creator_content_type as string | null) ?? null,
    audienceSizeBand: (row.audience_size_band as ProjectBriefAudienceSizeBand | null) ?? null,
    primarySocialUrl: (row.primary_social_url as string | null) ?? null,
    projectGoal: (row.project_goal as string | null) ?? null,
    distributionPlatforms: Array.isArray(row.distribution_platforms) ? (row.distribution_platforms as string[]) : [],
    promotionPlatforms: Array.isArray(row.promotion_platforms) ? (row.promotion_platforms as string[]) : [],
    rightsStatus: (row.rights_status as ProjectBriefRightsStatus) ?? 'unknown',
    budgetBand: (row.budget_band as string | null) ?? null,
    futureDistributionInterest: Boolean(row.future_distribution_interest),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getProjectBrief(manuscriptId: string): Promise<ProjectBrief | null> {
  if (!manuscriptId) return null;
  const { data, error } = await supabaseClient
    .from('project_briefs' as never)
    .select('*')
    .eq('manuscript_id' as never, manuscriptId)
    .maybeSingle();

  if (error) {
    console.warn('Error fetching project brief:', error);
    return null;
  }

  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function saveProjectBrief(input: SaveProjectBriefInput): Promise<ProjectBrief> {
  if (!input.manuscriptId) throw new Error('manuscriptId is required.');
  if (!input.authorId) throw new Error('authorId is required.');

  const payload = {
    manuscript_id: input.manuscriptId,
    author_id: input.authorId,
    genre: input.genre,
    target_audience: input.targetAudience,
    creative_vision: input.creativeVision,
    desired_sensations: input.desiredSensations,
    production_preferences: input.productionPreferences,
    creative_references: input.creativeReferences,
    must_avoid: input.mustAvoid,
    desired_delivery_format: input.desiredDeliveryFormat,
    technical_preferences: input.technicalPreferences,
    target_date: input.targetDate,
    additional_notes: input.additionalNotes,
    creator_status: input.creatorStatus,
    social_platforms: input.socialPlatforms,
    creator_content_type: input.creatorContentType,
    audience_size_band: input.audienceSizeBand,
    primary_social_url: input.primarySocialUrl,
    project_goal: input.projectGoal,
    distribution_platforms: input.distributionPlatforms,
    promotion_platforms: input.promotionPlatforms,
    rights_status: input.rightsStatus,
    budget_band: input.budgetBand,
    future_distribution_interest: input.futureDistributionInterest,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseClient
    .from('project_briefs' as never)
    .upsert(payload as never, { onConflict: 'manuscript_id' })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('No se pudo guardar el brief del proyecto.');
  }

  return mapRow(data as Record<string, unknown>);
}
