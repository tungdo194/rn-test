/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule pointsDiffer
 * @flow
 */
'use strict';

type Point = {
  x: ?number,
  y: ?number,
}

var dummyPoint = {x: undefined, y: undefined};

var pointsDiffer = function(one: ?Point, two: ?Point): bool {
  var ptOne = one || dummyPoint;
  var ptTwo = two || dummyPoint;
  return ptOne !== ptTwo && (
    ptOne.x !== ptTwo.x ||
    ptOne.y !== ptTwo.y
  );
};

module.exports = pointsDiffer;
