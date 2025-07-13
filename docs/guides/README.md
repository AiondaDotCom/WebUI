# Advanced Usage Guides

This section provides in-depth guides for advanced Aionda WebUI usage patterns, best practices, and architectural approaches.

## 🏗️ Architecture Patterns

### 1. Component-Based Architecture

Aionda WebUI follows a component-based architecture where each UI element is a self-contained component with its own state, rendering logic, and event handling.

```javascript
// Base component structure
class MyComponent extends AiondaWebUI.Component {
    constructor(config = {}) {
        super(config);
        // Component-specific initialization
        this.data = config.data || [];
        this.mode = config.mode || 'view';
    }

    createTemplate() {
        // Return HTML template string
        return `<div class="my-component">${this.renderContent()}</div>`;
    }

    setupEventListeners() {
        super.setupEventListeners();
        // Add component-specific event listeners
        this.el.addEventListener('click', (e) => this.handleClick(e));
    }

    // Component-specific methods
    renderContent() {
        return this.data.map(item => `<div>${item.name}</div>`).join('');
    }

    handleClick(e) {
        this.emit('itemClick', { target: e.target });
    }
}
```

### 2. MVVM Pattern Implementation

Implement Model-View-ViewModel pattern for complex applications:

```javascript
// Model layer
class UserModel {
    constructor() {
        this.users = [];
        this.eventEmitter = new AiondaWebUI.EventEmitter();
    }

    async fetchUsers() {
        const response = await fetch('/api/users');
        this.users = await response.json();
        this.eventEmitter.emit('usersChanged', this.users);
    }

    addUser(user) {
        this.users.push(user);
        this.eventEmitter.emit('usersChanged', this.users);
    }

    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }
}

// ViewModel layer
class UserViewModel {
    constructor(model) {
        this.model = model;
        this.filteredUsers = [];
        this.searchTerm = '';
        
        // Listen to model changes
        this.model.on('usersChanged', (users) => {
            this.updateFilteredUsers(users);
        });
    }

    updateFilteredUsers(users) {
        this.filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.emit('viewDataChanged', this.filteredUsers);
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.updateFilteredUsers(this.model.users);
    }
}

// View layer (Components)
class UserListView extends AiondaWebUI.Panel {
    constructor(viewModel) {
        super({
            title: 'User Management',
            items: [
                new AiondaWebUI.TextField({
                    placeholder: 'Search users...',
                    handler: (value) => viewModel.setSearchTerm(value)
                }),
                new AiondaWebUI.Grid({
                    store: new AiondaWebUI.Store(),
                    columns: [
                        { text: 'Name', dataIndex: 'name' },
                        { text: 'Email', dataIndex: 'email' }
                    ]
                })
            ]
        });

        this.viewModel = viewModel;
        this.grid = this.items[1];

        // Listen to ViewModel changes
        viewModel.on('viewDataChanged', (data) => {
            this.grid.store.setData(data);
        });
    }
}
```

## 🔄 State Management

### 1. Local Component State

```javascript
class StatefulComponent extends AiondaWebUI.Component {
    constructor(config = {}) {
        super(config);
        
        // Initialize state
        this.state = {
            count: 0,
            items: [],
            loading: false
        };
    }

    setState(newState, callback) {
        // Merge new state with existing state
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Re-render if component is already rendered
        if (this.rendered) {
            this.update(prevState);
        }
        
        // Execute callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
        
        // Emit state change event
        this.emit('stateChange', { prevState, newState: this.state });
    }

    update(prevState) {
        // Update only the parts that changed
        if (prevState.count !== this.state.count) {
            const countEl = this.el.querySelector('.count');
            if (countEl) {
                countEl.textContent = this.state.count;
            }
        }

        if (prevState.loading !== this.state.loading) {
            this.el.classList.toggle('loading', this.state.loading);
        }
    }

    increment() {
        this.setState({ count: this.state.count + 1 });
    }

    async loadData() {
        this.setState({ loading: true });
        
        try {
            const response = await fetch('/api/data');
            const items = await response.json();
            this.setState({ items, loading: false });
        } catch (error) {
            console.error('Failed to load data:', error);
            this.setState({ loading: false });
        }
    }
}
```

