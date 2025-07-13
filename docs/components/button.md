# Button



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/Button.js`](src/components/Button.js)

---

## Configuration

The following properties can be passed to the component constructor:

### text

- **Type**: `string`
- **Required**: No

Button text content

### icon

- **Type**: `string`
- **Required**: No

Icon class or name

### iconAlign

- **Type**: `string`
- **Required**: No

Icon alignment ('left' or 'right')

### variant

- **Type**: `string`
- **Required**: No

Button variant ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark')

### size

- **Type**: `string`
- **Required**: No

Button size ('xs', 'sm', 'md', 'lg', 'xl')

### outline

- **Type**: `boolean`
- **Required**: No

Whether to use outline style

### pressed

- **Type**: `boolean`
- **Required**: No

Whether button is in pressed state

### loading

- **Type**: `boolean`
- **Required**: No

Whether button is in loading state

### block

- **Type**: `boolean`
- **Required**: No

Whether button takes full width

### href

- **Type**: `string`
- **Required**: No

URL for link buttons

### target

- **Type**: `string`
- **Required**: No

Target for link buttons

### handler

- **Type**: `Function`
- **Required**: No

Click handler function

### ariaLabel

- **Type**: `string`
- **Required**: No

Accessibility label

### ariaDescription

- **Type**: `string`
- **Required**: No

Accessibility description


## Methods

### setText(text)



**Parameters**:
- `text` (string): New button text

**Returns**: `Button` - Returns this for method chaining


**Example**:
```javascript
button.setText('New Text');
```


---

### setIcon(icon)



**Parameters**:
- `icon` (string): New icon class or name

**Returns**: `Button` - Returns this for method chaining


**Example**:
```javascript
button.setIcon('fas fa-user');
```


---


## Events

### click



**Event Object**:
```javascript
{
  event: Object // Event object,
  event.field: Button // The button component,
  event.event: Event // Original DOM event
}
```


---


## Usage Examples

### Basic button usage


```javascript
const button = new AiondaWebUI.Button({
  text: 'Click Me',
  variant: 'primary',
  size: 'lg',
  icon: 'user',
  handler: () => console.log('Clicked!')
});
button.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)