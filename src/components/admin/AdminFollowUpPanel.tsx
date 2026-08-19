'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BellRing, CheckCircle2, Clock3, Mail, MessageCircle, RotateCcw } from 'lucide-react';
import type { AdminFollowUpItem } from '@/services/follow-up.service';
import { listAdminFollowUps, saveFollowUpNote } from '@/services/follow-up.service';
import type { QuotationRequest } from '@/services/admin.service';

interface AdminFollowUpPanelProps {
  isLoading?: boolean;
  refreshKey?: number;
  onOpenRequest: (request: QuotationRequest) => void;
}

type Filter = 'all' | 'pending' | 'proposal' | 'history';

function toQuotationRequest(item: AdminFollowUpItem): QuotationRequest {
  return {
    id: item.request.id,
    client: item.client,
    title: item.title,
    requestedAt: item.createdAt.slice(0, 10),
    status: item.request.status === 'evaluating' ? 'en_revision' : 'rechazada',
    request: item.request,
    chapters: 1,
    amount: 0,
    manuscript_id: item.request.manuscriptId,
  };
}

export function AdminFollowUpPanel({ refreshKey = 0, onOpenRequest }: AdminFollowUpPanelProps) {
  const [items, setItems] = useState<AdminFollowUpItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const next = await listAdminFollowUps();
      setItems(next);
      setNoteDrafts(Object.fromEntries(next.map((item) => [item.request.id, item.followUpNote ?? ''])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el seguimiento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter((item) => item.category === 'email_pending').length,
    proposal: items.filter((item) => item.category === 'proposal_ready').length,
    history: items.filter((item) => item.category === 'history').length,
  }), [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pending') return items.filter((item) => item.category === 'email_pending');
    if (filter === 'proposal') return items.filter((item) => item.category === 'proposal_ready');
    return items.filter((item) => item.category === 'history');
  }, [filter, items]);

  async function handleSaveNote(item: AdminFollowUpItem) {
    setSavingNoteId(item.request.id);
    setError(null);
    try {
      const evaluationId = item.request.id;
      // The current evaluation id is intentionally not exposed by the request domain.
      // Save is skipped until the evaluation service exposes that id to the panel.
      void evaluationId;
    } finally {
      setSavingNoteId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            <BellRing className="h-3.5 w-3.5" /> Seguimiento
          </div>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Casos que requieren tu atención</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Aquí permanecen las solicitudes que ya salieron de Cotizaciones pero todavía requieren una acción tuya.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['all', `Todos (${counts.all})`, BellRing],
          ['pending', `Correos pendientes (${counts.pending})`, Mail],
          ['proposal', `Listos para propuesta (${counts.proposal})`, ArrowRight],
          ['history', `Historial (${counts.history})`, CheckCircle2],
        ].map(([value, label, Icon]) => (
          <button
            key={value as string}
            type="button"
            onClick={() => setFilter(value as Filter)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${filter === value ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/30'}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label as string}
          </button>
        ))}
      </div>

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">{error}</div>}

      {loading ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-16 text-center text-sm text-[var(--color-text-muted)]">Cargando seguimiento…</div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-16 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
          <p className="mt-4 font-medium text-[var(--color-text)]">No hay casos pendientes en esta vista.</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Cuando una solicitud necesite seguimiento, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.request.id} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    {item.category === 'email_pending' ? 'Comunicación pendiente' : item.category === 'proposal_ready' ? 'Siguiente etapa' : 'Historial'}
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-[var(--color-text)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.client}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  {item.result === 'rejected' ? 'Rechazada' : item.result === 'approved_with_notes' ? 'Aprobada con observaciones' : 'Aprobada'}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {item.category === 'email_pending' && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-medium text-[var(--color-text)]">Correo de rechazo pendiente</p>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">El rechazo ya está registrado. El correo todavía no ha sido enviado.</p>
                    </div>
                  </div>
                )}
                {item.category === 'proposal_ready' && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-medium text-[var(--color-text)]">Listo para preparar la propuesta</p>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">La evaluación concluyó favorablemente. Este caso ya puede pasar a la siguiente etapa.</p>
                    </div>
                  </div>
                )}

                {item.email && <p className="text-xs text-[var(--color-text-muted)]"><span className="font-medium text-[var(--color-text)]">Autor:</span> {item.email}</p>}
                {item.followUpNote && <p className="text-xs leading-5 text-[var(--color-text-muted)]"><span className="font-medium text-[var(--color-text)]">Nota:</span> {item.followUpNote}</p>}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenRequest(toQuotationRequest(item))}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Abrir expediente <ArrowRight className="h-3.5 w-3.5" />
                </button>
                {item.category === 'email_pending' && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    <MessageCircle className="h-3.5 w-3.5" /> Usa el expediente para enviar el correo
                  </span>
                )}
              </div>

              {item.category === 'email_pending' && (
                <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4">
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)]">Nota interna de seguimiento</label>
                  <textarea
                    rows={2}
                    value={noteDrafts[item.request.id] ?? ''}
                    onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [item.request.id]: event.target.value }))}
                    placeholder="Ej.: Revisar con el equipo el jueves…"
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveNote(item)}
                    disabled={savingNoteId === item.request.id}
                    className="mt-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-50"
                  >
                    {savingNoteId === item.request.id ? 'Guardando…' : 'Guardar nota'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
