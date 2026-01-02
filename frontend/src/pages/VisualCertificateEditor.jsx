import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, Download, FileSpreadsheet, Save, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

const VisualCertificateEditor = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [textFields, setTextFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [excelColumns, setExcelColumns] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initFabric = async () => {
      try {
        const fabricModule = await import('fabric');
        const fabric = fabricModule.fabric || fabricModule.default || fabricModule;
        
        // Wait a bit to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!canvasRef.current) return;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 1123,
          height: 794,
          backgroundColor: '#ffffff',
        });

        // Explicitly enable selection and interaction
        canvas.selection = true;
        canvas.preserveObjectStacking = true;
        canvas.renderOnAddRemove = true;
        canvas.allowTouchScrolling = false;

        fabricCanvasRef.current = canvas;

        console.log('✅ Fabric.js canvas initialized:', canvas);
        console.log('Canvas selection enabled:', canvas.selection);

      // Handle object selection
      canvas.on('selection:created', (e) => {
        if (e.selected && e.selected[0]) {
          setSelectedField(e.selected[0].fieldKey || null);
        }
      });

      canvas.on('selection:updated', (e) => {
        if (e.selected && e.selected[0]) {
          setSelectedField(e.selected[0].fieldKey || null);
        }
      });

      canvas.on('selection:cleared', () => {
        setSelectedField(null);
      });

      // Handle direct object selection (when clicking on object)
      canvas.on('mouse:down', (e) => {
        if (e.target && e.target.fieldKey) {
          setSelectedField(e.target.fieldKey);
        } else if (!e.target) {
          setSelectedField(null);
        }
      });

      // Handle object selection after mouse up
      canvas.on('mouse:up', (e) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.fieldKey) {
          setSelectedField(activeObject.fieldKey);
        }
      });

      // Update text fields state when objects are modified
      canvas.on('object:modified', () => {
        updateTextFieldsFromCanvas();
      });

      // Update on object moved (real-time during drag)
      canvas.on('object:moving', () => {
        updateTextFieldsFromCanvas();
      });

      // Update when object is moved (after drag ends)
      canvas.on('object:moved', () => {
        updateTextFieldsFromCanvas();
      });

      // Update on object scaled
      canvas.on('object:scaling', () => {
        updateTextFieldsFromCanvas();
      });

      // Update when object is scaled (after scaling ends)
      canvas.on('object:scaled', () => {
        updateTextFieldsFromCanvas();
      });

      // Ensure all existing objects are selectable
      canvas.getObjects().forEach(obj => {
        if (obj.fieldKey) {
          obj.set({
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
          });
        }
      });
      
      canvas.renderAll();
      } catch (error) {
        console.error('Failed to initialize Fabric.js canvas:', error);
      }
    };

    initFabric();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, []);

  const updateTextFieldsFromCanvas = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const fields = canvas.getObjects()
      .filter(obj => obj.fieldKey)
      .map(obj => {
        // Ensure all objects are selectable
        if (!obj.selectable) {
          obj.set({
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
          });
        }
        return {
          fieldKey: obj.fieldKey,
          x: obj.left || 0,
          y: obj.top || 0,
          width: (obj.width || 200) * (obj.scaleX || 1),
          height: (obj.height || 30) * (obj.scaleY || 1),
          fontSize: obj.fontSize || 24,
          fontFamily: obj.fontFamily || 'Arial',
          fill: obj.fill || '#000000',
          text: obj.text || '',
        };
      });

    setTextFields(fields);
  };

  // Load background image
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imgUrl = e.target.result;
      setBackgroundImage(imgUrl);

      if (fabricCanvasRef.current) {
        const fabricModule = await import('fabric');
        const fabric = fabricModule.fabric || fabricModule.default || fabricModule;
        
        fabric.Image.fromURL(imgUrl, (img) => {
          const canvas = fabricCanvasRef.current;
          // Scale image to fit canvas while maintaining aspect ratio
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          
          let scaleX, scaleY;
          if (imgAspect > canvasAspect) {
            scaleX = canvas.width / img.width;
            scaleY = scaleX;
          } else {
            scaleY = canvas.height / img.height;
            scaleX = scaleY;
          }
          
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: scaleX,
            scaleY: scaleY,
            originX: 'left',
            originY: 'top',
          });
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add text field
  const handleAddTextField = async () => {
    if (!fabricCanvasRef.current) {
      alert('Canvas not ready. Please wait a moment and try again.');
      return;
    }

    try {
      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || fabricModule.default || fabricModule;
      const canvas = fabricCanvasRef.current;

      if (!canvas) {
        alert('Canvas not initialized. Please refresh the page.');
        return;
      }

      const fieldKey = `field_${Date.now()}`;
      const text = new fabric.Textbox('Enter text', {
        left: 100,
        top: 100,
        width: 200,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        fieldKey: fieldKey,
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        cornerSize: 10,
        transparentCorners: false,
        borderColor: '#4285f4',
        cornerColor: '#4285f4',
        cornerStrokeColor: '#fff',
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      
      // Force render and ensure object is interactive
      text.setCoords();
      canvas.renderAll();
      
      console.log('✅ Text field added:', {
        fieldKey,
        selectable: text.selectable,
        hasControls: text.hasControls,
        evented: text.evented,
      });
      
      // Update state
      updateTextFieldsFromCanvas();
      setSelectedField(fieldKey);

    } catch (error) {
      console.error('Error adding text field:', error);
      alert('Failed to add text field. Please try again.');
    }
  };

  // Delete selected field
  const handleDeleteField = () => {
    if (!fabricCanvasRef.current || !selectedField) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const objToRemove = objects.find(obj => obj.fieldKey === selectedField);

    if (objToRemove) {
      canvas.remove(objToRemove);
      canvas.renderAll();
      setTextFields(prev => prev.filter(f => f.fieldKey !== selectedField));
      setSelectedField(null);
    }
  };

  // Update field properties
  const handleFieldPropertyChange = (fieldKey, property, value) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const obj = objects.find(o => o.fieldKey === fieldKey);

    if (obj) {
      // Ensure object remains selectable and movable
      const updateProps = {
        selectable: true,
        hasControls: true,
        hasBorders: true,
        evented: true,
      };

      if (property === 'fontSize') {
        updateProps.fontSize = parseInt(value) || 12;
      } else if (property === 'fontFamily') {
        updateProps.fontFamily = value;
      } else if (property === 'fill') {
        updateProps.fill = value;
      } else if (property === 'text') {
        updateProps.text = value;
      } else if (property === 'x') {
        const numValue = parseFloat(value) || 0;
        updateProps.left = numValue;
      } else if (property === 'y') {
        const numValue = parseFloat(value) || 0;
        updateProps.top = numValue;
      } else if (property === 'width') {
        const numValue = parseFloat(value) || 100;
        const currentWidth = obj.width * (obj.scaleX || 1);
        updateProps.scaleX = numValue / obj.width;
      } else if (property === 'height') {
        const numValue = parseFloat(value) || 30;
        const currentHeight = obj.height * (obj.scaleY || 1);
        updateProps.scaleY = numValue / obj.height;
      }

      obj.set(updateProps);
      obj.setCoords();
      canvas.renderAll();
      updateTextFieldsFromCanvas();
    }
  };

  // Handle Excel upload
  const handleExcelUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false });

        if (!parsed.length) {
          alert('No data found in Excel file');
          return;
        }

        const columns = Object.keys(parsed[0]);
        setExcelColumns(columns);
        setExcelData(parsed);

        // Initialize mappings
        const initialMappings = {};
        textFields.forEach(field => {
          initialMappings[field.fieldKey] = '';
        });
        setFieldMappings(initialMappings);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Generate PDFs and ZIP
  const handleGenerateCertificates = async () => {
    if (!excelData || !fabricCanvasRef.current) {
      alert('Please upload Excel data and set up your certificate template');
      return;
    }

    if (excelData.length > 400) {
      alert('Maximum 400 certificates per batch. Please reduce your Excel data.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const zip = new JSZip();
      const canvas = fabricCanvasRef.current;
      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || fabricModule.default || fabricModule;

      // Save original text values
      const originalTextValues = canvas.getObjects()
        .filter(obj => obj.fieldKey)
        .map(obj => ({ fieldKey: obj.fieldKey, text: obj.text }));

      for (let i = 0; i < excelData.length; i++) {
        try {
          const row = excelData[i];
          
          // Update text fields with Excel data
          const objects = canvas.getObjects();
          let updatedCount = 0;
          objects.forEach(obj => {
            if (obj.fieldKey && fieldMappings[obj.fieldKey]) {
              const columnName = fieldMappings[obj.fieldKey];
              const value = row[columnName] || '';
              obj.set({ text: String(value) });
              updatedCount++;
              console.log(`Row ${i + 1}: Updated field "${obj.fieldKey}" with value "${value}" from column "${columnName}"`);
            }
          });
          
          if (updatedCount === 0) {
            console.warn(`Row ${i + 1}: No fields were updated. Check your field mappings.`);
          }

          // Render the updated canvas
          canvas.renderAll();
          
          // Wait for rendering to complete
          await new Promise(r => setTimeout(r, 200));
          
          // Convert canvas to image
          let dataURL;
          try {
            dataURL = canvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: 2,
            });
            
            console.log(`Row ${i + 1}: DataURL generated, length: ${dataURL?.length || 0}`);
            
            // If we get an empty or invalid data URL, try again
            if (!dataURL || dataURL.length < 100 || dataURL === 'data:,') {
              console.warn(`Row ${i + 1}: First attempt failed, retrying...`);
              await new Promise(r => setTimeout(r, 300));
              canvas.renderAll();
              await new Promise(r => setTimeout(r, 200));
              dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2,
              });
              console.log(`Row ${i + 1}: Retry DataURL length: ${dataURL?.length || 0}`);
            }
          } catch (error) {
            console.error(`Row ${i + 1}: Error converting canvas to image:`, error);
            // Restore original text values
            objects.forEach((obj, idx) => {
              const original = originalTextValues.find(o => o.fieldKey === obj.fieldKey);
              if (original) {
                obj.set({ text: original.text });
              }
            });
            canvas.renderAll();
            continue;
          }

          // Verify dataURL is valid
          if (!dataURL || dataURL === 'data:,' || dataURL.length < 100) {
            console.error(`Failed to generate image for row ${i + 1}. DataURL length: ${dataURL?.length || 0}`);
            // Restore original text values
            objects.forEach((obj) => {
              const original = originalTextValues.find(o => o.fieldKey === obj.fieldKey);
              if (original) {
                obj.set({ text: original.text });
              }
            });
            canvas.renderAll();
            continue;
          }

          // Create PDF
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([1123, 794]);
          
          // Convert data URL to image bytes
          const base64Data = dataURL.split(',')[1];
          if (!base64Data || base64Data.length < 100) {
            console.error(`Invalid data URL for row ${i + 1}. Base64 length: ${base64Data?.length || 0}`);
            // Restore original text values
            objects.forEach((obj) => {
              const original = originalTextValues.find(o => o.fieldKey === obj.fieldKey);
              if (original) {
                obj.set({ text: original.text });
              }
            });
            canvas.renderAll();
            continue;
          }
          
          let pdfImage;
          try {
            // Convert base64 to Uint8Array
            const binaryString = atob(base64Data);
            const imgBytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              imgBytes[j] = binaryString.charCodeAt(j);
            }
            
            // Try PNG first
            pdfImage = await pdfDoc.embedPng(imgBytes);
          } catch (pngError) {
            console.warn(`PNG embedding failed for row ${i + 1}, trying JPEG:`, pngError);
            try {
              // Fallback: try as JPEG if PNG fails
              await new Promise(r => setTimeout(r, 100));
              canvas.renderAll();
              const jpegDataURL = canvas.toDataURL({
                format: 'jpeg',
                quality: 0.95,
                multiplier: 2,
              });
              const jpegBase64 = jpegDataURL.split(',')[1];
              if (!jpegBase64 || jpegBase64.length < 100) {
                throw new Error('Invalid JPEG data');
              }
              const jpegBinary = atob(jpegBase64);
              const jpegBytes = new Uint8Array(jpegBinary.length);
              for (let j = 0; j < jpegBinary.length; j++) {
                jpegBytes[j] = jpegBinary.charCodeAt(j);
              }
              pdfImage = await pdfDoc.embedJpg(jpegBytes);
            } catch (jpegError) {
              console.error(`Failed to embed image for row ${i + 1}:`, jpegError);
              // Restore original text values
              objects.forEach((obj) => {
                const original = originalTextValues.find(o => o.fieldKey === obj.fieldKey);
                if (original) {
                  obj.set({ text: original.text });
                }
              });
              canvas.renderAll();
              continue;
            }
          }
          
          // Draw image to fill the entire page (A4 size: 1123x794 points)
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: 1123,
            height: 794,
          });

          const pdfBytes = await pdfDoc.save();

          // Add to ZIP
          const fileName = `certificate_${String(i + 1).padStart(3, '0')}.pdf`;
          zip.file(fileName, pdfBytes);

          setGenerationProgress(Math.round(((i + 1) / excelData.length) * 100));

          // Restore original text values for next iteration
          objects.forEach((obj) => {
            const original = originalTextValues.find(o => o.fieldKey === obj.fieldKey);
            if (original) {
              obj.set({ text: original.text });
            }
          });
          canvas.renderAll();
        
        } catch (rowError) {
          console.error(`Row ${i + 1}: Error generating certificate:`, rowError);
          console.error('Error details:', {
            message: rowError.message,
            stack: rowError.stack,
            name: rowError.name,
          });
          
          // Restore original text values on error
          try {
            const objects = canvas.getObjects();
            objects.forEach((obj) => {
              const original = originalTextValues.find(o => o.fieldKey === obj.fieldKey);
              if (original) {
                obj.set({ text: original.text });
              }
            });
            canvas.renderAll();
          } catch (restoreError) {
            console.error('Error restoring canvas:', restoreError);
          }
          
          // Continue with next row instead of failing completely
          setGenerationProgress(Math.round(((i + 1) / excelData.length) * 100));
          continue;
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'certificates.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Successfully generated ${excelData.length} certificates!`);
    } catch (error) {
      console.error('Generation error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      alert(`Failed to generate certificates: ${error.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const selectedFieldData = textFields.find(f => f.fieldKey === selectedField);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-[#0b1f24] to-[#041014] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,183,181,0.22),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(1,135,144,0.18),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(0,84,97,0.28),transparent_25%)]" />
      <div className="relative z-10 mx-auto max-w-[1800px] px-6 py-10 space-y-6">
        <Navbar />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Visual Certificate Editor</h1>
            <p className="text-brand-100/70 mt-1">Design your certificate template with drag-and-drop fields</p>
          </div>
          <button
            onClick={() => navigate('/landing')}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-brand-100 transition hover:border-brand-500/60 hover:text-white"
          >
            <X className="h-4 w-4 inline mr-2" />
            Back to Templates
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] gap-6">
          {/* Left Panel - Field Controls */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Text Fields</h2>
              
              <button
                onClick={handleAddTextField}
                className="w-full rounded-lg border border-brand-500/60 bg-brand-500/20 px-4 py-2 text-sm font-semibold text-brand-100 transition hover:bg-brand-500/30 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Text Field
              </button>

              {selectedField && (
                <button
                  onClick={handleDeleteField}
                  className="w-full rounded-lg border border-red-400/60 bg-red-500/20 px-4 py-2 text-sm text-red-100 transition hover:bg-red-500/30 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {textFields.map((field) => (
                  <div
                    key={field.fieldKey}
                    onClick={() => {
                      if (fabricCanvasRef.current) {
                        const canvas = fabricCanvasRef.current;
                        const obj = canvas.getObjects().find(o => o.fieldKey === field.fieldKey);
                        if (obj) {
                          // Ensure object is selectable and movable
                          obj.set({
                            selectable: true,
                            hasControls: true,
                            hasBorders: true,
                            evented: true,
                          });
                          canvas.setActiveObject(obj);
                          canvas.renderAll();
                          setSelectedField(field.fieldKey);
                        }
                      }
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedField === field.fieldKey
                        ? 'border-brand-500 bg-brand-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-semibold text-brand-100/80 mb-1">
                      {field.fieldKey.replace('field_', 'Field ')}
                    </p>
                    <p className="text-sm truncate">{field.text || 'Empty'}</p>
                  </div>
                ))}
              </div>

              {selectedFieldData && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold">Field Properties</h3>
                  
                  <div>
                    <label className="text-xs text-brand-100/80 mb-1 block">Text</label>
                    <input
                      type="text"
                      value={selectedFieldData.text}
                      onChange={(e) => handleFieldPropertyChange(selectedField, 'text', e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brand-100/80 mb-1 block">Font Size</label>
                    <input
                      type="number"
                      value={selectedFieldData.fontSize}
                      onChange={(e) => handleFieldPropertyChange(selectedField, 'fontSize', e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      min="8"
                      max="200"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brand-100/80 mb-1 block">Font Family</label>
                    <select
                      value={selectedFieldData.fontFamily}
                      onChange={(e) => handleFieldPropertyChange(selectedField, 'fontFamily', e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-brand-100/80 mb-1 block">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedFieldData.fill}
                        onChange={(e) => handleFieldPropertyChange(selectedField, 'fill', e.target.value)}
                        className="h-10 w-16 rounded-lg border border-white/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedFieldData.fill}
                        onChange={(e) => handleFieldPropertyChange(selectedField, 'fill', e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-brand-100/80 mb-2">Position & Size</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-brand-100/80 mb-1 block">X Position</label>
                        <input
                          type="number"
                          value={Math.round(selectedFieldData.x)}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'x', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                          min="0"
                          max="1123"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-brand-100/80 mb-1 block">Y Position</label>
                        <input
                          type="number"
                          value={Math.round(selectedFieldData.y)}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'y', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                          min="0"
                          max="794"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-xs text-brand-100/80 mb-1 block">Width</label>
                        <input
                          type="number"
                          value={Math.round(selectedFieldData.width)}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'width', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                          min="50"
                          max="1123"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-brand-100/80 mb-1 block">Height</label>
                        <input
                          type="number"
                          value={Math.round(selectedFieldData.height)}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'height', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                          min="20"
                          max="794"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-brand-100/60 mt-2">
                      💡 Tip: You can also drag fields on the canvas
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Background</h2>
              <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-center cursor-pointer transition hover:border-brand-500/60 hover:bg-white/10">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Upload className="h-8 w-8 text-brand-100/70" />
                <div>
                  <p className="text-sm text-brand-100">Upload Template</p>
                  <p className="text-xs text-brand-100/70">PNG, JPG up to 10MB</p>
                </div>
              </label>
              {backgroundImage && (
                <p className="text-xs text-green-400">✓ Image loaded</p>
              )}
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="bg-white rounded-lg p-4 overflow-auto" style={{ position: 'relative', minHeight: '794px' }}>
              {!fabricCanvasRef.current && (
                <div className="flex items-center justify-center h-full min-h-[794px]">
                  <p className="text-gray-500">Initializing canvas...</p>
                </div>
              )}
              <canvas 
                ref={canvasRef} 
                className="border border-gray-300"
                style={{ 
                  display: 'block',
                  cursor: 'default',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
              />
            </div>
            <p className="text-xs text-brand-100/70 mt-2 text-center">
              💡 Click fields to select • Drag to move • Use corner handles to resize
            </p>
          </div>

          {/* Right Panel - Excel Mapping */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Excel Data</h2>
              
              <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-center cursor-pointer transition hover:border-brand-500/60 hover:bg-white/10">
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
                <FileSpreadsheet className="h-8 w-8 text-brand-100/70" />
                <div>
                  <p className="text-sm text-brand-100">Upload Excel</p>
                  <p className="text-xs text-brand-100/70">.xlsx, .xls, .csv</p>
                </div>
              </label>

              {excelData && (
                <div className="space-y-2">
                  <p className="text-sm text-green-400">
                    ✓ {excelData.length} rows loaded
                  </p>
                  <p className="text-xs text-brand-100/70">
                    Max 400 rows per batch
                  </p>
                </div>
              )}

              {excelColumns.length > 0 && textFields.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold">Field Mapping</h3>
                  <p className="text-xs text-brand-100/70">
                    Map each field to an Excel column
                  </p>
                  
                  {textFields.map((field) => (
                    <div key={field.fieldKey} className="space-y-1">
                      <label className="text-xs text-brand-100/80">
                        {field.fieldKey.replace('field_', 'Field ')}
                      </label>
                      <select
                        value={fieldMappings[field.fieldKey] || ''}
                        onChange={(e) => {
                          setFieldMappings(prev => ({
                            ...prev,
                            [field.fieldKey]: e.target.value,
                          }));
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      >
                        <option value="">-- Select Column --</option>
                        {excelColumns.map((col) => (
                          <option key={col} value={col} className="bg-black">
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {excelData && textFields.length > 0 && Object.keys(fieldMappings).some(k => fieldMappings[k]) && (
                <button
                  onClick={handleGenerateCertificates}
                  disabled={isGenerating || excelData.length > 400}
                  className="w-full rounded-lg border border-emerald-400/60 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-emerald-100 border-t-transparent rounded-full" />
                      Generating... {generationProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate {excelData.length} Certificates
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualCertificateEditor;

