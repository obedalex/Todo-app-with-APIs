export function validateCreateTodo(data) {
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    return { valid: false, message: "Title must be a non-empty string" };
  }
  return { valid: true };
}

export function validateUpdateTodo(data) {
  if (!data.title && data.completed === undefined) {
    return { valid: false, message: "Title is required" };
    }
    if (data.completed !== undefined && typeof data.completed !== "boolean") {
      return {
        valid: false,
        message: "You should state whether completed is true or false",
      };
    }
  return { valid: true };
}
