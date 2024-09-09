import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ForgotpasswordotpPage } from './forgotpasswordotp.page';

describe('ForgotpasswordotpPage', () => {
  let component: ForgotpasswordotpPage;
  let fixture: ComponentFixture<ForgotpasswordotpPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotpasswordotpPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotpasswordotpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
