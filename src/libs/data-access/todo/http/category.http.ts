import { Injectable } from '@angular/core';
import { CategoryDto, CategoryModel } from '../model/category.interfaces';
import { CategoryAdapter } from '../adapters/category.adapter';
import {GenericHttpService} from "../../generic-http";

@Injectable({
  providedIn: 'root',
})
export class CategoryHttpService extends GenericHttpService<
  CategoryDto,
  CategoryModel
> {
  constructor() {
    super('/categories', '', new CategoryAdapter());
  }
}
