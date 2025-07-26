import { createFeatureSelector, createSelector } from '@ngrx/store';
import { categoryFeatureKey } from './feature-key';
import { categoryEntityAdapter } from './category.entity';
import { selectRouteParams } from '../../router.selectors';
import {CategoriesState} from "../../../../libs/data-access/todo";

export const selectCategoriesState =
  createFeatureSelector<CategoriesState>(categoryFeatureKey);

const { selectAll } = categoryEntityAdapter.getSelectors();

export const selectAllCategories = createSelector(
  selectCategoriesState,
  selectAll
);

// Other property selectors
export const selectError = createSelector(
  selectCategoriesState,
  (state) => state.error
);

export const selectIsLoading = createSelector(
  selectCategoriesState,
  (state) => state.isLoading
);

export const selectCategoryById = createSelector(
  selectAllCategories,
  selectRouteParams,
  (categories, params) =>
    categories.find((category) => category.id === Number(params['categoryId']))
);
