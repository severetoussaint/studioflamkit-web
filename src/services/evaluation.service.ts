import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Evaluation } from '@/types/domain.types';
import { mapEvaluationRowToDomain } from '@/domain/evaluation/mapEvaluation';

type EvaluationRow = Database['public']['Tables']['evaluations']['Row'];

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
