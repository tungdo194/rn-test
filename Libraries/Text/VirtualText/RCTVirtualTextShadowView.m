/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RCTVirtualTextShadowView.h"

#import <React/RCTShadowView+Layout.h>
#if __has_include(<ReactYoga/Yoga.h>)
#import <ReactYoga/Yoga.h>
#else
#import <yoga/Yoga.h>
#endif

#import "RCTRawTextShadowView.h"

@implementation RCTVirtualTextShadowView {
  BOOL _isLayoutDirty;
}

#pragma mark - Layout

- (void)dirtyLayout
{
  [super dirtyLayout];

  if (_isLayoutDirty) {
    return;
  }
  _isLayoutDirty = YES;

  [self.superview dirtyLayout];
}

- (void)clearLayout
{
  _isLayoutDirty = NO;
}

@end
