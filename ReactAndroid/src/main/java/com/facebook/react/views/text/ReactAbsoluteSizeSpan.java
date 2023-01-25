/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.views.text;

import android.text.TextPaint;
import android.text.style.AbsoluteSizeSpan;
import android.util.Log;

/*
 * Wraps {@link AbsoluteSizeSpan} as a {@link ReactSpan}.
 */
public class ReactAbsoluteSizeSpan extends AbsoluteSizeSpan implements ReactSpan {
  private static final String TAG = "ReactAbsoluteSizeSpan";
  private String mTextAlignVertical = "center-child";
  private int mHighestLineHeight = 0;
  private int mHighestFontSize = 0;

  public ReactAbsoluteSizeSpan(int size) {
    super(size);
  }

  public ReactAbsoluteSizeSpan(int size, String textAlignVertical) {
    this(size);
    mTextAlignVertical = textAlignVertical;
  }

  public String getTextAlignVertical() {
    return mTextAlignVertical;
  }

  @Override
  public void updateDrawState(TextPaint ds) {
    super.updateDrawState(ds);
    String methodName = "updateDrawState";
    Log.w("-----------------------------------------", "");
    Log.w("updateDrawState is called!!! ----------------------", "");
    Log.w("-----------------------------------------", "");
    if (mTextAlignVertical == "center-child") {
      return;
    }
    if (mHighestLineHeight == 0) {
      // align the text by font metrics
      // https://stackoverflow.com/a/27631737/7295772
      if (mTextAlignVertical == "top-child") {
        ds.baselineShift += ds.getFontMetrics().top - ds.ascent() - ds.descent();
        Log.w(
            "ReactTest::",
            methodName
                + " ds.baselineShift: "
                + (ds.baselineShift)
                + " ds.getFontMetrics().top: "
                + (ds.getFontMetrics().top)
                + " ds.getFontMetrics().bottom: "
                + (ds.getFontMetrics().bottom)
                + " ds.ascent(): "
                + (ds.ascent())
                + " ds.descent(): "
                + (ds.descent()));
      }
      if (mTextAlignVertical == "bottom-child") {
        ds.baselineShift += ds.getFontMetrics().bottom - ds.descent();
        Log.w(
            "ReactTest::",
            methodName
                + " ds.baselineShift: "
                + (ds.baselineShift)
                + " ds.getFontMetrics().top: "
                + (ds.getFontMetrics().top)
                + " ds.getFontMetrics().bottom: "
                + (ds.getFontMetrics().bottom)
                + " ds.ascent(): "
                + (ds.ascent())
                + " ds.descent(): "
                + (ds.descent()));
      }
    } else {
      if (mHighestFontSize == getSize()) {
        // aligns text vertically in the lineHeight
        if (mTextAlignVertical == "top-child") {
          ds.baselineShift -= mHighestLineHeight / 2 - getSize() / 2;
          Log.w(
              "ReactTest::",
              methodName
                  + " ds.baselineShift: "
                  + (ds.baselineShift)
                  + " ds.getFontMetrics().top: "
                  + (ds.getFontMetrics().top)
                  + " ds.getFontMetrics().bottom: "
                  + (ds.getFontMetrics().bottom)
                  + " ds.ascent(): "
                  + (ds.ascent())
                  + " ds.descent(): "
                  + (ds.descent()));
        }
        if (mTextAlignVertical == "bottom-child") {
          ds.baselineShift += mHighestLineHeight / 2 - getSize() / 2 - ds.descent();
          Log.w(
              "ReactTest::",
              methodName
                  + " ds.baselineShift: "
                  + (ds.baselineShift)
                  + " ds.getFontMetrics().top: "
                  + (ds.getFontMetrics().top)
                  + " ds.getFontMetrics().bottom: "
                  + (ds.getFontMetrics().bottom)
                  + " ds.ascent(): "
                  + (ds.ascent())
                  + " ds.descent(): "
                  + (ds.descent()));
        }
      } else if (mHighestFontSize != 0) {
        // align correctly text that has smaller font
        if (mTextAlignVertical == "top-child") {
          ds.baselineShift -=
              mHighestLineHeight / 2
                  - mHighestFontSize / 2
                  + (mHighestFontSize - getSize())
                  + (ds.getFontMetrics().top - ds.getFontMetrics().ascent);
          Log.w(
              "ReactTest::",
              methodName
                  + " ds.baselineShift: "
                  + (ds.baselineShift)
                  + " ds.getFontMetrics().top: "
                  + (ds.getFontMetrics().top)
                  + " ds.getFontMetrics().bottom: "
                  + (ds.getFontMetrics().bottom)
                  + " ds.ascent(): "
                  + (ds.ascent())
                  + " ds.descent(): "
                  + (ds.descent()));
        }
        if (mTextAlignVertical == "bottom-child") {
          ds.baselineShift += mHighestLineHeight / 2 - mHighestFontSize / 2 - ds.descent();
          Log.w(
              "ReactTest::",
              methodName
                  + " ds.baselineShift: "
                  + (ds.baselineShift)
                  + " ds.getFontMetrics().top: "
                  + (ds.getFontMetrics().top)
                  + " ds.getFontMetrics().bottom: "
                  + (ds.getFontMetrics().bottom)
                  + " ds.ascent(): "
                  + (ds.ascent())
                  + " ds.descent(): "
                  + (ds.descent()));
        }
      }
    }
  }

  public void updateSpan(int highestLineHeight, int highestFontSize) {
    mHighestLineHeight = highestLineHeight;
    mHighestFontSize = highestFontSize;
  }
}
