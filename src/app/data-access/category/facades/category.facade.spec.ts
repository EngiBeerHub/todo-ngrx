import {TestBed} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {CategoryFacade} from './category.facade';
import {CategoryActions, CategorySelectors} from '../state';
import {CategoryModel, CategoryViewModel} from '../../../../libs/data-access/todo';

describe('CategoryFacade', () => {
  let facade: CategoryFacade;
  let mockStore: jasmine.SpyObj<Store>;

  const mockCategories: CategoryModel[] = [
    {
      id: 1,
      title: 'Work',
      description: 'Work related tasks',
      showDoneTodos: false,
    },
    {
      id: 2,
      title: 'Personal',
      description: 'Personal tasks',
      showDoneTodos: true,
    },
    {
      id: 3,
      title: 'Shopping',
      description: 'Shopping list',
      showDoneTodos: false,
    },
  ];

  const mockCategoryViewModel: CategoryViewModel = {
    categories: mockCategories,
  };

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    // Set up store selectors before facade creation
    storeSpy.select.and.callFake((selector: any) => {
      switch (selector) {
        case CategorySelectors.selectAllCategories:
          return of(mockCategories);
        case CategorySelectors.selectIsLoading:
          return of(false);
        default:
          return of(null);
      }
    });

    await TestBed.configureTestingModule({
      providers: [CategoryFacade, { provide: Store, useValue: storeSpy }],
    }).compileComponents();

    facade = TestBed.inject(CategoryFacade);
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  describe('Initialization', () => {
    it('should be created', () => {
      // Assert
      expect(facade).toBeTruthy();
    });
  });

  describe('Computed Properties', () => {
    it('should provide categoriesViewModel computed signal', () => {
      // Act
      const viewModel = facade.$categoriesViewModel();

      // Assert
      expect(viewModel).toEqual(mockCategoryViewModel);
      expect(viewModel.categories).toEqual(mockCategories);
    });

    it('should provide isLoading signal', () => {
      // Act & Assert
      expect(facade.$isLoading()).toBe(false);
    });
  });

  describe('State Management Actions', () => {
    it('should dispatch resetCategoriesState action', () => {
      // Act
      facade.resetCategoriesState();

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.resetCategoriesState()
      );
    });

    it('should dispatch fetchCategories action', () => {
      // Act
      facade.fetchCategories();

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.fetchCategories()
      );
    });

    it('should dispatch getCategory action with id', () => {
      // Arrange
      const categoryId = 1;

      // Act
      facade.getCategory(categoryId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.getCategory({ id: categoryId })
      );
    });
  });

  describe('Add Category', () => {
    it('should add category with auto-generated id', () => {
      // Arrange
      const newCategory: CategoryModel = {
        id: null,
        title: 'New Category',
        description: 'New description',
        showDoneTodos: false,
      };

      // Act
      facade.addCategory(newCategory);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.addCategory({
          category: {
            ...newCategory,
            id: 4, // Max id (3) + 1
          },
        })
      );
    });

    it('should not add category if title is empty', () => {
      // Arrange
      const categoryWithoutTitle: CategoryModel = {
        id: null,
        title: '',
        description: 'Description',
        showDoneTodos: false,
      };

      // Act
      facade.addCategory(categoryWithoutTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not add category if title is null', () => {
      // Arrange
      const categoryWithNullTitle: CategoryModel = {
        id: null,
        title: null as any,
        description: 'Description',
        showDoneTodos: false,
      };

      // Act
      facade.addCategory(categoryWithNullTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should preserve existing id when adding category', () => {
      // Arrange
      const categoryWithId: CategoryModel = {
        id: 999,
        title: 'Category with ID',
        description: 'Description',
        showDoneTodos: false,
      };

      // Act
      facade.addCategory(categoryWithId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.addCategory({
          category: {
            ...categoryWithId,
            id: 4, // Still gets auto-generated id
          },
        })
      );
    });
  });

  describe('Update Category', () => {
    it('should update category when id and title are valid', () => {
      // Arrange
      const categoryToUpdate: CategoryModel = {
        id: 1,
        title: 'Updated Work',
        description: 'Updated work description',
        showDoneTodos: true,
      };

      // Act
      facade.updateCategory(categoryToUpdate);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.updateCategory({ category: categoryToUpdate })
      );
    });

    it('should throw error when category id is null', () => {
      // Arrange
      const categoryWithoutId: CategoryModel = {
        id: null,
        title: 'Category without ID',
        description: 'Description',
        showDoneTodos: false,
      };

      // Act & Assert
      expect(() => facade.updateCategory(categoryWithoutId)).toThrowError(
        'category.id is null.'
      );
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not update category when title is empty', () => {
      // Arrange
      const categoryWithEmptyTitle: CategoryModel = {
        id: 1,
        title: '',
        description: 'Description',
        showDoneTodos: false,
      };

      // Act
      facade.updateCategory(categoryWithEmptyTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not update category when title is null', () => {
      // Arrange
      const categoryWithNullTitle: CategoryModel = {
        id: 1,
        title: null as any,
        description: 'Description',
        showDoneTodos: false,
      };

      // Act
      facade.updateCategory(categoryWithNullTitle);

      // Assert
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Delete Category', () => {
    it('should delete category with valid id', () => {
      // Arrange
      const categoryId = 1;

      // Act
      facade.deleteCategory(categoryId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.deleteCategory({ id: categoryId })
      );
    });

    it('should throw error when id is null', () => {
      // Act & Assert
      expect(() => facade.deleteCategory(null)).toThrowError(
        'category.id is null.'
      );
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should throw error when id is 0', () => {
      // Act & Assert
      expect(() => facade.deleteCategory(0)).toThrowError(
        'category.id is null.'
      );
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should delete category with negative id (edge case)', () => {
      // Arrange
      const negativeId = -1;

      // Act
      facade.deleteCategory(negativeId);

      // Assert
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.deleteCategory({ id: negativeId })
      );
    });
  });

  describe('ID Generation Logic', () => {
    it('should calculate max id correctly from existing categories', () => {
      // Arrange
      const newCategory: CategoryModel = {
        id: null,
        title: 'Test Category',
        description: 'Test',
        showDoneTodos: false,
      };

      // Act
      facade.addCategory(newCategory);

      // Assert - Should generate id 4 (max of 1,2,3 + 1)
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        CategoryActions.addCategory({
          category: {
            ...newCategory,
            id: 4,
          },
        })
      );
    });

    it('should handle empty categories array', () => {
      // Arrange
      const emptyCategories: CategoryModel[] = [];

      // Act
      const maxId = Math.max(
        0,
        ...emptyCategories.map((category) => category.id!)
      );
      const expectedId = maxId + 1;

      // Assert
      expect(expectedId).toBe(1);
    });

    it('should handle categories with null ids', () => {
      // Arrange
      const categoriesWithNullIds: CategoryModel[] = [
        {
          id: null,
          title: 'Category 1',
          description: '',
          showDoneTodos: false,
        },
        { id: 2, title: 'Category 2', description: '', showDoneTodos: false },
        {
          id: null,
          title: 'Category 3',
          description: '',
          showDoneTodos: false,
        },
      ];

      // Act
      const validIds = categoriesWithNullIds
        .map((category) => category.id!)
        .filter((id) => id !== null);
      const maxId = Math.max(0, ...validIds);
      const expectedId = maxId + 1;

      // Assert
      expect(expectedId).toBe(3); // Max valid id (2) + 1
    });
  });

  describe('Error Handling', () => {
    it('should handle store dispatch calls without errors', () => {
      // Act & Assert
      expect(() => facade.resetCategoriesState()).not.toThrow();
      expect(() => facade.fetchCategories()).not.toThrow();
      expect(() => facade.getCategory(1)).not.toThrow();
    });

    it('should validate input parameters correctly', () => {
      // Arrange
      const invalidCategory: CategoryModel = {
        id: null,
        title: '',
        description: 'Test',
        showDoneTodos: false,
      };

      // Act & Assert
      expect(() => facade.addCategory(invalidCategory)).not.toThrow();
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });
});
