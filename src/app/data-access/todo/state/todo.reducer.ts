import { TodoActions } from './index';
import { createReducer, on } from '@ngrx/store';
import { todoEntityAdapter } from './todo.entity';
import {TodosState} from "../../../../libs/data-access/todo";

export const initialTodosState = todoEntityAdapter.getInitialState({
  isLoading: false,
  error: null,
});

export const todoReducer = createReducer<TodosState>(
  initialTodosState,
  on(TodoActions.resetTodosState, () => initialTodosState),
  on(TodoActions.addTodo, (state, { todo }) =>
    // optimistically update state
    todoEntityAdapter.addOne(todo, state)
  ),
  on(TodoActions.addTodoSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),
  on(TodoActions.addTodoFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to add todo!',
  })),
  on(TodoActions.fetchTodos, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(TodoActions.fetchTodosSuccess, (state, { todos }) =>
    todoEntityAdapter.setAll(todos, {
      ...state,
      isLoading: false,
      error: null,
    })
  ),
  on(TodoActions.fetchTodosFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to fetch todos!',
  })),
  on(TodoActions.updateTodo, (state, { todo }) =>
    todo.id
      ? todoEntityAdapter.updateOne({ id: todo.id, changes: todo }, state)
      : state
  ),
  on(TodoActions.updateTodoSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),
  on(TodoActions.updateTodoFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to update todo!',
  })),
  on(TodoActions.deleteTodo, (state, { id }) =>
    id ? todoEntityAdapter.removeOne(id, state) : state
  ),
  on(TodoActions.deleteTodoSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),
  on(TodoActions.deleteTodoFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to delete todo!',
  }))
);
