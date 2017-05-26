/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule WebSocket
 * @flow
 */
'use strict';

const NativeEventEmitter = require('../EventEmitter/NativeEventEmitter');
const Platform = require('../Utilities/Platform');
const RCTWebSocketModule = require('../BatchedBridge/NativeModules').WebSocketModule;
const WebSocketEvent = require('./WebSocketEvent');
const binaryToBase64 = require('../Utilities/binaryToBase64');

const EventTarget = require('event-target-shim');
const base64 = require('base64-js');

import type EventSubscription from 'EventSubscription';

const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;

const CLOSE_NORMAL = 1000;

const WEBSOCKET_EVENTS = [
  'close',
  'error',
  'message',
  'open',
];

let nextWebSocketId = 0;

/**
 * Browser-compatible WebSockets implementation.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 * See https://github.com/websockets/ws
 */
class WebSocket extends EventTarget(...WEBSOCKET_EVENTS) {
  static CONNECTING = CONNECTING;
  static OPEN = OPEN;
  static CLOSING = CLOSING;
  static CLOSED = CLOSED;

  CONNECTING: number = CONNECTING;
  OPEN: number = OPEN;
  CLOSING: number = CLOSING;
  CLOSED: number = CLOSED;

  _socketId: number;
  _eventEmitter: NativeEventEmitter;
  _subscriptions: Array<EventSubscription>;

  onclose: ?Function;
  onerror: ?Function;
  onmessage: ?Function;
  onopen: ?Function;

  binaryType: ?string;
  bufferedAmount: number;
  extension: ?string;
  protocol: ?string;
  readyState: number = CONNECTING;
  url: ?string;

  constructor(url: string, protocols: ?string | ?Array<string>, options: ?{origin?: string}) {
    super();
    if (typeof protocols === 'string') {
      protocols = [protocols];
    }

    if (!Array.isArray(protocols)) {
      protocols = null;
    }

    this._eventEmitter = new NativeEventEmitter(RCTWebSocketModule);
    this._socketId = nextWebSocketId++;
    this._registerEvents();
    RCTWebSocketModule.connect(url, protocols, options, this._socketId);
  }

  close(code?: number, reason?: string): void {
    if (this.readyState === this.CLOSING ||
        this.readyState === this.CLOSED) {
      return;
    }

    this.readyState = this.CLOSING;
    this._close(code, reason);
  }

  send(data: string | ArrayBuffer | $ArrayBufferView): void {
    if (this.readyState === this.CONNECTING) {
      throw new Error('INVALID_STATE_ERR');
    }

    if (typeof data === 'string') {
      RCTWebSocketModule.send(data, this._socketId);
      return;
    }

    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      RCTWebSocketModule.sendBinary(binaryToBase64(data), this._socketId);
      return;
    }

    throw new Error('Unsupported data type');
  }

  ping(): void {
    if (this.readyState === this.CONNECTING) {
        throw new Error('INVALID_STATE_ERR');
    }

    RCTWebSocketModule.ping(this._socketId);
  }

  _close(code?: number, reason?: string): void {
    if (Platform.OS === 'android') {
      // See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
      const statusCode = typeof code === 'number' ? code : CLOSE_NORMAL;
      const closeReason = typeof reason === 'string' ? reason : '';
      RCTWebSocketModule.close(statusCode, closeReason, this._socketId);
    } else {
      RCTWebSocketModule.close(this._socketId);
    }
  }

  _unregisterEvents(): void {
    this._subscriptions.forEach(e => e.remove());
    this._subscriptions = [];
  }

  _registerEvents(): void {
    this._subscriptions = [
      this._eventEmitter.addListener('websocketMessage', ev => {
        if (ev.id !== this._socketId) {
          return;
        }
        this.dispatchEvent(new WebSocketEvent('message', {
          data: (ev.type === 'binary') ? base64.toByteArray(ev.data).buffer : ev.data
        }));
      }),
      this._eventEmitter.addListener('websocketOpen', ev => {
        if (ev.id !== this._socketId) {
          return;
        }
        this.readyState = this.OPEN;
        this.dispatchEvent(new WebSocketEvent('open'));
      }),
      this._eventEmitter.addListener('websocketClosed', ev => {
        if (ev.id !== this._socketId) {
          return;
        }
        this.readyState = this.CLOSED;
        this.dispatchEvent(new WebSocketEvent('close', {
          code: ev.code,
          reason: ev.reason,
        }));
        this._unregisterEvents();
        this.close();
      }),
      this._eventEmitter.addListener('websocketFailed', ev => {
        if (ev.id !== this._socketId) {
          return;
        }
        this.readyState = this.CLOSED;
        this.dispatchEvent(new WebSocketEvent('error', {
          message: ev.message,
        }));
        this.dispatchEvent(new WebSocketEvent('close', {
          message: ev.message,
        }));
        this._unregisterEvents();
        this.close();
      })
    ];
  }
}

module.exports = WebSocket;
