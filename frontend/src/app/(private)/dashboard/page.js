'use client';

import { useEffect, useState, useMemo } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function loadFilter(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function saveFilter(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function groupByTime(data, selectedDepIds, selectedStatuses) {
  const allItems = [];
  for (const dep of data) {
    for (const item of dep.items) {
      allItems.push({
        ...item,
        dependentId: dep.dependentId,
        dependentName: dep.dependentName,
      });
    }
  }

  const filtered = allItems.filter((item) => {
    if (selectedDepIds.length > 0 && !selectedDepIds.includes(item.dependentId)) {
      return false;
    }
    if (selectedStatuses.length > 0) {
      const itemCategory = item.status ? 'DONE' : 'PENDING';
      if (!selectedStatuses.includes(itemCategory)) return false;
    }
    return true;
  });

  const groups = {};
  for (const item of filtered) {
    if (!groups[item.time]) {
      groups[item.time] = [];
    }
    groups[item.time].push(item);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, items]) => ({
      time,
      items: items.sort((a, b) => a.dependentName.localeCompare(b.dependentName)),
    }));
}

function DashboardContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepIds, setSelectedDepIds] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const dependents = useMemo(() => {
    const seen = new Map();
    for (const dep of data) {
      if (!seen.has(dep.dependentId)) {
        seen.set(dep.dependentId, dep.dependentName);
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  useEffect(() => {
    if (!initialized && dependents.length > 0) {
      const savedDeps = loadFilter('dashboard-dep-filter', []);
      const validDeps = savedDeps.filter((id) => dependents.some((d) => d.id === id));
      setSelectedDepIds(validDeps.length > 0 ? validDeps : []);

      const savedStatuses = loadFilter('dashboard-status-filter', []);
      setSelectedStatuses(savedStatuses);

      setInitialized(true);
    }
  }, [dependents, initialized]);

  useEffect(() => {
    if (initialized) {
      saveFilter('dashboard-dep-filter', selectedDepIds);
    }
  }, [selectedDepIds, initialized]);

  useEffect(() => {
    if (initialized) {
      saveFilter('dashboard-status-filter', selectedStatuses);
    }
  }, [selectedStatuses, initialized]);

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

  async function deleteLog(scheduleId) {
    await apiFetch(`/schedules/${scheduleId}/log`, {
      method: 'DELETE',
    });
    load();
  }

  function toggleDep(id) {
    setSelectedDepIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function toggleAllDeps() {
    if (selectedDepIds.length === 0) {
      return;
    }
    setSelectedDepIds([]);
  }

  function toggleStatus(status) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  const timeGroups = useMemo(
    () => groupByTime(data, selectedDepIds, selectedStatuses),
    [data, selectedDepIds, selectedStatuses]
  );

  if (loading) {
    return <p className="p-6 text-gray-700">Carregando...</p>;
  }

  if (!data.length) {
    return <p className="p-6 text-gray-800">Nada para hoje 🎉</p>;
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Rotina de hoje
      </h1>

      {/* Filtro de dependentes */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleAllDeps}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              selectedDepIds.length === 0
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {dependents.map((dep) => (
            <button
              key={dep.id}
              onClick={() => toggleDep(dep.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedDepIds.includes(dep.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {dep.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro de status */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleStatus('PENDING')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              selectedStatuses.includes('PENDING')
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pendente
          </button>
          <button
            onClick={() => toggleStatus('DONE')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              selectedStatuses.includes('DONE')
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Concluído
          </button>
        </div>
      </div>

      {/* Grupos por horário */}
      <div className="space-y-5">
        {timeGroups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma rotina encontrada com os filtros selecionados.
          </p>
        ) : (
          timeGroups.map((group) => (
            <TimeGroup
              key={group.time}
              group={group}
              onUpdateLog={updateLog}
              onDeleteLog={deleteLog}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TimeGroup({ group, onUpdateLog, onDeleteLog }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <h2 className="font-bold text-lg text-gray-900 mb-4">
        🕐 {group.time}
      </h2>

      <div className="space-y-3">
        {group.items.map((item) => (
          <ScheduleItem
            key={item.scheduleId}
            item={item}
            onUpdateLog={onUpdateLog}
            onDeleteLog={onDeleteLog}
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

function ScheduleItem({ item, onUpdateLog, onDeleteLog }) {
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

  async function handleReopen() {
    setSaving(true);
    await onDeleteLog(item.scheduleId);
    setSaving(false);
  }

  const dependentLabel = (
    <p className="text-xs text-blue-600 font-medium">{item.dependentName}</p>
  );

  // Pendente
  if (!status) {
    return (
      <div className="rounded-xl border p-4 transition bg-orange-50 border-orange-200">
        <div className="mb-2">
          <p className="font-semibold text-gray-900">{item.title}</p>
          {dependentLabel}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => handleUpdate('DONE')}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : '✓ Feito'}
          </button>
          <button
            onClick={() => handleUpdate('SKIPPED')}
            disabled={saving}
            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : '⏭ Pular'}
          </button>
        </div>

        <input
          placeholder="Observação (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={200}
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
        <div className="mb-2">
          <p className="font-semibold text-gray-900">{item.title}</p>
          {dependentLabel}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => handleUpdate('DONE')}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : '✓ Feito'}
          </button>
          <button
            onClick={() => handleUpdate('SKIPPED')}
            disabled={saving}
            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : '⏭ Pular'}
          </button>
          <button
            onClick={handleReopen}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : '↩ Reabrir'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            Cancelar
          </button>
        </div>

        <input
          placeholder="Observação (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={200}
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
      <div className="mb-2">
        <p className="font-semibold text-gray-900">{item.title}</p>
        {dependentLabel}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <span className={`font-semibold text-sm ${config.labelClass} flex items-center justify-center`}>
          {config.label}
        </span>
        <button
          onClick={startEditing}
          className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          ✏️ Editar
        </button>
      </div>
    </div>
  );
}
