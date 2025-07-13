/**
 * Unit tests for Toast component
 * Tests toast positioning, auto-dismiss timers, animation states,
 * user interaction handling, and static convenience methods
 */

import { Toast } from '../src/components/Toast.js';

describe('Toast', () => {
  let toast;

  beforeEach(() => {
    toast = null;
    document.body.innerHTML = '';
    Toast.clear();
  });

  afterEach(() => {
    if (toast && !toast.destroyed) {
      toast.destroy();
    }
    toast = null;
    Toast.clear();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create Toast with default config', () => {
      toast = new Toast();

      expect(toast.message).toBe('');
      expect(toast.title).toBe('');
      expect(toast.type).toBe('info');
      expect(toast.position).toBe('top-right');
      expect(toast.duration).toBe(5000);
      expect(toast.closable).toBe(true);
      expect(toast.animate).toBe(true);
      expect(toast.persistent).toBe(false);
      expect(toast.isVisible).toBe(false);
    });

    test('should create Toast with custom config', () => {
      const config = {
        message: 'Test message',
        title: 'Test title',
        type: 'success',
        position: 'bottom-left',
        duration: 3000,
        closable: false,
        animate: false,
        persistent: true
      };

      toast = new Toast(config);

      expect(toast.message).toBe('Test message');
      expect(toast.title).toBe('Test title');
      expect(toast.type).toBe('success');
      expect(toast.position).toBe('bottom-left');
      expect(toast.duration).toBe(3000);
      expect(toast.closable).toBe(false);
      expect(toast.animate).toBe(false);
      expect(toast.persistent).toBe(true);
    });

    test('should handle null config', () => {
      toast = new Toast(null);

      expect(toast.message).toBe('');
      expect(toast.type).toBe('info');
      expect(toast.position).toBe('top-right');
    });

    test('should handle undefined config', () => {
      toast = new Toast(undefined);

      expect(toast.message).toBe('');
      expect(toast.type).toBe('info');
      expect(toast.position).toBe('top-right');
    });

    test('should set default icon based on type', () => {
      const successToast = new Toast({ type: 'success' });
      const errorToast = new Toast({ type: 'error' });
      const warningToast = new Toast({ type: 'warning' });
      const infoToast = new Toast({ type: 'info' });

      expect(successToast.icon).toBe('✓');
      expect(errorToast.icon).toBe('✕');
      expect(warningToast.icon).toBe('⚠');
      expect(infoToast.icon).toBe('ℹ');

      successToast.destroy();
      errorToast.destroy();
      warningToast.destroy();
      infoToast.destroy();
    });
  });

  describe('static methods', () => {
    describe('show', () => {
      test('should create and show toast', () => {
        toast = Toast.show('Test message');

        expect(toast.message).toBe('Test message');
        expect(toast.isVisible).toBe(true);
        expect(document.querySelector('.pointer-events-auto')).toBeTruthy();
      });

      test('should create toast with custom config', () => {
        toast = Toast.show('Test message', { 
          type: 'warning',
          position: 'bottom-center',
          duration: 2000
        });

        expect(toast.type).toBe('warning');
        expect(toast.position).toBe('bottom-center');
        expect(toast.duration).toBe(2000);
      });
    });

    describe('convenience methods', () => {
      test('should create success toast', () => {
        toast = Toast.success('Success message');

        expect(toast.type).toBe('success');
        expect(toast.message).toBe('Success message');
        expect(toast.isVisible).toBe(true);
      });

      test('should create error toast', () => {
        toast = Toast.error('Error message');

        expect(toast.type).toBe('error');
        expect(toast.message).toBe('Error message');
        expect(toast.isVisible).toBe(true);
      });

      test('should create warning toast', () => {
        toast = Toast.warning('Warning message');

        expect(toast.type).toBe('warning');
        expect(toast.message).toBe('Warning message');
        expect(toast.isVisible).toBe(true);
      });

      test('should create info toast', () => {
        toast = Toast.info('Info message');

        expect(toast.type).toBe('info');
        expect(toast.message).toBe('Info message');
        expect(toast.isVisible).toBe(true);
      });

      test('should override config in convenience methods', () => {
        toast = Toast.success('Success message', { 
          duration: 1000,
          position: 'top-center'
        });

        expect(toast.type).toBe('success');
        expect(toast.duration).toBe(1000);
        expect(toast.position).toBe('top-center');
      });
    });

    describe('clear', () => {
      test('should clear all toast instances', () => {
        const toast1 = Toast.show('Message 1');
        const toast2 = Toast.show('Message 2');
        const toast3 = Toast.show('Message 3');

        expect(Toast.instances).toHaveLength(3);

        Toast.clear();

        expect(Toast.instances).toHaveLength(0);
        expect(document.querySelectorAll('.pointer-events-auto')).toHaveLength(0);
      });

      test('should handle empty instances array', () => {
        expect(() => Toast.clear()).not.toThrow();
      });
    });

    describe('getContainer', () => {
      test('should create container for each position', () => {
        const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

        positions.forEach(position => {
          const container = Toast.getContainer(position);
          expect(container.id).toBe(`toast-container-${position}`);
          expect(container.parentNode).toBe(document.body);
        });
      });

      test('should reuse existing container', () => {
        const container1 = Toast.getContainer('top-right');
        const container2 = Toast.getContainer('top-right');

        expect(container1).toBe(container2);
      });
    });

    describe('getPositionClasses', () => {
      test('should return correct classes for each position', () => {
        expect(Toast.getPositionClasses('top-left')).toBe('top-4 left-4');
        expect(Toast.getPositionClasses('top-center')).toBe('top-4 left-1/2 transform -translate-x-1/2');
        expect(Toast.getPositionClasses('top-right')).toBe('top-4 right-4');
        expect(Toast.getPositionClasses('bottom-left')).toBe('bottom-4 left-4');
        expect(Toast.getPositionClasses('bottom-center')).toBe('bottom-4 left-1/2 transform -translate-x-1/2');
        expect(Toast.getPositionClasses('bottom-right')).toBe('bottom-4 right-4');
      });

      test('should return default position for unknown position', () => {
        expect(Toast.getPositionClasses('unknown')).toBe('top-4 right-4');
      });
    });
  });

  describe('styling methods', () => {
    test('should return correct type classes', () => {
      const successToast = new Toast({ type: 'success' });
      const errorToast = new Toast({ type: 'error' });
      const warningToast = new Toast({ type: 'warning' });
      const infoToast = new Toast({ type: 'info' });

      expect(successToast.getTypeClasses()).toContain('bg-green-50');
      expect(errorToast.getTypeClasses()).toContain('bg-red-50');
      expect(warningToast.getTypeClasses()).toContain('bg-yellow-50');
      expect(infoToast.getTypeClasses()).toContain('bg-blue-50');

      successToast.destroy();
      errorToast.destroy();
      warningToast.destroy();
      infoToast.destroy();
    });

    test('should return correct icon classes', () => {
      const successToast = new Toast({ type: 'success' });
      const errorToast = new Toast({ type: 'error' });
      const warningToast = new Toast({ type: 'warning' });
      const infoToast = new Toast({ type: 'info' });

      expect(successToast.getIconClasses()).toContain('text-green-400');
      expect(errorToast.getIconClasses()).toContain('text-red-400');
      expect(warningToast.getIconClasses()).toContain('text-yellow-400');
      expect(infoToast.getIconClasses()).toContain('text-blue-400');

      successToast.destroy();
      errorToast.destroy();
      warningToast.destroy();
      infoToast.destroy();
    });

    test('should return default classes for unknown type', () => {
      const unknownToast = new Toast({ type: 'unknown' });

      expect(unknownToast.getTypeClasses()).toContain('bg-blue-50');
      expect(unknownToast.getIconClasses()).toContain('text-blue-400');

      unknownToast.destroy();
    });
  });

  describe('rendering', () => {
    test('should render basic toast', () => {
      toast = new Toast({
        message: 'Test message',
        type: 'info'
      });

      toast.render();

      expect(toast.rendered).toBe(true);
      expect(toast.el).toBeTruthy();
      expect(toast.el.textContent).toContain('Test message');
    });

    test('should render toast with title', () => {
      toast = new Toast({
        title: 'Test Title',
        message: 'Test message'
      });

      toast.render();

      const titleEl = toast.el.querySelector('.font-medium');
      expect(titleEl).toBeTruthy();
      expect(titleEl.textContent).toBe('Test Title');
    });

    test('should render close button when closable', () => {
      toast = new Toast({
        message: 'Test message',
        closable: true
      });

      toast.render();

      const closeBtn = toast.el.querySelector('.aionda-toast-close');
      expect(closeBtn).toBeTruthy();
    });

    test('should not render close button when not closable', () => {
      toast = new Toast({
        message: 'Test message',
        closable: false
      });

      toast.render();

      const closeBtn = toast.el.querySelector('.aionda-toast-close');
      expect(closeBtn).toBeFalsy();
    });

    test('should render progress bar when duration > 0 and not persistent', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 5000,
        persistent: false
      });

      toast.render();

      const progressEl = toast.el.querySelector('.toast-progress');
      expect(progressEl).toBeTruthy();
    });

    test('should not render progress bar when persistent', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 5000,
        persistent: true
      });

      toast.render();

      const progressEl = toast.el.querySelector('.toast-progress');
      expect(progressEl).toBeFalsy();
    });

    test('should not render progress bar when duration is 0', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 0,
        persistent: false
      });

      toast.render();

      const progressEl = toast.el.querySelector('.toast-progress');
      expect(progressEl).toBeFalsy();
    });
  });

  describe('timer functionality', () => {
    test('should start timer when shown', (done) => {
      toast = new Toast({
        message: 'Test message',
        duration: 100
      });

      const hideHandler = jest.fn();
      toast.on('hide', hideHandler);

      toast.show();

      setTimeout(() => {
        expect(hideHandler).toHaveBeenCalled();
        done();
      }, 150);
    });

    test('should not start timer when duration is 0', (done) => {
      toast = new Toast({
        message: 'Test message',
        duration: 0
      });

      toast.show();

      setTimeout(() => {
        expect(toast.isVisible).toBe(true);
        done();
      }, 100);
    });

    test('should not start timer when persistent', (done) => {
      toast = new Toast({
        message: 'Test message',
        duration: 100,
        persistent: true
      });

      toast.show();

      setTimeout(() => {
        expect(toast.isVisible).toBe(true);
        done();
      }, 150);
    });

    test('should pause timer on mouse enter', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 5000
      });

      toast.show();
      expect(toast.isTimerActive()).toBe(true);

      const mouseEnterEvent = new MouseEvent('mouseenter');
      toast.el.dispatchEvent(mouseEnterEvent);

      expect(toast.isTimerActive()).toBe(false);
    });

    test('should resume timer on mouse leave', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 5000
      });

      toast.show();
      
      const mouseEnterEvent = new MouseEvent('mouseenter');
      toast.el.dispatchEvent(mouseEnterEvent);
      
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      toast.el.dispatchEvent(mouseLeaveEvent);

      expect(toast.isTimerActive()).toBe(true);
    });

    test('should emit mouseenter and mouseleave events', () => {
      const mouseEnterHandler = jest.fn();
      const mouseLeaveHandler = jest.fn();

      toast = new Toast({
        message: 'Test message',
        duration: 5000
      });

      toast.on('mouseenter', mouseEnterHandler);
      toast.on('mouseleave', mouseLeaveHandler);
      toast.show();

      const mouseEnterEvent = new MouseEvent('mouseenter');
      toast.el.dispatchEvent(mouseEnterEvent);

      const mouseLeaveEvent = new MouseEvent('mouseleave');
      toast.el.dispatchEvent(mouseLeaveEvent);

      expect(mouseEnterHandler).toHaveBeenCalled();
      expect(mouseLeaveHandler).toHaveBeenCalled();
    });
  });

  describe('user interaction', () => {
    test('should hide toast when close button clicked', () => {
      toast = new Toast({
        message: 'Test message',
        closable: true
      });

      const hideHandler = jest.fn();
      toast.on('hide', hideHandler);

      toast.show();

      const closeBtn = toast.el.querySelector('.aionda-toast-close');
      closeBtn.click();

      expect(hideHandler).toHaveBeenCalled();
    });

    test('should handle close button click when not closable', () => {
      toast = new Toast({
        message: 'Test message',
        closable: false
      });

      toast.show();

      const closeBtn = toast.el.querySelector('.aionda-toast-close');
      expect(closeBtn).toBeFalsy();
    });
  });

  describe('show/hide with animation', () => {
    test('should show toast with animation', () => {
      toast = new Toast({
        message: 'Test message',
        animate: true
      });

      const showHandler = jest.fn();
      toast.on('show', showHandler);

      toast.show();

      expect(toast.isVisible).toBe(true);
      expect(showHandler).toHaveBeenCalled();
      expect(Toast.instances).toContain(toast);
    });

    test('should show toast without animation', () => {
      toast = new Toast({
        message: 'Test message',
        animate: false
      });

      toast.show();

      expect(toast.el.classList.contains('opacity-100')).toBe(true);
      expect(toast.el.classList.contains('translate-x-0')).toBe(true);
    });

    test('should hide toast with animation', (done) => {
      toast = new Toast({
        message: 'Test message',
        animate: true
      });

      const hideHandler = jest.fn();
      toast.on('hide', hideHandler);

      toast.show();
      toast.hide();

      expect(toast.isVisible).toBe(false);
      expect(hideHandler).toHaveBeenCalled();

      setTimeout(() => {
        expect(toast.destroyed).toBe(true);
        done();
      }, 350);
    });

    test('should hide toast without animation', () => {
      toast = new Toast({
        message: 'Test message',
        animate: false
      });

      toast.show();
      toast.hide();

      expect(toast.destroyed).toBe(true);
    });

    test('should not hide already hidden toast', () => {
      toast = new Toast({
        message: 'Test message'
      });

      expect(() => toast.hide()).not.toThrow();
    });
  });

  describe('message and title updates', () => {
    test('should update message when rendered', () => {
      toast = new Toast({
        message: 'Original message'
      });

      toast.show();
      toast.setMessage('Updated message');

      const messageEl = toast.el.querySelector('p:last-child');
      expect(messageEl.textContent).toBe('Updated message');
    });

    test('should update title when rendered', () => {
      toast = new Toast({
        title: 'Original title',
        message: 'Test message'
      });

      toast.show();
      toast.setTitle('Updated title');

      const titleEl = toast.el.querySelector('p.font-medium');
      expect(titleEl.textContent).toBe('Updated title');
    });

    test('should handle setMessage when not rendered', () => {
      toast = new Toast({
        message: 'Original message'
      });

      expect(() => toast.setMessage('Updated message')).not.toThrow();
      expect(toast.message).toBe('Updated message');
    });

    test('should handle setTitle when not rendered', () => {
      toast = new Toast({
        title: 'Original title'
      });

      expect(() => toast.setTitle('Updated title')).not.toThrow();
      expect(toast.title).toBe('Updated title');
    });
  });

  describe('getters', () => {
    test('should return correct duration', () => {
      toast = new Toast({ duration: 3000 });
      expect(toast.getDuration()).toBe(3000);
    });

    test('should return correct position', () => {
      toast = new Toast({ position: 'bottom-left' });
      expect(toast.getPosition()).toBe('bottom-left');
    });

    test('should return correct type', () => {
      toast = new Toast({ type: 'warning' });
      expect(toast.getType()).toBe('warning');
    });

    test('should return timer active status', () => {
      toast = new Toast({ duration: 5000 });
      expect(toast.isTimerActive()).toBe(false);

      toast.show();
      expect(toast.isTimerActive()).toBe(true);
    });
  });

  describe('destruction', () => {
    test('should destroy toast properly', () => {
      toast = new Toast({
        message: 'Test message'
      });

      toast.show();
      toast.destroy();

      expect(toast.destroyed).toBe(true);
      expect(Toast.instances).not.toContain(toast);
    });

    test('should remove from instances array on destroy', () => {
      toast = new Toast({ message: 'Test message' });
      toast.show();

      expect(Toast.instances).toContain(toast);

      toast.destroy();

      expect(Toast.instances).not.toContain(toast);
    });

    test('should handle multiple destroy calls', () => {
      toast = new Toast({ message: 'Test message' });
      toast.show();

      toast.destroy();
      toast.destroy();

      expect(toast.destroyed).toBe(true);
    });

    test('should pause timer on destroy', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 5000
      });

      toast.show();
      expect(toast.isTimerActive()).toBe(true);

      toast.destroy();

      expect(toast.isTimerActive()).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle multiple show calls', () => {
      toast = new Toast({ message: 'Test message' });

      toast.show();
      toast.show();

      expect(document.querySelectorAll('.pointer-events-auto')).toHaveLength(1);
    });

    test('should handle hide before show', () => {
      toast = new Toast({ message: 'Test message' });

      expect(() => toast.hide()).not.toThrow();
    });

    test('should handle destroy without show', () => {
      toast = new Toast({ message: 'Test message' });

      expect(() => toast.destroy()).not.toThrow();
    });

    test('should handle zero duration', () => {
      toast = new Toast({
        message: 'Test message',
        duration: 0
      });

      toast.show();

      expect(toast.isTimerActive()).toBe(false);
    });

    test('should handle negative duration', () => {
      toast = new Toast({
        message: 'Test message',
        duration: -100
      });

      toast.show();

      expect(toast.isTimerActive()).toBe(false);
    });

    test('should handle custom icon override', () => {
      toast = new Toast({
        message: 'Test message',
        type: 'success',
        icon: '🎉'
      });

      expect(toast.icon).toBe('🎉');
    });

    test('should handle positioning with multiple toasts', () => {
      const toast1 = Toast.show('Message 1', { position: 'top-right' });
      const toast2 = Toast.show('Message 2', { position: 'top-right' });

      const container = document.getElementById('toast-container-top-right');
      expect(container.children).toHaveLength(2);

      toast1.destroy();
      toast2.destroy();
    });
  });
});