### 2. Global State Management

```javascript
// Global state store
class AppStore extends AiondaWebUI.EventEmitter {
    constructor() {
        super();
        this.state = {
            user: null,
            theme: 'light',
            notifications: [],
            preferences: {}
        };
    }

    getState() {
        return { ...this.state };
    }

    setState(path, value) {
        const keys = path.split('.');
        let target = this.state;
        
        // Navigate to the parent of the target property
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in target)) {
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }
        
        // Set the value
        target[keys[keys.length - 1]] = value;
        
        // Emit change event
        this.emit('stateChange', { path, value, state: this.getState() });
    }

    subscribe(path, callback) {
        this.on('stateChange', (event) => {
            if (!path || event.path.startsWith(path)) {
                callback(event);
            }
        });
    }

    // Action methods
    setUser(user) {
        this.setState('user', user);
    }

    setTheme(theme) {
        this.setState('theme', theme);
        document.documentElement.className = theme;
    }

    addNotification(notification) {
        const notifications = [...this.state.notifications, notification];
        this.setState('notifications', notifications);
    }

    removeNotification(id) {
        const notifications = this.state.notifications.filter(n => n.id !== id);
        this.setState('notifications', notifications);
    }
}

// Global store instance
const appStore = new AppStore();

// Component that subscribes to global state
class UserProfile extends AiondaWebUI.Panel {
    constructor() {
        super({
            title: 'User Profile'
        });

        // Subscribe to user state changes
        appStore.subscribe('user', (event) => {
            this.updateUserDisplay(event.value);
        });

        // Initial load
        this.updateUserDisplay(appStore.getState().user);
    }

    updateUserDisplay(user) {
        if (user) {
            this.setTitle(`Profile - ${user.name}`);
            // Update UI with user data
        } else {
            this.setTitle('Please login');
        }
    }
}
```

## 🔌 Event-Driven Architecture

### 1. Custom Event System

```javascript
// Application-wide event bus
class EventBus extends AiondaWebUI.EventEmitter {
    constructor() {
        super();
        this.history = [];
        this.maxHistory = 100;
    }

    emit(event, data) {
        // Log event for debugging
        this.history.push({
            event,
            data,
            timestamp: Date.now(),
            source: this.getCallSource()
        });

        // Keep history limited
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        super.emit(event, data);
    }

    getCallSource() {
        const stack = new Error().stack;
        const lines = stack.split('\n');
        return lines[3] || 'unknown';
    }

    getEventHistory() {
        return [...this.history];
    }

    // Namespace events to avoid conflicts
    namespace(ns) {
        return {
            on: (event, handler) => this.on(`${ns}:${event}`, handler),
            emit: (event, data) => this.emit(`${ns}:${event}`, data),
            off: (event, handler) => this.off(`${ns}:${event}`, handler)
        };
    }
}

// Global event bus
const eventBus = new EventBus();

// Usage in components
class NotificationComponent extends AiondaWebUI.Component {
    constructor() {
        super();
        
        // Create namespaced event handlers
        this.events = eventBus.namespace('notifications');
        
        // Listen for notification events
        this.events.on('show', (data) => this.showNotification(data));
        this.events.on('hide', (id) => this.hideNotification(id));
    }

    showNotification(data) {
        const toast = new AiondaWebUI.Toast(data);
        toast.show();
    }
}

// Emit events from anywhere in the application
eventBus.emit('notifications:show', {
    title: 'Success',
    message: 'Operation completed',
    type: 'success'
});
```

### 2. Command Pattern Implementation

