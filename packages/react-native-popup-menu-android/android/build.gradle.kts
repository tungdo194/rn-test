plugins {
  id("com.facebook.react")
  alias(libs.plugins.android.library)
  alias(libs.plugins.kotlin.android)
}


android {
  compileSdk = libs.versions.compileSdk.get().toInt()
  buildToolsVersion = libs.versions.buildTools.get()
  namespace = "com.facebook.react.popupmenu"

  defaultConfig {
    minSdk = libs.versions.minSdk.get().toInt()
    targetSdk = libs.versions.targetSdk.get().toInt()
  }
}

dependencies {
  // Build React Native from source
  implementation(project(":packages:react-native:ReactAndroid"))
}