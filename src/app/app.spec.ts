import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { TodoFacade } from './data-access/todo/facades/todo.facade';
import { CategoryFacade } from './data-access/category/facades/category.facade';
import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let todoFacade: TodoFacade;
  let categoryFacade: CategoryFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    todoFacade = TestBed.inject(TodoFacade);
    categoryFacade = TestBed.inject(CategoryFacade);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
