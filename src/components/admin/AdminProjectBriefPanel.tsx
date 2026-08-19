"use client";

import { CalendarDays, Globe2, Megaphone, Users, Wand2 } from 'lucide-react';
import type { ProjectBrief } from '@/types/project-brief.types';

const labels: Record<string, string> = {
  creator: 'Creador/a de contenido',
  social_presence: 'Presencia en redes',
  none: 'Sin presencia pública relevante',
  confirmed: 'Confirmados',
  unsure: 'No confirmados',
  needs_guidance: 'Necesita orientación',
};

const audienceBandLabels: Record<string, string> = {
  '0': 'Sin audiencia pública',
  '1_999': '1–999',
  '1k_9_9k': '1K–9.9K',
  '10k_49_9k': '10K–49.9K',
  '50k_249_9k': '50K–249.9K',
  '250k_999_9k': '250K–999.9K',
  '1m_plus': '1M+',
};

export function AdminProjectBriefPanel({ brief }: { brief: ProjectBrief | null }) {
  if (!brief) {
    return (
      <section className="rounded-3xl border border-edge/60 bg-surface-elevated p-6 shadow-xs">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Brief del proyecto</p>
        <h3 className="mt-1 font-serif text-xl font-medium text-ink">Información pendiente</h3>
        <p className="mt-2 text-sm text-ink-muted">El autor todavía no ha completado el brief de producción.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-edge/60 bg-surface-elevated p-6 shadow-xs">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Brief del proyecto</p>
        <h3 className="mt-1 font-serif text-xl font-medium text-ink">Contexto para análisis y propuesta</h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-edge/60 bg-surface p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink"><Wand2 className="h-4 w-4 text-accent" />Obra y género</div>
          <p className="mt-2 text-sm leading-6 text-ink-muted">Género: <span className="font-medium text-ink">{brief.genre || 'No especificado'}</span></p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{brief.creativeVision || 'Sin información.'}</p>
        </div>
        <div className="rounded-2xl border border-edge/60 bg-surface p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink"><Users className="h-4 w-4 text-accent" />Audiencia y objetivo</div>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{brief.targetAudience || 'Audiencia no especificada.'}</p>
          <p className="mt-2 text-xs text-ink-muted">Objetivo: <span className="font-medium text-ink">{brief.projectGoal || 'No especificado'}</span></p>
        </div>
        <div className="rounded-2xl border border-edge/60 bg-surface p-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink"><Megaphone className="h-4 w-4 text-accent" />Impacto y presencia del autor</div>
          <p className="mt-2 text-sm text-ink-muted">{labels[brief.creatorStatus] || brief.creatorStatus}</p>
          {brief.creatorContentType && <p className="mt-1 text-xs text-ink-muted">Tipo de contenido: <span className="text-ink">{brief.creatorContentType}</span></p>}
          {brief.socialProfiles.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-edge/60">
              {brief.socialProfiles.map((profile) => (
                <div key={`${profile.platform}-${profile.url ?? 'none'}`} className="grid gap-2 border-b border-edge/60 p-3 last:border-b-0 sm:grid-cols-[1fr_1.2fr_1fr] sm:items-center">
                  <span className="text-sm font-medium text-ink">{profile.platform}</span>
                  <span className="truncate text-xs text-ink-muted">{profile.url || 'Sin enlace'}</span>
                  <span className="text-xs font-medium text-accent">{audienceBandLabels[profile.audienceSizeBand] || profile.audienceSizeBand} seguidores</span>
                </div>
              ))}
            </div>
          ) : brief.socialPlatforms.length > 0 ? (
            <p className="mt-2 text-xs text-ink-muted">Plataformas: <span className="text-ink">{brief.socialPlatforms.join(' · ')}</span></p>
          ) : null}
          {brief.audienceSizeBand && <p className="mt-2 text-xs text-ink-muted">Rango global de audiencia: <span className="text-ink">{audienceBandLabels[brief.audienceSizeBand] || brief.audienceSizeBand}</span></p>}
          {brief.primarySocialUrl && <a className="mt-2 inline-block text-xs text-accent hover:underline" href={brief.primarySocialUrl} target="_blank" rel="noreferrer">Presencia principal ↗</a>}
        </div>
        <div className="rounded-2xl border border-edge/60 bg-surface p-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink"><Globe2 className="h-4 w-4 text-accent" />Distribución y promoción</div>
          <p className="mt-2 text-xs text-ink-muted">Distribución prevista</p>
          <p className="mt-1 text-sm text-ink">{brief.distributionPlatforms.length ? brief.distributionPlatforms.join(' · ') : 'Sin definir'}</p>
          <p className="mt-3 text-xs text-ink-muted">Promoción prevista</p>
          <p className="mt-1 text-sm text-ink">{brief.promotionPlatforms.length ? brief.promotionPlatforms.join(' · ') : 'Sin definir'}</p>
          {brief.futureDistributionInterest && <p className="mt-3 text-xs font-medium text-accent">El autor está interesado en futuras herramientas de distribución.</p>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-edge/60 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Sensaciones</p><p className="mt-2 text-sm text-ink">{brief.desiredSensations.length ? brief.desiredSensations.join(' · ') : 'No especificadas'}</p></div>
        <div className="rounded-2xl border border-edge/60 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Entrega</p><p className="mt-2 text-sm text-ink">{brief.desiredDeliveryFormat || 'Pendiente'}</p></div>
        <div className="rounded-2xl border border-edge/60 bg-surface p-4"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Fecha objetivo</p></div><p className="mt-2 text-sm text-ink">{brief.targetDate || 'Sin fecha definida'}</p></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-edge/60 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Dirección / preferencias</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{brief.productionPreferences || 'Sin información.'}</p></div>
        <div className="rounded-2xl border border-edge/60 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Referencias y límites</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{brief.creativeReferences || 'Sin referencias.'}</p>{brief.mustAvoid && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-muted"><span className="font-medium text-ink">Evitar:</span> {brief.mustAvoid}</p>}</div>
      </div>

      <div className="rounded-2xl border border-edge/60 bg-surface p-4 text-sm text-ink-muted">
        <div className="grid gap-3 md:grid-cols-3">
          <p><span className="font-medium text-ink">Derechos:</span> {labels[brief.rightsStatus]}</p>
          <p><span className="font-medium text-ink">Preferencias técnicas:</span> {brief.technicalPreferences || 'Sin especificar'}</p>
          <p><span className="font-medium text-ink">Presupuesto orientativo:</span> {brief.budgetBand || 'No indicado'}</p>
        </div>
        {brief.additionalNotes && <p className="mt-3 whitespace-pre-wrap"><span className="font-medium text-ink">Notas:</span> {brief.additionalNotes}</p>}
      </div>
    </section>
  );
}
