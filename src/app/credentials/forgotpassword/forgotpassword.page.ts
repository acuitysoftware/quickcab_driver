import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, Platform } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
})
export class ForgotpasswordPage implements OnInit {

  constructor(
    private route: Router,
    private service: ServicesService,
    private toast: ToastController,
    private loader: LoadingController,
    private platform: Platform,
    private alert: AlertController,
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
    });
  }

  gotosignin() {
    this.route.navigate(['/credentials/signin/']).then(() => {
      window.location.reload();
    })
  }

  checkemail() {
    let drivername = (<HTMLInputElement>document.getElementById('demail')).value;
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (drivername.length < 1 || !drivername.match(mail_format)) {
      document.getElementById('demail').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('demail').style.backgroundColor = '#ffffff';
    }
  }

  async sendlinkbtn() {
    let ld = this.loader.create({
      message: 'Generating Link......'
    });
    (await ld).present();
    let servicedata = {
      forgot_email: (<HTMLInputElement>document.getElementById('demail')).value
    };
    this.validateall(servicedata);
    let validations = this.validatedata(servicedata);
    if (validations['success'] == false) {
      let tm = this.toast.create({
        message: validations['message'],
        duration: 2500
      });
      (await tm).present();
      this.loader.dismiss();
    }
    else {
      this.service.DriverForgotPasswordService(servicedata).subscribe(
        async data => {
          if (!!data && data.success == true) {
        
            this.loader.dismiss();

            if(data.otp_option == false){
              let ar = this.alert.create({
                message: data.msg
              });
              (await ar).present();
  
              setTimeout(() => {
                this.loader.dismiss();
                this.alert.dismiss();
                this.route.navigate(['/credentials/signin/']).then(() => {
                  window.location.reload();
                })
              }, 3500);
            }else{
              this.route.navigate(['/credentials/forgotpassword/forgotpasswordotp/' + data.driver_id]);
            }

          }
          else {
            let tm = this.toast.create({
              message: data.msg,
              duration: 2500
            });
            (await tm).present();
            this.loader.dismiss();
          }
        }
      )
    }
  }
  validateall(sd) {
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (sd['forgot_email'].length < 1 || !sd['forgot_email'].match(mail_format)) {
      document.getElementById('demail').style.backgroundColor = '#f9b6ac';
    }
  }
  validatedata(sd) {
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (sd['forgot_email'].length < 1) {
      let codes = {
        success: false,
        message: "Please Enter Your Email"
      };
      return codes;
    }
    else {
      if (!sd['forgot_email'].match(mail_format)) {
        let codes = {
          success: false,
          message: "Please Enter A Valid Email"
        };
        return codes;
      }
      else {
        let codes = {
          success: true,
          message: "All Data Validated"
        };
        return codes;
      }
    }
  }

}
