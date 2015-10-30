/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.facebook.react.uimanager;

import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.LifecycleEventListener;

//

/**
 * Wraps {@link ReactContext} with the base {@link Context} passed into the constructor.
 * It provides also a way to start activities using the viewContext to which RN native views belong.
 * It delegates lifecycle listener registration to the original instance of {@link ReactContext}
 * which is supposed to receive the lifecycle events. At the same time we disallow receiving
 * lifecycle events for this wrapper instances.
 * TODO: T7538544 Rename ThemedReactContext to be in alignment with name of ReactApplicationContext
 */
public class ThemedReactContext extends ReactContext {

  private final ReactApplicationContext mReactApplicationContext;

  public ThemedReactContext(ReactApplicationContext reactApplicationContext, Context base) {
    super(base);
    initializeTypefaceProvider(reactApplicationContext.getTypefaceProvider());
    initializeWithInstance(reactApplicationContext.getCatalystInstance());
    mReactApplicationContext = reactApplicationContext;
  }

  @Override
  public void addLifecycleEventListener(LifecycleEventListener listener) {
    mReactApplicationContext.addLifecycleEventListener(listener);
  }

  @Override
  public void removeLifecycleEventListener(LifecycleEventListener listener) {
    mReactApplicationContext.removeLifecycleEventListener(listener);
  }
}
