
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (email: string, pass: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(email, password);
    if (!success) {
      setError('Неверный email или пароль. Пожалуйста, проверьте данные.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl shadow-2xl mb-6">
            <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">ZenFlow</h1>
          <p className="text-slate-400 font-medium">Система управления предприятием</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email или Логин</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zentask.com"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              Войти в систему
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          &copy; 2024 ZenTask Enterprise
        </p>
      </div>
    </div>
  );
};

export default Login;
