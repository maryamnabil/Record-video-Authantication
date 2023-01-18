import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })

  
  export class Services {
    otpurl = "https://exemp.acolabz.com/vlcapi/api/v1.1/loadVerificationCode?certificateid=7214&kyctype=Joint";
    submitVideoUrl="https://exemp.acolabz.com/vlcapi/api/v1.1/savevideo"
  
    constructor(private http: HttpClient) { }
  
    generateOtp() {
      return this.http.get(this.otpurl);
    }

    submitVideo(data: any){
      return this.http.post(this.submitVideoUrl,{
        "data": data,
        "fileName": "999999_VIDEO_01122022.mp4",
        "certid": "7214",
        "kycfor": "Joint"
        })
    }

}