```javascript
// Command interface
class Command {
    execute() {
        throw new Error('Execute method must be implemented');
    }

    undo() {
        throw new Error('Undo method must be implemented');
    }

    canUndo() {
        return true;
    }
}

// Concrete commands
class AddUserCommand extends Command {
    constructor(userStore, userData) {
        super();
        this.userStore = userStore;
        this.userData = userData;
        this.addedUser = null;
    }

    execute() {
        this.addedUser = this.userStore.add(this.userData);
        eventBus.emit('user:added', this.addedUser);
        return this.addedUser;
    }

    undo() {
        if (this.addedUser) {
            this.userStore.remove(this.addedUser.id);
            eventBus.emit('user:removed', this.addedUser);
        }
    }
}

class UpdateUserCommand extends Command {
    constructor(userStore, userId, newData) {
        super();
        this.userStore = userStore;
        this.userId = userId;
        this.newData = newData;
        this.oldData = null;
    }

    execute() {
        this.oldData = this.userStore.get(this.userId);
        this.userStore.update(this.userId, this.newData);
        eventBus.emit('user:updated', { id: this.userId, data: this.newData });
    }

    undo() {
        if (this.oldData) {
            this.userStore.update(this.userId, this.oldData);
            eventBus.emit('user:updated', { id: this.userId, data: this.oldData });
        }
    }
}

// Command manager
class CommandManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 50;
    }

    execute(command) {
        // Remove any commands after current index (for redo functionality)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Execute the command
        const result = command.execute();
        
        // Add to history
        this.history.push(command);
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        
        this.emit('commandExecuted', { command, result });
        return result;
    }

    undo() {
        if (this.canUndo()) {
            const command = this.history[this.currentIndex];
            command.undo();
            this.currentIndex--;
            this.emit('commandUndone', { command });
            return true;
        }
        return false;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            command.execute();
            this.emit('commandRedone', { command });
            return true;
        }
        return false;
    }

    canUndo() {
        return this.currentIndex >= 0 && 
               this.history[this.currentIndex] && 
               this.history[this.currentIndex].canUndo();
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
}

// Usage
const commandManager = new CommandManager();

// Execute commands
const addCommand = new AddUserCommand(userStore, { name: 'John Doe', email: 'john@example.com' });
commandManager.execute(addCommand);

// Undo/Redo
commandManager.undo(); // Removes the user
commandManager.redo(); // Adds the user back
```

## 🔄 Async Operations & Data Flow

### 1. Promise-Based Data Loading

```javascript
class DataService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    async get(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const cacheKey = `${url}:${JSON.stringify(options)}`;
        
        // Return cached data if available and not expired
        if (this.cache.has(cacheKey) && !options.bypassCache) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < (options.cacheTimeout || 300000)) {
                return cached.data;
            }
        }

        // Return pending request if one exists
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Create new request
        const request = this.fetchData(url, options).then(data => {
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            // Remove from pending requests
            this.pendingRequests.delete(cacheKey);
            
            return data;
        }).catch(error => {
            // Remove from pending requests on error
            this.pendingRequests.delete(cacheKey);
            throw error;
        });

        this.pendingRequests.set(cacheKey, request);
        return request;
    }

    async fetchData(url, options) {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    clearCache() {
        this.cache.clear();
    }
}

// Usage with components
class AsyncDataGrid extends AiondaWebUI.Grid {
    constructor(config) {
        super({
            ...config,
            store: new AiondaWebUI.Store()
        });

        this.dataService = new DataService('/api');
        this.loadingState = false;
    }

    async loadData(endpoint, options = {}) {
        if (this.loadingState) return;

        this.setLoadingState(true);
        
        try {
            const data = await this.dataService.get(endpoint, options);
            this.store.setData(data);
            this.emit('dataLoaded', { data, endpoint });
        } catch (error) {
            this.emit('dataLoadError', { error, endpoint });
            console.error('Failed to load data:', error);
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.loadingState = loading;
        this.el.classList.toggle('loading', loading);
        
        if (loading) {
            this.showLoadingIndicator();
        } else {
            this.hideLoadingIndicator();
        }
    }

    showLoadingIndicator() {
        if (!this.loadingEl) {
            this.loadingEl = document.createElement('div');
            this.loadingEl.className = 'loading-overlay';
            this.loadingEl.innerHTML = '<div class="spinner">Loading...</div>';
            this.el.appendChild(this.loadingEl);
        }
    }

    hideLoadingIndicator() {
        if (this.loadingEl) {
            this.loadingEl.remove();
            this.loadingEl = null;
        }
    }
}
```

