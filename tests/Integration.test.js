import { EventEmitter } from '../src/core/EventEmitter.js';
import { Component } from '../src/core/Component.js';
import { Store } from '../src/core/Store.js';
import { Panel } from '../src/components/Panel.js';
import { Button } from '../src/components/Button.js';
import { Grid } from '../src/components/Grid.js';
import { Form } from '../src/components/Form.js';
import { TextField } from '../src/components/TextField.js';
import { NumberField } from '../src/components/NumberField.js';
import { ComboBox } from '../src/components/ComboBox.js';
import { Checkbox } from '../src/components/Checkbox.js';

describe('Integration Tests - Multi-Component Scenarios', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Form + Grid CRUD Integration', () => {
        let store, grid, form, addButton, deleteButton;
        let nameField, emailField, ageField, activeField;

        beforeEach(() => {
            store = new Store({
                data: [
                    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, active: true },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, active: false }
                ]
            });

            grid = new Grid({
                store: store,
                columns: [
                    { dataIndex: 'name', header: 'Name', width: 150 },
                    { dataIndex: 'email', header: 'Email', width: 200 },
                    { dataIndex: 'age', header: 'Age', width: 80 },
                    { dataIndex: 'active', header: 'Active', width: 80 }
                ],
                selectionMode: 'single'
            });

            nameField = new TextField({
                name: 'name',
                label: 'Name',
                required: true
            });

            emailField = new TextField({
                name: 'email',
                label: 'Email',
                required: true,
                validateFn: (value) => {
                    if (!value.includes('@')) {
                        return 'Invalid email format';
                    }
                    return null;
                }
            });

            ageField = new NumberField({
                name: 'age',
                label: 'Age',
                required: true,
                min: 0,
                max: 120
            });

            activeField = new Checkbox({
                name: 'active',
                label: 'Active',
                checked: true,
                value: true,
                uncheckedValue: false
            });

            form = new Form({
                fields: [nameField, emailField, ageField, activeField]
            });

            addButton = new Button({
                text: 'Add Record',
                handler: () => {
                    if (form.validate()) {
                        const values = form.getValues();
                        const newRecord = {
                            id: Date.now(),
                            ...values
                        };
                        store.add(newRecord);
                        form.reset();
                    }
                }
            });

            deleteButton = new Button({
                text: 'Delete Selected',
                disabled: true,
                handler: () => {
                    const selected = grid.getSelection();
                    if (selected.length > 0) {
                        store.remove(selected[0]);
                    }
                }
            });

            grid.on('selectionchange', (data) => {
                const records = data.selections || [];
                deleteButton.setDisabled(records.length === 0);
                if (records.length > 0) {
                    form.setValues(records[0]);
                } else {
                    form.reset();
                }
            });

            container.appendChild(form.render());
            container.appendChild(addButton.render());
            container.appendChild(deleteButton.render());
            container.appendChild(grid.render());
        });

        test('should add new record via form to grid', () => {
            nameField.setValue('Bob Wilson');
            emailField.setValue('bob@example.com');
            ageField.setValue(35);
            activeField.setValue(false);

            addButton.el.click();

            expect(store.getRecords()).toHaveLength(3);
            const newRecord = store.getRecords().find(r => r.name === 'Bob Wilson');
            expect(newRecord).toBeDefined();
            expect(newRecord.email).toBe('bob@example.com');
            expect(newRecord.age).toBe(35);
            expect(newRecord.active).toBe(false);
        });

        test('should validate form before adding record', () => {
            nameField.setValue('');
            emailField.setValue('invalid-email');
            ageField.setValue(-5);

            addButton.el.click();

            expect(store.getData()).toHaveLength(2);
            expect(form.hasErrors()).toBe(true);
        });

        test('should populate form when grid selection changes', () => {
            const firstRow = grid.el.querySelector('tbody tr');
            firstRow.click();

            expect(nameField.getValue()).toBe('John Doe');
            expect(emailField.getValue()).toBe('john@example.com');
            expect(ageField.getValue()).toBe(30);
            expect(activeField.getValue()).toBe(true);
        });

        test('should enable/disable delete button based on selection', () => {
            expect(deleteButton.disabled).toBe(true);

            const firstRow = grid.el.querySelector('tbody tr');
            firstRow.click();

            expect(deleteButton.disabled).toBe(false);

            deleteButton.el.click();

            expect(store.getData()).toHaveLength(1);
            expect(deleteButton.disabled).toBe(true);
        });

        test('should update form when adding record and clear after add', () => {
            nameField.setValue('Test User');
            emailField.setValue('test@example.com');
            ageField.setValue(25);

            addButton.el.click();

            expect(nameField.getValue()).toBe('');
            expect(emailField.getValue()).toBe('');
            expect(ageField.getValue()).toBe(0);
            expect(activeField.getValue()).toBe(true);
        });
    });

    describe('Store + Multiple Components Integration', () => {
        let store, grid, comboBox, statusField;

        beforeEach(() => {
            store = new Store({
                data: [
                    { id: 1, name: 'Alice', department: 'Engineering', status: 'Active' },
                    { id: 2, name: 'Bob', department: 'Marketing', status: 'Active' },
                    { id: 3, name: 'Charlie', department: 'Engineering', status: 'Inactive' }
                ]
            });

            grid = new Grid({
                store: store,
                columns: [
                    { dataIndex: 'name', header: 'Name' },
                    { dataIndex: 'department', header: 'Department' },
                    { dataIndex: 'status', header: 'Status' }
                ]
            });

            comboBox = new ComboBox({
                label: 'Filter by Department',
                data: [
                    { value: '', text: 'All Departments' },
                    { value: 'Engineering', text: 'Engineering' },
                    { value: 'Marketing', text: 'Marketing' }
                ],
            });

            statusField = new Checkbox({
                label: 'Show Active Only',
                checked: false,
            });
            
            comboBox.on('change', (data) => {
                const value = data.value;
                if (value) {
                    store.filter({ property: 'department', value: value });
                } else {
                    store.clearFilters();
                }
            });
            
            statusField.on('change', (data) => {
                const checked = data.checked;
                if (checked) {
                    store.filter({ property: 'status', value: 'Active' });
                } else {
                    store.clearFilters();
                }
            });

            container.appendChild(comboBox.render());
            container.appendChild(statusField.render());
            container.appendChild(grid.render());
        });

        test('should filter grid data when combobox selection changes', () => {
            expect(grid.store.getRecords()).toHaveLength(3);

            comboBox.setValue('Engineering');
            comboBox.emit('change', { value: 'Engineering' });

            expect(grid.store.getRecords()).toHaveLength(2);
            expect(grid.store.getRecords().every(r => r.department === 'Engineering')).toBe(true);
        });

        test('should filter grid data when checkbox changes', () => {
            expect(grid.store.getRecords()).toHaveLength(3);

            statusField.setValue(true);
            statusField.emit('change', { checked: true });

            expect(grid.store.getRecords()).toHaveLength(2);
            expect(grid.store.getRecords().every(r => r.status === 'Active')).toBe(true);
        });

        test('should clear filters when combobox is reset', () => {
            comboBox.setValue('Engineering');
            expect(grid.store.getFilteredData()).toHaveLength(2);

            comboBox.setValue('');
            expect(grid.store.getRecords()).toHaveLength(3);
        });

        test('should handle multiple filters independently', () => {
            comboBox.setValue('Engineering');
            expect(grid.store.getFilteredData()).toHaveLength(2);

            statusField.setValue(true);
            expect(grid.store.getFilteredData()).toHaveLength(1);
            expect(grid.store.getFilteredData()[0].name).toBe('Alice');
        });

        test('should update grid display when store data changes', () => {
            const initialRows = grid.el.querySelectorAll('tbody tr').length;
            expect(initialRows).toBe(3);

            store.add({ id: 4, name: 'David', department: 'Sales', status: 'Active' });

            const updatedRows = grid.el.querySelectorAll('tbody tr').length;
            expect(updatedRows).toBe(4);
        });
    });

    describe('Event Propagation Integration', () => {
        let parentPanel, childForm, grandchildButton;
        let eventLog;

        beforeEach(() => {
            eventLog = [];

            grandchildButton = new Button({
                text: 'Click Me',
                handler: () => {
                    eventLog.push('button-clicked');
                }
            });

            childForm = new Form({
                fields: [
                    new TextField({ name: 'test', label: 'Test Field' })
                ]
            });

            parentPanel = new Panel({
                title: 'Parent Panel',
                items: [childForm]
            });

            parentPanel.on('custom-event', () => {
                eventLog.push('parent-received-custom-event');
            });

            childForm.on('custom-event', () => {
                eventLog.push('child-received-custom-event');
            });

            grandchildButton.on('custom-event', () => {
                eventLog.push('grandchild-received-custom-event');
            });

            const formBody = childForm.render().querySelector('.aionda-form-body');
            formBody.appendChild(grandchildButton.render());
            container.appendChild(parentPanel.render());
        });

        test('should handle direct event firing', () => {
            grandchildButton.el.click();
            expect(eventLog).toContain('button-clicked');
        });

        test('should propagate custom events through component hierarchy', () => {
            grandchildButton.emit('custom-event');

            expect(eventLog).toContain('grandchild-received-custom-event');
        });

        test('should handle events at multiple levels', () => {
            childForm.emit('custom-event');
            parentPanel.emit('custom-event');

            expect(eventLog).toContain('child-received-custom-event');
            expect(eventLog).toContain('parent-received-custom-event');
        });

        test('should maintain event isolation between components', () => {
            const otherButton = new Button({
                text: 'Other Button',
                handler: () => {
                    eventLog.push('other-button-clicked');
                }
            });

            container.appendChild(otherButton.render());
            otherButton.el.click();

            expect(eventLog).toContain('other-button-clicked');
            expect(eventLog).not.toContain('button-clicked');
        });
    });

    describe('Validation Workflow Integration', () => {
        let masterForm, dependentField, conditionalField, submitButton;
        let validationLog;

        beforeEach(() => {
            validationLog = [];

            dependentField = new TextField({
                name: 'dependent',
                label: 'Dependent Field',
                required: true,
                validateFn: (value) => {
                    validationLog.push(`dependent-validated: ${value}`);
                    if (!value || value.length < 3) {
                        return 'Must be at least 3 characters';
                    }
                    return null;
                }
            });

            conditionalField = new NumberField({
                name: 'conditional',
                label: 'Conditional Field',
                required: false,
                validateFn: (value) => {
                    validationLog.push(`conditional-validated: ${value}`);
                    const dependentValue = dependentField.getValue();
                    if (dependentValue === 'special' && (!value || value < 10)) {
                        return 'Must be at least 10 when dependent field is "special"';
                    }
                    return null;
                }
            });

            masterForm = new Form({
                fields: [dependentField, conditionalField]
            });

            submitButton = new Button({
                text: 'Submit',
                handler: () => {
                    validationLog.push('submit-attempted');
                    if (masterForm.validate()) {
                        validationLog.push('submit-successful');
                    } else {
                        validationLog.push('submit-failed');
                    }
                }
            });

            dependentField.on('change', () => {
                validationLog.push('dependent-changed');
                conditionalField.validate();
            });

            container.appendChild(masterForm.render());
            container.appendChild(submitButton.render());
        });

        test('should validate dependent fields when primary field changes', () => {
            dependentField.setValue('special');
            conditionalField.setValue(5);

            expect(validationLog).toContain('dependent-changed');
            expect(validationLog).toContain('conditional-validated: 5');
        });

        test('should enforce conditional validation rules', () => {
            dependentField.setValue('special');
            conditionalField.setValue(5);
            submitButton.el.click();

            expect(validationLog).toContain('submit-attempted');
            expect(validationLog).toContain('submit-failed');
            expect(conditionalField.valid).toBe(false);
        });

        test('should pass validation when conditions are met', () => {
            dependentField.setValue('special');
            conditionalField.setValue(15);
            submitButton.el.click();

            expect(validationLog).toContain('submit-attempted');
            expect(validationLog).toContain('submit-successful');
            expect(masterForm.hasErrors()).toBe(false);
        });

        test('should handle non-conditional validation correctly', () => {
            dependentField.setValue('normal');
            conditionalField.setValue(5);
            submitButton.el.click();

            expect(validationLog).toContain('submit-successful');
            expect(conditionalField.valid).toBe(true);
        });

        test('should validate all fields on form submission', () => {
            dependentField.setValue('a');
            conditionalField.setValue(5);
            submitButton.el.click();

            expect(validationLog).toContain('dependent-validated: a');
            expect(validationLog).toContain('conditional-validated: 5');
            expect(validationLog).toContain('submit-failed');
        });
    });

    describe('Complex Multi-Component Workflow', () => {
        let employeeStore, departmentStore;
        let employeeGrid, departmentCombo, employeeForm;
        let nameField, salaryField, activeField;
        let addButton, updateButton, deleteButton;

        beforeEach(() => {
            departmentStore = new Store({
                data: [
                    { id: 1, name: 'Engineering' },
                    { id: 2, name: 'Marketing' },
                    { id: 3, name: 'Sales' }
                ]
            });

            employeeStore = new Store({
                data: [
                    { id: 1, name: 'John Doe', department: 1, salary: 75000, active: true },
                    { id: 2, name: 'Jane Smith', department: 2, salary: 65000, active: true },
                    { id: 3, name: 'Bob Wilson', department: 1, salary: 80000, active: false }
                ]
            });

            employeeGrid = new Grid({
                store: employeeStore,
                rowNumbers: false,
                columns: [
                    { dataIndex: 'name', header: 'Name', width: 150 },
                    { 
                        dataIndex: 'department', 
                        header: 'Department', 
                        width: 150,
                        renderer: (value) => {
                            const dept = departmentStore.getData().find(d => d.id === value);
                            return dept ? dept.name : 'Unknown';
                        }
                    },
                    { dataIndex: 'salary', header: 'Salary', width: 100 },
                    { dataIndex: 'active', header: 'Active', width: 80 }
                ],
                selectionMode: 'single'
            });

            nameField = new TextField({
                name: 'name',
                label: 'Employee Name',
                required: true
            });

            departmentCombo = new ComboBox({
                name: 'department',
                label: 'Department',
                data: departmentStore.getData().map(d => ({ value: d.id, text: d.name })),
                required: true
            });

            salaryField = new NumberField({
                name: 'salary',
                label: 'Salary',
                required: true,
                min: 0,
                max: 1000000
            });

            activeField = new Checkbox({
                name: 'active',
                label: 'Active Employee',
                checked: true,
                value: true,
                uncheckedValue: false
            });

            employeeForm = new Form({
                fields: [nameField, departmentCombo, salaryField, activeField]
            });

            addButton = new Button({
                text: 'Add Employee',
                handler: () => {
                    if (employeeForm.validate()) {
                        const values = employeeForm.getValues();
                        const newEmployee = {
                            id: Date.now(),
                            ...values
                        };
                        employeeStore.add(newEmployee);
                        employeeForm.reset();
                        updateButtons();
                    }
                }
            });

            updateButton = new Button({
                text: 'Update Employee',
                disabled: true,
                handler: () => {
                    const selected = employeeGrid.getSelectedRecords();
                    if (selected.length > 0 && employeeForm.validate()) {
                        const values = employeeForm.getValues();
                        const updated = { ...selected[0], ...values };
                        employeeStore.update(updated);
                        updateButtons();
                    }
                }
            });

            deleteButton = new Button({
                text: 'Delete Employee',
                disabled: true,
                handler: () => {
                    const selected = employeeGrid.getSelectedRecords();
                    if (selected.length > 0) {
                        employeeStore.remove(selected[0]);
                        employeeForm.reset();
                        updateButtons();
                    }
                }
            });

            function updateButtons() {
                const hasSelection = employeeGrid.getSelectedRecords().length > 0;
                updateButton.setDisabled(!hasSelection);
                deleteButton.setDisabled(!hasSelection);
            }

            employeeGrid.on('selectionchange', (data) => {
                const records = data.selections || [];
                if (records.length > 0) {
                    employeeForm.setValues(records[0]);
                } else {
                    employeeForm.reset();
                }
                updateButtons();
            });

            container.appendChild(employeeForm.render());
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex gap-2 mb-4';
            buttonContainer.appendChild(addButton.render());
            buttonContainer.appendChild(updateButton.render());
            buttonContainer.appendChild(deleteButton.render());
            container.appendChild(buttonContainer);
            
            container.appendChild(employeeGrid.render());
        });

        test('should handle complete CRUD workflow', () => {
            expect(employeeStore.getData()).toHaveLength(3);

            nameField.setValue('Alice Johnson');
            departmentCombo.setValue(2);
            salaryField.setValue(70000);
            activeField.setValue(true);

            addButton.el.click();

            expect(employeeStore.getData()).toHaveLength(4);

            const newEmployee = employeeStore.getData().find(e => e.name === 'Alice Johnson');
            expect(newEmployee).toBeDefined();
            expect(newEmployee.department).toBe(2);
            expect(newEmployee.salary).toBe(70000);
            expect(newEmployee.active).toBe(true);
        });

        test('should populate form on grid selection', () => {
            const firstRow = employeeGrid.el.querySelector('tbody tr');
            firstRow.click();

            expect(nameField.getValue()).toBe('John Doe');
            expect(departmentCombo.getValue()).toBe(1);
            expect(salaryField.getValue()).toBe(75000);
            expect(activeField.getValue()).toBe(true);
        });

        test('should update employee record', () => {
            const firstRow = employeeGrid.el.querySelector('tbody tr');
            firstRow.click();

            nameField.setValue('John Smith');
            salaryField.setValue(85000);

            updateButton.el.click();

            const updated = employeeStore.getData().find(e => e.id === 1);
            expect(updated.name).toBe('John Smith');
            expect(updated.salary).toBe(85000);
        });

        test('should delete employee record', () => {
            const firstRow = employeeGrid.el.querySelector('tbody tr');
            firstRow.click();

            deleteButton.el.click();

            expect(employeeStore.getData()).toHaveLength(2);
            expect(employeeStore.getData().find(e => e.id === 1)).toBeUndefined();
        });

        test('should render department names in grid', () => {
            const rows = employeeGrid.el.querySelectorAll('tbody tr');
            const firstRowDeptCell = rows[0].querySelectorAll('td')[1]; // Index 1 for department column
            expect(firstRowDeptCell.textContent.trim()).toBe('Engineering');
        });

        test('should validate form before operations', () => {
            nameField.setValue('');
            salaryField.setValue(-1000);

            addButton.el.click();

            expect(employeeStore.getData()).toHaveLength(3);
            expect(employeeForm.hasErrors()).toBe(true);
        });
    });
});