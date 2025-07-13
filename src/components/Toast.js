import { Component } from '../core/Component.js';

/**
 * @component Toast
 * @extends Component
 * @description A non-intrusive notification component that appears temporarily to show status messages
 * @category Feedback Components
 * @since 1.0.0
 * @example
 * // Success notification
 * Toast.show({
 *   message: 'Data saved successfully!',
 *   type: 'success',
 *   duration: 3000,
 *   position: 'top-right'
 * });
 */
export class Toast extends Component {
    /**
   * @config
   * @property {string} message - Toast message text
   * @property {string} [type='info'] - Toast type ('info', 'success', 'warning', 'error')
   * @property {number} [duration=5000] - Duration in milliseconds (0 for permanent)
   * @property {string} [position='top-right'] - Toast position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
   * @property {boolean} [closable=true] - Whether toast has close button
   * @property {string} [iconCls] - Custom icon CSS class
   * @property {Function} [onClick] - Click handler function
   * @property {boolean} [autoHide=true] - Whether toast auto-hides after duration
   */
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.message = config.message || '';
    this.title = config.title || '';
    this.type = config.type || 'info';
    this.position = config.position || 'top-right';
    this.duration = config.duration !== undefined ? config.duration : 5000;
    this.closable = config.closable !== undefined ? config.closable : true;
    this.animate = config.animate !== undefined ? config.animate : true;
    this.persistent = config.persistent !== undefined ? config.persistent : false;
    
    this.icon = config.icon || this.getDefaultIcon();
    this.isVisible = false;
    
    this.timeoutId = null;
    this.progressEl = null;
    this.closeButtonEl = null;
    this.startTime = null;
    this.remainingTime = this.duration;
    this.isPaused = false;
    
