import { useState, useEffect } from 'react';
import { Palette, Type, Image, X, Upload as UploadIcon } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Cinzel', label: 'Cinzel (Elegant)', category: 'Serif' },
  { value: 'Playfair Display', label: 'Playfair Display (Classic)', category: 'Serif' },
  { value: 'Montserrat', label: 'Montserrat (Modern)', category: 'Sans-serif' },
  { value: 'Roboto', label: 'Roboto (Clean)', category: 'Sans-serif' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)', category: 'Sans-serif' },
  { value: 'Lato', label: 'Lato (Professional)', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins (Bold)', category: 'Sans-serif' },
  { value: 'Raleway', label: 'Raleway (Stylish)', category: 'Sans-serif' },
];

const DEFAULT_CUSTOMIZATION = {
  primaryColor: '#d4af37',
  accentColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  academyName: 'SPORTS RECONNECT ACADEMY',
  signatureName: 'Director',
  mainTitle: 'CERTIFICATE',
  subTitle: 'OF ATHLETIC EXCELLENCE',
  conferredText: 'This esteemed honor is conferred upon',
  description: 'For successfully completing the rigorous {{COURSE}} program, showcasing outstanding skill, unwavering dedication, and exemplary sportsmanship. Awarded on this day, {{DATE}}, in recognition of their commitment to greatness.',
  fontFamily: 'Cinzel',
  logo: null,
};

const TemplateCustomizer = ({ onCustomizationChange, initialCustomization = null }) => {
  const [customization, setCustomization] = useState(
    initialCustomization || { ...DEFAULT_CUSTOMIZATION }
  );
  const [logoPreview, setLogoPreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('certificateCustomization');
    if (stored && !initialCustomization) {
      try {
        const parsed = JSON.parse(stored);
        setCustomization({ ...DEFAULT_CUSTOMIZATION, ...parsed });
        if (parsed.logo) {
          setLogoPreview(parsed.logo);
        }
      } catch (error) {
        console.error('Failed to load stored customization', error);
      }
    } else if (initialCustomization) {
      setCustomization(initialCustomization);
      if (initialCustomization.logo) {
        setLogoPreview(initialCustomization.logo);
      }
    }
  }, [initialCustomization]);

  useEffect(() => {
    localStorage.setItem('certificateCustomization', JSON.stringify(customization));
    if (onCustomizationChange) {
      onCustomizationChange(customization);
    }
  }, [customization, onCustomizationChange]);

  const handleColorChange = (field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }));
  };

  const handleFontChange = (fontFamily) => {
    setCustomization((prev) => ({ ...prev, fontFamily }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setLogoPreview(base64);
      setCustomization((prev) => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setCustomization((prev) => ({ ...prev, logo: null }));
  };

  const handleReset = () => {
    setCustomization({ ...DEFAULT_CUSTOMIZATION });
    setLogoPreview(null);
  };

  return (
    <div className="rounded-xl border border-border bg-secondary p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-heading">Customize Template</h3>
            <p className="text-sm text-textMuted">Personalize colors, fonts, and text</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-accent transition hover:border-accent hover:text-accentHover"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Colors Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-heading">
              <Palette className="h-4 w-4" />
              Colors
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-textMuted">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                    placeholder="#d4af37"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-textMuted">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customization.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                    placeholder="#1a1a1a"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-textMuted">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Font Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-heading">
              <Type className="h-4 w-4" />
              Font Family
            </div>
            <select
              value={customization.fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-textPrimary focus:border-primary focus:outline-none"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} className="bg-charcoal">
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Logo Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-heading">
              <Image className="h-4 w-4" />
              Logo
            </div>
            {logoPreview ? (
              <div className="relative">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-16 object-contain rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-textPrimary">Logo uploaded</p>
                    <p className="text-xs text-textMuted">Click remove to change</p>
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="rounded-lg border border-red-400 bg-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-6 text-center cursor-pointer transition hover:border-accent hover:bg-secondary">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <UploadIcon className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-textPrimary">Upload Logo</p>
                  <p className="text-xs text-textMuted">PNG, JPG up to 2MB</p>
                </div>
              </label>
            )}
          </div>

          {/* Text Fields Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-heading">
              <Type className="h-4 w-4" />
              Text Content
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-textMuted mb-1 block">Academy/Organization Name</label>
                <input
                  type="text"
                  value={customization.academyName}
                  onChange={(e) => handleTextChange('academyName', e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary"
                  placeholder="SPORTS RECONNECT ACADEMY"
                />
              </div>
              <div>
                <label className="text-xs text-textMuted mb-1 block">Main Title</label>
                <input
                  type="text"
                  value={customization.mainTitle}
                  onChange={(e) => handleTextChange('mainTitle', e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary"
                  placeholder="CERTIFICATE"
                />
              </div>
              <div>
                <label className="text-xs text-textMuted mb-1 block">Sub Title</label>
                <input
                  type="text"
                  value={customization.subTitle}
                  onChange={(e) => handleTextChange('subTitle', e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary"
                  placeholder="OF ATHLETIC EXCELLENCE"
                />
              </div>
              <div>
                <label className="text-xs text-textMuted mb-1 block">Conferred Text</label>
                <input
                  type="text"
                  value={customization.conferredText}
                  onChange={(e) => handleTextChange('conferredText', e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary"
                  placeholder="This esteemed honor is conferred upon"
                />
              </div>
              <div>
                <label className="text-xs text-textMuted mb-1 block">Description (use {'{{COURSE}}'} and {'{{DATE}}'} for dynamic values)</label>
                <textarea
                  value={customization.description}
                  onChange={(e) => handleTextChange('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted resize-none focus:border-primary"
                  placeholder="For successfully completing..."
                />
              </div>
              <div>
                <label className="text-xs text-textMuted mb-1 block">Signature Name</label>
                <input
                  type="text"
                  value={customization.signatureName}
                  onChange={(e) => handleTextChange('signatureName', e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary"
                  placeholder="Director"
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-accent transition hover:border-accent hover:text-accentHover"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCustomizer;

