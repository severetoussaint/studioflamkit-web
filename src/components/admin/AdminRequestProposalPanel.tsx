"use client";

import React, { useEffect, useState } from "react";
import { Inbox, FileText, ArrowRightCircle, Clock, CheckCircle2 } from "lucide-react";
import type { QuotationRequest } from "@/services/admin.service";
import type { Project } from "@/types/domain.types";
import type { ProjectBrief } from "@/types/project-brief.types";
import { getProjectBrief } from "@/services/project-brief.service";
import { AdminProjectBriefPanel } from "./AdminProjectBriefPanel";

interface AdminRequestProposalPanelProps {
  request: QuotationRequest | null | undefined;
  workspaceProject: Project | null;
}

interface BriefState {
  manuscriptId: string;
  brief: ProjectBrief | null;
  error: boolean;
}

export function AdminRequestProposalPanel({ request, workspaceProject }: AdminRequestProposalPanelProps) {
  const hasProposal = !!workspaceProject?.proposalId;
  const manuscriptId = request?.request.manuscriptId?.trim() || workspaceProject?.manuscriptId?.trim() || "";
  const [briefState, setBriefState] = useState<BriefState>({ manuscriptId: "", brief: null, error: false });

  useEffect(() => {
    if (!manuscriptId) return;

    let mounted = true;

    void getProjectBrief(manuscriptId)
      .then((data) => {
        if (mounted) setBriefState({ manuscriptId, brief: data, error: false });
      })
      .catch(() => {
        if (mounted) setBriefState({ manuscriptId, brief: null, error: true });
      });

    return () => {
      mounted = false;
    };
  }, [manuscriptId]);

  const briefLoaded = manuscriptId !== "" && briefState.manuscriptId === manuscriptId;
  const briefLoading = manuscriptId !== "" && !briefLoaded;
  const briefError = briefLoaded && briefState.error;
  const brief = briefLoaded ? briefState.brief : null;

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-premium-soft)]">
          <FileText className="h-4 w-4 text-[var(--color-premium)]" />
        </div>
        <h2 className="font-serif text-lg font-semibold text-[var(--color-text)]">Solicitud / Brief / Propuesta</h2>
      </div>

      {!request && !hasProposal ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Inbox className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No hay solicitud de cotización vinculada a esta obra.</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">El proyecto puede haberse creado manualmente sin pasar por cotización.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {request && (
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Solicitud Original</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${request.request.status === "pending" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : request.request.status === "evaluating" ? "bg-[var(--color-info-soft)] text-[var(--color-info)]" : "bg-[var(--color-success-soft)] text-[var(--color-success)]"}`}>
                  <Clock className="h-3 w-3" />{request.request.status === "pending" ? "Pendiente" : request.request.status === "evaluating" ? "En evaluación" : request.request.status}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--color-text)]">{request.title}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                <span>{request.chapters} capítulos</span>
                {request.wordCount ? <span>{request.wordCount.toLocaleString()} palabras</span> : null}
                <span>${request.amount} USD</span>
              </div>
            </div>
          )}

          {manuscriptId && (
            <div className="space-y-3">
              {briefLoading ? (
                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
                  Cargando brief del proyecto…
                </div>
              ) : briefError ? (
                <div className="rounded-2xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-4 text-sm text-[var(--color-error)]">
                  No se pudo cargar el brief del manuscrito seleccionado.
                </div>
              ) : (
                <AdminProjectBriefPanel brief={brief} />
              )}
            </div>
          )}

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Propuesta</span>
              {hasProposal ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
                  <CheckCircle2 className="h-3 w-3" />Existe
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">Pendiente</span>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {hasProposal ? "La propuesta está registrada en el sistema. Verifica su estado en el backend." : "Aún no se genera la propuesta formal para este proyecto."}
            </p>
            {!hasProposal && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)]">
                  <ArrowRightCircle className="h-3.5 w-3.5" />Preparar propuesta cuando el análisis esté listo
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
