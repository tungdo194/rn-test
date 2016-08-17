/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.facebook.react.views.art;

import android.graphics.Bitmap;
import android.view.TextureView;
import android.view.Surface;
import android.graphics.SurfaceTexture;

import com.facebook.csslayout.CSSMeasureMode;
import com.facebook.csslayout.CSSNodeAPI;
import com.facebook.csslayout.MeasureOutput;
import com.facebook.react.uimanager.BaseViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

/**
 * ViewManager for ARTSurfaceView React views. Renders as a {@link ARTSurfaceView} and handles
 * invalidating the native view on shadow view updates happening in the underlying tree.
 */
public class ARTSurfaceViewManager extends
    BaseViewManager<ARTSurfaceView, ARTSurfaceViewShadowNode> implements TextureView.SurfaceTextureListener {

  private ARTSurfaceViewShadowNode mShadowNode;

  private static final String REACT_CLASS = "ARTSurfaceView";

  private static final CSSNodeAPI.MeasureFunction MEASURE_FUNCTION = new CSSNodeAPI.MeasureFunction() {
    @Override
    public void measure(
        CSSNodeAPI node,
        float width,
        CSSMeasureMode widthMode,
        float height,
        CSSMeasureMode heightMode,
        MeasureOutput measureOutput) {
      throw new IllegalStateException("SurfaceView should have explicit width and height set");
    }
  };

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public ARTSurfaceViewShadowNode createShadowNodeInstance() {
    mShadowNode = new ARTSurfaceViewShadowNode();
    mShadowNode.setMeasureFunction(MEASURE_FUNCTION);
    return mShadowNode;
  }

  @Override
  public Class<ARTSurfaceViewShadowNode> getShadowNodeClass() {
    return ARTSurfaceViewShadowNode.class;
  }

  @Override
  protected ARTSurfaceView createViewInstance(ThemedReactContext reactContext) {
    ARTSurfaceView node = new ARTSurfaceView(reactContext);
    node.setSurfaceTextureListener(this);
    return node;
  }

  @Override
  public void updateExtraData(ARTSurfaceView root, Object extraData) {}

  public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
      mShadowNode.setSurface(new Surface(surface));
  }

  public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
      mShadowNode.setSurface(null);
      return true;
  }

  public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {}
  public void onSurfaceTextureUpdated(SurfaceTexture surface) {}
}
