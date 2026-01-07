import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 backdrop-blur-lg shadow-glow">
      <button
        type="button"
        onClick={() => navigate('/landing')}
        className="flex items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-bold text-charcoal shadow-lg shadow-primary/20">
          DC
        </div>
        <div>
          <p className="text-sm text-textMuted">Dynamic Certificates</p>
          <p className="text-lg font-semibold text-heading">Generator</p>
        </div>
      </button>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/data')}
          className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-accent transition duration-200 hover:border-accent hover:text-accentHover hover:bg-card"
        >
          Dashboard
        </button>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary ring-2 ring-border" />
      </div>
    </header>
  );
};

export default Navbar;
