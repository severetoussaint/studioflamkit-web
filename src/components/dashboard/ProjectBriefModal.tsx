"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Info,
  Lock,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  Wand2,
  X,
} from 'lucide-react';
import type {
  ProjectBrief,
  ProjectBriefAudienceSizeBand,
  ProjectBriefSocialProfile,
  SaveProjectBriefInput,
} from '@/types/project-brief.types';
import { getProjectBrief, saveProjectBrief } from '@/services/project-brief.service';

const genreOptions = [
  ['Novela', '📖', 'Ficción narrativa extensa'],
  ['Cuento / Relatos', '📜', 'Narrativa breve o antología'],
  ['Ensayo', '💡', 'Reflexión y análisis'],
  ['Biografía / Memorias', '🖋️', 'Historia de vida o crónica'],
  ['Poesía', '🪶', 'Lírica y verso'],
  ['Desarrollo personal / No ficción', '🧠', 'Crecimiento y conocimiento'],
  ['Thriller / Misterio', '🕵️', 'Suspenso e intriga'],
  ['Fantasía / Ciencia Ficción', '🌌', 'Mundos e imaginación'],
  ['Romance / Drama', '🎭', 'Relaciones humanas y pasión'],
  ['Otro', '📦', 'Formato personalizado'],
] as const;

const sensationOptions = [
  'Emoción profunda',
  'Suspenso e intriga',
  'Calidez e intimidad',
  'Tensión dramática',
  'Misterio envolvente',
  'Inspiración y fuerza',
  'Humor e ingenio',
  'Melancolía y reflexión',
  'Energía y dinamismo',
  'Serenidad y calma',
  'Tono épico',
  'Cercanía conversacional',
] as const;

const socialPlatformOptions = [
  'YouTube',
  'Instagram',
  'TikTok',
  'Facebook',
  'X',
  'LinkedIn',
  'Goodreads',
  'Página web / Blog',
  'Otra',
] as const;

const audienceBands: Array<{ id: ProjectBriefAudienceSizeBand; label: string }> = [
  { id: '0', label: 'Sin audiencia pública' },
  { id: '1_999', label: '1–999' },
  { id: '1k_9_9k', label: '1K–9.9K' },
  { id: '10k_49_9k', label: '10K–49.9K' },
  { id: '50k_249_9k', label: '50K–249.9K' },
  { id: '250k_999_9k', label: '250K–999.9K' },
  { id: '1m_plus', label: '1M+' },
];

const bandRank: Record<ProjectBriefAudienceSizeBand, number> = {
  '0': 0,
  '1_999': 1,
  '1k_9_9k': 2,
  '10k_49_9k': 3,
  '50k_249_9k': 4,
  '250k_999_9k': 5,
  '1m_plus': 6,
};

const deliveryFormats = [
  ['M4B', '🎧', 'M4B Audiolibro', 'Archivo único navegable para consumo y distribución de audiolibros.'],
  ['MP3', '🎵', 'MP3 por capítulos', 'Máxima compatibilidad para venta directa, web y reproducción flexible.'],
  ['WAV', '🎚️', 'WAV máster', 'Máster sin compresión para archivo, edición posterior o re-masterización.'],
  ['Todos los formatos', '📦', 'Pack completo', 'M4B + MP3 + WAV para máxima flexibilidad.'],
] as const;

const distributionOptions = ['Amazon / Audible', 'Apple Books', 'Spotify', 'Otra plataforma de audiolibros', 'Todavía no lo sé'] as const;
const promotionOptions = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'X', 'LinkedIn', 'Página web', 'Newsletter / Email', 'Otra'] as const;

const steps = [
  { number: '01', title: 'La obra', subtitle: 'Género, audiencia y propósito' },
  { number: '02', title: 'Tu visión', subtitle: 'Tono, atmósfera y dirección creativa' },
  { number: '03', title: 'Tu alcance', subtitle: 'Presencia, audiencia y objetivos' },
  { number: '04', title: 'Entrega', subtitle: 'Formato, publicación y preferencias' },
  { number: '05', title: 'Confirmación', subtitle: 'Revisa antes de enviar' },
] as const;

