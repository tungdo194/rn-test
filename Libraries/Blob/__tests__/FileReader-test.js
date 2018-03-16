/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+react_native
 */
'use strict';

jest.unmock('event-target-shim').setMock('NativeModules', {
  BlobModule: require('../__mocks__/BlobModule'),
  FileReaderModule: require('../__mocks__/FileReaderModule'),
});

var Blob = require('Blob');
var FileReader = require('FileReader');

describe('FileReader', function() {
  it('should read blob as text', async () => {
    const e = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = resolve;
      reader.onerror = reject;
      reader.readAsText(new Blob());
    });
    expect(e.target.result).toBe('');
  });

  it('should read blob as data URL', async () => {
    const e = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = resolve;
      reader.onerror = reject;
      reader.readAsDataURL(new Blob());
    });
    expect(e.target.result).toBe('data:text/plain;base64,NDI=');
  });
});
