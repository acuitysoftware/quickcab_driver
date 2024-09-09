import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  GoogleMapApiKey = "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c";

  // BaseUrl = "https://quickcabtaxiservice.com/api/";
  BaseUrl = "https://quickcabtaxiservice.com/api/";

  ServiceLinks = {
    GoogleMapDirection: "https://maps.googleapis.com/maps/api/directions/json?",
    DriverSignup: this.BaseUrl + 'driver_registration',
    DriverSignin: this.BaseUrl + "apply_driver_login",
    DriverDetails: this.BaseUrl + "get_driver_details",
    DriverEditProfile: this.BaseUrl + "edit_driver_profile",
    DriverChangePassword: this.BaseUrl + "apply_driver_change_password",
    GetDriverRideHistory: this.BaseUrl + "get_driver_history",
    GetUserBookings: this.BaseUrl + "view_user_bookings",
    DriverAcceptBooking: this.BaseUrl + "driver_confirm_booking",
    DriverCancelBooking: this.BaseUrl + "driver_booking_cancel",
    GetRideDetails: this.BaseUrl + "get_ride_details",
    StartTrip: this.BaseUrl + "driver_start_trip",
    EndTrip: this.BaseUrl + "driver_end_trip",
    SendDriverLocation: this.BaseUrl + "driver_location_reset",
    CustomerPaymentComplete: this.BaseUrl + "payment_complete",
    DriverForgotPassword: this.BaseUrl + "apply_driver_password",
    DriverForgotPasswordOtp: this.BaseUrl + "driver_forgot_otp",
    DriverForgotPasswordOtpResend: this.BaseUrl + "resend_driver_forgot_otp",
    DriverLicenseUpload: this.BaseUrl + "driver_license_form",
    DriverCarDetailsUpload: this.BaseUrl + "driver_car_form",
    GetTransportColor: this.BaseUrl + "trans_color",
    GetTransportModel: this.BaseUrl + "trans_model",
    GetTransportType: this.BaseUrl + "trans_type",
    CheckDriverLicenseForm: this.BaseUrl + "check_driver_license_form",
    CheckCarRegisterForm: this.BaseUrl + "check_car_register_form",
    DriverAutoLogin: this.BaseUrl + "driver_auto_login",
    DriverSigninOtp: this.BaseUrl + "apply_driver_login_otp",
    DriverSignupOtp: this.BaseUrl + "driver_otp",
    DriverSignupOtpResend: this.BaseUrl + "resend_driver_otp",
    DriverSigninOtpResend: this.BaseUrl + "resend_driver_login_otp",
    DriverLogout: this.BaseUrl + "driver_logout",
    ApplyChangePhone: this.BaseUrl + "apply_driver_change_phone",
    UpdatePhoneOtp: this.BaseUrl + "update_driver_phone",
    ResendPhonrOtp: this.BaseUrl + "resend_driver_phone",
    DriverLocationReached: this.BaseUrl + "driver_reach",
    CheckDriverVersion: this.BaseUrl + "version_code_driver",
  }

  constructor(
    private http: HttpClient,
    private route: Router,
  ) { }
  GoogleMapDirectionService(data: any): Observable<any> {
    let startpoint = data.startlocation;
    let endpoint = data.endlocation;
    let mapurl = this.ServiceLinks.GoogleMapDirection + "origin=" + startpoint + "&destination=" + endpoint + "&key=" + this.GoogleMapApiKey;
    return this.http.get(mapurl);
  }
  DriverSignupService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverSignup, data);
  }
  DriverSigninService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverSignin, data);
  }
  GetDriverDetailsService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverDetails, data);
  }
  EditDriverProfileService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverEditProfile, data);
  }
  DriverChangePasswordService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverChangePassword, data);
  }
  GetDriverRideHistoryService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.GetDriverRideHistory, data);
  }
  GetUserBookingsService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.GetUserBookings, data);
  }
  DriverAcceptBookingService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverAcceptBooking, data);
  }
  DriverCancelBookingService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverCancelBooking, data);
  }
  GetRideDetailsService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.GetRideDetails, data);
  }
  StartTripService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.StartTrip, data);
  }
  SendDriverLocationService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.SendDriverLocation, data);
  }
  EndTripService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.EndTrip, data);
  }
  CustomerPaymentCompleteService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.CustomerPaymentComplete, data);
  }
  DriverForgotPasswordService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverForgotPassword, data);
  }
  DriverLicenseUploadService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverLicenseUpload, data);
  }
  GetTransportColorService(): Observable<any> {
    return this.http.get(this.ServiceLinks.GetTransportColor);
  }
  GetTransportModelService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.GetTransportModel, data);
  }
  GetTransportTypeService(): Observable<any> {
    return this.http.get(this.ServiceLinks.GetTransportType);
  }
  DriverCarDetailsUploadService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverCarDetailsUpload, data);
  }
  CheckDriverLicenseFormService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.CheckDriverLicenseForm, data);
  }
  CheckCarRegisterFormService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.CheckCarRegisterForm, data);
  }
  DriverAutoLoginService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverAutoLogin, data);
  }
  DriverSigninOtpService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverSigninOtp, data);
  }
  DriverSignupOtpService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverSignupOtp, data);
  }
  DriverForgotPasswordOtpService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverForgotPasswordOtp, data);
  }
  DriverForgotPasswordOtpResendService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverForgotPasswordOtpResend, data);
  }
  DriverSignupOtpResendService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverSignupOtpResend, data);
  }
  DriverSigninOtpResendService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverSigninOtpResend, data);
  }
  DriverLogoutService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverLogout, data);
  }
  ApplyChangePhoneService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.ApplyChangePhone, data);
  }
  UpdatePhoneOtpService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.UpdatePhoneOtp, data);
  }
  ResentPhoneOtpService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.ResendPhonrOtp, data);
  }
  DriverLocationReachedService(data: any): Observable<any> {
    return this.http.post(this.ServiceLinks.DriverLocationReached, data);
  }
  CheckDriverVersionService(): Observable<any> {
    return this.http.get(this.ServiceLinks.CheckDriverVersion);
  }
}
