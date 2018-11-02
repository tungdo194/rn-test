//
//  MockInstance.cpp
//  RNTesterUnitTests
//
//  Created by Julio Cesar Rocha on 10/22/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#include "MockInstance.hpp"

#include <cxxreact/JsArgumentHelpers.h>

using namespace facebook::react;

using facebook::xplat::jsArgAsInt;
using std::map;

MockInstance::MockInstance(std::shared_ptr<map<int64_t, int64_t>> sumCache)
: sumCache_{sumCache}
{
}

void MockInstance::loadApplication(std::unique_ptr<RAMBundleRegistry> bundleRegistry,
                     std::unique_ptr<const JSBigString> startupScript,
                     std::string startupScriptSourceURL)
{
}
void MockInstance::loadApplicationSync(std::unique_ptr<RAMBundleRegistry> bundleRegistry,
                         std::unique_ptr<const JSBigString> startupScript,
                         std::string startupScriptSourceURL)
{
}

void MockInstance::initializeBridge(std::unique_ptr<InstanceCallback> callback,
                      std::shared_ptr<JSExecutorFactory> jsef,
                      std::shared_ptr<MessageQueueThread> jsQueue,
                      std::shared_ptr<ModuleRegistry> moduleRegistry)
{
}

void MockInstance::setSourceURL(std::string /*sourceURL*/)
{
}

void MockInstance::loadScriptFromString(std::unique_ptr<const JSBigString> string,
                          std::string sourceURL, bool loadSynchronously)
{
}

void MockInstance::loadRAMBundleFromFile(const std::string& sourcePath,
                           const std::string& sourceURL,
                           bool loadSynchronously)
{
}

void MockInstance::loadRAMBundle(std::unique_ptr<RAMBundleRegistry> bundleRegistry,
                   std::unique_ptr<const JSBigString> startupScript,
                   std::string startupScriptSourceURL, bool loadSynchronously)
{
}

void MockInstance::setGlobalVariable(std::string propName,
                       std::unique_ptr<const JSBigString> jsonValue)
{
}

void *MockInstance::getJavaScriptContext()
{
  return nullptr;
}

bool MockInstance::isInspectable()
{
  return false;
}

void MockInstance::callJSFunction(std::string &&module, std::string &&method,
                    folly::dynamic &&params)
{
  sumCache_->insert({jsArgAsInt(params, 0), jsArgAsInt(params, 1)});
}

void MockInstance::callJSCallback(uint64_t callbackId, folly::dynamic &&params)
{
}

// This method is experimental, and may be modified or removed.
void MockInstance::registerBundle(uint32_t bundleId, const std::string& bundlePath)
{
}

const ModuleRegistry &MockInstance::getModuleRegistry() const
{
  return *moduleRegistry_;
}

ModuleRegistry &MockInstance::getModuleRegistry()
{
  return *moduleRegistry_;
}

void MockInstance::handleMemoryPressure(int pressureLevel)
{
}
