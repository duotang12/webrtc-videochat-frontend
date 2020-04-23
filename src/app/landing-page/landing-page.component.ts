import {Component, OnInit} from '@angular/core';
import {RoomService} from '../services/room.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  public mediaStream;

  constructor(public roomService: RoomService) {
  }

  ngOnInit() {
    this.setUserMedia();
  }

  private setUserMedia(): void {
    navigator.getUserMedia(
      {video: {width: 300, height: 200}, audio: true},
      (mediaStream) => {
        this.mediaStream = mediaStream;
        const videoElement = document.querySelector('video');
        videoElement.srcObject = mediaStream;
      }, (error) => {
        console.error('Error getting user media', error);
      });
  }
}
