import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseConnected, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signin') {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to sign in. Please check credentials.');
      }
    } else {
      const res = await signUpWithEmail(email, password, name);
      setLoading(false);
      if (res.success) {
        if (isSupabaseConnected) {
          setSuccessMsg('Account created successfully! Check email for confirmation if required.');
          setTimeout(onClose, 1500);
        } else {
          onClose();
        }
      } else {
        setError(res.error || 'Failed to sign up.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? 'Sign In to A2Z DSA Tracker' : 'Create an Account'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSupabaseConnected && (
          <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 text-xs text-sky-300">
            <strong>Local Development Mode:</strong> Sign-in will associate your local device progress with this profile. To enable permanent cloud PostgreSQL sync, configure Supabase environment variables.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
            <Input
              type="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
          <Input
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
          />
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-xs text-emerald-400 hover:underline"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
