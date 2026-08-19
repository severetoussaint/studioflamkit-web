import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Evaluation, EvaluationResult } from '@/types/domain.types';
import { mapEvaluationRowToDomain } from '@/domain/evaluation/mapEvaluation';

type EvaluationRow = Database['public']['Tables']['evaluations']['Row'];

type SaveEvaluationInput = {
  requestId: string;
  feasibility?: string | null;
  narrativeQuality?: string | null;
  technicalDifficulty?: string | null;
  estimatedTime?: string | null;
  observations?: string | null;
  result?: EvaluationResult | null;
};

function mapSaveInput(input: SaveEvaluationInput) {
  return {
    request_id: input.requestId,
    feasibility: input.feasibility ?? null,
    narrative_quality: input.narrativeQuality ?? null,
    technical_difficulty: input.technicalDifficulty ?? null,
    estimated_time: input.estimatedTime ?? null,
    observations: input.observations ?? null,
    result: input.result ?? null,
  };
}

export async function getEvaluation(evaluationId: string): Promise<Evaluation | null> {
  const { data, error } = await supabaseClient
    .from('evaluations')
    .select('*')
    .eq('id', evaluationId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapEvaluationRowToDomain(data as EvaluationRow) : null;
}

export async function getEvaluationByRequest(requestId: string): Promise<Evaluation | null> {
  if (!requestId) return null;

  const { data, error } = await supabaseClient
    .from('evaluations')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapEvaluationRowToDomain(data as EvaluationRow) : null;
}

export async function createEvaluation(input: SaveEvaluationInput): Promise<Evaluation> {
  if (!input.requestId) throw new Error('requestId is required to create an evaluation.');

  const existing = await getEvaluationByRequest(input.requestId);
  if (existing) return existing;

  const { data, error } = await supabaseClient
    .from('evaluations')
    .insert(mapSaveInput(input))
    .select('*')
    .single();

  if (error) throw error;
  return mapEvaluationRowToDomain(data as EvaluationRow);
}

export async function updateEvaluation(
  evaluationId: string,
  input: Omit<SaveEvaluationInput, 'requestId'>,
): Promise<Evaluation> {
  const { data, error } = await supabaseClient
    .from('evaluations')
    .update({
      feasibility: input.feasibility ?? null,
      narrative_quality: input.narrativeQuality ?? null,
      technical_difficulty: input.technicalDifficulty ?? null,
      estimated_time: input.estimatedTime ?? null,
      observations: input.observations ?? null,
      result: input.result ?? null,
    })
    .eq('id', evaluationId)
    .select('*')
    .single();

  if (error) throw error;
  return mapEvaluationRowToDomain(data as EvaluationRow);
}
