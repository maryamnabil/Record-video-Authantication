import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {

  constructor(private platform:Platform,private router:Router) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Handler was called!');
      localStorage.setItem("back","true");
      this.router.navigateByUrl("/home")
  
    });
   }

  ngOnInit() {
  }

  goback(){
    localStorage.setItem("back","true");
    this.router.navigateByUrl("/home")
  }

}
