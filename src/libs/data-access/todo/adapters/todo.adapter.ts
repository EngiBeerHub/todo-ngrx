import {TodoDto, TodoModel} from '../model/todo.interfaces';
import {ModelAdapter} from "../../generic-http";

export class TodoAdapter implements ModelAdapter<TodoDto, TodoModel> {
  fromDto(dto: TodoDto): TodoModel {
    return {
      id: dto.id,
      categoryId: dto.category_id,
      title: dto.title,
      description: dto.description,
      dueDate: dto.due_date,
      isDone: dto.is_done,
    };
  }

  toDto(model: TodoModel): TodoDto {
    return {
      id: model.id,
      category_id: model.categoryId,
      title: model.title,
      description: model.description,
      due_date: model.dueDate,
      is_done: model.isDone,
    };
  }
}
