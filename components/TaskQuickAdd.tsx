"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { parseFrenchRecurrence, rruleToFrench } from '@/lib/rrule/parseFr';
import { computeNextDueDate } from '@/lib/rrule/schedule';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface TaskQuickAddProps {
  projectId?: string;
  onCreated?: () => void;
}

export function TaskQuickAdd({ projectId, onCreated }: TaskQuickAddProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('normale');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceText, setRecurrenceText] = useState('');
  const [recurrencePreset, setRecurrencePreset] = useState<'none'|'daily'|'weekly'|'monthly_day'|'monthly_nth'|'every_x_months'|'yearly'>('none');
  const [weeklyDay, setWeeklyDay] = useState<'lundi'|'mardi'|'mercredi'|'jeudi'|'vendredi'|'samedi'|'dimanche'>('lundi');
  const [nthInMonth, setNthInMonth] = useState<'1er'|'2e'|'3e'|'4e'|'dernier'>('1er');
  const [everyXMonths, setEveryXMonths] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  // Build a French natural text based on selected preset and current due date
  const buildRecurrenceTextFromPreset = () => {
    switch (recurrencePreset) {
      case 'daily':
        return 'chaque jour';
      case 'weekly':
        return `tous les ${weeklyDay}s`;
      case 'monthly_day': {
        const d = dueDate ? new Date(dueDate) : new Date();
        const day = d.getDate();
        return `le ${day} de chaque mois`;
      }
      case 'monthly_nth':
        return `${nthInMonth} ${weeklyDay} du mois`;
      case 'every_x_months':
        return `tous les ${everyXMonths} mois`;
      case 'yearly':
        return 'chaque année';
      default:
        return '';
    }
  };

  const handlePresetChange = (val: typeof recurrencePreset) => {
    setRecurrencePreset(val);
    const txt = buildRecurrenceTextFromPreset();
    setRecurrenceText(txt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Non authentifié',
          description: 'Veuillez vous connecter pour créer une tâche.',
          variant: 'destructive',
        });
        return;
      }

      // Build recurrence rule from presets (no free text)
      let rrule: string | null = null;
      if (isRecurring && recurrencePreset !== 'none') {
        const anchor = dueDate ? new Date(dueDate) : new Date();
        anchor.setHours(0, 0, 0, 0);
        const text = buildRecurrenceTextFromPreset();
        const parsed = text ? parseFrenchRecurrence(text, anchor) : null;
        if (parsed) {
          rrule = parsed;
        } else {
          throw new Error('Récurrence invalide, veuillez ajuster le préréglage.');
        }
      }

      // Decide which due date to store: user-picked date, or first occurrence for recurring
      const dueAtToStore: Date | null = dueDate
        ? dueDate
        : (isRecurring && rrule ? computeNextDueDate(rrule) : null);

      const { error } = await supabase.from('tasks').insert({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_at: dueAtToStore ? dueAtToStore.toISOString() : null,
        is_recurring: isRecurring,
        rrule,
        ...(projectId ? { project_id: projectId } : {}),
      });
      if (error) throw error;

      setTitle('');
      setDescription('');
      setPriority('normale');
      setDueDate(undefined);
      setIsRecurring(false);
      setRecurrenceText('');
      onCreated?.();
      router.refresh();
      toast({ title: 'Tâche créée', description: 'Votre tâche a été ajoutée.' });
    } catch (err: any) {
      console.error('Erreur lors de la création de la tâche:', err?.message || err);
      toast({ title: 'Erreur', description: err?.message || 'Impossible de créer la tâche.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Determine recurrence validity for UI (preview and submit lock)
  const recurrenceValid = (() => {
    if (!isRecurring || recurrencePreset === 'none') return false;
    const anchor = dueDate ? new Date(dueDate) : new Date();
    anchor.setHours(0, 0, 0, 0);
    const text = buildRecurrenceTextFromPreset();
    const parsed = text ? parseFrenchRecurrence(text, anchor) : null;
    return Boolean(parsed);
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nouvelle tâche..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Description (optionnel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priorité</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basse">Basse</SelectItem>
              <SelectItem value="normale">Normale</SelectItem>
              <SelectItem value="haute">Haute</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date d'échéance</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP', { locale: fr }) : 'Choisir une date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(d) => { setDueDate(d ?? undefined); setTimeout(() => { if (isRecurring) setRecurrenceText(buildRecurrenceTextFromPreset()); }, 0); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <Label htmlFor="recurring">Tâche récurrente</Label>
        </div>

        {isRecurring && (
          <div className="space-y-2">
            {/* Presets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label>Préréglage</Label>
                <Select value={recurrencePreset} onValueChange={(v) => handlePresetChange(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire (jour)</SelectItem>
                    <SelectItem value="monthly_day">Mensuel (jour du mois)</SelectItem>
                    <SelectItem value="monthly_nth">Mensuel (nième jour de semaine)</SelectItem>
                    <SelectItem value="every_x_months">Tous les X mois</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {recurrencePreset === 'weekly' && (
                <div>
                  <Label>Jour de semaine</Label>
                  <Select value={weeklyDay} onValueChange={(v) => { setWeeklyDay(v as any); setRecurrenceText(buildRecurrenceTextFromPreset()); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {recurrencePreset === 'monthly_nth' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Occurrence</Label>
                    <Select value={nthInMonth} onValueChange={(v) => { setNthInMonth(v as any); setRecurrenceText(buildRecurrenceTextFromPreset()); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['1er','2e','3e','4e','dernier'].map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Jour</Label>
                    <Select value={weeklyDay} onValueChange={(v) => { setWeeklyDay(v as any); setRecurrenceText(buildRecurrenceTextFromPreset()); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {recurrencePreset === 'every_x_months' && (
                <div>
                  <Label>Mois (intervalle)</Label>
                  <Input
                    type="number"
                    min={2}
                    value={everyXMonths}
                    onChange={(e) => { const v = Math.max(2, parseInt(e.target.value || '2')); setEveryXMonths(v); setRecurrenceText(buildRecurrenceTextFromPreset()); }}
                  />
                </div>
              )}
            </div>
            {recurrencePreset !== 'none' && (
              <div className="text-xs">
                {(() => {
                  const anchor = dueDate ? new Date(dueDate) : new Date();
                  anchor.setHours(0, 0, 0, 0);
                  const text = buildRecurrenceTextFromPreset();
                  const r = parseFrenchRecurrence(text, anchor);
                  return r ? (
                    <div className="text-green-500">{typeof rruleToFrench === 'function' ? rruleToFrench(r) : 'Récurrence valide'}</div>
                  ) : (
                    <div className="text-red-500">Récurrence invalide</div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
      <Button type="submit" disabled={loading || !title.trim() || (isRecurring && !recurrenceValid)} className="button-glow">
        Ajouter
      </Button>
    </form>
  );
}
