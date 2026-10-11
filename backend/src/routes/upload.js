import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanExt = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext) ? ext : '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `img-${uniqueSuffix}${cleanExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMime.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// POST /api/upload - Multipart file upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${fileUrl}`;

    res.json({
      message: 'Image uploaded successfully',
      url: fileUrl,
      fullUrl,
      filename: req.file.filename,
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
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid Base64 image data URL format.' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const ext = mimeType.split('/')[1] || 'png';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const uniqueFilename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${cleanExt}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `/uploads/${uniqueFilename}`;
    const fullUrl = `${protocol}://${host}${fileUrl}`;

    res.json({
      message: 'Image uploaded successfully',
      url: fileUrl,
      fullUrl,
      filename: uniqueFilename
    });
  } catch (err) {
    console.error('Base64 upload error:', err);
    res.status(500).json({ error: 'Failed to process base64 image.' });
  }
});

export default router;
