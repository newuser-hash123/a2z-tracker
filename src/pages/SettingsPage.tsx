import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { backupService } from '../services/backupService';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Download,
  Upload,
  RotateCcw,
  Clock,
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isSupabaseConnected, updateTimezone } = useAuth();
  const { progressMap, exportProgress, importProgress, resetAllProgress, stats } = useProgress();

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importPreview, setImportPreview] = useState<{
    validCount: number;
    invalidCount: number;
    payload?: any;
    error?: string;
  } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await backupService.validateAndParseBackup(file);
    if (!result.isValid) {
      setStatusMessage({ type: 'error', text: result.error || 'Failed to parse JSON backup.' });
      setImportPreview(null);
    } else {
      setImportPreview({
        validCount: result.validCount,
        invalidCount: result.invalidCount,
        payload: result.payload,
      });
      setIsImportModalOpen(true);
      setStatusMessage(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview?.payload?.progress) return;
    try {
      await importProgress(importPreview.payload.progress, importMode);
      setIsImportModalOpen(false);
      setImportPreview(null);
      setStatusMessage({
        type: 'success',
        text: `Successfully imported ${importPreview.validCount} problem records (${importMode} mode)!`,
      });
    } catch {
      setStatusMessage({ type: 'error', text: 'Error importing progress data.' });
    }
  };

  const handleConfirmReset = async () => {
    if (resetConfirmationText !== 'RESET PROGRESS') return;
    await resetAllProgress();
    setIsResetModalOpen(false);
    setResetConfirmationText('');
    setStatusMessage({ type: 'success', text: 'All progress has been safely reset.' });
  };

  const timezones = [
    'Asia/Kolkata',
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Settings & Data Backup</h1>
        <p className="text-xs text-slate-400 mt-1">
          Export your DSA progress, restore backups, configure timezones, and inspect database connectivity.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl text-xs border animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Backup & Restore Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Download className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Data Export & Import</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Export Progress (JSON)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download a complete verified JSON backup containing all your solved statuses, timestamps, bookmarks, and notes.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Current payload: {Object.keys(progressMap).length} records
            </div>
            <Button variant="primary" size="sm" onClick={exportProgress} className="w-full text-xs">
              <Download className="w-4 h-4 mr-1.5" />
              Download Backup File (.json)
            </Button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Restore / Import Backup</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload a previously exported JSON backup file. Validates problem IDs against the A2Z sheet without deleting existing records.
              </p>
            </div>
            <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900 text-xs text-slate-300 font-medium cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Select Backup JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Timezone Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Clock className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">Timezone & Streak Calculation</h3>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Streaks and daily heatmap cells are calculated using your configured timezone date boundary.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={user?.timezone || 'Asia/Kolkata'}
              onChange={(e) => updateTimezone(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer min-w-[220px]"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">
              Default: <strong>Asia/Kolkata (IST)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Database & Cloud Connectivity */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100">Database Storage Mode</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
              }`}
            />
            <span className="text-slate-300">
              {isSupabaseConnected ? 'Supabase PostgreSQL (Connected)' : 'Local Offline Mode (Active)'}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-400">
          <p>
            {isSupabaseConnected
              ? 'Your progress is actively synchronized with your Supabase cloud PostgreSQL database with Row Level Security (RLS).'
              : 'Your progress is safely preserved in browser local storage and IndexedDB. You can export JSON backups at any time, or configure Supabase credentials in .env to enable multi-device cloud sync.'}
          </p>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
            <div className="text-emerald-400 font-semibold mb-1"># Setup Supabase in .env:</div>
            <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-slate-400">
          Permanently reset all your problem completion statuses, heatmap activity, and personal notes. This action cannot be undone unless you have an exported JSON backup.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsResetModalOpen(true)}
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset All Progress...
        </Button>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Confirm Progress Restore"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Found <strong className="text-emerald-400">{importPreview?.validCount}</strong> valid problem records in backup.
          </p>

          <div className="space-y-2">
            <label className="block font-medium text-slate-400">Restore Strategy:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer">
                <input
                  type="radio"
                  name="import_mode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">Merge with existing progress (Recommended)</div>
                  <div className="text-[11px] text-slate-500">
                    Keeps any progress you made on this device that isn't in the backup file.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer">
                <input
                  type="radio"
                  name="import_mode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">Replace entire progress</div>
                  <div className="text-[11px] text-slate-500">
                    Overwrites your local progress entirely with the backup file.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmImport}>
              Proceed with Restore
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetConfirmationText('');
        }}
        title="Confirm Reset All Progress"
      >
        <div className="space-y-4 text-xs">
          <p className="text-rose-300">
            This will permanently erase all {stats.solvedProblems} solved problems, heatmap history, and personal notes.
          </p>
          <div className="space-y-1">
            <label className="block text-slate-400">
              Type <strong className="text-white font-mono">RESET PROGRESS</strong> below to confirm:
            </label>
            <input
              type="text"
              value={resetConfirmationText}
              onChange={(e) => setResetConfirmationText(e.target.value)}
              placeholder="RESET PROGRESS"
              className="w-full bg-slate-950 border border-rose-900 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetConfirmationText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={resetConfirmationText !== 'RESET PROGRESS'}
              onClick={handleConfirmReset}
            >
              Permanently Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
