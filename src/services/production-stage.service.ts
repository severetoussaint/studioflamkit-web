import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { ProductionStage, ProductionStageStatus, ProjectProgress } from '@/types/domain.types';

export type ProductionStageRow = Database['public']['Tables']['production_stages']['Row'];

const PRODUCTION_STAGE_STATUSES: ReadonlySet<string> = new Set([
  'pending',
  'in_progress',
  'completed',
]);

function mapProductionStageStatus(value: string | null): ProductionStageStatus {
  if (value !== null && PRODUCTION_STAGE_STATUSES.has(value)) {
    return value as ProductionStageStatus;
  }
  return 'pending';
}

function requireStageString(value: string | null, field: string): string {
  if (value === null) {
    throw new Error(`Invalid production_stages row: ${field} is null.`);
  }
  return value;
}

function requireStageNumber(value: number | null, field: string): number {
  if (value === null) {
    throw new Error(`Invalid production_stages row: ${field} is null.`);
  }
  return value;
}

function mapProductionStage(row: ProductionStageRow): ProductionStage {
  return {
    id: requireStageString(row.id, 'id'),
    projectId: requireStageString(row.project_id, 'project_id'),
    name: requireStageString(row.name, 'name'),
    orderIndex: requireStageNumber(row.order_index, 'order_index'),
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
