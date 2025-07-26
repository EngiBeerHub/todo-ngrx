import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TodoActions, TodoSelectors } from './index';
import { catchError, concatMap, map, of, switchMap } from 'rxjs';
import {TodoHttpService, TodoModel} from "../../../../libs/data-access/todo";

@Injectable({
  providedIn: 'root',
})
export class TodoEffects {
  private readonly actions = inject(Actions);
  private readonly todoApi = inject(TodoHttpService);
  protected readonly store = inject(Store);

  private $_todoSignal = toSignal(
    this.store.select(TodoSelectors.selectAllTodos),
    {
      initialValue: [],
    }
  );

  addTodo$ = createEffect(() =>
    this.actions.pipe(
      ofType(TodoActions.addTodo.type),
      concatMap(({ todo }) =>
        this.todoApi.post(todo).pipe(
          map((todo: TodoModel) => TodoActions.addTodoSuccess({ todo })),
          catchError(() => of(TodoActions.addTodoFailed()))
        )
      )
    )
  );

  fetchTodos$ = createEffect(() =>
    this.actions.pipe(
      ofType(TodoActions.fetchTodos.type),
      switchMap(() =>
        this.todoApi.get().pipe(
          map((todos: TodoModel[]) => TodoActions.fetchTodosSuccess({ todos })),
          catchError(() => of(TodoActions.fetchTodosFailed()))
        )
      )
    )
  );

  getTodo$ = createEffect(() =>
    this.actions.pipe(
      ofType(TodoActions.getTodo.type),
      switchMap(({ id }) => {
        const todo = this.$_todoSignal().find((todo) => todo.id === id);
        return todo
          ? of(TodoActions.getTodoSuccess({ todo }))
          : this.todoApi.getById(id).pipe(
              map((todo: TodoModel) => TodoActions.getTodoSuccess({ todo })),
              catchError(() => of(TodoActions.getTodoFailed()))
            );
      })
    )
  );

  getTodoSuccess$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(TodoActions.getTodoSuccess.type),
        switchMap(({ todo }) => of(todo))
      ),
    { dispatch: false }
  );

  updateTodo$ = createEffect(() =>
    this.actions.pipe(
      ofType(TodoActions.updateTodo.type),
      concatMap(({ todo }) =>
        this.todoApi.put(todo).pipe(
          map((todo: TodoModel) => TodoActions.updateTodoSuccess({ todo })),
          catchError(() => of(TodoActions.updateTodoFailed()))
        )
      )
    )
  );

  deleteTodo$ = createEffect(() =>
    this.actions.pipe(
      ofType(TodoActions.deleteTodo.type),
      concatMap(({ id }) =>
        this.todoApi.delete(id).pipe(
          map((todo: TodoModel) =>
            TodoActions.deleteTodoSuccess({ id: todo.id as number })
          ),
          catchError(() => of(TodoActions.deleteTodoFailed()))
        )
      )
    )
  );
}
