const multer = require('multer');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Upload a JPEG, PNG, or WebP image.');
      error.code = 'INVALID_PROFILE_PHOTO_TYPE';
      return callback(error);
    }
    callback(null, true);
  },
});

const handleProfilePhotoUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Profile photos must be 5 MB or smaller.' });
  }
  if (error?.code === 'INVALID_PROFILE_PHOTO_TYPE') {
    return res.status(400).json({ message: error.message });
  }
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Unable to process this image upload.' });
  }
  return next(error);
};

module.exports = { uploadProfilePhotoFile: upload.single('photo'), handleProfilePhotoUploadError };
