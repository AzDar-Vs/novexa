const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class Helpers {
  // Generate random string
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  // Generate slug from text
  static generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  
  // Format currency (IDR)
  static formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  // Format date
  static formatDate(date, format = 'id-ID') {
    const d = new Date(date);
    return d.toLocaleDateString(format, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Format date time
  static formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Truncate text
  static truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // Generate avatar from name
  static generateAvatar(name) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
      '#118AB2', '#073B4C', '#7209B7', '#F72585',
      '#3A86FF', '#FB5607', '#8338EC', '#FF006E'
    ];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.replace('#', '')}&color=fff&size=128`;
  }
  
  // Validate email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validate password strength
  static validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Password minimal 6 karakter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password harus mengandung angka');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Generate JWT token
  static generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }
  
  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return null;
    }
  }
  
  // Hash password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  
  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  // Generate order ID
  static generateOrderId(prefix = 'TRX') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }
  
  // Calculate pagination
  static calculatePagination(totalItems, currentPage = 1, pageSize = 10) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    return {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }
  
  // Sanitize HTML
  static sanitizeHTML(html) {
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const allowedAttributes = {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    };
    
    // Simple sanitization - in production use a library like DOMPurify
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  // Extract text from HTML
  static extractTextFromHTML(html) {
    return html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }
  
  // Generate file name with timestamp
  static generateFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = originalName.split('.').pop();
    return `${timestamp}-${random}.${ext}`;
  }
  
  // Validate file type
  static isValidFileType(file, allowedTypes) {
    if (!file.mimetype) return false;
    return allowedTypes.includes(file.mimetype);
  }
  
  // Validate file size
  static isValidFileSize(file, maxSize) {
    return file.size <= maxSize;
  }
  
  // Get file extension
  static getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }
  
  // Calculate reading time (words per minute)
  static calculateReadingTime(text, wordsPerMinute = 200) {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  }
  
  // Generate excerpt from text
  static generateExcerpt(text, maxLength = 150) {
    const plainText = this.extractTextFromHTML(text);
    return this.truncateText(plainText, maxLength);
  }
  
  // Mask email for display
  static maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.substring(0, 2) + '***' + local.substring(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }
  
  // Generate rating stars HTML
  static generateRatingStars(rating, maxStars = 5) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="star full">★</span>';
    }
    
    // Half star
    if (halfStar) {
      stars += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="star empty">☆</span>';
    }
    
    return stars;
  }
  
  // Calculate discount percentage
  static calculateDiscount(originalPrice, discountedPrice) {
    if (originalPrice <= 0) return 0;
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
  }
  
  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

module.exports = Helpers;