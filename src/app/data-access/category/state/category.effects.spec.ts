import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { CategoryEffects } from './category.effects';
import { CategoryActions } from './index';
import {
  CategoryHttpService,
  CategoryModel,
} from '../../../../libs/data-access/todo';

describe('CategoryEffects', () => {
  let effects: CategoryEffects;
  let actions$: Observable<Action>;
  let store: MockStore;
  let categoryHttpService: jasmine.SpyObj<CategoryHttpService>;
  let testScheduler: TestScheduler;

  // Mock data
  const mockCategory: CategoryModel = {
    id: 1,
    title: 'Test Category',
    description: 'Test Description',
    showDoneTodos: true,
  };

  const mockCategories: CategoryModel[] = [
    mockCategory,
    {
      id: 2,
      title: 'Category 2',
      description: 'Description 2',
      showDoneTodos: false,
    },
  ];

  const mockInitialState = {
    category: {
      ids: [1, 2],
      entities: {
        1: mockCategories[0],
        2: mockCategories[1],
      },
      isLoading: false,
      error: null,
    },
  };

  beforeEach(() => {
    const categoryHttpServiceSpy = jasmine.createSpyObj('CategoryHttpService', [
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
        CategoryEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: mockInitialState }),
        { provide: CategoryHttpService, useValue: categoryHttpServiceSpy },
      ],
    });

    effects = TestBed.inject(CategoryEffects);
    store = TestBed.inject(Store) as MockStore;
    categoryHttpService = TestBed.inject(
      CategoryHttpService
    ) as jasmine.SpyObj<CategoryHttpService>;
  });

  describe('addCategory$', () => {
    it('should dispatch addCategorySuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.addCategory({ category: mockCategory });
        const outcome = CategoryActions.addCategorySuccess({
          category: mockCategory,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.post.and.returnValue(
          cold('-b|', { b: mockCategory })
        );

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch addCategoryFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.addCategory({ category: mockCategory });
        const outcome = CategoryActions.addCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.post.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle multiple concurrent add requests sequentially', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const category1 = { ...mockCategory, id: 1 };
        const category2 = { ...mockCategory, id: 2 };
        const action1 = CategoryActions.addCategory({ category: category1 });
        const action2 = CategoryActions.addCategory({ category: category2 });
        const outcome1 = CategoryActions.addCategorySuccess({
          category: category1,
        });
        const outcome2 = CategoryActions.addCategorySuccess({
          category: category2,
        });

        actions$ = hot('-ab', { a: action1, b: action2 });
        categoryHttpService.post.and.returnValues(
          cold('--x|', { x: category1 }),
          cold('--y|', { y: category2 })
        );

        // Act & Assert - concatMap processes sequentially, so second request waits for first to complete
        expectObservable(effects.addCategory$).toBe('---x--y', {
          x: outcome1,
          y: outcome2,
        });
      });
    });

    it('should handle category with null id', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const categoryWithNullId = { ...mockCategory, id: null };
        const action = CategoryActions.addCategory({
          category: categoryWithNullId,
        });
        const outcome = CategoryActions.addCategorySuccess({
          category: categoryWithNullId,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.post.and.returnValue(
          cold('-b|', { b: categoryWithNullId })
        );

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('fetchCategories$', () => {
    it('should dispatch fetchCategoriesSuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.fetchCategories();
        const outcome = CategoryActions.fetchCategoriesSuccess({
          categories: mockCategories,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.get.and.returnValue(
          cold('-b|', { b: mockCategories })
        );

        // Act & Assert
        expectObservable(effects.fetchCategories$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch fetchCategoriesFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.fetchCategories();
        const outcome = CategoryActions.fetchCategoriesFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.get.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.fetchCategories$).toBe('--c', { c: outcome });
      });
    });

    it('should handle empty categories array', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.fetchCategories();
        const outcome = CategoryActions.fetchCategoriesSuccess({
          categories: [],
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.get.and.returnValue(cold('-b|', { b: [] }));

        // Act & Assert
        expectObservable(effects.fetchCategories$).toBe('--c', { c: outcome });
      });
    });

    it('should cancel previous request when new fetch is triggered', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action1 = CategoryActions.fetchCategories();
        const action2 = CategoryActions.fetchCategories();
        const outcome = CategoryActions.fetchCategoriesSuccess({
          categories: mockCategories,
        });

        actions$ = hot('-ab', { a: action1, b: action2 });
        categoryHttpService.get.and.returnValues(
          cold('----x|', { x: mockCategories }),
          cold('--y|', { y: mockCategories })
        );

        // Act & Assert - Only the second request should complete
        expectObservable(effects.fetchCategories$).toBe('----c', {
          c: outcome,
        });
      });
    });
  });

  describe('getCategory$', () => {
    it('should return cached category if available in store', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategory({ id: 1 });
        const outcome = CategoryActions.getCategorySuccess({
          category: mockCategory,
        });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('-c', { c: outcome });
        expect(categoryHttpService.getById).not.toHaveBeenCalled();
      });
    });

    it('should fetch from API if category not in store', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategory({ id: 999 }); // Non-existent ID
        const outcome = CategoryActions.getCategorySuccess({
          category: mockCategory,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.getById.and.returnValue(
          cold('-b|', { b: mockCategory })
        );

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch getCategoryFailed on API error when fetching from server', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategory({ id: 999 });
        const outcome = CategoryActions.getCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.getById.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle category with id 0', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const categoryWithZeroId = { ...mockCategory, id: 0 };
        const action = CategoryActions.getCategory({ id: 0 });
        const outcome = CategoryActions.getCategorySuccess({
          category: categoryWithZeroId,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.getById.and.returnValue(
          cold('-b|', { b: categoryWithZeroId })
        );

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle negative category id', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategory({ id: -1 });
        const outcome = CategoryActions.getCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.getById.and.returnValue(
          cold('-#|', {}, new Error('Invalid ID'))
        );

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should prefer cached category over API call', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategory({ id: 1 });
        const outcome = CategoryActions.getCategorySuccess({
          category: mockCategory,
        });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('-c', { c: outcome });
        expect(categoryHttpService.getById).not.toHaveBeenCalled();
      });
    });
  });

  describe('getCategorySuccess$', () => {
    it('should emit category without dispatching action', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategorySuccess({
          category: mockCategory,
        });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getCategorySuccess$).toBe('-c', {
          c: mockCategory,
        });
      });
    });

    it('should handle null category', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const nullCategory = null as any;
        const action = CategoryActions.getCategorySuccess({
          category: nullCategory,
        });

        actions$ = hot('-a', { a: action });

        // Act & Assert
        expectObservable(effects.getCategorySuccess$).toBe('-c', {
          c: nullCategory,
        });
      });
    });

    it('should handle multiple success actions', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action1 = CategoryActions.getCategorySuccess({
          category: mockCategories[0],
        });
        const action2 = CategoryActions.getCategorySuccess({
          category: mockCategories[1],
        });

        actions$ = hot('-ab', { a: action1, b: action2 });

        // Act & Assert
        expectObservable(effects.getCategorySuccess$).toBe('-xy', {
          x: mockCategories[0],
          y: mockCategories[1],
        });
      });
    });
  });

  describe('updateCategory$', () => {
    it('should dispatch updateCategorySuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const updatedCategory = { ...mockCategory, title: 'Updated Title' };
        const action = CategoryActions.updateCategory({
          category: updatedCategory,
        });
        const outcome = CategoryActions.updateCategorySuccess({
          category: updatedCategory,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.put.and.returnValue(
          cold('-b|', { b: updatedCategory })
        );

        // Act & Assert
        expectObservable(effects.updateCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch updateCategoryFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.updateCategory({
          category: mockCategory,
        });
        const outcome = CategoryActions.updateCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.put.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.updateCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle multiple concurrent update requests sequentially', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const category1 = { ...mockCategory, title: 'Updated 1' };
        const category2 = { ...mockCategory, title: 'Updated 2' };
        const action1 = CategoryActions.updateCategory({ category: category1 });
        const action2 = CategoryActions.updateCategory({ category: category2 });
        const outcome1 = CategoryActions.updateCategorySuccess({
          category: category1,
        });
        const outcome2 = CategoryActions.updateCategorySuccess({
          category: category2,
        });

        actions$ = hot('-ab', { a: action1, b: action2 });
        categoryHttpService.put.and.returnValues(
          cold('--x|', { x: category1 }),
          cold('--y|', { y: category2 })
        );

        // Act & Assert - concatMap processes sequentially
        expectObservable(effects.updateCategory$).toBe('---x--y', {
          x: outcome1,
          y: outcome2,
        });
      });
    });

    it('should handle category with partial updates', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const partialCategory = { ...mockCategory, description: null };
        const action = CategoryActions.updateCategory({
          category: partialCategory,
        });
        const outcome = CategoryActions.updateCategorySuccess({
          category: partialCategory,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.put.and.returnValue(
          cold('-b|', { b: partialCategory })
        );

        // Act & Assert
        expectObservable(effects.updateCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle showDoneTodos toggle', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const toggledCategory = {
          ...mockCategory,
          showDoneTodos: !mockCategory.showDoneTodos,
        };
        const action = CategoryActions.updateCategory({
          category: toggledCategory,
        });
        const outcome = CategoryActions.updateCategorySuccess({
          category: toggledCategory,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.put.and.returnValue(
          cold('-b|', { b: toggledCategory })
        );

        // Act & Assert
        expectObservable(effects.updateCategory$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('deleteCategory$', () => {
    it('should dispatch deleteCategorySuccess on successful API call', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.deleteCategory({ id: 1 });
        const outcome = CategoryActions.deleteCategorySuccess({ id: 1 });

        actions$ = hot('-a', { a: action });
        categoryHttpService.delete.and.returnValue(
          cold('-b|', { b: mockCategory })
        );

        // Act & Assert
        expectObservable(effects.deleteCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should dispatch deleteCategoryFailed on API error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.deleteCategory({ id: 1 });
        const outcome = CategoryActions.deleteCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.delete.and.returnValue(
          cold('-#|', {}, new Error('API Error'))
        );

        // Act & Assert
        expectObservable(effects.deleteCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle multiple concurrent delete requests sequentially', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action1 = CategoryActions.deleteCategory({ id: 1 });
        const action2 = CategoryActions.deleteCategory({ id: 2 });
        const outcome1 = CategoryActions.deleteCategorySuccess({ id: 1 });
        const outcome2 = CategoryActions.deleteCategorySuccess({ id: 2 });

        actions$ = hot('-ab', { a: action1, b: action2 });
        categoryHttpService.delete.and.returnValues(
          cold('--x|', { x: mockCategories[0] }),
          cold('--y|', { y: mockCategories[1] })
        );

        // Act & Assert - concatMap processes sequentially
        expectObservable(effects.deleteCategory$).toBe('---x--y', {
          x: outcome1,
          y: outcome2,
        });
      });
    });

    it('should handle deletion of non-existent category', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.deleteCategory({ id: 999 });
        const outcome = CategoryActions.deleteCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.delete.and.returnValue(
          cold('-#|', {}, new Error('Not Found'))
        );

        // Act & Assert
        expectObservable(effects.deleteCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle category with id 0', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const categoryWithZeroId = { ...mockCategory, id: 0 };
        const action = CategoryActions.deleteCategory({ id: 0 });
        const outcome = CategoryActions.deleteCategorySuccess({ id: 0 });

        actions$ = hot('-a', { a: action });
        categoryHttpService.delete.and.returnValue(
          cold('-b|', { b: categoryWithZeroId })
        );

        // Act & Assert
        expectObservable(effects.deleteCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should extract id from returned category object', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const deletedCategory = { ...mockCategory, id: 42 };
        const action = CategoryActions.deleteCategory({ id: 1 }); // Different from returned ID
        const outcome = CategoryActions.deleteCategorySuccess({ id: 42 }); // Uses returned ID

        actions$ = hot('-a', { a: action });
        categoryHttpService.delete.and.returnValue(
          cold('-b|', { b: deletedCategory })
        );

        // Act & Assert
        expectObservable(effects.deleteCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle null id in returned category', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const categoryWithNullId = { ...mockCategory, id: null };
        const action = CategoryActions.deleteCategory({ id: 1 });
        const outcome = CategoryActions.deleteCategorySuccess({
          id: null as any,
        });

        actions$ = hot('-a', { a: action });
        categoryHttpService.delete.and.returnValue(
          cold('-b|', { b: categoryWithNullId })
        );

        // Act & Assert
        expectObservable(effects.deleteCategory$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.fetchCategories();
        const outcome = CategoryActions.fetchCategoriesFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.get.and.returnValue(
          cold('-#|', {}, new Error('Timeout'))
        );

        // Act & Assert
        expectObservable(effects.fetchCategories$).toBe('--c', { c: outcome });
      });
    });

    it('should handle server 500 errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.addCategory({ category: mockCategory });
        const outcome = CategoryActions.addCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.post.and.returnValue(
          cold('-#|', {}, new Error('Server Error'))
        );

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('--c', { c: outcome });
      });
    });

    it('should handle validation errors', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const action = CategoryActions.updateCategory({
          category: mockCategory,
        });
        const outcome = CategoryActions.updateCategoryFailed();

        actions$ = hot('-a', { a: action });
        categoryHttpService.put.and.returnValue(
          cold('-#|', {}, new Error('Validation Error'))
        );

        // Act & Assert
        expectObservable(effects.updateCategory$).toBe('--c', { c: outcome });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty action stream', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        actions$ = hot('---|');

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('---|');
        expectObservable(effects.fetchCategories$).toBe('---|');
        expectObservable(effects.getCategory$).toBe('---|');
        expectObservable(effects.updateCategory$).toBe('---|');
        expectObservable(effects.deleteCategory$).toBe('---|');
      });
    });

    it('should handle rapid successive actions', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const actions = [
          CategoryActions.addCategory({ category: mockCategory }),
          CategoryActions.fetchCategories(),
          CategoryActions.getCategory({ id: 1 }),
        ];

        actions$ = hot('abc', { a: actions[0], b: actions[1], c: actions[2] });
        categoryHttpService.post.and.returnValue(
          cold('-x|', { x: mockCategory })
        );
        categoryHttpService.get.and.returnValue(
          cold('-y|', { y: mockCategories })
        );

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('-x--', {
          x: CategoryActions.addCategorySuccess({ category: mockCategory }),
        });
        expectObservable(effects.fetchCategories$).toBe('--y-', {
          y: CategoryActions.fetchCategoriesSuccess({
            categories: mockCategories,
          }),
        });
        expectObservable(effects.getCategory$).toBe('--z-', {
          z: CategoryActions.getCategorySuccess({ category: mockCategory }),
        });
      });
    });

    it('should handle store state changes during effect execution', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        // Arrange
        const action = CategoryActions.getCategory({ id: 1 });
        const outcome = CategoryActions.getCategorySuccess({
          category: mockCategory,
        });

        actions$ = hot('-a', { a: action });

        // Simulate store state change
        store.setState({
          category: {
            ids: [1],
            entities: { 1: mockCategory },
            isLoading: false,
            error: null,
          },
        });

        // Act & Assert
        expectObservable(effects.getCategory$).toBe('-c', { c: outcome });
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete CRUD cycle', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const newCategory = { ...mockCategory, id: null };
        const createdCategory = { ...mockCategory, id: 3 };
        const updatedCategory = { ...createdCategory, title: 'Updated' };

        const addAction = CategoryActions.addCategory({
          category: newCategory,
        });
        const updateAction = CategoryActions.updateCategory({
          category: updatedCategory,
        });
        const deleteAction = CategoryActions.deleteCategory({ id: 3 });

        actions$ = hot('-a-b-c', {
          a: addAction,
          b: updateAction,
          c: deleteAction,
        });

        categoryHttpService.post.and.returnValue(
          cold('-x|', { x: createdCategory })
        );
        categoryHttpService.put.and.returnValue(
          cold('-y|', { y: updatedCategory })
        );
        categoryHttpService.delete.and.returnValue(
          cold('-z|', { z: createdCategory })
        );

        // Act & Assert - Each effect processes its own actions independently
        expectObservable(effects.addCategory$).toBe('--x---', {
          x: CategoryActions.addCategorySuccess({ category: createdCategory }),
        });
        expectObservable(effects.updateCategory$).toBe('----y-', {
          y: CategoryActions.updateCategorySuccess({
            category: updatedCategory,
          }),
        });
        expectObservable(effects.deleteCategory$).toBe('------z', {
          z: CategoryActions.deleteCategorySuccess({ id: 3 }),
        });
      });
    });

    it('should handle mixed success and error scenarios', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        // Arrange
        const addAction = CategoryActions.addCategory({
          category: mockCategory,
        });
        const fetchAction = CategoryActions.fetchCategories();

        actions$ = hot('-ab', { a: addAction, b: fetchAction });

        categoryHttpService.post.and.returnValue(
          cold('-x|', { x: mockCategory })
        );
        categoryHttpService.get.and.returnValue(
          cold('-#|', {}, new Error('Fetch Error'))
        );

        // Act & Assert
        expectObservable(effects.addCategory$).toBe('--x-', {
          x: CategoryActions.addCategorySuccess({ category: mockCategory }),
        });
        expectObservable(effects.fetchCategories$).toBe('---y', {
          y: CategoryActions.fetchCategoriesFailed(),
        });
      });
    });
  });
});
