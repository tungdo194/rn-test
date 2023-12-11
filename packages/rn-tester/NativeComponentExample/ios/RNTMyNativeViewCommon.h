/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>
#import <string>

NS_ASSUME_NONNULL_BEGIN

@interface RNTMyNativeViewCommon : NSObject

+ (void)setBackgroundColor:(UIView *)view colorString:(NSString *)colorString;
+ (void)addOverlays:(UIView *)view overlayColors:(const NSArray *)overlayColors;
+ (void)removeOverlays:(UIView *)view;
+ (UIColor *)UIColorFromHexString:(const std::string)hexString;

@end

NS_ASSUME_NONNULL_END
