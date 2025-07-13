# RadioGroup



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/RadioGroup.js`](src/components/RadioGroup.js)

---

## Configuration

The following properties can be passed to the component constructor:

### name

- **Type**: `string`
- **Required**: No

Input name for all radio buttons in group

### fieldLabel

- **Type**: `string`
- **Required**: No

Label text displayed above group

### items

- **Type**: `Array`
- **Required**: No

Array of radio button configurations

### value

- **Type**: `string`
- **Required**: No

Selected radio button value

### readOnly

- **Type**: `boolean`
- **Required**: No

Whether group is read-only

### disabled

- **Type**: `boolean`
- **Required**: No

Whether group is disabled

### layout

- **Type**: `string`
- **Required**: No

Layout direction ('vertical', 'horizontal')

### allowBlank

- **Type**: `boolean`
- **Required**: No

Whether no selection is allowed




## Usage Examples

### Radio group with options


```javascript
const radioGroup = new AiondaWebUI.RadioGroup({
  fieldLabel: 'Preferred Contact',
  items: [
    { boxLabel: 'Email', inputValue: 'email' },
    { boxLabel: 'Phone', inputValue: 'phone' },
    { boxLabel: 'Mail', inputValue: 'mail' }
  ],
  value: 'email'
});
radioGroup.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)