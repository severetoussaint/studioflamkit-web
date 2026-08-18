"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Headphones,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Volume2,
  Info,
  Lock,
} from 'lucide-react';
import type {
  ProjectBrief,
  SaveProjectBriefInput,
} from '@/types/project-brief.types';
import { getProjectBrief, saveProjectBrief } from '@/services/project-brief.service';

const genreOptions = [
  { id: 'Novela', emoji: '📖', label: 'Novela', desc: 'Ficción narrativa extensa' },
  { id: 'Cuento / Relatos', emoji: '📜', label: 'Cuento / Relatos', desc: 'Narrativa breve o antología' },
  { id: 'Ensayo', emoji: '💡', label: 'Ensayo', desc: 'Reflexión y análisis' },
  { id: 'Biografía / Memorias', emoji: '🖋️', label: 'Biografía / Memorias', desc: 'Historia de vida o crónica' },
  { id: 'Poesía', emoji: '🪶', label: 'Poesía', desc: 'Lírica y verso' },
  { id: 'Desarrollo personal / No ficción', emoji: '🧠', label: 'Desarrollo / No Ficción', desc: 'Crecimiento y conocimiento' },
  { id: 'Thriller / Misterio', emoji: '🕵️', label: 'Thriller / Misterio', desc: 'Suspenso e intriga' },
  { id: 'Fantasía / Ciencia Ficción', emoji: '🌌', label: 'Fantasía / Sci-Fi', desc: 'Mundos e imaginación' },
  { id: 'Romance / Drama', emoji: '🎭', label: 'Romance / Drama', desc: 'Relaciones humanas y pasión' },
  { id: 'Otro', emoji: '📦', label: 'Otro Género', desc: 'Formato personalizado' },
];

const sensationOptions = [
  { id: 'Emoción profunda', emoji: '💓', label: 'Emoción profunda' },
  { id: 'Suspenso e intriga', emoji: '⚡', label: 'Suspenso e intriga' },
  { id: 'Calidez e intimidad', emoji: '🕯️', label: 'Calidez e intimidad' },
  { id: 'Tensión dramática', emoji: '🎭', label: 'Tensión dramática' },
  { id: 'Misterio envolvente', emoji: '🔍', label: 'Misterio envolvente' },
  { id: 'Inspiración y fuerza', emoji: '🌟', label: 'Inspiración y fuerza' },
  { id: 'Humor e ingenio', emoji: '✨', label: 'Humor e ingenio' },
  { id: 'Melancolía y reflexión', emoji: '🌊', label: 'Melancolía y reflexión' },
  { id: 'Energía y dinamismo', emoji: '🔥', label: 'Energía y dinamismo' },
  { id: 'Serenidad y calma', emoji: '🌿', label: 'Serenidad y calma' },
  { id: 'Tono épico y majestuoso', emoji: '⚔️', label: 'Tono épico' },
  { id: 'Cercanía conversacional', emoji: '☕', label: 'Cercanía conversacional' },
];

const deliveryFormatOptions = [
  {
    id: 'M4B',
    emoji: '🎧',
    title: 'M4B Audiolibro Estándar',
    subtitle: 'Recomendado para distribución comercial',
    desc: 'Archivo único máster con tabla de capítulos navegables, metadatos y portada incrustada para Apple Books, Audible y reproductores dedicados.',
  },
  {
    id: 'MP3',
    emoji: '🎵',
    title: 'MP3 por Capítulos (320 kbps)',
    subtitle: 'Máxima compatibilidad universal',
    desc: 'Archivos individuales de audio estéreo de alta resolución por cada capítulo, ideal para cualquier plataforma web o venta directa.',
  },
  {
    id: 'WAV',
    emoji: '🎚️',
    title: 'WAV Máster de Archivo (24-bit / 48kHz)',
    subtitle: 'Calidad de estudio sin pérdida',
    desc: 'Pistas de audio sin compresión para preservación patrimonial, edición posterior o re-masterización.',
  },
  {
    id: 'Todos los formatos',
    emoji: '📦',
    title: 'Pack Completo de Producción',
    subtitle: 'M4B + MP3 + WAV Máster',
    desc: 'Entrega integral con todos los formatos de archivo y versiones de máster para archivo y distribución.',
  },
];

