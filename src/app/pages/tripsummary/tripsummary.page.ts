import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  MarkerIcon,
  Environment,
  GoogleMapsMapTypeId
} from '@ionic-native/google-maps';
import { LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';

declare var google;

@Component({
  selector: 'app-tripsummary',
  templateUrl: './tripsummary.page.html',
  styleUrls: ['./tripsummary.page.scss'],
})
export class TripsummaryPage implements OnInit {
  @ViewChild('gmap', { static: false }) mapElement: ElementRef;
  gmap: any;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  latitude = 22.000;
  longitude = 88.000;
  map: GoogleMap;
  rideid;
  customername = "";
  startaddress = "";
  endaddress = "";
  rideinfo;
  ridedets = [];
  customerid;
  pricetopay;
  carrate: number;
  customerimage = "https://quickcabtaxiservice.com/storage/app/public/customer.png";
  imagepath = "https://quickcabtaxiservice.com/storage/app/public/";
  isAndroid = false;
  myinterval: any;
  myinterval2: any;
  constructor(
    private menu: MenuController,
    private geolocation: Geolocation,
    private platform: Platform,
    private loader: LoadingController,
    private service: ServicesService,
    private route: Router,
    private activatedroute: ActivatedRoute,
    private http: HttpClient,
    private toast: ToastController,
    private call: CallNumber,
  ) { }

  async ionViewWillLeave(){
    if(this.myinterval){
      clearInterval(this.myinterval);
    }
    if(this.myinterval2){
      clearInterval(this.myinterval2);
    }
   
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
      this.activatedroute.params.subscribe(async data => {
        let rideid = data.tripsummaryid;
        this.rideid = rideid;
        let servicedata = {
          ride_id: rideid
        }
        let ld = this.loader.create({
          message: 'Fetching Trip Summary Data......'
        });
        (await ld).present().then(() => {
          this.service.GetRideDetailsService(servicedata).subscribe(
            async data => {
              console.log("rdets:", data);

              let ridedetails = data.ride_details;
              this.ridedets = ridedetails;
              this.rideinfo = ridedetails[0];
              for (let i = 0; i < this.ridedets.length; i++) {
                this.ridedets[i]['trip_price'] = Math.round(this.ridedets[i]['trip_price']);
                if (this.ridedets[i]['current_status'] == '5' || this.ridedets[i]['current_status'] == '6') {
                  this.ridedets[i]['distance'] = "0";
                }
              }
              this.customername = ridedetails[0].customer_name;
              let custimage = ridedetails[0].customer_image;
              if (!!custimage || custimage != "") {
                this.customerimage = custimage;
              }
              this.startaddress = ridedetails[0].start_address;
              this.endaddress = ridedetails[0].end_address;
              this.customerid = ridedetails[0].user_id;
              this.pricetopay = Number(ridedetails[0].distance) * 40;
              let stloc = ridedetails[0].trip_start_location;
              let stlocsplit = stloc.split(",");
              let stloccoord = {
                lat: stlocsplit[0],
                lng: stlocsplit[1]
              };
              this.rideinfo.start_coords = stloccoord;
              let eloc = ridedetails[0].trip_end_location;
              let elocsplit = eloc.split(",");
              let eloccoord = {
                lat: elocsplit[0],
                lng: elocsplit[1]
              };
              this.rideinfo.end_coords = eloccoord;
              console.log(this.rideinfo);
              this.loader.dismiss();
              // let ld = this.loader.create({
              //   message: "Fetching Current Loction",
              //   duration: 2000
              // });
              this.carrate = data.price_value;
              (await ld).present().then(async () => {
                this.geolocation.getCurrentPosition().then((resp) => {
                  this.latitude = Number(resp.coords.latitude);
                  this.longitude = Number(resp.coords.longitude);
                  this.loadMap();
                });
              });
            }
          )
        })

      });

      this.myinterval = setInterval(() => {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = Number(resp.coords.latitude);
          this.longitude = Number(resp.coords.longitude);
          console.log(resp);
          let servicedata = {
            driver_id: this.driverid,
            latitude: resp.coords.latitude,
            longitude: resp.coords.longitude
          };
          this.service.SendDriverLocationService(servicedata);
        });
      }, 5000);
    });
  }

  async loadMap() {

    Environment.setEnv({
      API_KEY_FOR_BROWSER_RELEASE: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c",
      API_KEY_FOR_BROWSER_DEBUG: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c"
    });

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 19,
        tilt: 60
      },
      mapType: GoogleMapsMapTypeId.ROADMAP

    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    let icon: MarkerIcon = {
      url: 'https://quickcabtaxiservice.com/storage/app/public/fourwheeler_icon.png',
      size: {
        width: 35,
        height: 40
      }
    };

    let starticon: MarkerIcon = {
      url: 'https://quickcabtaxiservice.com/storage/app/public/start_marker.png',
      size: {
        width: 35,
        height: 40
      }
    };

    let endicon: MarkerIcon = {
      url: 'https://quickcabtaxiservice.com/storage/app/public/end_marker.png',
      size: {
        width: 35,
        height: 40
      }
    };

    this.myinterval2 = setInterval(() => {
      this.map.clear();
      let startmarker: Marker = this.map.addMarkerSync({
        'title': 'Pick Up Point',
        'icon': starticon,
        'animation': 'none',
        'position': this.rideinfo.start_coords
      });

      let marker: Marker = this.map.addMarkerSync({
        'title': 'You Are Here',
        'icon': icon,
        'animation': 'none',
        'position': {
          'lat': this.latitude,
          'lng': this.longitude
        }
      });
      this.map.animateCamera({
        target: { lat: this.latitude, lng: this.longitude },
        zoom: 19,
        tilt: 60
      })
      let currentlocation = this.latitude.toString() + "," + this.longitude.toString();

      let dirservice2 = new google.maps.DirectionsService;
      dirservice2.route({
        origin: this.rideinfo.trip_end_location,
        destination: this.rideinfo.trip_start_location,
        travelMode: 'DRIVING'
      }, (resp, status) => {
        let steps = resp.routes[0].legs[0].steps;
        let paths = [];
        for (let i = 0; i < steps.length; i++) {
          let pathlat = steps[i].path[0].lat();
          let pathlng = steps[i].path[0].lng();
          let pathcoord = { lat: pathlat, lng: pathlng };
          paths.push(pathcoord);
        }
        let polylineoptions = {
          points: paths,
          color: '#333',
          width: 5
        };
        this.map.addPolyline(polylineoptions);
      });

    }, 10000);

  }
  checkotp() {
    let otpvalue = (<HTMLInputElement>document.getElementById('ride_otp')).value;
    if (otpvalue.length < 4 || otpvalue == "") {
      document.getElementById('ride_otp').style.backgroundColor = "#f9b6ac";
    }
    else {
      document.getElementById('ride_otp').style.backgroundColor = "#ffffff";
    }
  }


  async paymentdone() {
    let servicedata = {
      driver_id: this.driverid,
      payment_complete: "Paid"
    }
    console.log(servicedata);

    let ld = this.loader.create({
      message: 'Completing Trip......'
    });
    (await ld).present().then(() => {
      this.service.CustomerPaymentCompleteService(servicedata).subscribe(
        async data => {
          if (!!data && data.success == true) {
            this.loader.dismiss();
           this.route.navigate(['/pages/home']).then(() => {
              window.location.reload();
            })

            //this.route.navigate(['/pages/home']);
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "Cannot Complete Trip. Server Error. Contact Admin!",
              duration: 2500
            });
            (await tm).present();
          }
        }
      )
    });
  }

  async refreshpage() {
    let ld = this.loader.create({
      message: 'Refreshing......',
      duration: 2000
    });
    (await ld).present().then(() => {
      window.location.reload();
    })

  }

  async gotohomepage() {
    let ld = this.loader.create({
      message: 'Loading......',
      duration: 2000
    });
    (await ld).present().then(() => {
     this.route.navigate(['/pages/home']).then(() => {
        window.location.reload();
      })
      //this.route.navigate(['/pages/home']);
    })
  }

  openec() {
    document.getElementById("emercont").style.display = 'block';
  }
  closeec() {
    document.getElementById("emercont").style.display = 'none';
  }

  callnumber(numb) {
    this.call.callNumber(numb, true);
  }

}
