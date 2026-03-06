# Component Interface Contracts: Task Manager Web Application

**Phase**: 1 - Design & Contracts  
**Date**: 2026-03-06  
**Status**: Complete

## Overview

The Task Manager application is organized into modular JavaScript components with well-defined interfaces. This document specifies the contracts between components for reliable integration and testing.

## Component Architecture

### Component Overview

```
┌─────────────────┐    ┌─────────────────┐
│   TaskInput     │    │  StorageService │
│                 │    │                 │
│ - Input field   │    │ - saveTasks()   │
│ - Add button    │    │ - loadTasks()   │
│ - Validation    │    │ - STORAGE_KEY   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │    TaskList     │
          │                 │
          │ - Container     │
          │ - Render tasks  │
          │ - Event binding │
          └─────────┬───────┘
                    │
          ┌─────────────────┐
          │    TaskItem     │
          │                 │
          │ - Checkbox      │
          │ - Title display │
          │ - Delete button │
          └─────────────────┘
```

## StorageService Contract

### Interface Definition

```javascript
const StorageService = {
  // Constants
  STORAGE_KEY: "taskManager_tasks",

  // Methods
  saveTasks(tasks: Task[]): boolean
  loadTasks(): Task[]
}
```

### Method Specifications

#### saveTasks(tasks)

**Purpose**: Persist task array to localStorage

**Parameters**:

- `tasks`: Array of valid Task objects

**Returns**: `boolean`

- `true`: Successfully saved
- `false`: Save failed (quota exceeded, storage unavailable)

**Side Effects**:

- Writes to localStorage under STORAGE_KEY
- Overwrites existing data

**Error Handling**:

- Catches storage exceptions
- Returns false on failure
- Logs errors to console (development only)

#### loadTasks()

**Purpose**: Retrieve task array from localStorage

**Parameters**: None

**Returns**: `Task[]`

- Valid task array on success
- Empty array on failure or no data

**Side Effects**: None

**Error Handling**:

- Catches JSON parsing errors
- Returns empty array on corruption
- Validates data structure

## TaskInput Contract

### Interface Definition

```javascript
const TaskInput = {
  // Methods
  init(): void
  getValue(): string
  clear(): void
  focus(): void
  validate(): boolean
}
```

### Method Specifications

#### init()

**Purpose**: Initialize the input component and bind events

**Parameters**: None

**Returns**: `void`

**Side Effects**:

- Binds form submission handler
- Sets up input validation
- Focuses input field

**Dependencies**: Requires DOM elements to exist

#### getValue()

**Purpose**: Get current input value

**Parameters**: None

**Returns**: `string` - Trimmed input value

**Side Effects**: None

#### clear()

**Purpose**: Clear the input field

**Parameters**: None

**Returns**: `void`

**Side Effects**:

- Resets input value to empty string
- Maintains focus if present

#### focus()

**Purpose**: Set focus to input field

**Parameters**: None

**Returns**: `void`

**Side Effects**:

- Moves cursor to input field

#### validate()

**Purpose**: Validate current input

**Parameters**: None

**Returns**: `boolean`

- `true`: Input is valid (non-empty after trim)
- `false`: Input is invalid

**Side Effects**:

- May update UI to show validation state

## TaskList Contract

### Interface Definition

```javascript
const TaskList = {
  // Methods
  init(): void
  render(tasks: Task[]): void
  addTask(task: Task): void
  updateTask(taskId: string, updates: Partial<Task>): void
  removeTask(taskId: string): void
  getTaskElement(taskId: string): HTMLElement | null
}
```

### Method Specifications

#### init()

**Purpose**: Initialize the task list container

**Parameters**: None

**Returns**: `void`

**Side Effects**:

- Sets up event delegation for dynamic elements
- Prepares container for task rendering

#### render(tasks)

**Purpose**: Render complete task list

**Parameters**:

- `tasks`: Array of Task objects to display

**Returns**: `void`

**Side Effects**:

- Clears existing content
- Creates DOM elements for each task
- Binds event handlers

#### addTask(task)

**Purpose**: Add single task to display

**Parameters**:

- `task`: Valid Task object

**Returns**: `void`

**Side Effects**:

- Appends task element to container
- Updates UI immediately

#### updateTask(taskId, updates)

**Purpose**: Update existing task display

**Parameters**:

- `taskId`: String identifier of task to update
- `updates`: Partial Task object with fields to update

**Returns**: `void`

**Side Effects**:

- Updates DOM element for specific task
- Re-renders task item with new data

#### removeTask(taskId)

**Purpose**: Remove task from display

**Parameters**:

- `taskId`: String identifier of task to remove

**Returns**: `void`

**Side Effects**:

- Removes DOM element
- Cleans up event listeners

#### getTaskElement(taskId)

**Purpose**: Get DOM element for specific task

**Parameters**:

- `taskId`: String identifier

**Returns**: `HTMLElement | null`

- Element if found, null if not found

**Side Effects**: None

## TaskItem Contract

### Interface Definition

```javascript
function createTaskItem(task: Task, onToggle: Function, onDelete: Function): HTMLElement {
  // Returns configured task item element
}
```

### Function Specification

#### createTaskItem(task, onToggle, onDelete)

**Purpose**: Create DOM element for individual task

**Parameters**:

- `task`: Valid Task object
- `onToggle`: Function called when checkbox clicked `(taskId: string) => void`
- `onDelete`: Function called when delete clicked `(taskId: string) => void`

**Returns**: `HTMLElement` - Configured task item element

**Side Effects**:

- Creates DOM structure
- Binds event handlers to callbacks
- Applies appropriate CSS classes

**DOM Structure**:

```html
<div class="task-item" data-id="task_123">
  <div class="task-content">
    <input type="checkbox" class="task-checkbox" checked|unchecked />
    <span class="task-title completed|incomplete">Task Title</span>
  </div>
  <button class="delete-btn">×</button>
</div>
```

## Data Contracts

### Task Object Contract

All components expect Task objects to conform to this schema:

```javascript
interface Task {
  id: string;        // Unique identifier
  title: string;     // Non-empty task description
  completed: boolean; // Completion status
  createdAt: number;  // Unix timestamp in milliseconds
}
```

### Event Callback Contracts

**Toggle Callback**: `(taskId: string) => void`

- Called when user clicks task checkbox
- Receives task ID as string parameter
- No return value expected

**Delete Callback**: `(taskId: string) => void`

- Called when user clicks delete button
- Receives task ID as string parameter
- No return value expected

## Error Handling Contracts

### Storage Failures

- Components handle storage unavailability gracefully
- UI provides feedback for storage errors
- Application continues functioning with in-memory storage

### DOM Unavailable

- Components check for required DOM elements
- Graceful degradation if elements missing
- Console warnings for development debugging

### Invalid Data

- Components validate input data
- Invalid data rejected with appropriate feedback
- No crashes on malformed data

## Testing Contracts

### Component Isolation

- Each component can be tested independently
- Mock dependencies for unit testing
- Contract tests verify interface compliance

### Integration Points

- Components communicate through defined interfaces
- No direct DOM manipulation between components
- Event-driven architecture for loose coupling

This contract ensures reliable component integration and maintainable code structure.
