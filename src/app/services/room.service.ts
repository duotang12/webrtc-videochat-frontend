import {Injectable} from '@angular/core';
import {uuid} from 'uuidv4';
import {Router} from '@angular/router';
import {Socket} from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private router: Router, private socket: Socket) {
  }

  public createRoom(mediaStream, reload = false) {
    const roomId = uuid();
    this.socket.emit('createRoom', {
      roomId: roomId,
      userStream: mediaStream
    });

    this.router.navigate(['room', roomId])
      .then(() => {
        if (reload) {
          location.reload();
        }
      });
  }
}
