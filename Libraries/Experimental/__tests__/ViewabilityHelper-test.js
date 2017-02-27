/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
'use strict';

jest.unmock('ViewabilityHelper');
const ViewabilityHelper = require('ViewabilityHelper');

let rowFrames;
let data;
function getFrameMetrics(index: number) {
  const frame = rowFrames[data[index].key];
  return {length: frame.height, offset: frame.y};
}
function createViewable(index: number, isViewable: boolean) {
  return {key: data[index].key, isViewable};
}

describe('computeViewableItems', function() {
  it('returns all 4 entirely visible rows as viewable', function() {
    const helper = new ViewabilityHelper({viewAreaCoveragePercentThreshold: 50});
    rowFrames = {
      a: {y: 0, height: 50},
      b: {y: 50, height: 50},
      c: {y: 100, height: 50},
      d: {y: 150, height: 50},
    };
    data = [{key: 'a'}, {key: 'b'}, {key: 'c'}, {key: 'd'}];
    expect(helper.computeViewableItems(data.length, 0, 200, getFrameMetrics))
      .toEqual([0, 1, 2, 3]);
  });

  it(
    'returns top 2 rows as viewable (1. entirely visible and 2. majority)',
    function() {
      const helper = new ViewabilityHelper({viewAreaCoveragePercentThreshold: 50});
      rowFrames = {
        a: {y: 0, height: 50},
        b: {y: 50, height: 150},
        c: {y: 200, height: 50},
        d: {y: 250, height: 50},
      };
      data = [{key: 'a'}, {key: 'b'}, {key: 'c'}, {key: 'd'}];
      expect(helper.computeViewableItems(data.length, 0, 200, getFrameMetrics))
        .toEqual([0, 1]);
  });

  it(
    'returns only 2nd row as viewable (majority)',
    function() {
      const helper = new ViewabilityHelper({viewAreaCoveragePercentThreshold: 50});
      rowFrames = {
        a: {y: 0, height: 50},
        b: {y: 50, height: 150},
        c: {y: 200, height: 50},
        d: {y: 250, height: 50},
      };
      data = [{key: 'a'}, {key: 'b'}, {key: 'c'}, {key: 'd'}];
      expect(helper.computeViewableItems(data.length, 25, 200, getFrameMetrics))
        .toEqual([1]);
  });

  it(
    'handles empty input',
    function() {
      const helper = new ViewabilityHelper({viewAreaCoveragePercentThreshold: 50});
      rowFrames = {};
      data = [];
      expect(helper.computeViewableItems(data.length, 0, 200, getFrameMetrics))
        .toEqual([]);
  });

  it(
    'handles different view area coverage percent thresholds',
    function() {
      rowFrames = {
        a: {y: 0, height: 50},
        b: {y: 50, height: 150},
        c: {y: 200, height: 500},
        d: {y: 700, height: 50},
      };
      data = [{key: 'a'}, {key: 'b'}, {key: 'c'}, {key: 'd'}];

      let helper = new ViewabilityHelper({viewAreaCoveragePercentThreshold: 0});
      expect(helper.computeViewableItems(data.length, 0, 50, getFrameMetrics))
        .toEqual([0]);
      expect(helper.computeViewableItems(data.length, 1, 50, getFrameMetrics))
        .toEqual([0, 1]);
      expect(helper.computeViewableItems(data.length, 199, 50, getFrameMetrics))
        .toEqual([1, 2]);
      expect(helper.computeViewableItems(data.length, 250, 50, getFrameMetrics))
        .toEqual([2]);

      helper = new ViewabilityHelper({viewAreaCoveragePercentThreshold: 100});
      expect(helper.computeViewableItems(data.length, 0, 200, getFrameMetrics))
        .toEqual([0, 1]);
      expect(helper.computeViewableItems(data.length, 1, 200, getFrameMetrics))
        .toEqual([1]);
      expect(helper.computeViewableItems(data.length, 400, 200, getFrameMetrics))
        .toEqual([2]);
      expect(helper.computeViewableItems(data.length, 600, 200, getFrameMetrics))
        .toEqual([3]);
  });

  it(
    'handles different item visible percent thresholds',
    function() {
      rowFrames = {
        a: {y: 0, height: 50},
        b: {y: 50, height: 150},
        c: {y: 200, height: 50},
        d: {y: 250, height: 50},
      };
      data = [{key: 'a'}, {key: 'b'}, {key: 'c'}, {key: 'd'}];
      let helper = new ViewabilityHelper({itemVisiblePercentThreashold: 0});
      expect(helper.computeViewableItems(data.length, 0, 50, getFrameMetrics))
        .toEqual([0]);
      expect(helper.computeViewableItems(data.length, 1, 50, getFrameMetrics))
        .toEqual([0, 1]);
      helper = new ViewabilityHelper({itemVisiblePercentThreashold: 100});
      expect(helper.computeViewableItems(data.length, 0, 250, getFrameMetrics))
        .toEqual([0, 1, 2]);
      expect(helper.computeViewableItems(data.length, 1, 250, getFrameMetrics))
        .toEqual([1, 2]);
  });
});

