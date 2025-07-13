# ComboBox



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/ComboBox.js`](src/components/ComboBox.js)

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

### store

- **Type**: `Object`
- **Required**: No

Data store for dropdown options

### displayField

- **Type**: `string`
- **Required**: No

Field to display in dropdown

### valueField

- **Type**: `string`
- **Required**: No

Field to use as value

### value

- **Type**: `string`
- **Required**: No

Initial selected value

### typeAhead

- **Type**: `boolean`
- **Required**: No

Enable type-ahead functionality

### forceSelection

- **Type**: `boolean`
- **Required**: No

Force user to select from list

### queryMode

- **Type**: `string`
- **Required**: No

Query mode ('local' or 'remote')

### queryDelay

- **Type**: `number`
- **Required**: No

Delay before triggering remote query

### minChars

- **Type**: `number`
- **Required**: No

Minimum characters to trigger query

### emptyText

- **Type**: `string`
- **Required**: No

Placeholder text

### loadingText

- **Type**: `string`
- **Required**: No

Loading indicator text

### tpl

- **Type**: `Function`
- **Required**: No

Custom template function for dropdown items




## Usage Examples

### ComboBox with remote data


```javascript
const comboBox = new AiondaWebUI.ComboBox({
  fieldLabel: 'Choose Country',
  store: countryStore,
  displayField: 'name',
  valueField: 'code',
  typeAhead: true,
  forceSelection: true,
  queryMode: 'remote'
});
comboBox.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)