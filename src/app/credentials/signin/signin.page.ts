import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from "../../services.service";
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  demail = '';
  dpassword = '';
  public hide = true;
  constructor(
    private route: Router,
    private toast: ToastController,
    private service: ServicesService,
    private platform: Platform,
    private loader: LoadingController,
  ) {  }

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
  gotosignup() {
    this.route.navigate(['/credentials/']).then(() => {
      window.location.reload();
    })
  }

  checkemail(demail) {
    //let drivername = (<HTMLInputElement>document.getElementById('demail')).value;
    let drivername = demail;
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (drivername.length < 1 || !drivername.match(mail_format)) {
      document.getElementById('demail').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('demail').style.backgroundColor = '#ffffff';
    }
  }


  checkpassword(dpassword) {
    //let drivername = (<HTMLInputElement>document.getElementById('dpassword')).value;
    let drivername = dpassword;
    if (drivername.length < 1) {
      document.getElementById('dpassword').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('dpassword').style.backgroundColor = '#ffffff';
    }
  }

  openfp() {
    this.route.navigate(['/credentials/forgotpassword/']).then(() => {
      window.location.reload();
    })
  }

  async gotohome(demail,dpassword) {
    let ld = this.loader.create({
      message: "Please Wait ......"
    });
    (await ld).present();
    /*let jsondata = {
      driver_email: (<HTMLInputElement>document.getElementById('demail')).value.trim(),
      driver_password: (<HTMLInputElement>document.getElementById('dpassword')).value
    }*/
    let jsondata = {
      driver_email: demail.trim(),
      driver_password: dpassword,
      device_id: localStorage.getItem('device_id')
    }
    this.validateall(jsondata);
    let validations = this.validatedata(jsondata);
    if (validations['success'] == false) {
      this.loader.dismiss();
      let tm = this.toast.create({
        message: validations['message'],
        duration: 2500
      });
      (await tm).present();
    }
    else {
      this.service.DriverSigninService(jsondata).subscribe(
        async (data) => {
          console.log("get sigin data = ", data);

          if (!!data && data['success'] == true) {
            
            this.loader.dismiss();
            if(data.otp_option == false){
              localStorage.setItem('driver_data', JSON.stringify(data));
            
              this.route.navigate(['/pages/home']);
            }else{
              this.route.navigate(['/credentials/signin/signinotp/' + data.driver_data]);
            }
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: data['msg'],
              duration: 2500
            });
            (await tm).present();
          }
        }
      )
    }
  }

  validateall(jsondata) {
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (jsondata['driver_email'].length < 1 || !jsondata['driver_email'].match(mail_format)) {
      document.getElementById('demail').style.backgroundColor = '#f9b6ac';
    }
    if (jsondata['driver_password'].length < 6) {
      document.getElementById('dpassword').style.backgroundColor = '#f9b6ac';
    }
  }

  validatedata(jd) {
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (jd['driver_email'].length < 1) {
      let codes = {
        success: false,
        message: "Please Enter Your Email"
      }
      return codes;
    }
    else {
      if (!jd['driver_email'].match(mail_format)) {
        let codes = {
          success: false,
          message: "Please Enter A Valid Email"
        }
        return codes;
      }
      else {
        if (jd['driver_password'] == "") {
          let codes = {
            success: false,
            message: "Please Enter Your Password"
          }
          return codes;
        }
        else {
          if (jd['driver_password'].length < 6) {
            let codes = {
              success: false,
              message: "Password Should Be Minimum Of 6 Characters."
            }
            return codes;
          }
          else {
            let codes = {
              success: true,
              message: "All Data Validated"
            }
            return codes;
          }
        }
      }
    }
  }

}
