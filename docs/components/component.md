# Component



**Since**: 1.0.0

**Category**: Core Components

**File**: [`src/core/Component.js`](src/core/Component.js)

---

## Configuration

The following properties can be passed to the component constructor:

### id

- **Type**: `string`
- **Required**: No

Unique component identifier (auto-generated if not provided)

### cls

- **Type**: `string`
- **Required**: No

Additional CSS classes

### width

- **Type**: `number | string`
- **Required**: No

Component width

### height

- **Type**: `number | string`
- **Required**: No

Component height

### hidden

- **Type**: `boolean`
- **Required**: No

Whether component is initially hidden

### disabled

- **Type**: `boolean`
- **Required**: No

Whether component is disabled

### responsive

- **Type**: `boolean`
- **Required**: No

Whether component is responsive

### style

- **Type**: `Object`
- **Required**: No

Inline CSS styles

### locale

- **Type**: `string`
- **Required**: No

Component locale for internationalization

### renderTo

- **Type**: `string | Element`
- **Required**: No

Target element for automatic rendering




## Usage Examples

### Extending the base component


```javascript
class MyComponent extends Component {
  createTemplate() {
    return '<div class="my-component">Hello World</div>';
  }
}
const comp = new MyComponent();
comp.renderTo('#container');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)