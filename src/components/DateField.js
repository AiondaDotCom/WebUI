import { TextField } from './TextField.js';

/**
 * @component DateField
 * @extends Component
 * @description A date input field with calendar picker and date validation
 * @category Utility Components
 * @since 1.0.0
 * @example
 * // Date field with range validation
 * const dateField = new AiondaWebUI.DateField({
 *   fieldLabel: 'Birth Date',
 *   format: 'Y-m-d',
 *   minValue: '1900-01-01',
 *   maxValue: new Date(),
 *   required: true
 * });
 * dateField.renderTo('#container');
 */
export class DateField extends TextField {
    /**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {Date|string} [value] - Initial date value
   * @property {string} [format='Y-m-d'] - Date format string
   * @property {Date|string} [minValue] - Minimum allowed date
   * @property {Date|string} [maxValue] - Maximum allowed date
   * @property {boolean} [readOnly=false] - Whether field is read-only
   * @property {boolean} [required=false] - Whether field is required
   * @property {string} [emptyText] - Placeholder text
   * @property {Array} [disabledDays] - Array of disabled day numbers (0-6)
   * @property {Array} [disabledDates] - Array of disabled date strings
   */
  constructor(config = {}) {
    config = config || {};
    
    // Initialize format properties first
    const format = config.format || 'MM/dd/yyyy';
    const displayFormat = config.displayFormat || format;
    const altFormats = config.altFormats || ['M/d/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy'];
    const locale = config.locale || 'en-US';
    const editable = config.editable !== false;
    const disabled = config.disabled || false;
    
    // Parse initial value and format it for display
    let displayValue = config.value || '';
    let dateValue = null;
    
    if (config.value) {
      if (config.value instanceof Date) {
        dateValue = new Date(config.value);
        displayValue = DateField.formatDateStatic(dateValue, displayFormat, locale);
      } else {
        dateValue = DateField.parseInputStatic(config.value, format, altFormats);
        if (dateValue) {
          displayValue = DateField.formatDateStatic(dateValue, displayFormat, locale);
        }
      }
    }
    
    // Call parent constructor with formatted display value
    super({
      ...config,
      inputType: 'text',
      value: displayValue,
      disabled: disabled
    });
    
    // Set instance properties after super() call
    this.format = format;
    this.displayFormat = displayFormat;
    this.altFormats = altFormats;
    this.disabledDays = config.disabledDays || [];
    this.startOfWeek = config.startOfWeek || 0; // 0 = Sunday
    this.showToday = config.showToday !== false;
    this.todayText = config.todayText || 'Today';
    this.locale = locale;
    this.triggerAction = config.triggerAction || 'click';
    this.editable = editable;
    this.submitValue = config.submitValue || this.format;
    this.disabled = disabled;
    
    this.monthNames = config.monthNames || this.getMonthNames();
    this.dayNames = config.dayNames || this.getDayNames();
    this.dayNamesShort = config.dayNamesShort || this.getDayNamesShort();
    
    this.dateValue = dateValue;
    this.picker = null;
    this.pickerVisible = false;
    this.currentViewDate = new Date();
    
    this.originalInputType = this.inputType;
    
    this.readOnly = !this.editable;
    this.originalValue = config.value;
    
    // Store the original input for potential later use
    if (config.value) {
      this._originalInputValue = config.value;
      // Detect and store the original input format
      if (typeof config.value === 'string') {
        this._originalInputFormat = this.detectInputFormat(config.value) || this.format;
      } else {
        this._originalInputFormat = this.format;
      }
    }
    
    this.minDate = config.minDate ? this.parseDate(config.minDate) : null;
    this.maxDate = config.maxDate ? this.parseDate(config.maxDate) : null;
    
    // Store parentForm reference for later registration
    this.parentForm = config.parentForm;
    
    // Register with parent form immediately if provided
    if (this.parentForm && typeof this.parentForm.registerField === 'function') {
      this.parentForm.registerField(this);
    }
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const inputTemplate = this.createInputTemplate();
    const triggerTemplate = this.createTriggerTemplate();
    const errorTemplate = this.createErrorTemplate();
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-datefield-input-wrap relative">
          <div class="relative flex">
            ${inputTemplate}
            ${triggerTemplate}
          </div>
          ${errorTemplate}
          ${this.createPickerTemplate()}
        </div>
      </div>
    `;
  }

  createTriggerTemplate() {
    return `
      <button type="button" class="aionda-datefield-trigger datefield-picker-button absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-500 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </button>
    `;
  }

  createPickerTemplate() {
    return `
      <div class="aionda-datefield-picker datefield-picker absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 hidden" style="min-width: 280px;">
        <div class="aionda-datefield-header flex items-center justify-between p-3 border-b border-gray-200">
          <button type="button" class="aionda-datefield-prev-month picker-prev-month p-1 hover:bg-gray-100 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex items-center space-x-2">
            <select class="aionda-datefield-month-select text-sm border-0 bg-transparent font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded">
              ${this.monthNames.map((month, index) => 
                `<option value="${index}">${month}</option>`
              ).join('')}
            </select>
            <select class="aionda-datefield-year-select text-sm border-0 bg-transparent font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded">
              ${this.generateYearOptions()}
            </select>
          </div>
          <button type="button" class="aionda-datefield-next-month picker-next-month p-1 hover:bg-gray-100 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="aionda-datefield-calendar p-3">
          <div class="aionda-datefield-day-headers grid grid-cols-7 gap-1 mb-2">
            ${this.dayNamesShort.map(day => 
              `<div class="text-xs font-medium text-gray-500 text-center p-1">${day}</div>`
            ).join('')}
          </div>
          <div class="aionda-datefield-days grid grid-cols-7 gap-1">
            <!-- Days will be populated by JavaScript -->
          </div>
        </div>
        ${this.showToday ? this.createTodayButtonTemplate() : ''}
      </div>
    `;
  }

  createTodayButtonTemplate() {
    return `
      <div class="aionda-datefield-footer border-t border-gray-200 p-3">
        <button type="button" class="aionda-datefield-today w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors">
          ${this.todayText}
        </button>
      </div>
    `;
  }

  getBaseClasses() {
    return [
      ...super.getBaseClasses(),
      'aionda-datefield'
    ];
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    // Parent form registration is handled in constructor
    
    this.triggerEl = this.el.querySelector('.datefield-picker-button');
    this.picker = this.el.querySelector('.datefield-picker');
    this.monthSelect = this.el.querySelector('.aionda-datefield-month-select');
    this.yearSelect = this.el.querySelector('.aionda-datefield-year-select');
    this.prevMonthBtn = this.el.querySelector('.picker-prev-month');
    this.nextMonthBtn = this.el.querySelector('.picker-next-month');
    this.daysContainer = this.el.querySelector('.aionda-datefield-days');
    this.todayBtn = this.el.querySelector('.aionda-datefield-today');
    
    // Add focus and blur event listeners
    if (this.inputEl) {
      this.inputEl.addEventListener('focus', (event) => {
        this.emit('focus', { field: this, event });
      });
      
      this.inputEl.addEventListener('blur', (event) => {
        this.emit('blur', { field: this, event });
      });
    }
    
    if (this.triggerEl) {
      this.triggerEl.disabled = this.disabled;
      this.triggerEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePicker();
      });
    }
    
    if (this.inputEl && this.triggerAction === 'click') {
      this.inputEl.addEventListener('click', () => this.showPicker());
    }
    
    if (this.monthSelect) {
      this.monthSelect.addEventListener('change', () => this.onMonthYearChange());
    }
    
    if (this.yearSelect) {
      this.yearSelect.addEventListener('change', () => this.onMonthYearChange());
    }
    
    if (this.prevMonthBtn) {
      this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
    }
    
    if (this.nextMonthBtn) {
      this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
    }
    
    if (this.todayBtn) {
      this.todayBtn.addEventListener('click', () => this.selectToday());
    }
    
    document.addEventListener('click', (e) => this.onDocumentClick(e));
    
    if (this.editable && this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => this.onDateKeyDown(e));
    }
    
    // Also listen for keydown events on the picker for navigation
    if (this.picker) {
      this.picker.addEventListener('keydown', (e) => this.onDateKeyDown(e));
    }
    
    // Listen for escape key on document to hide picker
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.pickerVisible) {
        e.preventDefault();
        this.hidePicker();
      }
    });
    
    this.updateCalendar();
  }

  setupPickerEvents() {
    // Query picker elements after picker is created
    this.monthSelect = this.el.querySelector('.aionda-datefield-month-select');
    this.yearSelect = this.el.querySelector('.aionda-datefield-year-select');
    this.prevMonthBtn = this.el.querySelector('.picker-prev-month');
    this.nextMonthBtn = this.el.querySelector('.picker-next-month');
    this.daysContainer = this.el.querySelector('.aionda-datefield-days');
    this.todayBtn = this.el.querySelector('.aionda-datefield-today');

    if (this.monthSelect) {
      this.monthSelect.addEventListener('change', () => this.onMonthYearChange());
    }

    if (this.yearSelect) {
      this.yearSelect.addEventListener('change', () => this.onMonthYearChange());
    }

    if (this.prevMonthBtn) {
      this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
    }

    if (this.nextMonthBtn) {
      this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
    }

    if (this.todayBtn) {
      this.todayBtn.addEventListener('click', () => this.selectToday());
    }

    if (this.picker) {
      this.picker.addEventListener('keydown', (e) => this.onDateKeyDown(e));
    }
  }

  onInput(event) {
    if (this.editable) {
      const value = event.target.value;
      const date = this.parseInput(value);
      
      if (date) {
        this.dateValue = date;
        this.currentViewDate = new Date(date);
        this.updateCalendar();
      } else {
        // Clear date value if input doesn't parse to valid date
        this.dateValue = null;
      }
      
      super.onInput(event);
      this.emit('input', { value, event });
    }
  }

  onDateKeyDown(event) {
    if (!this.editable) return;
    
    const { key } = event;
    
    // Handle special keys for showing picker
    if ((key === 'ArrowDown' || key === 'F4' || key === 'Enter' || key === ' ') && !this.pickerVisible) {
      event.preventDefault();
      this.showPicker();
      return;
    }
    
    // Handle keys when picker is visible
    if (this.pickerVisible) {
      if (key === 'Escape') {
        event.preventDefault();
        this.hidePicker(true); // Remove from DOM on Escape
        return;
      } else if (key === 'Tab') {
        this.hidePicker(false); // Just hide on Tab
        return;
      }
      
      this.handlePickerKeyNavigation(event);
    }
  }

  handlePickerKeyNavigation(event) {
    const { key } = event;
    
    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.navigateDateByDays(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigateDateByDays(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateDateByDays(-7);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateDateByDays(7);
        break;
      case 'Enter':
        event.preventDefault();
        const focusedDay = document.activeElement;
        if (focusedDay && focusedDay.classList.contains('aionda-datefield-day')) {
          const dateStr = focusedDay.dataset.date;
          if (dateStr) {
            // Direct keyboard selection should bypass selectDate and set value directly
            this.dateValue = new Date(dateStr + 'T00:00:00');
            this._lastReturnFormat = 'iso'; // Flag to return ISO format on next getValue call
            const formattedValue = this.formatDate(this.dateValue, this.displayFormat);
            super.setValue(formattedValue, true);
            this.updateCalendar();
            this.hidePicker(false); // Hide but don't remove
            this.emit('select', { date: new Date(this.dateValue), value: dateStr });
          }
        } else {
          // If no day is focused, select the first available day
          const firstDay = this.el.querySelector('.aionda-datefield-day[data-date]');
          if (firstDay) {
            const dateStr = firstDay.dataset.date;
            this.dateValue = new Date(dateStr + 'T00:00:00');
            this._lastReturnFormat = 'iso';
            const formattedValue = this.formatDate(this.dateValue, this.displayFormat);
            super.setValue(formattedValue, true);
            this.updateCalendar();
            this.hidePicker(false); // Hide but don't remove
            this.emit('select', { date: new Date(this.dateValue), value: dateStr });
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.hidePicker(true); // Remove from DOM on Escape
        break;
    }
  }

  navigateToDate(date) {
    if (this.isDateDisabled(date)) return;
    
    // Update the current view if the date is in a different month
    if (date.getMonth() !== this.currentViewDate.getMonth() || 
        date.getFullYear() !== this.currentViewDate.getFullYear()) {
      this.currentViewDate = new Date(date);
      this.updateCalendar();
    }
    
    // Focus on the day element for the new date
    const dateStr = this.formatDateISO(date);
    const dayElement = this.daysContainer.querySelector(`[data-date="${dateStr}"]`);
    if (dayElement) {
      dayElement.focus();
    }
  }

  navigateDateByDays(days) {
    const currentDate = this.dateValue || new Date();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    this.navigateToDate(newDate);
  }

  onDocumentClick(event) {
    if (this.pickerVisible && this.el && !this.el.contains(event.target)) {
      this.hidePicker();
    }
  }

  onMonthYearChange() {
    const month = parseInt(this.monthSelect.value);
    const year = parseInt(this.yearSelect.value);
    
    this.currentViewDate = new Date(year, month, 1);
    this.updateCalendar();
  }

  navigateMonth(direction) {
    // Set day to 1 first to avoid month overflow issues
    // (e.g., Oct 31 -> Sept 31 would become Oct 1)
    this.currentViewDate.setDate(1);
    this.currentViewDate.setMonth(this.currentViewDate.getMonth() + direction);
    this.updateCalendar();
  }

  updateCalendar() {
    if (!this.picker) return;
    
    this.monthSelect.value = this.currentViewDate.getMonth();
    this.yearSelect.value = this.currentViewDate.getFullYear();
    
    this.updateNavigationButtons();
    this.renderDays();
  }

  updateNavigationButtons() {
    if (!this.prevMonthBtn || !this.nextMonthBtn) return;
    
    const currentMonth = this.currentViewDate.getMonth();
    const currentYear = this.currentViewDate.getFullYear();
    
    // Check if navigation would go beyond min/max date constraints
    let prevDisabled = false;
    let nextDisabled = false;
    
    if (this.minDate) {
      const prevMonth = new Date(currentYear, currentMonth - 1, 1);
      if (prevMonth < new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1)) {
        prevDisabled = true;
      }
    }
    
    if (this.maxDate) {
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      if (nextMonth > new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1)) {
        nextDisabled = true;
      }
    }
    
    this.prevMonthBtn.disabled = prevDisabled;
    this.nextMonthBtn.disabled = nextDisabled;
    
    if (prevDisabled) {
      this.prevMonthBtn.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');
    } else {
      this.prevMonthBtn.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
    }
    
    if (nextDisabled) {
      this.nextMonthBtn.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');
    } else {
      this.nextMonthBtn.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
    }
  }

  renderDays() {
    if (!this.daysContainer) return;
    
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() - this.startOfWeek + 7) % 7));
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.dateValue && this.isSameDay(date, this.dateValue);
      const isDisabled = this.isDateDisabled(date);
      
      const dayClasses = [
        'aionda-datefield-day',
        'w-8', 'h-8',
        'flex', 'items-center', 'justify-center',
        'text-sm', 'rounded',
        'cursor-pointer',
        'transition-colors'
      ];
      
      if (!isCurrentMonth) {
        dayClasses.push('text-gray-300');
      } else if (isDisabled) {
        dayClasses.push('text-gray-300', 'cursor-not-allowed');
      } else {
        dayClasses.push('text-gray-700', 'hover:bg-blue-50');
      }
      
      if (isToday && isCurrentMonth) {
        dayClasses.push('bg-blue-100', 'text-blue-600', 'font-medium');
      }
      
      if (isSelected) {
        dayClasses.push('bg-blue-500', 'text-white', 'font-medium');
      }
      
      days.push(`
        <button type="button" 
                class="${dayClasses.join(' ')}" 
                data-date="${this.formatDateISO(date)}"
                tabindex="-1"
                ${isDisabled ? 'disabled' : ''}>
          ${date.getDate()}
        </button>
      `);
    }
    
    this.daysContainer.innerHTML = days.join('');
    
    this.daysContainer.querySelectorAll('.aionda-datefield-day').forEach(dayEl => {
      dayEl.addEventListener('click', (e) => {
        if (!e.target.disabled) {
          const dateStr = e.target.dataset.date;
          const date = new Date(dateStr + 'T00:00:00');
          this.selectDate(date);
        }
      });
    });
  }

  selectDate(date) {
    if (this.isDateDisabled(date)) return;
    
    this.dateValue = new Date(date);
    this.setValue(this.formatDate(this.dateValue));
    this.updateCalendar();
    this.hidePicker(false); // Hide but don't remove
    
    this.emit('select', { date: new Date(this.dateValue), value: this.getValue() });
  }

  selectToday() {
    this.selectDate(new Date());
  }

  showPicker() {
    if (this.pickerVisible) return;
    
    // Create picker if it doesn't exist
    if (!this.picker) {
      const pickerContainer = this.el.querySelector('.aionda-datefield-input-wrap');
      if (pickerContainer) {
        pickerContainer.insertAdjacentHTML('beforeend', this.createPickerTemplate());
        this.picker = pickerContainer.querySelector('.aionda-datefield-picker');
        this.setupPickerEvents();
      }
    }
    
    this.pickerVisible = true;
    if (this.picker) {
      this.picker.classList.remove('hidden');
    }
    
    if (this.dateValue) {
      this.currentViewDate = new Date(this.dateValue);
    } else {
      this.currentViewDate = new Date();
    }
    
    this.updateCalendar();
    this.emit('expand');
  }

  hidePicker(remove = false) {
    if (!this.pickerVisible) return;
    
    this.pickerVisible = false;
    if (this.picker) {
      if (remove && this.picker.parentNode) {
        this.picker.parentNode.removeChild(this.picker);
        this.picker = null;
      } else {
        this.picker.classList.add('hidden');
      }
    }
    this.emit('collapse');
  }

  togglePicker() {
    if (this.pickerVisible) {
      this.hidePicker();
    } else {
      this.showPicker();
    }
  }

  parseInput(value) {
    if (!value) return null;
    if (typeof value !== 'string') return null;
    
    // Try only with defined formats - no fallback to native Date parsing
    const formats = [this.format, ...this.altFormats];
    
    for (const format of formats) {
      const date = this.parseWithFormat(value.trim(), format);
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  }

  parseWithFormat(value, format) {
    if (!value || !format) return null;
    
    try {
      let year, month, day;
      
      if (format === 'MM/dd/yyyy' || format === 'M/d/yyyy') {
        const parts = value.split('/');
        if (parts.length === 3) {
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      } else if (format === 'dd/MM/yyyy') {
        const parts = value.split('/');
        if (parts.length === 3) {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          year = parseInt(parts[2]);
        }
      } else if (format === 'MM-dd-yyyy') {
        const parts = value.split('-');
        if (parts.length === 3) {
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      } else if (format === 'yyyy-MM-dd') {
        const parts = value.split('-');
        if (parts.length === 3) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
        }
      } else {
        return null;
      }
      
      if (year !== undefined && month !== undefined && day !== undefined && 
          !isNaN(year) && !isNaN(month) && !isNaN(day) &&
          year >= 1000 && year <= 9999 && 
          month >= 0 && month <= 11 && 
          day >= 1 && day <= 31) {
        
        // Create the date and validate it's actually valid (handles leap years)
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }

  parseDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return this.parseInput(value);
    return null;
  }

  formatDate(date, format = null) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    
    const formatToUse = format || this.displayFormat || this.format;
    
    // Handle locale-based formatting
    if (formatToUse === 'locale' && this.locale) {
      try {
        return new Intl.DateTimeFormat(this.locale).format(date);
      } catch (e) {
        // Fallback to default format
      }
    }
    
    // Apply replacements in order to avoid conflicts
    let result = formatToUse;
    
    // Replace year first
    result = result.replace(/yyyy/g, date.getFullYear());
    
    // Replace month patterns (MM before M to avoid conflicts)
    result = result.replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'));
    result = result.replace(/\bM\b/g, date.getMonth() + 1);
    
    // Replace day patterns (dd before d to avoid conflicts)
    result = result.replace(/dd/g, String(date.getDate()).padStart(2, '0'));
    result = result.replace(/\bd\b/g, date.getDate());
    
    return result;
  }

  formatDateISO(date) {
    if (!date || !(date instanceof Date)) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  isDateDisabled(date) {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    if (this.disabledDays.includes(date.getDay())) return true;
    
    return false;
  }

  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 10;
    
    const options = [];
    for (let year = startYear; year <= endYear; year++) {
      options.push(`<option value="${year}">${year}</option>`);
    }
    
    return options.join('');
  }

  getMonthNames() {
    if (typeof Intl !== 'undefined') {
      const formatter = new Intl.DateTimeFormat(this.locale, { month: 'long' });
      return Array.from({ length: 12 }, (_, i) => 
        formatter.format(new Date(2000, i, 1))
      );
    }
    
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }

  getDayNames() {
    if (typeof Intl !== 'undefined') {
      const formatter = new Intl.DateTimeFormat(this.locale, { weekday: 'long' });
      const baseDate = new Date(2000, 0, 2); // Sunday
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + ((this.startOfWeek + i) % 7));
        return formatter.format(date);
      });
    }
    
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return Array.from({ length: 7 }, (_, i) => names[(this.startOfWeek + i) % 7]);
  }

  getDayNamesShort() {
    return this.getDayNames().map(name => name.slice(0, 3));
  }

  static formatDateStatic(date, format, locale) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    
    // Handle locale-based formatting
    if (format === 'locale' && locale) {
      try {
        return new Intl.DateTimeFormat(locale).format(date);
      } catch (e) {
        format = 'MM/dd/yyyy'; // Fallback
      }
    }
    
    // Apply replacements in order to avoid conflicts
    let result = format;
    
    // Replace year first
    result = result.replace(/yyyy/g, date.getFullYear());
    
    // Replace month patterns (MM before M to avoid conflicts)
    result = result.replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'));
    result = result.replace(/\bM\b/g, date.getMonth() + 1);
    
    // Replace day patterns (dd before d to avoid conflicts)
    result = result.replace(/dd/g, String(date.getDate()).padStart(2, '0'));
    result = result.replace(/\bd\b/g, date.getDate());
    
    return result;
  }

  static parseInputStatic(value, format, altFormats) {
    if (!value) return null;
    if (typeof value !== 'string') return null;
    
    // Try only with defined formats - no fallback to native Date parsing
    const formats = [format, ...altFormats];
    
    for (const fmt of formats) {
      const date = DateField.parseWithFormatStatic(value.trim(), fmt);
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  }

  static parseWithFormatStatic(value, format) {
    if (!value || !format) return null;
    
    try {
      let year, month, day;
      
      if (format === 'MM/dd/yyyy' || format === 'M/d/yyyy') {
        const parts = value.split('/');
        if (parts.length === 3) {
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      } else if (format === 'dd/MM/yyyy') {
        const parts = value.split('/');
        if (parts.length === 3) {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          year = parseInt(parts[2]);
        }
      } else if (format === 'MM-dd-yyyy') {
        const parts = value.split('-');
        if (parts.length === 3) {
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      } else if (format === 'yyyy-MM-dd') {
        const parts = value.split('-');
        if (parts.length === 3) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
        }
      } else {
        return null;
      }
      
      if (year !== undefined && month !== undefined && day !== undefined && 
          !isNaN(year) && !isNaN(month) && !isNaN(day) &&
          year >= 1000 && year <= 9999 && 
          month >= 0 && month <= 11 && 
          day >= 1 && day <= 31) {
        
        // Create the date and validate it's actually valid (handles leap years)
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }

  detectInputFormat(value) {
    if (!value || typeof value !== 'string') return null;
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return 'yyyy-MM-dd';
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return 'MM/dd/yyyy';
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return 'M/d/yyyy';
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return 'MM-dd-yyyy';
    }
    
    return null;
  }

  getValue() {
    if (!this.dateValue) return '';
    
    // If the last action was keyboard selection, return ISO format
    if (this._lastReturnFormat === 'iso') {
      this._lastReturnFormat = null;
      return this.formatDateISO(this.dateValue);
    }
    
    // Preserve original input format if available
    if (this._originalInputFormat) {
      return this.formatDate(this.dateValue, this._originalInputFormat);
    }
    
    return this.formatDate(this.dateValue, this.format);
  }

  setValue(value, updateDisplay = true) {
    const oldValue = this.getValue();
    
    if (!value) {
      this.dateValue = null;
      this._originalInputFormat = null;
      super.setValue('', updateDisplay);
    } else {
      const date = this.parseInput(value);
      if (date) {
        this.dateValue = date;
        // Store the original input format for getValue to use
        this._originalInputValue = value;
        this._originalInputFormat = this.detectInputFormat(value) || this.format;
        const formattedValue = this.formatDate(date, this.displayFormat);
        super.setValue(formattedValue, updateDisplay);
        
        if (this.picker) {
          this.currentViewDate = new Date(date);
          this.updateCalendar();
        }
      } else {
        // Invalid date string - clear the dateValue but keep the raw text
        this.dateValue = null;
        this._originalInputValue = null;
        this._originalInputFormat = null;
        super.setValue(value, updateDisplay);
      }
    }
    
    const newValue = this.getValue();
    if (oldValue !== newValue) {
      this.emit('change', { field: this, value: newValue, oldValue });
    }
    
    return this;
  }

  getDateValue() {
    return this.dateValue ? new Date(this.dateValue) : null;
  }

  getRawValue() {
    return this.dateValue ? new Date(this.dateValue) : null;
  }

  setDateValue(date) {
    if (date instanceof Date && !isNaN(date.getTime())) {
      this.setValue(this.formatDate(date));
    } else {
      this.setValue('');
    }
    return this;
  }

  setMinDate(date) {
    this.minDate = this.parseDate(date);
    this.updateCalendar();
    return this;
  }

  setMaxDate(date) {
    this.maxDate = this.parseDate(date);
    this.updateCalendar();
    return this;
  }

  reset() {
    if (this.originalValue) {
      this.setValue(this.originalValue);
    } else {
      this.setValue('');
    }
    return this;
  }

  validate() {
    if (!this.validators || this.validators.length === 0) {
      this.clearInvalid();
      this.emit('valid');
      return true;
    }

    for (const validator of this.validators) {
      const result = this.validateSingle(validator);
      if (!result.valid) {
        this.markInvalid(result.message);
        this.emit('invalid', { message: result.message });
        return false;
      }
    }

    this.clearInvalid();
    this.emit('valid');
    return true;
  }

  validateSingle(validator) {
    const value = this.getValue();
    const inputValue = this.inputEl ? this.inputEl.value : '';
    const { type, message } = validator;

    switch (type) {
      case 'required':
        // For required validation, if there's input text but no valid dateValue, it's invalid
        if (this.allowBlank === false && (!this.dateValue && inputValue.trim())) {
          return { valid: false, message: message || 'Date is required' };
        }
        if (!value && !inputValue) {
          return { valid: false, message: message || 'Date is required' };
        }
        break;

      case 'dateFormat':
        // If there's an input value but no valid date parsed, it's invalid format
        if (inputValue && inputValue.trim() && !this.dateValue) {
          return { valid: false, message: message || 'Invalid date format' };
        }
        break;

      case 'dateRange':
        if (this.dateValue) {
          if (this.minDate && this.dateValue < this.minDate) {
            return { 
              valid: false, 
              message: message || `Date must be on or after minimum date`
            };
          }
          
          if (this.maxDate && this.dateValue > this.maxDate) {
            return { 
              valid: false, 
              message: message || `Date must be on or before maximum date`
            };
          }
        }
        break;

      default:
        return super.validateSingle ? super.validateSingle(validator) : { valid: true };
    }

    return { valid: true };
  }

  getFormData() {
    const data = {};
    if (this.name) {
      data[this.name] = this.getValue();
    }
    return data;
  }

  reset() {
    if (this.originalValue !== undefined) {
      this.setValue(this.originalValue);
    } else {
      this.setValue('');
    }
    return this;
  }

  setDisabled(disabled) {
    super.setDisabled(disabled);
    this.disabled = disabled;
    
    if (this.triggerEl) {
      this.triggerEl.disabled = disabled;
      if (disabled) {
        this.triggerEl.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        this.triggerEl.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
    
    return this;
  }

  destroy() {
    if (this.parentForm && typeof this.parentForm.unregisterField === 'function') {
      this.parentForm.unregisterField(this);
    }
    
    if (this.picker) {
      document.removeEventListener('click', this.onDocumentClick);
    }
    super.destroy();
  }
}