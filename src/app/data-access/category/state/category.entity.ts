import { createEntityAdapter } from '@ngrx/entity';
import {CategoryModel} from "../../../../libs/data-access/todo";

export const categoryEntityAdapter = createEntityAdapter<CategoryModel>();
