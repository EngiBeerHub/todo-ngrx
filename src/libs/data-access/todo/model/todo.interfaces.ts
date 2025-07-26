import { EntityState } from '@ngrx/entity';
import { CategoryModel } from './category.interfaces';

export interface TodoDto {
  id: number | null;
  categoryId: number | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  isDone: boolean;
}

export interface TodoModel {
  id: number | null;
  categoryId: number | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  isDone: boolean;
}

export interface TodosViewModel {
  category: CategoryModel | null;
  showDoneTodos: boolean;
  todos: TodoModel[];
}

export interface TodosState extends EntityState<TodoModel> {
  // additional properties to EntityState
  isLoading: boolean;
  error: string | null;
}
