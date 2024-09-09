import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Chooser } from '@ionic-native/chooser/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMaps } from '@ionic-native/google-maps';
import { HttpClientModule } from '@angular/common/http';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { Push } from '@awesome-cordova-plugins/push/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { AppMinimize } from '@ionic-native/app-minimize/ngx'; 
import { Network } from '@ionic-native/network/ngx';
import { PowerManagement } from '@ionic-native/power-management/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, Geolocation, GoogleMaps, DatePicker, Chooser, Camera, Base64, WebView, CallNumber, BackgroundMode, LocalNotifications, LaunchNavigator, Push, AppVersion, AppMinimize, Network, PowerManagement, AndroidPermissions],
  bootstrap: [AppComponent],
})
export class AppModule { 

}