export interface ProjectBriefModalProps {
  open: boolean;
  onClose: () => void;
  manuscriptId: string;
  authorId: string;
  manuscriptTitle: string;
  initialData?: ProjectBrief | null;
  onBriefSaved?: (brief: ProjectBrief) => void;
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
  const [step, setStep] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<SaveProjectBriefInput>({
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
    creatorContentType: null,
    audienceSizeBand: null,
    primarySocialUrl: null,
    projectGoal: 'Tener una versión profesional de mi obra',
    distributionPlatforms: [],
    promotionPlatforms: [],
    rightsStatus: 'confirmed',
    budgetBand: null,
    futureDistributionInterest: false,
  });

  // Carga de brief existente
  useEffect(() => {
    if (!open || !manuscriptId) return;

    let isMounted = true;
    async function loadData() {
      if (initialData) {
        setForm((prev) => ({
          ...prev,
          manuscriptId,
          authorId,
          genre: initialData.genre ?? prev.genre,
          targetAudience: initialData.targetAudience ?? prev.targetAudience,
          creativeVision: initialData.creativeVision ?? prev.creativeVision,
          desiredSensations: initialData.desiredSensations?.length ? initialData.desiredSensations : prev.desiredSensations,
          productionPreferences: initialData.productionPreferences ?? prev.productionPreferences,
          creativeReferences: initialData.creativeReferences ?? prev.creativeReferences,
          mustAvoid: initialData.mustAvoid ?? prev.mustAvoid,
          desiredDeliveryFormat: initialData.desiredDeliveryFormat ?? prev.desiredDeliveryFormat,
          technicalPreferences: initialData.technicalPreferences ?? prev.technicalPreferences,
          targetDate: initialData.targetDate ?? prev.targetDate,
          additionalNotes: initialData.additionalNotes ?? prev.additionalNotes,
          creatorStatus: initialData.creatorStatus ?? prev.creatorStatus,
          socialPlatforms: initialData.socialPlatforms ?? prev.socialPlatforms,
          creatorContentType: initialData.creatorContentType ?? prev.creatorContentType,
          audienceSizeBand: initialData.audienceSizeBand ?? prev.audienceSizeBand,
          primarySocialUrl: initialData.primarySocialUrl ?? prev.primarySocialUrl,
          projectGoal: initialData.projectGoal ?? prev.projectGoal,
          distributionPlatforms: initialData.distributionPlatforms ?? prev.distributionPlatforms,
          promotionPlatforms: initialData.promotionPlatforms ?? prev.promotionPlatforms,
          rightsStatus: initialData.rightsStatus ?? prev.rightsStatus,
          budgetBand: initialData.budgetBand ?? prev.budgetBand,
          futureDistributionInterest: initialData.futureDistributionInterest ?? prev.futureDistributionInterest,
        }));
        return;
      }

      try {
        setLoadingInitial(true);
        const fetched = await getProjectBrief(manuscriptId);
        if (isMounted && fetched) {
          setForm({
            manuscriptId,
            authorId,
            genre: fetched.genre,
            targetAudience: fetched.targetAudience,
            creativeVision: fetched.creativeVision,
            desiredSensations: fetched.desiredSensations || [],
            productionPreferences: fetched.productionPreferences,
            creativeReferences: fetched.creativeReferences,
            mustAvoid: fetched.mustAvoid,
            desiredDeliveryFormat: fetched.desiredDeliveryFormat || 'M4B',
            technicalPreferences: fetched.technicalPreferences,
            targetDate: fetched.targetDate,
            additionalNotes: fetched.additionalNotes,
            creatorStatus: fetched.creatorStatus || 'none',
            socialPlatforms: fetched.socialPlatforms || [],
            creatorContentType: fetched.creatorContentType,
            audienceSizeBand: fetched.audienceSizeBand,
            primarySocialUrl: fetched.primarySocialUrl,
            projectGoal: fetched.projectGoal || 'Tener una versión profesional de mi obra',
            distributionPlatforms: fetched.distributionPlatforms || [],
            promotionPlatforms: fetched.promotionPlatforms || [],
            rightsStatus: fetched.rightsStatus || 'confirmed',
            budgetBand: fetched.budgetBand,
            futureDistributionInterest: fetched.futureDistributionInterest || false,
          });
        }
      } catch (err) {
        console.warn('No se pudo cargar el brief existente:', err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [open, manuscriptId, authorId, initialData]);

  // Actualizadores de formulario
  const update = <K extends keyof SaveProjectBriefInput>(key: K, value: SaveProjectBriefInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArray = (key: 'desiredSensations' | 'socialPlatforms' | 'distributionPlatforms' | 'promotionPlatforms', value: string) => {
    setForm((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      };
    });
  };

  // Validaciones por paso para habilitar el avance estricto
  const isStep0Valid = useMemo(() => {
    return Boolean(form.genre);
  }, [form.genre]);

  const isStep1Valid = useMemo(() => {
    return form.desiredSensations.length > 0 || Boolean(form.productionPreferences?.trim());
  }, [form.desiredSensations, form.productionPreferences]);

  const isStep2Valid = useMemo(() => {
    return Boolean(form.desiredDeliveryFormat);
  }, [form.desiredDeliveryFormat]);

  const canAdvanceCurrentStep = useMemo(() => {
    if (step === 0) return isStep0Valid;
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    return true;
  }, [step, isStep0Valid, isStep1Valid, isStep2Valid]);

  // Permite verificar si un paso previo o futuro puede ser visitado
  const isStepAccessible = (targetIndex: number) => {
    if (targetIndex === 0) return true;
    if (targetIndex === 1) return isStep0Valid;
    if (targetIndex === 2) return isStep0Valid && isStep1Valid;
    if (targetIndex === 3) return isStep0Valid && isStep1Valid && isStep2Valid;
    return false;
  };

  const steps = useMemo(
    () => [
      {
        id: 'obra',
        emoji: '📖',
        number: '01',
        title: 'Género & Audiencia',
        subtitle: 'Define el marco literario de tu obra',
      },
      {
        id: 'vision',
        emoji: '🎙️',
        number: '02',
        title: 'Tono & Atmósfera',
        subtitle: 'Cómo debe sentirse y sonar la narración',
      },
      {
        id: 'formato',
        emoji: '📦',
        number: '03',
        title: 'Formato & Entrega',
        subtitle: 'Especificaciones técnicas de archivo',
      },
      {
        id: 'resumen',
        emoji: '✨',
        number: '04',
        title: 'Confirmación',
        subtitle: 'Revisa y envía a Dirección Artística',
      },
    ],
    []
  );

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSaving(true);
    try {
      const saved = await saveProjectBrief(form);
      setSavedSuccess(true);
      if (onBriefSaved) {
        onBriefSaved(saved);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al guardar el Project Brief.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Overlay con 70% de opacidad y desenfoque suave sobre el Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Amplio y Opaco (Modo Claro / Modo Oscuro) con Espaciado Generoso */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-brief-title"
          className="relative z-10 flex flex-col w-full max-w-4xl lg:max-w-5xl min-h-[640px] max-h-[92vh] overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
        >
          {/* Header Superior Amplio y Elegante */}
          <div className="shrink-0 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-900/90 px-6 sm:px-10 lg:px-12 py-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 dark:bg-accent/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Project Brief Editorial</span>
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Paso {step + 1} de {steps.length}
                  </span>
                </div>
                <h2 id="project-brief-title" className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
                  {manuscriptTitle || 'Tu Obra'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Completa cada paso para orientar la dramatización, el timbre de voz y el formato de tu audiolibro.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar Project Brief"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper de 4 Pasos Espaciado con Bloqueo de Pasos Futuros */}
            {!savedSuccess && (
              <div className="mt-6 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pb-2.5">
                  {steps.map((s, idx) => {
                    const isCurrent = step === idx;
                    const isPassed = step > idx;
                    const isAccessible = isStepAccessible(idx);

                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!isAccessible}
                        onClick={() => isAccessible && setStep(idx)}
                        className={`group flex items-center gap-3 rounded-2xl p-2.5 sm:p-3 text-left transition-all duration-200 ${
                          isCurrent
                            ? 'bg-accent/10 dark:bg-accent/20 border border-accent/40 text-accent shadow-sm'
                            : isPassed
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-emerald-500/20'
                            : isAccessible
                            ? 'border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:border-accent/40 hover:text-zinc-900 dark:hover:text-zinc-100'
                            : 'border border-zinc-200/50 dark:border-zinc-800/50 opacity-40 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                            isCurrent
                              ? 'bg-accent text-white shadow-xs'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : isAccessible
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
                          }`}
                        >
                          {isPassed ? <Check className="h-3.5 w-3.5" /> : !isAccessible ? <Lock className="h-3 w-3" /> : s.emoji}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{s.number}</p>
                          <p className="truncate text-xs font-medium">{s.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Barra de Progreso Fluida */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 mt-1">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={false}
                    animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cuerpo Central Espacioso con Respiración Visual */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 space-y-8">
            {loadingInitial ? (
              <div className="py-24 text-center space-y-4">
                <div className="mx-auto h-10 w-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
                <p className="text-sm text-zinc-500 font-mono">Cargando especificaciones del proyecto...</p>
              </div>
            ) : savedSuccess ? (
              /* Pantalla de Éxito Limpia */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center space-y-6 max-w-xl mx-auto"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Fase Editorial Iniciada ✨
                  </span>
                  <h3 className="font-serif text-3xl font-medium text-zinc-900 dark:text-zinc-100">
                    ¡Project Brief Registrado con Éxito!
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                    Hemos guardado tus especificaciones creativas. Nuestro equipo artístico utilizará estas respuestas para estructurar el desglose sonoro y las pruebas de voz de tu obra.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Volver al Panel del Autor</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {/* ============================================================ */}
                {/* PASO 1: GÉNERO Y PÚBLICO OBJETIVO                           */}
                {/* ============================================================ */}
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8 max-w-3xl mx-auto"
                  >
                    {/* Encabezado del Paso */}
                    <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">
                        Paso 1 de 4 · Marco de la Obra
                      </span>
                      <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-zinc-900 dark:text-zinc-100">
                        ¿Cuál es el género literario principal?
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                        Selecciona el género que mejor represente la estructura narrativa y el estilo de tu manuscrito.
                      </p>
                    </div>

                    {/* Grilla Espaciosa de Géneros */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {genreOptions.map((item) => {
                        const isSelected = form.genre === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => update('genre', item.id)}
                            className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-accent bg-accent/15 dark:bg-accent/20 text-zinc-900 dark:text-zinc-100 shadow-md ring-1 ring-accent'
                                : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-accent/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{item.emoji}</span>
                                <p className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                  {item.label}
                                </p>
                              </div>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                                  <Check className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-light pl-6">
                              {item.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Campo de Audiencia Objetivo */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                        <span>¿A qué tipo de lector o público está dirigida la obra?</span>
                        <span className="text-[11px] font-normal text-zinc-400">Opcional</span>
                      </label>
                      <input
                        type="text"
                        value={form.targetAudience ?? ''}
                        onChange={(e) => update('targetAudience', e.target.value || null)}
                        placeholder="Ej: Lectores de novela histórica, amantes del misterio contemporáneo, público joven adulto..."
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/80 px-5 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      />
                    </div>

                    {/* Mensaje Guía si no ha seleccionado */}
                    {!isStep0Valid && (
                      <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                        <Info className="h-4 w-4 shrink-0" />
                        <span>Por favor, selecciona un género literario arriba para poder avanzar al siguiente paso.</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ============================================================ */}
                {/* PASO 2: TONO, VOZ Y ATMÓSFERA SONORA                         */}
                {/* ============================================================ */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8 max-w-3xl mx-auto"
                  >
                    {/* Encabezado del Paso */}
                    <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">
                        Paso 2 de 4 · Tono & Atmósfera
                      </span>
                      <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-zinc-900 dark:text-zinc-100">
                        ¿Qué sensaciones debe transmitir el audio?
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                        Selecciona las emociones predominantes y describe el tipo de voz o ritmo que imaginas.
                      </p>
                    </div>

                    {/* Chips de Sensaciones Espaciosos */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span>Sensaciones sonoras clave (selecciona una o varias)</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {sensationOptions.map((item) => {
                          const isSelected = form.desiredSensations.includes(item.id);
                          return (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => toggleArray('desiredSensations', item.id)}
                              className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'border-accent bg-accent text-white shadow-sm ring-2 ring-accent/30'
                                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-accent/50 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>{item.emoji}</span>
                                <span>{item.label}</span>
                                {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Voz y Ritmo Deseado */}
                    <div className="space-y-2.5 pt-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-accent" />
                        <span>¿Cómo imaginas la voz del narrador y el ritmo de lectura?</span>
                      </label>
                      <textarea
                        rows={3}
                        value={form.productionPreferences ?? ''}
                        onChange={(e) => update('productionPreferences', e.target.value || null)}
                        placeholder="Ej: Voz cálida y madura, ritmo pausado con tensión dramática en momentos clave. Pausas deliberadas entre diálogos..."
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/80 p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      />
                    </div>

                    {/* Qué Evitar */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                        <span>¿Hay algo que definitivamente NO quieras en el audiolibro?</span>
                        <span className="text-[11px] font-normal text-zinc-400">Opcional</span>
                      </label>
                      <input
                        type="text"
                        value={form.mustAvoid ?? ''}
                        onChange={(e) => update('mustAvoid', e.target.value || null)}
                        placeholder="Ej: Evitar efectos sonoros invasivos, no usar música en medio del diálogo, evitar voces estridentes..."
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/80 px-5 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      />
                    </div>

                    {!isStep1Valid && (
                      <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                        <Info className="h-4 w-4 shrink-0" />
                        <span>Selecciona al menos una sensación o describe la voz deseada para continuar.</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ============================================================ */}
                {/* PASO 3: FORMATO Y ESPECIFICACIONES DE ENTREGA               */}
                {/* ============================================================ */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8 max-w-3xl mx-auto"
                  >
                    {/* Encabezado del Paso */}
                    <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">
                        Paso 3 de 4 · Formato & Entrega
                      </span>
                      <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-zinc-900 dark:text-zinc-100">
                        ¿Cómo prefieres recibir los archivos finales?
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                        Entregamos másters optimizados según tus canales de distribución previstos.
                      </p>
                    </div>

                    {/* Opciones de Formato en Tarjetas Espaciosas */}
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {deliveryFormatOptions.map((opt) => {
                        const isSelected = form.desiredDeliveryFormat === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => update('desiredDeliveryFormat', opt.id)}
                            className={`rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-accent bg-accent/15 dark:bg-accent/20 text-zinc-900 dark:text-zinc-100 shadow-md ring-1 ring-accent'
                                : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-accent/50 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{opt.emoji}</span>
                                <p className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                  {opt.title}
                                </p>
                              </div>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                                  <Check className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] font-medium text-accent/90 pl-6">{opt.subtitle}</p>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light pl-6">
                              {opt.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Fecha Estimada y Notas de Entrega */}
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-accent" />
                          <span>Fecha objetivo de publicación (opcional)</span>
                        </label>
                        <input
                          type="date"
                          value={form.targetDate ?? ''}
                          onChange={(e) => update('targetDate', e.target.value || null)}
                          className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/80 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          Notas especiales de entrega (opcional)
                        </label>
                        <input
                          type="text"
                          value={form.additionalNotes ?? ''}
                          onChange={(e) => update('additionalNotes', e.target.value || null)}
                          placeholder="Requisitos de metadatos, plataformas específicas, etc."
                          className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/80 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ============================================================ */}
                {/* PASO 4: RESUMEN EDITORIAL Y ENVÍO                           */}
                {/* ============================================================ */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 max-w-3xl mx-auto"
                  >
                    {/* Encabezado del Paso */}
                    <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">
                        Paso 4 de 4 · Resumen & Envío
                      </span>
                      <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-zinc-900 dark:text-zinc-100">
                        Revisa la visión creativa de tu obra
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                        Verifica las especificaciones antes de enviarlas al Director Artístico. Puedes editar cualquier sección con un clic.
                      </p>
                    </div>

                    {/* Tarjetas Resumen Amplias y Claras */}
                    <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                      {/* Tarjeta 1: Obra */}
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/80 pb-2">
                          <span className="font-semibold text-accent uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>1. La Obra</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(0)}
                            className="text-xs text-zinc-500 hover:text-accent font-medium transition cursor-pointer"
                          >
                            Modificar
                          </button>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">
                          <strong className="text-zinc-900 dark:text-zinc-100">Género:</strong>{' '}
                          {form.genre || 'No especificado'}
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300">
                          <strong className="text-zinc-900 dark:text-zinc-100">Audiencia:</strong>{' '}
                          {form.targetAudience || 'Público general'}
                        </p>
                      </div>

                      {/* Tarjeta 2: Tono y Atmósfera */}
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/80 pb-2">
                          <span className="font-semibold text-accent uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4" />
                            <span>2. Tono y Voz</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-xs text-zinc-500 hover:text-accent font-medium transition cursor-pointer"
                          >
                            Modificar
                          </button>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">
                          <strong className="text-zinc-900 dark:text-zinc-100">Sensaciones:</strong>{' '}
                          {form.desiredSensations.length ? form.desiredSensations.join(', ') : 'Ninguna seleccionada'}
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                          <strong className="text-zinc-900 dark:text-zinc-100">Voz y Ritmo:</strong>{' '}
                          {form.productionPreferences || 'A criterio de dirección artística'}
                        </p>
                      </div>

                      {/* Tarjeta 3: Formato */}
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 p-5 space-y-3 sm:col-span-2 shadow-xs">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/80 pb-2">
                          <span className="font-semibold text-accent uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Headphones className="h-4 w-4" />
                            <span>3. Formato y Especificaciones</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="text-xs text-zinc-500 hover:text-accent font-medium transition cursor-pointer"
                          >
                            Modificar
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300">
                          <p>
                            <strong className="text-zinc-900 dark:text-zinc-100">Formato deseado:</strong>{' '}
                            {form.desiredDeliveryFormat || 'M4B'}
                          </p>
                          <p>
                            <strong className="text-zinc-900 dark:text-zinc-100">Fecha objetivo:</strong>{' '}
                            {form.targetDate || 'Sin fecha fija estipulada'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Al enviar, nuestro Director Editorial elaborará la propuesta personalizada de casting vocal y desglose de producción.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Footer Inferior Fijo con Botones Prominentes */}
          {!savedSuccess && !loadingInitial && (
            <div className="shrink-0 flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-900/90 px-6 sm:px-10 lg:px-12 py-5">
              <button
                type="button"
                onClick={() => {
                  if (step > 0) {
                    setStep(step - 1);
                  } else {
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{step === 0 ? 'Cancelar' : 'Atrás'}</span>
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={!canAdvanceCurrentStep}
                  onClick={() => canAdvanceCurrentStep && setStep(step + 1)}
                  className={`inline-flex items-center gap-2.5 rounded-2xl px-7 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-200 ${
                    canAdvanceCurrentStep
                      ? 'bg-accent hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Continuar al Paso {step + 2}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-accent px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-lg hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Guardando Brief...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Confirmar y Enviar a Dirección Artística</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
