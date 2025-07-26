import { createAction, props } from '@ngrx/store';
import {TodoModel} from "../../../../libs/data-access/todo";

export const resetTodosState = createAction(`[Todos] Reset state`);

export const addTodo = createAction(
  `[Todo] Add Todo`,
  props<{ todo: TodoModel }>()
);
export const addTodoSuccess = createAction(
  `[Todo] Add Todo Success`,
  props<{ todo: TodoModel }>()
);
export const addTodoFailed = createAction(`[Todo] Add Todo Failed`);

export const getTodo = createAction(`[Todo] Get Todo`, props<{ id: number }>());
export const getTodoSuccess = createAction(
  `[Todo] Get Todo Success`,
  props<{ todo: TodoModel }>()
);
export const getTodoFailed = createAction(`[Todo] Get Todo Failed`);

export const fetchTodos = createAction(`[Todos] Fetch Todos`);
export const fetchTodosSuccess = createAction(
  `[Todos] Fetch Todos Success`,
  props<{ todos: TodoModel[] }>()
);
export const fetchTodosFailed = createAction(`[Todos] Fetch Todos Failed`);

export const updateTodo = createAction(
  `[Todo] Update Todo`,
  props<{ todo: TodoModel }>()
);
export const updateTodoSuccess = createAction(
  `[Todo] Update Todo Success`,
  props<{ todo: TodoModel }>()
);
export const updateTodoFailed = createAction(`[Todo] Update Todo Failed`);

export const deleteTodo = createAction(
  `[Todo] Delete Todo`,
  props<{ id: number | null }>()
);
export const deleteTodoSuccess = createAction(
  `[Todo] Delete Todo Success`,
  props<{ id: number }>()
);
export const deleteTodoFailed = createAction(`[Todo] Delete Todo Failed`);
