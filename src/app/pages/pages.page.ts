import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { ServicesService } from '../services.service';
@Component({
  selector: 'app-pages',
  templateUrl: './pages.page.html',
  styleUrls: ['./pages.page.scss'],
})
export class PagesPage implements OnInit {
  drivername = JSON.parse(localStorage.getItem('driver_data')).driver_name;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;

  driverprofileimage = "https://quickcabtaxiservice.com/storage/app/public/driver.png";
  imagepath = "https://quickcabtaxiservice.com/storage/app/public/";
  constructor(
    private menu: MenuController,
    private route: Router,
    private service: ServicesService,
    private alert: AlertController,
    private loader: LoadingController,
    private backgroundservice: BackgroundMode,
  ) { }

  ngOnInit() {
    let jsondata = {
      driver_id: this.driverid
    }
    this.service.GetDriverDetailsService(jsondata).subscribe(
      data => {
        console.log("menu driver data :", data);

        if (!!data && data.success == true) {
          if (!!data.driver_details.image) {
            this.driverprofileimage = this.imagepath + data.driver_details.image;
            this.drivername = data.driver_details.driver_name;
          }

        }
      }
    )
  }

  async logout() {
    let jd = {
      driver_id: this.driverid
    }
    this.service.DriverLogoutService(jd).subscribe(
      async data => {
        if (!!data && data.success == true) {
          let ld = this.loader.create({
            message: 'Signing Out......'
          });
          (await ld).present().then(() => {

            localStorage.clear();
            this.route.navigate(['/credentials/signin']).then(async () => {
              this.loader.dismiss();
              let ar = this.alert.create({
                message: data.msg
              });
              (await ar).present();

              setTimeout(() => {
                this.alert.dismiss();
                window.location.reload();
              }, 1500);

            });
          })
        }
        else {
          let ar = this.alert.create({
            message: data.msg,
            buttons: ['OK']
          });
          (await ar).present();
        }
      }
    )

  }

  gotopage(page) {
    console.log(page);
    this.backgroundservice.disable();
    this.menu.close('menu');
    /*this.route.navigate([page]).then(() => {
      window.location.reload();
    })*/

    this.route.navigate([page]);

  }

}
