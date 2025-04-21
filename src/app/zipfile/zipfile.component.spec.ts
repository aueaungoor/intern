import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipfileComponent } from './zipfile.component';

describe('ZipfileComponent', () => {
  let component: ZipfileComponent;
  let fixture: ComponentFixture<ZipfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZipfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZipfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
