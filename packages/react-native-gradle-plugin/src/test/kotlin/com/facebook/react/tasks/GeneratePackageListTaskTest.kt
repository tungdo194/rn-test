/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.tasks

import com.facebook.react.model.ModelAutolinkingDependenciesJson
import com.facebook.react.model.ModelAutolinkingDependenciesPlatformAndroidJson
import com.facebook.react.model.ModelAutolinkingDependenciesPlatformJson
import com.facebook.react.tests.createTestTask
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class GeneratePackageListTaskTest {

  @get:Rule val tempFolder = TemporaryFolder()

  @Test
  fun generatePackageListTask_groupIsSetCorrectly() {
    val task = createTestTask<GeneratePackageListTask> {}
    assertEquals("react", task.group)
  }

  @Test
  fun generatePackageListTask_staticInputs_areSetCorrectly() {
    val outputFolder = tempFolder.newFolder("build")
    val inputFile = tempFolder.newFile("config.json")

    val task =
        createTestTask<GeneratePackageListTask> {
          it.generatedOutputDirectory.set(outputFolder)
          it.autolinkInputFile.set(inputFile)
        }

    assertEquals(inputFile, task.inputs.files.singleFile)
    assertEquals(outputFolder, task.outputs.files.singleFile)
  }

  @Test
  fun composePackageImports_withNoPackages_returnsEmpty() {
    val task = createTestTask<GeneratePackageListTask>()
    val packageName = "com.facebook.react"
    val packages = emptyList<ModelAutolinkingDependenciesJson>()
    val result = task.composePackageImports(packageName, packages)
    assertEquals("", result)
  }

  @Test
  fun composePackageImports_withPackages_returnsImportCorrectly() {
    val task = createTestTask<GeneratePackageListTask>()
    val packageName = "com.facebook.react"

    val result = task.composePackageImports(packageName, testDependencies)
    assertEquals(
        """
      // @react-native/a-package
      import com.facebook.react.aPackage;
      // @react-native/another-package
      import com.facebook.react.anotherPackage;
    """
            .trimIndent(),
        result)
  }

  @Test
  fun composePackageInstance_withNoPackages_returnsEmpty() {
    val task = createTestTask<GeneratePackageListTask>()
    val packageName = "com.facebook.react"
    val packages = emptyList<ModelAutolinkingDependenciesJson>()
    val result = task.composePackageInstance(packageName, packages)
    assertEquals("", result)
  }

  @Test
  fun composePackageInstance_withPackages_returnsImportCorrectly() {
    val task = createTestTask<GeneratePackageListTask>()
    val packageName = "com.facebook.react"

    val result = task.composePackageInstance(packageName, testDependencies)
    assertEquals(
        """
      ,
            new APackage(),
            new AnotherPackage()
    """
            .trimIndent(),
        result)
  }

  @Test
  fun interpolateDynamicValues_withNoBuildConfigOrROccurrencies_doesNothing() {
    val packageName = "com.facebook.react"
    val input = "com.facebook.react.aPackage"
    val output = GeneratePackageListTask.interpolateDynamicValues(input, packageName)
    assertEquals(input, output)
  }

  @Test
  fun interpolateDynamicValues_withR_doesQualifyThem() {
    val packageName = "com.facebook.react"
    val input = "new APackageWithR(R.string.value)"
    val output = GeneratePackageListTask.interpolateDynamicValues(input, packageName)
    assertEquals("new APackageWithR(com.facebook.react.R.string.value)", output)
  }

  @Test
  fun interpolateDynamicValues_withBuildConfig_doesQualifyThem() {
    val packageName = "com.facebook.react"
    val input = "new APackageWithBuildConfigInTheName(BuildConfig.VALUE)"
    val output = GeneratePackageListTask.interpolateDynamicValues(input, packageName)
    assertEquals(
        "new APackageWithBuildConfigInTheName(com.facebook.react.BuildConfig.VALUE)", output)
  }

  @Test
  fun composeFileContent_withNoPackages_returnsValidFile() {
    val task = createTestTask<GeneratePackageListTask>()
    val packageName = "com.facebook.react"
    val packages = emptyList<ModelAutolinkingDependenciesJson>()
    val imports = task.composePackageImports(packageName, packages)
    val instance = task.composePackageInstance(packageName, packages)
    val result = task.composeFileContent(imports, instance)
    // language=java
    assertEquals(
        """
    package com.facebook.react;

    import android.app.Application;
    import android.content.Context;
    import android.content.res.Resources;

    import com.facebook.react.ReactPackage;
    import com.facebook.react.shell.MainPackageConfig;
    import com.facebook.react.shell.MainReactPackage;
    import java.util.Arrays;
    import java.util.ArrayList;



    public class PackageList2 {
      private Application application;
      private ReactNativeHost reactNativeHost;
      private MainPackageConfig mConfig;

      public PackageList(ReactNativeHost reactNativeHost) {
        this(reactNativeHost, null);
      }

      public PackageList(Application application) {
        this(application, null);
      }

      public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
        this.reactNativeHost = reactNativeHost;
        mConfig = config;
      }

      public PackageList(Application application, MainPackageConfig config) {
        this.reactNativeHost = null;
        this.application = application;
        mConfig = config;
      }

      private ReactNativeHost getReactNativeHost() {
        return this.reactNativeHost;
      }

      private Resources getResources() {
        return this.getApplication().getResources();
      }

      private Application getApplication() {
        if (this.reactNativeHost == null) return this.application;
        return this.reactNativeHost.getApplication();
      }

      private Context getApplicationContext() {
        return this.getApplication().getApplicationContext();
      }

      public ArrayList<ReactPackage> getPackages() {
        return new ArrayList<>(Arrays.<ReactPackage>asList(
          new MainReactPackage(mConfig)
        ));
      }
    }
    """
            .trimIndent(),
        result)
  }

  @Test
  fun composeFileContent_withPackages_returnsValidFile() {
    val task = createTestTask<GeneratePackageListTask>()
    val packageName = "com.facebook.react"
    val imports = task.composePackageImports(packageName, testDependencies)
    val instance = task.composePackageInstance(packageName, testDependencies)
    val result = task.composeFileContent(imports, instance)
    // language=java
    assertEquals(
        """
    package com.facebook.react;

    import android.app.Application;
    import android.content.Context;
    import android.content.res.Resources;

    import com.facebook.react.ReactPackage;
    import com.facebook.react.shell.MainPackageConfig;
    import com.facebook.react.shell.MainReactPackage;
    import java.util.Arrays;
    import java.util.ArrayList;

    // @react-native/a-package
    import com.facebook.react.aPackage;
    // @react-native/another-package
    import com.facebook.react.anotherPackage;

    public class PackageList2 {
      private Application application;
      private ReactNativeHost reactNativeHost;
      private MainPackageConfig mConfig;

      public PackageList(ReactNativeHost reactNativeHost) {
        this(reactNativeHost, null);
      }

      public PackageList(Application application) {
        this(application, null);
      }

      public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
        this.reactNativeHost = reactNativeHost;
        mConfig = config;
      }

      public PackageList(Application application, MainPackageConfig config) {
        this.reactNativeHost = null;
        this.application = application;
        mConfig = config;
      }

      private ReactNativeHost getReactNativeHost() {
        return this.reactNativeHost;
      }

      private Resources getResources() {
        return this.getApplication().getResources();
      }

      private Application getApplication() {
        if (this.reactNativeHost == null) return this.application;
        return this.reactNativeHost.getApplication();
      }

      private Context getApplicationContext() {
        return this.getApplication().getApplicationContext();
      }

      public ArrayList<ReactPackage> getPackages() {
        return new ArrayList<>(Arrays.<ReactPackage>asList(
          new MainReactPackage(mConfig),
          new APackage(),
          new AnotherPackage()
        ));
      }
    }
    """
            .trimIndent(),
        result)
  }

  private val testDependencies =
      listOf(
          ModelAutolinkingDependenciesJson(
              "root",
              "@react-native/a-package",
              ModelAutolinkingDependenciesPlatformJson(
                  ModelAutolinkingDependenciesPlatformAndroidJson(
                      sourceDir = "./a/directory",
                      packageImportPath = "import com.facebook.react.aPackage;",
                      packageInstance = "new APackage()",
                      buildTypes = emptyList(),
                      libraryName = "aPackage",
                      componentDescriptors = emptyList(),
                      cmakeListsPath = "./a/directory/CMakeLists.txt",
                  ))),
          ModelAutolinkingDependenciesJson(
              "root",
              "@react-native/another-package",
              ModelAutolinkingDependenciesPlatformJson(
                  ModelAutolinkingDependenciesPlatformAndroidJson(
                      sourceDir = "./another/directory",
                      packageImportPath = "import com.facebook.react.anotherPackage;",
                      packageInstance = "new AnotherPackage()",
                      buildTypes = emptyList(),
                      libraryName = "anotherPackage",
                      componentDescriptors = emptyList(),
                      cmakeListsPath = "./another/directory/CMakeLists.txt",
                  ))))
}
