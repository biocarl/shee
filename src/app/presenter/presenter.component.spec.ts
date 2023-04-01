import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenterComponent } from './presenter.component';

describe('PresenterComponent', () => {
  let component: PresenterComponent;
  let fixture: ComponentFixture<PresenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
