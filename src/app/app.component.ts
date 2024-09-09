import { Component, OnInit } from '@angular/core';
import { Push, PushObject, PushOptions } from '@awesome-cordova-plugins/push/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { Platform, AlertController, ToastController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { PowerManagement } from '@ionic-native/power-management/ngx';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 
  constructor(
    private route: Router,
    private push: Push,
    private platform: Platform,
    private backgroundmode: BackgroundMode,
    private network: Network,
    private alert: AlertController,
    private toast: ToastController,
    private powerManagement: PowerManagement,
    private androidPermissions: AndroidPermissions
  ) {

    this.initializeApp();

    this.platform.ready().then(() => {

      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.POST_NOTIFICATIONS, this.androidPermissions.PERMISSION.ACCESS_NETWORK_STATE, this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION, this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION]);

      /*this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.POST_NOTIFICATIONS).then(
        result => console.log('Has permission?',result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.POST_NOTIFICATIONS)
      );*/

      this.pushsetup();
      //this.backgroundmode.enable();
    });
  }

  ngOnInit(){
    
  }

  async notificatonAlert(msg: any) {

    let tm = await this.toast.create({
      message: msg,
      duration: 2500
    });
    tm.present();

    await tm.present();
  }


  pushsetup() {

    this.powerManagement.acquire().then().catch();
        
    this.push.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
        } else {
          console.log('We do not have permission to send push notifications');
        }

      });

            
    const options: PushOptions = {
      android: {
        senderID: "1090587930950",
        sound: true,
        vibrate: true,
        forceShow: true,
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },

    }

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe((notification: any) =>{ 
             
        console.log('Received a notification', notification)
      
    });

    pushObject.on('registration').subscribe((registration: any) => localStorage.setItem('device_id', registration.registrationId));

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

  }

  
    initializeApp() {
    
      this.network.onDisconnect().subscribe(() => {
        this.networkDisconectedAlert();
      });

      this.network.onConnect().subscribe(() => {
        /*setTimeout(() => {
          this.networkConectedAlert();
          
        }, 3000);*/
      });
    }

    async networkConectedAlert() {

      const alert = await this.alert.create({

        message: 'Network connected!',
        buttons: ['OK']
      });

      await alert.present();
    }


    async networkDisconectedAlert() {

      const alert = await this.alert.create({

        /*message: 'No Internet available on your device. Please check your Internet connection',
        buttons: [{
          text: 'Ok',
          handler: () => {
          //app is closing when user click on ok 
            navigator['app'].exitApp();  
          }
        }]*/
        message: 'No Internet available on your device. Please check your Internet connection',
        buttons: ['OK']
      });

      await alert.present();
    }


}
