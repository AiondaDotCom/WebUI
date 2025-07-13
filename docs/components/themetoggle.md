# ThemeToggle



**Since**: 1.0.0

**Category**: Utility Components

**File**: [`src/components/ThemeToggle.js`](src/components/ThemeToggle.js)

---

## Configuration

The following properties can be passed to the component constructor:

### position

- **Type**: `string`
- **Required**: No

Toggle position on screen

### animated

- **Type**: `boolean`
- **Required**: No

Whether to animate theme transitions

### showLabel

- **Type**: `boolean`
- **Required**: No

Whether to show text labels

### lightIcon

- **Type**: `string`
- **Required**: No

Icon for light theme

### darkIcon

- **Type**: `string`
- **Required**: No

Icon for dark theme

### size

- **Type**: `string`
- **Required**: No

Toggle size ('sm', 'md', 'lg')

### onChange

- **Type**: `Function`
- **Required**: No

Callback when theme changes




## Usage Examples

### Theme toggle button


```javascript
const themeToggle = new AiondaWebUI.ThemeToggle({
  position: 'top-right',
  animated: true,
  showLabel: true
});
themeToggle.renderTo('#theme-toggle');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)