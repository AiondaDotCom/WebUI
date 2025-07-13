# Form



**Since**: 1.0.0

**Category**: Data Components

**File**: [`src/components/Form.js`](src/components/Form.js)

---

## Configuration

The following properties can be passed to the component constructor:

### title

- **Type**: `string`
- **Required**: No

Form title

### layout

- **Type**: `string`
- **Required**: No

Form layout ('vertical', 'horizontal', 'inline')

### items

- **Type**: `Array`
- **Required**: No

Array of form fields and components

### url

- **Type**: `string`
- **Required**: No

Form submission URL

### method

- **Type**: `string`
- **Required**: No

HTTP method for submission

### baseParams

- **Type**: `Object`
- **Required**: No

Base parameters to include with submission

### timeout

- **Type**: `number`
- **Required**: No

Request timeout in milliseconds

### trackResetOnLoad

- **Type**: `boolean`
- **Required**: No

Whether to track initial values for reset

### monitorValid

- **Type**: `boolean`
- **Required**: No

Whether to monitor form validity

### labelAlign

- **Type**: `string`
- **Required**: No

Default label alignment for fields

### labelWidth

- **Type**: `number`
- **Required**: No

Default label width in pixels




## Usage Examples

### Form with validation


```javascript
const form = new AiondaWebUI.Form({
  title: 'User Registration',
  layout: 'vertical',
  items: [textField, emailField, submitButton],
  url: '/api/register'
});
form.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)