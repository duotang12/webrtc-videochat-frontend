import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';
import {RouterModule, Routes} from '@angular/router';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {RoomComponent} from './room/room.component';

const config: SocketIoConfig = {url: 'http://localhost:8080', options: {}};

const routes: Routes = [
  {path: '', component: LandingPageComponent},
  {path: 'room/:roomId', component: RoomComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    RoomComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    RouterModule.forRoot(routes),
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  entryComponents: [
    AppComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
