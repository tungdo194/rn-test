/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "RCTShadowView+Layout.h"

#import <yoga/Yoga.h>

#import "RCTAssert.h"

@implementation RCTShadowView (Layout)

#pragma mark - Computed Layout-Inferred Metrics

- (UIEdgeInsets)paddingAsInsets
{
  YGNodeRef yogaNode = self.yogaNode;
  return (UIEdgeInsets){
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetPadding(yogaNode, YGEdgeTop)),
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetPadding(yogaNode, YGEdgeLeft)),
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetPadding(yogaNode, YGEdgeBottom)),
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetPadding(yogaNode, YGEdgeRight))
  };
}

- (UIEdgeInsets)borderAsInsets
{
  YGNodeRef yogaNode = self.yogaNode;
  return (UIEdgeInsets){
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetBorder(yogaNode, YGEdgeTop)),
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetBorder(yogaNode, YGEdgeLeft)),
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetBorder(yogaNode, YGEdgeBottom)),
    RCTCoreGraphicsFloatFromYogaFloat(YGNodeLayoutGetBorder(yogaNode, YGEdgeRight))
  };
}

- (UIEdgeInsets)compoundInsets
{
  UIEdgeInsets borderAsInsets = self.borderAsInsets;
  UIEdgeInsets paddingAsInsets = self.paddingAsInsets;

  return (UIEdgeInsets){
    borderAsInsets.top + paddingAsInsets.top,
    borderAsInsets.left + paddingAsInsets.left,
    borderAsInsets.bottom + paddingAsInsets.bottom,
    borderAsInsets.right + paddingAsInsets.right
  };
}

- (CGSize)availableSize
{
  return self.layoutMetrics.contentFrame.size;
}

- (CGRect)contentFrame
{
  return self.layoutMetrics.contentFrame;
}

#pragma mark - Dirty Propagation Control

- (void)dirtyLayout
{
  // The default implementaion does nothing.
}

- (void)clearLayout
{
  // The default implementaion does nothing.
}

@end