### 2. Reactive Data Streams

```javascript
// Observable pattern implementation
class Observable {
    constructor(subscribe) {
        this.subscribe = subscribe;
    }

    map(fn) {
        return new Observable(observer => {
            return this.subscribe({
                next: value => observer.next(fn(value)),
                error: error => observer.error(error),
                complete: () => observer.complete()
            });
        });
    }

    filter(predicate) {
        return new Observable(observer => {
            return this.subscribe({
                next: value => {
                    if (predicate(value)) {
                        observer.next(value);
                    }
                },
                error: error => observer.error(error),
                complete: () => observer.complete()
            });
        });
    }

    debounce(delay) {
        return new Observable(observer => {
            let timeoutId;
            
            return this.subscribe({
                next: value => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        observer.next(value);
                    }, delay);
                },
                error: error => observer.error(error),
                complete: () => observer.complete()
            });
        });
    }

    static fromEvent(element, eventType) {
        return new Observable(observer => {
            const handler = event => observer.next(event);
            element.addEventListener(eventType, handler);
            
            return () => {
                element.removeEventListener(eventType, handler);
            };
        });
    }

    static interval(ms) {
        return new Observable(observer => {
            const intervalId = setInterval(() => {
                observer.next(Date.now());
            }, ms);
            
            return () => clearInterval(intervalId);
        });
    }
}

// Usage with search functionality
class SearchComponent extends AiondaWebUI.TextField {
    constructor(config) {
        super(config);
        this.setupSearchStream();
    }

    setupSearchStream() {
        // Create observable from input events
        const searchStream = Observable.fromEvent(this.el.querySelector('input'), 'input')
            .map(event => event.target.value)
            .filter(value => value.length >= 2) // Only search for 2+ characters
            .debounce(300) // Debounce for 300ms
            .map(value => this.search(value));

        // Subscribe to search results
        searchStream.subscribe({
            next: resultsPromise => {
                resultsPromise.then(results => {
                    this.displayResults(results);
                }).catch(error => {
                    this.displayError(error);
                });
            },
            error: error => console.error('Search stream error:', error)
        });
    }

    async search(query) {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        return response.json();
    }

    displayResults(results) {
        this.emit('searchResults', { results });
    }

    displayError(error) {
        this.emit('searchError', { error });
    }
}
```

## 📱 Mobile-First Development

### 1. Responsive Component Design

```javascript
class ResponsiveGrid extends AiondaWebUI.Grid {
    constructor(config) {
        super(config);
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        this.setupResponsiveBehavior();
    }

    setupResponsiveBehavior() {
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.updateResponsiveLayout();
        });

        // Initial layout update
        this.updateResponsiveLayout();
    }

    updateResponsiveLayout() {
        const width = window.innerWidth;
        const isMobile = width < this.breakpoints.mobile;
        const isTablet = width >= this.breakpoints.mobile && width < this.breakpoints.desktop;
        
        if (isMobile) {
            this.setMobileLayout();
        } else if (isTablet) {
            this.setTabletLayout();
        } else {
            this.setDesktopLayout();
        }
    }

    setMobileLayout() {
        // Hide less important columns on mobile
        this.columns.forEach((col, index) => {
            const colEl = this.el.querySelector(`.column-${index}`);
            if (colEl) {
                colEl.style.display = col.mobileHidden ? 'none' : 'table-cell';
            }
        });

        // Increase row height for touch
        this.el.style.setProperty('--row-height', '60px');
        
        // Enable horizontal scroll
        this.el.classList.add('mobile-scroll');
    }

    setTabletLayout() {
        // Show most columns on tablet
        this.columns.forEach((col, index) => {
            const colEl = this.el.querySelector(`.column-${index}`);
            if (colEl) {
                colEl.style.display = col.tabletHidden ? 'none' : 'table-cell';
            }
        });

        this.el.style.setProperty('--row-height', '50px');
        this.el.classList.remove('mobile-scroll');
    }

    setDesktopLayout() {
        // Show all columns on desktop
        this.columns.forEach((col, index) => {
            const colEl = this.el.querySelector(`.column-${index}`);
            if (colEl) {
                colEl.style.display = 'table-cell';
            }
        });

        this.el.style.setProperty('--row-height', '40px');
        this.el.classList.remove('mobile-scroll');
    }
}

// Configure columns with responsive behavior
const responsiveGrid = new ResponsiveGrid({
    columns: [
        { text: 'Name', dataIndex: 'name', flex: 1 },
        { text: 'Email', dataIndex: 'email', flex: 1, mobileHidden: true },
        { text: 'Phone', dataIndex: 'phone', width: 120, tabletHidden: true },
        { text: 'Department', dataIndex: 'dept', width: 100, mobileHidden: true },
        { text: 'Status', dataIndex: 'status', width: 80 }
    ]
});
```

