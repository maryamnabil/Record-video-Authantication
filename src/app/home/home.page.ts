import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Services } from '../services/services';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mediaRecorder:MediaRecorder| null;
  @ViewChild('video')
  captureElement!: ElementRef;
  isRecording=false;
  finishRecording=false;
  otp="";
  base64="";
  timeleft:number= 10;
  timeleftText="10";
  downloadTimer: string | number | NodeJS.Timeout | undefined;
  buffer:any;
  constructor(private platform:Platform,public loadingController: LoadingController,private services:Services,private router:Router,private androidPermissions: AndroidPermissions) {
this.platform.backButton.subscribeWithPriority(10, () => {
    console.log('Handler was called!');
    (navigator as any).app.exitApp();

  });
  }


  ionViewWillEnter(){
    this.isRecording=false;
    this.finishRecording=false;
    this.otp="";
    this.base64="";
    this.playscript()
  }

  async playscript(){
    const stream= await navigator.mediaDevices.getUserMedia({
      video:{
        facingMode:'user',
      },
      audio:true,
      
    });
    console.log(stream)
    this.captureElement.nativeElement.srcObject=stream;
    this.captureElement.nativeElement.muted = true
    const options={mimeType:'video/webm'};
    this.mediaRecorder= new MediaRecorder(stream,options)
    console.log(this.mediaRecorder)
    this.platform.pause.subscribe(() => {
      //Hello pause
      this.captureElement.nativeElement.pause();
      this.captureElement.nativeElement.src = "";
      stream.getTracks()[0].stop();
      console.log("Vid off");
    });
  }


  async ionViewWillLeave(){
    this.captureElement.nativeElement.pause();
    this.captureElement.nativeElement.src = "";
    this.captureElement.nativeElement.srcObject = null; // <-- Un-set the src property *before* revoking the object URL.
    await (await (navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
      },
      audio: true,
    }))).getTracks()[0].stop();
    console.log("Vid off");
  }
    ngOnInit(){
    this.platform.ready().then(()=>{
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        async result => {console.log('Has permission?',result.hasPermission);
        if(result.hasPermission==false){
          this.androidPermissions.requestPermissions([                    this.androidPermissions.PERMISSION.CAMERA, 
            this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
            this.androidPermissions.PERMISSION.RECORD_AUDIO]).then(
            async (res)=>{
              console.log("start")
              this.playscript();
            }
          )
        }else{
   this.playscript();
        }
  },
        err => {this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)}
      );
      
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);

  
    })

  }

  submitVideo(){
       this.blobToBase64(this.buffer).then(res => {
        this.presentLoading();
          console.log(res); // res is base64 now
          this.services.submitVideo(res).subscribe(
            (res)=>{this.router.navigateByUrl('/success')
          this.loadingController.dismiss()}
          )
        });
  }

  tryAgain(){
    this.isRecording=false;
    this.otp='';
    this.finishRecording=false;
    this.captureElement.nativeElement.src = ''; // <-- Un-set the src property *before* revoking the object URL.
    this.playscript();
    // this.stopRecord();
  }
  recordVideo(){
    this.isRecording=true;
      let chunks=<any>[];
      this.mediaRecorder!.start();
      this.downloadTimer = setInterval(() =>{
        if(this.timeleft == 0){
          this.stopRecord();
          this.finishRecording=true;
        }else{
          this.timeleft -= 1;
          this.timeleftText="0"+this.timeleft;

        }
      }, 1000);
      this.mediaRecorder!.ondataavailable= (event)=>{
        if(event.data && event.data.size!=0){
            chunks.push(event.data);
        }
      }

      this.mediaRecorder!.onstop= async (event)=>{
        this.buffer= new Blob(chunks,{type:'video/webm'})
        console.log(this.buffer)

      }
            this.services.generateOtp().subscribe(
        (res:any)=>{console.log(res);
          this.otp=res.code}
      )
      
  }

  stopRecord(){
    this.mediaRecorder?.stop();
    // this.mediaRecorder=null;
    // this.captureElement.nativeElement.srcObject=null;
    this.isRecording=false;
    clearInterval(this.downloadTimer);
    this.timeleft=10;
    this.timeleftText="10";
    console.log(this.timeleft)
    this.otp='';

  }

   blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'please wait',
    });
    await loading.present();
  }


  playVideo(){ // as blob    
    this.captureElement.nativeElement.srcObject = null; // <-- Un-set the src property *before* revoking the object URL.
    // Preconditions:
    if( !( this.buffer instanceof Blob ) ) throw new Error( '`videoFile` must be a Blob or File object.' ); // The `File` prototype extends the `Blob` prototype, so `instanceof Blob` works for both.
    if( !( this.captureElement.nativeElement instanceof HTMLVideoElement ) ) throw new Error( '`videoEl` must be a <video> element.' );
    
    // 

    const newObjectUrl = URL.createObjectURL(  this.buffer );
        
    // URLs created by `URL.createObjectURL` always use the `blob:` URI scheme: https://w3c.github.io/FileAPI/#dfn-createObjectURL
    const oldObjectUrl = this.captureElement.nativeElement.currentSrc;
    if( oldObjectUrl && oldObjectUrl.startsWith('blob:') ) {
        // It is very important to revoke the previous ObjectURL to prevent memory leaks. Un-set the `src` first.
        // See https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL

        this.captureElement.nativeElement.src = ''; // <-- Un-set the src property *before* revoking the object URL.
        URL.revokeObjectURL( oldObjectUrl );
    }

    // Then set the new URL:
    this.captureElement.nativeElement.src = newObjectUrl;
    this.captureElement.nativeElement.muted=false;

    // And load it:
    this.captureElement.nativeElement.load(); // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/load
   }
}
