import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// On Vercel the filesystem is read-only/ephemeral, so images are returned as
// data URLs (stored straight in the DB). Locally they are written to /uploads.
const isServerless = Boolean(process.env.VERCEL);

const uploadDir = path.resolve(process.cwd(), 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

function storeImage(buffer, mimetype, originalname) {
  if (isServerless) {
    return {
      url: `data:${mimetype};base64,${buffer.toString('base64')}`,
      filename: null
    };
  }

  ensureUploadDir();
  const extFromName = path.extname(originalname || '').toLowerCase();
  const extFromMime = `.${(mimetype.split('/')[1] || 'png').replace('jpeg', 'jpg')}`;
  const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
  const ext = allowed.includes(extFromName) ? extFromName : (allowed.includes(extFromMime) ? extFromMime : '.png');
  const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return { url: `/uploads/${filename}`, filename };
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.toLowerCase().startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// POST /api/upload - Multipart file upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const { url, filename } = storeImage(req.file.buffer, req.file.mimetype, req.file.originalname);
    const fullUrl = url.startsWith('data:') ? url : `${req.protocol}://${req.get('host')}${url}`;

    res.json({
      message: 'Image uploaded successfully',
      url,
      fullUrl,
      filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload.' });
  }
});

// POST /api/upload/base64 - Base64 data URL upload support
router.post('/base64', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Base64 image string is required.' });
    }

    // Match data:image/png;base64,....
    const matches = image.match(/^data:([A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid Base64 image data URL format.' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const { url, filename: storedName } = storeImage(buffer, mimeType, filename || '');
    const fullUrl = url.startsWith('data:') ? url : `${req.protocol}://${req.get('host')}${url}`;

    res.json({
      message: 'Image uploaded successfully',
      url,
      fullUrl,
      filename: storedName
    });
  } catch (err) {
    console.error('Base64 upload error:', err);
    res.status(500).json({ error: 'Failed to process base64 image.' });
  }
});

export default router;
