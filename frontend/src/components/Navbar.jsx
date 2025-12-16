const Navbar = () => {
  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-lg shadow-glow">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-900 font-bold text-white shadow-lg shadow-brand-900/30">
          DC
        </div>
        <div>
          <p className="text-sm text-brand-100/80">Dynamic Certificates</p>
          <p className="text-lg font-semibold">Generator</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-brand-100 transition duration-200 hover:border-brand-500/60 hover:text-white">
          Dashboard
        </button>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 ring-2 ring-white/10" />
      </div>
    </header>
  );
};

export default Navbar;
