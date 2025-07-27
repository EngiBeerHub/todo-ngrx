import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { TodoEffects } from './todo.effects';
import { TodoActions } from './index';
import { TodoHttpService, TodoModel } from '../../../../libs/data-access/todo';

describe('TodoEffects', () => {
  let effects: TodoEffects;
  let actions$: Observable<Action>;
  let store: MockStore;
  let todoHttpService: jasmine.SpyObj<TodoHttpService>;
  let testScheduler: TestScheduler;

  // Mock data
  const mockTodo: TodoModel = {
    id: 1,
    categoryId: 1,
    title: 'Test Todo',
    description: 'Test Description',
    dueDate: '2025-01-01',
    isDone: false,
  };

  const mockTodos: TodoModel[] = [
    mockTodo,
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

  const mockInitialState = {
    todo: {
      ids: [1, 2, 3],
      entities: {
        1: mockTodos[0],
        2: mockTodos[1],
        3: mockTodos[2],
      },
      isLoading: false,
      error: null,
    },
  };

  beforeEach(() => {
    const todoHttpServiceSpy = jasmine.createSpyObj('TodoHttpService', [
      'get',
      'getById',
      'post',
      'put',
      'delete',
    ]);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: mockInitialState }),
        { provide: TodoHttpService, useValue: todoHttpServiceSpy },
      ],
    });

    effects = TestBed.inject(TodoEffects);
    store = TestBed.inject(Store) as MockStore;
    todoHttpService = TestBed.inject(
      TodoHttpService
    ) as jasmine.SpyObj<TodoHttpService>;
  });

  describe('addTodo$', () => {
    it('should dispatch addTodoSuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.addTodo({ todo: mockTodo });
        const outcome = TodoActions.addTodoSuccess({ todo: mockTodo });

        actions$ = hot('-a', { a: action });
        todoHttpService.post.and.returnValue(cold('-b|', { b: mockTodo }));

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch addTodoFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.addTodo({ todo: mockTodo });
        const outcome = TodoActions.addTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.post.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle multiple concurrent add requests sequentially', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todo1 = { ...mockTodo, id: 1 };
        const todo2 = { ...mockTodo, id: 2 };
        const action1 = TodoActions.addTodo({ todo: todo1 });
        const action2 = TodoActions.addTodo({ todo: todo2 });
        const outcome1 = TodoActions.addTodoSuccess({ todo: todo1 });
        const outcome2 = TodoActions.addTodoSuccess({ todo: todo2 });

        actions$ = hot('-ab', { a: action1, b: action2 });
        todoHttpService.post.and.returnValues(
          cold('--x|', { x: todo1 }),
          cold('--y|', { y: todo2 })
        );

        // Act & Assert - concatMap processes sequentially
        expectObservable(effects.addTodo$).toBe('---x--y', {
          x: outcome1,
          y: outcome2,
        });
      });
    });

    it('should handle todo with null id', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithNullId = { ...mockTodo, id: null };
        const action = TodoActions.addTodo({ todo: todoWithNullId });
        const outcome = TodoActions.addTodoSuccess({ todo: todoWithNullId });

        actions$ = hot('-a', { a: action });
        todoHttpService.post.and.returnValue(
          cold('-b|', { b: todoWithNullId })
        );

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle todo with null categoryId', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithNullCategoryId = { ...mockTodo, categoryId: null };
        const action = TodoActions.addTodo({ todo: todoWithNullCategoryId });
        const outcome = TodoActions.addTodoSuccess({
          todo: todoWithNullCategoryId,
        });

        actions$ = hot('-a', { a: action });
        todoHttpService.post.and.returnValue(
          cold('-b|', { b: todoWithNullCategoryId })
        );

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('fetchTodos$', () => {
    it('should dispatch fetchTodosSuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosSuccess({ todos: mockTodos });

        actions$ = hot('-a', { a: action });
        todoHttpService.get.and.returnValue(cold('-b|', { b: mockTodos }));

        // Act & Assert
        expectObservable(effects.fetchTodos$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch fetchTodosFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.get.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.fetchTodos$).toBe('--c', { c: outcome });
      });
    });

    it('should handle empty todos array', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosSuccess({ todos: [] });

        actions$ = hot('-a', { a: action });
        todoHttpService.get.and.returnValue(cold('-b|', { b: [] }));

        // Act & Assert
        expectObservable(effects.fetchTodos$).toBe('--c', { c: outcome });
      });
    });

    it('should cancel previous request when new fetch is triggered', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action1 = TodoActions.fetchTodos();
        const action2 = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosSuccess({ todos: mockTodos });

        actions$ = hot('-ab', { a: action1, b: action2 });
        todoHttpService.get.and.returnValues(
          cold('----x|', { x: mockTodos }),
          cold('--y|', { y: mockTodos })
        );

        // Act & Assert - Only the second request should complete
        expectObservable(effects.fetchTodos$).toBe('----c', { c: outcome });
      });
    });

    it('should handle todos with mixed completion status', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const mixedTodos = [
          { ...mockTodo, isDone: false },
          { ...mockTodo, id: 2, isDone: true },
        ];
        const action = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosSuccess({ todos: mixedTodos });

        actions$ = hot('-a', { a: action });
        todoHttpService.get.and.returnValue(cold('-b|', { b: mixedTodos }));

        // Act & Assert
        expectObservable(effects.fetchTodos$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('getTodo$', () => {
    it('should return cached todo if available in store', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodo({ id: 1 });
        const outcome = TodoActions.getTodoSuccess({ todo: mockTodo });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('-c', { c: outcome });
        expect(todoHttpService.getById).not.toHaveBeenCalled();
      });
    });

    it('should fetch from API if todo not in store', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodo({ id: 999 }); // Non-existent ID
        const outcome = TodoActions.getTodoSuccess({ todo: mockTodo });

        actions$ = hot('-a', { a: action });
        todoHttpService.getById.and.returnValue(cold('-b|', { b: mockTodo }));

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch getTodoFailed on API error when fetching from server', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodo({ id: 999 });
        const outcome = TodoActions.getTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.getById.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle todo with id 0', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithZeroId = { ...mockTodo, id: 0 };
        const action = TodoActions.getTodo({ id: 0 });
        const outcome = TodoActions.getTodoSuccess({ todo: todoWithZeroId });

        actions$ = hot('-a', { a: action });
        todoHttpService.getById.and.returnValue(
          cold('-b|', { b: todoWithZeroId })
        );

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle negative todo id', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodo({ id: -1 });
        const outcome = TodoActions.getTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.getById.and.returnValue(
          cold('-#|', {}, new Error('Invalid ID'))
        );

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should prefer cached todo over API call', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodo({ id: 1 });
        const outcome = TodoActions.getTodoSuccess({ todo: mockTodo });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('-c', { c: outcome });
        expect(todoHttpService.getById).not.toHaveBeenCalled();
      });
    });

    it('should handle todo with null id in cache', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithNullId = { ...mockTodo, id: null };
        const stateWithNullIdTodo = {
          todo: {
            ids: [null, 2, 3],
            entities: {
              null: todoWithNullId,
              2: mockTodos[1],
              3: mockTodos[2],
            },
            isLoading: false,
            error: null,
          },
        };

        store.setState(stateWithNullIdTodo);

        const action = TodoActions.getTodo({ id: null as any });
        const outcome = TodoActions.getTodoSuccess({ todo: todoWithNullId });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('-c', { c: outcome });
      });
    });
  });

  describe('getTodoSuccess$', () => {
    it('should emit todo without dispatching action', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodoSuccess({ todo: mockTodo });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getTodoSuccess$).toBe('-c', { c: mockTodo });
      });
    });

    it('should handle null todo', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const nullTodo = null as any;
        const action = TodoActions.getTodoSuccess({ todo: nullTodo });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getTodoSuccess$).toBe('-c', { c: nullTodo });
      });
    });

    it('should handle multiple success actions', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action1 = TodoActions.getTodoSuccess({ todo: mockTodos[0] });
        const action2 = TodoActions.getTodoSuccess({ todo: mockTodos[1] });

        actions$ = hot('-ab', { a: action1, b: action2 });

        // Act & Assert
        expectObservable(effects.getTodoSuccess$).toBe('-xy', {
          x: mockTodos[0],
          y: mockTodos[1],
        });
      });
    });

    it('should handle todo with all properties', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const completeTodo = {
          id: 1,
          categoryId: 2,
          title: 'Complete Todo',
          description: 'Full description',
          dueDate: '2025-12-31',
          isDone: true,
        };
        const action = TodoActions.getTodoSuccess({ todo: completeTodo });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getTodoSuccess$).toBe('-c', {
          c: completeTodo,
        });
      });
    });
  });

  describe('updateTodo$', () => {
    it('should dispatch updateTodoSuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const updatedTodo = { ...mockTodo, title: 'Updated Title' };
        const action = TodoActions.updateTodo({ todo: updatedTodo });
        const outcome = TodoActions.updateTodoSuccess({ todo: updatedTodo });

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(cold('-b|', { b: updatedTodo }));

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch updateTodoFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.updateTodo({ todo: mockTodo });
        const outcome = TodoActions.updateTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle multiple concurrent update requests sequentially', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todo1 = { ...mockTodo, title: 'Updated 1' };
        const todo2 = { ...mockTodo, title: 'Updated 2' };
        const action1 = TodoActions.updateTodo({ todo: todo1 });
        const action2 = TodoActions.updateTodo({ todo: todo2 });
        const outcome1 = TodoActions.updateTodoSuccess({ todo: todo1 });
        const outcome2 = TodoActions.updateTodoSuccess({ todo: todo2 });

        actions$ = hot('-ab', { a: action1, b: action2 });
        todoHttpService.put.and.returnValues(
          cold('--x|', { x: todo1 }),
          cold('--y|', { y: todo2 })
        );

        // Act & Assert - concatMap processes sequentially
        expectObservable(effects.updateTodo$).toBe('---x--y', {
          x: outcome1,
          y: outcome2,
        });
      });
    });

    it('should handle todo completion toggle', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const completedTodo = { ...mockTodo, isDone: true };
        const action = TodoActions.updateTodo({ todo: completedTodo });
        const outcome = TodoActions.updateTodoSuccess({ todo: completedTodo });

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(cold('-b|', { b: completedTodo }));

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle todo with partial updates', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const partialTodo = { ...mockTodo, description: null };
        const action = TodoActions.updateTodo({ todo: partialTodo });
        const outcome = TodoActions.updateTodoSuccess({ todo: partialTodo });

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(cold('-b|', { b: partialTodo }));

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle due date updates', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithNewDueDate = { ...mockTodo, dueDate: '2025-12-31' };
        const action = TodoActions.updateTodo({ todo: todoWithNewDueDate });
        const outcome = TodoActions.updateTodoSuccess({
          todo: todoWithNewDueDate,
        });

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(
          cold('-b|', { b: todoWithNewDueDate })
        );

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle category change', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithNewCategory = { ...mockTodo, categoryId: 2 };
        const action = TodoActions.updateTodo({ todo: todoWithNewCategory });
        const outcome = TodoActions.updateTodoSuccess({
          todo: todoWithNewCategory,
        });

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(
          cold('-b|', { b: todoWithNewCategory })
        );

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('deleteTodo$', () => {
    it('should dispatch deleteTodoSuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.deleteTodo({ id: 1 });
        const outcome = TodoActions.deleteTodoSuccess({ id: 1 });

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(cold('-b|', { b: mockTodo }));

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch deleteTodoFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.deleteTodo({ id: 1 });
        const outcome = TodoActions.deleteTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle multiple concurrent delete requests sequentially', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action1 = TodoActions.deleteTodo({ id: 1 });
        const action2 = TodoActions.deleteTodo({ id: 2 });
        const outcome1 = TodoActions.deleteTodoSuccess({ id: 1 });
        const outcome2 = TodoActions.deleteTodoSuccess({ id: 2 });

        actions$ = hot('-ab', { a: action1, b: action2 });
        todoHttpService.delete.and.returnValues(
          cold('--x|', { x: mockTodos[0] }),
          cold('--y|', { y: mockTodos[1] })
        );

        // Act & Assert - concatMap processes sequentially
        expectObservable(effects.deleteTodo$).toBe('---x--y', {
          x: outcome1,
          y: outcome2,
        });
      });
    });

    it('should handle deletion of non-existent todo', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.deleteTodo({ id: 999 });
        const outcome = TodoActions.deleteTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(
          cold('-#|', {}, new Error('Not Found'))
        );

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle todo with id 0', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithZeroId = { ...mockTodo, id: 0 };
        const action = TodoActions.deleteTodo({ id: 0 });
        const outcome = TodoActions.deleteTodoSuccess({ id: 0 });

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(
          cold('-b|', { b: todoWithZeroId })
        );

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should extract id from returned todo object', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const deletedTodo = { ...mockTodo, id: 42 };
        const action = TodoActions.deleteTodo({ id: 1 }); // Different from returned ID
        const outcome = TodoActions.deleteTodoSuccess({ id: 42 }); // Uses returned ID

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(cold('-b|', { b: deletedTodo }));

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle null id in returned todo', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithNullId = { ...mockTodo, id: null };
        const action = TodoActions.deleteTodo({ id: 1 });
        const outcome = TodoActions.deleteTodoSuccess({ id: null as any });

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(
          cold('-b|', { b: todoWithNullId })
        );

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle delete action with null id', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.deleteTodo({ id: null });
        const outcome = TodoActions.deleteTodoSuccess({ id: 1 });

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(cold('-b|', { b: mockTodo }));

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.get.and.returnValue(
          cold('-#|', {}, new Error('Timeout'))
        );

        // Act & Assert
        expectObservable(effects.fetchTodos$).toBe('--c', { c: outcome });
      });
    });

    it('should handle server 500 errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.addTodo({ todo: mockTodo });
        const outcome = TodoActions.addTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.post.and.returnValue(
          cold('-#|', {}, new Error('Server Error'))
        );

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle validation errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.updateTodo({ todo: mockTodo });
        const outcome = TodoActions.updateTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.put.and.returnValue(
          cold('-#|', {}, new Error('Validation Error'))
        );

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--c', { c: outcome });
      });
    });

    it('should handle unauthorized errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = TodoActions.deleteTodo({ id: 1 });
        const outcome = TodoActions.deleteTodoFailed();

        actions$ = hot('-a', { a: action });
        todoHttpService.delete.and.returnValue(
          cold('-#|', {}, new Error('Unauthorized'))
        );

        // Act & Assert
        expectObservable(effects.deleteTodo$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty action stream', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        actions$ = hot('---|');

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('---|');
        expectObservable(effects.fetchTodos$).toBe('---|');
        expectObservable(effects.getTodo$).toBe('---|');
        expectObservable(effects.updateTodo$).toBe('---|');
        expectObservable(effects.deleteTodo$).toBe('---|');
      });
    });

    it('should handle rapid successive actions', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const actions = [
          TodoActions.addTodo({ todo: mockTodo }),
          TodoActions.fetchTodos(),
          TodoActions.getTodo({ id: 1 }),
        ];

        actions$ = hot('abc', { a: actions[0], b: actions[1], c: actions[2] });
        todoHttpService.post.and.returnValue(cold('-x|', { x: mockTodo }));
        todoHttpService.get.and.returnValue(cold('-y|', { y: mockTodos }));

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('-x--', {
          x: TodoActions.addTodoSuccess({ todo: mockTodo }),
        });
        expectObservable(effects.fetchTodos$).toBe('--y-', {
          y: TodoActions.fetchTodosSuccess({ todos: mockTodos }),
        });
        expectObservable(effects.getTodo$).toBe('--z-', {
          z: TodoActions.getTodoSuccess({ todo: mockTodo }),
        });
      });
    });

    it('should handle store state changes during effect execution', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = TodoActions.getTodo({ id: 1 });
        const outcome = TodoActions.getTodoSuccess({ todo: mockTodo });

        actions$ = hot('-a', { a: action });

        // Simulate store state change
        store.setState({
          todo: {
            ids: [1],
            entities: { 1: mockTodo },
            isLoading: false,
            error: null,
          },
        });

        // Act & Assert
        expectObservable(effects.getTodo$).toBe('-c', { c: outcome });
      });
    });

    it('should handle todos with extreme due dates', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const todoWithExtremeDates = [
          { ...mockTodo, id: 1, dueDate: '1900-01-01' },
          { ...mockTodo, id: 2, dueDate: '2099-12-31' },
          { ...mockTodo, id: 3, dueDate: null },
        ];
        const action = TodoActions.fetchTodos();
        const outcome = TodoActions.fetchTodosSuccess({
          todos: todoWithExtremeDates,
        });

        actions$ = hot('-a', { a: action });
        todoHttpService.get.and.returnValue(
          cold('-b|', { b: todoWithExtremeDates })
        );

        // Act & Assert
        expectObservable(effects.fetchTodos$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete CRUD cycle', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const newTodo = { ...mockTodo, id: null };
        const createdTodo = { ...mockTodo, id: 3 };
        const updatedTodo = { ...createdTodo, title: 'Updated' };

        const addAction = TodoActions.addTodo({ todo: newTodo });
        const updateAction = TodoActions.updateTodo({ todo: updatedTodo });
        const deleteAction = TodoActions.deleteTodo({ id: 3 });

        actions$ = hot('-a-b-c', {
          a: addAction,
          b: updateAction,
          c: deleteAction,
        });

        todoHttpService.post.and.returnValue(cold('-x|', { x: createdTodo }));
        todoHttpService.put.and.returnValue(cold('-y|', { y: updatedTodo }));
        todoHttpService.delete.and.returnValue(cold('-z|', { z: createdTodo }));

        // Act & Assert - Each effect processes its own actions independently
        expectObservable(effects.addTodo$).toBe('--x---', {
          x: TodoActions.addTodoSuccess({ todo: createdTodo }),
        });
        expectObservable(effects.updateTodo$).toBe('----y-', {
          y: TodoActions.updateTodoSuccess({ todo: updatedTodo }),
        });
        expectObservable(effects.deleteTodo$).toBe('------z', {
          z: TodoActions.deleteTodoSuccess({ id: 3 }),
        });
      });
    });

    it('should handle mixed success and error scenarios', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const addAction = TodoActions.addTodo({ todo: mockTodo });
        const fetchAction = TodoActions.fetchTodos();

        actions$ = hot('-ab', { a: addAction, b: fetchAction });

        todoHttpService.post.and.returnValue(cold('-x|', { x: mockTodo }));
        todoHttpService.get.and.returnValue(
          cold('-#|', {}, new Error('Fetch Error'))
        );

        // Act & Assert
        expectObservable(effects.addTodo$).toBe('--x-', {
          x: TodoActions.addTodoSuccess({ todo: mockTodo }),
        });
        expectObservable(effects.fetchTodos$).toBe('---y', {
          y: TodoActions.fetchTodosFailed(),
        });
      });
    });

    it('should handle todo state transitions', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const pendingTodo = { ...mockTodo, isDone: false };
        const completedTodo = { ...mockTodo, isDone: true };
        const updateAction = TodoActions.updateTodo({ todo: completedTodo });

        actions$ = hot('-a', { a: updateAction });
        todoHttpService.put.and.returnValue(cold('-x|', { x: completedTodo }));

        // Act & Assert
        expectObservable(effects.updateTodo$).toBe('--y', {
          y: TodoActions.updateTodoSuccess({ todo: completedTodo }),
        });
      });
    });
  });
});
