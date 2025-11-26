import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsReceipt } from './goods-receipt';

describe('GoodsReceipt', () => {
  let component: GoodsReceipt;
  let fixture: ComponentFixture<GoodsReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodsReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsReceipt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
