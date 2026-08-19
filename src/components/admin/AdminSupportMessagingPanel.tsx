'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Headphones, Send, Inbox, Loader2, MessageSquareMore, ListChecks } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import { listConversations, getConversationMessages, sendMessage, updateConversationStatus, markMessagesRead } from '@/services/conversation.service';
import type { Conversation, Message } from '@/types/domain.types';
import { AdminFollowUpPanel } from '@/components/admin/AdminFollowUpPanel';

export interface AdminSupportMessagingPanelProps { adminUserId: string; }

export function AdminSupportMessagingPanel({ adminUserId }: AdminSupportMessagingPanelProps) {
  const [view, setView] = useState<'support' | 'followup'>('support');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('open');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (view !== 'support') return;
    let ignore = false;
    async function fetchConvs() {
      setLoadingConv(true);
      try {
        const list = await listConversations({ status: filterStatus === 'all' ? undefined : filterStatus });
        if (!ignore) {
          setConversations(list);
          if (list.length > 0 && !activeConv) setActiveConv(list[0]);
          else if (list.length === 0) setActiveConv(null);
        }
      } catch (err) {
        console.warn('Error loading admin conversations:', err);
      } finally {
        if (!ignore) setLoadingConv(false);
      }
    }
    void fetchConvs();
    return () => { ignore = true; };
  }, [view, filterStatus, activeConv]);

  useEffect(() => {
    if (view !== 'support' || !activeConv) return;
    const convId = activeConv.id;
    let ignore = false;
    async function fetchMsgs() {
      setLoadingMsg(true);
      try {
        const msgs = await getConversationMessages(convId);
        if (!ignore) {
          setMessages(msgs);
          await markMessagesRead(convId, 'admin');
        }
      } catch (err) {
        console.warn('Error loading messages for admin:', err);
      } finally {
        if (!ignore) {
          setLoadingMsg(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    }
    void fetchMsgs();
    const channel = supabaseClient.channel(`admin-chat-${convId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` }, () => { void fetchMsgs(); }).subscribe();
    return () => { ignore = true; void supabaseClient.removeChannel(channel); };
  }, [view, activeConv]);

  const reloadConversations = async () => {
    try {
      const list = await listConversations({ status: filterStatus === 'all' ? undefined : filterStatus });
      setConversations(list);
    } catch (err) {
      console.warn('Error reloading conversations:', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !activeConv || !adminUserId || sending) return;
    setSending(true);
    try {
      const sent = await sendMessage({ conversationId: activeConv.id, senderType: 'admin', senderId: adminUserId, body: replyBody.trim() });
      setReplyBody('');
      setMessages((prev: Message[]) => [...prev, sent]);
      setTimeout(scrollToBottom, 100);
      void reloadConversations();
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!activeConv) return;
    const nextStatus = activeConv.status === 'open' ? 'closed' : 'open';
    const success = await updateConversationStatus(activeConv.id, nextStatus);
    if (success) {
      setActiveConv((prev) => (prev ? { ...prev, status: nextStatus } : null));
      void reloadConversations();
    }
  };

  return (
    <div className="rounded-3xl border border-edge/80 bg-surface-elevated p-6 shadow-sm space-y-6">
      <div className="flex flex-col gap-3 border-b border-edge/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {view === 'support' ? <Headphones className="h-5 w-5 text-accent" /> : <ListChecks className="h-5 w-5 text-accent" />}
            <h3 className="font-serif text-xl font-medium text-ink">{view === 'support' ? 'Centro de Soporte y Mensajería' : 'Seguimiento'}</h3>
          </div>
          <p className="mt-1 text-xs text-ink-muted/80 font-light">{view === 'support' ? 'Atención a consultas editoriales de autores en producción.' : 'Casos que salieron de Cotizaciones pero todavía requieren una acción administrativa.'}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl border border-edge/60 bg-surface p-1">
          <button type="button" onClick={() => setView('support')} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${view === 'support' ? 'bg-accent text-surface' : 'text-ink-muted hover:text-ink'}`}><MessageSquareMore className="h-3.5 w-3.5" /> Soporte</button>
          <button type="button" onClick={() => setView('followup')} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${view === 'followup' ? 'bg-accent text-surface' : 'text-ink-muted hover:text-ink'}`}><ListChecks className="h-3.5 w-3.5" /> Seguimiento</button>
        </div>
      </div>

      {view === 'followup' ? <AdminFollowUpPanel /> : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-edge/60 pb-5">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent"><Headphones className="h-5 w-5" /></div><div><p className="text-xs text-ink-muted/80 font-light">Consultas de autores</p><p className="text-sm font-medium text-ink">Comunicación operativa</p></div></div>
            <div className="flex items-center gap-1.5 bg-surface border border-edge/60 p-1 rounded-2xl self-start sm:self-auto">
              <button type="button" onClick={() => setFilterStatus('open')} className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${filterStatus === 'open' ? 'bg-accent text-surface shadow-xs' : 'text-ink-muted hover:text-ink'}`}>Pendientes</button>
              <button type="button" onClick={() => setFilterStatus('closed')} className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${filterStatus === 'closed' ? 'bg-accent text-surface shadow-xs' : 'text-ink-muted hover:text-ink'}`}>Resueltas</button>
              <button type="button" onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${filterStatus === 'all' ? 'bg-accent text-surface shadow-xs' : 'text-ink-muted hover:text-ink'}`}>Todas</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[480px]">
            <div className="md:col-span-5 lg:col-span-4 border border-edge/60 bg-surface/40 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-edge/60 bg-surface/80 flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wider text-ink-muted">Consultas Recibidas ({conversations.length})</span></div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[460px]">
                {loadingConv ? <div className="flex h-32 items-center justify-center text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div> : conversations.length === 0 ? <div className="p-6 text-center text-xs text-ink-muted">No hay conversaciones en esta categoría.</div> : conversations.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  return <button key={conv.id} type="button" onClick={() => setActiveConv(conv)} className={`w-full text-left p-3.5 rounded-2xl transition cursor-pointer ${isSelected ? 'bg-accent/10 border border-accent/20 text-ink shadow-xs' : 'hover:bg-surface border border-transparent text-ink-muted hover:text-ink'}`}><div className="flex items-center justify-between gap-2"><span className="font-semibold text-xs text-ink truncate">{conv.authorName || 'Autor'}</span><span className="text-[10px] text-ink-muted/70 shrink-0 font-mono">{new Date(conv.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span></div><p className="mt-1 text-xs font-medium text-ink/90 truncate">{conv.subject}</p>{conv.projectTitle && <p className="mt-0.5 text-[10px] text-accent font-light truncate">Obra: {conv.projectTitle}</p>}{conv.lastMessage && <p className="mt-1.5 text-[11px] text-ink-muted/80 line-clamp-1">{conv.lastMessage.body}</p>}</button>;
                })}
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8 border border-edge/60 bg-surface/60 rounded-2xl flex flex-col overflow-hidden">
              {!activeConv ? <div className="flex flex-col items-center justify-center h-full text-center p-8 text-ink-muted"><Inbox className="h-10 w-10 text-ink-muted/40 mb-2" strokeWidth={1.2} /><p className="text-xs">Selecciona una consulta de la lista para ver el historial y responder.</p></div> : <>
                <div className="p-4 border-b border-edge/60 bg-surface/80 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><h4 className="font-serif text-base font-medium text-ink">{activeConv.subject}</h4><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${activeConv.status === 'open' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'}`}>{activeConv.status === 'open' ? 'Pendiente' : 'Resuelta'}</span></div><p className="text-xs text-ink-muted mt-0.5 font-light">Autor: <span className="font-medium text-ink">{activeConv.authorName || 'Desconocido'}</span> ({activeConv.authorEmail || 'Sin email'})</p></div><button type="button" onClick={handleToggleStatus} className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition cursor-pointer ${activeConv.status === 'open' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20' : 'border-edge bg-surface text-ink-muted hover:text-ink'}`}>{activeConv.status === 'open' ? 'Marcar Resuelta' : 'Reabrir Consulta'}</button></div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[380px]">
                  {loadingMsg ? <div className="flex h-32 items-center justify-center text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div> : messages.length === 0 ? <div className="text-center py-8 text-xs text-ink-muted">Sin mensajes en el historial.</div> : messages.map((msg) => { const isAdmin = msg.senderType === 'admin'; return <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-medium text-ink-muted">{isAdmin ? 'Equipo Editorial' : activeConv.authorName || 'Autor'}</span><span className="text-[10px] text-ink-muted/50">{new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span></div><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${isAdmin ? 'bg-accent text-surface rounded-br-xs shadow-xs' : 'bg-surface border border-edge/80 text-ink rounded-bl-xs'}`}><p className="whitespace-pre-wrap">{msg.body}</p></div></div>; })}<div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendReply} className="p-3 border-t border-edge/60 bg-surface/90 flex items-center gap-2"><input type="text" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Escribe la respuesta oficial para el autor..." className="flex-1 rounded-2xl border border-edge/80 bg-surface px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none" /><button type="submit" disabled={sending || !replyBody.trim()} className="flex h-10 px-4 items-center justify-center gap-2 rounded-2xl bg-accent text-surface font-medium text-xs transition hover:bg-accent-hover disabled:opacity-40 cursor-pointer shrink-0">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span>Responder y Notificar</span></button></form>
              </>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
