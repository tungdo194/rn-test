/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eb6c58a3c51462acac144a4b89f8fe7b>>
 * @flow strict-local
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

import type {TurboModule} from '../../../../Libraries/TurboModule/RCTExport';

import * as TurboModuleRegistry from '../../../../Libraries/TurboModule/TurboModuleRegistry';

export interface Spec extends TurboModule {
  +commonTestFlag?: () => boolean;
  +allowCollapsableChildren?: () => boolean;
  +batchRenderingUpdatesInEventLoop?: () => boolean;
  +enableBackgroundExecutor?: () => boolean;
  +enableCleanTextInputYogaNode?: () => boolean;
  +enableCustomDrawOrderFabric?: () => boolean;
  +enableMicrotasks?: () => boolean;
  +enableMountHooksAndroid?: () => boolean;
  +enableSpannableBuildingUnification?: () => boolean;
  +enableSynchronousStateUpdates?: () => boolean;
  +enableUIConsistency?: () => boolean;
  +forceBatchingMountItemsOnAndroid?: () => boolean;
  +inspectorEnableCxxInspectorPackagerConnection?: () => boolean;
  +inspectorEnableModernCDPRegistry?: () => boolean;
  +preventDoubleTextMeasure?: () => boolean;
  +useModernRuntimeScheduler?: () => boolean;
  +useNativeViewConfigsInBridgelessMode?: () => boolean;
  +useStateAlignmentMechanism?: () => boolean;
}

const NativeReactNativeFeatureFlags: ?Spec = TurboModuleRegistry.get<Spec>(
  'NativeReactNativeFeatureFlagsCxx',
);

export default NativeReactNativeFeatureFlags;
