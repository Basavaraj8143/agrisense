const multer = require("multer");

const { HttpError } = require("../utils/http-error");

const maxFileSizeBytes = Number(process.env.PEST_IMAGE_MAX_BYTES) || 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(
        new HttpError(422, "Validation failed", "VALIDATION_ERROR", [
          {
            field: "image",
            issue: "Image must be a JPEG, PNG, or WebP file",
          },
        ])
      );
    }

    return cb(null, true);
  },
});

function handlePestImageUpload(req, res, next) {
  return upload.single("image")(req, res, next);
}

module.exports = {
  handlePestImageUpload,
};
