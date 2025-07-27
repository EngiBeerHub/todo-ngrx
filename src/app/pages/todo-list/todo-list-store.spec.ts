import {TestBed} from '@angular/core/testing';
import {Location} from '@angular/common';
import {AlertController} from '@ionic/angular/standalone';
import {signal, WritableSignal} from '@angular/core';
import {TodoListStore} from './todo-list-store';
import {TodoFacade} from '../../data-access/todo/facades/todo.facade';
import {CategoryFacade} from '../../data-access/category/facades/category.facade';
import {CategoryModel, TodoModel, TodosViewModel} from '../../../libs/data-access/todo';
import {patchState} from "@ngrx/signals";
import {unprotected} from "@ngrx/signals/testing";

describe('TodoListStore', () => {
  let store: InstanceType<typeof TodoListStore>;
  let mockTodoFacade: jasmine.SpyObj<TodoFacade>;
  let mockCategoryFacade: jasmine.SpyObj<CategoryFacade>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockAlert: jasmine.SpyObj<HTMLIonAlertElement>;
  let isLoadingSignal: WritableSignal<boolean>;
  let todosViewModelSignal: WritableSignal<TodosViewModel>;

  const mockCategory: CategoryModel = {
    id: 1,
    title: 'Test Category',
    description: 'Test Description',
    showDoneTodos: false
  };

  const mockTodo: TodoModel = {
    id: 1,
    categoryId: 1,
    title: 'Test Todo',
    description: 'Test Description',
    dueDate: null,
    isDone: false
  };

  const mockTodosViewModel: TodosViewModel = {
    category: mockCategory,
    showDoneTodos: false,
    todos: [mockTodo]
  };

  beforeEach(async () => {
    // Create writable signals for mocking
    isLoadingSignal = signal(false);
    todosViewModelSignal = signal(mockTodosViewModel);

    // Create spies for dependencies
    mockTodoFacade = jasmine.createSpyObj('TodoFacade', [
      'fetchTodos',
      'addTodo',
      'updateTodo',
      'deleteTodo'
    ]);

    // Mock the signal properties
    Object.defineProperty(mockTodoFacade, '$isLoading', {
      get: () => isLoadingSignal
    });
    Object.defineProperty(mockTodoFacade, '$todosViewModel', {
      get: () => todosViewModelSignal
    });

    mockCategoryFacade = jasmine.createSpyObj('CategoryFacade', [
      'updateCategory',
      'deleteCategory'
    ]);

    mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockAlertController.create.and.returnValue(Promise.resolve(mockAlert));

    mockLocation = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      providers: [
        TodoListStore,
        {provide: TodoFacade, useValue: mockTodoFacade},
        {provide: CategoryFacade, useValue: mockCategoryFacade},
        {provide: AlertController, useValue: mockAlertController},
        {provide: Location, useValue: mockLocation}
      ]
    }).compileComponents();

    store = TestBed.inject(TodoListStore);

    // Wait for effects to run
    TestBed.flushEffects();
  });

  describe('Initial State', () => {
    it('should initialize with correct state from facade', () => {
      expect(store.todosViewModel()).toEqual(mockTodosViewModel);
      expect(store.isDrafting()).toBe(false);
      expect(store.isUpdating()).toBe(false);
      expect(store.isOpenMenu()).toBe(false);
    });

    it('should have correct computed properties', () => {
      expect(store.$showLoading()).toBe(false);
    });
  });

  describe('State Updates', () => {
    it('should toggle isOpenMenu state', () => {
      store.onIsOpenMenuToggled(true);
      expect(store.isOpenMenu()).toBe(true);

      store.onIsOpenMenuToggled(false);
      expect(store.isOpenMenu()).toBe(false);
    });

    it('should toggle isDrafting state', () => {
      store.onIsDraftingToggled(true);
      expect(store.isDrafting()).toBe(true);

      store.onIsDraftingToggled(false);
      expect(store.isDrafting()).toBe(false);
    });

    it('should toggle isUpdating state', () => {
      store.onIsUpdatingToggled(true);
      expect(store.isUpdating()).toBe(true);

      store.onIsUpdatingToggled(false);
      expect(store.isUpdating()).toBe(false);
    });
  });

  describe('Todo Operations', () => {
    it('should add todo and reset drafting state', () => {
      // Arrange
      patchState(unprotected(store), {isDrafting: true});
      // Act
      store.onTodoAdded(mockTodo);
      // Assert
      expect(mockTodoFacade.addTodo).toHaveBeenCalledOnceWith(mockTodo);
      expect(store.isDrafting()).toBe(false);
    });

    it('should update todo', () => {
      // Arrange
      const updatedTodo = {...mockTodo, title: 'Updated Todo'};
      // Act
      store.onTodoUpdated(updatedTodo);
      // Assert
      expect(mockTodoFacade.updateTodo).toHaveBeenCalledWith(updatedTodo);
    });

    it('should delete todo', () => {
      // Act
      store.onTodoDeleted(mockTodo);
      // Assert
      expect(mockTodoFacade.deleteTodo).toHaveBeenCalledWith(mockTodo.id);
    });
  });

  describe('Category Operations', () => {
    it('should toggle showDoneTodos and update category', () => {
      // Act
      store.onShowDoneTodosToggled(true);
      // Assert
      expect(mockCategoryFacade.updateCategory).toHaveBeenCalledWith({
        ...mockCategory,
        showDoneTodos: true
      });
    });

    it('should handle delete category with confirmation', async () => {
      // Arrange
      patchState(unprotected(store), {isOpenMenu: true});
      // Act
      await store.onDeleteCategoryClicked();
      // Assert
      expect(store.isOpenMenu()).toBe(false);
      expect(mockAlertController.create).toHaveBeenCalledOnceWith({
        header: `"${mockCategory.title}"のリストを削除しますか？`,
        message:
          'この操作によりこのリストにあるリマインダーがすべて削除されます。',
        buttons: [
          {text: 'キャンセル', role: 'cancel'},
          {
            text: '削除',
            role: 'destructive',
            handler: jasmine.any(Function)
          }
        ]
      });
      expect(mockAlert.present).toHaveBeenCalled();
    });

    it('should execute delete when confirmed', async () => {
      // Arrange
      let deleteHandler: Function;
      mockAlertController.create.and.callFake((options: any) => {
        deleteHandler = options.buttons[1].handler;
        return Promise.resolve(mockAlert);
      });
      await store.onDeleteCategoryClicked();
      // Act
      deleteHandler!();
      // Assert
      expect(mockLocation.back).toHaveBeenCalled();
      expect(mockCategoryFacade.deleteCategory).toHaveBeenCalledWith(
        mockCategory.id
      );
    });
  });

  describe('Refresh Operations', () => {
    it('should handle refresh event', () => {
      // Arrange
      const mockRefreshEvent = {
        target: {complete: jasmine.createSpy('complete')}
      } as any;
      // Act
      store.onRefreshed(mockRefreshEvent);
      TestBed.flushEffects();
      // Assert
      expect(mockTodoFacade.fetchTodos).toHaveBeenCalled();
      expect(mockRefreshEvent.target.complete).toHaveBeenCalled();
    });
  });

  describe('Complete Actions', () => {
    it('should reset drafting and updating states on complete', () => {
      // Arrange
      patchState(unprotected(store), {isDrafting: true, isUpdating: true});
      // Act
      store.onCompleteClicked();
      // Assert
      expect(store.isDrafting()).toBe(false);
      expect(store.isUpdating()).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should show loading when facade is loading and no refresh event', () => {
      // Arrange
      isLoadingSignal.set(true);
      // Act
      TestBed.flushEffects();
      // Assert
      expect(store.$showLoading()).toBe(true);
    });

    it('should not show loading when refresh event is active', () => {
      // Arrange
      isLoadingSignal.set(true);
      const mockRefreshEvent = {
        target: {complete: jasmine.createSpy('complete')}
      } as any;
      // Act
      store.onRefreshed(mockRefreshEvent);
      TestBed.flushEffects();
      // Assert
      expect(store.$showLoading()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null category in delete operation', async () => {
      // Set up store with null category
      todosViewModelSignal.set({
        category: null,
        showDoneTodos: false,
        todos: []
      });
      TestBed.flushEffects();

      await store.onDeleteCategoryClicked();

      expect(mockAlertController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: '"undefined"のリストを削除しますか？'
        })
      );
    });

    it('should handle showDoneTodos toggle with null category', () => {
      todosViewModelSignal.set({
        category: null,
        showDoneTodos: false,
        todos: []
      });
      TestBed.flushEffects();

      // This will call updateCategory with spread of null, which creates an object with showDoneTodos
      store.onShowDoneTodosToggled(true);

      // The spread of null results in just the showDoneTodos property
      expect(mockCategoryFacade.updateCategory).toHaveBeenCalledWith(
        jasmine.objectContaining({
          showDoneTodos: true
        })
      );
    });
  });
});
