import React, { useState, useEffect } from 'react';
import { Problem } from '../../types/dataset';
import { useProgress } from '../../context/ProgressContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileText, Save, Check } from 'lucide-react';

interface NotesModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ problem, isOpen, onClose }) => {
  const { progressMap, saveNotes } = useProgress();
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (problem) {
      const currentNotes = progressMap[problem.problem_id]?.personal_notes || '';
      setNotes(currentNotes);
      setSaved(false);
    }
  }, [problem, progressMap, isOpen]);

  if (!problem) return null;

  const handleSave = async () => {
    await saveNotes(problem.problem_id, notes);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Notes: {problem.title}</span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Save key algorithms, edge cases, time/space complexity notes, or code approaches. Notes persist with your account.
        </p>

        <textarea
          rows={8}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          placeholder="E.g.: 
- Pattern: Two Pointer with Hash Map
- Edge Case: Handle duplicates and negative numbers
- Time Complexity: O(N), Space Complexity: O(1)"
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {notes.length} characters
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={saved ? 'success' : 'primary'}
              size="sm"
              onClick={handleSave}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-emerald-400" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
