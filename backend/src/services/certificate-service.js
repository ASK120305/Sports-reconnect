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

async function loadTemplateHtml(templateId) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.html`);
  return fs.readFile(templatePath, 'utf8');
}

function sanitizeFileName(value, fallback = 'certificate') {
  const base = (value || fallback).toString().trim() || fallback;
  return base.replace(/[^a-z0-9_\-]+/gi, '_').slice(0, 80);
}

export async function generateCertificatesZipStream({ templateId, records, archive }) {
  const templateHtml = await loadTemplateHtml(templateId);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    for (let index = 0; index < records.length; index += 1) {
      const row = records[index];
      const placeholders = mapRowToPlaceholders(row);
      const filledHtml = applyTemplatePlaceholders(templateHtml, placeholders);

      await page.setContent(filledHtml, {
        waitUntil: 'networkidle0',
      });

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

