/**
 * Task Manager Web Application
 * Modular vanilla JavaScript implementation
 * Following spec-driven development principles
 */

// ==========================================
// STORAGE SERVICE MODULE
// Handles localStorage operations with error handling
// ==========================================

const StorageService = {
  STORAGE_KEY: "taskManager_tasks",

  /**
   * Save tasks array to localStorage
   * @param {Array} tasks - Array of valid Task objects
   * @returns {boolean} - true if saved successfully, false on error
   */
  saveTasks(tasks) {
    try {
      const jsonData = JSON.stringify(tasks);
      localStorage.setItem(this.STORAGE_KEY, jsonData);
      return true;
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
      return false;
    }
  },

  /**
   * Load tasks array from localStorage
   * @returns {Array} - Array of Task objects, empty array on error
   */
  loadTasks() {
    try {
      const jsonData = localStorage.getItem(this.STORAGE_KEY);
      if (!jsonData) {
        return [];
      }

      const tasks = JSON.parse(jsonData);

      // Validate that we have an array
      if (!Array.isArray(tasks)) {
        console.warn(
          "Invalid data format in localStorage, resetting to empty array",
        );
        return [];
      }

      // Basic validation of task objects
      const validTasks = tasks.filter((task) => this.isValidTask(task));

      if (validTasks.length !== tasks.length) {
        console.warn("Some tasks were invalid and filtered out");
      }

      return validTasks;
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
      return [];
    }
  },

  /**
   * Validate if an object is a valid Task
   * @param {*} obj - Object to validate
   * @returns {boolean} - true if valid Task object
   */
  isValidTask(obj) {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.id === "string" &&
      obj.id.trim().length > 0 &&
      typeof obj.title === "string" &&
      obj.title.trim().length > 0 &&
      typeof obj.completed === "boolean" &&
      typeof obj.createdAt === "number" &&
      obj.createdAt > 0
    );
  },
};

// ==========================================
// TASK VALIDATION FUNCTIONS
// ==========================================

const TaskValidator = {
  /**
   * Validate task title
   * @param {string} title - Task title to validate
   * @returns {boolean} - true if valid
   */
  isValidTitle(title) {
    if (typeof title !== "string") {
      return false;
    }

    const trimmed = title.trim();
    return trimmed.length > 0 && trimmed.length <= 200;
  },

  /**
   * Sanitize task title
   * @param {string} title - Raw title input
   * @returns {string} - Sanitized title
   */
  sanitizeTitle(title) {
    if (typeof title !== "string") {
      return "";
    }
    return title.trim();
  },

  /**
   * Generate unique task ID
   * @returns {string} - Unique task identifier
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `task_${timestamp}_${random}`;
  },

  /**
   * Create new task object
   * @param {string} title - Task title
   * @returns {Object|null} - Valid task object or null if invalid
   */
  createTask(title) {
    const sanitizedTitle = this.sanitizeTitle(title);

    if (!this.isValidTitle(sanitizedTitle)) {
      return null;
    }

    return {
      id: this.generateId(),
      title: sanitizedTitle,
      completed: false,
      createdAt: Date.now(),
    };
  },
};

// ==========================================
// APPLICATION STATE MANAGEMENT
// ==========================================

const AppState = {
  tasks: [],

  /**
   * Initialize application state
   */
  init() {
    this.tasks = StorageService.loadTasks();
  },

  /**
   * Add a new task
   * @param {Object} task - Valid task object
   * @returns {boolean} - true if added successfully
   */
  addTask(task) {
    if (!StorageService.isValidTask(task)) {
      return false;
    }

    this.tasks.push(task);
    return StorageService.saveTasks(this.tasks);
  },

  /**
   * Update task completion status
   * @param {string} taskId - Task identifier
   * @param {boolean} completed - New completion status
   * @returns {boolean} - true if updated successfully
   */
  updateTask(taskId, completed) {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return false;
    }

    this.tasks[taskIndex].completed = completed;
    return StorageService.saveTasks(this.tasks);
  },

  /**
   * Remove a task
   * @param {string} taskId - Task identifier
   * @returns {boolean} - true if removed successfully
   */
  removeTask(taskId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter((task) => task.id !== taskId);

    if (this.tasks.length === initialLength) {
      return false; // Task not found
    }

    return StorageService.saveTasks(this.tasks);
  },

  /**
   * Get all tasks
   * @returns {Array} - Copy of tasks array
   */
  getTasks() {
    return [...this.tasks];
  },
};

// ==========================================
// COMPONENT MODULES PLACEHOLDER
// ==========================================

