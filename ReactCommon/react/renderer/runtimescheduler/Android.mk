# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := react_render_runtimescheduler

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../../

LOCAL_SRC_FILES := $(wildcard $(LOCAL_PATH)/*.cpp)

LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/../../../

LOCAL_SHARED_LIBRARIES := libruntimeexecutor libreact_render_core libreact_debug libjsi callinvoker

LOCAL_CFLAGS := \
  -DLOG_TAG=\"Fabric\"

LOCAL_CFLAGS += -fexceptions -frtti -std=c++17 -Wall

include $(BUILD_SHARED_LIBRARY)

$(call import-module,runtimeexecutor)
$(call import-module,callinvoker)
