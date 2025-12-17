const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/config');

class UploadService {
  constructor() {
    this.uploadDir = config.upload.path;
    this.ensureDirectories();
  }
  
  // Ensure upload directories exist
  ensureDirectories() {
    const directories = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'book-covers'),
      path.join(this.uploadDir, 'book-files'),
      path.join(this.uploadDir, 'chapter-files'),
      path.join(this.uploadDir, 'temporary')
    ];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  // Generate unique filename
  generateFilename(originalname, prefix = '') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalname).toLowerCase();
    const name = path.basename(originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    
    return `${prefix}${timestamp}-${random}-${name}${ext}`;
  }
  
  // Configure storage based on file type
  getStorage(fieldname) {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        let folder = 'general';
        
        switch (fieldname) {
          case 'avatar':
            folder = 'avatars';
            break;
          case 'cover':
          case 'book_cover':
            folder = 'book-covers';
            break;
          case 'file':
          case 'book_file':
            folder = 'book-files';
            break;
          case 'chapter_file':
            folder = 'chapter-files';
            break;
          default:
            folder = 'temporary';
        }
        
        const dir = path.join(this.uploadDir, folder);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
      },
      
      filename: (req, file, cb) => {
        const prefix = fieldname === 'avatar' ? 'avatar-' : 
                      fieldname === 'cover' ? 'cover-' :
                      fieldname === 'file' ? 'file-' : '';
        
        const filename = this.generateFilename(file.originalname, prefix);
        cb(null, filename);
      }
    });
  }
  
  // File filter
  fileFilter(allowedTypes) {
    return (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
      }
    };
  }
  
  // Get upload configuration for specific file type
  getUploadConfig(fieldname, allowedTypes, maxSize = 5 * 1024 * 1024) {
    return {
      storage: this.getStorage(fieldname),
      limits: {
        fileSize: maxSize
      },
      fileFilter: this.fileFilter(allowedTypes)
    };
  }
  
  // Single file upload
  single(fieldname, allowedTypes = config.upload.allowedImageTypes, maxSize = config.upload.maxFileSize) {
    const upload = multer(this.getUploadConfig(fieldname, allowedTypes, maxSize));
    return upload.single(fieldname);
  }
  
  // Multiple files upload
  array(fieldname, maxCount = 5, allowedTypes = config.upload.allowedImageTypes, maxSize = config.upload.maxFileSize) {
    const upload = multer(this.getUploadConfig(fieldname, allowedTypes, maxSize));
    return upload.array(fieldname, maxCount);
  }
  
  // Fields upload
  fields(fields) {
    const configs = fields.map(field => ({
      name: field.name,
      maxCount: field.maxCount || 1
    }));
    
    const upload = multer({
      storage: this.getStorage('mixed'),
      limits: {
        fileSize: config.upload.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        const fieldConfig = fields.find(f => f.name === file.fieldname);
        if (fieldConfig && fieldConfig.allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type not allowed for ${file.fieldname}`), false);
        }
      }
    });
    
    return upload.fields(configs);
  }
  
  // Avatar upload
  avatar() {
    return this.single('avatar', config.upload.allowedImageTypes, 2 * 1024 * 1024);
  }
  
  // Book cover upload
  bookCover() {
    return this.single('cover', config.upload.allowedImageTypes, 2 * 1024 * 1024);
  }
  
  // Book file upload (PDF, EPUB)
  bookFile() {
    return this.single('file', config.upload.allowedFileTypes, 50 * 1024 * 1024); // 50MB for book files
  }
  
  // Chapter file upload
  chapterFile() {
    return this.single('chapter_file', ['text/plain', 'application/pdf'], 10 * 1024 * 1024); // 10MB
  }
  
  // Multiple images upload
  multipleImages(maxCount = 5) {
    return this.array('images', maxCount, config.upload.allowedImageTypes, 5 * 1024 * 1024);
  }
  
  // Delete file
  deleteFile(filepath) {
    return new Promise((resolve, reject) => {
      if (!filepath || !filepath.startsWith(this.uploadDir)) {
        return resolve(false);
      }
      
      fs.unlink(filepath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(false); // File doesn't exist
          } else {
            reject(err);
          }
        } else {
          resolve(true);
        }
      });
    });
  }
  
  // Delete file by URL
  deleteFileByUrl(url) {
    if (!url || !url.includes('/uploads/')) {
      return Promise.resolve(false);
    }
    
    const filename = url.split('/uploads/')[1];
    const filepath = path.join(this.uploadDir, filename);
    
    return this.deleteFile(filepath);
  }
  
  // Get file info
  getFileInfo(file) {
    if (!file) return null;
    
    const ext = path.extname(file.originalname).toLowerCase();
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    
    return {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      sizeMB: parseFloat(sizeInMB),
      mimetype: file.mimetype,
      extension: ext,
      encoding: file.encoding
    };
  }
  
  // Validate file
  validateFile(file, allowedTypes, maxSize) {
    const errors = [];
    
    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      errors.push(`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`);
    }
    
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedTypes.map(type => {
      if (type === 'image/jpeg') return '.jpg';
      if (type === 'image/png') return '.png';
      if (type === 'image/gif') return '.gif';
      if (type === 'image/webp') return '.webp';
      if (type === 'application/pdf') return '.pdf';
      if (type === 'application/epub+zip') return '.epub';
      return '';
    }).filter(ext => ext);
    
    if (!allowedExtensions.includes(ext)) {
      errors.push(`File extension ${ext} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Compress image (placeholder for future implementation)
  async compressImage(filepath, options = {}) {
    // This would integrate with sharp or similar library
    // For now, return the original filepath
    return filepath;
  }
  
  // Generate thumbnail (placeholder)
  async generateThumbnail(filepath, size = { width: 200, height: 200 }) {
    // This would integrate with sharp or similar library
    return filepath;
  }
  
  // Get public URL
  getPublicUrl(filepath) {
    if (!filepath || !filepath.startsWith(this.uploadDir)) {
      return null;
    }
    
    const relativePath = path.relative(this.uploadDir, filepath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }
  
  // Get absolute path from public URL
  getAbsolutePath(publicUrl) {
    if (!publicUrl || !publicUrl.startsWith('/uploads/')) {
      return null;
    }
    
    const relativePath = publicUrl.replace('/uploads/', '');
    return path.join(this.uploadDir, relativePath);
  }
  
  // Clean up old temporary files
  cleanupTemporaryFiles(maxAgeHours = 24) {
    const tempDir = path.join(this.uploadDir, 'temporary');
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error('Error reading temp directory:', err);
        return;
      }
      
      files.forEach(file => {
        const filepath = path.join(tempDir, file);
        fs.stat(filepath, (err, stats) => {
          if (err) return;
          
          if (stats.mtimeMs < cutoff) {
            fs.unlink(filepath, (err) => {
              if (!err) {
                console.log(`Cleaned up old temp file: ${file}`);
              }
            });
          }
        });
      });
    });
  }
}

// Export singleton instance
module.exports = new UploadService();