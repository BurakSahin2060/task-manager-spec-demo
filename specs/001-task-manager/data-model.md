# Data Model: Task Manager Web Application

**Phase**: 1 - Design & Contracts  
**Date**: 2026-03-06  
**Status**: Complete

## Overview

The Task Manager application uses a simple, flat data model optimized for browser-based storage and client-side operations. The model supports all required functionality while maintaining simplicity and performance.

## Core Entities

### Task Entity

Represents a single task item in the user's task list.

**Schema**:

```javascript
{
  id: string,           // Unique identifier (UUID or timestamp-based)
  title: string,        // Task description (1-200 characters)
  completed: boolean,   // Completion status (default: false)
  createdAt: number     // Creation timestamp (Unix milliseconds)
}
```

**Validation Rules**:

- `id`: Required, unique, non-empty string
- `title`: Required, non-empty, trimmed, max 200 characters
- `completed`: Required boolean (true/false)
- `createdAt`: Required positive number (Unix timestamp)

**Business Rules**:

- Tasks are immutable except for `completed` status
- `id` must be unique within the task list
- `title` cannot be empty or whitespace-only
- `createdAt` is set once at creation and never modified

### TaskList Entity

Represents the collection of all tasks for a user.

**Schema**:

```javascript
[
  Task,    // Array of Task objects
  Task,
  ...
]
```

**Validation Rules**:

- Must be a valid JSON array
- Each element must be a valid Task object
- Maximum 1000 tasks (practical limit for performance)
- No duplicate `id` values allowed

## Storage Model

### localStorage Structure

**Storage Key**: `"taskManager_tasks"`

**Storage Format**:

```json
[
  {
    "id": "task_1643723400000_123",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": 1643723400000
  },
  {
    "id": "task_1643723500000_456",
    "title": "Complete project report",
    "completed": true,
    "createdAt": 1643723500000
  }
]
```

**Storage Constraints**:

- Maximum size: ~5-10MB (browser-dependent)
- Data type: JSON string only
- Persistence: Survives browser restarts
- Scope: Per-origin (domain-specific)

## Data Flow

### Create Task Flow

1. User inputs title in form
2. Validate title (non-empty, trimmed)
3. Generate unique ID and timestamp
4. Create Task object with default values
5. Add to TaskList array
6. Persist to localStorage
7. Update UI display

### Update Task Flow

1. User toggles completion status
2. Locate task by ID in TaskList
3. Update `completed` field
4. Persist to localStorage
5. Update UI display

### Delete Task Flow

1. User clicks delete button
2. Locate task by ID in TaskList
3. Remove from TaskList array
4. Persist to localStorage
5. Update UI display

### Load Application Flow

1. Attempt to load from localStorage
2. Parse JSON data
3. Validate data structure
4. Use loaded data or empty array on failure
5. Render task list in UI

## Data Integrity

### Validation Strategy

- **Input Validation**: Client-side validation before data creation
- **Storage Validation**: Validate data when loading from storage
- **Error Recovery**: Graceful fallback to empty state on corruption

### Error Handling

- **Storage Unavailable**: Continue with in-memory storage
- **Quota Exceeded**: Show user warning, prevent new tasks
- **Corrupt Data**: Reset to empty array with user notification
- **Invalid Operations**: Prevent with UI constraints

## Performance Considerations

### Memory Usage

- Task object: ~200-500 bytes each
- 100 tasks: ~20-50KB total
- Well within localStorage limits

### Query Performance

- Simple array operations for small datasets
- No indexing required (<100 items)
- Linear search acceptable for CRUD operations

### Storage Performance

- JSON serialization: Fast for small objects
- Synchronous operations: Acceptable for user-initiated actions
- Batch updates: Not required for simple operations

## Migration Strategy

### Version 1.0

- No migration needed (initial release)
- Future versions will include version field in storage

### Future Compatibility

- Storage format designed for backward compatibility
- New fields can be optional with defaults
- Version detection for migration logic

## Testing Data

### Sample Data Set

```javascript
[
  {
    id: "task_sample_1",
    title: "Buy groceries for dinner",
    completed: false,
    createdAt: 1643723400000,
  },
  {
    id: "task_sample_2",
    title: "Complete project documentation",
    completed: true,
    createdAt: 1643723500000,
  },
  {
    id: "task_sample_3",
    title: "Schedule team meeting",
    completed: false,
    createdAt: 1643723600000,
  },
];
```

### Edge Cases

- Empty task list: `[]`
- Single task: Array with one object
- Maximum tasks: Array with 100 objects
- Long titles: 200 character strings
- Special characters: Unicode text, emojis

## Schema Evolution

### Adding Fields

1. Add optional field with default value
2. Update validation to handle missing field
3. Update creation logic to include new field
4. Document migration path

### Removing Fields

1. Mark field as deprecated
2. Update validation to ignore field
3. Plan removal in future major version
4. Update documentation

This data model provides a solid foundation for the Task Manager application while maintaining simplicity and performance.
