const TemplateCard = ({ template }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={template.image}
          alt={template.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/10 to-brand-500/20 opacity-0 group-hover:opacity-100 transition duration-300" />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-brand-500/10 via-transparent to-brand-900/10 opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{template.title}</h3>
          <span className="text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-brand-500/15 text-brand-100 border border-white/10">
            {template.category}
          </span>
        </div>
        <button className="w-full rounded-xl bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 px-4 py-3 text-sm font-semibold shadow-glow transition duration-300 hover:brightness-110">
          Use Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
