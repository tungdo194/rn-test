/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<88c0826e60600020600553978bc26e87>>
 */

/**
 * IMPORTANT: Do NOT modify this file directly.
 *
 * To change the definition of the flags, edit
 *   packages/react-native/scripts/featureflags/ReactNativeFeatureFlags.config.js.
 *
 * To regenerate this code, run the following script from the repo root:
 *   yarn featureflags-update
 */

#include "NativeReactNativeFeatureFlags.h"
#include <react/featureflags/ReactNativeFeatureFlags.h>

#ifdef RN_DISABLE_OSS_PLUGIN_HEADER
#include "Plugins.h"
#endif

std::shared_ptr<facebook::react::TurboModule>
NativeReactNativeFeatureFlagsModuleProvider(
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
  return std::make_shared<facebook::react::NativeReactNativeFeatureFlags>(
      std::move(jsInvoker));
}

namespace facebook::react {

NativeReactNativeFeatureFlags::NativeReactNativeFeatureFlags(
    std::shared_ptr<CallInvoker> jsInvoker)
    : NativeReactNativeFeatureFlagsCxxSpec(std::move(jsInvoker)) {}

bool NativeReactNativeFeatureFlags::commonTestFlag(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::commonTestFlag();
}

bool NativeReactNativeFeatureFlags::allowCollapsableChildren(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::allowCollapsableChildren();
}

bool NativeReactNativeFeatureFlags::batchRenderingUpdatesInEventLoop(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::batchRenderingUpdatesInEventLoop();
}

bool NativeReactNativeFeatureFlags::enableBackgroundExecutor(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableBackgroundExecutor();
}

bool NativeReactNativeFeatureFlags::enableCleanTextInputYogaNode(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableCleanTextInputYogaNode();
}

bool NativeReactNativeFeatureFlags::enableCustomDrawOrderFabric(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableCustomDrawOrderFabric();
}

bool NativeReactNativeFeatureFlags::enableMicrotasks(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableMicrotasks();
}

bool NativeReactNativeFeatureFlags::enableMountHooksAndroid(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableMountHooksAndroid();
}

bool NativeReactNativeFeatureFlags::enableSpannableBuildingUnification(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableSpannableBuildingUnification();
}

bool NativeReactNativeFeatureFlags::enableSynchronousStateUpdates(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableSynchronousStateUpdates();
}

bool NativeReactNativeFeatureFlags::enableUIConsistency(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::enableUIConsistency();
}

bool NativeReactNativeFeatureFlags::forceBatchingMountItemsOnAndroid(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::forceBatchingMountItemsOnAndroid();
}

bool NativeReactNativeFeatureFlags::inspectorEnableCxxInspectorPackagerConnection(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::inspectorEnableCxxInspectorPackagerConnection();
}

bool NativeReactNativeFeatureFlags::inspectorEnableModernCDPRegistry(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::inspectorEnableModernCDPRegistry();
}

bool NativeReactNativeFeatureFlags::preventDoubleTextMeasure(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::preventDoubleTextMeasure();
}

bool NativeReactNativeFeatureFlags::useModernRuntimeScheduler(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::useModernRuntimeScheduler();
}

bool NativeReactNativeFeatureFlags::useNativeViewConfigsInBridgelessMode(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::useNativeViewConfigsInBridgelessMode();
}

bool NativeReactNativeFeatureFlags::useStateAlignmentMechanism(
    jsi::Runtime& /*runtime*/) {
  return ReactNativeFeatureFlags::useStateAlignmentMechanism();
}

} // namespace facebook::react
