// Aionda WebUI Main Entry Point
import { EventEmitter } from './core/EventEmitter.js';
import { Component } from './core/Component.js';
import { Store } from './core/Store.js';
import { ThemeManager } from './core/ThemeManager.js';

// Import all components
import { Panel } from './components/Panel.js';
import { Button } from './components/Button.js';
import { Grid } from './components/Grid.js';
import { Form } from './components/Form.js';
import { TextField } from './components/TextField.js';
import { NumberField } from './components/NumberField.js';
import { ComboBox } from './components/ComboBox.js';
import { Checkbox } from './components/Checkbox.js';
import { Tree } from './components/Tree.js';
import { Menu } from './components/Menu.js';
import { MenuItem } from './components/MenuItem.js';
import { Toolbar } from './components/Toolbar.js';
import { Window } from './components/Window.js';
import { MessageBox } from './components/MessageBox.js';
import { Toast } from './components/Toast.js';
import { DateField } from './components/DateField.js';
import { TextArea } from './components/TextArea.js';
import { RadioGroup } from './components/RadioGroup.js';
import { Radio } from './components/Radio.js';
import { ThemeToggle } from './components/ThemeToggle.js';

// Export all classes
export {
  EventEmitter,
  Component,
  Store,
  ThemeManager,
  Panel,
  Button,
  Grid,
  Form,
  TextField,
  NumberField,
  ComboBox,
  Checkbox,
  Tree,
  Menu,
  MenuItem,
  Toolbar,
  Window,
  MessageBox,
  Toast,
  DateField,
  TextArea,
  RadioGroup,
  Radio,
  ThemeToggle
};

// Create the main AiondaWebUI object
export const AiondaWebUI = {
  // Core classes
  EventEmitter,
  Component,
  Store,
  ThemeManager,
  
  // UI Components
  Panel,
  Button,
  Grid,
  Form,
  TextField,
  NumberField,
  ComboBox,
  Checkbox,
  Tree,
  Menu,
  MenuItem,
  Toolbar,
  Window,
  MessageBox,
  Toast,
  DateField,
  TextArea,
  RadioGroup,
  Radio,
  ThemeToggle,
  
  // Utilities
  version: '0.2.0',
  
  // Create method for convenience
  create(componentClass, config) {
    return new componentClass(config);
  }
};

// Default export
export default AiondaWebUI;