import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const toggleMode = () => setMode((prev) => (prev === 'login' ? 'signup' : 'login'));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/landing');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-surface via-[#0b1f24] to-[#041014] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,183,181,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(1,135,144,0.25),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(0,84,97,0.35),transparent_25%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-100/80">Certificate Generator</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Dynamic Certificates in Minutes</h1>
          <p className="mt-3 text-brand-100/80">
            Design, personalize, and deliver certificates with polished templates and instant previews.
          </p>
        </div>

        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-brand-900/40 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-100/70">{mode === 'login' ? 'Welcome back' : 'Create your space'}</p>
              <h2 className="text-2xl font-semibold">
                {mode === 'login' ? 'Sign in to continue' : 'Get started for free'}
              </h2>
            </div>
            <button
              onClick={toggleMode}
              className="text-sm text-brand-100 underline underline-offset-4 transition hover:text-white"
            >
              {mode === 'login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-brand-100" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@studio.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-brand-100/70 outline-none transition focus:border-brand-500/70 focus:bg-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-brand-100" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-brand-100/70 outline-none transition focus:border-brand-500/70 focus:bg-white/10"
              />
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 px-5 py-3 text-base font-semibold shadow-glow transition duration-300 hover:scale-[1.01]"
            >
              <span className="relative z-10">{mode === 'login' ? 'Continue' : 'Create Account'}</span>
              <div className="absolute inset-0 -z-10 bg-white/10 opacity-0 blur-xl transition group-hover:opacity-60" />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-brand-100/70">
            <span>{mode === 'login' ? 'Use SSO? Coming soon.' : 'You can add teammates later.'}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              Secure workspace
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