### 2. Touch Gesture Support

```javascript
class TouchableComponent extends AiondaWebUI.Component {
    constructor(config) {
        super(config);
        this.touchData = {
            startX: 0,
            startY: 0,
            startTime: 0,
            isSwipe: false
        };
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        // Touch events
        this.el.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.el.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.el.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Prevent context menu on long press
        this.el.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onTouchStart(e) {
        const touch = e.touches[0];
        this.touchData = {
            startX: touch.clientX,
            startY: touch.clientY,
            startTime: Date.now(),
            isSwipe: false
        };

        this.emit('touchStart', { originalEvent: e, touch });
    }

    onTouchMove(e) {
        if (!this.touchData.startTime) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchData.startX;
        const deltaY = touch.clientY - this.touchData.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Mark as swipe if moved far enough
        if (distance > 10) {
            this.touchData.isSwipe = true;
        }

        this.emit('touchMove', { 
            originalEvent: e, 
            touch, 
            deltaX, 
            deltaY, 
            distance 
        });
    }

    onTouchEnd(e) {
        if (!this.touchData.startTime) return;

        const duration = Date.now() - this.touchData.startTime;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchData.startX;
        const deltaY = touch.clientY - this.touchData.startY;

        // Determine gesture type
        if (this.touchData.isSwipe) {
            this.handleSwipe(deltaX, deltaY, duration);
        } else if (duration > 500) {
            this.handleLongPress(touch);
        } else {
            this.handleTap(touch);
        }

        // Reset touch data
        this.touchData = {};
        this.emit('touchEnd', { originalEvent: e, touch });
    }

    handleSwipe(deltaX, deltaY, duration) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        let direction;

        if (absX > absY) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        this.emit('swipe', { direction, deltaX, deltaY, duration });
    }

    handleLongPress(touch) {
        this.emit('longPress', { touch });
    }

    handleTap(touch) {
        this.emit('tap', { touch });
    }
}

// Usage
class SwipeableCard extends TouchableComponent {
    constructor(config) {
        super(config);
        this.position = 0;
    }

    createTemplate() {
        return `
            <div class="swipeable-card">
                <div class="card-content">
                    ${this.content || 'Card content'}
                </div>
                <div class="card-actions">
                    <button class="action-btn delete">Delete</button>
                    <button class="action-btn archive">Archive</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        this.on('swipe', (event) => {
            if (event.direction === 'left') {
                this.showActions();
            } else if (event.direction === 'right') {
                this.hideActions();
            }
        });

        this.on('tap', () => {
            if (this.position !== 0) {
                this.hideActions();
            }
        });
    }

    showActions() {
        this.position = -120; // Show actions
        this.el.style.transform = `translateX(${this.position}px)`;
        this.el.classList.add('actions-visible');
    }

    hideActions() {
        this.position = 0;
        this.el.style.transform = 'translateX(0)';
        this.el.classList.remove('actions-visible');
    }
}
```

## 🧪 Testing Patterns

### 1. Component Unit Testing

```javascript
// Test utilities
class ComponentTestUtils {
    static createMockElement() {
        const div = document.createElement('div');
        document.body.appendChild(div);
        return div;
    }

