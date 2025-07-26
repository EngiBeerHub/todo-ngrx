import { EntityState } from '@ngrx/entity';

export interface CategoryDto {
  id: number | null;
  title: string;
  description: string | null;
  showDoneTodos: boolean;
}

export interface CategoryModel {
  id: number | null;
  title: string;
  description: string | null;
  showDoneTodos: boolean;
}

export interface CategoryViewModel {
  categories: CategoryModel[];
}

export interface CategoriesState extends EntityState<CategoryModel> {
  // additional properties to EntityState
  isLoading: boolean;
  error: string | null;
}
