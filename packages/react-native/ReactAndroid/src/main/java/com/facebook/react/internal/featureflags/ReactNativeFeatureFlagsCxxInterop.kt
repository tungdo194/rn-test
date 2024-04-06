/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<04eded3bccdd225870f64bdc02cd44bd>>
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

package com.facebook.react.internal.featureflags

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.soloader.SoLoader

@DoNotStrip
public object ReactNativeFeatureFlagsCxxInterop {
  init {
    SoLoader.loadLibrary("react_featureflagsjni")
  }

  @DoNotStrip @JvmStatic public external fun commonTestFlag(): Boolean

  @DoNotStrip @JvmStatic public external fun batchRenderingUpdatesInEventLoop(): Boolean

  @DoNotStrip @JvmStatic public external fun enableBackgroundExecutor(): Boolean

  @DoNotStrip @JvmStatic public external fun enableCustomDrawOrderFabric(): Boolean

  @DoNotStrip @JvmStatic public external fun enableFixForClippedSubviewsCrash(): Boolean

  @DoNotStrip @JvmStatic public external fun enableMicrotasks(): Boolean

  @DoNotStrip @JvmStatic public external fun enableMountHooksAndroid(): Boolean

  @DoNotStrip @JvmStatic public external fun enableSpannableBuildingUnification(): Boolean

  @DoNotStrip @JvmStatic public external fun enableSynchronousStateUpdates(): Boolean

  @DoNotStrip @JvmStatic public external fun enableUIConsistency(): Boolean

  @DoNotStrip @JvmStatic public external fun inspectorEnableCxxInspectorPackagerConnection(): Boolean

  @DoNotStrip @JvmStatic public external fun inspectorEnableModernCDPRegistry(): Boolean

  @DoNotStrip @JvmStatic public external fun preventDoubleTextMeasure(): Boolean

  @DoNotStrip @JvmStatic public external fun useModernRuntimeScheduler(): Boolean

  @DoNotStrip @JvmStatic public external fun useNativeViewConfigsInBridgelessMode(): Boolean

  @DoNotStrip @JvmStatic public external fun override(provider: Any)

  @DoNotStrip @JvmStatic public external fun dangerouslyReset()
}
