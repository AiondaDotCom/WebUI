import { EventEmitter } from './EventEmitter.js';

/**
 * Internationalization (i18n) System for Aionda WebUI
 * Provides localization support for all components
 */
export class I18n extends EventEmitter {
  static instance = null;
  
  constructor(config = {}) {
    super();
    
    if (I18n.instance) {
      return I18n.instance;
    }
    
    this.locale = config.locale || this.detectLocale();
    this.fallbackLocale = config.fallbackLocale || 'en';
    this.translations = new Map();
    this.pluralRules = new Map();
    
    // Load default translations
    this.loadDefaults();
    
    I18n.instance = this;
  }
  
  static getInstance(config = {}) {
    if (!I18n.instance) {
      I18n.instance = new I18n(config);
    }
    return I18n.instance;
  }
  
  detectLocale() {
    // Detect from browser
    if (typeof window !== 'undefined' && window.navigator) {
      return window.navigator.language || window.navigator.userLanguage || 'en';
    }
    return 'en';
  }
  
  loadDefaults() {
    // English (base language)
    this.addTranslations('en', {
      // Common UI
      'common.ok': 'OK',
      'common.cancel': 'Cancel',
      'common.close': 'Close',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.remove': 'Remove',
      'common.search': 'Search',
      'common.loading': 'Loading...',
      'common.today': 'Today',
      'common.clear': 'Clear',
      'common.apply': 'Apply',
      'common.reset': 'Reset',
      
      // Grid component
      'grid.columns': 'Columns',
      'grid.of': 'of',
      'grid.columnsVisible': 'columns visible',
      'grid.rowNumber': '#',
      'grid.noData': 'No data to display',
      'grid.matches': 'matches',
      'grid.showHideColumns': 'Show/Hide Columns',
      'grid.showAll': 'Show All',
      'grid.hideAll': 'Hide All',
      'grid.saveConfig': 'Save Config',
      'grid.hideColumn': 'Hide Column',
      'grid.showColumn': 'Show Column',
      'grid.showAllColumns': 'Show All Columns',
      'grid.hideAllOtherColumns': 'Hide All Other Columns',
      'grid.columnSettings': 'Column Settings...',
      'grid.filter.number.placeholder': 'e.g. >1000, <5000',
      'grid.filter.date.placeholder': 'e.g. 2024, Jan',
      'grid.filter.boolean.placeholder': 'true/false',
      'grid.filter.search.placeholder': 'Search {field}...',
      
      // Form validation
      'validation.required': 'This field is required',
      'validation.email': 'Please enter a valid email address',
      'validation.url': 'Please enter a valid URL',
      'validation.number': 'Please enter a valid number',
      'validation.date': 'Please enter a valid date',
      'validation.minLength': 'Minimum length is {min} characters',
      'validation.maxLength': 'Maximum length is {max} characters',
      'validation.minValue': 'Value must be at least {min}',
      'validation.maxValue': 'Value must be at most {max}',
      'validation.negative': 'Negative values are not allowed',
      'validation.decimal': 'Decimal values are not allowed',
      'validation.format': 'Invalid format',
      'validation.dateRequired': 'Date is required',
      'validation.dateFormat': 'Invalid date format',
      'validation.dateMin': 'Date must be on or after minimum date',
      'validation.dateMax': 'Date must be on or before maximum date',
      'validation.checkboxRequired': 'This field must be checked',
      'validation.radioRequired': 'This field is required',
      
      // ComboBox
      'combobox.noItems': 'No items to display',
      
      // MessageBox
      'messagebox.enterValue': 'Enter value...',
      
      // Date picker
      'date.months': [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      'date.monthsShort': [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      'date.days': [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ],
      'date.daysShort': [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
      ],
      'date.daysMin': [
        'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
      ],
      
      // Window controls
      'window.close': 'Close',
      'window.maximize': 'Maximize',
      'window.minimize': 'Minimize',
      'window.restore': 'Restore',
      
      // Accessibility
      'aria.closeButton': 'Close',
      'aria.menuButton': 'Menu',
      'aria.loading': 'Loading',
      'aria.sortAscending': 'Sort ascending',
      'aria.sortDescending': 'Sort descending',
      'aria.expandRow': 'Expand row',
      'aria.collapseRow': 'Collapse row'
    });
    
    // Add plural rules for English
    this.addPluralRule('en', (n) => n === 1 ? 'one' : 'other');
  }
  
  addTranslations(locale, translations) {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map());
    }
    
    const localeMap = this.translations.get(locale);
    
    // Handle nested objects
    const flattenObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          flattenObject(value, fullKey);
        } else {
          localeMap.set(fullKey, value);
        }
      });
    };
    
    flattenObject(translations);
    this.emit('translationsAdded', { locale, translations });
  }
  
  addPluralRule(locale, rule) {
    this.pluralRules.set(locale, rule);
  }
  
  setLocale(locale) {
    const oldLocale = this.locale;
    this.locale = locale;
    this.emit('localeChanged', { oldLocale, newLocale: locale });
    return this;
  }
  
  getLocale() {
    return this.locale;
  }
  
  t(key, params = {}, options = {}) {
    const locale = options.locale || this.locale;
    const count = params.count;
    
    // Handle pluralization
    let actualKey = key;
    if (typeof count === 'number' && this.pluralRules.has(locale)) {
      const pluralForm = this.pluralRules.get(locale)(count);
      const pluralKey = `${key}.${pluralForm}`;
      
      if (this.hasTranslation(pluralKey, locale)) {
        actualKey = pluralKey;
      }
    }
    
    // Get translation
    let translation = this.getTranslation(actualKey, locale);
    
    // Fallback to fallback locale
    if (translation === null && locale !== this.fallbackLocale) {
      translation = this.getTranslation(actualKey, this.fallbackLocale);
    }
    
    // Fallback to key if no translation found
    if (translation === null) {
      translation = key;
    }
    
    // Parameter substitution
    if (params && typeof translation === 'string') {
      translation = this.interpolate(translation, params);
    }
    
    return translation;
  }
  
  getTranslation(key, locale) {
    const localeMap = this.translations.get(locale);
    if (!localeMap) return null;
    
    return localeMap.get(key) || null;
  }
  
  hasTranslation(key, locale = this.locale) {
    const localeMap = this.translations.get(locale);
    return localeMap ? localeMap.has(key) : false;
  }
  
  interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params.hasOwnProperty(key) ? params[key] : match;
    });
  }
  
  // Convenience methods for common pluralization patterns
  plural(key, count, params = {}) {
    return this.t(key, { ...params, count });
  }
  
  // Format date according to locale
  formatDate(date, options = {}) {
    if (!(date instanceof Date)) return '';
    
    try {
      return new Intl.DateTimeFormat(this.locale, options).format(date);
    } catch (e) {
      // Fallback for older browsers
      return date.toLocaleDateString();
    }
  }
  
  // Format number according to locale
  formatNumber(number, options = {}) {
    if (typeof number !== 'number') return '';
    
    try {
      return new Intl.NumberFormat(this.locale, options).format(number);
    } catch (e) {
      // Fallback for older browsers
      return number.toString();
    }
  }
  
  // Get localized month names
  getMonthNames(format = 'long') {
    const key = format === 'short' ? 'date.monthsShort' : 'date.months';
    return this.t(key) || [];
  }
  
  // Get localized day names
  getDayNames(format = 'long') {
    let key;
    switch (format) {
      case 'short': key = 'date.daysShort'; break;
      case 'min': key = 'date.daysMin'; break;
      default: key = 'date.days'; break;
    }
    return this.t(key) || [];
  }
  
  // Currency formatting
  formatCurrency(amount, currency = 'USD', options = {}) {
    if (typeof amount !== 'number') return '';
    
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency,
        ...options
      }).format(amount);
    } catch (e) {
      return `${currency} ${amount}`;
    }
  }
  
  // Get available locales
  getAvailableLocales() {
    return Array.from(this.translations.keys());
  }
  
  // Export translations for external tools
  exportTranslations(locale = this.locale) {
    const localeMap = this.translations.get(locale);
    if (!localeMap) return {};
    
    const result = {};
    localeMap.forEach((value, key) => {
      this.setNestedProperty(result, key, value);
    });
    
    return result;
  }
  
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// Global instance
export const i18n = I18n.getInstance();

// Convenience function for translations
export const t = (key, params, options) => i18n.t(key, params, options);