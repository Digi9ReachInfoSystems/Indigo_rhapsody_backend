const multer = require("multer");

// Define storage strategy (memory storage for CSV processing)
const storage = multer.memoryStorage();

// File filter to allow only CSV and Excel files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream" // For some CSV files
  ];

  const allowedExtensions = ['.csv', '.xlsx', '.xls'];

  // Check MIME type
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } 
  // Check file extension as fallback
  else if (allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
    cb(null, true);
  } 
  else {
    cb(
      new Error("Only .csv, .xlsx, and .xls formats are allowed!"),
      false
    );
  }
};

// Set limits on file size
const limits = {
  fileSize: 1024 * 1024 * 10, // 10MB limit for CSV files
};

// Configure Multer middleware for CSV uploads
const csvUpload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = csvUpload;
