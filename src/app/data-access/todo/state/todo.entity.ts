import { createEntityAdapter } from '@ngrx/entity';
import {TodoModel} from "../../../../libs/data-access/todo";

export const todoEntityAdapter = createEntityAdapter<TodoModel>();
