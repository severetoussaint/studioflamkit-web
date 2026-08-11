import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { ProductionStage, ProductionStageStatus, ProjectProgress } from '@/types/domain.types';

export type ProductionStageRow = Database['public']['Tables']['production_stages']['Row'];

const PRODUCTION_STAGE_STATUSES: readonly ProductionStageStatus[] = [
  'pending',
  'in_progress',
  'completed',
];

function mapProductionStageStatus(value: string | null): ProductionStageStatus {
  return PRODUCTION_STAGE_STATUSES.includes(value as ProductionStageStatus)
    ? (value as ProductionStageStatus)
    : 'pending';
}

function mapProductionStage(row: ProductionStageRow): ProductionStage {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    orderIndex: row.order_index,
    progressPercentage: row.progress_percentage ?? 0,
    status: mapProductionStageStatus(row.status),
    startDate: row.start_date,
    endDate: row.end_date,
    assignedTo: row.assigned_to,
    notes: row.notes,
    createdAt: row.created_at ?? '',
  };
}

export async function listProductionStages(projectId: string): Promise<ProductionStage[]> {
  const { data, error } = await supabaseClient
    .from('production_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProductionStage);
}

export function deriveProjectProgress(stages: ProductionStage[]): ProjectProgress {
  if (stages.length === 0) {
    return {
      percentage: 0,
      completedStages: 0,
      totalStages: 0,
      currentStageId: null,
    };
  }

  const total = stages.reduce((sum, stage) => sum + stage.progressPercentage, 0);
  const percentage = Math.round(total / stages.length);
  const completedStages = stages.filter((stage) => stage.status === 'completed').length;
  const currentStage = stages.find((stage) => stage.status !== 'completed');

  return {
    percentage,
    completedStages,
    totalStages: stages.length,
    currentStageId: currentStage?.id ?? stages[stages.length - 1]?.id ?? null,
  };
}

export async function getProjectProgress(projectId: string): Promise<ProjectProgress> {
  const stages = await listProductionStages(projectId);
  return deriveProjectProgress(stages);
}

export async function getProjectsProgress(projectIds: string[]): Promise<Record<string, ProjectProgress>> {
  if (projectIds.length === 0) return {};

  const { data, error } = await supabaseClient
    .from('production_stages')
    .select('*')
    .in('project_id', projectIds)
    .order('project_id', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) throw error;

  const stagesByProject = new Map<string, ProductionStage[]>();

  for (const row of data ?? []) {
    const stage = mapProductionStage(row);
    const stages = stagesByProject.get(stage.projectId) ?? [];
    stages.push(stage);
    stagesByProject.set(stage.projectId, stages);
  }

  return Object.fromEntries(
    projectIds.map((projectId) => [
      projectId,
      deriveProjectProgress(stagesByProject.get(projectId) ?? []),
    ])
  );
}
