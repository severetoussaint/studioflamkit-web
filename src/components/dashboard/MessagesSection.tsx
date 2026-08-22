'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Send,
  Plus,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Headphones,
  ArrowLeft,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import {
  listConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
  markMessagesRead,
} from '@/services/conversation.service';
import {
  getProposal,
  listProposals,
  acceptProposal,
  rejectProposal,
} from '@/services/proposal.service';
import type { Conversation, Message, Proposal } from '@/types/domain.types';
import { Button } from '@/components/ui/Button';

export interface MessagesSectionProps {
  authorId: string;
  projectId?: string | null;
  projectTitle?: string | null;
  initialConversationId?: string | null;
  onProposalAccepted?: () => void;
}

type PricingLine = {
  serviceCode: string;
  name: string;
  quantity: number;
  unitLabel: string | null;
  price: number;
  estimatedMinutes: number;
};

type ProposalPricingSnapshot = {
  complexity?: 'standard' | 'medium' | 'high' | 'cinematic';
  commercialAdjustment?: number;
  calculation?: {
    durationMinutes?: number;
    basePrice?: number;
    serviceSubtotal?: number;
    recommendedPrice?: number;
    finalPrice?: number;
    estimatedWorkMinutes?: number;
    lines?: PricingLine[];
    pricingVersion?: string;
  };
};

function formatDate(value: string | null): string {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function currency(value: number | undefined, currencyCode = 'USD'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: currencyCode });
}

function complexityLabel(value: ProposalPricingSnapshot['complexity']): string {
  switch (value) {
    case 'medium': return 'Media';
    case 'high': return 'Alta';
    case 'cinematic': return 'Cinematográfica';
    default: return 'Estándar';
  }
}

function parsePricingSnapshot(value: unknown): ProposalPricingSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const calculation = record.calculation && typeof record.calculation === 'object' && !Array.isArray(record.calculation)
    ? (record.calculation as Record<string, unknown>)
    : null;

  const lines = calculation && Array.isArray(calculation.lines)
    ? calculation.lines.flatMap((line) => {
        if (!line || typeof line !== 'object' || Array.isArray(line)) return [];
        const candidate = line as Record<string, unknown>;
        if (typeof candidate.name !== 'string') return [];
        return [{
          serviceCode: typeof candidate.serviceCode === 'string' ? candidate.serviceCode : candidate.name,
          name: candidate.name,
          quantity: typeof candidate.quantity === 'number' ? candidate.quantity : 1,
          unitLabel: typeof candidate.unitLabel === 'string' ? candidate.unitLabel : null,
          price: typeof candidate.price === 'number' ? candidate.price : 0,
          estimatedMinutes: typeof candidate.estimatedMinutes === 'number' ? candidate.estimatedMinutes : 0,
        }];
      })
    : undefined;

  return {
    complexity: ['standard', 'medium', 'high', 'cinematic'].includes(String(record.complexity))
      ? (String(record.complexity) as ProposalPricingSnapshot['complexity'])
      : undefined,
    commercialAdjustment: typeof record.commercialAdjustment === 'number' ? record.commercialAdjustment : undefined,
    calculation: calculation
      ? {
          durationMinutes: typeof calculation.durationMinutes === 'number' ? calculation.durationMinutes : undefined,
          basePrice: typeof calculation.basePrice === 'number' ? calculation.basePrice : undefined,
          serviceSubtotal: typeof calculation.serviceSubtotal === 'number' ? calculation.serviceSubtotal : undefined,
          recommendedPrice: typeof calculation.recommendedPrice === 'number' ? calculation.recommendedPrice : undefined,
          finalPrice: typeof calculation.finalPrice === 'number' ? calculation.finalPrice : undefined,
          estimatedWorkMinutes: typeof calculation.estimatedWorkMinutes === 'number' ? calculation.estimatedWorkMinutes : undefined,
          lines,
          pricingVersion: typeof calculation.pricingVersion === 'string' ? calculation.pricingVersion : undefined,
        }
      : undefined,
  };
}

function fallbackServiceLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export function MessagesSection({
  authorId,
  projectId,
  projectTitle,
  initialConversationId,
  onProposalAccepted,
}: MessagesSectionProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConv, setLoadingConv] = useState(() => Boolean(authorId));
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'proposal' | 'support'>('all');

  // Proposal state associated with active conversation
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [proposalHistory, setProposalHistory] = useState<Proposal[]>([]);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [confirmingAcceptId, setConfirmingAcceptId] = useState<string | null>(null);
  const [proposalActionBusy, setProposalActionBusy] = useState(false);
  const [proposalActionError, setProposalActionError] = useState<string | null>(null);

  // New conversation mode
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [initialMsg, setInitialMsg] = useState('');
  const [newType, setNewType] = useState<'support' | 'general' | 'editorial'>('support');

  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedConvIdRef = useRef<string | null>(selectedConvId);
  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
  }, [selectedConvId]);

  // 1. Cargar lista de conversaciones
  const loadConversations = React.useCallback(async (keepSelection = true) => {
    if (!authorId) return;
    try {
      const list = await listConversations({ authorId });
      setConversations(list);

      const currentSelected = selectedConvIdRef.current;
      if (!keepSelection || !currentSelected) {
        if (initialConversationId) {
          const match = list.find((c) => c.id === initialConversationId);
          if (match) {
            setSelectedConvId(match.id);
            setShowMobileChat(true);
            return;
          }
        }
        if (list.length > 0) {
          setSelectedConvId(list[0].id);
        }
      } else {
        // Verificar si la seleccionada sigue existiendo
        const exists = list.some((c) => c.id === currentSelected);
        if (!exists && list.length > 0) {
          setSelectedConvId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  }, [authorId, initialConversationId]);

  // Única carga inicial de conversaciones
  useEffect(() => {
    if (!authorId) return;
    let isMounted = true;
    async function init() {
      try {
        await loadConversations(false);
      } catch (err) {
        if (isMounted) console.warn('Error in initial loadConversations:', err);
      }
    }
    void init();
    return () => {
      isMounted = false;
    };
  }, [authorId, loadConversations]);

  // Suscripción Realtime a nuevas conversaciones
  useEffect(() => {
    if (!authorId) return;

    const channel = supabaseClient
      .channel(`author-conversations-${authorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `author_id=eq.${authorId}`,
        },
        () => {
          void loadConversations(true);
        }
      )
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [authorId, loadConversations]);

  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) ?? null;
  }, [conversations, selectedConvId]);

  // 2. Cargar mensajes y propuesta asociada a la conversación activa
  useEffect(() => {
    if (!selectedConvId) return;

    const convId = selectedConvId;
    let isCancelled = false;

    async function fetchDetails() {
      setLoadingMsg(true);
      try {
        const msgs = await getConversationMessages(convId);
        if (!isCancelled) {
          setMessages(msgs);
          if (authorId) {
            void markMessagesRead(convId, 'author');
          }
        }
      } catch (err) {
        console.warn('Error loading messages:', err);
      } finally {
        if (!isCancelled) {
          setLoadingMsg(false);
          setTimeout(scrollToBottom, 80);
        }
      }

      // Si la conversación tiene propuesta asociada
      const targetProposalId = activeConv?.proposalId;
      if (targetProposalId) {
        setLoadingProposal(true);
        try {
          const prop = await getProposal(targetProposalId);
          if (!isCancelled) {
            if (prop?.requestId) {
              const allProps = await listProposals(prop.requestId);
              if (!isCancelled) {
                setProposalHistory(allProps);
                const latest = allProps.find((p) => p.status === 'pending')
                  ?? allProps.find((p) => p.status === 'accepted')
                  ?? prop;
                setActiveProposal(latest);
              }
            } else {
              setActiveProposal(prop);
              setProposalHistory(prop ? [prop] : []);
            }
          }
        } catch (err) {
          console.warn('Error loading proposal for conversation:', err);
        } finally {
          if (!isCancelled) setLoadingProposal(false);
        }
      } else {
        if (!isCancelled) {
          setActiveProposal(null);
          setProposalHistory([]);
        }
      }
    }

    void fetchDetails();

    // Realtime channel para mensajes de esta conversación
    const channel = supabaseClient
      .channel(`conv-messages-${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          if (payload.new) {
            const newMsg = payload.new as {
              id: string;
              conversation_id: string;
              sender_type: 'author' | 'admin';
              sender_id: string;
              body: string;
              created_at: string;
              read_at: string | null;
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id,
                  conversationId: newMsg.conversation_id,
                  senderType: newMsg.sender_type,
                  senderId: newMsg.sender_id,
                  body: newMsg.body,
                  createdAt: newMsg.created_at,
                  readAt: newMsg.read_at,
                },
              ];
            });
            setTimeout(scrollToBottom, 80);
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      void supabaseClient.removeChannel(channel);
    };
  }, [selectedConvId, authorId, activeConv?.proposalId]);

  // Enviar mensaje
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConv || !authorId || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const sent = await sendMessage({
        conversationId: activeConv.id,
        senderType: 'author',
        senderId: authorId,
        body: content,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setTimeout(scrollToBottom, 80);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Revert content in textarea if failed
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  // Crear nueva consulta / conversación
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !initialMsg.trim() || !authorId || sending) return;

    setSending(true);
    try {
      const { conversation, initialMessage } = await createConversation({
        authorId,
        projectId: projectId ?? null,
        subject: newSubject.trim(),
        initialMessage: initialMsg.trim(),
        senderType: 'author',
        type: newType,
      });

      setConversations((prev) => [conversation, ...prev]);
      setSelectedConvId(conversation.id);
      if (initialMessage) {
        setMessages([initialMessage]);
      }
      setNewSubject('');
      setInitialMsg('');
      setIsCreatingNew(false);
      setShowMobileChat(true);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setSending(false);
    }
  };

  // Aceptar propuesta
  const handleAcceptProposal = async (proposalId: string) => {
    setProposalActionBusy(true);
    setProposalActionError(null);
    try {
      const updated = await acceptProposal(proposalId);
      setActiveProposal(updated);
      setConfirmingAcceptId(null);
      if (onProposalAccepted) {
        onProposalAccepted();
      }
      await loadConversations(true);
    } catch (err) {
      setProposalActionError(err instanceof Error ? err.message : 'Error al aceptar la propuesta');
    } finally {
      setProposalActionBusy(false);
    }
  };

  // Rechazar propuesta
  const handleRejectProposal = async (proposalId: string) => {
    setProposalActionBusy(true);
    setProposalActionError(null);
    try {
      const updated = await rejectProposal(proposalId);
      setActiveProposal(updated);
      await loadConversations(true);
    } catch (err) {
      setProposalActionError(err instanceof Error ? err.message : 'Error al rechazar la propuesta');
    } finally {
      setProposalActionBusy(false);
    }
  };

  // Filtrado de conversaciones
  const filteredConversations = useMemo(() => {
    if (filter === 'proposal') {
      return conversations.filter((c) => c.type === 'proposal' || !!c.proposalId);
    }
    if (filter === 'support') {
      return conversations.filter((c) => c.type === 'support' || c.type === 'editorial' || c.type === 'general');
    }
    return conversations;
  }, [conversations, filter]);

  const pricingSnapshot = useMemo(() => {
    return activeProposal ? parsePricingSnapshot(activeProposal.services) : null;
  }, [activeProposal]);

  const pricingLines = pricingSnapshot?.calculation?.lines ?? [];
  const fallbackLines = pricingLines.length === 0 && activeProposal ? fallbackServiceLines(activeProposal.services) : [];
  const estimatedHours = typeof pricingSnapshot?.calculation?.estimatedWorkMinutes === 'number'
    ? pricingSnapshot.calculation.estimatedWorkMinutes / 60
    : null;

  return (
    <div className="rounded-3xl border border-edge/60 bg-surface-elevated/90 shadow-sm overflow-hidden backdrop-blur-xs">
      <div className="grid lg:grid-cols-[330px_1fr] h-[780px] max-h-[85vh]">
        
        {/* ========================================================================= */}
        {/* PANEL IZQUIERDO: LISTA DE CONVERSACIONES                                   */}
        {/* ========================================================================= */}
        <div
          className={`${
            showMobileChat ? 'hidden lg:flex' : 'flex'
          } flex-col border-r border-edge/60 bg-surface/40 overflow-hidden`}
        >
          {/* Header del panel izquierdo */}
          <div className="p-4 border-b border-edge/60 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-serif text-base font-medium text-ink">Mensajes</h2>
                  <p className="text-[11px] text-ink-muted/80">Canal directo editorial</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setShowMobileChat(true);
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-accent px-2.5 py-1.5 text-xs font-medium text-surface hover:bg-accent-hover transition cursor-pointer shadow-2xs active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nueva</span>
              </button>
            </div>

            {/* Filtros de conversación */}
            <div className="flex items-center gap-1 rounded-xl bg-surface p-1 border border-edge/50">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 rounded-lg py-1 text-[11px] font-medium transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-surface-elevated text-ink shadow-2xs font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Todas ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('proposal')}
                className={`flex-1 rounded-lg py-1 text-[11px] font-medium transition cursor-pointer ${
                  filter === 'proposal'
                    ? 'bg-surface-elevated text-accent shadow-2xs font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Propuestas
              </button>
              <button
                type="button"
                onClick={() => setFilter('support')}
                className={`flex-1 rounded-lg py-1 text-[11px] font-medium transition cursor-pointer ${
                  filter === 'support'
                    ? 'bg-surface-elevated text-ink shadow-2xs font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Soporte
              </button>
            </div>
          </div>

          {/* Lista scrolleable de conversaciones */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {loadingConv ? (
              <div className="flex h-48 items-center justify-center text-ink-muted">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted/80 space-y-2">
                <p>No tienes conversaciones en esta sección.</p>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="text-accent underline hover:text-accent-hover font-medium cursor-pointer"
                >
                  Iniciar una consulta editorial
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConvId === conv.id && !isCreatingNew;
                const isProposalType = conv.type === 'proposal' || !!conv.proposalId;

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setIsCreatingNew(false);
                      setShowMobileChat(true);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-accent/10 border border-accent/30 text-ink shadow-2xs'
                        : 'border border-transparent hover:border-edge hover:bg-surface/80 text-ink-muted hover:text-ink'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isProposalType ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 shrink-0">
                            <Sparkles className="h-2.5 w-2.5" />
                            Propuesta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-accent shrink-0">
                            <Headphones className="h-2.5 w-2.5" />
                            Soporte
                          </span>
                        )}
                        <span className="font-serif text-xs font-semibold text-ink truncate">
                          {conv.subject}
                        </span>
                      </div>

                      <span className="text-[10px] text-ink-muted/70 shrink-0 font-mono">
                        {new Date(conv.updatedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {conv.lastMessage && (
                      <p className="text-[11px] text-ink-muted/80 line-clamp-2 leading-relaxed">
                        {conv.lastMessage.body}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL DERECHO: CHAT / DETALLE DE PROPUESTA / NUEVA CONVERSACIÓN           */}
        {/* ========================================================================= */}
        <div
          className={`${
            showMobileChat ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col bg-surface-elevated overflow-hidden`}
        >
          {isCreatingNew ? (
            /* Formulario para Nueva Conversación */
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-edge/60 mb-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (conversations.length > 0) setShowMobileChat(false);
                    }}
                    className="lg:hidden p-1.5 rounded-xl border border-edge text-ink-muted hover:text-ink cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">Nueva Consulta Editorial</h3>
                    <p className="text-xs text-ink-muted">Tu mensaje llegará directamente a la dirección de producción.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateConversation} className="max-w-xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Tipo de consulta
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType('support')}
                      className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                        newType === 'support'
                          ? 'border-accent bg-accent/10 font-semibold text-accent'
                          : 'border-edge bg-surface text-ink-muted'
                      }`}
                    >
                      Soporte y Dudas
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('editorial')}
                      className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                        newType === 'editorial'
                          ? 'border-accent bg-accent/10 font-semibold text-accent'
                          : 'border-edge bg-surface text-ink-muted'
                      }`}
                    >
                      Dirección de Arte
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('general')}
                      className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                        newType === 'general'
                          ? 'border-accent bg-accent/10 font-semibold text-accent'
                          : 'border-edge bg-surface text-ink-muted'
                      }`}
                    >
                      General
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Asunto
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Ej. Consulta sobre el tono de la voz o tiempos de entrega"
                    className="w-full rounded-2xl border border-edge bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={initialMsg}
                    onChange={(e) => setInitialMsg(e.target.value)}
                    placeholder="Detalla tu consulta o requerimiento para el equipo editorial..."
                    className="w-full rounded-2xl border border-edge bg-surface p-4 text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={sending || !newSubject.trim() || !initialMsg.trim()}
                    className="gap-2"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Iniciar Conversación</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (conversations.length > 0) setShowMobileChat(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          ) : !activeConv ? (
            /* Estado vacío si no hay conversación seleccionada */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink-muted">
              <MessageSquare className="h-10 w-10 text-ink-muted/40 mb-3" />
              <p className="font-serif text-lg text-ink font-medium">Selecciona una conversación</p>
              <p className="text-xs text-ink-muted/80 max-w-sm mt-1">
                Consulta tus propuestas de producción, acuerda detalles con tu productor o inicia un nuevo canal.
              </p>
              <Button
                variant="secondary"
                className="mt-4 gap-2"
                onClick={() => setIsCreatingNew(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Consulta</span>
              </Button>
            </div>
          ) : (
            /* Vista del hilo de conversación activo */
            <>
              {/* Header del Chat */}
              <div className="flex items-center justify-between border-b border-edge/60 px-5 py-3.5 shrink-0 bg-surface/50">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="lg:hidden p-1.5 rounded-xl border border-edge text-ink-muted hover:text-ink cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-semibold text-ink truncate">
                        {activeConv.subject}
                      </h3>
                      {activeConv.type === 'proposal' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 shrink-0">
                          Propuesta de Producción
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted/80 font-light truncate">
                      {projectTitle ? `Obra: ${projectTitle}` : 'Studio FLAMKIT • Dirección Editorial'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido del Chat con scroll */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                {/* ----------------------------------------------------------------- */}
                {/* TARJETA ESPECIAL DE PROPUESTA (Si la conversación tiene propuesta) */}
                {/* ----------------------------------------------------------------- */}
                {(activeConv.type === 'proposal' || activeProposal) && (
                  <div className="space-y-4">
                    {loadingProposal ? (
                      <div className="rounded-3xl border border-edge/60 bg-surface/50 p-8 text-center text-ink-muted">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-accent mb-2" />
                        <p className="text-xs">Cargando condiciones de la propuesta...</p>
                      </div>
                    ) : activeProposal ? (
                      <div className="rounded-3xl border border-accent/30 bg-surface/90 p-5 sm:p-7 shadow-md relative overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(242,107,46,0.06),transparent_40%)]" />

                        {/* Encabezado de la propuesta */}
                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-edge/50 pb-5">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                              {activeProposal.status === 'accepted' ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 dark:text-emerald-300">Propuesta Aceptada</span>
                                </>
                              ) : activeProposal.status === 'rejected' ? (
                                <>
                                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                  <span className="text-rose-700 dark:text-rose-300">Propuesta Rechazada</span>
                                </>
                              ) : activeProposal.status === 'expired' ? (
                                <>
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                  <span className="text-amber-700 dark:text-amber-300">Propuesta Expirada</span>
                                </>
                              ) : activeProposal.status === 'superseded' ? (
                                <>
                                  <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
                                  <span className="text-slate-500 font-semibold">Versión Reemplazada</span>
                                </>
                              ) : (
                                <>
                                  <Clock3 className="h-3.5 w-3.5 text-accent" />
                                  <span className="text-accent">Oferta Pendiente de Decisión</span>
                                </>
                              )}
                            </div>
                            <h4 className="mt-3 font-serif text-2xl font-semibold text-ink">
                              Propuesta de Producción Editorial (v{activeProposal.version ?? 1})
                            </h4>
                            <p className="mt-1 text-xs text-ink-muted/90 max-w-lg">
                              Condiciones artísticas, técnicas y comerciales presentadas por Studio FLAMKIT para la producción de tu audiolibro.
                            </p>

                            {proposalHistory.length > 1 && (
                              <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
                                <span className="text-[11px] font-medium text-ink-muted">Otras versiones:</span>
                                {proposalHistory.map((p) => {
                                  const isActive = activeProposal.id === p.id;
                                  const vNum = p.version ?? 1;
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => setActiveProposal(p)}
                                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                                        isActive
                                          ? 'bg-accent text-white shadow-xs'
                                          : 'border border-edge/60 bg-surface text-ink-muted hover:text-ink'
                                      }`}
                                    >
                                      v{vNum} ({p.status === 'pending' ? 'Borrador' : p.status === 'accepted' ? 'Aceptada' : p.status === 'superseded' ? 'Reemplazada' : p.status === 'rejected' ? 'Rechazada' : p.status})
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:text-right shrink-0">
                            <p className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Inversión Total</p>
                            <p className="mt-0.5 font-serif text-2xl sm:text-3xl font-bold text-accent">
                              {currency(activeProposal.amount, activeProposal.currency || 'USD')}
                            </p>
                          </div>
                        </div>

                        {/* Grid de parámetros clave */}
                        <div className="relative z-10 mt-5 grid gap-3 grid-cols-2 sm:grid-cols-4">
                          <div className="rounded-2xl border border-edge/50 bg-surface/70 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Revisiones</p>
                            <p className="mt-1 text-sm font-medium text-ink">{activeProposal.revisionsIncluded ?? 0} incluidas</p>
                          </div>
                          <div className="rounded-2xl border border-edge/50 bg-surface/70 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Plazo estimado</p>
                            <p className="mt-1 text-sm font-medium text-ink">{formatDate(activeProposal.deadline)}</p>
                          </div>
                          <div className="rounded-2xl border border-edge/50 bg-surface/70 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Validez hasta</p>
                            <p className="mt-1 text-sm font-medium text-ink">{formatDate(activeProposal.expiresAt)}</p>
                          </div>
                          <div className="rounded-2xl border border-edge/50 bg-surface/70 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Complejidad</p>
                            <p className="mt-1 text-sm font-medium text-ink">{complexityLabel(pricingSnapshot?.complexity)}</p>
                          </div>
                        </div>

                        {/* Resumen de producción técnica */}
                        {pricingSnapshot?.calculation && (
                          <div className="relative z-10 mt-4 rounded-2xl border border-edge/50 bg-surface/60 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                              <ShieldCheck className="h-4 w-4 text-accent" />
                              <span>Alcance de la obra</span>
                            </div>
                            <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3 text-xs">
                              <div>
                                <p className="text-[10px] uppercase text-ink-muted">Audio final estimado</p>
                                <p className="mt-0.5 font-medium text-ink">
                                  {typeof pricingSnapshot.calculation.durationMinutes === 'number'
                                    ? `${pricingSnapshot.calculation.durationMinutes.toFixed(1)} min`
                                    : '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-ink-muted">Tiempo de ingeniería</p>
                                <p className="mt-0.5 font-medium text-ink">
                                  {estimatedHours !== null ? `${estimatedHours.toFixed(1)} hrs` : '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-ink-muted">Garantía editorial</p>
                                <p className="mt-0.5 font-medium text-emerald-600 dark:text-emerald-400">Audio 100% Humano</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Desglose de servicios cotizados */}
                        <div className="relative z-10 mt-4 rounded-2xl border border-edge/50 bg-surface/60 p-4">
                          <p className="text-xs font-semibold text-ink mb-3">Servicios incluidos en la producción</p>
                          {pricingLines.length > 0 ? (
                            <div className="space-y-2">
                              {pricingLines.map((line, index) => (
                                <div
                                  key={`${line.serviceCode}-${index}`}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-xl border border-edge/40 bg-surface-elevated px-3 py-2 text-xs"
                                >
                                  <div>
                                    <p className="font-medium text-ink">{line.name}</p>
                                    <p className="text-[10px] text-ink-muted">
                                      {line.quantity} {line.unitLabel ?? 'unidad(es)'}
                                    </p>
                                  </div>
                                  <p className="font-mono font-medium text-ink">
                                    {currency(line.price, activeProposal.currency || 'USD')}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : fallbackLines.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-ink-muted">
                              {fallbackLines.map((service, index) => (
                                <li key={`${service}-${index}`} className="flex gap-2">
                                  <span className="text-accent">•</span>
                                  <span>{service}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-ink-muted">
                              Locución profesional en estudio insonorizado, edición de respiraciones y ruidos, mezcla sonora, masterización bajo estándares ACX/Audible.
                            </p>
                          )}
                        </div>

                        {/* Error si falló la acción */}
                        {proposalActionError && (
                          <div className="relative z-10 mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                            {proposalActionError}
                          </div>
                        )}

                        {/* Acciones de Propuesta */}
                        {activeProposal.status === 'pending' && (
                          <div className="relative z-10 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t border-edge/50">
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={proposalActionBusy}
                              onClick={() => void handleRejectProposal(activeProposal.id)}
                              className="text-xs"
                            >
                              Rechazar Oferta
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              disabled={proposalActionBusy}
                              onClick={() => setConfirmingAcceptId(activeProposal.id)}
                              className="text-xs gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Aceptar Propuesta</span>
                            </Button>
                          </div>
                        )}

                        {/* Estado: Versión Reemplazada */}
                        {activeProposal.status === 'superseded' && (
                          <div className="relative z-10 mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>Esta versión ha sido reemplazada</span>
                            </div>
                            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                              Studio FLAMKIT ha emitido una revisión más reciente de esta propuesta. Revisa la versión actual para tomar una decisión sobre tu obra.
                            </p>
                          </div>
                        )}

                        {/* Estado: Propuesta Aceptada + Preparación de Anticipo */}
                        {activeProposal.status === 'accepted' && (
                          <div className="relative z-10 mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              <span>Propuesta Aceptada con Éxito</span>
                            </div>
                            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                              Tu obra ha quedado formalmente vinculada al plan de producción. El siguiente paso será completar el anticipo para iniciar la producción.
                            </p>

                            {/* Tarjeta de preparación de Anticipo */}
                            <div className="rounded-xl border border-edge/60 bg-surface/90 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                                  <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-ink">Anticipo de Producción (50%)</p>
                                  <p className="text-[11px] text-ink-muted">
                                    {currency(activeProposal.amount * 0.5, activeProposal.currency || 'USD')} · Habilitación en curso
                                  </p>
                                </div>
                              </div>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-edge px-3 py-1 text-[10px] font-medium text-ink-muted">
                                <Clock3 className="h-3 w-3 text-accent" />
                                Próximamente disponible
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* LISTA DE MENSAJES DE TEXTO                                        */}
                {/* ----------------------------------------------------------------- */}
                {loadingMsg ? (
                  <div className="flex h-32 items-center justify-center text-ink-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  </div>
                ) : messages.length === 0 && !activeProposal ? (
                  <div className="p-8 text-center text-xs text-ink-muted/80">
                    No hay mensajes en esta conversación. Escribe abajo para comunicarte con el equipo editorial.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isAuthor = msg.senderType === 'author';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAuthor ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-medium text-ink-muted">
                              {isAuthor ? 'Tú (Autor)' : 'Equipo Editorial Flamkit'}
                            </span>
                            <span className="text-[9px] text-ink-muted/60 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                              isAuthor
                                ? 'bg-accent text-surface rounded-tr-xs shadow-xs'
                                : 'bg-surface border border-edge/60 text-ink rounded-tl-xs shadow-2xs'
                            }`}
                          >
                            {msg.body}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Compositor / Input para enviar mensaje */}
              <div className="p-3 sm:p-4 border-t border-edge/60 bg-surface/50 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder="Escribe un mensaje para el equipo editorial... (Enter para enviar)"
                    className="flex-1 rounded-2xl border border-edge bg-surface-elevated px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none resize-none"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={sending || !newMessage.trim()}
                    className="h-11 px-4 rounded-2xl shrink-0"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación para Aceptar Propuesta */}
      {confirmingAcceptId && activeProposal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => !proposalActionBusy && setConfirmingAcceptId(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-edge/70 bg-surface-elevated p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-semibold text-ink">Confirmar Aprobación de Propuesta</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Al aceptar esta propuesta por un total de{' '}
                <strong className="text-ink">
                  {currency(activeProposal.amount, activeProposal.currency || 'USD')}
                </strong>
                , confirmas las condiciones de producción pactadas y Studio FLAMKIT procederá a agendar la grabación en estudio.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                disabled={proposalActionBusy}
                onClick={() => setConfirmingAcceptId(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={proposalActionBusy}
                onClick={() => void handleAcceptProposal(activeProposal.id)}
                className="gap-2"
              >
                {proposalActionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Confirmar y Aceptar</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
