# DateField



**Since**: 1.0.0

**Category**: Utility Components

**File**: [`src/components/DateField.js`](src/components/DateField.js)

---

## Configuration

The following properties can be passed to the component constructor:

### name

- **Type**: `string`
- **Required**: No

Input name attribute

### fieldLabel

- **Type**: `string`
- **Required**: No

Label text displayed above field

### value

- **Type**: `Date | string`
- **Required**: No

Initial date value

### format

- **Type**: `string`
- **Required**: No

Date format string

### minValue

- **Type**: `Date | string`
- **Required**: No

Minimum allowed date

### maxValue

- **Type**: `Date | string`
- **Required**: No

Maximum allowed date

### readOnly

- **Type**: `boolean`
- **Required**: No

Whether field is read-only

### required

- **Type**: `boolean`
- **Required**: No

Whether field is required

### emptyText

- **Type**: `string`
- **Required**: No

Placeholder text

### disabledDays

- **Type**: `Array`
- **Required**: No

Array of disabled day numbers (0-6)

### disabledDates

- **Type**: `Array`
- **Required**: No

Array of disabled date strings




## Usage Examples

### Date field with range validation


```javascript
const dateField = new AiondaWebUI.DateField({
  fieldLabel: 'Birth Date',
  format: 'Y-m-d',
  minValue: '1900-01-01',
  maxValue: new Date(),
  required: true
});
dateField.renderTo('#container');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)