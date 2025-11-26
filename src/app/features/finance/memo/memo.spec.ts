import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memo } from './memo';

describe('Memo', () => {
  let component: Memo;
  let fixture: ComponentFixture<Memo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Memo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Memo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
