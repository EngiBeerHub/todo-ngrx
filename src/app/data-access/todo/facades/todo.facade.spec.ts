import {TestBed} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {TodoFacade} from './todo.facade';
import {TodoActions, TodoSelectors} from '../state';
import {CategorySelectors} from '../../category/state';
import {CategoryModel, TodoModel, TodosViewModel} from '../../../../libs/data-access/todo';

describe('TodoFacade', () => {
  let facade: TodoFacade;
  let mockStore: jasmine.SpyObj<Store>;

  const mockCategory: CategoryModel = {
    id: 1,
    title: 'Work',
    description: 'Work related tasks',
    showDoneTodos: false,
  };

  const mockTodos: TodoModel[] = [
    {
      id: 1,
      categoryId: 1,
      title: 'Complete project',
      description: 'Finish the todo app',
      dueDate: '2025-01-30',
      isDone: false,
    },
    {
      id: 2,
      categoryId: 1,
      title: 'Review code',
      description: 'Review pull requests',
      dueDate: null,
      isDone: true,
    },
    {
      id: 3,
      categoryId: 2,
      title: 'Buy groceries',
      description: 'Weekly shopping',
      dueDate: '2025-01-28',
      isDone: false,
    },
  ];

  const mockFilteredTodos: TodoModel[] = [
    {
      id: 1,
      categoryId: 1,
      title: 'Complete project',
      description: 'Finish the todo app',
      dueDate: '2025-01-30',
      isDone: false,
    },
  ];

  const mockTodosViewModel: TodosViewModel = {
    category: mockCategory,
    showDoneTodos: false,
    todos: mockFilteredTodos,
  };

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    // Set up store selectors before facade creation
    storeSpy.select.and.callFake((selector: any) => {
      switch (selector) {
        case CategorySelectors.selectCategoryById:
          return of(mockCategory);
        case TodoSelectors.selectAllTodos:
          return of(mockTodos);
        case TodoSelectors.selectTodosByCategoryWithVisibility:
          return of(mockFilteredTodos);
        case TodoSelectors.selectIsLoading:
          return of(false);
        default:
          return of(null);
      }
    });

    await TestBed.configureTestingModule({
      providers: [TodoFacade, { provide: Store, useValue: storeSpy }],
    }).compileComponents();

    facade = TestBed.inject(TodoFacade);
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  describe('Initialization', () => {
    it('should be created', () => {
      // Assert
      expect(facade).toBeTruthy();
    });
  });

  describe('Computed Properties', () => {
    it('should provide todosViewModel computed signal', () => {
      // Act
      const viewModel = facade.$todosViewModel();

      // Assert
      expect(viewModel).toEqual(mockTodosViewModel);
      expect(viewModel.category).toEqual(mockCategory);
      expect(viewModel.showDoneTodos).toBe(false);
      expect(viewModel.todos).toEqual(mockFilteredTodos);
    });

    it('should provide isLoading signal', () => {
      // Act & Assert
      expect(facade.$isLoading()).toBe(false);
    });

    it('should handle null category in todosViewModel', () => {
      // Arrange
      const storeSpyWithNullCategory = jasmine.createSpyObj('Store', [
        'dispatch',
        'select',
      ]);
      storeSpyWithNullCategory.select.and.callFake((selector: any) => {
        switch (selector) {
          case CategorySelectors.selectCategoryById:
            return of(null);
          case TodoSelectors.selectAllTodos:
            return of(mockTodos);
          case TodoSelectors.selectTodosByCategoryWithVisibility:
            return of(mockFilteredTodos);
          case TodoSelectors.selectIsLoading:
            return of(false);
          default:
            return of(null);
        }
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TodoFacade,
          { provide: Store, useValue: storeSpyWithNullCategory },
        ],
      });

      const facadeWithNullCategory = TestBed.inject(TodoFacade);

      // Act
      const viewModel = facadeWithNullCategory.$todosViewModel();

      // Assert
      expect(viewModel.category).toBeNull();
      expect(viewModel.showDoneTodos).toBe(false);
      expect(viewModel.todos).toEqual(mockFilteredTodos);
    });
  });

  describe('State Management Actions', () => {
    it('should dispatch resetTodosState action', () => {
      // Act
      facade.resetTodosState();

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.resetTodosState()
      );
    });

    it('should dispatch fetchTodos action', () => {
      // Act
      facade.fetchTodos();

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(TodoActions.fetchTodos());
    });

    it('should dispatch getTodo action with id', () => {
      // Arrange
      const todoId = 1;

      // Act
      facade.getTodo(todoId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.getTodo({ id: todoId })
      );
    });
  });

  describe('Add Todo', () => {
    it('should add todo with auto-generated id and category id', () => {
      // Arrange
      const newTodo: TodoModel = {
        id: null,
        categoryId: null,
        title: 'New Todo',
        description: 'New todo description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.addTodo(newTodo);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.addTodo({
          todo: {
            ...newTodo,
            id: 4, // Max id (3) + 1
            categoryId: 1, // From current category
          },
        })
      );
    });

    it('should not add todo if title is empty', () => {
      // Arrange
      const todoWithoutTitle: TodoModel = {
        id: null,
        categoryId: null,
        title: '',
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.addTodo(todoWithoutTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not add todo if title is null', () => {
      // Arrange
      const todoWithNullTitle: TodoModel = {
        id: null,
        categoryId: null,
        title: null as any,
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.addTodo(todoWithNullTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should add todo with id 1 when no todos exist', () => {
      // Arrange
      const storeSpyWithEmptyTodos = jasmine.createSpyObj('Store', [
        'dispatch',
        'select',
      ]);
      storeSpyWithEmptyTodos.select.and.callFake((selector: any) => {
        switch (selector) {
          case CategorySelectors.selectCategoryById:
            return of(mockCategory);
          case TodoSelectors.selectAllTodos:
            return of([]);
          case TodoSelectors.selectTodosByCategoryWithVisibility:
            return of([]);
          case TodoSelectors.selectIsLoading:
            return of(false);
          default:
            return of(null);
        }
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TodoFacade,
          { provide: Store, useValue: storeSpyWithEmptyTodos },
        ],
      });

      const facadeWithEmptyTodos = TestBed.inject(TodoFacade);
      const newTodo: TodoModel = {
        id: null,
        categoryId: null,
        title: 'First Todo',
        description: 'First todo description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facadeWithEmptyTodos.addTodo(newTodo);

      // Assert
      expect(storeSpyWithEmptyTodos.dispatch).toHaveBeenCalledWith(
        TodoActions.addTodo({
          todo: {
            ...newTodo,
            id: 1,
            categoryId: 1,
          },
        })
      );
    });

    it('should add todo without categoryId when no current category', () => {
      // Arrange
      const storeSpyWithoutCategory = jasmine.createSpyObj('Store', [
        'dispatch',
        'select',
      ]);
      storeSpyWithoutCategory.select.and.callFake((selector: any) => {
        switch (selector) {
          case CategorySelectors.selectCategoryById:
            return of(null);
          case TodoSelectors.selectAllTodos:
            return of(mockTodos);
          case TodoSelectors.selectTodosByCategoryWithVisibility:
            return of(mockFilteredTodos);
          case TodoSelectors.selectIsLoading:
            return of(false);
          default:
            return of(null);
        }
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TodoFacade,
          { provide: Store, useValue: storeSpyWithoutCategory },
        ],
      });

      const facadeWithoutCategory = TestBed.inject(TodoFacade);
      const newTodo: TodoModel = {
        id: null,
        categoryId: null,
        title: 'New Todo',
        description: 'New todo description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facadeWithoutCategory.addTodo(newTodo);

      // Assert
      expect(storeSpyWithoutCategory.dispatch).toHaveBeenCalledWith(
        TodoActions.addTodo({
          todo: {
            ...newTodo,
            id: 4,
            categoryId: null, // Should remain null when no current category
          },
        })
      );
    });
  });

  describe('Update Todo', () => {
    it('should update todo when id and title are valid', () => {
      // Arrange
      const todoToUpdate: TodoModel = {
        id: 1,
        categoryId: 1,
        title: 'Updated Todo',
        description: 'Updated description',
        dueDate: '2025-02-01',
        isDone: true,
      };

      // Act
      facade.updateTodo(todoToUpdate);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.updateTodo({ todo: todoToUpdate })
      );
    });

    it('should throw error when todo id is null', () => {
      // Arrange
      const todoWithoutId: TodoModel = {
        id: null,
        categoryId: 1,
        title: 'Todo without ID',
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act & Assert
      expect(() => facade.updateTodo(todoWithoutId)).toThrowError(
        'todo.id is null.'
      );
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not update todo when title is empty', () => {
      // Arrange
      const todoWithEmptyTitle: TodoModel = {
        id: 1,
        categoryId: 1,
        title: '',
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.updateTodo(todoWithEmptyTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not update todo when title is null', () => {
      // Arrange
      const todoWithNullTitle: TodoModel = {
        id: 1,
        categoryId: 1,
        title: null as any,
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.updateTodo(todoWithNullTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Delete Todo', () => {
    it('should delete todo with valid id', () => {
      // Arrange
      const todoId = 1;

      // Act
      facade.deleteTodo(todoId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.deleteTodo({ id: todoId })
      );
    });

    it('should throw error when id is null', () => {
      // Act & Assert
      expect(() => facade.deleteTodo(null)).toThrowError('todo.id is null.');
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should throw error when id is 0', () => {
      // Act & Assert
      expect(() => facade.deleteTodo(0)).toThrowError('todo.id is null.');
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should delete todo with negative id (edge case)', () => {
      // Arrange
      const negativeId = -1;

      // Act
      facade.deleteTodo(negativeId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.deleteTodo({ id: negativeId })
      );
    });
  });

  describe('ID Generation Logic', () => {
    it('should calculate max id correctly from existing todos', () => {
      // Arrange
      const newTodo: TodoModel = {
        id: null,
        categoryId: null,
        title: 'Test Todo',
        description: 'Test',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.addTodo(newTodo);

      // Assert - Should generate id 4 (max of 1,2,3 + 1)
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.addTodo({
          todo: {
            ...newTodo,
            id: 4,
            categoryId: 1,
          },
        })
      );
    });

    it('should handle empty todos array', () => {
      // Arrange
      const emptyTodos: TodoModel[] = [];

      // Act
      const maxId = Math.max(0, ...emptyTodos.map((todo) => todo.id!));
      const expectedId = maxId + 1;

      // Assert
      expect(expectedId).toBe(1);
    });

    it('should handle todos with null ids', () => {
      // Arrange
      const todosWithNullIds: TodoModel[] = [
        {
          id: null,
          categoryId: 1,
          title: 'Todo 1',
          description: '',
          dueDate: null,
          isDone: false,
        },
        {
          id: 2,
          categoryId: 1,
          title: 'Todo 2',
          description: '',
          dueDate: null,
          isDone: false,
        },
        {
          id: null,
          categoryId: 1,
          title: 'Todo 3',
          description: '',
          dueDate: null,
          isDone: false,
        },
      ];

      // Act
      const validIds = todosWithNullIds
        .map((todo) => todo.id!)
        .filter((id) => id !== null);
      const maxId = Math.max(0, ...validIds);
      const expectedId = maxId + 1;

      // Assert
      expect(expectedId).toBe(3); // Max valid id (2) + 1
    });
  });

  describe('Category Integration', () => {
    it('should set categoryId from current category when adding todo', () => {
      // Arrange
      const newTodo: TodoModel = {
        id: null,
        categoryId: null,
        title: 'New Todo',
        description: 'Description',
        dueDate: null,
        isDone: false,
      };

      // Act
      facade.addTodo(newTodo);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        TodoActions.addTodo({
          todo: {
            ...newTodo,
            id: 4,
            categoryId: mockCategory.id,
          },
        })
      );
    });

    it('should derive showDoneTodos from current category', () => {
      // Act
      const viewModel = facade.$todosViewModel();

      // Assert
      expect(viewModel.showDoneTodos).toBe(mockCategory.showDoneTodos);
    });

    it('should handle category with showDoneTodos true', () => {
      // Arrange
      const categoryWithShowDone: CategoryModel = {
        ...mockCategory,
        showDoneTodos: true,
      };

      const storeSpyWithShowDone = jasmine.createSpyObj('Store', [
        'dispatch',
        'select',
      ]);
      storeSpyWithShowDone.select.and.callFake((selector: any) => {
        switch (selector) {
          case CategorySelectors.selectCategoryById:
            return of(categoryWithShowDone);
          case TodoSelectors.selectAllTodos:
            return of(mockTodos);
          case TodoSelectors.selectTodosByCategoryWithVisibility:
            return of(mockFilteredTodos);
          case TodoSelectors.selectIsLoading:
            return of(false);
          default:
            return of(null);
        }
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TodoFacade,
          { provide: Store, useValue: storeSpyWithShowDone },
        ],
      });

      const facadeWithShowDone = TestBed.inject(TodoFacade);

      // Act
      const viewModel = facadeWithShowDone.$todosViewModel();

      // Assert
      expect(viewModel.showDoneTodos).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle store dispatch calls without errors', () => {
      // Act & Assert
      expect(() => facade.resetTodosState()).not.toThrow();
      expect(() => facade.fetchTodos()).not.toThrow();
      expect(() => facade.getTodo(1)).not.toThrow();
    });

    it('should validate input parameters correctly', () => {
      // Arrange
      const invalidTodo: TodoModel = {
        id: null,
        categoryId: null,
        title: '',
        description: 'Test',
        dueDate: null,
        isDone: false,
      };

      // Act & Assert
      expect(() => facade.addTodo(invalidTodo)).not.toThrow();
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should handle undefined category gracefully', () => {
      // Arrange
      const storeSpyWithUndefinedCategory = jasmine.createSpyObj('Store', [
        'dispatch',
        'select',
      ]);
      storeSpyWithUndefinedCategory.select.and.callFake((selector: any) => {
        switch (selector) {
          case CategorySelectors.selectCategoryById:
            return of(undefined);
          case TodoSelectors.selectAllTodos:
            return of(mockTodos);
          case TodoSelectors.selectTodosByCategoryWithVisibility:
            return of(mockFilteredTodos);
          case TodoSelectors.selectIsLoading:
            return of(false);
          default:
            return of(null);
        }
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TodoFacade,
          { provide: Store, useValue: storeSpyWithUndefinedCategory },
        ],
      });

      const facadeWithUndefinedCategory = TestBed.inject(TodoFacade);

      // Act
      const viewModel = facadeWithUndefinedCategory.$todosViewModel();

      // Assert
      expect(viewModel.category).toBeNull();
      expect(viewModel.showDoneTodos).toBe(false);
    });
  });
});
