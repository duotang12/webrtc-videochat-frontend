import {Component, OnInit} from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {uuid} from 'uuidv4';
import {Router} from '@angular/router';
import {MediaStreamService} from '../services/media-stream.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  mediaStream;

  constructor(private socket: Socket,
              private router: Router,
              private mediaStreamService: MediaStreamService) {
  }

  ngOnInit() {
    this.mediaStream = this.mediaStreamService.getUserMediaStream();
  }

  createRoom() {
    const roomId = uuid();
    this.socket.emit('createRoom', {
      roomId: roomId,
      userStream: this.mediaStream
    });

    this.router.navigate(['room', roomId]);
  }
}
