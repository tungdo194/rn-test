/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import <RCTTest/RCTTestRunner.h>

#define RCT_TEST(name)                  \
- (void)test##name                      \
{                                       \
  [_runner runTest:_cmd module:@#name]; \
}

#define RCT_TEST_ONLY_WITH_PACKAGER(name) \
- (void)test##name                        \
{                                         \
  if (getenv("CI_USE_PACKAGER")) {        \
    [_runner runTest:_cmd module:@#name]; \
  }                                       \
}

@interface RNTesterIntegrationTests : XCTestCase

@end

@implementation RNTesterIntegrationTests
{
  RCTTestRunner *_runner;
}

- (void)setUp
{
  _runner = RCTInitRunnerForApp(@"IntegrationTests/IntegrationTestsApp", nil, nil);
  _runner.recordMode = NO;
}

#pragma mark - Test harness

- (void)testTheTester_waitOneFrame
{
  [_runner runTest:_cmd
            module:@"IntegrationTestHarnessTest"
      initialProps:@{@"waitOneFrame": @YES}
configurationBlock:nil];
}

- (void)testTheTester_ExpectError
{
  [_runner runTest:_cmd
            module:@"IntegrationTestHarnessTest"
      initialProps:@{@"shouldThrow": @YES}
configurationBlock:nil
  expectErrorRegex:@"because shouldThrow"];
}

#pragma mark - JS tests

// This list should be kept in sync with IntegrationTestsApp.js
RCT_TEST(IntegrationTestHarnessTest)
RCT_TEST(TimersTest)
RCT_TEST(AsyncStorageTest)
RCT_TEST(AppEventsTest)
RCT_TEST(ImageCachePolicyTest)
RCT_TEST(ImageSnapshotTest)
//RCT_TEST(LayoutEventsTest) // Disabled due to flakiness: #8686784
RCT_TEST(SimpleSnapshotTest)
RCT_TEST(SyncMethodTest)
RCT_TEST(PromiseTest)
RCT_TEST_ONLY_WITH_PACKAGER(WebSocketTest)
RCT_TEST(AccessibilityManagerTest)

#if !TARGET_OS_TV // tvOS does not fully support WebView
RCT_TEST(WebViewTest)
#endif

@end
