/**
 * Unit tests for DateField component
 * Tests date picker initialization, calendar navigation, date selection,
 * validation, format conversion, min/max constraints, keyboard input,
 * Form integration, and locale handling
 */

import { DateField } from '../src/components/DateField.js';

describe('DateField', () => {
  let dateField;

  beforeEach(() => {
    dateField = null;
  });

  afterEach(() => {
    if (dateField && !dateField.destroyed) {
      dateField.destroy();
    }
    dateField = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create datefield with default config', () => {
      dateField = new DateField();

      expect(dateField.name).toBe(dateField.id);
      expect(dateField.fieldLabel).toBe('');
      expect(dateField.value).toBe('');
      expect(dateField.format).toBe('MM/dd/yyyy');
      expect(dateField.allowBlank).toBe(true);
      expect(dateField.editable).toBe(true);
      expect(dateField.minDate).toBe(null);
      expect(dateField.maxDate).toBe(null);
      expect(dateField.locale).toBe('en-US');
      expect(dateField.showToday).toBe(true);
      expect(dateField.startOfWeek).toBe(0);
    });

    test('should create datefield with custom config', () => {
      const config = {
        name: 'birthdate',
        fieldLabel: 'Birth Date',
        value: '05/15/1990',
        format: 'dd/MM/yyyy',
        minDate: '01/01/1900',
        maxDate: '31/12/2025',
        allowBlank: false,
        locale: 'en-GB',
        startOfWeek: 1
      };

      dateField = new DateField(config);

      expect(dateField.name).toBe('birthdate');
      expect(dateField.fieldLabel).toBe('Birth Date');
      expect(dateField.format).toBe('dd/MM/yyyy');
      expect(dateField.allowBlank).toBe(false);
      expect(dateField.locale).toBe('en-GB');
      expect(dateField.startOfWeek).toBe(1);
    });

    test('should handle date value as Date object', () => {
      const date = new Date(2023, 4, 15); // May 15, 2023
      dateField = new DateField({ value: date });

      expect(dateField.getDateValue()).toEqual(date);
    });

    test('should handle invalid date config gracefully', () => {
      dateField = new DateField({
        value: 'invalid-date',
        minDate: 'not-a-date',
        maxDate: 'also-not-a-date'
      });

      expect(dateField.dateValue).toBe(null);
      expect(dateField.minDate).toBe(null);
      expect(dateField.maxDate).toBe(null);
    });
  });

  describe('rendering', () => {
    test('should render date field with label and picker button', () => {
      dateField = new DateField({
        fieldLabel: 'Date Field',
        value: '05/15/2023'
      });
      const el = dateField.render();

      expect(el).toHaveClass('aionda-datefield');
      
      const input = el.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
      expect(input.value).toBe('05/15/2023');
      
      const label = el.querySelector('label');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Date Field');

      const pickerButton = el.querySelector('.aionda-datefield-trigger');
      expect(pickerButton).not.toBeNull();
    });

    test('should render picker with calendar structure', () => {
      dateField = new DateField();
      const el = dateField.render();

      const picker = el.querySelector('.aionda-datefield-picker');
      expect(picker).not.toBeNull();
      expect(picker).toHaveClass('hidden');
      
      const monthSelect = el.querySelector('.aionda-datefield-month-select');
      expect(monthSelect).not.toBeNull();
      
      const yearSelect = el.querySelector('.aionda-datefield-year-select');
      expect(yearSelect).not.toBeNull();
    });

    test('should render with readonly input when editable is false', () => {
      dateField = new DateField({ editable: false });
      const el = dateField.render();
      const input = el.querySelector('input');

      expect(input.readOnly).toBe(true);
    });

    test('should apply custom placeholder', () => {
      dateField = new DateField({ placeholder: 'Select a date' });
      const el = dateField.render();
      const input = el.querySelector('input');

      expect(input.placeholder).toBe('Select a date');
    });

    test('should render with custom CSS classes', () => {
      dateField = new DateField({ cls: 'custom-date-field' });
      const el = dateField.render();

      expect(el).toHaveClass('custom-date-field');
    });
  });

  describe('date picker initialization', () => {
    beforeEach(() => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
    });

    test('should initialize date picker on button click', () => {
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const picker = dateField.el.querySelector('.datefield-picker');
      expect(picker).not.toBeNull();
      expect(picker).not.toHaveClass('hidden');
      expect(dateField.pickerVisible).toBe(true);
    });

    test('should show current month in picker by default', () => {
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const monthSelect = dateField.el.querySelector('.aionda-datefield-month-select');
      const yearSelect = dateField.el.querySelector('.aionda-datefield-year-select');
      const currentDate = new Date();
      
      expect(parseInt(monthSelect.value)).toBe(currentDate.getMonth());
      expect(parseInt(yearSelect.value)).toBe(currentDate.getFullYear());
    });

    test('should show value date month when field has value', () => {
      dateField.setValue('05/15/2023');
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const monthSelect = dateField.el.querySelector('.aionda-datefield-month-select');
      const yearSelect = dateField.el.querySelector('.aionda-datefield-year-select');
      
      expect(parseInt(monthSelect.value)).toBe(4); // May is month 4 (0-indexed)
      expect(parseInt(yearSelect.value)).toBe(2023);
    });
  });

  describe('calendar navigation', () => {
    beforeEach(() => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);
    });

    test('should navigate to previous month', () => {
      const monthSelect = dateField.el.querySelector('.aionda-datefield-month-select');
      const initialMonth = parseInt(monthSelect.value);
      
      const prevButton = dateField.el.querySelector('.aionda-datefield-prev-month');
      testUtils.fireClickEvent(prevButton);
      
      const newMonth = parseInt(monthSelect.value);
      expect(newMonth).toBe((initialMonth - 1 + 12) % 12);
    });

    test('should navigate to next month', () => {
      const monthSelect = dateField.el.querySelector('.aionda-datefield-month-select');
      const initialMonth = parseInt(monthSelect.value);
      
      const nextButton = dateField.el.querySelector('.aionda-datefield-next-month');
      testUtils.fireClickEvent(nextButton);
      
      const newMonth = parseInt(monthSelect.value);
      expect(newMonth).toBe((initialMonth + 1) % 12);
    });

    test('should change month via select dropdown', () => {
      const monthSelect = dateField.el.querySelector('.aionda-datefield-month-select');
      
      monthSelect.value = '5'; // June (0-indexed)
      testUtils.fireEvent(monthSelect, 'change');
      
      expect(dateField.currentViewDate.getMonth()).toBe(5);
    });

    test('should change year via select dropdown', () => {
      const yearSelect = dateField.el.querySelector('.aionda-datefield-year-select');
      
      yearSelect.value = '2025';
      testUtils.fireEvent(yearSelect, 'change');
      
      expect(dateField.currentViewDate.getFullYear()).toBe(2025);
    });

    test('should render calendar days correctly', () => {
      const calendarDays = dateField.el.querySelectorAll('.aionda-datefield-day');
      expect(calendarDays.length).toBe(42); // 6 weeks * 7 days
    });
  });

  describe('date selection', () => {
    beforeEach(() => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);
    });

    test('should select date when clicking calendar day', () => {
      const dayButton = dateField.el.querySelector('.aionda-datefield-day[data-date]');
      const selectedDate = dayButton.getAttribute('data-date');
      
      testUtils.fireClickEvent(dayButton);
      
      expect(dateField.getDateValue()).toEqual(new Date(selectedDate + 'T00:00:00'));
      expect(dateField.el.querySelector('.datefield-picker')).toHaveClass('hidden');
    });

    test('should highlight selected date in calendar', () => {
      dateField.setValue('05/15/2023');
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const selectedDay = dateField.el.querySelector('.aionda-datefield-day[data-date="2023-05-15"]');
      expect(selectedDay).not.toBeNull();
      expect(selectedDay).toHaveClass('bg-blue-500');
    });

    test('should emit select event on date selection', () => {
      const selectSpy = jest.fn();
      dateField.on('select', selectSpy);

      const dayButton = dateField.el.querySelector('.aionda-datefield-day[data-date]');
      testUtils.fireClickEvent(dayButton);

      expect(selectSpy).toHaveBeenCalled();
    });

    test('should select today when clicking today button', () => {
      const todayButton = dateField.el.querySelector('.aionda-datefield-today');
      testUtils.fireClickEvent(todayButton);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = dateField.getDateValue();
      selectedDate.setHours(0, 0, 0, 0);
      
      expect(selectedDate.getTime()).toBe(today.getTime());
    });
  });

  describe('value management', () => {
    beforeEach(() => {
      dateField = new DateField({ value: '05/15/2023' });
      dateField.render();
    });

    test('should get value in formatted string', () => {
      expect(dateField.getValue()).toBe('05/15/2023');
    });

    test('should get raw value as Date object', () => {
      const rawValue = dateField.getRawValue();
      expect(rawValue).toBeInstanceOf(Date);
      expect(rawValue.getFullYear()).toBe(2023);
      expect(rawValue.getMonth()).toBe(4); // 0-indexed
      expect(rawValue.getDate()).toBe(15);
    });

    test('should set value from string', () => {
      dateField.setValue('12/25/2023');
      
      expect(dateField.getValue()).toBe('12/25/2023');
      expect(dateField.inputEl.value).toBe('12/25/2023');
    });

    test('should set value from Date object', () => {
      const date = new Date(2023, 11, 25); // December 25, 2023
      dateField.setDateValue(date);
      
      expect(dateField.getValue()).toBe('12/25/2023');
    });

    test('should handle null value', () => {
      dateField.setValue(null);
      
      expect(dateField.getValue()).toBe('');
      expect(dateField.inputEl.value).toBe('');
      expect(dateField.dateValue).toBe(null);
    });

    test('should handle invalid date strings', () => {
      dateField.setValue('not-a-date');
      
      expect(dateField.dateValue).toBe(null);
    });

    test('should format display value correctly with different format', () => {
      dateField = new DateField({
        value: '15/05/2023',
        format: 'dd/MM/yyyy'
      });
      dateField.render();

      expect(dateField.inputEl.value).toBe('15/05/2023');
    });
  });

  describe('format conversion', () => {
    test('should handle MM/dd/yyyy format', () => {
      dateField = new DateField({
        format: 'MM/dd/yyyy'
      });
      dateField.render();
      
      dateField.setValue('05/15/2023');
      expect(dateField.inputEl.value).toBe('05/15/2023');
      expect(dateField.getDateValue()).toEqual(new Date(2023, 4, 15));
    });

    test('should handle yyyy-MM-dd format', () => {
      dateField = new DateField({
        format: 'yyyy-MM-dd',
        altFormats: ['MM/dd/yyyy']
      });
      dateField.render();
      
      dateField.setValue('2023-05-15');
      expect(dateField.inputEl.value).toBe('2023-05-15');
      expect(dateField.getDateValue()).toEqual(new Date(2023, 4, 15));
    });

    test('should parse alternative formats', () => {
      dateField = new DateField();
      dateField.render();
      
      testUtils.fireInputEvent(dateField.inputEl, '2023-05-15');
      expect(dateField.getDateValue()).toEqual(new Date(2023, 4, 15));
    });

    test('should validate format during input', () => {
      dateField = new DateField({
        allowBlank: false,
        validators: [{ type: 'required' }]
      });
      dateField.render();
      
      testUtils.fireInputEvent(dateField.inputEl, 'invalid-format');
      expect(dateField.validate()).toBe(false);
    });
  });

  describe('min/max date constraints', () => {
    test('should validate against min date', () => {
      dateField = new DateField({
        minDate: '2023-01-01',
        validators: [{ type: 'dateRange' }]
      });
      dateField.render();

      dateField.setValue('2022-12-31');
      expect(dateField.validate()).toBe(false);
      expect(dateField.errorMessage).toContain('minimum');

      dateField.setValue('2023-01-01');
      expect(dateField.validate()).toBe(true);
    });

    test('should validate against max date', () => {
      dateField = new DateField({
        maxDate: '2023-12-31',
        validators: [{ type: 'dateRange' }]
      });
      dateField.render();

      dateField.setValue('2024-01-01');
      expect(dateField.validate()).toBe(false);
      expect(dateField.errorMessage).toContain('maximum');

      dateField.setValue('2023-12-31');
      expect(dateField.validate()).toBe(true);
    });

    test('should disable dates outside range in picker', () => {
      dateField = new DateField({
        minDate: '2023-05-10',
        maxDate: '2023-05-20'
      });
      dateField.renderTo(testUtils.createContainer());
      
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const disabledDays = document.querySelectorAll('.aionda-datefield-day[disabled]');
      expect(disabledDays.length).toBeGreaterThan(0);
    });

    test('should prevent navigation beyond date range', () => {
      dateField = new DateField({
        value: '2023-05-15',
        minDate: '2023-05-01',
        maxDate: '2023-05-31'
      });
      dateField.renderTo(testUtils.createContainer());
      
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const prevButton = document.querySelector('.aionda-datefield-prev-month');
      const nextButton = document.querySelector('.aionda-datefield-next-month');
      
      expect(prevButton).toHaveClass('disabled');
      expect(nextButton).toHaveClass('disabled');
    });
  });

  describe('keyboard input', () => {
    beforeEach(() => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
    });

    test('should open picker on Enter key', () => {
      testUtils.fireKeyEvent(dateField.inputEl, 'Enter');
      
      const picker = document.querySelector('.datefield-picker');
      expect(picker).not.toBeNull();
    });

    test('should open picker on Space key', () => {
      testUtils.fireKeyEvent(dateField.inputEl, ' ');
      
      const picker = document.querySelector('.datefield-picker');
      expect(picker).not.toBeNull();
    });

    test('should navigate picker with arrow keys', () => {
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      testUtils.fireKeyEvent(document.querySelector('.datefield-picker'), 'ArrowRight');
      
      const focusedDay = document.querySelector('.aionda-datefield-day:focus');
      expect(focusedDay).not.toBeNull();
    });

    test('should select date with Enter in picker', () => {
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const firstDay = document.querySelector('.aionda-datefield-day[data-date]');
      firstDay.focus();
      testUtils.fireKeyEvent(firstDay, 'Enter');

      expect(dateField.getValue()).toBe(firstDay.getAttribute('data-date'));
    });

    test('should close picker on Escape', () => {
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      testUtils.fireKeyEvent(document.querySelector('.datefield-picker'), 'Escape');
      
      expect(document.querySelector('.datefield-picker')).toBeNull();
    });
  });

  describe('validation', () => {
    test('should validate required field', () => {
      dateField = new DateField({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Date is required' }]
      });
      dateField.render();

      dateField.setValue('');
      expect(dateField.validate()).toBe(false);
      expect(dateField.errorMessage).toBe('Date is required');

      dateField.setValue('2023-05-15');
      expect(dateField.validate()).toBe(true);
    });

    test('should validate date format', () => {
      dateField = new DateField({
        validators: [{ type: 'dateFormat', message: 'Invalid date format' }]
      });
      dateField.render();

      testUtils.fireInputEvent(dateField.inputEl, 'not-a-date');
      expect(dateField.validate()).toBe(false);

      testUtils.fireInputEvent(dateField.inputEl, '05/15/2023');
      expect(dateField.validate()).toBe(true);
    });

    test('should emit validation events', () => {
      const validSpy = jest.fn();
      const invalidSpy = jest.fn();
      
      dateField = new DateField({
        validators: [{ type: 'required' }]
      });
      dateField.render();
      
      dateField.on('valid', validSpy);
      dateField.on('invalid', invalidSpy);

      dateField.setValue('');
      dateField.validate();
      expect(invalidSpy).toHaveBeenCalled();

      dateField.setValue('2023-05-15');
      dateField.validate();
      expect(validSpy).toHaveBeenCalled();
    });
  });

  describe('Form integration', () => {
    test('should register with parent form', () => {
      const mockForm = {
        registerField: jest.fn(),
        unregisterField: jest.fn()
      };

      dateField = new DateField({ parentForm: mockForm });
      expect(mockForm.registerField).toHaveBeenCalledWith(dateField);

      dateField.destroy();
      expect(mockForm.unregisterField).toHaveBeenCalledWith(dateField);
    });

    test('should provide form data correctly', () => {
      dateField = new DateField({
        name: 'eventDate',
        value: '2023-05-15'
      });

      const formData = dateField.getFormData();
      expect(formData).toEqual({
        eventDate: '2023-05-15'
      });
    });

    test('should reset to initial value', () => {
      dateField = new DateField({
        value: '2023-05-15'
      });
      dateField.render();

      dateField.setValue('2023-12-25');
      expect(dateField.getValue()).toBe('2023-12-25');

      dateField.reset();
      expect(dateField.getValue()).toBe('2023-05-15');
    });
  });

  describe('locale handling', () => {
    test('should format dates according to locale', () => {
      dateField = new DateField({
        value: '2023-05-15',
        locale: 'en-GB',
        displayFormat: 'locale'
      });
      dateField.render();

      expect(dateField.inputEl.value).toBe('15/05/2023');
    });

    test('should show month names in specified locale', () => {
      dateField = new DateField({
        locale: 'es-ES'
      });
      dateField.renderTo(testUtils.createContainer());
      
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const monthHeader = document.querySelector('.aionda-datefield-header');
      expect(monthHeader.textContent).toMatch(/enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i);
    });

    test('should show day names in specified locale', () => {
      dateField = new DateField({
        locale: 'fr-FR'
      });
      dateField.renderTo(testUtils.createContainer());
      
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);

      const dayHeaders = document.querySelectorAll('.aionda-datefield-day-headers > div');
      const sundayHeader = Array.from(dayHeaders).find(header => 
        header.textContent.toLowerCase().includes('dim')
      );
      expect(sundayHeader).not.toBeNull();
    });
  });

  describe('focus management', () => {
    beforeEach(() => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
    });

    test('should focus input', () => {
      const focusSpy = jest.spyOn(dateField.inputEl, 'focus');
      
      dateField.focus();
      
      expect(focusSpy).toHaveBeenCalled();
    });

    test('should blur input', () => {
      const blurSpy = jest.spyOn(dateField.inputEl, 'blur');
      
      dateField.blur();
      
      expect(blurSpy).toHaveBeenCalled();
    });

    test('should emit focus events', () => {
      const focusSpy = jest.fn();
      dateField.on('focus', focusSpy);

      testUtils.fireEvent(dateField.inputEl, 'focus');

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should close picker on blur', () => {
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);
      
      expect(document.querySelector('.datefield-picker')).not.toBeNull();
      
      testUtils.fireEvent(dateField.inputEl, 'blur');
      
      setTimeout(() => {
        expect(document.querySelector('.datefield-picker')).toBeNull();
      }, 100);
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new DateField(null)).not.toThrow();
    });

    test('should handle leap year dates', () => {
      dateField = new DateField();
      dateField.render();
      
      dateField.setValue('2024-02-29'); // Leap year
      expect(dateField.getValue()).toBe('2024-02-29');
      
      dateField.setValue('2023-02-29'); // Non-leap year
      expect(dateField.getValue()).toBe('');
    });

    test('should handle year boundaries', () => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
      
      dateField.setValue('2023-12-31');
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);
      
      const nextButton = document.querySelector('.picker-next-month');
      testUtils.fireClickEvent(nextButton);
      
      const monthHeader = document.querySelector('.aionda-datefield-header');
      expect(monthHeader.textContent).toContain('2024');
    });

    test('should handle disabled state', () => {
      dateField = new DateField({ disabled: true });
      dateField.render();
      
      expect(dateField.inputEl.disabled).toBe(true);
      
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      expect(pickerButton.disabled).toBe(true);
    });

    test('should handle destruction properly', () => {
      dateField = new DateField();
      dateField.renderTo(testUtils.createContainer());
      
      const pickerButton = dateField.el.querySelector('.datefield-picker-button');
      testUtils.fireClickEvent(pickerButton);
      
      expect(document.querySelector('.datefield-picker')).not.toBeNull();
      
      dateField.destroy();
      
      expect(document.querySelector('.datefield-picker')).toBeNull();
      expect(dateField.destroyed).toBe(true);
    });

    test('should handle time zone differences', () => {
      const originalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      dateField = new DateField({
        value: '2023-05-15'
      });
      dateField.render();
      
      const rawValue = dateField.getRawValue();
      expect(rawValue.getDate()).toBe(15);
      expect(rawValue.getMonth()).toBe(4);
      expect(rawValue.getFullYear()).toBe(2023);
    });
  });
});