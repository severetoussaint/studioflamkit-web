"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Settings2 } from 'lucide-react';
import { getUser, getUserRole } from '@/services/auth.service';
import {
  getPricingSettings,
  listPricingServices,
  updatePricingService,
  updatePricingSetting,
} from '@/services/pricing.service';
import type { PricingComplexity, PricingService, PricingSettings } from '@/domain/pricing/pricing.types';
import { Card } from '@/components/ui/Card';

const complexityOptions: PricingComplexity[] = ['standard', 'medium', 'high', 'cinematic'];

function currency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function AdminPricingPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savingServiceId, setSavingServiceId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const user = await getUser();
        if (!user || getUserRole(user) !== 'admin') {
          router.replace('/login');
          return;
        }

        const [nextSettings, nextServices] = await Promise.all([
          getPricingSettings(),
          listPricingServices(),
        ]);

        if (!mounted) return;
        setAuthorized(true);
        setSettings(nextSettings);
        setServices(nextServices);
      } catch (cause) {
        if (!mounted) return;
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar la configuración de precios.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [router]);

  const groupedServices = useMemo(() => {
    const groups = new Map<string, PricingService[]>();
    for (const service of services) {
      const list = groups.get(service.category) ?? [];
      list.push(service);
      groups.set(service.category, list);
    }
    return [...groups.entries()];
  }, [services]);

  async function saveSetting(key: string, values: { numericValue?: number | null; textValue?: string | null; jsonValue?: unknown }) {
    setSavingKey(key);
    setMessage(null);
    setError(null);
    try {
      await updatePricingSetting(key, values);
      setMessage(`Configuración actualizada: ${key}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la configuración.');
    } finally {
      setSavingKey(null);
    }
  }

  async function saveService(service: PricingService) {
    setSavingServiceId(service.id);
    setMessage(null);
    setError(null);
    try {
      await updatePricingService(service.id, {
        priceValue: service.priceValue,
        timeMinutes: service.timeMinutes,
        unitLabel: service.unitLabel,
        includedByDefault: service.includedByDefault,
        active: service.active,
        customerVisible: service.customerVisible,
      });
      setMessage(`${service.name} actualizado.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el servicio.');
    } finally {
      setSavingServiceId(null);
    }
  }

  function updateServiceLocal(id: string, patch: Partial<PricingService>) {
    setServices((current) => current.map((service) => service.id === id ? { ...service, ...patch } : service));
  }

  if (loading) {
    return <main className="min-h-screen bg-surface p-8 text-ink">Cargando configuración de precios…</main>;
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Volver al Admin
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">Configuración global</p>
                <h1 className="font-serif text-3xl font-semibold">Motor de precios</h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
              Estas reglas se aplican a las nuevas propuestas. Las propuestas aceptadas deben conservar su propia fotografía de precios y condiciones.
            </p>
          </div>
        </div>

        {message && <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"><Check className="mr-2 inline h-4 w-4" />{message}</div>}
        {error && <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">{error}</div>}

        {settings && (
          <section className="mt-8">
            <h2 className="font-serif text-2xl font-semibold">Reglas generales</h2>
            <div className="mt-4 grid gap-5 lg:grid-cols-3">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Tarifa base PFH</p>
                <div className="mt-3 flex items-end gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.basePfhRateUsd}
                    onChange={(event) => setSettings({ ...settings, basePfhRateUsd: Number(event.target.value) || 0 })}
                    className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-2xl font-semibold outline-none focus:border-accent"
                  />
                  <span className="pb-2 text-xs text-ink-muted">/ hora</span>
                </div>
                <p className="mt-2 text-xs text-ink-muted">Referencia actual: {currency(400)} por hora de audio terminado.</p>
                <button type="button" onClick={() => void saveSetting('base_pfh_rate_usd', { numericValue: settings.basePfhRateUsd })} disabled={savingKey === 'base_pfh_rate_usd'} className="mt-4 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Guardar</button>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Velocidad de narración</p>
                <div className="mt-3 flex items-end gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={settings.wordsPerMinute}
                    onChange={(event) => setSettings({ ...settings, wordsPerMinute: Number(event.target.value) || 1 })}
                    className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-2xl font-semibold outline-none focus:border-accent"
                  />
                  <span className="pb-2 text-xs text-ink-muted">pal/min</span>
                </div>
                <p className="mt-2 text-xs text-ink-muted">Se usa para estimar la duración final del audio.</p>
                <button type="button" onClick={() => void saveSetting('words_per_minute', { numericValue: settings.wordsPerMinute })} disabled={savingKey === 'words_per_minute'} className="mt-4 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Guardar</button>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Precio base mínimo</p>
                <div className="mt-3 flex items-end gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.minimumBasePriceUsd}
                    onChange={(event) => setSettings({ ...settings, minimumBasePriceUsd: Number(event.target.value) || 0 })}
                    className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-2xl font-semibold outline-none focus:border-accent"
                  />
                  <span className="pb-2 text-xs text-ink-muted">USD</span>
                </div>
                <p className="mt-2 text-xs text-ink-muted">Piso para evitar propuestas demasiado pequeñas.</p>
                <button type="button" onClick={() => void saveSetting('minimum_base_price_usd', { numericValue: settings.minimumBasePriceUsd })} disabled={savingKey === 'minimum_base_price_usd'} className="mt-4 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Guardar</button>
              </Card>
            </div>

            <Card className="mt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Multiplicadores de complejidad</p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">Se aplican después de calcular la producción base y los servicios seleccionados.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void saveSetting('complexity_multipliers', { jsonValue: settings.complexityMultipliers })}
                  disabled={savingKey === 'complexity_multipliers'}
                  className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >Guardar multiplicadores</button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {complexityOptions.map((complexity) => (
                  <label key={complexity} className="space-y-1.5">
                    <span className="block text-xs font-medium capitalize text-ink-muted">{complexity}</span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={settings.complexityMultipliers[complexity]}
                      onChange={(event) => setSettings({ ...settings, complexityMultipliers: { ...settings.complexityMultipliers, [complexity]: Number(event.target.value) || 1 } })}
                      className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                    />
                  </label>
                ))}
              </div>
            </Card>
          </section>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Catálogo global de servicios</h2>
              <p className="mt-1 text-sm text-ink-muted">Los cambios aquí afectan las nuevas propuestas. No reescriben propuestas ya aceptadas.</p>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {groupedServices.map(([category, categoryServices]) => (
              <section key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">{category.replace('_', ' ')}</h3>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  {categoryServices.map((service) => (
                    <Card key={service.id}>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-serif text-xl font-semibold">{service.name}</h4>
                            <p className="mt-1 text-xs leading-5 text-ink-muted">{service.description}</p>
                          </div>
                          <label className="flex items-center gap-2 text-xs text-ink-muted">
                            <input type="checkbox" checked={service.active} onChange={(event) => updateServiceLocal(service.id, { active: event.target.checked })} /> Activo
                          </label>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="space-y-1.5"><span className="text-xs text-ink-muted">Modelo</span><select value={service.pricingModel} onChange={(event) => updateServiceLocal(service.id, { pricingModel: event.target.value as PricingService['pricingModel'] })} className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-xs outline-none focus:border-accent"><option value="included">Incluido</option><option value="percent_of_base">% de base</option><option value="fixed">Fijo</option><option value="per_unit">Por unidad</option><option value="per_finished_hour">Por hora final</option><option value="per_minute">Por minuto</option><option value="per_chapter">Por capítulo</option><option value="per_actor">Por actor</option></select></label>
                          <label className="space-y-1.5"><span className="text-xs text-ink-muted">Valor</span><input type="number" min="0" step="0.01" value={service.priceValue} onChange={(event) => updateServiceLocal(service.id, { priceValue: Number(event.target.value) || 0 })} className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-xs outline-none focus:border-accent" /></label>
                          <label className="space-y-1.5"><span className="text-xs text-ink-muted">Tiempo (min)</span><input type="number" min="0" step="1" value={service.timeMinutes} onChange={(event) => updateServiceLocal(service.id, { timeMinutes: Number(event.target.value) || 0 })} className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-xs outline-none focus:border-accent" /></label>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="space-y-1.5"><span className="text-xs text-ink-muted">Unidad</span><input type="text" value={service.unitLabel ?? ''} onChange={(event) => updateServiceLocal(service.id, { unitLabel: event.target.value })} className="w-full rounded-xl border border-edge bg-surface px-3 py-2 text-xs outline-none focus:border-accent" /></label>
                          <label className="flex items-center gap-2 self-end text-xs text-ink-muted"><input type="checkbox" checked={service.includedByDefault} onChange={(event) => updateServiceLocal(service.id, { includedByDefault: event.target.checked })} /> Incluido por defecto</label>
                          <label className="flex items-center gap-2 self-end text-xs text-ink-muted"><input type="checkbox" checked={service.customerVisible} onChange={(event) => updateServiceLocal(service.id, { customerVisible: event.target.checked })} /> Visible al autor</label>
                        </div>

                        <div className="flex justify-end">
                          <button type="button" onClick={() => void saveService(service)} disabled={savingServiceId === service.id} className="rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{savingServiceId === service.id ? 'Guardando…' : 'Guardar servicio'}</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
