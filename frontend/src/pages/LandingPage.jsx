import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TemplateCard from '../components/TemplateCard';
import { templates } from '../data/templates';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal text-textPrimary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,179,164,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(124,222,90,0.08),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(0,179,164,0.15),transparent_25%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 space-y-10">
        <Navbar />

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center rounded-xl border border-border bg-card p-8 shadow-glow backdrop-blur-xl">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-textMuted">Template Studio</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl text-heading">
              Choose a certificate template and customize instantly
            </h1>
            <p className="text-textSecondary">
              Modern, print-ready certificates with dynamic fields, brand-ready colors, and responsive previews. Pick a
              base, tweak copy, and export in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-charcoal shadow-glow-green transition hover:bg-primaryHover hover:scale-[1.02]">
                Start from blank
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/editor')}
                className="rounded-xl border border-border bg-secondary px-5 py-3 font-semibold text-accent transition hover:border-accent hover:text-accentHover hover:bg-card"
              >
                Import your design
              </button>
            </div>
            <div className="flex gap-6 text-sm text-textSecondary">
              <div>
                <p className="text-lg font-semibold text-heading">40+</p>
                <p>Premium templates</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-heading">Export</p>
                <p>PDF & PNG ready</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border border-border bg-secondary p-6 shadow-glow">
              <div className="mb-4 flex items-center justify-between text-sm text-textMuted">
                <span>Live Preview</span>
                
              </div>
              <div className="rounded-xl overflow-hidden bg-charcoal shadow-inner">
                <img 
                  src="/Black and Gold Modern Elegant Certificate of Achievement .png" 
                  alt="Certificate Preview"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-textMuted">Template Library</p>
              <h2 className="text-3xl font-semibold text-heading">Curated layouts for every use case</h2>
            </div>
            <div className="flex gap-3 text-sm">
              <button className="rounded-lg border border-border bg-secondary px-4 py-2 text-accent transition hover:border-accent hover:text-accentHover hover:bg-card">
                Corporate
              </button>
              <button className="rounded-lg border border-border bg-secondary px-4 py-2 text-accent transition hover:border-accent hover:text-accentHover hover:bg-card">
                Education
              </button>
              <button className="rounded-lg border border-border bg-secondary px-4 py-2 text-accent transition hover:border-accent hover:text-accentHover hover:bg-card">
                Creative
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default LandingPage;
