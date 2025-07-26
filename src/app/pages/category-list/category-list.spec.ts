import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListPage } from './category-list';
import { CategoryFacade } from '../../data-access/category/facades/category.facade';
import { provideMockStore } from '@ngrx/store/testing';

describe('CategoryListPage', () => {
  let component: CategoryListPage;
  let fixture: ComponentFixture<CategoryListPage>;
  let categoryFacade: CategoryFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryListPage],
      providers: [
        provideMockStore({
          initialState: {
            category: {
              isLoading: false,
              items: [], // 他に必要なプロパティも追加
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListPage);
    component = fixture.componentInstance;
    categoryFacade = TestBed.inject(CategoryFacade);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
