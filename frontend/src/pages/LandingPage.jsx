import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import TemplateCard from '../components/TemplateCard';
import { templates } from '../data/templates';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-[#0b1f24] to-[#041014] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,183,181,0.22),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(1,135,144,0.18),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(0,84,97,0.28),transparent_25%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 space-y-10">
        <Navbar />

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-brand-900/30 backdrop-blur-xl">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-100/80">Template Studio</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Choose a certificate template and customize instantly
            </h1>
            <p className="text-brand-100/80">
              Modern, print-ready certificates with dynamic fields, brand-ready colors, and responsive previews. Pick a
              base, tweak copy, and export in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 px-5 py-3 font-semibold shadow-glow transition hover:scale-[1.01]">
                Start from blank
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-brand-100 transition hover:border-brand-500/60 hover:text-white">
                Import your design
              </button>
            </div>
            <div className="flex gap-6 text-sm text-brand-100/80">
              <div>
                <p className="text-lg font-semibold text-white">40+</p>
                <p>Premium templates</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Export</p>
                <p>PDF & PNG ready</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-brand-500/15 via-transparent to-brand-900/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl shadow-brand-900/30">
              <div className="mb-4 flex items-center justify-between text-sm text-brand-100/80">
                <span>Live Preview</span>
                
              </div>
              <div className="rounded-xl overflow-hidden bg-black/20 shadow-inner">
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
              <p className="text-sm uppercase tracking-[0.3em] text-brand-100/80">Template Library</p>
              <h2 className="text-3xl font-semibold">Curated layouts for every use case</h2>
            </div>
            <div className="flex gap-3 text-sm">
              <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-brand-100 transition hover:border-brand-500/60 hover:text-white">
                Corporate
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-brand-100 transition hover:border-brand-500/60 hover:text-white">
                Education
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-brand-100 transition hover:border-brand-500/60 hover:text-white">
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
