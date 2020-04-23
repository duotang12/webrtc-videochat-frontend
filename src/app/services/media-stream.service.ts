import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaStreamService {
  public getUserMediaStream() {
    navigator.getUserMedia(
      {video: {width: 300, height: 200}, audio: false},
      stream => {
        const localVideo: any = document.getElementById('local-video');
        localVideo.srcObject = stream;
        return stream;
      },
      error => {
        console.warn(error.message);
        return null;
      }
    );
  }
}
