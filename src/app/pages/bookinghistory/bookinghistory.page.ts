import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { LoadingController, MenuController, Platform } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
@Component({
  selector: 'app-bookinghistory',
  templateUrl: './bookinghistory.page.html',
  styleUrls: ['./bookinghistory.page.scss'],
})
export class BookinghistoryPage implements OnInit {
  bookingcount = 0;
  driverhistory_count = 1;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  driverhistory = [];
  imagepath = "https://quickcabtaxiservice.com/storage/app/public/";
  intervalset01: any;
  isAndroid = false;
  
  constructor(
    private menu: MenuController,
    private service: ServicesService,
    private platform: Platform,
    private loader: LoadingController,
    private route: Router,
    private localpush: LocalNotifications,
    private bgmode: BackgroundMode,
  ) { }

  async ionViewWillLeave(){
    if(this.intervalset01){
      clearInterval(this.intervalset01);
    }
  }

  playAudio(){
    let audio = new Audio();
    audio.pause();
    audio.src = "https://quickcabtaxiservice.com/storage/app/public/app_notification_sound/newbook.wav";
    audio.load();
    audio.play();

    setTimeout(function(){
        audio.pause();
        audio.currentTime = 0;
    }, 4000);
  }

  async ngOnInit() {
    this.platform.ready().then(async () => {

      if (this.platform.platforms().includes("android")){
        this.isAndroid = true
    }

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
 
      //this.bgmode.enable();
      let jsondata = {
        driver_id: this.driverid
      }
      let ld = this.loader.create({
        message: "Loading......"
      });
      (await ld).present().then(() => {
        this.service.GetDriverRideHistoryService(jsondata).subscribe(
          data => {
            if (!!data && data.success == true) {
              console.log("d hist : ", data);

              if (data.driver_history.length > 0) {
                
                for (let i = 0; i < data.driver_history.length; i++) {
                  data.driver_history[i].trip_price = Math.round(data.driver_history[i].trip_price);
                  let currentstate = data.driver_history[i].current_status;
                  let round_currentstate = data.driver_history[i].round_current_status;
                  let ride_status = "";
                  if(data.driver_history[i].tripType == 2){
                    if(currentstate == 4){

                      switch (round_currentstate) {
                        case "1": ride_status = "Booked"; break;
                        case "2": ride_status = "Confirmed"; break;
                        case "3": ride_status = "On Trip"; break;
                        case "4": ride_status = "Completed"; break;
                        case "5": ride_status = "Cancelled"; break;
                        case "6": ride_status = "Refused"; break;
                        default: ride_status = "Unknown Status"; break;
                      }

                    }else{

                      switch (currentstate) {
                        case "1": ride_status = "Booked"; break;
                        case "2": ride_status = "Confirmed"; break;
                        case "3": ride_status = "On Trip"; break;
                        case "4": ride_status = "Completed First Trip"; break;
                        case "5": ride_status = "Cancelled"; break;
                        case "6": ride_status = "Refused"; break;
                        default: ride_status = "Unknown Status"; break;
                      }

                    }
                    
                  }else{
                    switch (currentstate) {
                      case "1": ride_status = "Booked"; break;
                      case "2": ride_status = "Confirmed"; break;
                      case "3": ride_status = "On Trip"; break;
                      case "4": ride_status = "Completed"; break;
                      case "5": ride_status = "Cancelled"; break;
                      case "6": ride_status = "Refused"; break;
                      default: ride_status = "Unknown Status"; break;
                    }
                  }
                  
                  data.driver_history[i].ride_status = ride_status;

                  if (!!data.driver_history[i].trip_end_time) {
                    // let minutesToAdd = 330;
                    // let endtime = new Date(data.driver_history[i].trip_end_time);
                    // let newendtime = new Date(endtime.getTime() + minutesToAdd * 60000);
                    // data.driver_history[i].trip_end_time = newendtime;
                     
                      let minutesToAdd = 330;
                      let starttime = new Date(data.driver_history[i].trip_start_time);
                      let newstarttime = new Date(starttime.getTime() + minutesToAdd * 60000);
                      data.driver_history[i].trip_start_time = newstarttime;

                      if(!!data.driver_history[i].round_trip_end_time){
                        let minutesToAdd = 330;
                        let starttime = new Date(data.driver_history[i].round_trip_start_time);
                        let newstarttime = new Date(starttime.getTime() + minutesToAdd * 60000);
                        data.driver_history[i].round_trip_start_time = newstarttime;
                      }
                   
                  }


                }
              }else{
                this.driverhistory_count = 0;
              }
              this.driverhistory = data.driver_history;
              this.loader.dismiss();
              console.log(data.driver_history);

            }
            else {
              this.driverhistory_count = 0;
              this.driverhistory = [];
              this.loader.dismiss();
              console.log(this.driverhistory);
            }
          }
        );
      });

    });
    
      
      this.intervalset01 = setInterval(() => {
        let servicedata = {
          driver_id: this.driverid
        }

        this.service.GetUserBookingsService(servicedata).subscribe(
          data => {
            console.log(data);  
                      
            if (!!data && data.success == true) {
              this.bookingcount = data.booked_users.length;
  
              if (data.booked_users.length > 0) {
                this.playAudio();
                this.localpush.schedule({
                  id: 1,
                  title: 'Quick Cab User Booking ',
                  text: 'You Have ' + data.booked_users.length + " New Booking. Please Accept / Reject From QuickCab Driver App.",
                  icon: 'https://quickcabtaxiservice.com/storage/app/public/quickcabicon.png',
                  
                })  
                
                
                for (let i = 0; i < data.booked_users.length; i++) {
                  let rideid = data.booked_users[i].id;
                  let sdata = {
                    ride_id: rideid
                  };
                  this.service.GetRideDetailsService(sdata).subscribe(
                    ridedata => {
                      console.log("ride data = ", ridedata);
                      let prc = ridedata.totalprice;
                      if (!!ridedata && ridedata.success == true) {
                        data.booked_users[i].estimated_price = Math.round(prc)
                      }
                    }
                  )
                }  
  
                // this.bookings = data.booked_users;
                // this.bookingcounts = 1;
  
              }
              else {
                // this.bookings = [];
                this.bookingcount = 0;
  
              }
            }
            // console.log("bookings:- ", this.bookings);
  
          }
        );
      }, 6000);
      
  }

  
  menuon() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu')
  }


  gotopages(r_id, r_status, r_pay) {

    if (r_status == 2) {
      //this.route.navigate(['/pages/ridedirection/' + r_id]);

      this.route.navigate(['/pages/ridedirection/' + r_id]).then(() => {
        window.location.reload();
      })
    }
    else if (r_status == 3) {
      //this.route.navigate(['/pages/ongoingtrip/' + r_id]);
      this.route.navigate(['/pages/ongoingtrip/' + r_id]).then(() => {
        window.location.reload();
      })
    }
    else if (r_status == 4 && r_pay == 'Unpaid') {
      this.route.navigate(['/pages/tripsummary/' + r_id]);
    }
    else if (r_status == 4 && r_pay == 'Paid') {
      this.route.navigate(['/pages/tripsummary/' + r_id]);
    }
    else if (r_status == 1) {
      this.route.navigate(['/pages/viewbookings']);
    }
    else {
      this.route.navigate(['/pages/tripsummary/' + r_id]);
    }
  }

  gotopages_round(r_id, r_status, r_pay, round_status) {

    if (r_status == 2) {
      this.route.navigate(['/pages/ridedirection/' + r_id]).then(() => {
        window.location.reload();
      })
    }
    else if (r_status == 3) {
      this.route.navigate(['/pages/ongoingtrip/' + r_id]).then(() => {
        window.location.reload();
      })
    }else  if (r_status == 4 && round_status == 2) {

      this.route.navigate(['/pages/ridedirection/' + r_id]).then(() => {
        window.location.reload();
      })
    }else  if (r_status == 4 && round_status == 3) {
      this.route.navigate(['/pages/ongoingtrip/' + r_id]).then(() => {
        window.location.reload();
      })
    }
    else if (r_status == 4 && round_status == 4) {
      this.route.navigate(['/pages/tripsummary/' + r_id]);
    }
    else if (r_status == 1) {
      this.route.navigate(['/pages/viewbookings']);
    }
    else {
      this.route.navigate(['/pages/tripsummary/' + r_id]);
    }
  }

  refreshpage() {
    window.location.reload()
  }


  viewbookings() {
    this.bgmode.disable();
    this.localpush.clearAll();
    clearInterval(this.intervalset01);
    /*(<HTMLAudioElement>document.getElementById('bgalert')).pause();*/
    this.route.navigate(['/pages/viewbookings']);
  }

}