    if (!Toast.instances) {
      Toast.instances = [];
    }
  }

  static show(message, options = {}) {
    const toast = new Toast({
      message,
      ...options
    });
    return toast.show();
  }

  static info(message, options = {}) {
    return Toast.show(message, { ...options, type: 'info' });
  }

  static success(message, options = {}) {
    return Toast.show(message, { ...options, type: 'success' });
  }

  static warning(message, options = {}) {
    return Toast.show(message, { ...options, type: 'warning' });
  }

  static error(message, options = {}) {
    return Toast.show(message, { ...options, type: 'error' });
  }

  getDefaultIcon() {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[this.type] || icons.info;
  }

  static getDefaultIcon(type) {
    const icons = {
      info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>`,
      success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>`,
      warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>`,
      error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>`
    };
    return icons[type] || icons.info;
  }

  createTemplate() {
    const titleHtml = this.title ? `<p class="font-medium text-sm text-gray-900">${this.title}</p>` : '';
    const messageHtml = this.message ? `<p class="text-sm text-gray-700">${this.message}</p>` : '';
    const closeButtonHtml = this.closable ? this.getCloseButtonHtml() : '';
    const progressBarHtml = this.duration > 0 && !this.persistent ? this.getProgressBarHtml() : '';
    
    return `
      <div class="pointer-events-auto max-w-lg w-full bg-white shadow-lg rounded-lg overflow-hidden ${this.getTypeClasses().join(' ')}">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="${this.getIconClasses()}">${this.icon}</span>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              ${titleHtml}
              ${messageHtml}
            </div>
            ${closeButtonHtml}
          </div>
        </div>
        ${progressBarHtml}
      </div>
    `;
  }

  getToastClasses() {
    const classes = [
      'max-w-sm',
      'bg-white',
      'shadow-lg',
      'rounded-lg',
      'pointer-events-auto',
      'ring-1',
      'ring-black',
      'ring-opacity-5',
      'overflow-hidden'
    ];

    const typeClasses = this.getTypeClasses();
    classes.push(...typeClasses);

    if (this.animate) {
      classes.push('transform', 'transition-all', 'duration-300');
    }

    return classes;
  }

  getTypeClasses() {
    switch (this.type) {
      case 'success':
        return ['bg-green-50', 'border-green-200'];
      case 'warning':
        return ['bg-yellow-50', 'border-yellow-200'];
      case 'error':
        return ['bg-red-50', 'border-red-200'];
      case 'info':
      default:
        return ['bg-blue-50', 'border-blue-200'];
    }
  }

  getIconClasses() {
    switch (this.type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'info':
      default:
        return 'text-blue-400';
    }
  }

  getIconHtml() {
    const icon = this.icon;
    const colorClass = this.getIconColorClass();
    
    return `<div class="aionda-toast-icon flex-shrink-0 ${colorClass}">${icon}</div>`;
  }

  getIconColorClass() {
    switch (this.type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  }

  getCloseButtonHtml() {
    return `
      <div class="ml-4 flex-shrink-0 flex">
        <button class="aionda-toast-close bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span class="sr-only">${this.t('common.close')}</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;
  }

  getProgressBarHtml() {
    const colorClass = this.getProgressColorClass();
    
    return `
      <div class="toast-progress bg-gray-200 h-1">
        <div class="toast-progress-bar ${colorClass} h-full transition-all duration-100 ease-linear" style="width: 100%"></div>
      </div>
    `;
  }

  getProgressColorClass() {
    switch (this.type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  }

  render() {
    if (this.destroyed) {
      throw new Error('Cannot render destroyed component');
    }

    if (this.rendered && this.el) {
      return this.el;
    }

    const template = this.createTemplate();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template.trim();
    this.el = wrapper.firstElementChild;

    if (!this.el) {
      throw new Error('Component template must return a valid HTML element');
    }

    this.el.id = this.id;
    this.setupEventListeners();

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.progressEl = this.el.querySelector('.toast-progress-bar');
    this.closeButtonEl = this.el.querySelector('.aionda-toast-close');

    if (this.closeButtonEl) {
      this.closeButtonEl.addEventListener('click', () => this.hide());
    }

    this.el.addEventListener('mouseenter', () => this.pauseTimer());
    this.el.addEventListener('mouseleave', () => this.resumeTimer());

    this.el.addEventListener('click', (event) => {
      this.emit('click', { toast: this, event });
    });
  }

  show() {
    if (this.isVisible) return this;
    
    this.render();
    const container = Toast.getContainer(this.position);
    container.appendChild(this.el);

    this.isVisible = true;
    Toast.instances.push(this);

    if (this.animate && this.el) {
      requestAnimationFrame(() => {
        if (this.el && !this.destroyed) {
          this.el.classList.add('toast-enter');
        }
      });
    } else {
      this.el.classList.add('opacity-100', 'translate-x-0');
    }

    if (this.duration > 0 && !this.persistent) {
      this.startTimer();
    }

    this.emit('show');
    return this;
  }

  hide() {
    if (!this.isVisible) return this;
    
    this.isVisible = false;
    this.clearTimer();

    if (this.animate) {
      this.el.classList.add('toast-exit');
      setTimeout(() => {
        this.remove();
      }, 300);
    } else {
      this.remove();
    }

    this.emit('hide');
    return this;
  }

  close() {
    return this.hide();
  }

  remove() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    const index = Toast.instances.indexOf(this);
    if (index > -1) {
      Toast.instances.splice(index, 1);
    }
    this.destroy();
  }

  startTimer() {
    if (this.duration <= 0) return;

    this.startTime = Date.now();
    this.remainingTime = this.duration;
    this.isPaused = false;

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, this.duration);

    if (this.progressEl) {
      this.animateProgress();
    }
  }

  pauseTimer() {
    if (!this.timeoutId || this.isPaused) return;

    this.clearTimer();
    this.remainingTime = this.duration - (Date.now() - this.startTime);
    this.isPaused = true;
    this.emit('mouseenter');

    if (this.progressEl) {
      this.progressEl.style.animationPlayState = 'paused';
    }
  }

  resumeTimer() {
    if (!this.isPaused) return;

    this.startTime = Date.now();
    this.isPaused = false;
    this.emit('mouseleave');

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, this.remainingTime);

    if (this.progressEl) {
      this.progressEl.style.animationPlayState = 'running';
      this.animateProgress();
    }
  }

  clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  animateProgress() {
    if (!this.progressEl) return;

    const duration = this.isPaused ? this.remainingTime : this.duration;
    this.progressEl.style.transition = `width ${duration}ms linear`;
    this.progressEl.style.width = '0%';
  }

  static getContainer(position) {
    const containerId = `toast-container-${position}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = `aionda-toast-container fixed ${Toast.getPositionClasses(position)} z-50 p-4 space-y-4 pointer-events-none`;
      document.body.appendChild(container);
    }

    return container;
  }

  static getPositionClasses(position) {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4'
    };

    return positions[position] || positions['top-right'];
  }

  static clear() {
    if (Toast.instances) {
      Toast.instances.forEach(toast => {
        if (toast && !toast.destroyed) {
          toast.hide();
        }
      });
      Toast.instances = [];
    }
    
    const containers = document.querySelectorAll('[id^="toast-container-"]');
    containers.forEach(container => {
      container.innerHTML = '';
    });
  }

  getDuration() {
    return this.duration;
  }

  getPosition() {
    return this.position;
  }

  getType() {
    return this.type;
  }

  isTimerActive() {
    return !!this.timeoutId && !this.isPaused;
  }

  setMessage(message) {
    this.message = message;
    if (this.rendered && this.el) {
      const messageEl = this.el.querySelector('p:last-child');
      if (messageEl) {
        messageEl.textContent = message;
      }
    }
  }

  setTitle(title) {
    this.title = title;
    if (this.rendered && this.el) {
      const titleEl = this.el.querySelector('p.font-medium');
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
  }

  destroy() {
    if (this.destroyed) return;

    this.clearTimer();
    const index = Toast.instances.indexOf(this);
    if (index > -1) {
      Toast.instances.splice(index, 1);
    }
    super.destroy();
  }
}