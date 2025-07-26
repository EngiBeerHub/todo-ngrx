import { TodoDto, TodoModel } from '../model/todo.interfaces';
import {ModelAdapter} from "../../generic-http";

export class TodoAdapter implements ModelAdapter<TodoDto, TodoModel> {
  fromDto(dto: TodoDto): TodoModel {
    return {
      id: dto.id,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      isDone: dto.isDone,
    };
  }

  toDto(model: TodoModel): TodoDto {
    return {
      id: model.id,
      categoryId: model.categoryId,
      title: model.title,
      description: model.description,
      dueDate: model.dueDate,
      isDone: model.isDone,
    };
  }
}
