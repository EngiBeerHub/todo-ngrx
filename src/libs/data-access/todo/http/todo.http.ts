import {Injectable} from '@angular/core';
import {TodoDto, TodoModel} from '../model/todo.interfaces';
import {TodoAdapter} from '../adapters/todo.adapter';
import {GenericHttpService} from "../../generic-http";

@Injectable({
  providedIn: 'root',
})
export class TodoHttpService extends GenericHttpService<TodoDto, TodoModel> {
  constructor() {
    super('/todo', 'https://oxgloygylxcnvxjcoocg.supabase.co/rest/v1', new TodoAdapter());
  }
}
