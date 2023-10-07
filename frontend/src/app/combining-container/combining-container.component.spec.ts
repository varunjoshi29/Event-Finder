import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombiningContainerComponent } from './combining-container.component';

describe('CombiningContainerComponent', () => {
  let component: CombiningContainerComponent;
  let fixture: ComponentFixture<CombiningContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CombiningContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombiningContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
