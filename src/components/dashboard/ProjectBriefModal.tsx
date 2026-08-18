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

const deliveryFormats = [
  ['M4B', '🎧', 'M4B Audiolibro', 'Archivo único navegable para consumo y distribución de audiolibros.'],
  ['MP3', '🎵', 'MP3 por capítulos', 'Máxima compatibilidad para venta directa, web y reproducción flexible.'],
  ['WAV', '🎚️', 'WAV máster', 'Máster sin compresión para archivo, edición posterior o re-masterización.'],
  ['Todos los formatos', '📦', 'Pack completo', 'M4B + MP3 + WAV para máxima flexibilidad.'],
] as const;

const distributionOptions = ['Amazon / Audible', 'Apple Books', 'Spotify', 'Otra plataforma de audiolibros', 'Todavía no lo sé'] as const;
const promotionOptions = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'X', 'LinkedIn', 'Página web', 'Newsletter / Email', 'Otra'] as const;

const steps = [
  { id: 'obra', number: '01', title: 'La obra', subtitle: 'Género, audiencia y propósito' },
  { id: 'vision', number: '02', title: 'Tu visión', subtitle: 'Tono, atmósfera y dirección creativa' },
  { id: 'autor', number: '03', title: 'Tu alcance', subtitle: 'Presencia, audiencia y objetivos' },
  { id: 'entrega', number: '04', title: 'Entrega', subtitle: 'Formato, publicación y preferencias' },
  { id: 'confirmacion', number: '05', title: 'Confirmación', subtitle: 'Revisa antes de enviar' },
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

const bandRank: Record<ProjectBriefAudienceSizeBand, number> = {
  '0': 0,
  '1_999': 1,
  '1k_9_9k': 2,
  '10k_49_9k': 3,
  '50k_249_9k': 4,
  '250k_999_9_9k': 5,
  '1m_plus': 6,
};
