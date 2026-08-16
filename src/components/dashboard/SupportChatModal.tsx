'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  Plus,
  Loader2,
  Inbox,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import {
  listConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
  markMessagesRead,
} from '@/services/conversation.service';
import type { Conversation, Message } from '@/types/domain.types';

export interface SupportChatModalProps {
  open: boolean;
  onClose: () => void;
  authorId: string | null;
  projectId?: string | null;
  projectTitle?: string;
}

export function SupportChatModal({
  open,
  onClose,
  authorId,
  projectId,
  projectTitle,
}: SupportChatModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // New conversation mode
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [initialMsg, setInitialMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!open || !authorId) return;

    let ignore = false;
    async function init() {
      setLoadingConv(true);
      try {
        const list = await listConversations({ authorId: authorId! });
        if (!ignore) {
          setConversations(list);
          if (list.length > 0 && !activeConv) {
            setActiveConv(list[0]);
          }
        }
      } catch (err) {
        console.warn('Error loading conversations:', err);
      } finally {
        if (!ignore) setLoadingConv(false);
      }
    }

    void init();

    return () => {
      ignore = true;
    };
  }, [open, authorId, activeConv]);

  useEffect(() => {
    if (!activeConv) return;
    const convId = activeConv.id;

    let ignore = false;
    async function fetchMsgs() {
      setLoadingMsg(true);
      try {
        const msgs = await getConversationMessages(convId);
        if (!ignore) {
          setMessages(msgs);
          if (authorId) {
            await markMessagesRead(convId, 'author');
          }
        }
      } catch (err) {
        console.warn('Error loading messages:', err);
      } finally {
        if (!ignore) {
          setLoadingMsg(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    }

    void fetchMsgs();

    const channel = supabaseClient
      .channel(`chat-messages-${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        () => {
          void fetchMsgs();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      void supabaseClient.removeChannel(channel);
    };
  }, [activeConv, authorId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || !authorId || sending) return;

    setSending(true);
    try {
      const sent = await sendMessage({
        conversationId: activeConv.id,
        senderType: 'author',
        senderId: authorId,
        body: newMessage.trim(),
      });
      setNewMessage('');
      setMessages((prev) => [...prev, sent]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

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
        type: 'support',
      });

      setConversations((prev) => [conversation, ...prev]);
      setActiveConv(conversation);
      if (initialMessage) {
        setMessages([initialMessage]);
      }
      setNewSubject('');
      setInitialMsg('');
      setIsCreatingNew(false);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 flex h-[85vh] max-h-[700px] w-full max-w-4xl overflow-hidden rounded-3xl border border-edge/80 bg-surface-elevated shadow-2xl"
          >
            {/* Sidebar / Conversation list */}
            <div className="hidden md:flex w-72 flex-col border-r border-edge/60 bg-surface/50">
              <div className="flex items-center justify-between border-b border-edge/60 p-4">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-accent" />
                  <span className="font-serif text-sm font-medium text-ink">Soporte Editorial</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer transition"
                  title="Nueva consulta"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingConv ? (
                  <div className="flex h-32 items-center justify-center text-ink-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-ink-muted/80">
                    No tienes conversaciones abiertas.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConv?.id === conv.id && !isCreatingNew;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => {
                          setActiveConv(conv);
                          setIsCreatingNew(false);
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition cursor-pointer ${
                          isSelected
                            ? 'bg-accent/10 border border-accent/20 text-ink'
                            : 'hover:bg-surface text-ink-muted hover:text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-xs truncate text-ink">{conv.subject}</span>
                          <span className="text-[10px] text-ink-muted/70 shrink-0">
                            {new Date(conv.updatedAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        {conv.lastMessage && (
                          <p className="mt-1 text-[11px] text-ink-muted/80 line-clamp-1">
                            {conv.lastMessage.body}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Chat / Thread Window */}
            <div className="flex flex-1 flex-col bg-surface-elevated">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-edge/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-medium text-ink">
                      {isCreatingNew
                        ? 'Nueva Consulta Editorial'
                        : activeConv?.subject || 'Atención y Soporte Studio FLAMKIT'}
                    </h3>
                    <p className="text-[11px] text-ink-muted/80 font-light">
                      {projectTitle ? `Proyecto: ${projectTitle}` : 'Dirección de Producción & Arte'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-surface text-accent hover:text-accent-hover cursor-pointer transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-surface text-ink-muted hover:text-ink cursor-pointer transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chat Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {isCreatingNew ? (
                  <form onSubmit={handleCreateConversation} className="space-y-4 max-w-lg mx-auto py-4">
                    <div className="text-center mb-6">
                      <Headphones className="h-8 w-8 text-accent mx-auto mb-2" strokeWidth={1.5} />
                      <h4 className="font-serif text-lg text-ink font-medium">Inicia un hilo de consulta</h4>
                      <p className="text-xs text-ink-muted/80 mt-1 font-light">
                        El equipo de producción responderá directamente en tu plataforma en menos de 24 horas.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Asunto de la consulta</label>
                      <input
                        type="text"
                        required
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Ej. Dudas sobre pronunciación en capítulo 2"
                        className="w-full rounded-2xl border border-edge/80 bg-surface px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Mensaje detallado</label>
                      <textarea
                        required
                        rows={4}
                        value={initialMsg}
                        onChange={(e) => setInitialMsg(e.target.value)}
                        placeholder="Escribe los detalles de tu consulta editorial o técnica..."
                        className="w-full rounded-2xl border border-edge/80 bg-surface px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      {conversations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingNew(false)}
                          className="flex-1 rounded-2xl border border-edge py-2.5 text-xs font-medium text-ink hover:bg-surface transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={sending || !newSubject.trim() || !initialMsg.trim()}
                        className="flex-1 rounded-2xl bg-accent py-2.5 text-xs font-semibold uppercase tracking-wider text-surface hover:bg-accent-hover transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span>Enviar Mensaje</span>
                      </button>
                    </div>
                  </form>
                ) : !activeConv ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                    <Inbox className="h-10 w-10 text-ink-muted/50" strokeWidth={1.2} />
                    <p className="text-xs text-ink-muted">No has seleccionado ninguna consulta.</p>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-xs font-medium uppercase tracking-wider text-surface hover:bg-accent-hover transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Consulta</span>
                    </button>
                  </div>
                ) : loadingMsg ? (
                  <div className="flex h-full items-center justify-center text-ink-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-ink-muted">
                    Aún no hay mensajes en esta conversación.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAuthor = msg.senderType === 'author';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAuthor ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium text-ink-muted/70">
                            {isAuthor ? 'Tú' : 'Equipo Editorial Studio FLAMKIT'}
                          </span>
                          <span className="text-[10px] text-ink-muted/50">
                            {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isAuthor
                              ? 'bg-accent text-surface rounded-br-xs shadow-xs'
                              : 'bg-surface border border-edge/70 text-ink rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              {activeConv && !isCreatingNew && (
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-edge/60 bg-surface/50 p-3 sm:p-4 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje para la producción..."
                    className="flex-1 rounded-2xl border border-edge/80 bg-surface-elevated px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-surface transition hover:bg-accent-hover disabled:opacity-40 cursor-pointer"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
