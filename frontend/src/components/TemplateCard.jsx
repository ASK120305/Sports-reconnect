import { useNavigate } from 'react-router-dom';

const TemplateCard = ({ template }) => {
  const navigate = useNavigate();

  const handleUseTemplate = () => {
    // Persist selected template so the data page can use it for generation
    try {
      localStorage.setItem('selectedTemplateId', template.id);
    } catch {
      // ignore storage failures; generation handler will fall back
    }
    navigate('/data');
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-green hover:bg-cardHover">
      <div className="aspect-[4/3] overflow-hidden relative bg-secondary">
        <iframe
          src={template.image}
          title={template.title}
          className="absolute top-0 left-0 border-0 pointer-events-none"
          style={{ 
            width: '1123px', 
            height: '794px',
            transform: 'scale(0.36)',
            transformOrigin: 'top left',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/40 via-charcoal/10 to-accent/20 opacity-0 group-hover:opacity-100 transition duration-300" />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-heading">{template.title}</h3>
          <span className="text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-accent text-white border border-border">
            {template.category}
          </span>
        </div>
        <button
          onClick={handleUseTemplate}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-charcoal shadow-glow-green transition duration-300 hover:bg-primaryHover hover:scale-[1.02]"
        >
          Use Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