describe('onUpdate', function() {
  it(
    'returns 1 visible row as viewable then scrolls away',
    function() {
      const helper = new ViewabilityHelper();
      rowFrames = {
        a: {y: 0, height: 50},
      };
      data = [{key: 'a'}];
      const onViewableItemsChanged = jest.fn();
      helper.onUpdate(
        data.length,
        0,
        200,
        getFrameMetrics,
        createViewable,
        onViewableItemsChanged,
      );
      expect(onViewableItemsChanged.mock.calls.length).toBe(1);
      expect(onViewableItemsChanged.mock.calls[0][0]).toEqual({
        changed: [{isViewable: true, key: 'a'}],
        viewableItems: [{isViewable: true, key: 'a'}],
      });
      helper.onUpdate(
        data.length,
        0,
        200,
        getFrameMetrics,
        createViewable,
        onViewableItemsChanged,
      );
      expect(onViewableItemsChanged.mock.calls.length).toBe(1); // nothing changed!
      helper.onUpdate(
        data.length,
        100,
        200,
        getFrameMetrics,
        createViewable,
        onViewableItemsChanged,
      );
      expect(onViewableItemsChanged.mock.calls.length).toBe(2);
      expect(onViewableItemsChanged.mock.calls[1][0]).toEqual({
        changed: [{isViewable: false, key: 'a'}],
        viewableItems: [],
      });
    },
  );

  it(
    'returns 1st visible row then 1st and 2nd then just 2nd',
    function() {
      const helper = new ViewabilityHelper();
      rowFrames = {
        a: {y: 0, height: 200},
        b: {y: 200, height: 200},
      };
      data = [{key: 'a'}, {key: 'b'}];
      const onViewableItemsChanged = jest.fn();
      helper.onUpdate(
        data.length,
        0,
        200,
        getFrameMetrics,
        createViewable,
        onViewableItemsChanged,
      );
      expect(onViewableItemsChanged.mock.calls.length).toBe(1);
      expect(onViewableItemsChanged.mock.calls[0][0]).toEqual({
        changed: [{isViewable: true, key: 'a'}],
        viewableItems: [{isViewable: true, key: 'a'}],
      });
      helper.onUpdate(
        data.length,
        100,
        200,
        getFrameMetrics,
        createViewable,
        onViewableItemsChanged,
      );
      expect(onViewableItemsChanged.mock.calls.length).toBe(2);
      // Both visible with 100px overlap each
      expect(onViewableItemsChanged.mock.calls[1][0]).toEqual({
        changed: [{isViewable: true, key: 'b'}],
        viewableItems: [{isViewable: true, key: 'a'}, {isViewable: true, key: 'b'}],
      });
      helper.onUpdate(
        data.length,
        200,
        200,
        getFrameMetrics,
        createViewable,
        onViewableItemsChanged,
      );
      expect(onViewableItemsChanged.mock.calls.length).toBe(3);
      expect(onViewableItemsChanged.mock.calls[2][0]).toEqual({
        changed: [{isViewable: false, key: 'a'}],
        viewableItems: [{isViewable: true, key: 'b'}],
      });
    },
  );
});
