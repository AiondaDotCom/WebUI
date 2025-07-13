/**
 * Unit tests for MessageBox component
 * Tests alert/confirm/prompt methods, button configurations, promise returns,
 * user interaction handling, and modal behavior
 */

import { MessageBox } from '../src/components/MessageBox.js';

describe('MessageBox', () => {
  let messageBox;

  beforeEach(() => {
    messageBox = null;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (messageBox && !messageBox.destroyed) {
      messageBox.destroy();
    }
    messageBox = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create MessageBox with default config', () => {
      messageBox = new MessageBox();

      expect(messageBox.title).toBe('');
      expect(messageBox.message).toBe('');
      expect(messageBox.icon).toBe('');
      expect(messageBox.iconType).toBe('info');
      expect(messageBox.buttons).toEqual([]);
      expect(messageBox.defaultButton).toBe(0);
      expect(messageBox.allowEscape).toBe(true);
      expect(messageBox.modal).toBe(true);
      expect(messageBox.value).toBe('');
      expect(messageBox.inputType).toBe('text');
      expect(messageBox.showInput).toBe(false);
    });

    test('should create MessageBox with custom config', () => {
      const config = {
        title: 'Custom Title',
        message: 'Custom Message',
        iconType: 'warning',
        buttons: [{text: 'OK'}, {text: 'Cancel'}],
        defaultButton: 1,
        allowEscape: false,
        modal: false,
        value: 'default value',
        inputType: 'password',
        showInput: true
      };

      messageBox = new MessageBox(config);

      expect(messageBox.title).toBe('Custom Title');
      expect(messageBox.message).toBe('Custom Message');
      expect(messageBox.iconType).toBe('warning');
      expect(messageBox.buttons).toEqual([{text: 'OK'}, {text: 'Cancel'}]);
      expect(messageBox.defaultButton).toBe(1);
      expect(messageBox.allowEscape).toBe(false);
      expect(messageBox.modal).toBe(false);
      expect(messageBox.value).toBe('default value');
      expect(messageBox.inputType).toBe('password');
      expect(messageBox.showInput).toBe(true);
    });

    test('should handle null config', () => {
      messageBox = new MessageBox(null);

      expect(messageBox.title).toBe('');
      expect(messageBox.message).toBe('');
      expect(messageBox.buttons).toEqual([]);
    });

    test('should handle undefined config', () => {
      messageBox = new MessageBox(undefined);

      expect(messageBox.title).toBe('');
      expect(messageBox.message).toBe('');
      expect(messageBox.buttons).toEqual([]);
    });
  });

  describe('static methods', () => {
    describe('alert', () => {
      test('should create alert dialog with default title', async () => {
        const promise = MessageBox.alert('Test message');
        
        expect(document.querySelector('.fixed.inset-0')).toBeTruthy();
        expect(document.querySelector('h3').textContent).toBe('Alert');
        expect(document.querySelector('.text-sm.text-gray-500').textContent).toContain('Test message');
        
        const button = document.querySelector('button');
        expect(button.textContent.trim()).toBe('OK');
        
        button.click();
        await promise;
      });

      test('should create alert dialog with custom title', async () => {
        const promise = MessageBox.alert('Test message', 'Custom Alert');
        
        expect(document.querySelector('h3').textContent).toBe('Custom Alert');
        
        const button = document.querySelector('button');
        button.click();
        await promise;
      });

      test('should create alert dialog with custom options', async () => {
        const promise = MessageBox.alert('Test message', 'Alert', {
          buttonText: 'Got it',
          iconType: 'success'
        });
        
        const button = document.querySelector('button');
        expect(button.textContent.trim()).toBe('Got it');
        
        button.click();
        await promise;
      });

      test('should resolve promise when button clicked', async () => {
        const promise = MessageBox.alert('Test message');
        
        const button = document.querySelector('button');
        setTimeout(() => button.click(), 10);
        
        await expect(promise).resolves.toBeUndefined();
      });
    });

    describe('confirm', () => {
      test('should create confirm dialog with default options', async () => {
        const promise = MessageBox.confirm('Are you sure?');
        
        expect(document.querySelector('h3').textContent).toBe('Confirm');
        expect(document.querySelector('.text-sm.text-gray-500').textContent).toContain('Are you sure?');
        
        const buttons = document.querySelectorAll('button');
        expect(buttons).toHaveLength(2);
        expect(buttons[0].textContent.trim()).toBe('Cancel');
        expect(buttons[1].textContent.trim()).toBe('OK');
        
        buttons[0].click();
        await promise;
      });

      test('should resolve false when cancel clicked', async () => {
        const promise = MessageBox.confirm('Are you sure?');
        
        const cancelButton = document.querySelector('button');
        setTimeout(() => cancelButton.click(), 10);
        
        await expect(promise).resolves.toBe(false);
      });

      test('should resolve true when confirm clicked', async () => {
        const promise = MessageBox.confirm('Are you sure?');
        
        const buttons = document.querySelectorAll('button');
        const confirmButton = buttons[1];
        setTimeout(() => confirmButton.click(), 10);
        
        await expect(promise).resolves.toBe(true);
      });

      test('should use custom button text', async () => {
        const promise = MessageBox.confirm('Delete item?', 'Confirm Delete', {
          cancelText: 'Keep',
          confirmText: 'Delete'
        });
        
        const buttons = document.querySelectorAll('button');
        expect(buttons[0].textContent.trim()).toBe('Keep');
        expect(buttons[1].textContent.trim()).toBe('Delete');
        
        buttons[0].click();
        await promise;
      });
    });

    describe('prompt', () => {
      test('should create prompt dialog with input field', async () => {
        const promise = MessageBox.prompt('Enter name:');
        
        expect(document.querySelector('h3').textContent).toBe('Input');
        expect(document.querySelector('.text-sm.text-gray-500').textContent).toContain('Enter name:');
        expect(document.querySelector('input')).toBeTruthy();
        
        const buttons = document.querySelectorAll('button');
        buttons[0].click();
        await promise;
      });

      test('should use default value in input', async () => {
        const promise = MessageBox.prompt('Enter name:', 'Input', 'John Doe');
        
        const input = document.querySelector('input');
        expect(input.value).toBe('John Doe');
        
        const buttons = document.querySelectorAll('button');
        buttons[0].click();
        await promise;
      });

      test('should resolve null when cancel clicked', async () => {
        const promise = MessageBox.prompt('Enter name:');
        
        const cancelButton = document.querySelector('button');
        setTimeout(() => cancelButton.click(), 10);
        
        await expect(promise).resolves.toBe(null);
      });

      test('should resolve input value when OK clicked', async () => {
        const promise = MessageBox.prompt('Enter name:', 'Input', 'Default');
        
        const input = document.querySelector('input');
        input.value = 'Test Value';
        
        const buttons = document.querySelectorAll('button');
        const okButton = buttons[1];
        setTimeout(() => okButton.click(), 10);
        
        await expect(promise).resolves.toBe('Test Value');
      });

      test('should use custom input type', async () => {
        const promise = MessageBox.prompt('Enter password:', 'Password', '', {
          inputType: 'password'
        });
        
        const input = document.querySelector('input');
        expect(input.type).toBe('password');
        
        const buttons = document.querySelectorAll('button');
        buttons[0].click();
        await promise;
      });
    });

    describe('getDefaultIcon', () => {
      test('should return correct icon for each type', () => {
        expect(MessageBox.getDefaultIcon('info')).toContain('text-blue-500');
        expect(MessageBox.getDefaultIcon('warning')).toContain('text-yellow-500');
        expect(MessageBox.getDefaultIcon('error')).toContain('text-red-500');
        expect(MessageBox.getDefaultIcon('success')).toContain('text-green-500');
        expect(MessageBox.getDefaultIcon('question')).toContain('text-blue-500');
      });

      test('should return info icon for unknown type', () => {
        expect(MessageBox.getDefaultIcon('unknown')).toContain('text-blue-500');
      });
    });
  });

  describe('rendering', () => {
    test('should render basic MessageBox', () => {
      messageBox = new MessageBox({
        title: 'Test Title',
        message: 'Test Message'
      });

      messageBox.render();

      expect(messageBox.rendered).toBe(true);
      expect(messageBox.el).toBeTruthy();
      expect(messageBox.el.querySelector('h3')).toBeTruthy();
    });

    test('should render MessageBox with icon', () => {
      messageBox = new MessageBox({
        title: 'Test Title',
        message: 'Test Message',
        icon: MessageBox.getDefaultIcon('info')
      });

      messageBox.render();

      expect(messageBox.el.querySelector('.w-6.h-6')).toBeTruthy();
    });

    test('should render MessageBox with input field', () => {
      messageBox = new MessageBox({
        title: 'Test Title',
        message: 'Test Message',
        showInput: true,
        value: 'default'
      });

      messageBox.render();

      const input = messageBox.el.querySelector('input');
      expect(input).toBeTruthy();
      expect(input.value).toBe('default');
    });

    test('should render MessageBox with custom buttons', () => {
      messageBox = new MessageBox({
        title: 'Test Title',
        message: 'Test Message',
        buttons: [
          {text: 'Button 1', variant: 'primary'},
          {text: 'Button 2', variant: 'secondary'}
        ]
      });

      messageBox.render();

      const buttons = messageBox.el.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].textContent.trim()).toBe('Button 1');
      expect(buttons[1].textContent.trim()).toBe('Button 2');
    });
  });

  describe('interaction', () => {
    test('should handle button click', () => {
      const mockHandler = jest.fn();
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        buttons: [{
          text: 'Test Button',
          handler: mockHandler
        }]
      });

      messageBox.show();

      const button = document.querySelector('button');
      button.click();

      expect(mockHandler).toHaveBeenCalled();
    });

    test('should emit buttonclick event', () => {
      const clickHandler = jest.fn();
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        buttons: [{text: 'Test Button'}]
      });

      messageBox.on('buttonclick', clickHandler);
      messageBox.show();

      const button = document.querySelector('button');
      button.click();

      expect(clickHandler).toHaveBeenCalled();
    });

    test('should handle Enter key in input field', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        showInput: true,
        buttons: [{text: 'OK'}]
      });

      messageBox.show();

      const input = document.querySelector('input');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(enterEvent);

      expect(messageBox.destroyed).toBe(false);
    });

    test('should handle Escape key when allowEscape is true', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        allowEscape: true
      });

      messageBox.show();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(messageBox.destroyed).toBe(false);
    });

    test('should not handle Escape key when allowEscape is false', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        allowEscape: false
      });

      messageBox.show();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(messageBox.destroyed).toBe(false);
    });
  });

  describe('show/hide', () => {
    test('should show MessageBox', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      const showHandler = jest.fn();
      messageBox.on('show', showHandler);

      messageBox.show();

      expect(document.body.contains(messageBox.el)).toBe(true);
      expect(messageBox.el.style.display).toBe('flex');
      expect(showHandler).toHaveBeenCalled();
    });

    test('should hide MessageBox', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      const hideHandler = jest.fn();
      messageBox.on('hide', hideHandler);

      messageBox.show();
      messageBox.hide();

      expect(messageBox.el.style.display).toBe('none');
      expect(hideHandler).toHaveBeenCalled();
    });

    test('should focus input when shown with showInput', (done) => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        showInput: true
      });

      messageBox.show();

      setTimeout(() => {
        const input = document.querySelector('input');
        expect(document.activeElement).toBe(input);
        done();
      }, 150);
    });
  });

  describe('value management', () => {
    test('should get value from input', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        showInput: true
      });

      messageBox.show();

      const input = document.querySelector('input');
      input.value = 'test value';

      expect(messageBox.getValue()).toBe('test value');
    });

    test('should set value to input', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test',
        showInput: true
      });

      messageBox.show();
      messageBox.setValue('new value');

      const input = document.querySelector('input');
      expect(input.value).toBe('new value');
    });

    test('should return empty string when no input', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      expect(messageBox.getValue()).toBe('');
    });

    test('should handle setValue when no input', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      expect(() => messageBox.setValue('test')).not.toThrow();
    });
  });

  describe('destruction', () => {
    test('should destroy MessageBox properly', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      messageBox.show();
      messageBox.destroy();

      expect(messageBox.destroyed).toBe(true);
      expect(document.body.contains(messageBox.el)).toBe(false);
    });

    test('should reject promise when destroyed', (done) => {
      const promise = MessageBox.alert('Test');
      
      setTimeout(() => {
        const msgBox = document.querySelector('.fixed.inset-0');
        if (msgBox) {
          msgBox.remove();
        }
      }, 10);

      promise.catch(() => {
        done();
      });
    });

    test('should remove event listeners on destroy', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      messageBox.show();
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      messageBox.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    test('should handle multiple show calls', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      messageBox.show();
      messageBox.show();

      expect(document.querySelectorAll('.fixed.inset-0')).toHaveLength(1);
    });

    test('should handle hide before show', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      expect(() => messageBox.hide()).not.toThrow();
    });

    test('should handle destroy without show', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      expect(() => messageBox.destroy()).not.toThrow();
    });

    test('should handle multiple destroy calls', () => {
      messageBox = new MessageBox({
        title: 'Test',
        message: 'Test'
      });

      messageBox.show();
      messageBox.destroy();
      messageBox.destroy();

      expect(messageBox.destroyed).toBe(true);
    });
  });
});