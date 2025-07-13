# Examples and Demos

This section provides working examples and demonstrations of Aionda WebUI components and features.

## 🚀 Live Demos

### Window Demo
**[View Demo](../../examples/window-demo/index.html)**

Comprehensive demonstration of the Window component featuring:
- **Basic Windows** - Simple draggable and resizable windows
- **Modal Dialogs** - Modal windows with backdrop interaction
- **Advanced Features** - Minimize, maximize, and close functionality
- **Window Manager** - Multiple window management
- **Event System** - Real-time event logging
- **Mobile Support** - Touch-friendly interactions

```javascript
// Modal window example
const window = new AiondaWebUI.Window({
    title: 'Settings Dialog',
    width: 400,
    height: 300,
    modal: true,
    closable: true,
    centered: true,
    html: '<div class="p-4">Modal content here</div>'
});
window.show();
```

### Advanced Components Demo
**[View Demo](../../examples/advanced-components/index.html)**

Showcases complex component interactions including:
- **Form Validation** - Real-time validation with error display
- **Data Grid** - Excel-like grid with sorting and filtering
- **Menu Systems** - Multi-level navigation menus
- **Toast Notifications** - Temporary message system
- **Component Integration** - How components work together

## 📝 Code Examples

### 1. Simple Contact Form

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
        // Create form fields
        const nameField = new AiondaWebUI.TextField({
            label: 'Full Name',
            placeholder: 'Enter your name',
            required: true,
            validators: [
                { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
            ]
        });

        const emailField = new AiondaWebUI.TextField({
            label: 'Email Address',
            placeholder: 'your@email.com',
            type: 'email',
            required: true,
            validators: [
                { type: 'email', message: 'Please enter a valid email address' }
            ]
        });

        const messageField = new AiondaWebUI.TextArea({
            label: 'Message',
            placeholder: 'Your message here...',
            rows: 4,
            required: true
        });

        const submitButton = new AiondaWebUI.Button({
            text: 'Send Message',
            variant: 'primary',
            icon: 'fas fa-paper-plane',
            handler: () => {
                // Validate all fields
                const isValid = [nameField, emailField, messageField].every(field => field.validate());
                
                if (isValid) {
                    // Show success toast
                    new AiondaWebUI.Toast({
                        title: 'Success!',
                        message: 'Your message has been sent.',
                        type: 'success',
                        autoHide: true,
                        duration: 3000
                    }).show();
                } else {
                    // Show error toast
                    new AiondaWebUI.Toast({
                        title: 'Validation Error',
                        message: 'Please fix the errors and try again.',
                        type: 'error',
                        autoHide: true
                    }).show();
                }
            }
        });

        // Create form
        const form = new AiondaWebUI.Form({
            title: 'Contact Us',
            items: [nameField, emailField, messageField, submitButton],
            cls: 'max-w-md mx-auto mt-8'
        });

        form.renderTo('#app');
    </script>
</body>
</html>
```

### 2. Data Management Dashboard

```javascript
// Create data store
const employeeStore = new AiondaWebUI.Store({
    data: [
        { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', salary: 75000 },
        { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', salary: 65000 },
        { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Sales', salary: 70000 }
    ]
});

// Create toolbar
const toolbar = new AiondaWebUI.Toolbar({
    items: [
        new AiondaWebUI.Button({
            text: 'Add Employee',
            variant: 'primary',
            icon: 'fas fa-plus',
            handler: () => showAddEmployeeDialog()
        }),
        new AiondaWebUI.Button({
            text: 'Export CSV',
            variant: 'secondary',
            icon: 'fas fa-download',
            handler: () => exportToCSV()
        }),
        new AiondaWebUI.TextField({
            placeholder: 'Search employees...',
            cls: 'ml-auto w-64',
            handler: (value) => employeeStore.filter('name', value)
        })
    ]
});

// Create data grid
const grid = new AiondaWebUI.Grid({
    store: employeeStore,
    columns: [
        { text: 'ID', dataIndex: 'id', width: 60, sortable: true },
        { text: 'Name', dataIndex: 'name', width: 150, sortable: true, filterable: true },
        { text: 'Email', dataIndex: 'email', width: 200, sortable: true },
        { text: 'Department', dataIndex: 'department', width: 120, sortable: true, filterable: true },
        { text: 'Salary', dataIndex: 'salary', width: 100, sortable: true, renderer: (value) => `$${value.toLocaleString()}` },
        { 
            text: 'Actions', 
            width: 120, 
            renderer: (value, record) => `
                <button onclick="editEmployee(${record.id})" class="btn-edit">Edit</button>
                <button onclick="deleteEmployee(${record.id})" class="btn-delete ml-2">Delete</button>
            `
        }
    ],
    selectionMode: 'multi',
    height: 400
});

// Create dashboard panel
const dashboard = new AiondaWebUI.Panel({
    title: 'Employee Management Dashboard',
    items: [toolbar, grid],
    cls: 'p-6'
});

dashboard.renderTo('#app');

// Helper functions
function showAddEmployeeDialog() {
    const dialog = new AiondaWebUI.Window({
        title: 'Add New Employee',
        width: 400,
        height: 350,
        modal: true,
        closable: true,
        html: `
            <form class="p-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Name</label>
                    <input type="text" id="emp-name" class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Email</label>
                    <input type="email" id="emp-email" class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Department</label>
                    <select id="emp-dept" class="w-full border rounded px-3 py-2">
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                    </select>
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Salary</label>
                    <input type="number" id="emp-salary" class="w-full border rounded px-3 py-2">
                </div>
                <div class="flex gap-2 justify-end">
                    <button type="button" onclick="cancelAdd()" class="px-4 py-2 border rounded">Cancel</button>
                    <button type="button" onclick="saveEmployee()" class="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                </div>
            </form>
        `
    });
    dialog.show();
}

function exportToCSV() {
    const data = employeeStore.getData();
    const csv = [
        ['ID', 'Name', 'Email', 'Department', 'Salary'].join(','),
        ...data.map(row => [row.id, row.name, row.email, row.department, row.salary].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
}
```

### 3. Interactive Menu System

```javascript
// Create main menu
const mainMenu = new AiondaWebUI.Menu({
    items: [
        new AiondaWebUI.MenuItem({
            text: 'File',
            icon: 'fas fa-file',
            menu: new AiondaWebUI.Menu({
                items: [
                    new AiondaWebUI.MenuItem({
                        text: 'New',
                        icon: 'fas fa-plus',
                        shortcut: 'Ctrl+N',
                        handler: () => createNewFile()
                    }),
                    new AiondaWebUI.MenuItem({
                        text: 'Open',
                        icon: 'fas fa-folder-open',
                        shortcut: 'Ctrl+O',
                        handler: () => openFile()
                    }),
                    new AiondaWebUI.MenuItem({ separator: true }),
                    new AiondaWebUI.MenuItem({
                        text: 'Recent Files',
                        icon: 'fas fa-history',
                        menu: new AiondaWebUI.Menu({
                            items: [
                                new AiondaWebUI.MenuItem({ text: 'document1.txt', handler: () => openRecent('doc1') }),
                                new AiondaWebUI.MenuItem({ text: 'document2.txt', handler: () => openRecent('doc2') })
                            ]
                        })
                    })
                ]
            })
        }),
        new AiondaWebUI.MenuItem({
            text: 'Edit',
            icon: 'fas fa-edit',
            menu: new AiondaWebUI.Menu({
                items: [
                    new AiondaWebUI.MenuItem({
                        text: 'Undo',
                        icon: 'fas fa-undo',
                        shortcut: 'Ctrl+Z',
                        handler: () => undo()
                    }),
                    new AiondaWebUI.MenuItem({
                        text: 'Redo',
                        icon: 'fas fa-redo',
                        shortcut: 'Ctrl+Y',
                        handler: () => redo()
                    })
                ]
            })
        }),
        new AiondaWebUI.MenuItem({
            text: 'View',
            icon: 'fas fa-eye',
            menu: new AiondaWebUI.Menu({
                items: [
                    new AiondaWebUI.MenuItem({
                        text: 'Toggle Sidebar',
                        checkable: true,
                        checked: true,
                        handler: (checked) => toggleSidebar(checked)
                    }),
                    new AiondaWebUI.MenuItem({
                        text: 'Full Screen',
                        shortcut: 'F11',
                        handler: () => toggleFullScreen()
                    })
                ]
            })
        })
    ]
});

mainMenu.renderTo('#menu-container');
```

### 4. Theme Toggle Component

```javascript
// Create theme toggle
const themeToggle = new AiondaWebUI.ThemeToggle({
    themes: ['light', 'dark', 'auto'],
    defaultTheme: 'auto',
    onThemeChange: (theme) => {
        console.log('Theme changed to:', theme);
        // Apply theme-specific styles
        document.documentElement.className = theme === 'dark' ? 'dark' : '';
    }
});

// Add to header
const header = new AiondaWebUI.Panel({
    cls: 'flex justify-between items-center p-4 border-b',
    items: [
        new AiondaWebUI.Button({
            text: 'Aionda WebUI',
            variant: 'ghost',
            cls: 'text-lg font-bold'
        }),
        themeToggle
    ]
});

header.renderTo('#header');
```

### 5. Real-time Notifications

```javascript
// Notification system
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = document.createElement('div');
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(this.container);
    }

    show(type, title, message, duration = 5000) {
        const toast = new AiondaWebUI.Toast({
            type: type,
            title: title,
            message: message,
            autoHide: duration > 0,
            duration: duration,
            closable: true
        });

        const el = toast.render();
        this.container.appendChild(el);
        toast.show();

        // Auto-remove from DOM when hidden
        toast.on('hide', () => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        return toast;
    }

    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }
}

// Usage
const notifications = new NotificationManager();

// Show different types of notifications
notifications.success('Success!', 'Operation completed successfully');
notifications.error('Error!', 'Something went wrong');
notifications.warning('Warning!', 'Please check your input');
notifications.info('Info', 'New update available');
```

## 🎯 Common Patterns

### 1. Form Validation Pattern

```javascript
// Reusable validation mixin
const ValidationMixin = {
    setupValidation() {
        this.validators = this.validators || [];
        this.errors = [];
    },

    addValidator(validator) {
        this.validators.push(validator);
    },

    validate() {
        this.errors = [];
        const value = this.getValue();

        for (const validator of this.validators) {
            if (!validator.fn(value)) {
                this.errors.push(validator.message);
            }
        }

        this.updateValidationUI();
        return this.errors.length === 0;
    },

    updateValidationUI() {
        const errorEl = this.el.querySelector('.error-message');
        if (this.errors.length > 0) {
            this.el.classList.add('has-error');
            if (errorEl) {
                errorEl.textContent = this.errors[0];
            }
        } else {
            this.el.classList.remove('has-error');
            if (errorEl) {
                errorEl.textContent = '';
            }
        }
    }
};
```

### 2. Data Loading Pattern

```javascript
// Async data loading with loading states
async function loadDataWithStates(store, url) {
    // Show loading indicator
    const loadingToast = new AiondaWebUI.Toast({
        title: 'Loading...',
        message: 'Fetching data from server',
        type: 'info',
        autoHide: false
    });
    loadingToast.show();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        store.setData(data);

        // Hide loading and show success
        loadingToast.hide();
        new AiondaWebUI.Toast({
            title: 'Success',
            message: `Loaded ${data.length} records`,
            type: 'success',
            autoHide: true,
            duration: 2000
        }).show();

    } catch (error) {
        // Hide loading and show error
        loadingToast.hide();
        new AiondaWebUI.Toast({
            title: 'Error',
            message: `Failed to load data: ${error.message}`,
            type: 'error',
            autoHide: false
        }).show();
    }
}
```

### 3. Component Factory Pattern

```javascript
// Factory for creating common component configurations
const ComponentFactory = {
    createFormField(type, config) {
        const baseConfig = {
            cls: 'mb-4',
            required: false,
            ...config
        };

        switch (type) {
            case 'text':
                return new AiondaWebUI.TextField(baseConfig);
            case 'email':
                return new AiondaWebUI.TextField({
                    ...baseConfig,
                    type: 'email',
                    validators: [{ type: 'email' }]
                });
            case 'number':
                return new AiondaWebUI.NumberField(baseConfig);
            case 'select':
                return new AiondaWebUI.ComboBox(baseConfig);
            case 'textarea':
                return new AiondaWebUI.TextArea(baseConfig);
            case 'checkbox':
                return new AiondaWebUI.Checkbox(baseConfig);
            default:
                throw new Error(`Unknown field type: ${type}`);
        }
    },

    createButton(variant, text, handler) {
        const variants = {
            primary: { variant: 'primary', cls: 'bg-blue-500 hover:bg-blue-600' },
            secondary: { variant: 'secondary', cls: 'bg-gray-500 hover:bg-gray-600' },
            success: { variant: 'success', cls: 'bg-green-500 hover:bg-green-600' },
            danger: { variant: 'danger', cls: 'bg-red-500 hover:bg-red-600' }
        };

        return new AiondaWebUI.Button({
            text,
            handler,
            ...variants[variant]
        });
    }
};

// Usage
const nameField = ComponentFactory.createFormField('text', {
    label: 'Name',
    placeholder: 'Enter your name',
    required: true
});

const submitBtn = ComponentFactory.createButton('primary', 'Submit', () => {
    console.log('Form submitted');
});
```

## 📱 Mobile Examples

### Touch-friendly Interface

```javascript
// Mobile-optimized component configurations
const mobileGrid = new AiondaWebUI.Grid({
    store: dataStore,
    columns: [
        { text: 'Name', dataIndex: 'name', flex: 1 },
        { text: 'Status', dataIndex: 'status', width: 80 }
    ],
    cls: 'touch-friendly', // Custom CSS for larger touch targets
    rowHeight: 60, // Larger rows for touch
    selectionMode: 'single' // Easier for mobile
});

// Touch-optimized toolbar
const mobileToolbar = new AiondaWebUI.Toolbar({
    orientation: 'vertical', // Better for mobile
    items: [
        new AiondaWebUI.Button({
            text: 'Add',
            icon: 'fas fa-plus',
            iconAlign: 'top', // Icon above text
            cls: 'h-16 w-16' // Large touch target
        })
    ]
});
```

## 🔧 Development Examples

### Custom Component Development

```javascript
// Extending base component
class CustomSlider extends AiondaWebUI.Component {
    constructor(config = {}) {
        super(config);
        this.min = config.min || 0;
        this.max = config.max || 100;
        this.value = config.value || 0;
        this.step = config.step || 1;
    }

    createTemplate() {
        return `
            <div class="custom-slider">
                <label class="block text-sm font-medium mb-2">${this.label || ''}</label>
                <div class="relative">
                    <input type="range" 
                           min="${this.min}" 
                           max="${this.max}" 
                           step="${this.step}" 
                           value="${this.value}"
                           class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>${this.min}</span>
                        <span class="value-display">${this.value}</span>
                        <span>${this.max}</span>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        const input = this.el.querySelector('input[type="range"]');
        const valueDisplay = this.el.querySelector('.value-display');

        input.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);
            valueDisplay.textContent = this.value;
            this.emit('change', { value: this.value });
        });
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
        const input = this.el.querySelector('input[type="range"]');
        if (input) {
            input.value = value;
            this.el.querySelector('.value-display').textContent = value;
        }
    }
}

// Usage
const slider = new CustomSlider({
    label: 'Volume',
    min: 0,
    max: 100,
    value: 50,
    step: 5
});

slider.on('change', (event) => {
    console.log('Slider value:', event.value);
});

slider.renderTo('#slider-container');
```

## See Also

- [Getting Started](../getting-started.md) - Installation and basic usage
- [Component Reference](../components/) - Detailed component documentation
- [API Reference](../api/) - Core API documentation
- [Advanced Guides](../guides/) - Advanced usage patterns