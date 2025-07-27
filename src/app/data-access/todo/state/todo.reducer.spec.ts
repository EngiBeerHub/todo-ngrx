import {initialTodosState, todoReducer} from './todo.reducer';
import {TodoActions} from './index';
import {TodoModel, TodosState} from '../../../../libs/data-access/todo';

describe('TodoReducer', () => {
  const mockTodo1: TodoModel = {
    id: 1,
    categoryId: 1,
    title: 'Complete project',
    description: 'Finish the todo app',
    dueDate: '2025-01-30',
    isDone: false,
  };

  const mockTodo2: TodoModel = {
    id: 2,
    categoryId: 1,
    title: 'Review code',
    description: 'Review pull requests',
    dueDate: null,
    isDone: true,
  };

  const mockTodo3: TodoModel = {
    id: 3,
    categoryId: 2,
    title: 'Buy groceries',
    description: 'Weekly shopping',
    dueDate: '2025-01-28',
    isDone: false,
  };

  const mockTodos: TodoModel[] = [mockTodo1, mockTodo2, mockTodo3];

  describe('Initial State', () => {
    it('should return the initial state', () => {
      // Arrange
      const action = { type: 'Unknown' } as any;

      // Act
      const result = todoReducer(undefined, action);

      // Assert
      expect(result).toBe(initialTodosState);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
    });

    it('should have correct initial state structure', () => {
      // Act & Assert
      expect(initialTodosState.isLoading).toBe(false);
      expect(initialTodosState.error).toBeNull();
      expect(initialTodosState.ids).toEqual([]);
      expect(initialTodosState.entities).toEqual({});
    });
  });

  describe('Reset Todos State', () => {
    it('should reset state to initial state', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1, 2],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
        },
        isLoading: true,
        error: 'Some error',
      };

      // Act
      const result = todoReducer(currentState, TodoActions.resetTodosState());

      // Assert
      expect(result).toEqual(initialTodosState);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
    });
  });

  describe('Add Todo', () => {
    it('should add todo optimistically', () => {
      // Act
      const result = todoReducer(
        initialTodosState,
        TodoActions.addTodo({ todo: mockTodo1 })
      );

      // Assert
      expect(result.ids).toContain(mockTodo1.id);
      expect(result.entities[mockTodo1.id!]).toEqual(mockTodo1);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should add multiple todos', () => {
      // Arrange
      const firstState = todoReducer(
        initialTodosState,
        TodoActions.addTodo({ todo: mockTodo1 })
      );

      // Act
      const result = todoReducer(
        firstState,
        TodoActions.addTodo({ todo: mockTodo2 })
      );

      // Assert
      expect(result.ids).toEqual([1, 2]);
      expect(result.entities[mockTodo1.id!]).toEqual(mockTodo1);
      expect(result.entities[mockTodo2.id!]).toEqual(mockTodo2);
    });

    it('should handle addTodoSuccess', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.addTodoSuccess({ todo: mockTodo1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle addTodoFailed', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
      };

      // Act
      const result = todoReducer(currentState, TodoActions.addTodoFailed());

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to add todo!');
    });
  });

  describe('Fetch Todos', () => {
    it('should set loading to true when fetching todos', () => {
      // Act
      const result = todoReducer(initialTodosState, TodoActions.fetchTodos());

      // Assert
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle fetchTodosSuccess', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.fetchTodosSuccess({ todos: mockTodos })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids).toEqual([1, 2, 3]);
      expect(result.entities[1]).toEqual(mockTodo1);
      expect(result.entities[2]).toEqual(mockTodo2);
      expect(result.entities[3]).toEqual(mockTodo3);
    });

    it('should replace existing todos on fetchTodosSuccess', () => {
      // Arrange
      const existingTodo: TodoModel = {
        id: 99,
        categoryId: 1,
        title: 'Existing Todo',
        description: 'Existing todo description',
        dueDate: null,
        isDone: false,
      };
      const currentState: TodosState = {
        ids: [99],
        entities: { 99: existingTodo },
        isLoading: true,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.fetchTodosSuccess({ todos: mockTodos })
      );

      // Assert
      expect(result.ids).toEqual([1, 2, 3]);
      expect(result.entities[99]).toBeUndefined();
      expect(result.entities[1]).toEqual(mockTodo1);
    });

    it('should handle fetchTodosFailed', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
      };

      // Act
      const result = todoReducer(currentState, TodoActions.fetchTodosFailed());

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to fetch todos!');
    });

    it('should handle empty todos array in fetchTodosSuccess', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1, 2],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
        },
        isLoading: true,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.fetchTodosSuccess({ todos: [] })
      );

      // Assert
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('Update Todo', () => {
    it('should update existing todo', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1, 2],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
        },
        isLoading: false,
        error: null,
      };

      const updatedTodo: TodoModel = {
        ...mockTodo1,
        title: 'Updated Project',
        description: 'Updated project description',
        isDone: true,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.updateTodo({ todo: updatedTodo })
      );

      // Assert
      expect(result.entities[1]).toEqual(updatedTodo);
      expect(result.entities[2]).toEqual(mockTodo2);
      expect(result.ids).toEqual([1, 2]);
    });

    it('should not update when todo id is null', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1],
        entities: { 1: mockTodo1 },
        isLoading: false,
        error: null,
      };

      const todoWithoutId: TodoModel = {
        id: null,
        categoryId: 1,
        title: 'Todo without ID',
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.updateTodo({ todo: todoWithoutId })
      );

      // Assert
      expect(result).toBe(currentState);
      expect(result.entities[1]).toEqual(mockTodo1);
    });

    it('should not update non-existing todo', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1],
        entities: { 1: mockTodo1 },
        isLoading: false,
        error: null,
      };

      const nonExistingTodo: TodoModel = {
        id: 999,
        categoryId: 1,
        title: 'Non-existing Todo',
        description: 'Does not exist',
        dueDate: null,
        isDone: false,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.updateTodo({ todo: nonExistingTodo })
      );

      // Assert
      expect(result.entities[999]).toBeUndefined();
      expect(result.entities[1]).toEqual(mockTodo1);
      expect(result.ids).toEqual([1]);
    });

    it('should handle updateTodoSuccess', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.updateTodoSuccess({ todo: mockTodo1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle updateTodoFailed', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
      };

      // Act
      const result = todoReducer(currentState, TodoActions.updateTodoFailed());

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to update todo!');
    });
  });

  describe('Delete Todo', () => {
    it('should delete existing todo', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1, 2, 3],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
          3: mockTodo3,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.deleteTodo({ id: 2 })
      );

      // Assert
      expect(result.ids).toEqual([1, 3]);
      expect(result.entities[2]).toBeUndefined();
      expect(result.entities[1]).toEqual(mockTodo1);
      expect(result.entities[3]).toEqual(mockTodo3);
    });

    it('should handle deleting non-existing todo', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1, 2],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.deleteTodo({ id: 999 })
      );

      // Assert
      expect(result.ids).toEqual([1, 2]);
      expect(result.entities[1]).toEqual(mockTodo1);
      expect(result.entities[2]).toEqual(mockTodo2);
    });

    it('should delete last remaining todo', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1],
        entities: { 1: mockTodo1 },
        isLoading: false,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.deleteTodo({ id: 1 })
      );

      // Assert
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
    });

    it('should not delete when id is null', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1],
        entities: { 1: mockTodo1 },
        isLoading: false,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.deleteTodo({ id: null })
      );

      // Assert
      expect(result).toBe(currentState);
      expect(result.entities[1]).toEqual(mockTodo1);
      expect(result.ids).toEqual([1]);
    });

    it('should handle deleteTodoSuccess', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.deleteTodoSuccess({ id: 1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle deleteTodoFailed', () => {
      // Arrange
      const currentState: TodosState = {
        ...initialTodosState,
        isLoading: true,
      };

      // Act
      const result = todoReducer(currentState, TodoActions.deleteTodoFailed());

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to delete todo!');
    });
  });

  describe('Error State Management', () => {
    it('should clear error on successful operations', () => {
      // Arrange
      const stateWithError: TodosState = {
        ...initialTodosState,
        error: 'Previous error',
      };

      // Act
      const result = todoReducer(
        stateWithError,
        TodoActions.addTodoSuccess({ todo: mockTodo1 })
      );

      // Assert
      expect(result.error).toBeNull();
    });

    it('should preserve entities when setting error', () => {
      // Arrange
      const currentState: TodosState = {
        ids: [1, 2],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
        },
        isLoading: true,
        error: null,
      };

      // Act
      const result = todoReducer(currentState, TodoActions.fetchTodosFailed());

      // Assert
      expect(result.entities[1]).toEqual(mockTodo1);
      expect(result.entities[2]).toEqual(mockTodo2);
      expect(result.ids).toEqual([1, 2]);
      expect(result.error).toBe('Failed to fetch todos!');
    });
  });

  describe('Loading State Management', () => {
    it('should set loading to true for async operations', () => {
      // Act
      const result = todoReducer(initialTodosState, TodoActions.fetchTodos());

      // Assert
      expect(result.isLoading).toBe(true);
    });

    it('should set loading to false on success operations', () => {
      // Arrange
      const loadingState: TodosState = {
        ...initialTodosState,
        isLoading: true,
      };

      // Act
      const result = todoReducer(
        loadingState,
        TodoActions.updateTodoSuccess({ todo: mockTodo1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
    });

    it('should set loading to false on failed operations', () => {
      // Arrange
      const loadingState: TodosState = {
        ...initialTodosState,
        isLoading: true,
      };

      // Act
      const result = todoReducer(loadingState, TodoActions.deleteTodoFailed());

      // Assert
      expect(result.isLoading).toBe(false);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when adding todo', () => {
      // Arrange
      const originalState = initialTodosState;

      // Act
      const result = todoReducer(
        originalState,
        TodoActions.addTodo({ todo: mockTodo1 })
      );

      // Assert
      expect(result).not.toBe(originalState);
      expect(originalState.ids).toEqual([]);
      expect(originalState.entities).toEqual({});
    });

    it('should not mutate original state when updating todo', () => {
      // Arrange
      const originalState: TodosState = {
        ids: [1],
        entities: { 1: mockTodo1 },
        isLoading: false,
        error: null,
      };

      const updatedTodo = { ...mockTodo1, title: 'Updated' };

      // Act
      const result = todoReducer(
        originalState,
        TodoActions.updateTodo({ todo: updatedTodo })
      );

      // Assert
      expect(result).not.toBe(originalState);
      expect(originalState.entities[1]?.title).toBe('Complete project');
      expect(result.entities[1]?.title).toBe('Updated');
    });

    it('should not mutate original state when deleting todo', () => {
      // Arrange
      const originalState: TodosState = {
        ids: [1, 2],
        entities: {
          1: mockTodo1,
          2: mockTodo2,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = todoReducer(
        originalState,
        TodoActions.deleteTodo({ id: 1 })
      );

      // Assert
      expect(result).not.toBe(originalState);
      expect(originalState.ids).toEqual([1, 2]);
      expect(originalState.entities[1]).toEqual(mockTodo1);
      expect(result.ids).toEqual([2]);
      expect(result.entities[1]).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined state gracefully', () => {
      // Act
      const result = todoReducer(
        undefined,
        TodoActions.addTodo({ todo: mockTodo1 })
      );

      // Assert
      expect(result.ids).toContain(mockTodo1.id);
      expect(result.entities[mockTodo1.id!]).toEqual(mockTodo1);
    });

    it('should handle todo with zero id', () => {
      // Arrange
      const todoWithZeroId: TodoModel = {
        id: 0,
        categoryId: 1,
        title: 'Zero ID Todo',
        description: 'Todo with zero ID',
        dueDate: null,
        isDone: false,
      };

      // Act
      const result = todoReducer(
        initialTodosState,
        TodoActions.addTodo({ todo: todoWithZeroId })
      );

      // Assert
      expect(result.ids).toContain(0);
      expect(result.entities[0]).toEqual(todoWithZeroId);
    });

    it('should handle todo with negative id', () => {
      // Arrange
      const todoWithNegativeId: TodoModel = {
        id: -1,
        categoryId: 1,
        title: 'Negative ID Todo',
        description: 'Todo with negative ID',
        dueDate: null,
        isDone: false,
      };

      // Act
      const result = todoReducer(
        initialTodosState,
        TodoActions.addTodo({ todo: todoWithNegativeId })
      );

      // Assert
      expect(result.ids).toContain(-1);
      expect(result.entities[-1]).toEqual(todoWithNegativeId);
    });

    it('should not update todo with zero id (falsy check)', () => {
      // Arrange
      const todoWithZeroId: TodoModel = {
        id: 0,
        categoryId: 1,
        title: 'Zero ID Todo',
        description: 'Todo with zero ID',
        dueDate: null,
        isDone: false,
      };

      const currentState: TodosState = {
        ids: [0],
        entities: { 0: todoWithZeroId },
        isLoading: false,
        error: null,
      };

      const updatedTodo = { ...todoWithZeroId, title: 'Updated Zero ID Todo' };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.updateTodo({ todo: updatedTodo })
      );

      // Assert - Zero is falsy, so no update should occur
      expect(result).toBe(currentState);
      expect(result.entities[0]).toEqual(todoWithZeroId);
    });

    it('should not delete todo with zero id (falsy check)', () => {
      // Arrange
      const todoWithZeroId: TodoModel = {
        id: 0,
        categoryId: 1,
        title: 'Zero ID Todo',
        description: 'Todo with zero ID',
        dueDate: null,
        isDone: false,
      };

      const currentState: TodosState = {
        ids: [0, 1],
        entities: {
          0: todoWithZeroId,
          1: mockTodo1,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = todoReducer(
        currentState,
        TodoActions.deleteTodo({ id: 0 })
      );

      // Assert - Zero is falsy, so no deletion should occur
      expect(result).toBe(currentState);
      expect(result.ids).toEqual([0, 1]);
      expect(result.entities[0]).toEqual(todoWithZeroId);
      expect(result.entities[1]).toEqual(mockTodo1);
    });
  });
});
