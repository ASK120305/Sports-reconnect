import express from 'express';
import archiver from 'archiver';
import { generateCertificatesZipStream } from '../services/certificate-service.js';

const router = express.Router();

router.post('/generate-bulk', async (req, res) => {
  try {
    const { templateId, records, customization } = req.body || {};

    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records array is required and must not be empty' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="certificates.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create ZIP archive' });
      } else {
        res.end();
      }
    });

    archive.pipe(res);

    await generateCertificatesZipStream({
      templateId,
      records,
      archive,
      customization: customization || null,
    });

    archive.finalize();
  } catch (error) {
    console.error('Bulk certificate generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate certificates' });
    } else {
      res.end();
    }
  }
});

export default router;

