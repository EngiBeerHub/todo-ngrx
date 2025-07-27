import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { CategoryListStore } from './category-list-store';
import { CategoryFacade } from '../../data-access/category/facades/category.facade';
import {
  CategoryModel,
  CategoryViewModel,
} from '../../../libs/data-access/todo';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';

describe('CategoryListStore', () => {
  let store: InstanceType<typeof CategoryListStore>;
  let mockCategoryFacade: jasmine.SpyObj<CategoryFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
  let isLoadingSignal: WritableSignal<boolean>;
  let categoriesViewModelSignal: WritableSignal<CategoryViewModel>;

  const mockCategory1: CategoryModel = {
    id: 1,
    title: 'Work',
    description: 'Work related tasks',
    showDoneTodos: false,
  };

  const mockCategory2: CategoryModel = {
    id: 2,
    title: 'Personal',
    description: 'Personal tasks',
    showDoneTodos: true,
  };

  const mockCategoriesViewModel: CategoryViewModel = {
    categories: [mockCategory1, mockCategory2],
  };

  beforeEach(async () => {
    // Create writable signals for mocking
    isLoadingSignal = signal(false);
    categoriesViewModelSignal = signal(mockCategoriesViewModel);

    // Create spies for dependencies
    mockCategoryFacade = jasmine.createSpyObj('CategoryFacade', [
      'fetchCategories',
      'addCategory',
      'deleteCategory',
    ]);

    // Mock the signal properties
    Object.defineProperty(mockCategoryFacade, '$isLoading', {
      get: () => isLoadingSignal,
    });
    Object.defineProperty(mockCategoryFacade, '$categoriesViewModel', {
      get: () => categoriesViewModelSignal,
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      providers: [
        CategoryListStore,
        { provide: CategoryFacade, useValue: mockCategoryFacade },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    store = TestBed.inject(CategoryListStore);

    // Wait for effects to run
    TestBed.flushEffects();
  });

  describe('Initial State', () => {
    it('should initialize with correct state from facade', () => {
      expect(store.categoriesViewModel()).toEqual(mockCategoriesViewModel);
      expect(store.isDrafting()).toBe(false);
    });

    it('should have correct computed properties', () => {
      expect(store.$showLoading()).toBe(false);
    });
  });

  describe('State Updates', () => {
    it('should toggle isDrafting state', () => {
      store.onIsDraftingToggled(true);
      expect(store.isDrafting()).toBe(true);

      store.onIsDraftingToggled(false);
      expect(store.isDrafting()).toBe(false);
    });
  });

  describe('Category Operations', () => {
    it('should add category and reset drafting state', () => {
      // Arrange
      const newCategory: CategoryModel = {
        id: null,
        title: 'New Category',
        description: 'New category description',
        showDoneTodos: false,
      };
      patchState(unprotected(store), { isDrafting: true });

      // Act
      store.onCategoryAdded(newCategory);

      // Assert
      expect(mockCategoryFacade.addCategory).toHaveBeenCalledOnceWith(
        newCategory
      );
      expect(store.isDrafting()).toBe(false);
    });

    it('should delete category', () => {
      // Act
      store.onCategoryDeleted(mockCategory1);

      // Assert
      expect(mockCategoryFacade.deleteCategory).toHaveBeenCalledWith(
        mockCategory1.id
      );
    });

    it('should navigate to category todos when category is selected', async () => {
      // Act
      await store.onCategorySelected(mockCategory1.id!);

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/category',
        mockCategory1.id,
        'todos',
      ]);
    });
  });

  describe('Refresh Operations', () => {
    it('should handle refresh event', () => {
      // Arrange
      const mockRefreshEvent = {
        target: { complete: jasmine.createSpy('complete') },
      } as any;

      // Act
      store.onRefreshed(mockRefreshEvent);
      TestBed.flushEffects();

      // Assert
      expect(mockCategoryFacade.fetchCategories).toHaveBeenCalled();
      expect(mockRefreshEvent.target.complete).toHaveBeenCalled();
    });

    it('should set refresh event signal when refreshing', () => {
      // Arrange
      const mockRefreshEvent = {
        target: { complete: jasmine.createSpy('complete') },
      } as any;

      // Act
      store.onRefreshed(mockRefreshEvent);

      // Assert - _refresherEvent is internal, we can verify through $showLoading behavior
      expect(store.$showLoading()).toBe(false); // Should be false when refresh event is active
    });
  });

  describe('Complete Actions', () => {
    it('should reset drafting state on complete', () => {
      // Arrange
      patchState(unprotected(store), { isDrafting: true });

      // Act
      store.onCompleteClicked();

      // Assert
      expect(store.isDrafting()).toBe(false);
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
        target: { complete: jasmine.createSpy('complete') },
      } as any;

      // Act
      store.onRefreshed(mockRefreshEvent);
      TestBed.flushEffects();

      // Assert
      expect(store.$showLoading()).toBe(false);
    });

    it('should complete refresh event when loading finishes', () => {
      // Arrange
      const mockRefreshEvent = {
        target: { complete: jasmine.createSpy('complete') },
      } as any;
      isLoadingSignal.set(true);
      store.onRefreshed(mockRefreshEvent);
      TestBed.flushEffects();

      // Act - simulate loading completion
      isLoadingSignal.set(false);
      TestBed.flushEffects();

      // Assert
      expect(mockRefreshEvent.target.complete).toHaveBeenCalled();
      // Verify refresh event was cleared after completion
      expect(store.$showLoading()).toBe(false);
    });
  });

  describe('State Synchronization', () => {
    it('should update categoriesViewModel when facade state changes', () => {
      // Arrange
      const newCategoriesViewModel: CategoryViewModel = {
        categories: [
          {
            id: 3,
            title: 'Shopping',
            description: 'Shopping list',
            showDoneTodos: false,
          },
        ],
      };

      // Act
      categoriesViewModelSignal.set(newCategoriesViewModel);
      TestBed.flushEffects();

      // Assert
      expect(store.categoriesViewModel()).toEqual(newCategoriesViewModel);
    });

    it('should handle empty categories list', () => {
      // Arrange
      const emptyCategoriesViewModel: CategoryViewModel = {
        categories: [],
      };

      // Act
      categoriesViewModelSignal.set(emptyCategoriesViewModel);
      TestBed.flushEffects();

      // Assert
      expect(store.categoriesViewModel()).toEqual(emptyCategoriesViewModel);
      expect(store.categoriesViewModel().categories.length).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should handle navigation to category with zero id', async () => {
      // Act
      await store.onCategorySelected(0);

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/category',
        0,
        'todos',
      ]);
    });

    it('should handle navigation failure gracefully', async () => {
      // Arrange
      mockRouter.navigate.and.returnValue(Promise.resolve(false));

      // Act & Assert - should not throw
      await store.onCategorySelected(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/category',
        1,
        'todos',
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle category deletion with null id', () => {
      // Arrange
      const categoryWithNullId: CategoryModel = {
        id: null,
        title: 'Test Category',
        description: 'Test Description',
        showDoneTodos: false,
      };

      // Act
      store.onCategoryDeleted(categoryWithNullId);

      // Assert
      expect(mockCategoryFacade.deleteCategory).toHaveBeenCalledWith(null);
    });

    it('should handle adding category with existing id', () => {
      // Arrange
      const existingCategory: CategoryModel = {
        id: 999,
        title: 'Existing Category',
        description: 'Already has an ID',
        showDoneTodos: true,
      };

      // Act
      store.onCategoryAdded(existingCategory);

      // Assert
      expect(mockCategoryFacade.addCategory).toHaveBeenCalledWith(
        existingCategory
      );
      expect(store.isDrafting()).toBe(false);
    });
  });

  describe('Refresh Event Management', () => {
    it('should clear refresh event after completion', () => {
      // Arrange
      const mockRefreshEvent = {
        target: { complete: jasmine.createSpy('complete') },
      } as any;

      // Act
      store.onRefreshed(mockRefreshEvent);
      // Verify refresh event is active by checking loading state behavior
      expect(store.$showLoading()).toBe(false);

      // Simulate loading completion
      isLoadingSignal.set(false);
      TestBed.flushEffects();

      // Assert - verify refresh completed by checking loading state
      expect(store.$showLoading()).toBe(false);
    });

    it('should not complete refresh if still loading', () => {
      // Arrange
      const mockRefreshEvent = {
        target: { complete: jasmine.createSpy('complete') },
      } as any;
      isLoadingSignal.set(true);

      // Act
      store.onRefreshed(mockRefreshEvent);
      TestBed.flushEffects();

      // Assert
      expect(mockRefreshEvent.target.complete).not.toHaveBeenCalled();
      // Verify loading state shows correctly when refresh is active
      expect(store.$showLoading()).toBe(false);
    });
  });
});
