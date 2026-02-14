'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await apiFetch('/dashboard/today');
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateLog(scheduleId, status, notes) {
    await apiFetch(`/schedules/${scheduleId}/log`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });

    load();
  }

  if (loading) {
    return <p className="p-6 text-gray-700">Carregando...</p>;
  }

  if (!data.length) {
    return <p className="p-6 text-gray-800">Nada para hoje 🎉</p>;
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Rotina de hoje
      </h1>

      <div className="space-y-5">
        {data.map((dep) => (
          <DependentCard
            key={dep.dependentId}
            dependent={dep}
            onUpdateLog={updateLog}
          />
        ))}
      </div>
    </div>
  );
}

function DependentCard({ dependent, onUpdateLog }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <h2 className="font-bold text-lg text-gray-900 mb-4">
        👤 {dependent.dependentName}
      </h2>

      <div className="space-y-3">
        {dependent.items.map((item) => (
          <ScheduleItem
            key={item.scheduleId}
            item={item}
            onUpdateLog={onUpdateLog}
          />
        ))}
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  DONE: {
    bg: 'bg-green-50 border-green-200',
    label: '✓ Concluído',
    labelClass: 'text-green-700',
  },
  SKIPPED: {
    bg: 'bg-gray-100 border-gray-300',
    label: '⏭ Pulado',
    labelClass: 'text-gray-500',
  },
};

function ScheduleItem({ item, onUpdateLog }) {
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  function startEditing() {
    setNotes(item.notes || '');
    setEditing(true);
  }

  const { status } = item;
  const config = STATUS_CONFIG[status];

  async function handleUpdate(newStatus) {
    setSaving(true);
    const normalizedNotes = notes.trim() === '' ? null : notes;
    await onUpdateLog(item.scheduleId, newStatus, normalizedNotes);
    setSaving(false);
    setEditing(false);
  }

  // Pendente
  if (!status) {
    return (
      <div className="rounded-xl border p-4 transition bg-orange-50 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-700">{item.time}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate('DONE')}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? '...' : '✓ Feito'}
            </button>
            <button
              onClick={() => handleUpdate('SKIPPED')}
              disabled={saving}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? '...' : '⏭ Pular'}
            </button>
          </div>
        </div>

        <input
          placeholder="Observação (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="
            w-full mt-2
            rounded-lg border border-gray-300
            px-3 py-2 text-sm
            text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        />
      </div>
    );
  }

  // DONE ou SKIPPED - com opção de editar
  if (editing) {
    return (
      <div className={`rounded-xl border p-4 transition ${config.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-700">{item.time}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate('DONE')}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? '...' : '✓ Feito'}
            </button>
            <button
              onClick={() => handleUpdate('SKIPPED')}
              disabled={saving}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? '...' : '⏭ Pular'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>

        <input
          placeholder="Observação (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="
            w-full mt-2
            rounded-lg border border-gray-300
            px-3 py-2 text-sm
            text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        />
      </div>
    );
  }

  // DONE ou SKIPPED - visualização
  return (
    <div className={`rounded-xl border p-4 transition ${config.bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-700">{item.time}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${config.labelClass}`}>
            {config.label}
          </span>
          <button
            onClick={startEditing}
            className="text-gray-400 hover:text-gray-600 text-sm ml-1"
            title="Editar"
          >
            ✏️
          </button>
        </div>
      </div>
    </div>
  );
}