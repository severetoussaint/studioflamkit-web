'use client';

import { useEffect, useState } from 'react';
import type { Evaluation, EvaluationResult } from '@/types/domain.types';
import { createEvaluation, getEvaluationByRequest, updateEvaluation } from '@/services/evaluation.service';

interface AdminEvaluationPanelProps {
  requestId: string;
}

const resultOptions: Array<{ value: EvaluationResult; label: string }> = [
  { value: 'approved', label: 'Aprobado' },
  { value: 'approved_with_notes', label: 'Aprobado con observaciones' },
  { value: 'rejected', label: 'Rechazado' },
];

export function AdminEvaluationPanel({ requestId }: AdminEvaluationPanelProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [feasibility, setFeasibility] = useState('');
  const [narrativeQuality, setNarrativeQuality] = useState('');
  const [technicalDifficulty, setTechnicalDifficulty] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [observations, setObservations] = useState('');
  const [result, setResult] = useState<EvaluationResult | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const current = await getEvaluationByRequest(requestId);
        if (!mounted) return;
        setEvaluation(current);
        setFeasibility(current?.feasibility ?? '');
        setNarrativeQuality(current?.narrativeQuality ?? '');
        setTechnicalDifficulty(current?.technicalDifficulty ?? '');
        setEstimatedTime(current?.estimatedTime ?? '');
        setObservations(current?.observations ?? '');
        setResult(current?.result ?? '');
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el análisis.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const input = {
        feasibility: feasibility.trim() || null,
        narrativeQuality: narrativeQuality.trim() || null,
        technicalDifficulty: technicalDifficulty.trim() || null,
        estimatedTime: estimatedTime.trim() || null,
        observations: observations.trim() || null,
        result: result || null,
      };

      const next = evaluation
        ? await updateEvaluation(evaluation.id, input)
        : await createEvaluation({ requestId, ...input });

      setEvaluation(next);
      setResult(next.result ?? '');
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el análisis.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
        Cargando análisis interno…
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-5">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Análisis interno</p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-[var(--color-text)]">Evaluación editorial</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">Este contenido es interno y sirve para decidir si la solicitud puede avanzar a una propuesta.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Viabilidad', feasibility, setFeasibility],
          ['Calidad narrativa', narrativeQuality, setNarrativeQuality],
          ['Dificultad técnica', technicalDifficulty, setTechnicalDifficulty],
          ['Tiempo estimado', estimatedTime, setEstimatedTime],
        ].map(([label, value, setter]) => (
          <label key={label as string} className="space-y-1.5">
            <span className="block text-xs font-medium text-[var(--color-text-secondary)]">{label as string}</span>
            <input
              value={value as string}
              onChange={(event) => (setter as (next: string) => void)(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block space-y-1.5">
        <span className="block text-xs font-medium text-[var(--color-text-secondary)]">Observaciones internas</span>
        <textarea
          rows={5}
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
          className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          placeholder="Notas de análisis, viabilidad, riesgos y aspectos a considerar para la propuesta…"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-[var(--color-text-secondary)]">Resultado</span>
          <select
            value={result}
            onChange={(event) => setResult(event.target.value as EvaluationResult | '')}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="">Todavía en análisis</option>
            {resultOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar análisis'}
        </button>
      </div>

      {saved && <p className="mt-3 text-xs font-medium text-[var(--color-success)]">Análisis guardado correctamente.</p>}
      {error && <p className="mt-3 text-xs text-[var(--color-error)]">{error}</p>}
    </section>
  );
}
