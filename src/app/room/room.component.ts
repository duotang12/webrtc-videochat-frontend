import {Component, OnInit} from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {ActivatedRoute} from '@angular/router';
import * as copy from 'copy-to-clipboard';
import {RoomService} from '../services/room.service';

const ICE_SERVERS = [
  {
    urls: [
      'turn:173.194.72.127:19305?transport=udp',
      'turn:[2404:6800:4008:C01::7F]:19305?transport=udp',
      'turn:173.194.72.127:443?transport=tcp',
      'turn:[2404:6800:4008:C01::7F]:443?transport=tcp'
    ],
    username: 'CKjCuLwFEgahxNRjuTAYzc/s6OMT',
    credential: 'u1SQDR/SQsPQIxXNWQT7czc/G4c='
  },
  {urls: ['stun:stun.l.google.com:19302']}
];

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  public peerMediaElements = {};
  public roomIsFull = false;

  private username = prompt('What\'s your name?');
  private localMediaStream = null;
  private peers = {};

  constructor(private socket: Socket,
              private activeRoute: ActivatedRoute,
              private roomService: RoomService) {
  }

  ngOnInit() {
    this.setLocalMedia();

    this.socket.on('disconnect', () => {
      this.handleDisconnect();
    });

    this.socket.on('sessionDescription', (config) => {
      this.handleSessionDescription(config);
    });

    this.socket.on('iceCandidate', (config) => {
      this.handleIceCandidate(config);
    });

    this.socket.on('removePeer', (config) => {
      this.handleRemovePeer(config);
    });

    this.socket.on('roomFull', () => {
      this.roomIsFull = true;
    });

    setTimeout(() => {
      const routeParams = this.activeRoute.snapshot.params;
      this.joinChannel(routeParams.roomId, {username: this.username});

      this.socket.on('addPeer', (config) => {
        this.handleAddPeer(config);
      });
    }, 1000);
  }

  public copyRoomUrlToClipboard() {
    copy(window.location.href);
  }

  public createNewRoom() {
    this.roomService.createRoom(this.localMediaStream, true);
  }

  private handleDisconnect() {
    for (const peerId in this.peerMediaElements) {
      delete this.peerMediaElements[peerId];
    }

    for (const peerId in this.peers) {
      this.peers[peerId].close();
    }

    this.peers = {};
    this.peerMediaElements = {};
  }

  private handleRemovePeer(config) {
    const peerId = config.peerId;
    if (peerId in this.peerMediaElements) {
      delete this.peerMediaElements[peerId];
    }
    if (peerId in this.peers) {
      this.peers[peerId].close();
    }

    delete this.peers[peerId];
    delete this.peerMediaElements[peerId];
  }

  private handleAddPeer(config) {
    const peerId = config.peerId;

    if (peerId in this.peers) {
      return;
    }

    const peer = new RTCPeerConnection({iceServers: ICE_SERVERS});

    this.peers[peerId] = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('relayCandidate', {
          'peerId': peerId,
          'iceCandidate': {
            'sdpMLineIndex': event.candidate.sdpMLineIndex,
            'candidate': event.candidate.candidate
          }
        });
      }
    };

    peer.ontrack = (event) => {
      this.peerMediaElements[peerId] = event.streams[0];
    };

    this.localMediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, this.localMediaStream);
    });

    if (config.should_create_offer) {
      this.createOffer(peer, peerId);
    }
  }

  private createOffer(peer, peerId) {
    peer.createOffer()
      .then((data) => {
        this.setLocalDescription(peer, peerId, data);
      })
      .catch((error) => {
        console.error('createOfferError', error);
      });
  }

  private handleSessionDescription(config) {
    const peerId = config.peerId;
    const peer = this.peers[peerId];
    const remoteDescription = config.sessionDescription;

    this.setRemoteDescription(peer, peerId, remoteDescription);
  }

  private setRemoteDescription(peer, peerId, remoteDescription) {
    const description = new RTCSessionDescription(remoteDescription);
    peer.setRemoteDescription(description)
      .then(() => {
        if (remoteDescription.type == 'offer') {
          this.createAnswer(peer, peerId);
        }
      })
      .catch((error) => {
        console.error('setRemoteDescription error: ', error);
      });
  }

  private handleIceCandidate(config) {
    const peer = this.peers[config.peerId];
    const iceCandidate = config.iceCandidate;
    peer.addIceCandidate(new RTCIceCandidate(iceCandidate));
  }

  private createAnswer(peer, peerId) {
    peer.createAnswer()
      .then((localDescription) => {
        this.setLocalDescription(peer, peerId, localDescription);
      })
      .catch((error) => {
        console.error('Error creating answer: ', error);
      });
  }

  private setLocalDescription(peer, peerId, localDescription: RTCSessionDescriptionInit) {
    peer.setLocalDescription(localDescription)
      .then(() => {
        this.socket.emit('relaySessionDescription',
          {'peerId': peerId, 'sessionDescription': localDescription});
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private setLocalMedia() {
    if (!this.localMediaStream) {
      this.getUserMedia();
    }
  }

  private joinChannel(channel: string, userdata: any) {
    this.socket.emit('join', {'channel': channel, 'userdata': userdata});
  }

  private getUserMedia() {
    navigator.getUserMedia(
      {video: {width: 300, height: 200}, audio: true},
      stream => {
        this.localMediaStream = stream;
        const localVideo: any = document.getElementById('local-video');
        localVideo.srcObject = stream;
      },
      error => {
        console.warn(error.message);
      }
    );
  }
}