    static triggerEvent(element, eventType, data = {}) {
        const event = new CustomEvent(eventType, { detail: data });
        element.dispatchEvent(event);
    }

    static waitFor(condition, timeout = 1000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function check() {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(check, 10);
                }
            }
            
            check();
        });
    }

    static cleanup(component) {
        if (component && component.destroy) {
            component.destroy();
        }
    }
}

// Example test suite
describe('Button Component', () => {
    let button;
    let container;

    beforeEach(() => {
        container = ComponentTestUtils.createMockElement();
    });

    afterEach(() => {
        ComponentTestUtils.cleanup(button);
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    test('should render with correct text', () => {
        button = new AiondaWebUI.Button({
            text: 'Test Button'
        });

        button.renderTo(container);

        expect(button.el.textContent).toContain('Test Button');
        expect(button.el.classList.contains('aionda-button')).toBe(true);
    });

    test('should emit click event when clicked', async () => {
        let clickEmitted = false;
        
        button = new AiondaWebUI.Button({
            text: 'Clickable Button'
        });

        button.on('click', () => {
            clickEmitted = true;
        });

        button.renderTo(container);
        button.el.click();

        await ComponentTestUtils.waitFor(() => clickEmitted);
        expect(clickEmitted).toBe(true);
    });

    test('should update text when setText is called', () => {
        button = new AiondaWebUI.Button({
            text: 'Original Text'
        });

        button.renderTo(container);
        button.setText('Updated Text');

        expect(button.el.textContent).toContain('Updated Text');
    });

    test('should handle disabled state', () => {
        button = new AiondaWebUI.Button({
            text: 'Disabled Button',
            disabled: true
        });

        button.renderTo(container);

        expect(button.el.disabled).toBe(true);
        expect(button.el.classList.contains('disabled')).toBe(true);
    });
});
```

### 2. Integration Testing

```javascript
// Integration test example
describe('Form Integration', () => {
    let form;
    let container;

    beforeEach(() => {
        container = ComponentTestUtils.createMockElement();
    });

    afterEach(() => {
        ComponentTestUtils.cleanup(form);
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    test('should validate form fields and show errors', async () => {
        const nameField = new AiondaWebUI.TextField({
            label: 'Name',
            required: true,
            validators: [
                { type: 'minLength', value: 2, message: 'Name too short' }
            ]
        });

        const emailField = new AiondaWebUI.TextField({
            label: 'Email',
            type: 'email',
            required: true
        });

        form = new AiondaWebUI.Form({
            title: 'Test Form',
            items: [nameField, emailField]
        });

        form.renderTo(container);

        // Test validation with invalid data
        nameField.setValue('X'); // Too short
        emailField.setValue('invalid-email');

        const isValid = form.validate();
        expect(isValid).toBe(false);

        // Check that error messages are displayed
        await ComponentTestUtils.waitFor(() => {
            return container.querySelector('.error-message');
        });

        const errorMessages = container.querySelectorAll('.error-message');
        expect(errorMessages.length).toBeGreaterThan(0);

        // Test with valid data
        nameField.setValue('John Doe');
        emailField.setValue('john@example.com');

        const isValidNow = form.validate();
        expect(isValidNow).toBe(true);
    });
});
```

## 🔧 Performance Optimization

### 1. Virtual Scrolling for Large Lists

```javascript
class VirtualScrollGrid extends AiondaWebUI.Grid {
    constructor(config) {
        super(config);
        this.virtualScrolling = config.virtualScrolling !== false;
        this.rowHeight = config.rowHeight || 40;
        this.visibleRows = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.scrollTop = 0;
    }

    render() {
        const el = super.render();
        
        if (this.virtualScrolling) {
            this.setupVirtualScrolling();
        }
        
        return el;
    }

    setupVirtualScrolling() {
        this.visibleRows = Math.ceil(this.height / this.rowHeight) + 2; // Buffer rows
        
        // Create virtual container
        this.virtualContainer = document.createElement('div');
        this.virtualContainer.className = 'virtual-scroll-container';
        this.virtualContainer.style.height = `${this.store.getCount() * this.rowHeight}px`;
        
        // Create visible rows container
        this.visibleContainer = document.createElement('div');
        this.visibleContainer.className = 'visible-rows';
        
        this.virtualContainer.appendChild(this.visibleContainer);
        this.bodyEl.appendChild(this.virtualContainer);
        
        // Add scroll listener
        this.bodyEl.addEventListener('scroll', (e) => {
            this.onScroll(e);
        });
        
        // Initial render
        this.updateVisibleRows();
    }

    onScroll(e) {
        this.scrollTop = e.target.scrollTop;
        this.updateVisibleRows();
    }

    updateVisibleRows() {
        const newStartIndex = Math.floor(this.scrollTop / this.rowHeight);
        const newEndIndex = Math.min(
            newStartIndex + this.visibleRows,
            this.store.getCount()
        );

        if (newStartIndex !== this.startIndex || newEndIndex !== this.endIndex) {
            this.startIndex = newStartIndex;
            this.endIndex = newEndIndex;
            this.renderVisibleRows();
        }
    }

    renderVisibleRows() {
        // Clear existing rows
        this.visibleContainer.innerHTML = '';
        
        // Set container position
        this.visibleContainer.style.transform = `translateY(${this.startIndex * this.rowHeight}px)`;
        
        // Render visible rows
        for (let i = this.startIndex; i < this.endIndex; i++) {
            const record = this.store.getAt(i);
            if (record) {
                const rowEl = this.createRowElement(record, i);
                this.visibleContainer.appendChild(rowEl);
            }
        }
    }

    createRowElement(record, index) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.style.height = `${this.rowHeight}px`;
        row.dataset.index = index;
        
        this.columns.forEach(column => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = record[column.dataIndex] || '';
            row.appendChild(cell);
        });
        
        return row;
    }
}
```

### 2. Component Pooling

```javascript
class ComponentPool {
    constructor(componentClass, poolSize = 10) {
        this.componentClass = componentClass;
        this.pool = [];
        this.active = new Set();
        this.poolSize = poolSize;
        
        // Pre-create pool
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            const component = new this.componentClass();
            component.pooled = true;
            this.pool.push(component);
        }
    }

    acquire(config = {}) {
        let component;
        
        if (this.pool.length > 0) {
            component = this.pool.pop();
            component.reset(config);
        } else {
            component = new this.componentClass(config);
            component.pooled = true;
        }
        
        this.active.add(component);
        return component;
    }

    release(component) {
        if (this.active.has(component)) {
            this.active.delete(component);
            component.cleanup();
            
            if (this.pool.length < this.poolSize) {
                this.pool.push(component);
            } else {
                component.destroy();
            }
        }
    }

    getStats() {
        return {
            poolSize: this.pool.length,
            activeCount: this.active.size,
            totalCreated: this.pool.length + this.active.size
        };
    }
}

// Usage
const buttonPool = new ComponentPool(AiondaWebUI.Button, 20);

// In your list component
class OptimizedList extends AiondaWebUI.Component {
    constructor(config) {
        super(config);
        this.itemComponents = [];
    }

    renderItems(items) {
        // Release existing components
        this.itemComponents.forEach(comp => {
            buttonPool.release(comp);
        });
        this.itemComponents = [];

        // Acquire new components
        items.forEach(item => {
            const button = buttonPool.acquire({
                text: item.name,
                handler: () => this.onItemClick(item)
            });
            
            button.renderTo(this.bodyEl);
            this.itemComponents.push(button);
        });
    }

    destroy() {
        // Release all components back to pool
        this.itemComponents.forEach(comp => {
            buttonPool.release(comp);
        });
        super.destroy();
    }
}
```

## See Also

- [Getting Started](../getting-started.md) - Installation and basic usage
- [Component Reference](../components/) - Detailed component documentation
- [API Reference](../api/) - Core API documentation
- [Examples](../examples/) - Working examples and demos