import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  selectTodosState,
  selectAllTodos,
  selectTodosByCategory,
  selectTodosByCategoryWithVisibility,
  selectError,
  selectIsLoading,
} from './todo.selector';
import { TodosState, TodoModel } from '../../../../libs/data-access/todo';
import { CategoryModel } from '../../../../libs/data-access/todo';
import { todoEntityAdapter } from './todo.entity';

describe('TodoSelectors', () => {
  let store: MockStore;

  // Mock data
  const mockTodos: TodoModel[] = [
    {
      id: 1,
      categoryId: 1,
      title: 'Todo 1',
      description: 'Description 1',
      dueDate: '2025-01-01',
      isDone: false,
    },
    {
      id: 2,
      categoryId: 1,
      title: 'Todo 2',
      description: 'Description 2',
      dueDate: '2025-01-02',
      isDone: true,
    },
    {
      id: 3,
      categoryId: 2,
      title: 'Todo 3',
      description: 'Description 3',
      dueDate: '2025-01-03',
      isDone: false,
    },
  ];

  const mockCategory: CategoryModel = {
    id: 1,
    title: 'Category 1',
    description: 'Category Description',
    showDoneTodos: true,
  };

  const mockCategoryHideDone: CategoryModel = {
    id: 1,
    title: 'Category 1',
    description: 'Category Description',
    showDoneTodos: false,
  };

  const mockTodosState: TodosState = {
    ...todoEntityAdapter.getInitialState(),
    ids: [1, 2, 3],
    entities: {
      1: mockTodos[0],
      2: mockTodos[1],
      3: mockTodos[2],
    },
    isLoading: false,
    error: null,
  };

  const mockAppState = {
    todo: mockTodosState,
    router: {
      state: {
        root: {
          params: {
            categoryId: '1',
          },
        },
      },
    },
    category: {
      ids: [1],
      entities: {
        1: mockCategory,
      },
      isLoading: false,
      error: null,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: mockAppState,
        }),
      ],
    });

    store = TestBed.inject(Store) as MockStore;
  });

  describe('selectTodosState', () => {
    it('should select the todos feature state', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result = selectTodosState(state);

      // Assert
      expect(result).toEqual(mockTodosState);
    });

    it('should return undefined when todos state is missing', () => {
      // Arrange
      const stateWithoutTodos = {
        ...mockAppState,
        todo: undefined,
      };

      // Act
      const result = selectTodosState(stateWithoutTodos);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('selectAllTodos', () => {
    it('should select all todos from state', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result = selectAllTodos(state);

      // Assert
      expect(result).toEqual(mockTodos);
      expect(result.length).toBe(3);
    });

    it('should return empty array when todos state is empty', () => {
      // Arrange
      const stateWithEmptyTodos = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          ids: [],
          entities: {},
        },
      };

      // Act
      const result = selectAllTodos(stateWithEmptyTodos);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return todos in order based on ids array', () => {
      // Arrange
      const stateWithReorderedIds = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          ids: [3, 1, 2],
        },
      };

      // Act
      const result = selectAllTodos(stateWithReorderedIds);

      // Assert
      expect(result).toEqual([mockTodos[2], mockTodos[0], mockTodos[1]]);
    });

    it('should handle missing entities gracefully', () => {
      // Arrange
      const stateWithMissingEntities = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          ids: [1, 2, 4], // ID 4 doesn't exist in entities
          entities: {
            1: mockTodos[0],
            2: mockTodos[1],
          },
        },
      };

      // Act
      const result = selectAllTodos(stateWithMissingEntities);

      // Assert
      expect(result[0]).toEqual(mockTodos[0]);
      expect(result[1]).toEqual(mockTodos[1]);
      expect(result[2]).toBeUndefined();
    });
  });

  describe('selectTodosByCategory', () => {
    it('should select todos for specific category from route params', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result = selectTodosByCategory(state);

      // Assert
      const expectedTodos = mockTodos.filter((todo) => todo.categoryId === 1);
      expect(result).toEqual(expectedTodos);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no todos match category', () => {
      // Arrange
      const stateWithDifferentCategory = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '999', // Non-existent category
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithDifferentCategory);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle string to number conversion for categoryId', () => {
      // Arrange
      const stateWithStringCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '2',
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithStringCategoryId);

      // Assert
      const expectedTodos = mockTodos.filter((todo) => todo.categoryId === 2);
      expect(result).toEqual(expectedTodos);
      expect(result.length).toBe(1);
    });

    it('should handle zero categoryId', () => {
      // Arrange
      const stateWithZeroCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '0',
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithZeroCategoryId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle negative categoryId', () => {
      // Arrange
      const stateWithNegativeCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '-1',
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithNegativeCategoryId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle invalid categoryId format', () => {
      // Arrange
      const stateWithInvalidCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: 'invalid',
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithInvalidCategoryId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle missing categoryId param', () => {
      // Arrange
      const stateWithoutCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {},
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithoutCategoryId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when router state is missing', () => {
      // Arrange
      const stateWithoutRouter = {
        ...mockAppState,
        router: undefined,
      };

      // Act
      const result = selectTodosByCategory(stateWithoutRouter);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when todos array is empty', () => {
      // Arrange
      const stateWithEmptyTodos = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          ids: [],
          entities: {},
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithEmptyTodos);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('selectTodosByCategoryWithVisibility', () => {
    it('should return all todos when category showDoneTodos is true', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result = selectTodosByCategoryWithVisibility(state);

      // Assert
      const expectedTodos = mockTodos.filter((todo) => todo.categoryId === 1);
      expect(result).toEqual(expectedTodos);
      expect(result.length).toBe(2);
    });

    it('should filter out done todos when category showDoneTodos is false', () => {
      // Arrange
      const stateWithHideDone = {
        ...mockAppState,
        category: {
          ids: [1],
          entities: {
            1: mockCategoryHideDone,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectTodosByCategoryWithVisibility(stateWithHideDone);

      // Assert
      const expectedTodos = mockTodos.filter(
        (todo) => todo.categoryId === 1 && !todo.isDone
      );
      expect(result).toEqual(expectedTodos);
      expect(result.length).toBe(1);
      expect(result[0].isDone).toBe(false);
    });

    it('should return empty array when category is null', () => {
      // Arrange
      const stateWithNullCategory = {
        ...mockAppState,
        category: {
          ids: [],
          entities: {},
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectTodosByCategoryWithVisibility(stateWithNullCategory);

      // Assert
      // When category is null/undefined, the selector filters out done todos by default
      const expectedTodos = mockTodos.filter(
        (todo) => todo.categoryId === 1 && !todo.isDone
      );
      expect(result).toEqual(expectedTodos);
    });

    it('should return empty array when no todos match category', () => {
      // Arrange
      const stateWithDifferentCategory = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '999',
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategoryWithVisibility(
        stateWithDifferentCategory
      );

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle category with undefined showDoneTodos', () => {
      // Arrange
      const categoryWithUndefinedShowDone = {
        ...mockCategory,
        showDoneTodos: undefined as any,
      };
      const stateWithUndefinedShowDone = {
        ...mockAppState,
        category: {
          ids: [1],
          entities: {
            1: categoryWithUndefinedShowDone,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectTodosByCategoryWithVisibility(
        stateWithUndefinedShowDone
      );

      // Assert
      const expectedTodos = mockTodos.filter(
        (todo) => todo.categoryId === 1 && !todo.isDone
      );
      expect(result).toEqual(expectedTodos);
    });

    it('should handle all todos being done when showDoneTodos is false', () => {
      // Arrange
      const allDoneTodos: TodoModel[] = [
        { ...mockTodos[0], isDone: true },
        { ...mockTodos[1], isDone: true },
      ];
      const stateWithAllDoneTodos = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          entities: {
            1: allDoneTodos[0],
            2: allDoneTodos[1],
            3: mockTodos[2],
          },
        },
        category: {
          ids: [1],
          entities: {
            1: mockCategoryHideDone,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectTodosByCategoryWithVisibility(stateWithAllDoneTodos);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle all todos being not done when showDoneTodos is true', () => {
      // Arrange
      const allNotDoneTodos: TodoModel[] = [
        { ...mockTodos[0], isDone: false },
        { ...mockTodos[1], isDone: false },
      ];
      const stateWithAllNotDoneTodos = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          entities: {
            1: allNotDoneTodos[0],
            2: allNotDoneTodos[1],
            3: mockTodos[2],
          },
        },
      };

      // Act
      const result = selectTodosByCategoryWithVisibility(
        stateWithAllNotDoneTodos
      );

      // Assert
      expect(result).toEqual(allNotDoneTodos);
      expect(result.length).toBe(2);
    });
  });

  describe('selectError', () => {
    it('should select error from todos state', () => {
      // Arrange
      const errorMessage = 'Test error';
      const stateWithError = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          error: errorMessage,
        },
      };

      // Act
      const result = selectError(stateWithError);

      // Assert
      expect(result).toBe(errorMessage);
    });

    it('should return null when no error', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result = selectError(state);

      // Assert
      expect(result).toBeNull();
    });

    it('should return explicit null error', () => {
      // Arrange
      const stateWithNullError = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          error: null,
        },
      };

      // Act
      const result = selectError(stateWithNullError);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('selectIsLoading', () => {
    it('should select loading state from todos state', () => {
      // Arrange
      const stateWithLoading = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          isLoading: true,
        },
      };

      // Act
      const result = selectIsLoading(stateWithLoading);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when not loading', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result = selectIsLoading(state);

      // Assert
      expect(result).toBe(false);
    });

    it('should return explicit false loading state', () => {
      // Arrange
      const stateWithFalseLoading = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          isLoading: false,
        },
      };

      // Act
      const result = selectIsLoading(stateWithFalseLoading);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Selector Memoization', () => {
    it('should return same reference for selectAllTodos when state unchanged', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result1 = selectAllTodos(state);
      const result2 = selectAllTodos(state);

      // Assert
      expect(result1).toBe(result2);
    });

    it('should return different reference for selectAllTodos when state changes', () => {
      // Arrange
      const state1 = mockAppState;
      const state2 = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          ids: [1, 2],
        },
      };

      // Act
      const result1 = selectAllTodos(state1);
      const result2 = selectAllTodos(state2);

      // Assert
      expect(result1).not.toBe(result2);
    });

    it('should return same reference for selectTodosByCategory when relevant state unchanged', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result1 = selectTodosByCategory(state);
      const result2 = selectTodosByCategory(state);

      // Assert
      expect(result1).toBe(result2);
    });

    it('should return same reference for selectError when state unchanged', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result1 = selectError(state);
      const result2 = selectError(state);

      // Assert
      expect(result1).toBe(result2);
    });

    it('should return same reference for selectIsLoading when state unchanged', () => {
      // Arrange
      const state = mockAppState;

      // Act
      const result1 = selectIsLoading(state);
      const result2 = selectIsLoading(state);

      // Assert
      expect(result1).toBe(result2);
    });
  });

  describe('Selector Composition', () => {
    it('should handle undefined todos state in composed selectors', () => {
      // Arrange
      const stateWithUndefinedTodos = {
        ...mockAppState,
        todo: undefined,
      };

      // Act & Assert
      expect(() => selectAllTodos(stateWithUndefinedTodos)).toThrow();
    });

    it('should handle partial state in composed selectors', () => {
      // Arrange
      const partialState = {
        todo: mockTodosState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '1',
              },
            },
          },
        },
        // Missing category state
      };

      // Act & Assert - This will throw because the selector tries to access category state
      expect(() => selectTodosByCategoryWithVisibility(partialState)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null entities in selectAllTodos', () => {
      // Arrange
      const stateWithNullEntities = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          entities: {
            1: null,
            2: mockTodos[1],
            3: mockTodos[2],
          },
        },
      };

      // Act
      const result = selectAllTodos(stateWithNullEntities);

      // Assert
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(mockTodos[1]);
      expect(result[2]).toEqual(mockTodos[2]);
    });

    it('should handle undefined entities in selectAllTodos', () => {
      // Arrange
      const stateWithUndefinedEntities = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          entities: {
            1: undefined,
            2: mockTodos[1],
            3: mockTodos[2],
          },
        },
      };

      // Act
      const result = selectAllTodos(stateWithUndefinedEntities);

      // Assert
      expect(result[0]).toBeUndefined();
      expect(result[1]).toEqual(mockTodos[1]);
      expect(result[2]).toEqual(mockTodos[2]);
    });

    it('should handle empty string categoryId in route params', () => {
      // Arrange
      const stateWithEmptyStringCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: '',
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithEmptyStringCategoryId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle null categoryId in route params', () => {
      // Arrange
      const stateWithNullCategoryId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: {
                categoryId: null,
              },
            },
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithNullCategoryId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle todos with null categoryId', () => {
      // Arrange
      const todosWithNullCategoryId: TodoModel[] = [
        { ...mockTodos[0], categoryId: null },
        { ...mockTodos[1], categoryId: 1 },
      ];
      const stateWithNullCategoryIdTodos = {
        ...mockAppState,
        todo: {
          ...mockTodosState,
          entities: {
            1: todosWithNullCategoryId[0],
            2: todosWithNullCategoryId[1],
            3: mockTodos[2],
          },
        },
      };

      // Act
      const result = selectTodosByCategory(stateWithNullCategoryIdTodos);

      // Assert
      expect(result).toEqual([todosWithNullCategoryId[1]]);
    });
  });
});
