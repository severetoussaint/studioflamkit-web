"use client";

import { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Globe2, Instagram, PlaySquare } from 'lucide-react';
import type {
  ProjectBriefAudienceSizeBand,
  ProjectBriefCreatorStatus,
  ProjectBriefRightsStatus,
  SaveProjectBriefInput,
} from '@/types/project-brief.types';

const sensationOptions = ['Emoción', 'Suspenso', 'Calidez', 'Tensión', 'Misterio', 'Inspiración', 'Intimidad', 'Humor', 'Melancolía', 'Energía'];
const socialOptions = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'X', 'LinkedIn', 'Otra'];
const distributionOptions = ['Amazon / Audible', 'Apple Books', 'Spotify', 'Otra plataforma de audiolibros', 'Todavía no lo sé'];
const promotionOptions = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'X', 'Web propia', 'Newsletter / email', 'Otra'];
const audienceBands: Array<{ value: ProjectBriefAudienceSizeBand; label: string }> = [
  { value: '0', label: 'Sin audiencia pública' },
  { value: '1_999', label: '1–999' },
  { value: '1k_9_9k', label: '1K–9.9K' },
  { value: '10k_49_9k', label: '10K–49.9K' },
  { value: '50k_249_9k', label: '50K–249.9K' },
  { value: '250k_999_9k', label: '250K–999.9K' },
  { value: '1m_plus', label: '1M+' },
];

export interface ManuscriptBriefFormProps {
  manuscriptId: string;
  authorId: string;
  manuscriptTitle: string;
  initialValues?: Partial<SaveProjectBriefInput>;
  onSubmit: (values: SaveProjectBriefInput) => Promise<void>;
  onBack?: () => void;
}