// TaskInput component - handles task creation form
const TaskInput = {
  form: null,
  input: null,
  button: null,

  init() {
    this.form = document.getElementById("task-input-form");
    this.input = document.getElementById("task-input");
    this.button = document.getElementById("add-task-btn");

    if (!this.form || !this.input || !this.button) {
      console.error("TaskInput: Required DOM elements not found");
      return;
    }

    // Bind event listeners
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.input.addEventListener("input", this.handleInput.bind(this));

    console.log("TaskInput initialized");
  },

  handleSubmit(event) {
    event.preventDefault();

    const title = this.input.value.trim();

    if (!TaskValidator.isValidTitle(title)) {
      this.showValidationError();
      return;
    }

    const newTask = TaskValidator.createTask(title);

    if (!newTask) {
      this.showValidationError();
      return;
    }

    // Add task to application state
    if (AppState.addTask(newTask)) {
      // Clear input and focus
      this.clear();
      this.focus();

      // Refresh task list display
      TaskList.render();

      console.log("Task created successfully:", newTask.title);
    } else {
      console.error("Failed to save task");
      this.showError("Failed to save task. Please try again.");
    }
  },

  handleInput() {
    // Clear any previous validation errors
    this.clearValidationError();
  },

  clear() {
    this.input.value = "";
    this.clearValidationError();
  },

  focus() {
    this.input.focus();
  },

  showValidationError() {
    this.input.setCustomValidity("Task title cannot be empty");
    this.input.reportValidity();
  },

  clearValidationError() {
    this.input.setCustomValidity("");
  },

  showError(message) {
    // For now, just log the error
    // TODO: Implement user-friendly error display
    console.error("TaskInput Error:", message);
  },
};

// TaskList component - manages task display
const TaskList = {
  container: null,

  init() {
    this.container = document.getElementById("task-list");

    if (!this.container) {
      console.error("TaskList: Container element not found");
      return;
    }

    // Initial render
    this.render();

    console.log("TaskList initialized");
  },

  render() {
    if (!this.container) {
      return;
    }

    const tasks = AppState.getTasks();

    // Clear existing content
    this.container.innerHTML = "";

    if (tasks.length === 0) {
      // Container will show empty state via CSS :empty pseudo-selector
      return;
    }

    // Render each task
    tasks.forEach((task) => {
      const taskElement = TaskItem.create(task);
      this.container.appendChild(taskElement);
    });
  },
};

// TaskItem component - individual task display
const TaskItem = {
  /**
   * Create a task item element
   * @param {Object} task - Task object
   * @returns {HTMLElement} - Task item element
   */
  create(task) {
    if (!StorageService.isValidTask(task)) {
      console.error("TaskItem: Invalid task object", task);
      return document.createElement("div");
    }

    // Create main container
    const item = document.createElement("div");
    item.className = "task-item";
    item.setAttribute("data-id", task.id);

    // Create task content container
    const content = document.createElement("div");
    content.className = "task-content";

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => this.handleToggle(task.id));

    // Create title
    const title = document.createElement("span");
    title.className = `task-title${task.completed ? " completed" : ""}`;
    title.textContent = task.title;

    // Add checkbox and title to content
    content.appendChild(checkbox);
    content.appendChild(title);

    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", `Delete task: ${task.title}`);
    deleteBtn.addEventListener("click", () => this.handleDelete(task.id));

    // Assemble the item
    item.appendChild(content);
    item.appendChild(deleteBtn);

    return item;
  },

  /**
   * Handle task completion toggle
   * @param {string} taskId - Task identifier
   */
  handleToggle(taskId) {
    const tasks = AppState.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      console.error("TaskItem: Task not found for toggle", taskId);
      return;
    }

    const newCompleted = !task.completed;

    if (AppState.updateTask(taskId, newCompleted)) {
      // Update visual state
      const item = document.querySelector(`[data-id="${taskId}"]`);
      if (item) {
        const title = item.querySelector(".task-title");
        const checkbox = item.querySelector(".task-checkbox");

        if (title) {
          title.classList.toggle("completed", newCompleted);
        }
        if (checkbox) {
          checkbox.checked = newCompleted;
        }
      }

      console.log(
        `Task "${task.title}" marked as ${newCompleted ? "completed" : "incomplete"}`,
      );
    } else {
      console.error("Failed to update task completion status");
      // Revert checkbox state
      const checkbox = document.querySelector(
        `[data-id="${taskId}"] .task-checkbox`,
      );
      if (checkbox) {
        checkbox.checked = task.completed;
      }
    }
  },

  /**
   * Handle task deletion
   * @param {string} taskId - Task identifier
   */
  handleDelete(taskId) {
    const tasks = AppState.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      console.error("TaskItem: Task not found for deletion", taskId);
      return;
    }

    // Confirm deletion (for now, immediate deletion as per spec)
    if (AppState.removeTask(taskId)) {
      // Remove from DOM
      const item = document.querySelector(`[data-id="${taskId}"]`);
      if (item) {
        item.remove();
      }

      console.log(`Task "${task.title}" deleted successfully`);
    } else {
      console.error("Failed to delete task");
    }
  },
};

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

/**
 * Initialize the application when DOM is ready
 */
function initApp() {
  console.log("Initializing Task Manager Application...");

  // Initialize application state
  AppState.init();

  // Initialize components
  TaskInput.init();
  TaskList.init();

  console.log("Application initialized successfully");
  console.log(`Loaded ${AppState.getTasks().length} tasks from storage`);
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
