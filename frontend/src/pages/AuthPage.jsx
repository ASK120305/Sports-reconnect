import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome, Github } from 'lucide-react';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();

  const toggleMode = () => setMode((prev) => (prev === 'login' ? 'signup' : 'login'));

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/landing');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal text-textPrimary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,179,164,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(124,222,90,0.08),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(0,179,164,0.12),transparent_25%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-textSecondary">Certificate Generator</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl text-heading">Dynamic Certificates in Minutes</h1>
          <p className="mt-3 text-textSecondary">
            Design, personalize, and deliver certificates with polished templates and instant previews.
          </p>
        </div>

        <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-glow backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">{mode === 'login' ? 'Welcome back' : 'Create your space'}</p>
              <h2 className="text-2xl font-semibold text-heading">
                {mode === 'login' ? 'Sign in to continue' : 'Get started for free'}
              </h2>
            </div>
            <button
              onClick={toggleMode}
              className="text-sm text-accent underline underline-offset-4 transition hover:text-accentHover"
            >
              {mode === 'login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-textSecondary" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@studio.com"
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-textPrimary placeholder:text-textMuted outline-none transition focus:border-primary focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-textSecondary" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-textPrimary placeholder:text-textMuted outline-none transition focus:border-primary focus:bg-card"
              />
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-primary px-5 py-3 text-base font-semibold text-charcoal shadow-glow-green transition duration-300 hover:bg-primaryHover hover:scale-[1.02]"
            >
              <span className="relative z-10">{mode === 'login' ? 'Continue' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-4 text-center text-sm text-textMuted">Or continue with</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-accent transition hover:border-accent hover:bg-card hover:text-accentHover"
              >
                <Chrome className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-accent transition hover:border-accent hover:bg-card hover:text-accentHover"
              >
                <Github className="h-4 w-4" />
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
