# Tree



**Since**: 1.0.0

**Category**: Data Components

**File**: [`src/components/Tree.js`](src/components/Tree.js)

---




## Usage Examples

### File tree with nodes


```javascript
const tree = new AiondaWebUI.Tree({
  store: treeStore,
  displayField: 'text',
  selectionMode: 'single',
  checkboxes: true,
  dragDrop: true
});
tree.renderTo('#tree');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)