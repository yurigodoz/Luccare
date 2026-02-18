'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

const TYPES = [
  { value: 'MEDICATION', label: 'Medicamento', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'FEEDING', label: 'Alimentação', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'THERAPY', label: 'Terapia', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'HYGIENE', label: 'Higiene', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { value: 'EXERCISE', label: 'Exercício', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'OTHER', label: 'Outro', color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

const DAY_OPTIONS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function EditRoutinePage() {
  return (
    <AuthGuard>
      <EditRoutineContent />
    </AuthGuard>
  );
}

function EditRoutineContent() {
  const { id, routineId } = useParams();
  const router = useRouter();

  const [type, setType] = useState('MEDICATION');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [times, setTimes] = useState(['']);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoutine() {
      try {
        const routine = await apiFetch(`/routines/${routineId}`);
        setType(routine.type || 'MEDICATION');
        setTitle(routine.title || '');
        setDescription(routine.description || '');
        setTimes(routine.times?.length ? routine.times : ['']);
        setDaysOfWeek(routine.daysOfWeek || []);
      } catch {
        setError('Erro ao carregar rotina.');
      } finally {
        setLoading(false);
      }
    }
    loadRoutine();
  }, [routineId]);

  function addTime() {
    setTimes([...times, '']);
  }

  function removeTime(index) {
    setTimes(times.filter((_, i) => i !== index));
  }

  function updateTime(index, value) {
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
  }

  function toggleDay(day) {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  }

  function selectAllDays() {
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
  }

  function selectWeekdays() {
    setDaysOfWeek([1, 2, 3, 4, 5]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const validTimes = times.filter((t) => t.trim());
    if (validTimes.length === 0) {
      setError('Adicione pelo menos um horário.');
      return;
    }

    if (daysOfWeek.length === 0) {
      setError('Selecione pelo menos um dia da semana.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const body = {
        type,
        title: title.trim(),
        times: validTimes,
        daysOfWeek,
      };
      if (description.trim()) body.description = description.trim();

      await apiFetch(`/routines/${routineId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      router.push(`/dependents/${id}`);
    } catch (err) {
      setError(err.message || 'Erro ao salvar rotina.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Editar rotina
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  type === t.value
                    ? `${t.color} border-current font-semibold`
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            placeholder="Ex: Domperidona"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={25}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <input
            type="text"
            placeholder="Ex: 5ml"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Horários */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horários *
          </label>
          <div className="space-y-2">
            {times.map((time, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTime}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Adicionar horário
          </button>
        </div>

        {/* Dias da semana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dias da semana *
          </label>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {DAY_OPTIONS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  daysOfWeek.includes(day.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllDays}
              className="text-xs text-blue-600 hover:underline"
            >
              Todos os dias
            </button>
            <button
              type="button"
              onClick={selectWeekdays}
              className="text-xs text-blue-600 hover:underline"
            >
              Dias úteis
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/dependents/${id}`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
