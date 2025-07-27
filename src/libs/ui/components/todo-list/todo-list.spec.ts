import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TodoListComponent} from './todo-list';
import {ComponentRef} from "@angular/core";

describe('TodoList', () => {
  let component: TodoListComponent;
  let componentRef: ComponentRef<TodoListComponent>;
  let fixture: ComponentFixture<TodoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('$todos', []);
    componentRef.setInput('$isDrafting', false);
    componentRef.setInput('$isUpdating', true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