export interface ProjectBriefModalProps {
  open: boolean;
  onClose: () => void;
  manuscriptId: string;
  authorId: string;
  manuscriptTitle: string;
  initialData?: ProjectBrief | null;
  onBriefSaved?: (brief: ProjectBrief) => void;
}

function emptyBrief(manuscriptId: string, authorId: string): SaveProjectBriefInput {
  return {
    manuscriptId,
    authorId,
    genre: null,
    targetAudience: null,
    creativeVision: null,
    desiredSensations: [],
    productionPreferences: null,
    creativeReferences: null,
    mustAvoid: null,
    desiredDeliveryFormat: 'M4B',
    technicalPreferences: null,
    targetDate: null,
    additionalNotes: null,
    creatorStatus: 'none',
    socialPlatforms: [],
    socialProfiles: [],
    creatorContentType: null,
    audienceSizeBand: null,
    primarySocialUrl: null,
    projectGoal: null,
    distributionPlatforms: [],
    promotionPlatforms: [],
    rightsStatus: 'needs_guidance',
    budgetBand: null,
    futureDistributionInterest: false,
  };
}

function getAggregateAudienceBand(profiles: ProjectBriefSocialProfile[]): ProjectBriefAudienceSizeBand | null {
  if (!profiles.length) return null;
  return profiles.reduce((best, profile) => (bandRank[profile.audienceSizeBand] > bandRank[best] ? profile.audienceSizeBand : best), '0' as ProjectBriefAudienceSizeBand);
}

