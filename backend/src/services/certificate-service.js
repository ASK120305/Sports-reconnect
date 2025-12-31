import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { normalizeColumnKeys } from '../utils/normalizeColumnKeys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

function mapRowToPlaceholders(row) {
  const normalizedRow = normalizeColumnKeys(row);
  const get = (...keys) => {
    for (const key of keys) {
      if (normalizedRow[key] != null && normalizedRow[key] !== '') return normalizedRow[key];
    }
    return '';
  };

  const placeholders = {
    NAME: get('NAME', 'Name', 'Full Name', 'FullName', 'name', 'full name', 'fullname', 'Participant Name', 'Student Name', 'Recipient'),
    COURSE: get('COURSE', 'Course', 'Program', 'course', 'program', 'Event', 'event', 'Sport', 'sport'),
    DATE: get('DATE', 'Date', 'Completion Date', 'date', 'completion date', 'Issue Date', 'issue date'),
    CERT_ID: get('CERT_ID', 'Certificate ID', 'Cert ID', 'ID', 'cert_id', 'id', 'CertID'),
  };

  console.log('🔄 Mapping row:', row);
  console.log('📝 Extracted placeholders:', placeholders);

  return placeholders;
}

function applyTemplatePlaceholders(templateHtml, placeholders) {
  let result = templateHtml;
  Object.entries(placeholders).forEach(([key, value]) => {
    const safeValue = value == null ? '' : String(value);
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(pattern, safeValue);
  });
  return result;
}

function applyCustomizations(templateHtml, customization) {
  if (!customization) return templateHtml;

  let result = templateHtml;

  // Inject CSS variables for colors
  const cssVariables = `
    :root {
      --primary-color: ${customization.primaryColor || '#d4af37'};
      --accent-color: ${customization.accentColor || '#1a1a1a'};
      --background-color: ${customization.backgroundColor || '#ffffff'};
    }
  `;

  // Add CSS variables after <style> tag or in head
  if (result.includes('<style>')) {
    result = result.replace('<style>', `<style>${cssVariables}`);
  } else if (result.includes('</head>')) {
    result = result.replace('</head>', `<style>${cssVariables}</style></head>`);
  }

  // Apply font family
  if (customization.fontFamily) {
    // Add Google Fonts import if not already present
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(customization.fontFamily)}:wght@400;700&display=swap`;
    
    // Check if there's already a Google Fonts link
    if (!result.includes('fonts.googleapis.com')) {
      // Insert before </head> or after existing @import
      if (result.includes('</head>')) {
        result = result.replace('</head>', `<link href="${fontUrl}" rel="stylesheet"></head>`);
      } else if (result.includes('</style>')) {
        result = result.replace('</style>', `</style><link href="${fontUrl}" rel="stylesheet">`);
      }
    }
    
    // Apply font to all text elements using CSS variable
    const fontCss = `
      * {
        font-family: '${customization.fontFamily}', sans-serif !important;
      }
    `;
    
    if (result.includes('</style>')) {
      result = result.replace('</style>', `${fontCss}</style>`);
    }
  }

  // Inject logo if provided
  if (customization.logo) {
    // Replace or add logo placeholder
    const logoHtml = `<div style="text-align: center; margin-bottom: 20px;"><img src="${customization.logo}" alt="Logo" style="max-width: 150px; max-height: 80px; object-fit: contain;" /></div>`;
    
    // Try to find common logo placeholder patterns
    if (result.includes('{{LOGO}}')) {
      result = result.replace(/\{\{LOGO\}\}/g, logoHtml);
    } else if (result.includes('academy-name') || result.includes('academyName')) {
      // Insert logo before academy name paragraph
      result = result.replace(
        /(<p[^>]*class="academy-name"[^>]*>)/i,
        `${logoHtml}$1`
      );
    } else if (result.includes('inner-content')) {
      // Insert at the beginning of inner-content
      result = result.replace(
        /(<div[^>]*class="inner-content"[^>]*>)/i,
        `$1${logoHtml}`
      );
    } else {
      // Fallback: insert after opening body or in a safe location
      result = result.replace(
        /(<body[^>]*>)/i,
        `$1${logoHtml}`
      );
    }
  } else {
    // Remove logo placeholder if no logo provided
    result = result.replace(/\{\{LOGO\}\}/g, '');
  }

  // Replace custom text fields (except DESCRIPTION which needs dynamic data)
  const textReplacements = {
    '{{ACADEMY_NAME}}': customization.academyName || 'SPORTS RECONNECT ACADEMY',
    '{{MAIN_TITLE}}': customization.mainTitle || 'CERTIFICATE',
    '{{SUB_TITLE}}': customization.subTitle || 'OF ATHLETIC EXCELLENCE',
    '{{CONFERRED_TEXT}}': customization.conferredText || 'This esteemed honor is conferred upon',
    '{{SIGNATURE_NAME}}': customization.signatureName || 'Director',
  };

  Object.entries(textReplacements).forEach(([placeholder, value]) => {
    const pattern = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    result = result.replace(pattern, value);
  });

  // Handle description separately - it will be replaced per record with dynamic data
  if (customization.description) {
    // Keep the placeholder for now, will be replaced per record
    // The description template is stored in customization.description
  } else {
    // Default description if none provided
    result = result.replace(
      /\{\{DESCRIPTION\}\}/g,
      'For successfully completing the rigorous <strong>{{COURSE}}</strong> program, showcasing outstanding skill, unwavering dedication, and exemplary sportsmanship. Awarded on this day, <strong>{{DATE}}</strong>, in recognition of their commitment to greatness.'
    );
  }

  // Apply color variables to specific elements
  result = result.replace(
    /color:\s*#d4af37/g,
    'color: var(--primary-color, #d4af37)'
  );
  result = result.replace(
    /border:\s*3px solid #d4af37/g,
    'border: 3px solid var(--primary-color, #d4af37)'
  );
  result = result.replace(
    /background:\s*radial-gradient\([^)]*#d4af37[^)]*\)/g,
    (match) => match.replace(/#d4af37/g, 'var(--primary-color, #d4af37)')
  );
  result = result.replace(
    /color:\s*#1a1a1a/g,
    'color: var(--accent-color, #1a1a1a)'
  );
  result = result.replace(
    /background:\s*white/g,
    'background: var(--background-color, white)'
  );
  result = result.replace(
    /background:\s*#ffffff/g,
    'background: var(--background-color, #ffffff)'
  );

  return result;
}

async function loadTemplateHtml(templateId) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.html`);
  return fs.readFile(templatePath, 'utf8');
}

