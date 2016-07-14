/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.facebook.react.cxxbridge;

import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;

import org.junit.Before;
import org.junit.Rule;
import org.junit.runner.RunWith;
import org.junit.Test;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.rule.PowerMockRule;
import org.robolectric.RobolectricTestRunner;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.times;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.verifyStatic;

@PrepareForTest({UnpackingJSBundleLoader.class})
@PowerMockIgnore({ "org.mockito.*", "org.robolectric.*", "android.*" })
@RunWith(RobolectricTestRunner.class)
public class ContentCheckingUnpackerTest extends UnpackerTestBase {
  @Rule
  public PowerMockRule rule = new PowerMockRule();

  private UnpackingJSBundleLoader.ContentCheckingUnpacker mUnpacker;

  @Before
  public void setUp() throws IOException {
    super.setUp();
    mUnpacker = new UnpackingJSBundleLoader.ContentCheckingUnpacker(
      NAME_IN_APK,
      DESTINATION_NAME);
    mUnpacker.setDestinationDirectory(folder.getRoot());
  }

  @Test
  public void testReconstructsIfFileDoesNotExist() throws IOException {
    assertTrue(mUnpacker.shouldReconstructDir(mContext, mIOBuffer));
  }

  @Test
  public void testReconstructsIfContentDoesNotMatch() throws IOException {
    try (FileOutputStream fos = new FileOutputStream(mDestinationPath)) {
      fos.write(ASSET_DATA, 0, ASSET_DATA.length - 1);
      fos.write((byte) (ASSET_DATA[ASSET_DATA.length - 1] + 1));
    }
    assertTrue(mUnpacker.shouldReconstructDir(mContext, mIOBuffer));
  }

  @Test
  public void testDoesNotReconstructIfContentMatches() throws IOException {
    try (FileOutputStream fos = new FileOutputStream(mDestinationPath)) {
      fos.write(ASSET_DATA);
    }
    assertFalse(mUnpacker.shouldReconstructDir(mContext, mIOBuffer));
  }

  @Test
  public void testUnpacksFile() throws IOException {
    mUnpacker.unpack(mContext, mIOBuffer);
    assertTrue(mDestinationPath.exists());
    try (InputStream is = new FileInputStream(mDestinationPath)) {
      byte[] storedData = UnpackingJSBundleLoader.readBytes(is, mIOBuffer, Integer.MAX_VALUE);
      assertArrayEquals(ASSET_DATA, storedData);
    }
  }
}
