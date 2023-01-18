import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,HttpClientModule,IonicModule.forRoot(), AppRoutingModule],
  providers: [AndroidPermissions,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy ,}],
  bootstrap: [AppComponent],
})
export class AppModule {}
