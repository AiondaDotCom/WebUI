# Getting Started with Aionda WebUI

Welcome to Aionda WebUI - a modern, mobile-first WebUI library built with pure ES6 JavaScript and Tailwind CSS.

## Quick Start

### 1. Include the Library

Add the following to your HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="dist/aionda-webui.css">
</head>
<body>
    <div id="app"></div>
    
    <script src="dist/aionda-webui.js"></script>
    <script>
        // Your code here
    </script>
</body>
</html>
```

### 2. Create Your First Component

```javascript
// Create a simple button
const button = new AiondaWebUI.Button({
    text: 'Hello World',
    variant: 'primary',
    handler: () => alert('Button clicked!')
});

// Render to DOM
button.renderTo('#app');
```

### 3. Build a Simple Form

```javascript
// Create form fields
const nameField = new AiondaWebUI.TextField({
    label: 'Name',
    placeholder: 'Enter your name',
    required: true
});

const emailField = new AiondaWebUI.TextField({
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    required: true
});

const submitButton = new AiondaWebUI.Button({
    text: 'Submit',
    variant: 'primary',
    handler: () => {
        const name = nameField.getValue();
        const email = emailField.getValue();
        console.log('Form data:', { name, email });
    }
});

// Create form container
const form = new AiondaWebUI.Form({
    title: 'Contact Form',
    items: [nameField, emailField, submitButton]
});

form.renderTo('#app');
```

## Installation Options

### Option 1: Direct Download

1. Download the latest release from GitHub
2. Include `dist/aionda-webui.js` and `dist/aionda-webui.css` in your project
3. Add Tailwind CSS via CDN or local installation

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/your-username/aionda-webui.git
cd aionda-webui

# Install dependencies
npm install

# Build the library
node build.js

# Run tests
npm test
```

## Core Concepts

### Components

All UI elements in Aionda WebUI are components that extend the base `Component` class:

```javascript
const panel = new AiondaWebUI.Panel({
    title: 'My Panel',
    items: [
        new AiondaWebUI.Button({ text: 'Button 1' }),
        new AiondaWebUI.Button({ text: 'Button 2' })
    ]
});
```

### Event System

Components use an event-driven architecture:

```javascript
const button = new AiondaWebUI.Button({
    text: 'Click Me'
});

// Listen for events
button.on('click', () => {
    console.log('Button was clicked!');
});

// Components can emit custom events
button.emit('customEvent', { data: 'value' });
```

### Data Management

Use the Store class for data management:

```javascript
const store = new AiondaWebUI.Store({
    data: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 }
    ]
});

// Create a grid bound to the store
const grid = new AiondaWebUI.Grid({
    store: store,
    columns: [
        { text: 'Name', dataIndex: 'name' },
        { text: 'Age', dataIndex: 'age' }
    ]
});
```

## Component Categories

### Form Components
- **Button** - Buttons with variants and icons
- **TextField** - Text input fields with validation
- **NumberField** - Numeric input with spinners
- **Checkbox** - Boolean input with switch variants
- **ComboBox** - Dropdown with search and remote data
- **Radio/RadioGroup** - Single selection inputs
- **TextArea** - Multi-line text input
- **DateField** - Date picker input

### Layout Components
- **Panel** - Container with header and collapsible body
- **Window** - Draggable, resizable windows with modal support

### Data Components
- **Grid** - Excel-like grid with sorting, filtering, editing
- **Tree** - Hierarchical data display
- **Form** - Form management with validation

### Navigation Components
- **Menu** - Navigation menus with submenus
- **Toolbar** - Action toolbars with buttons

### Feedback Components
- **Toast** - Temporary notification messages
- **MessageBox** - Modal dialogs for alerts and confirmations

## Best Practices

### 1. Component Configuration

Always provide meaningful configuration:

```javascript
const button = new AiondaWebUI.Button({
    text: 'Save Document',
    variant: 'primary',
    icon: 'fas fa-save',
    ariaLabel: 'Save the current document',
    handler: () => saveDocument()
});
```

### 2. Event Handling

Use event delegation and proper cleanup:

```javascript
const component = new AiondaWebUI.SomeComponent();

// Add event listeners
component.on('someEvent', handleEvent);

// Clean up when done
component.destroy(); // This removes all listeners
```

### 3. Responsive Design

Components are mobile-first by default. Use Tailwind classes for responsiveness:

```javascript
const panel = new AiondaWebUI.Panel({
    cls: 'w-full md:w-1/2 lg:w-1/3', // Responsive width
    title: 'Responsive Panel'
});
```

### 4. Accessibility

Always provide accessibility attributes:

```javascript
const field = new AiondaWebUI.TextField({
    label: 'User Name',
    ariaLabel: 'Enter your user name',
    ariaDescription: 'This will be used for login',
    required: true
});
```

## Next Steps

- [Component Reference](components/index.md) - Detailed documentation for all components
- [API Reference](api/index.md) - Core API documentation
- [Examples](examples/index.md) - Working examples and demos
- [Advanced Guides](guides/index.md) - Advanced usage patterns

## Browser Support

Aionda WebUI supports all modern browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

The library uses ES6+ features and requires no transpilation for modern browsers.