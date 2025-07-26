import { computed, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TodoActions, TodoSelectors } from '../state';
import { CategorySelectors } from '../../category/state';
import {ITodoFacade, TodoModel, TodosViewModel} from "../../../../libs/data-access/todo";

@Injectable({
  providedIn: 'root',
})
export class TodoFacade implements ITodoFacade {
  // dependencies
  private readonly store = inject(Store);

  private $_categorySignal = toSignal(
    this.store.select(CategorySelectors.selectCategoryById)
  );

  private $_allTodosSignal = toSignal(
    this.store.select(TodoSelectors.selectAllTodos),
    {
      initialValue: [],
    }
  );

  private $_todosByCategoryWithVisibilitySignal = toSignal(
    this.store.select(TodoSelectors.selectTodosByCategoryWithVisibility),
    {
      initialValue: [],
    }
  );

  // ViewModel by current state
  $todosViewModel = computed<TodosViewModel>(() => ({
    category: this.$_categorySignal() ?? null,
    showDoneTodos: this.$_categorySignal()?.showDoneTodos ?? false,
    todos: this.$_todosByCategoryWithVisibilitySignal(),
  }));

  $isLoading = toSignal(this.store.select(TodoSelectors.selectIsLoading), {
    initialValue: false,
  });

  resetTodosState(): void {
    this.store.dispatch(TodoActions.resetTodosState());
  }

  addTodo(todo: TodoModel): void {
    if (!todo.title) return;

    // APIがidを採番してくれないためサンプルアプリ固有でidをインクリメントする
    const maxId = Math.max(
      0,
      ...this.$_allTodosSignal().map((todo) => todo.id!)
    );
    todo.id = maxId + 1;

    // set categoryId from current category
    const category = this.$_categorySignal();
    if (category) todo.categoryId = category.id;

    this.store.dispatch(TodoActions.addTodo({ todo }));
  }

  fetchTodos(): void {
    this.store.dispatch(TodoActions.fetchTodos());
  }

  getTodo(id: number): void {
    this.store.dispatch(TodoActions.getTodo({ id }));
  }

  updateTodo(todo: TodoModel): void {
    if (!todo.id) throw new Error('todo.id is null.');
    if (todo.title) this.store.dispatch(TodoActions.updateTodo({ todo }));
  }

  deleteTodo(id: number | null): void {
    if (!id) throw new Error('todo.id is null.');
    this.store.dispatch(TodoActions.deleteTodo({ id }));
  }
}
