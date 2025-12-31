import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Database, Trash2, Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import TemplateCustomizer from '../components/TemplateCustomizer';
import { API_BASE_URL } from '../constants';

const DataUploadPage = () => {
  const [records, setRecords] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customization, setCustomization] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('certificateRecipients');
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored recipients', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('certificateRecipients', JSON.stringify(records));
  }, [records]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.(xlsx?|csv)$/i.test(file.name)) {
      setUploadError('Please upload an Excel or CSV file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        
        const parsed = XLSX.utils.sheet_to_json(firstSheet, { 
          defval: '',
          raw: false 
        });

        if (!parsed.length) {
          setUploadError('No rows found in the uploaded sheet.');
          return;
        }

        
        const processedRecords = parsed.map((row) => {
          const processedRow = { ...row };
          Object.keys(processedRow).forEach((key) => {
            const value = processedRow[key];
            
            if (typeof value === 'number' && value > 1 && value < 100000) {
              
              
              
              const excelEpoch = new Date(1899, 11, 30); 
              const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
              
              
              if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                processedRow[key] = `${year}-${month}-${day}`;
              }
            }
          });
          return processedRow;
        });

        console.log('📊 Parsed Excel data:', processedRecords);
        console.log('📋 Column headers:', Object.keys(processedRecords[0] || {}));
        console.log(`✅ Loaded ${processedRecords.length} records from ${file.name}`);

        setRecords(processedRecords);
        setFileName(file.name);
        setUploadError('');
      } catch (error) {
        console.error('Error parsing file', error);
        setUploadError('Could not read this file. Please check the format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleClear = () => {
    setRecords([]);
    setFileName('');
    setUploadError('');
    localStorage.removeItem('certificateRecipients');
  };

  const handleGenerateCertificates = async () => {
    if (!records.length) {
      setGenerateError('Please upload data before generating certificates.');
      return;
    }

    const templateIdFromStorage = (() => {
      try {
        return localStorage.getItem('selectedTemplateId');
      } catch {
        return null;
      }
    })();

    const templateId = templateIdFromStorage || 'aurora-edge';

    setGenerateError('');
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/generate-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          records,
          customization: customization || undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to generate certificates.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'certificates.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Certificate generation failed', error);
      setGenerateError(error.message || 'Could not generate certificates. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-[#0b1f24] to-[#041014] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,183,181,0.22),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(1,135,144,0.18),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(0,84,97,0.28),transparent_25%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 space-y-10">
        <Navbar />

        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-100/80">Data Workspace</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Manage recipient data for dynamic certificates</h1>
          <p className="max-w-2xl text-brand-100/80">
            Upload an Excel or CSV file with your participants. The data is stored locally in your browser and can be
            used later to generate multiple certificates in one go.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-brand-900/30 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/20 text-brand-100">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-brand-100/80">Bulk Data</p>
                <h3 className="text-2xl font-semibold">Upload Excel to store recipients</h3>
              </div>
            </div>
            <p className="text-brand-100/80">
              Use columns like <span className="font-semibold text-white">Name</span>,{' '}
              <span className="font-semibold text-white">Email</span>, <span className="font-semibold text-white">Course</span>,{' '}
              <span className="font-semibold text-white">Date</span> or anything your certificates need.
            </p>

            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/30 p-6 text-center transition hover:border-brand-500/60 hover:bg-black/20">
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100">
                  {fileName || 'Choose file'}
                </span>
              </div>
              <p className="text-sm text-brand-100/80">Drop or select a spreadsheet to load recipients</p>
              <div className="flex gap-3 text-xs text-brand-100/70">
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Accepted: .xlsx, .xls, .csv</span>
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Local only • No upload</span>
              </div>
            </label>

            {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm">
                <Database className="h-4 w-4 text-brand-100" />
                <span className="text-brand-100">Stored rows: {records.length}</span>
              </div>
              {records.length > 0 && (
                <>
                  <button
                    onClick={handleGenerateCertificates}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating ZIP…' : 'Generate certificates ZIP'}
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-brand-100 transition hover:border-red-400 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear stored data
                  </button>
                </>
              )}
            </div>

            {generateError && <p className="text-sm text-red-300">{generateError}</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-100/70">Preview</p>
                <h4 className="text-xl font-semibold">First rows in local storage</h4>
              </div>
              <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-100">Readonly</span>
            </div>
            {records.length === 0 ? (
              <p className="text-sm text-brand-100/70">No data stored yet. Upload a sheet to see a preview.</p>
            ) : (
              <div className="overflow-auto rounded-xl border border-white/10 bg-white/5">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-brand-100/80">
                    <tr>
                      {Object.keys(records[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-semibold capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-white/5 hover:bg-white/5">
                        {Object.keys(records[0]).map((key) => (
                          <td key={key} className="px-3 py-2 text-brand-100/90">
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {records.length > 5 && (
                      <tr className="border-t border-white/5">
                        <td colSpan={Object.keys(records[0]).length} className="px-3 py-2 text-right text-brand-100/70">
                          +{records.length - 5} more rows stored
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-brand-100/70">
              Data is saved locally in your browser under the key <span className="font-mono text-white">certificateRecipients</span>.
              You can plug this into your certificate generation flow to iterate and render/export each recipient.
            </p>
          </div>
        </section>

        {/* Template Customization Section - Separate Row */}
        {records.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-brand-900/30 backdrop-blur-xl">
            <TemplateCustomizer onCustomizationChange={setCustomization} />
          </section>
        )}
      </div>
    </div>
  );
};

export default DataUploadPage;


