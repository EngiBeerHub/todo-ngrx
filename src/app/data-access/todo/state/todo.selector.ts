import { createFeatureSelector, createSelector } from '@ngrx/store';
import { todoFeatureKey } from './feature-key';
import { todoEntityAdapter } from './todo.entity';
import { selectRouteParams } from '../../router.selectors';
import { selectCategoryById } from '../../category/state/category.selector';
import {TodosState} from "../../../../libs/data-access/todo";

export const selectTodosState =
  createFeatureSelector<TodosState>(todoFeatureKey);

const { selectAll } = todoEntityAdapter.getSelectors();

export const selectAllTodos = createSelector(selectTodosState, selectAll);

export const selectTodosByCategory = createSelector(
  selectAllTodos,
  selectRouteParams,
  (todos, params) =>
    todos.filter((todo) => todo.categoryId === Number(params['categoryId']))
);

export const selectTodosByCategoryWithVisibility = createSelector(
  selectTodosByCategory,
  selectCategoryById,
  (todos, category) =>
    category?.showDoneTodos ? todos : todos.filter((t) => !t.isDone)
);

// Other property selectors
export const selectError = createSelector(
  selectTodosState,
  (state) => state.error
);
export const selectIsLoading = createSelector(
  selectTodosState,
  (state) => state.isLoading
);
