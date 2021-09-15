/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This file was pulled from the facebook/rebound repository.

package com.facebook.react.modules.core;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ScheduledExecutorService;
import android.os.Handler;
import android.view.Choreographer;
import com.facebook.react.bridge.UiThreadUtil;

/**
 * Wrapper class for abstracting away availability of the JellyBean Choreographer. If Choreographer
 * is unavailable we fallback to using a normal Handler.
 */
public class ChoreographerCompat {

  private static final long ONE_FRAME_MILLIS = 17;
  private static ChoreographerCompat sInstance;

  private Handler mHandler;
  private Choreographer mChoreographer;
  private ScheduledExecutorService mSerialExecutor = null;

  public void setExecutor(ScheduledExecutorService serialExecutor) {
    mSerialExecutor = serialExecutor;
  }

  public static ChoreographerCompat getInstance() {
    UiThreadUtil.assertOnUiThread();
    if (sInstance == null) {
      sInstance = new ChoreographerCompat();
    }
    return sInstance;
  }

  public ChoreographerCompat(ScheduledExecutorService executor) {
    mChoreographer = getChoreographer();
    mSerialExecutor = executor;
  }

  public ChoreographerCompat() {
    this(null);
  }

  public void postFrameCallback(FrameCallback callbackWrapper) {
    choreographerPostFrameCallback(callbackWrapper);
  }

  public void postFrameCallbackDelayed(FrameCallback callbackWrapper, long delayMillis) {
    choreographerPostFrameCallbackDelayed(callbackWrapper, delayMillis);
  }

  public void removeFrameCallback(FrameCallback callbackWrapper) {
    choreographerRemoveFrameCallback(callbackWrapper.getFrameCallback());
  }

  private Choreographer getChoreographer() {
    return Choreographer.getInstance();
  }

  private void choreographerPostFrameCallback(FrameCallback callbackWrapper) {
    if (mSerialExecutor != null) {
      mSerialExecutor.execute(callbackWrapper.getRunnable());
    } else {
      mChoreographer.postFrameCallback(callbackWrapper.getFrameCallback());
    }
  }

  private void choreographerPostFrameCallbackDelayed(
      FrameCallback callbackWrapper, long delayMillis) {
    if (mSerialExecutor != null) {
      mSerialExecutor.schedule(callbackWrapper.getRunnable(), delayMillis, TimeUnit.MILLISECONDS);
    } else {
      mChoreographer.postFrameCallbackDelayed(callbackWrapper.getFrameCallback(), delayMillis);
    }
  }

  private void choreographerRemoveFrameCallback(Choreographer.FrameCallback frameCallback) {
    if (mSerialExecutor != null) {
      // TODO
    } else {
      mChoreographer.removeFrameCallback(frameCallback);
    }
  }

  /**
   * This class provides a compatibility wrapper around the JellyBean FrameCallback with methods to
   * access cached wrappers for submitting a real FrameCallback to a Choreographer or a Runnable to
   * a Handler.
   */
  public abstract static class FrameCallback {

    private Runnable mRunnable;
    private Choreographer.FrameCallback mFrameCallback;
    private 

    Choreographer.FrameCallback getFrameCallback() {
      if (mFrameCallback == null) {
        mFrameCallback =
            new Choreographer.FrameCallback() {
              @Override
              public void doFrame(long frameTimeNanos) {
                FrameCallback.this.doFrame(frameTimeNanos);
              }
            };
      }
      return mFrameCallback;
    }

    Runnable getRunnable() {
      if (mRunnable == null) {
        mRunnable =
            new Runnable() {
              @Override
              public void run() {
                doFrame(System.nanoTime());
              }
            };
      }
      return mRunnable;
    }

    /**
     * Just a wrapper for frame callback, see {@link
     * android.view.Choreographer.FrameCallback#doFrame(long)}.
     */
    public abstract void doFrame(long frameTimeNanos);
  }
}
