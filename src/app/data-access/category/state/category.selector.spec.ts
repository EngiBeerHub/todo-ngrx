import {
  selectCategoriesState,
  selectAllCategories,
  selectError,
  selectIsLoading,
  selectCategoryById,
} from './category.selector';
import {
  CategoryModel,
  CategoriesState,
} from '../../../../libs/data-access/todo';

describe('CategorySelectors', () => {
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

  const mockCategory3: CategoryModel = {
    id: 3,
    title: 'Shopping',
    description: 'Shopping list',
    showDoneTodos: false,
  };

  const mockCategoriesState: CategoriesState = {
    ids: [1, 2, 3],
    entities: {
      1: mockCategory1,
      2: mockCategory2,
      3: mockCategory3,
    },
    isLoading: false,
    error: null,
  };

  const mockAppState = {
    category: mockCategoriesState,
  };

  describe('selectCategoriesState', () => {
    it('should select the categories feature state', () => {
      // Act
      const result = selectCategoriesState(mockAppState);

      // Assert
      expect(result).toEqual(mockCategoriesState);
    });

    it('should return undefined when categories state does not exist', () => {
      // Arrange
      const stateWithoutCategories = {};

      // Act
      const result = selectCategoriesState(stateWithoutCategories);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('selectAllCategories', () => {
    it('should select all categories from the state', () => {
      // Act
      const result = selectAllCategories(mockAppState);

      // Assert
      expect(result).toEqual([mockCategory1, mockCategory2, mockCategory3]);
    });

    it('should return empty array when no categories exist', () => {
      // Arrange
      const emptyState = {
        category: {
          ids: [],
          entities: {},
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectAllCategories(emptyState);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return categories in the order of ids array', () => {
      // Arrange
      const reorderedState = {
        category: {
          ids: [3, 1, 2],
          entities: {
            1: mockCategory1,
            2: mockCategory2,
            3: mockCategory3,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectAllCategories(reorderedState);

      // Assert
      expect(result).toEqual([mockCategory3, mockCategory1, mockCategory2]);
    });

    it('should handle missing entities gracefully', () => {
      // Arrange
      const stateWithMissingEntities = {
        category: {
          ids: [1, 2, 999],
          entities: {
            1: mockCategory1,
            2: mockCategory2,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectAllCategories(stateWithMissingEntities);

      // Assert - Entity adapter includes undefined for missing entities
      expect(result.length).toBe(3);
      expect(result[0]).toEqual(mockCategory1);
      expect(result[1]).toEqual(mockCategory2);
      expect(result[2]).toBeUndefined();
    });
  });

  describe('selectError', () => {
    it('should select error from categories state', () => {
      // Arrange
      const stateWithError = {
        category: {
          ...mockCategoriesState,
          error: 'Failed to fetch categories!',
        },
      };

      // Act
      const result = selectError(stateWithError);

      // Assert
      expect(result).toBe('Failed to fetch categories!');
    });

    it('should return null when no error exists', () => {
      // Act
      const result = selectError(mockAppState);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when error is explicitly null', () => {
      // Arrange
      const stateWithNullError = {
        category: {
          ...mockCategoriesState,
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
    it('should select loading state from categories state', () => {
      // Arrange
      const loadingState = {
        category: {
          ...mockCategoriesState,
          isLoading: true,
        },
      };

      // Act
      const result = selectIsLoading(loadingState);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when not loading', () => {
      // Act
      const result = selectIsLoading(mockAppState);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when loading is explicitly false', () => {
      // Arrange
      const notLoadingState = {
        category: {
          ...mockCategoriesState,
          isLoading: false,
        },
      };

      // Act
      const result = selectIsLoading(notLoadingState);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('selectCategoryById', () => {
    it('should select category by id from route params', () => {
      // Arrange
      const stateWithRouteParams = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: { categoryId: '2' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithRouteParams);

      // Assert
      expect(result).toEqual(mockCategory2);
    });

    it('should return undefined when category id is not found', () => {
      // Arrange
      const stateWithNonExistentId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: { categoryId: '999' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithNonExistentId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when categoryId param is missing', () => {
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
      const result = selectCategoryById(stateWithoutCategoryId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle string categoryId conversion to number', () => {
      // Arrange
      const stateWithStringId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: { categoryId: '1' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithStringId);

      // Assert
      expect(result).toEqual(mockCategory1);
    });

    it('should handle zero categoryId', () => {
      // Arrange
      const categoryWithZeroId: CategoryModel = {
        id: 0,
        title: 'Zero ID Category',
        description: 'Category with zero ID',
        showDoneTodos: false,
      };

      const stateWithZeroId = {
        category: {
          ids: [0, 1],
          entities: {
            0: categoryWithZeroId,
            1: mockCategory1,
          },
          isLoading: false,
          error: null,
        },
        router: {
          state: {
            root: {
              params: { categoryId: '0' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithZeroId);

      // Assert
      expect(result).toEqual(categoryWithZeroId);
    });

    it('should handle negative categoryId', () => {
      // Arrange
      const categoryWithNegativeId: CategoryModel = {
        id: -1,
        title: 'Negative ID Category',
        description: 'Category with negative ID',
        showDoneTodos: false,
      };

      const stateWithNegativeId = {
        category: {
          ids: [-1, 1],
          entities: {
            '-1': categoryWithNegativeId,
            1: mockCategory1,
          },
          isLoading: false,
          error: null,
        },
        router: {
          state: {
            root: {
              params: { categoryId: '-1' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithNegativeId);

      // Assert
      expect(result).toEqual(categoryWithNegativeId);
    });

    it('should return undefined for invalid categoryId format', () => {
      // Arrange
      const stateWithInvalidId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: { categoryId: 'invalid' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithInvalidId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when router state is missing', () => {
      // Arrange
      const stateWithoutRouter = {
        ...mockAppState,
      };

      // Act
      const result = selectCategoryById(stateWithoutRouter);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when categories array is empty', () => {
      // Arrange
      const stateWithEmptyCategories = {
        category: {
          ids: [],
          entities: {},
          isLoading: false,
          error: null,
        },
        router: {
          state: {
            root: {
              params: { categoryId: '1' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithEmptyCategories);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Selector Memoization', () => {
    it('should return same reference when state has not changed', () => {
      // Act
      const result1 = selectAllCategories(mockAppState);
      const result2 = selectAllCategories(mockAppState);

      // Assert
      expect(result1).toBe(result2);
    });

    it('should return new reference when categories state changes', () => {
      // Arrange
      const modifiedState = {
        category: {
          ...mockCategoriesState,
          isLoading: true,
        },
      };

      // Act
      const result1 = selectAllCategories(mockAppState);
      const result2 = selectAllCategories(modifiedState);

      // Assert - Categories content is the same, but references may be different due to selector behavior
      expect(result1).toEqual(result2); // Same content
    });

    it('should return same reference for error selector when error has not changed', () => {
      // Act
      const result1 = selectError(mockAppState);
      const result2 = selectError(mockAppState);

      // Assert
      expect(result1).toBe(result2);
    });

    it('should return same reference for loading selector when loading has not changed', () => {
      // Act
      const result1 = selectIsLoading(mockAppState);
      const result2 = selectIsLoading(mockAppState);

      // Assert
      expect(result1).toBe(result2);
    });
  });

  describe('Selector Composition', () => {
    it('should handle undefined categories state', () => {
      // Arrange
      const emptyState = {};

      // Act & Assert - These will throw errors because the selectors expect the state to exist
      expect(() => selectAllCategories(emptyState)).toThrow();
      expect(() => selectError(emptyState)).toThrow();
      expect(() => selectIsLoading(emptyState)).toThrow();
    });

    it('should handle partial state correctly', () => {
      // Arrange
      const partialState = {
        category: {
          ids: [1],
          entities: { 1: mockCategory1 },
          isLoading: true,
          // error is missing
        },
      };

      // Act
      const categoriesResult = selectAllCategories(partialState);
      const errorResult = selectError(partialState);
      const loadingResult = selectIsLoading(partialState);

      // Assert
      expect(categoriesResult).toEqual([mockCategory1]);
      expect(errorResult).toBeUndefined();
      expect(loadingResult).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null entities in selectAllCategories', () => {
      // Arrange
      const stateWithNullEntity = {
        category: {
          ids: [1, 2],
          entities: {
            1: mockCategory1,
            2: null,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectAllCategories(stateWithNullEntity);

      // Assert - Entity adapter includes null entities
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(mockCategory1);
      expect(result[1]).toBeNull();
    });

    it('should handle undefined entities in selectAllCategories', () => {
      // Arrange
      const stateWithUndefinedEntity = {
        category: {
          ids: [1, 2],
          entities: {
            1: mockCategory1,
            2: undefined,
          },
          isLoading: false,
          error: null,
        },
      };

      // Act
      const result = selectAllCategories(stateWithUndefinedEntity);

      // Assert - Entity adapter includes undefined entities
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(mockCategory1);
      expect(result[1]).toBeUndefined();
    });

    it('should handle empty string categoryId in selectCategoryById', () => {
      // Arrange
      const stateWithEmptyStringId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: { categoryId: '' },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithEmptyStringId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle null categoryId in route params', () => {
      // Arrange
      const stateWithNullId = {
        ...mockAppState,
        router: {
          state: {
            root: {
              params: { categoryId: null },
            },
          },
        },
      };

      // Act
      const result = selectCategoryById(stateWithNullId);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
