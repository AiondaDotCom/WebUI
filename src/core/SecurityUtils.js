/**
 * Security Utilities - Pure ES6
 * Provides XSS protection and input sanitization for all components
 */

export class SecurityUtils {
  /**
   * Escape HTML entities to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  static escapeHtml(text) {
    if (text == null || text === '') return '';
    
    // Use textContent to escape HTML entities safely
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Sanitize HTML content by removing dangerous elements and attributes
   * @param {string} html - HTML to sanitize
   * @returns {string} - Sanitized HTML
   */
  static sanitizeHtml(html) {
    if (html == null || html === '') return '';
    
    // Create a temporary container
    const temp = document.createElement('div');
    temp.innerHTML = String(html);
    
    // Remove all script tags and event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove dangerous attributes from all elements
    const dangerousAttrs = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
      'onkeydown', 'onkeyup', 'onkeypress', 'onsubmit', 'onchange',
      'javascript:', 'vbscript:', 'data:', 'about:'
    ];
    
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
      // Remove dangerous attributes
      dangerousAttrs.forEach(attr => {
        element.removeAttribute(attr);
      });
      
      // Check href and src attributes for dangerous protocols
      ['href', 'src'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value) {
          const lowerValue = value.toLowerCase().trim();
          if (lowerValue.startsWith('javascript:') || 
              lowerValue.startsWith('vbscript:') ||
              lowerValue.startsWith('data:') ||
              lowerValue.startsWith('about:')) {
            element.removeAttribute(attr);
          }
        }
      });
    });
    
    return temp.innerHTML;
  }

  /**
   * Validate and sanitize user input
   * @param {any} value - Value to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized value
   */
  static sanitizeInput(value, options = {}) {
    if (value == null) return '';
    
    let sanitized = String(value);
    
    // Trim whitespace if enabled
    if (options.trim !== false) {
      sanitized = sanitized.trim();
    }
    
    // Limit length if specified
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    // Remove or escape HTML if specified
    if (options.escapeHtml !== false) {
      sanitized = this.escapeHtml(sanitized);
    }
    
    // Apply custom filter if provided
    if (options.filter && typeof options.filter === 'function') {
      sanitized = options.filter(sanitized);
    }
    
    return sanitized;
  }

  /**
   * Create a safe DOM element with escaped content
   * @param {string} tagName - Tag name for the element
   * @param {Object} attributes - Attributes to set (will be escaped)
   * @param {string} textContent - Text content (will be escaped)
   * @returns {HTMLElement} - Safe DOM element
   */
  static createSafeElement(tagName, attributes = {}, textContent = '') {
    const element = document.createElement(tagName);
    
    // Set attributes safely
    Object.entries(attributes).forEach(([key, value]) => {
      if (value != null) {
        // Escape attribute values
        element.setAttribute(key, this.escapeHtml(String(value)));
      }
    });
    
    // Set text content safely
    if (textContent) {
      element.textContent = String(textContent);
    }
    
    return element;
  }

  /**
   * Validate that a string contains only safe characters for use in templates
   * @param {string} value - Value to validate
   * @returns {boolean} - True if safe
   */
  static isSafeForTemplate(value) {
    if (value == null) return true;
    
    const str = String(value);
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Create a Content Security Policy (CSP) nonce for inline styles/scripts
   * @returns {string} - Random nonce value
   */
  static generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate URL to prevent open redirect attacks
   * @param {string} url - URL to validate
   * @returns {boolean} - True if URL is safe
   */
  static isSafeUrl(url) {
    if (!url) return true;
    
    try {
      const parsedUrl = new URL(url, window.location.origin);
      
      // Allow only http, https, and relative URLs
      const allowedProtocols = ['http:', 'https:', ''];
      
      return allowedProtocols.includes(parsedUrl.protocol);
    } catch {
      // If URL parsing fails, it's potentially unsafe
      return false;
    }
  }

  /**
   * Validate and sanitize CSS values to prevent CSS injection
   * @param {string} cssValue - CSS value to validate
   * @returns {string} - Sanitized CSS value or empty string if unsafe
   */
  static sanitizeCssValue(cssValue) {
    if (!cssValue) return '';
    
    const str = String(cssValue);
    
    // Block dangerous CSS patterns
    const dangerousPatterns = [
      /expression\s*\(/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /url\s*\(\s*['"]*javascript:/gi,
      /url\s*\(\s*['"]*data:/gi,
      /url\s*\(\s*['"]*vbscript:/gi,
      /@import/gi,
      /binding\s*:/gi
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(str))) {
      return '';
    }
    
    return str;
  }

  /**
   * Rate limiting for security-sensitive operations
   * @param {string} key - Unique key for the operation
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if operation is allowed
   */
  static isRateLimited(key, maxAttempts = 10, windowMs = 60000) {
    const now = Date.now();
    const rateLimitKey = `rateLimit_${key}`;
    
    try {
      const stored = sessionStorage.getItem(rateLimitKey);
      const data = stored ? JSON.parse(stored) : { attempts: 0, resetTime: now + windowMs };
      
      // Reset if window has expired
      if (now > data.resetTime) {
        data.attempts = 0;
        data.resetTime = now + windowMs;
      }
      
      // Check if limit exceeded
      if (data.attempts >= maxAttempts) {
        return true;
      }
      
      // Increment attempts
      data.attempts++;
      sessionStorage.setItem(rateLimitKey, JSON.stringify(data));
      
      return false;
    } catch {
      // If sessionStorage fails, allow the operation
      return false;
    }
  }
}