export function ManuscriptBriefForm({ manuscriptId, authorId, manuscriptTitle, initialValues, onSubmit, onBack }: ManuscriptBriefFormProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SaveProjectBriefInput>({
    manuscriptId,
    authorId,
    genre: initialValues?.genre ?? null,
    targetAudience: initialValues?.targetAudience ?? null,
    creativeVision: initialValues?.creativeVision ?? null,
    desiredSensations: initialValues?.desiredSensations ?? [],
    productionPreferences: initialValues?.productionPreferences ?? null,
    creativeReferences: initialValues?.creativeReferences ?? null,
    mustAvoid: initialValues?.mustAvoid ?? null,
    desiredDeliveryFormat: initialValues?.desiredDeliveryFormat ?? null,
    technicalPreferences: initialValues?.technicalPreferences ?? null,
    targetDate: initialValues?.targetDate ?? null,
    additionalNotes: initialValues?.additionalNotes ?? null,
    creatorStatus: initialValues?.creatorStatus ?? 'none',
    socialPlatforms: initialValues?.socialPlatforms ?? [],
    creatorContentType: initialValues?.creatorContentType ?? null,
    audienceSizeBand: initialValues?.audienceSizeBand ?? null,
    primarySocialUrl: initialValues?.primarySocialUrl ?? null,
    projectGoal: initialValues?.projectGoal ?? null,
    distributionPlatforms: initialValues?.distributionPlatforms ?? [],
    promotionPlatforms: initialValues?.promotionPlatforms ?? [],
    rightsStatus: initialValues?.rightsStatus ?? 'unknown',
    budgetBand: initialValues?.budgetBand ?? null,
    futureDistributionInterest: initialValues?.futureDistributionInterest ?? false,
  });

  const update = <K extends keyof SaveProjectBriefInput>(key: K, value: SaveProjectBriefInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleArray = (key: 'desiredSensations' | 'socialPlatforms' | 'distributionPlatforms' | 'promotionPlatforms', value: string) => {
    setForm((prev) => {
      const current = prev[key];
      return { ...prev, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] };
    });
  };

  const steps = useMemo(() => [
    { title: 'La obra', subtitle: 'Contexto básico del proyecto.' },
    { title: 'Tu visión', subtitle: 'Qué quieres transmitir y cómo imaginas el resultado.' },
    { title: 'Audiencia y presencia', subtitle: 'Ayúdanos a entender tu alcance como autor.' },
    { title: 'Distribución y entrega', subtitle: 'Dónde imaginas llevar la obra y cómo quieres recibirla.' },
  ], []);

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la información.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-edge/60 bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Brief del proyecto</p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{manuscriptTitle}</h3>
            <p className="mt-1 text-xs text-ink-muted">Esta información nos ayudará a comprender tu visión antes de preparar una propuesta.</p>
          </div>
          <span className="text-xs text-ink-muted">{step + 1} / {steps.length}</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
          <div className="h-full rounded-full bg-accent transition-all duration-200" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      {step === 0 && (
        <section className="space-y-5">
          <div>
            <label className="text-xs font-medium text-ink">Género</label>
            <select value={form.genre ?? ''} onChange={(e) => update('genre', e.target.value || null)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink">
              <option value="">Selecciona una opción</option>
              {['Novela', 'Novela corta', 'Cuento', 'Ensayo', 'Biografía', 'Memorias', 'Poesía', 'Otro'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink">¿A qué tipo de lector o audiencia está dirigida la obra?</label>
            <textarea value={form.targetAudience ?? ''} onChange={(e) => update('targetAudience', e.target.value || null)} rows={3} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Cuéntanos a quién quieres llegar." />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">¿Qué objetivo principal tienes con este audiolibro?</label>
            <select value={form.projectGoal ?? ''} onChange={(e) => update('projectGoal', e.target.value || null)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink">
              <option value="">Selecciona una opción</option>
              {['Venderlo', 'Ampliar mi audiencia', 'Fortalecer mi marca como autor', 'Llegar a nuevos lectores', 'Tener una versión profesional de mi obra', 'Uso personal / privado', 'Otro'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Fecha objetivo (opcional)</label>
            <div className="relative mt-1.5">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input type="date" value={form.targetDate ?? ''} onChange={(e) => update('targetDate', e.target.value || null)} className="w-full rounded-xl border border-edge bg-surface py-2.5 pl-10 pr-3 text-sm text-ink" />
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-5">
          <div>
            <label className="text-xs font-medium text-ink">¿Qué quieres transmitir con tu obra?</label>
            <textarea value={form.creativeVision ?? ''} onChange={(e) => update('creativeVision', e.target.value || null)} rows={4} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Cuéntanos la intención principal de la obra." />
          </div>
          <div>
            <p className="text-xs font-medium text-ink">¿Qué sensaciones quieres que produzca?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sensationOptions.map((item) => <button type="button" key={item} onClick={() => toggleArray('desiredSensations', item)} className={`rounded-full border px-3 py-1.5 text-[11px] transition ${form.desiredSensations.includes(item) ? 'border-accent bg-accent/10 text-accent' : 'border-edge bg-surface text-ink-muted hover:text-ink'}`}>{item}</button>)}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink">¿Cómo imaginas el resultado final?</label>
            <textarea value={form.productionPreferences ?? ''} onChange={(e) => update('productionPreferences', e.target.value || null)} rows={4} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Dirección creativa, tono, ritmo, estilo o cualquier referencia importante." />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Referencias que te inspiran</label>
            <textarea value={form.creativeReferences ?? ''} onChange={(e) => update('creativeReferences', e.target.value || null)} rows={3} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Obras, narradores, estilos o producciones que te gusten." />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">¿Hay algo que definitivamente NO quieras?</label>
            <textarea value={form.mustAvoid ?? ''} onChange={(e) => update('mustAvoid', e.target.value || null)} rows={3} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Tono, música, ritmo, interpretación o decisiones que debamos evitar." />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5">
          <div>
            <p className="text-xs font-medium text-ink">¿Cómo describirías tu presencia como autor?</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {([['creator', 'Soy creador/a de contenido'], ['social_presence', 'Tengo redes, pero no creo contenido habitualmente'], ['none', 'No tengo presencia pública relevante']] as Array<[ProjectBriefCreatorStatus, string]>).map(([value, label]) => <button type="button" key={value} onClick={() => update('creatorStatus', value)} className={`rounded-2xl border p-3 text-left text-xs transition ${form.creatorStatus === value ? 'border-accent bg-accent/10 text-ink' : 'border-edge bg-surface text-ink-muted hover:text-ink'}`}>{label}</button>)}
            </div>
          </div>
          {form.creatorStatus !== 'none' && <>
            <div>
              <p className="text-xs font-medium text-ink">Plataformas donde tienes presencia</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {socialOptions.map((item) => <button type="button" key={item} onClick={() => toggleArray('socialPlatforms', item)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition ${form.socialPlatforms.includes(item) ? 'border-accent bg-accent/10 text-accent' : 'border-edge bg-surface text-ink-muted hover:text-ink'}`}>{item === 'YouTube' ? <PlaySquare className="h-3.5 w-3.5" /> : item === 'Instagram' ? <Instagram className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />}{item}</button>)}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-ink">Tamaño aproximado de tu audiencia</label>
                <select value={form.audienceSizeBand ?? ''} onChange={(e) => update('audienceSizeBand', (e.target.value || null) as ProjectBriefAudienceSizeBand | null)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink"><option value="">Selecciona</option>{audienceBands.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink">Tipo de contenido</label>
                <input value={form.creatorContentType ?? ''} onChange={(e) => update('creatorContentType', e.target.value || null)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink" placeholder="Educación, entretenimiento, literatura..." />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink">Enlace principal de tu presencia online</label>
              <input type="url" value={form.primarySocialUrl ?? ''} onChange={(e) => update('primarySocialUrl', e.target.value || null)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink" placeholder="https://..." />
            </div>
          </>}
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <div>
            <p className="text-xs font-medium text-ink">¿Dónde imaginas publicar el audiolibro?</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {distributionOptions.map((item) => <button type="button" key={item} onClick={() => toggleArray('distributionPlatforms', item)} className={`rounded-2xl border p-3 text-left text-xs transition ${form.distributionPlatforms.includes(item) ? 'border-accent bg-accent/10 text-ink' : 'border-edge bg-surface text-ink-muted hover:text-ink'}`}>{item}</button>)}
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">Estas opciones registran tu intención de distribución. Las integraciones de distribución se añadirán más adelante.</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink">¿Dónde te gustaría promocionarlo?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {promotionOptions.map((item) => <button type="button" key={item} onClick={() => toggleArray('promotionPlatforms', item)} className={`rounded-full border px-3 py-1.5 text-[11px] transition ${form.promotionPlatforms.includes(item) ? 'border-accent bg-accent/10 text-accent' : 'border-edge bg-surface text-ink-muted hover:text-ink'}`}>{item}</button>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink">¿Cómo quieres recibir el resultado?</label>
              <select value={form.desiredDeliveryFormat ?? ''} onChange={(e) => update('desiredDeliveryFormat', e.target.value || null)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink"><option value="">Selecciona</option><option>MP3</option><option>M4B</option><option>WAV / máster</option><option>Más de un formato</option><option>Necesito orientación</option></select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink">Derechos y permisos</label>
              <select value={form.rightsStatus} onChange={(e) => update('rightsStatus', e.target.value as ProjectBriefRightsStatus)} className="mt-1.5 w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-sm text-ink"><option value="confirmed">Los tengo confirmados</option><option value="unsure">No estoy seguro/a</option><option value="needs_guidance">Necesito orientación</option></select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Preferencias técnicas o de entrega</label>
            <textarea value={form.technicalPreferences ?? ''} onChange={(e) => update('technicalPreferences', e.target.value || null)} rows={3} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Si tienes requisitos concretos, déjalos aquí." />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">¿Algo más que Studio FLAMKIT debería saber?</label>
            <textarea value={form.additionalNotes ?? ''} onChange={(e) => update('additionalNotes', e.target.value || null)} rows={3} className="mt-1.5 w-full rounded-xl border border-edge bg-surface p-3 text-sm text-ink" placeholder="Información adicional, contexto o necesidades especiales." />
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-edge bg-surface p-4 text-xs text-ink-muted">
            <input type="checkbox" checked={form.futureDistributionInterest} onChange={(e) => update('futureDistributionInterest', e.target.checked)} className="mt-0.5 h-4 w-4 accent-accent" />
            <span>Me interesa conocer futuras opciones de distribución del audiolibro cuando Studio FLAMKIT las incorpore.</span>
          </label>
        </section>
      )}

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge/60 pt-4">
        <button type="button" onClick={step === 0 ? onBack : () => setStep((value) => value - 1)} className="inline-flex items-center gap-1.5 rounded-xl border border-edge bg-surface px-4 py-2.5 text-xs font-medium text-ink-muted hover:text-ink"><ChevronLeft className="h-3.5 w-3.5" />Atrás</button>
        {step < steps.length - 1 ? <button type="button" onClick={() => setStep((value) => value + 1)} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium text-surface hover:bg-accent-hover">Continuar<ChevronRight className="h-3.5 w-3.5" /></button> : <button type="button" disabled={saving} onClick={submit} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium text-surface disabled:opacity-50">{saving ? 'Guardando…' : 'Enviar brief'}{!saving && <Check className="h-3.5 w-3.5" />}</button>}
      </div>
    </div>
  );
}
