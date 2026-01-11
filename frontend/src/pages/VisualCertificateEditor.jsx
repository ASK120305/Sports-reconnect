import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, Download, FileSpreadsheet, Save, X, GripVertical } from 'lucide-react';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ImageHandler from '../components/ImageHandler';

const VisualCertificateEditor = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const backgroundImageRef = useRef(null);

  const [backgroundImage, setBackgroundImage] = useState(null);
  const [textFields, setTextFields] = useState([]);
  const [imageFields, setImageFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedFieldType, setSelectedFieldType] = useState(null); // 'text' or 'image'
  const [excelData, setExcelData] = useState(null);
  const [excelColumns, setExcelColumns] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [dragState, setDragState] = useState(null);
  const canvasWidth = 1123;
  const canvasHeight = 794;

  const handleFieldReorder = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // If dropped in the same position, do nothing
    if (source.index === destination.index) return;

    // Reorder the text fields array
    const reorderedFields = Array.from(textFields);
    const [movedField] = reorderedFields.splice(source.index, 1);
    reorderedFields.splice(destination.index, 0, movedField);

    setTextFields(reorderedFields);
  };

  const handleImageFieldReorder = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.index === destination.index) return;

    const reorderedFields = Array.from(imageFields);
    const [movedField] = reorderedFields.splice(source.index, 1);
    reorderedFields.splice(destination.index, 0, movedField);

    setImageFields(reorderedFields);
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

      const img = new Image();
      img.onload = () => {
        backgroundImageRef.current = img;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const imgAspect = img.width / img.height;
        const canvasAspect = canvasWidth / canvasHeight;

        let drawWidth, drawHeight;
        if (imgAspect > canvasAspect) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imgAspect;
        } else {
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * imgAspect;
        }

        const offsetX = (canvasWidth - drawWidth) / 2;
        const offsetY = (canvasHeight - drawHeight) / 2;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  // Add text field
  const handleAddTextField = () => {
    const fieldKey = `field_${Date.now()}`;
    const newField = {
      fieldKey,
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      text: 'Enter text',
      bold: false,
      italic: false,
      underline: false,
    };
    setTextFields((prev) => [...prev, newField]);
    setSelectedField(fieldKey);
    setSelectedFieldType('text');
  };

  // Add image field
  const handleAddImageField = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG/JPG)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const fieldKey = `image_${Date.now()}`;
        const newImageField = {
          fieldKey,
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          imageData: event.target.result,
          opacity: 1,
        };
        setImageFields((prev) => [...prev, newImageField]);
        setSelectedField(fieldKey);
        setSelectedFieldType('image');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Delete selected field
  const handleDeleteField = () => {
    if (!selectedField) return;
    if (selectedFieldType === 'text') {
      setTextFields((prev) => prev.filter((f) => f.fieldKey !== selectedField));
    } else if (selectedFieldType === 'image') {
      setImageFields((prev) => prev.filter((f) => f.fieldKey !== selectedField));
    }
    setSelectedField(null);
    setSelectedFieldType(null);
  };

  // Update field properties
  const handleFieldPropertyChange = (fieldKey, property, value) => {
    if (selectedFieldType === 'text') {
      setTextFields((prev) =>
        prev.map((field) => {
          if (field.fieldKey !== fieldKey) return field;

          if (property === 'fontSize') {
            return { ...field, fontSize: parseInt(value, 10) || 12 };
          }
          if (property === 'x' || property === 'y' || property === 'width' || property === 'height') {
            const num = parseFloat(value);
            if (Number.isNaN(num)) return field;
            return { ...field, [property]: num };
          }
          return { ...field, [property]: value };
        })
      );
    } else if (selectedFieldType === 'image') {
      setImageFields((prev) =>
        prev.map((field) => {
          if (field.fieldKey !== fieldKey) return field;

          if (property === 'x' || property === 'y' || property === 'width' || property === 'height' || property === 'opacity') {
            const num = parseFloat(value);
            if (Number.isNaN(num)) return field;
            return { ...field, [property]: num };
          }
          return { ...field, [property]: value };
        })
      );
    }
  };

  // Drag handling for fields on top of the canvas
  const handleFieldMouseDown = (fieldKey, fieldType, event) => {
    event.stopPropagation();
    const container = editorRef.current;
    if (!container) return;

    const field = fieldType === 'text' 
      ? textFields.find((f) => f.fieldKey === fieldKey)
      : imageFields.find((f) => f.fieldKey === fieldKey);
    if (!field) return;

    // Calculate the mouse offset inside the field so that
    // the cursor stays at the same relative point while dragging
    const fieldRect = event.currentTarget.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offsetX = event.clientX - fieldRect.left;
    const offsetY = event.clientY - fieldRect.top;

    setSelectedField(fieldKey);
    setSelectedFieldType(fieldType);
    setDragState({
      fieldKey,
      fieldType,
      offsetX,
      offsetY,
      startX: field.x,
      startY: field.y,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (event) => {
      const container = editorRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      // New top-left position so that the cursor stays at the
      // same point inside the field while dragging
      let newX = event.clientX - containerRect.left - dragState.offsetX;
      let newY = event.clientY - containerRect.top - dragState.offsetY;

      if (dragState.fieldType === 'text') {
        setTextFields((prev) =>
          prev.map((field) => {
            if (field.fieldKey !== dragState.fieldKey) return field;

            // Clamp within canvas bounds
            const clampedX = Math.min(Math.max(0, newX), canvasWidth - field.width);
            const clampedY = Math.min(Math.max(0, newY), canvasHeight - field.height);

            return { ...field, x: clampedX, y: clampedY };
          })
        );
      } else if (dragState.fieldType === 'image') {
        setImageFields((prev) =>
          prev.map((field) => {
            if (field.fieldKey !== dragState.fieldKey) return field;

            // Clamp within canvas bounds
            const clampedX = Math.min(Math.max(0, newX), canvasWidth - field.width);
            const clampedY = Math.min(Math.max(0, newY), canvasHeight - field.height);

            return { ...field, x: clampedX, y: clampedY };
          })
        );
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, canvasWidth, canvasHeight]);

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
    if (!excelData || !canvasRef.current) {
      alert('Please upload Excel data and set up your certificate template');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const zip = new JSZip();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const drawBase = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (backgroundImageRef.current) {
          const img = backgroundImageRef.current;
          const imgAspect = img.width / img.height;
          const canvasAspect = canvasWidth / canvasHeight;

          let drawWidth, drawHeight;
          if (imgAspect > canvasAspect) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgAspect;
          } else {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgAspect;
          }

          const offsetX = (canvasWidth - drawWidth) / 2;
          const offsetY = (canvasHeight - drawHeight) / 2;
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
      };

      const wrapText = (context, text, maxWidth, lineHeight) => {
        const words = String(text).split(' ');
        const lines = [];
        let line = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = line ? `${line} ${words[n]}` : words[n];
          const metrics = context.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n];
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line);
        return lines;
      };

      for (let i = 0; i < excelData.length; i++) {
        try {
          const row = excelData[i];
          
          // Draw background, images, and text for this row
          drawBase();

          // Draw image fields first (so text appears on top)
          for (const imageField of imageFields) {
            if (imageField.imageData) {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageField.imageData;
              });
              
              ctx.save();
              ctx.globalAlpha = imageField.opacity || 1;
              ctx.drawImage(
                img,
                imageField.x,
                imageField.y,
                imageField.width,
                imageField.height
              );
              ctx.restore();
            }
          }

          // Draw text fields
          textFields.forEach((field) => {
            const mappedColumn = fieldMappings[field.fieldKey];
            const valueFromRow = mappedColumn ? row[mappedColumn] : undefined;
            const text = valueFromRow !== undefined && valueFromRow !== null && valueFromRow !== ''
              ? String(valueFromRow)
              : field.text;

            if (!text) return;

            ctx.save();
            ctx.fillStyle = field.fill || '#000000';
            
            // Build font string with bold and italic
            let fontStyle = '';
            if (field.bold) fontStyle += 'bold ';
            if (field.italic) fontStyle += 'italic ';
            ctx.font = `${fontStyle}${field.fontSize || 24}px ${field.fontFamily || 'Arial'}`;
            ctx.textAlign = 'center'; // Center text horizontally
            ctx.textBaseline = 'middle'; // Center text vertically

            const maxWidth = field.width || 200;
            const lineHeight = (field.fontSize || 24) * 1.2;
            const lines = wrapText(ctx, text, maxWidth, lineHeight);

            // Calculate center position
            const fieldCenterX = field.x + (field.width || 200) / 2;
            const totalTextHeight = lines.length * lineHeight;
            const fieldCenterY = field.y + (field.height || 30) / 2;
            
            // Start Y position to center all lines vertically
            const startY = fieldCenterY - (totalTextHeight / 2) + (lineHeight / 2);

            lines.forEach((line, index) => {
              const lineY = startY + (index * lineHeight);
              ctx.fillText(line, fieldCenterX, lineY);
              
              // Draw underline if enabled
              if (field.underline) {
              const metrics = ctx.measureText(line);
              const textWidth = metrics.width;
              const underlineY = lineY + (field.fontSize || 24) * 0.3; // Position underline below text
              ctx.strokeStyle = field.fill || '#000000';
              ctx.lineWidth = Math.max(1, (field.fontSize || 24) * 0.05); // Underline thickness
              ctx.beginPath();
              ctx.moveTo(fieldCenterX - textWidth / 2, underlineY);
              ctx.lineTo(fieldCenterX + textWidth / 2, underlineY);
              ctx.stroke();
              }
            });

            ctx.restore();
          });

          // Convert canvas to image
          const dataURL = canvas.toDataURL('image/png');

          if (!dataURL || dataURL === 'data:,' || dataURL.length < 100) {
            console.error(`Failed to generate image for row ${i + 1}. DataURL length: ${dataURL?.length || 0}`);
            continue;
          }

          // Create PDF
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([1123, 794]);
          
          // Convert data URL to image bytes
          const base64Data = dataURL.split(',')[1];
          if (!base64Data || base64Data.length < 100) {
            console.error(`Invalid data URL for row ${i + 1}. Base64 length: ${base64Data?.length || 0}`);
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
              const jpegDataURL = canvas.toDataURL('image/jpeg', 0.95);
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
        
        } catch (rowError) {
          console.error(`Row ${i + 1}: Error generating certificate:`, rowError);
          console.error('Error details:', {
            message: rowError.message,
            stack: rowError.stack,
            name: rowError.name,
          });
          
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

  const handleImageAdd = (imageData) => {
    console.log('Image added:', imageData);
  };

  const selectedFieldData = selectedFieldType === 'text' 
    ? textFields.find(f => f.fieldKey === selectedField)
    : selectedFieldType === 'image'
    ? imageFields.find(f => f.fieldKey === selectedField)
    : null;

  return (
    <div className="min-h-screen bg-charcoal text-textPrimary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,179,164,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(124,222,90,0.08),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(0,179,164,0.15),transparent_25%)]" />
      <div className="relative z-10 mx-auto max-w-[1800px] px-6 py-10 space-y-6">
        <Navbar />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-heading">Visual Certificate Editor</h1>
            <p className="text-textMuted mt-1">Design your certificate template with drag-and-drop fields</p>
          </div>
          <button
            onClick={() => navigate('/landing')}
            className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-accent transition hover:border-accent hover:text-accentHover hover:bg-card"
          >
            <X className="h-4 w-4 inline mr-2" />
            Back to Templates
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] gap-6">
          {/* Left Panel - Field Controls */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary p-6 space-y-4">
              <h2 className="text-lg font-semibold text-heading">Text Fields</h2>
              
                <p className="text-xs text-textMuted p-2 rounded-lg bg-accent/10 border border-accent/20">
                  💡 Drag fields by the grip icon to reorder layers
                </p>
              
              <button
                onClick={handleAddTextField}
                className="w-full rounded-lg border border-accent bg-accent/20 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/30 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Text Field
              </button>

              <button
                onClick={handleAddImageField}
                className="w-full rounded-lg border border-primary bg-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/30 flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Add Image/Logo
              </button>

              {selectedField && (
                <button
                  onClick={handleDeleteField}
                  className="w-full rounded-lg border border-red-400 bg-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/30 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                <DragDropContext onDragEnd={handleFieldReorder}>
                  <Droppable droppableId="text-fields-list">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-brand-500/10 rounded-lg' : ''}`}
                      >
                        {textFields.map((field, index) => (
                          <Draggable
                            key={field.fieldKey}
                            draggableId={field.fieldKey}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                onClick={() => {
                                  setSelectedField(field.fieldKey);
                                }}
                                className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-2 ${
                                  selectedField === field.fieldKey
                                    ? 'border-accent bg-accent/20'
                                    : 'border-border bg-card hover:border-accent/50'
                                } ${snapshot.isDragging ? 'shadow-lg shadow-accent/20' : ''}`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing text-textMuted hover:text-accent transition"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-textMuted mb-1">
                                    {field.fieldKey.replace('field_', 'Field ')}
                                  </p>
                                  <p className="text-sm truncate text-textPrimary">{field.text || 'Empty'}</p>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Image Fields List */}
              {imageFields.length > 0 && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-heading mb-2">Image Fields</h3>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <DragDropContext onDragEnd={handleImageFieldReorder}>
                      <Droppable droppableId="image-fields-list">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-primary/10 rounded-lg' : ''}`}
                          >
                            {imageFields.map((field, index) => (
                              <Draggable
                                key={field.fieldKey}
                                draggableId={field.fieldKey}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => {
                                      setSelectedField(field.fieldKey);
                                      setSelectedFieldType('image');
                                    }}
                                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-2 ${
                                      selectedField === field.fieldKey && selectedFieldType === 'image'
                                        ? 'border-primary bg-primary/20'
                                        : 'border-border bg-card hover:border-primary/50'
                                    } ${snapshot.isDragging ? 'shadow-lg shadow-primary/20' : ''}`}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing text-textMuted hover:text-primary transition"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <img 
                                        src={field.imageData} 
                                        alt="Logo preview" 
                                        className="w-8 h-8 object-contain rounded border border-border"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-textMuted">
                                          {field.fieldKey.replace('image_', 'Image ')}
                                        </p>
                                        <p className="text-xs text-textMuted">
                                          {field.width}x{field.height}px
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </>
              )}

              {selectedFieldData && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-heading">Field Properties</h3>
                  
                  {selectedFieldType === 'text' ? (
                    // Text Field Properties
                    <>
                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Text</label>
                        <input
                          type="text"
                          value={selectedFieldData.text}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'text', e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Font Size</label>
                        <input
                          type="number"
                          value={selectedFieldData.fontSize}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'fontSize', e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                          min="8"
                          max="200"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Font Family</label>
                        <select
                          value={selectedFieldData.fontFamily}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'fontFamily', e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
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
                        <label className="text-xs text-textMuted mb-1 block">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedFieldData.fill}
                            onChange={(e) => handleFieldPropertyChange(selectedField, 'fill', e.target.value)}
                            className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedFieldData.fill}
                            onChange={(e) => handleFieldPropertyChange(selectedField, 'fill', e.target.value)}
                            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-textMuted mb-2 block">Text Style</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFieldPropertyChange(selectedField, 'bold', !selectedFieldData.bold)}
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                              selectedFieldData.bold
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-border bg-card text-textPrimary hover:border-primary/60'
                            }`}
                          >
                            <span className="font-bold">B</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldPropertyChange(selectedField, 'italic', !selectedFieldData.italic)}
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                              selectedFieldData.italic
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-border bg-card text-textPrimary hover:border-primary/60'
                            }`}
                          >
                            <span className="italic">I</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldPropertyChange(selectedField, 'underline', !selectedFieldData.underline)}
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                              selectedFieldData.underline
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-border bg-card text-textPrimary hover:border-primary/60'
                            }`}
                          >
                            <span className="underline">U</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="text-xs font-semibold text-textMuted mb-2">Size & Position</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-textMuted mb-1 block">Width (px)</label>
                            <input
                              type="number"
                              value={selectedFieldData.width}
                              onChange={(e) => handleFieldPropertyChange(selectedField, 'width', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                              min="50"
                              max="1123"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-textMuted mb-1 block">Height (px)</label>
                            <input
                              type="number"
                              value={selectedFieldData.height}
                              onChange={(e) => handleFieldPropertyChange(selectedField, 'height', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                              min="20"
                              max="794"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="text-xs text-textMuted mb-1 block">X Position (px)</label>
                            <input
                              type="number"
                              value={selectedFieldData.x}
                              onChange={(e) => handleFieldPropertyChange(selectedField, 'x', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                              min="0"
                              max="1123"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-textMuted mb-1 block">Y Position (px)</label>
                            <input
                              type="number"
                              value={selectedFieldData.y}
                              onChange={(e) => handleFieldPropertyChange(selectedField, 'y', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                              min="0"
                              max="794"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-textMuted mt-2">
                          💡 You can also drag fields on the canvas to reposition them
                        </p>
                      </div>
                    </>
                  ) : selectedFieldType === 'image' ? (
                    // Image Field Properties
                    <>
                      <div className="mb-3">
                        <img 
                          src={selectedFieldData.imageData} 
                          alt="Preview" 
                          className="w-full h-32 object-contain rounded border border-border bg-charcoal"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Width (px)</label>
                        <input
                          type="number"
                          value={selectedFieldData.width}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'width', e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                          min="10"
                          max="1000"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Height (px)</label>
                        <input
                          type="number"
                          value={selectedFieldData.height}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'height', e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                          min="10"
                          max="1000"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-textMuted mb-1 block">Opacity</label>
                        <input
                          type="range"
                          value={selectedFieldData.opacity}
                          onChange={(e) => handleFieldPropertyChange(selectedField, 'opacity', e.target.value)}
                          className="w-full"
                          min="0"
                          max="1"
                          step="0.1"
                        />
                        <p className="text-xs text-center text-textMuted mt-1">{Math.round(selectedFieldData.opacity * 100)}%</p>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="rounded-xl border border-border bg-secondary p-6 space-y-4">
              <h2 className="text-lg font-semibold text-heading">Background</h2>
              <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-6 text-center cursor-pointer transition hover:border-accent hover:bg-secondary">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Upload className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-textPrimary">Upload Template</p>
                  <p className="text-xs text-textMuted">PNG, JPG up to 10MB</p>
                </div>
              </label>
              {backgroundImage && (
                <p className="text-xs text-primary">✓ Image loaded</p>
              )}
            </div>
          </div>

          {/* Center - Canvas with draggable text overlays */}
          <div className="rounded-xl border border-border bg-secondary p-6">
            <div className="bg-white rounded-lg p-4 overflow-auto" style={{ position: 'relative', minHeight: '794px' }}>
              <div
                ref={editorRef}
                onMouseDown={(e) => {
                  // Clicking on empty canvas area should deselect any field
                  if (e.target === e.currentTarget) {
                    setSelectedField(null);
                    setSelectedFieldType(null);
                  }
                }}
                style={{
                  position: 'relative',
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                  margin: '0 auto',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasWidth}
                  height={canvasHeight}
                  className="border border-gray-300 block"
                  style={{
                    touchAction: 'none',
                    userSelect: 'none',
                  }}
                />

                {textFields.map((field) => (
                  <div
                    key={field.fieldKey}
                    onMouseDown={(e) => handleFieldMouseDown(field.fieldKey, 'text', e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedField(field.fieldKey);
                      setSelectedFieldType('text');
                    }}
                    style={{
                      position: 'absolute',
                      left: `${field.x}px`,
                      top: `${field.y}px`,
                      width: `${field.width}px`,
                      height: `${field.height}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: `${field.fontSize}px`,
                      fontFamily: field.fontFamily,
                      color: field.fill,
                      fontWeight: field.bold ? 'bold' : 'normal',
                      fontStyle: field.italic ? 'italic' : 'normal',
                      textDecoration: field.underline ? 'underline' : 'none',
                      cursor:
                        dragState && dragState.fieldKey === field.fieldKey
                          ? 'grabbing'
                          : 'grab',
                      border:
                        selectedField === field.fieldKey && selectedFieldType === 'text'
                          ? '2px solid #7CDE5A'
                          : '1px dashed transparent',
                      boxSizing: 'border-box',
                      padding: '2px',
                      backgroundColor: 'transparent',
                      userSelect: 'none',
                      textAlign: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {field.text}
                  </div>
                ))}

                {imageFields.map((field) => (
                  <div
                    key={field.fieldKey}
                    onMouseDown={(e) => handleFieldMouseDown(field.fieldKey, 'image', e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedField(field.fieldKey);
                      setSelectedFieldType('image');
                    }}
                    style={{
                      position: 'absolute',
                      left: `${field.x}px`,
                      top: `${field.y}px`,
                      width: `${field.width}px`,
                      height: `${field.height}px`,
                      cursor:
                        dragState && dragState.fieldKey === field.fieldKey
                          ? 'grabbing'
                          : 'grab',
                      border:
                        selectedField === field.fieldKey && selectedFieldType === 'image'
                          ? '2px solid #7CDE5A'
                          : '1px dashed rgba(124, 222, 90, 0.3)',
                      boxSizing: 'border-box',
                      opacity: field.opacity,
                      userSelect: 'none',
                    }}
                  >
                    <img
                      src={field.imageData}
                      alt="Logo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-textMuted mt-2 text-center">
              💡 Click a field to select, then drag it anywhere on the certificate
            </p>
          </div>

          {/* Right Panel - Excel Mapping */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary p-6 space-y-4">
              <h2 className="text-lg font-semibold text-heading">Excel Data</h2>
              
              <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-6 text-center cursor-pointer transition hover:border-accent hover:bg-secondary">
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
                <FileSpreadsheet className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-textPrimary">Upload Excel</p>
                  <p className="text-xs text-textMuted">.xlsx, .xls, .csv</p>
                </div>
              </label>

              {excelData && (
                <div className="space-y-2">
                  <p className="text-sm text-primary">
                    ✓ {excelData.length} rows loaded
                  </p>
                </div>
              )}

              {excelColumns.length > 0 && textFields.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-heading">Field Mapping</h3>
                  <p className="text-xs text-textMuted">
                    Map each field to an Excel column
                  </p>
                  
                  {textFields.map((field) => (
                    <div key={field.fieldKey} className="space-y-1">
                      <label className="text-xs text-textMuted">
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
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary focus:border-primary"
                      >
                        <option value="">-- Select Column --</option>
                        {excelColumns.map((col) => (
                          <option key={col} value={col} className="bg-charcoal">
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
                  disabled={isGenerating}
                  className="w-full rounded-lg border border-primary bg-primary px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-charcoal border-t-transparent rounded-full" />
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

        {/* Image Handler Component */}
        <ImageHandler onImageAdd={(imageData) => console.log('Image added:', imageData)} />
      </div>
    </div>
  );
};

export default VisualCertificateEditor;

