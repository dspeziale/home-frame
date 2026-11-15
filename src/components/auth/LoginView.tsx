import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ROLE_LABELS } from '../users/UsersManager';

export const LoginView: React.FC = () => {
  const { login, register, users } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'photographer' | 'editor' | 'collaborator'>('photographer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMsg('Inserisci il tuo nome e cognome.');
        setIsLoading(false);
        return;
      }
      const res = await register(name, email, password, role);
      if (!res.success) {
        setErrorMsg(res.message || 'Errore durante la registrazione.');
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Email o password non corretti.');
      }
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    setEmail(userEmail);
    setPassword('password123');
    await login(userEmail, 'password123');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-sky-500/10 to-indigo-600/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Camera className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            Home Frame <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestionale Professionale Fotografia & Video Immobiliare
          </p>
        </div>

        {/* Form Mode Toggle */}
        <div className="flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegisterMode 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Accedi con Credenziali
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegisterMode 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registra Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-2 mb-4 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome e Cognome *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Es. Mario Rossi"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ruolo nel Team *
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-800/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="photographer">Fotografo / Operatore</option>
                  <option value="editor">Editor Video / Foto</option>
                  <option value="collaborator">Collaboratore / Pilota Drone</option>
                  <option value="admin">Titolare / Amministratore</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="nome@email.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Password *
              </label>
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={() => alert('Password predefinita per gli account di esempio: password123')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Password dimenticata?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Resta connesso</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{isLoading ? 'Accesso in corso...' : isRegisterMode ? 'Crea Account Studio' : 'Accedi al Gestionale'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* DEMO / TEST CREDENTIALS ACCORDION */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 text-center mb-3">
            Accesso rapido con account di test (Password: password123)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {users.slice(0, 4).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.email)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {ROLE_LABELS[u.role]?.label}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