function sanitizeFileName(value, fallback = 'certificate') {
  const base = (value || fallback).toString().trim() || fallback;
  return base.replace(/[^a-z0-9_\-]+/gi, '_').slice(0, 80);
}

export async function generateCertificatesZipStream({ templateId, records, archive, customization }) {
  let templateHtml = await loadTemplateHtml(templateId);

  // Apply customizations to template
  templateHtml = applyCustomizations(templateHtml, customization);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    for (let index = 0; index < records.length; index += 1) {
      const row = records[index];
      const placeholders = mapRowToPlaceholders(row);
      let filledHtml = applyTemplatePlaceholders(templateHtml, placeholders);
      
      // Apply description with dynamic placeholders
      if (customization?.description) {
        let description = customization.description;
        description = description.replace(/\{\{COURSE\}\}/g, placeholders.COURSE || '');
        description = description.replace(/\{\{DATE\}\}/g, placeholders.DATE || '');
        description = description.replace(/\{\{NAME\}\}/g, placeholders.NAME || '');
        filledHtml = filledHtml.replace(/\{\{DESCRIPTION\}\}/g, description);
      } else {
        // Use default description with placeholders
        filledHtml = filledHtml.replace(
          /\{\{DESCRIPTION\}\}/g,
          `For successfully completing the rigorous <strong>${placeholders.COURSE || ''}</strong> program, showcasing outstanding skill, unwavering dedication, and exemplary sportsmanship. Awarded on this day, <strong>${placeholders.DATE || ''}</strong>, in recognition of their commitment to greatness.`
        );
      }

      await page.setContent(filledHtml, {
        waitUntil: 'networkidle0',
      });
      
      // Wait a bit for fonts and images to load
      await page.waitForTimeout(500);

      const pdfRaw = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });

      const namePart = sanitizeFileName(placeholders.NAME, `recipient_${index + 1}`);
      const fileName = `${String(index + 1).padStart(3, '0')}_${namePart}.pdf`;

      const pdfBuffer =
        pdfRaw instanceof Buffer
          ? pdfRaw
          : Buffer.from(pdfRaw instanceof ArrayBuffer ? new Uint8Array(pdfRaw) : pdfRaw);

      archive.append(pdfBuffer, { name: fileName });
    }
  } finally {
    await browser.close();
  }
}