export function ProjectBriefModal({
  open,
  onClose,
  manuscriptId,
  authorId,
  manuscriptTitle,
  initialData,
  onBriefSaved,
}: ProjectBriefModalProps) {
  const safeManuscriptId = manuscriptId?.trim() ?? '';
  const safeAuthorId = authorId?.trim() ?? '';
  const [step, setStep] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<SaveProjectBriefInput>(() => emptyBrief(safeManuscriptId, safeAuthorId));

  useEffect(() => {
    if (!open) return;

    setStep(0);
    setSavedSuccess(false);
    setErrorMessage(null);

    // IMPORTANT: the modal is mounted before the upload resolves.
    // Always synchronize identifiers from the actual props before saving.
    setForm((prev) => ({ ...prev, manuscriptId: safeManuscriptId, authorId: safeAuthorId }));

    if (!safeManuscriptId || !safeAuthorId) return;

    let mounted = true;

    async function loadExistingBrief() {
      if (initialData) {
        setForm({
          ...emptyBrief(safeManuscriptId, safeAuthorId),
          genre: initialData.genre,
          targetAudience: initialData.targetAudience,
          creativeVision: initialData.creativeVision,
          desiredSensations: initialData.desiredSensations ?? [],
          productionPreferences: initialData.productionPreferences,
          creativeReferences: initialData.creativeReferences,
          mustAvoid: initialData.mustAvoid,
          desiredDeliveryFormat: initialData.desiredDeliveryFormat ?? 'M4B',
          technicalPreferences: initialData.technicalPreferences,
          targetDate: initialData.targetDate,
          additionalNotes: initialData.additionalNotes,
          creatorStatus: initialData.creatorStatus ?? 'none',
          socialPlatforms: initialData.socialPlatforms ?? [],
          socialProfiles: initialData.socialProfiles ?? [],
          creatorContentType: initialData.creatorContentType,
          audienceSizeBand: initialData.audienceSizeBand,
          primarySocialUrl: initialData.primarySocialUrl,
          projectGoal: initialData.projectGoal,
          distributionPlatforms: initialData.distributionPlatforms ?? [],
          promotionPlatforms: initialData.promotionPlatforms ?? [],
          rightsStatus: initialData.rightsStatus ?? 'needs_guidance',
          budgetBand: initialData.budgetBand,
          futureDistributionInterest: initialData.futureDistributionInterest ?? false,
        });
        return;
      }

      setLoadingInitial(true);
      try {
        const fetched = await getProjectBrief(safeManuscriptId);
        if (!mounted) return;
        if (!fetched) return;
        setForm({
          ...emptyBrief(safeManuscriptId, safeAuthorId),
          genre: fetched.genre,
          targetAudience: fetched.targetAudience,
          creativeVision: fetched.creativeVision,
          desiredSensations: fetched.desiredSensations ?? [],
          productionPreferences: fetched.productionPreferences,
          creativeReferences: fetched.creativeReferences,
          mustAvoid: fetched.mustAvoid,
          desiredDeliveryFormat: fetched.desiredDeliveryFormat ?? 'M4B',
          technicalPreferences: fetched.technicalPreferences,
          targetDate: fetched.targetDate,
          additionalNotes: fetched.additionalNotes,
          creatorStatus: fetched.creatorStatus ?? 'none',
          socialPlatforms: fetched.socialPlatforms ?? [],
          socialProfiles: fetched.socialProfiles ?? [],
          creatorContentType: fetched.creatorContentType,
          audienceSizeBand: fetched.audienceSizeBand,
          primarySocialUrl: fetched.primarySocialUrl,
          projectGoal: fetched.projectGoal,
          distributionPlatforms: fetched.distributionPlatforms ?? [],
          promotionPlatforms: fetched.promotionPlatforms ?? [],
          rightsStatus: fetched.rightsStatus ?? 'needs_guidance',
          budgetBand: fetched.budgetBand,
          futureDistributionInterest: fetched.futureDistributionInterest ?? false,
        });
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    }

    void loadExistingBrief();
    return () => {
      mounted = false;
    };
  }, [open, safeManuscriptId, safeAuthorId, initialData]);

  const update = <K extends keyof SaveProjectBriefInput>(key: K, value: SaveProjectBriefInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArray = (key: 'desiredSensations' | 'distributionPlatforms' | 'promotionPlatforms', value: string) => {
    setForm((prev) => {
      const current = prev[key];
      return { ...prev, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] };
    });
  };

  const addSocialProfile = () => {
    const available = socialPlatformOptions.find((platform) => !form.socialProfiles.some((profile) => profile.platform === platform));
    if (!available) return;
    const next = [...form.socialProfiles, { platform: available, url: null, audienceSizeBand: '0' as ProjectBriefAudienceSizeBand }];
    update('socialProfiles', next);
  };

  const updateSocialProfile = (index: number, patch: Partial<ProjectBriefSocialProfile>) => {
    const next = form.socialProfiles.map((profile, profileIndex) => (profileIndex === index ? { ...profile, ...patch } : profile));
    update('socialProfiles', next);
  };

  const removeSocialProfile = (index: number) => {
    update('socialProfiles', form.socialProfiles.filter((_, profileIndex) => profileIndex !== index));
  };

  const isStep0Valid = Boolean(form.genre && form.targetAudience?.trim() && form.projectGoal);
  const isStep1Valid = Boolean(form.creativeVision?.trim()) && (form.desiredSensations.length > 0 || Boolean(form.productionPreferences?.trim()));
  const isStep2Valid = form.creatorStatus === 'none' || form.socialProfiles.length > 0;
  const isStep3Valid = Boolean(form.desiredDeliveryFormat && form.rightsStatus && form.targetDate !== undefined);
  const validations = [isStep0Valid, isStep1Valid, isStep2Valid, isStep3Valid, true];

  const canAdvance = validations[step];

  const nextStep = () => {
    if (!canAdvance) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const goToStep = (target: number) => {
    if (target <= step) setStep(target);
    else {
      const priorValid = validations.slice(0, target).every(Boolean);
      if (priorValid) setStep(target);
    }
  };

  const finalInput = useMemo<SaveProjectBriefInput>(() => {
    const socialPlatforms = form.socialProfiles.map((profile) => profile.platform);
    const audienceSizeBand = getAggregateAudienceBand(form.socialProfiles);
    const primarySocialUrl = form.primarySocialUrl ?? form.socialProfiles.find((profile) => profile.url)?.url ?? null;

    return {
      ...form,
      manuscriptId: safeManuscriptId,
      authorId: safeAuthorId,
      socialPlatforms,
      audienceSizeBand,
      primarySocialUrl,
    };
  }, [form, safeManuscriptId, safeAuthorId]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!safeManuscriptId) {
      setErrorMessage('No se pudo identificar el manuscrito enviado. Vuelve al paso anterior e inténtalo de nuevo.');
      return;
    }
    if (!safeAuthorId) {
      setErrorMessage('No se pudo identificar tu sesión. Cierra la ventana y vuelve a intentarlo.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveProjectBrief(finalInput);
      setSavedSuccess(true);
      onBriefSaved?.(saved);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la información del proyecto.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inputClass = 'w-full rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/80 px-5 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all';
  const labelClass = 'text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-brief-title"
          className="relative z-10 flex w-full max-w-5xl max-h-[92vh] min-h-[640px] flex-col overflow-hidden rounded-3xl border border-zinc-200/90 bg-white text-zinc-900 shadow-[0_25px_70px_rgba(0,0,0,0.35)] dark:border-zinc-800/90 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <header className="shrink-0 border-b border-zinc-200/80 bg-zinc-50/90 px-6 py-6 dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:px-10 lg:px-12">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-3xl space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-accent dark:bg-accent/20">
                    <Sparkles className="h-3.5 w-3.5" /> Project Brief Editorial
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Paso {step + 1} de {steps.length}</span>
                </div>
                <h2 id="project-brief-title" className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">{manuscriptTitle || 'Tu obra'}</h2>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">Cuéntanos cómo imaginas tu proyecto para que Studio FLAMKIT pueda analizarlo con contexto y preparar el siguiente paso.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Cerrar Project Brief" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"><X className="h-5 w-5" /></button>
            </div>

            {!savedSuccess && (
              <div className="mt-6">
                <div className="grid gap-2 pb-2.5 sm:grid-cols-5">
                  {steps.map((item, index) => {
                    const passed = step > index;
                    const current = step === index;
                    const accessible = index <= step || validations.slice(0, index).every(Boolean);
                    return (
                      <button key={item.number} type="button" disabled={!accessible} onClick={() => goToStep(index)} className={`rounded-2xl border p-2.5 text-left transition-all sm:p-3 ${current ? 'border-accent/40 bg-accent/10 text-accent dark:bg-accent/20' : passed ? 'border-emerald-500/30 bg-emerald-500/10 text-zinc-800 dark:bg-emerald-500/15 dark:text-zinc-200' : accessible ? 'border-zinc-200/80 text-zinc-600 hover:border-accent/40 dark:border-zinc-800/80 dark:text-zinc-400' : 'border-zinc-200/50 opacity-40 dark:border-zinc-800/50'}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-semibold ${current ? 'bg-accent text-white' : passed ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>{passed ? <Check className="h-3.5 w-3.5" /> : !accessible ? <Lock className="h-3 w-3" /> : item.number}</span>
                          <span className="min-w-0"><span className="block truncate text-xs font-medium">{item.title}</span><span className="hidden truncate text-[10px] text-zinc-400 sm:block">{item.subtitle}</span></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800/80"><motion.div className="h-full rounded-full bg-accent" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} /></div>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-12">
            {loadingInitial ? (
              <div className="py-24 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" /><p className="mt-4 text-sm text-zinc-500">Cargando información de tu proyecto…</p></div>
            ) : savedSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-xl space-y-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-10 w-10" /></div>
                <div className="space-y-3"><span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Información registrada</span><h3 className="font-serif text-3xl font-medium">Gracias por compartir tu visión.</h3><p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">El equipo de Studio FLAMKIT utilizará estas respuestas junto con tu manuscrito para analizar el proyecto y preparar el siguiente paso.</p></div>
                <button type="button" onClick={onClose} className="inline-flex items-center gap-2.5 rounded-2xl bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-accent-hover">Volver al Panel del Autor</button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="obra" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-3xl space-y-8">
                    <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80"><span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">Paso 1 · La obra</span><h3 className="mt-1 font-serif text-2xl font-normal sm:text-3xl">Cuéntanos qué obra vamos a transformar.</h3><p className="mt-1 text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-400">Estos datos ayudan a entender el marco literario, el público y el objetivo del proyecto.</p></div>
                    <div className="space-y-3"><p className={labelClass}>Género literario principal <span className="text-accent">*</span></p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{genreOptions.map(([id, emoji, desc]) => <button key={id} type="button" onClick={() => update('genre', id)} className={`rounded-2xl border p-4 text-left transition-all ${form.genre === id ? 'border-accent bg-accent/15 ring-1 ring-accent dark:bg-accent/20' : 'border-zinc-200 bg-zinc-50/70 hover:border-accent/50 dark:border-zinc-800/80 dark:bg-zinc-900/60'}`}><div className="flex items-center justify-between"><span className="font-semibold">{emoji} {id}</span>{form.genre === id && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white"><Check className="h-3 w-3" /></span>}</div><p className="mt-1.5 pl-6 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p></button>)}</div></div>
                    <div className="space-y-2"><label className={labelClass}>¿A qué tipo de lector o público está dirigida? <span className="text-accent">*</span></label><input className={inputClass} value={form.targetAudience ?? ''} onChange={(e) => update('targetAudience', e.target.value || null)} placeholder="Ej.: lectores de misterio contemporáneo, público joven adulto…" /></div>
                    <div className="space-y-2"><label className={labelClass}>¿Qué quieres conseguir con este audiolibro? <span className="text-accent">*</span></label><select className={inputClass} value={form.projectGoal ?? ''} onChange={(e) => update('projectGoal', e.target.value || null)}><option value="">Selecciona una opción</option><option>Vender la obra</option><option>Ampliar el alcance de mi libro</option><option>Fortalecer mi marca como autor/a</option><option>Llegar a nuevos lectores</option><option>Tener una versión profesional de mi obra</option><option>Uso personal / privado</option><option>Otro objetivo</option></select></div>
                    <div className="space-y-2"><label className={labelClass}>¿Cómo imaginas el resultado final? <span className="text-accent">*</span></label><textarea rows={5} className={inputClass} value={form.creativeVision ?? ''} onChange={(e) => update('creativeVision', e.target.value || null)} placeholder="Describe qué debería transmitir la producción cuando la escuches por primera vez…" /></div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="vision" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-3xl space-y-8">
                    <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80"><span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">Paso 2 · Tu visión</span><h3 className="mt-1 font-serif text-2xl font-normal sm:text-3xl">¿Cómo debería sentirse y sonar tu obra?</h3><p className="mt-1 text-sm font-light text-zinc-600 dark:text-zinc-400">No necesitas saber de producción: cuéntanos lo que imaginas con tus propias palabras.</p></div>
                    <div className="space-y-3"><label className={labelClass}><Sparkles className="mr-1 inline h-4 w-4 text-accent" />Sensaciones que quieres provocar <span className="text-accent">*</span></label><div className="flex flex-wrap gap-2.5">{sensationOptions.map((item) => <button key={item} type="button" onClick={() => toggleArray('desiredSensations', item)} className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-all ${form.desiredSensations.includes(item) ? 'border-accent bg-accent text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-accent/50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300'}`}>{item}</button>)}</div></div>
                    <div className="space-y-2"><label className={labelClass}><Volume2 className="mr-1 inline h-4 w-4 text-accent" />Voz, ritmo y dirección de lectura <span className="text-accent">*</span></label><textarea rows={4} className={inputClass} value={form.productionPreferences ?? ''} onChange={(e) => update('productionPreferences', e.target.value || null)} placeholder="Ej.: voz cálida y madura, ritmo pausado, más tensión en escenas clave…" /></div>
                    <div className="space-y-2"><label className={labelClass}>Referencias creativas <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Opcional</span></label><textarea rows={3} className={inputClass} value={form.creativeReferences ?? ''} onChange={(e) => update('creativeReferences', e.target.value || null)} placeholder="Obras, voces, estilos, podcasts, películas o referencias que te inspiren…" /></div>
                    <div className="space-y-2"><label className={labelClass}>¿Qué NO quieres en el audiolibro? <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Opcional</span></label><textarea rows={3} className={inputClass} value={form.mustAvoid ?? ''} onChange={(e) => update('mustAvoid', e.target.value || null)} placeholder="Efectos, música, ritmos, interpretaciones o decisiones que quieras evitar…" /></div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="autor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-3xl space-y-8">
                    <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80"><span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">Paso 3 · Tu alcance</span><h3 className="mt-1 font-serif text-2xl font-normal sm:text-3xl">Queremos entender también tu mundo como autor/a.</h3><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Esto no fija el precio automáticamente. Nos ayuda a entender el alcance potencial del proyecto.</p></div>
                    <div className="space-y-3"><label className={labelClass}><Users className="mr-1 inline h-4 w-4 text-accent" />¿Cómo describirías tu presencia pública?</label><div className="grid gap-3 sm:grid-cols-3">{[['none','No tengo presencia pública relevante'],['social_presence','Tengo redes y una audiencia'],['creator','Soy creador/a de contenido']].map(([id,label]) => <button key={id} type="button" onClick={() => update('creatorStatus', id as SaveProjectBriefInput['creatorStatus'])} className={`rounded-2xl border p-4 text-left text-sm font-medium transition-all ${form.creatorStatus === id ? 'border-accent bg-accent/10 ring-1 ring-accent dark:bg-accent/20' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60'}`}>{label}</button>)}</div></div>
                    <div className="space-y-2"><label className={labelClass}>¿Qué tipo de contenido creas?</label><select className={inputClass} value={form.creatorContentType ?? ''} onChange={(e) => update('creatorContentType', e.target.value || null)}><option value="">No aplica / prefiero no indicar</option><option>Educación</option><option>Entretenimiento</option><option>Literatura</option><option>Negocios</option><option>Desarrollo personal</option><option>Cultura</option><option>Otro</option></select></div>
                    <div className="space-y-3"><div className="flex items-center justify-between"><label className={labelClass}>Redes y audiencia</label><button type="button" onClick={addSocialProfile} className="inline-flex items-center gap-1.5 rounded-xl border border-edge bg-surface px-3 py-2 text-xs font-medium text-ink hover:border-accent/40 hover:text-accent"><Plus className="h-3.5 w-3.5" /> Añadir plataforma</button></div>{form.socialProfiles.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60">Añade las plataformas donde tienes presencia para registrar el alcance de cada una.</div> : <div className="space-y-3">{form.socialProfiles.map((profile,index) => <div key={`${profile.platform}-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"><div className="grid gap-3 md:grid-cols-[1fr_1.2fr_1fr_auto]"><select className={inputClass} value={profile.platform} onChange={(e) => updateSocialProfile(index,{platform:e.target.value})}>{socialPlatformOptions.map((platform)=><option key={platform}>{platform}</option>)}</select><input className={inputClass} value={profile.url ?? ''} onChange={(e)=>updateSocialProfile(index,{url:e.target.value||null})} placeholder="Enlace a tu perfil" /><select className={inputClass} value={profile.audienceSizeBand} onChange={(e)=>updateSocialProfile(index,{audienceSizeBand:e.target.value as ProjectBriefAudienceSizeBand})}>{audienceBands.map((band)=><option key={band.id} value={band.id}>{band.label} seguidores</option>)}</select><button type="button" onClick={()=>removeSocialProfile(index)} className="h-11 rounded-xl px-3 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30" aria-label={`Eliminar ${profile.platform}`}><X className="h-4 w-4" /></button></div></div>)}</div>}</div>
                    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label className={labelClass}>Tu presencia principal <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Opcional</span></label><input className={inputClass} value={form.primarySocialUrl ?? ''} onChange={(e)=>update('primarySocialUrl',e.target.value||null)} placeholder="https://…" /></div><div className="space-y-2"><label className={labelClass}>Presupuesto orientativo <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Opcional</span></label><select className={inputClass} value={form.budgetBand ?? ''} onChange={(e)=>update('budgetBand',e.target.value||null)}><option value="">Prefiero no indicarlo</option><option>Menos de $500</option><option>$500–$999</option><option>$1,000–$2,499</option><option>$2,500–$4,999</option><option>$5,000+</option></select></div></div>
                    {form.creatorStatus !== 'none' && form.socialProfiles.length === 0 && <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"><Info className="h-4 w-4 shrink-0" />Si tienes presencia pública, añade al menos una plataforma para que podamos entender mejor tu alcance.</div>}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="entrega" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-3xl space-y-8">
                    <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80"><span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">Paso 4 · Entrega y publicación</span><h3 className="mt-1 font-serif text-2xl font-normal sm:text-3xl">¿Cómo quieres recibir y lanzar tu producción?</h3><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Registramos tu intención ahora. Las integraciones de distribución llegarán más adelante.</p></div>
                    <div className="space-y-3"><label className={labelClass}>Formato final deseado <span className="text-accent">*</span></label><div className="grid gap-3 sm:grid-cols-2">{deliveryFormats.map(([id,emoji,title,desc])=><button key={id} type="button" onClick={()=>update('desiredDeliveryFormat',id)} className={`rounded-2xl border p-5 text-left transition-all ${form.desiredDeliveryFormat===id ? 'border-accent bg-accent/15 ring-1 ring-accent dark:bg-accent/20':'border-zinc-200 bg-zinc-50/70 hover:border-accent/50 dark:border-zinc-800/80 dark:bg-zinc-900/60'}`}><div className="flex items-center gap-2 font-semibold">{emoji} {title}</div><p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{desc}</p></button>)}</div></div>
                    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label className={labelClass}><CalendarDays className="mr-1 inline h-4 w-4 text-accent" />Fecha objetivo (opcional)</label><input type="date" className={inputClass} value={form.targetDate ?? ''} onChange={(e)=>update('targetDate',e.target.value||null)} /></div><div className="space-y-2"><label className={labelClass}>Preferencias técnicas <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Opcional</span></label><input className={inputClass} value={form.technicalPreferences ?? ''} onChange={(e)=>update('technicalPreferences',e.target.value||null)} placeholder="Metadatos, nomenclatura, especificaciones especiales…" /></div></div>
                    <div className="space-y-3"><label className={labelClass}><Globe2 className="mr-1 inline h-4 w-4 text-accent" />¿Dónde te gustaría publicar el audiolibro?</label><div className="flex flex-wrap gap-2.5">{distributionOptions.map((item)=><button type="button" key={item} onClick={()=>toggleArray('distributionPlatforms',item)} className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-all ${form.distributionPlatforms.includes(item) ? 'border-accent bg-accent text-white' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60'}`}>{item}</button>)}</div></div>
                    <div className="space-y-3"><label className={labelClass}><Megaphone className="mr-1 inline h-4 w-4 text-accent" />¿Dónde te gustaría promocionarlo?</label><div className="flex flex-wrap gap-2.5">{promotionOptions.map((item)=><button type="button" key={item} onClick={()=>toggleArray('promotionPlatforms',item)} className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-all ${form.promotionPlatforms.includes(item) ? 'border-accent bg-accent text-white' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60'}`}>{item}</button>)}</div></div>
                    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label className={labelClass}><ShieldCheck className="mr-1 inline h-4 w-4 text-accent" />Derechos de la obra</label><select className={inputClass} value={form.rightsStatus} onChange={(e)=>update('rightsStatus',e.target.value as SaveProjectBriefInput['rightsStatus'])}><option value="confirmed">Sí, tengo los derechos necesarios</option><option value="unsure">No estoy seguro/a</option><option value="needs_guidance">Necesito orientación</option></select></div><div className="space-y-2"><label className={labelClass}>¿Te interesa usar futuras herramientas de distribución?</label><select className={inputClass} value={form.futureDistributionInterest ? 'yes' : 'no'} onChange={(e)=>update('futureDistributionInterest',e.target.value==='yes')}><option value="no">No por ahora</option><option value="yes">Sí, me interesa</option></select></div></div>
                    <div className="space-y-2"><label className={labelClass}>Notas adicionales <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Opcional</span></label><textarea rows={4} className={inputClass} value={form.additionalNotes ?? ''} onChange={(e)=>update('additionalNotes',e.target.value||null)} placeholder="Cualquier detalle que Studio FLAMKIT deba conocer antes de analizar el proyecto…" /></div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="confirmacion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-3xl space-y-6">
                    <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80"><span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">Paso 5 · Confirmación</span><h3 className="mt-1 font-serif text-2xl font-normal sm:text-3xl">Revisa lo que recibirá Studio FLAMKIT.</h3><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Tu manuscrito y estas respuestas serán la base del análisis inicial.</p></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SummaryCard title="La obra" icon={<Wand2 className="h-4 w-4" />} lines={[`Género: ${form.genre || 'Sin definir'}`, `Audiencia: ${form.targetAudience || 'Sin definir'}`, `Objetivo: ${form.projectGoal || 'Sin definir'}`]} onEdit={() => setStep(0)} />
                      <SummaryCard title="Tu visión" icon={<Sparkles className="h-4 w-4" />} lines={[`Sensaciones: ${form.desiredSensations.join(' · ') || 'Sin definir'}`, `Dirección: ${form.productionPreferences || 'Sin definir'}`, `Evitar: ${form.mustAvoid || 'Nada indicado'}`]} onEdit={() => setStep(1)} />
                      <SummaryCard title="Tu alcance" icon={<Users className="h-4 w-4" />} lines={[`Perfil: ${form.creatorStatus}`, `Plataformas: ${form.socialProfiles.map((profile) => `${profile.platform} (${audienceBands.find((band)=>band.id===profile.audienceSizeBand)?.label ?? profile.audienceSizeBand})`).join(' · ') || 'Ninguna'}`, `Contenido: ${form.creatorContentType || 'No indicado'}`]} onEdit={() => setStep(2)} />
                      <SummaryCard title="Entrega y publicación" icon={<Globe2 className="h-4 w-4" />} lines={[`Formato: ${form.desiredDeliveryFormat || 'Sin definir'}`, `Distribución: ${form.distributionPlatforms.join(' · ') || 'Sin definir'}`, `Promoción: ${form.promotionPlatforms.join(' · ') || 'Sin definir'}`]} onEdit={() => setStep(3)} />
                    </div>
                    {errorMessage && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">{errorMessage}</div>}
                    <div className="flex items-start gap-3 rounded-2xl border border-edge/60 bg-surface p-4 text-xs text-ink-muted"><Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><p>Al enviar, esta información quedará asociada a tu manuscrito. No necesitas conocer estándares técnicos ni decidir ahora cómo se distribuirá el audiolibro.</p></div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {!savedSuccess && (
            <footer className="shrink-0 border-t border-zinc-200/80 bg-zinc-50/90 px-6 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:px-10 lg:px-12">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={step === 0 ? onClose : previousStep} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-medium text-zinc-700 transition hover:border-accent/40 hover:text-accent dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">{step === 0 ? 'Cancelar' : <><ChevronLeft className="h-4 w-4" /> Atrás</>}</button>
                {step < steps.length - 1 ? <button type="button" onClick={nextStep} disabled={!canAdvance} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold ${canAdvance ? 'bg-accent text-white hover:bg-accent-hover' : 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800'}`}>Continuar <ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={handleSubmit} disabled={saving || !safeManuscriptId || !safeAuthorId} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold ${!saving && safeManuscriptId && safeAuthorId ? 'bg-accent text-white hover:bg-accent-hover' : 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800'}`}>{saving ? 'Guardando…' : <>Enviar información <Check className="h-4 w-4" /></>}</button>}
              </div>
            </footer>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SummaryCard({ title, icon, lines, onEdit }: { title: string; icon: React.ReactNode; lines: string[]; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700/80"><span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">{icon}{title}</span><button type="button" onClick={onEdit} className="text-xs font-medium text-zinc-500 hover:text-accent">Modificar</button></div>
      <div className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{lines.map((line) => <p key={line}>{line}</p>)}</div>
    </div>
  );
}
