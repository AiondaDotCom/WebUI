# API Reference

This section provides detailed API documentation for Aionda WebUI's core classes and utilities.

## Core Classes

### Component

The base class for all UI components in Aionda WebUI.

**[Full Documentation →](../components/component.md)**

```javascript
class MyComponent extends AiondaWebUI.Component {
    createTemplate() {
        return '<div class="my-component">Hello World</div>';
    }
}
```

**Key Methods:**
- `render()` - Renders the component to DOM
- `renderTo(target)` - Renders and appends to target element
- `show()` / `hide()` - Controls visibility
- `destroy()` - Cleanup and remove from DOM
- `on(event, handler)` - Event listener registration
- `emit(event, data)` - Event emission

### EventEmitter

Event system providing observer pattern functionality.

**[Full Documentation →](../components/eventemitter.md)**

```javascript
const emitter = new AiondaWebUI.EventEmitter();

// Listen for events
emitter.on('dataChange', (data) => {
    console.log('Data changed:', data);
});

// Emit events
emitter.emit('dataChange', { value: 'new data' });
```

**Key Methods:**
- `on(event, handler)` - Add event listener
- `off(event, handler)` - Remove event listener
- `once(event, handler)` - Add one-time listener
- `emit(event, ...args)` - Emit event
- `removeAllListeners(event)` - Remove all listeners

### Store

Data management class with filtering, sorting, and remote loading.

**[Full Documentation →](../components/store.md)**

```javascript
const store = new AiondaWebUI.Store({
    data: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 }
    ],
    sorters: [{ property: 'name', direction: 'ASC' }]
});

// Filter data
store.filter('name', 'John');

// Sort data
store.sort('age', 'DESC');
```

**Key Methods:**
- `load()` - Load data from remote source
- `add(record)` - Add new record
- `remove(record)` - Remove record
- `filter(property, value)` - Filter data
- `sort(property, direction)` - Sort data
- `getData()` - Get current data

## Utility Classes

### I18n

Internationalization and localization support.

**[Full Documentation →](../components/i18n.md)**

```javascript
const i18n = AiondaWebUI.I18n.getInstance();
i18n.setLocale('de');
const message = i18n.t('common.save'); // Returns translated text
```

### SecurityUtils

Security utilities for input sanitization and XSS prevention.

**[Full Documentation →](../components/securityutils.md)**

```javascript
const safe = AiondaWebUI.SecurityUtils.escapeHtml(userInput);
const cleanHtml = AiondaWebUI.SecurityUtils.sanitizeHtml(htmlContent);
```

## Component Lifecycle

All components follow a standard lifecycle:

### 1. Construction
```javascript
const component = new AiondaWebUI.Button({
    text: 'Click Me',
    variant: 'primary'
});
```

### 2. Rendering
```javascript
// Option 1: Render and get element
const el = component.render();
document.body.appendChild(el);

// Option 2: Render directly to target
component.renderTo('#container');
```

### 3. Event Handling
```javascript
component.on('click', () => {
    console.log('Button clicked!');
});
```

### 4. Updates
```javascript
component.setText('New Text');
component.setVariant('secondary');
```

### 5. Cleanup
```javascript
component.destroy(); // Removes from DOM and cleans up listeners
```

## Event System

### Event Types

#### Component Events
- `render` - Fired when component is rendered
- `show` / `hide` - Visibility changes
- `destroy` - Component cleanup

#### User Interaction Events
- `click` - Mouse clicks
- `focus` / `blur` - Focus changes
- `change` - Value changes

#### Custom Events
Components can emit custom events:

```javascript
component.emit('customEvent', {
    data: 'custom data',
    timestamp: Date.now()
});
```

### Event Object Structure

```javascript
{
    type: 'click',           // Event type
    target: component,       // Source component
    originalEvent: event,    // Original DOM event (if applicable)
    data: {...}             // Event-specific data
}
```

## Configuration System

### Common Configuration Properties

All components accept these base configuration properties:

```javascript
{
    id: 'my-component',           // Unique identifier
    cls: 'custom-class',          // Additional CSS classes
    width: 300,                   // Component width
    height: 200,                  // Component height
    hidden: false,                // Initial visibility
    disabled: false,              // Disabled state
    style: { color: 'red' },      // Inline styles
    renderTo: '#container'        // Auto-render target
}
```

### Component-Specific Configuration

Each component has its own configuration properties. See individual component documentation for details.

## Data Binding

### Two-Way Data Binding

Form components support two-way data binding:

```javascript
const field = new AiondaWebUI.TextField({
    value: 'initial value'
});

// Get current value
const value = field.getValue();

// Set new value
field.setValue('new value');

// Listen for changes
field.on('change', (event) => {
    console.log('New value:', event.value);
});
```

### Store Integration

Components can be bound to data stores:

```javascript
const store = new AiondaWebUI.Store({
    data: userData
});

const grid = new AiondaWebUI.Grid({
    store: store,
    columns: columnConfig
});

// Grid automatically updates when store data changes
store.add({ id: 3, name: 'Bob', age: 35 });
```

## Error Handling

### Component Error Events

```javascript
component.on('error', (error) => {
    console.error('Component error:', error);
});
```

### Validation Errors

Form components emit validation errors:

```javascript
field.on('validationerror', (error) => {
    console.log('Validation failed:', error.message);
});
```

### Global Error Handling

```javascript
// Listen for all component errors
AiondaWebUI.EventEmitter.on('error', (error) => {
    // Global error handling
});
```

## Performance Considerations

### Efficient Rendering

- Components use virtual DOM concepts for efficient updates
- Only changed properties trigger re-rendering
- Batch multiple updates for better performance

### Memory Management

- Always call `destroy()` when components are no longer needed
- Event listeners are automatically cleaned up on destroy
- Use weak references for large data sets

### Best Practices

1. **Lazy Loading**: Create components only when needed
2. **Event Delegation**: Use parent containers for event handling when possible
3. **Data Optimization**: Use pagination for large datasets
4. **Component Reuse**: Cache and reuse components when appropriate

## Browser Compatibility

### Supported Features

- ES6 Classes and Modules
- Promise-based APIs
- Modern DOM APIs
- CSS Grid and Flexbox

### Polyfills

For older browser support, include these polyfills:

```html
<!-- For IE11 support -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

## TypeScript Support

While Aionda WebUI is written in pure JavaScript, TypeScript definitions are available:

```typescript
declare namespace AiondaWebUI {
    interface ButtonConfig {
        text?: string;
        variant?: 'primary' | 'secondary' | 'success' | 'danger';
        handler?: () => void;
    }
    
    class Button extends Component {
        constructor(config?: ButtonConfig);
        setText(text: string): Button;
        setVariant(variant: string): Button;
    }
}
```

## See Also

- [Getting Started](../getting-started.md) - Quick start guide
- [Component Reference](../components/) - All components
- [Examples](../examples/) - Working examples
- [Advanced Guides](../guides/) - Advanced usage patterns