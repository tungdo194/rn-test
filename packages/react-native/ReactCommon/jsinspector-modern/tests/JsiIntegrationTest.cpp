/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include <folly/Format.h>
#include <folly/dynamic.h>
#include <folly/executors/QueuedImmediateExecutor.h>
#include <folly/json.h>
#include <gmock/gmock.h>
#include <gtest/gtest.h>

#include <jsinspector-modern/HostTarget.h>
#include <jsinspector-modern/InspectorInterfaces.h>

#include <memory>

#include "FollyDynamicMatchers.h"
#include "InspectorMocks.h"
#include "UniquePtrFactory.h"
#include "engines/JsiIntegrationTestGenericEngineAdapter.h"
#include "engines/JsiIntegrationTestHermesEngineAdapter.h"
#include "engines/JsiIntegrationTestHermesWithCDPAgentEngineAdapter.h"

using namespace ::testing;
using folly::sformat;

namespace facebook::react::jsinspector_modern {

namespace {

/**
 * A text fixture class for the integration between the modern RN CDP backend
 * and a JSI engine, mocking out the rest of RN. For simplicity, everything is
 * single-threaded and "async" work is actually done through a queued immediate
 * executor ( = run immediately and finish all queued sub-tasks before
 * returning).
 *
 * The main limitation of the simpler threading model is that we can't cover
 * breakpoints etc - since pausing during JS execution would prevent the test
 * from making progress. Such functionality is better suited for a full RN+CDP
 * integration test (using RN's own thread management) as well as for each
 * engine's unit tests.
 *
 * \tparam EngineAdapter An adapter class that implements RuntimeTargetDelegate
 * for a particular engine, plus exposes access to a RuntimeExecutor (based on
 * the provided folly::Executor) and the corresponding jsi::Runtime.
 */
template <typename EngineAdapter>
class JsiIntegrationPortableTest : public Test, private HostTargetDelegate {
  folly::QueuedImmediateExecutor immediateExecutor_;

 protected:
  JsiIntegrationPortableTest()
      : inspectorFlagsGuard_{EngineAdapter::getInspectorFlagOverrides()},
        engineAdapter_{immediateExecutor_} {
    instance_ = &page_->registerInstance(instanceTargetDelegate_);
    runtimeTarget_ = &instance_->registerRuntime(
        engineAdapter_->getRuntimeTargetDelegate(),
        engineAdapter_->getRuntimeExecutor());
  }

  ~JsiIntegrationPortableTest() override {
    toPage_.reset();
    if (runtimeTarget_) {
      EXPECT_TRUE(instance_);
      instance_->unregisterRuntime(*runtimeTarget_);
      runtimeTarget_ = nullptr;
    }
    if (instance_) {
      page_->unregisterInstance(*instance_);
      instance_ = nullptr;
    }
  }

  void connect() {
    ASSERT_FALSE(toPage_) << "Can only connect once in a JSI integration test.";
    toPage_ = page_->connect(
        remoteConnections_.make_unique(),
        {.integrationName = "JsiIntegrationTest"});

    // We'll always get an onDisconnect call when we tear
    // down the test. Expect it in order to satisfy the strict mock.
    EXPECT_CALL(*remoteConnections_[0], onDisconnect());
  }

  void reload() {
    if (runtimeTarget_) {
      ASSERT_TRUE(instance_);
      instance_->unregisterRuntime(*runtimeTarget_);
      runtimeTarget_ = nullptr;
    }
    if (instance_) {
      page_->unregisterInstance(*instance_);
      instance_ = nullptr;
    }
    // Recreate the engine (e.g. to wipe any state in the inner jsi::Runtime)
    engineAdapter_.emplace(immediateExecutor_);
    instance_ = &page_->registerInstance(instanceTargetDelegate_);
    runtimeTarget_ = &instance_->registerRuntime(
        engineAdapter_->getRuntimeTargetDelegate(),
        engineAdapter_->getRuntimeExecutor());
  }

  MockRemoteConnection& fromPage() {
    assert(toPage_);
    return *remoteConnections_[0];
  }

  VoidExecutor inspectorExecutor_ = [this](auto callback) {
    immediateExecutor_.add(callback);
  };

  jsi::Value eval(std::string_view code) {
    return engineAdapter_->getRuntime().evaluateJavaScript(
        std::make_shared<jsi::StringBuffer>(std::string(code)), "<eval>");
  }

  /**
   * Expect a message matching the provided gmock \c matcher and return a holder
   * that will eventually contain the parsed JSON payload.
   */
  template <typename Matcher>
  std::shared_ptr<const std::optional<folly::dynamic>> expectMessageFromPage(
      Matcher&& matcher) {
    std::shared_ptr result =
        std::make_shared<std::optional<folly::dynamic>>(std::nullopt);
    EXPECT_CALL(fromPage(), onMessage(matcher))
        .WillOnce(
            ([result](auto message) { *result = folly::parseJson(message); }))
        .RetiresOnSaturation();
    return result;
  }

  std::shared_ptr<HostTarget> page_ =
      HostTarget::create(*this, inspectorExecutor_);
  InstanceTarget* instance_{};
  RuntimeTarget* runtimeTarget_{};

  InspectorFlagOverridesGuard inspectorFlagsGuard_;
  MockInstanceTargetDelegate instanceTargetDelegate_;
  std::optional<EngineAdapter> engineAdapter_;

 private:
  UniquePtrFactory<StrictMock<MockRemoteConnection>> remoteConnections_;

 protected:
  // NOTE: Needs to be destroyed before page_.
  std::unique_ptr<ILocalConnection> toPage_;

 private:
  // HostTargetDelegate methods

  void onReload(const PageReloadRequest& request) override {
    (void)request;
    reload();
  }
};

} // namespace

////////////////////////////////////////////////////////////////////////////////

// Some tests are specific to Hermes's CDP capabilities and some are not.
// We'll use JsiIntegrationHermesTest as an alias for Hermes-specific tests
// and JsiIntegrationPortableTest for the engine-agnostic ones.

/**
 * The list of engine adapters for which engine-agnostic tests should pass.
 */
using AllEngines = Types<
    JsiIntegrationTestHermesEngineAdapter,
    JsiIntegrationTestHermesWithCDPAgentEngineAdapter,
    JsiIntegrationTestGenericEngineAdapter>;

using AllHermesVariants = Types<
    JsiIntegrationTestHermesEngineAdapter,
    JsiIntegrationTestHermesWithCDPAgentEngineAdapter>;

using ModernHermesVariants =
    Types<JsiIntegrationTestHermesWithCDPAgentEngineAdapter>;
using LegacyHermesVariants = Types<JsiIntegrationTestHermesEngineAdapter>;

TYPED_TEST_SUITE(JsiIntegrationPortableTest, AllEngines);

template <typename EngineAdapter>
using JsiIntegrationHermesTest = JsiIntegrationPortableTest<EngineAdapter>;
TYPED_TEST_SUITE(JsiIntegrationHermesTest, AllHermesVariants);

template <typename EngineAdapter>
using JsiIntegrationHermesLegacyTest =
    JsiIntegrationPortableTest<EngineAdapter>;
TYPED_TEST_SUITE(JsiIntegrationHermesLegacyTest, LegacyHermesVariants);

template <typename EngineAdapter>
using JsiIntegrationHermesModernTest =
    JsiIntegrationPortableTest<EngineAdapter>;
TYPED_TEST_SUITE(JsiIntegrationHermesModernTest, ModernHermesVariants);

#pragma region AllEngines

TYPED_TEST(JsiIntegrationPortableTest, ConnectWithoutCrashing) {
  this->connect();
}

TYPED_TEST(JsiIntegrationPortableTest, ErrorOnUnknownMethod) {
  this->connect();

  this->expectMessageFromPage(
      JsonParsed(AllOf(AtJsonPtr("/id", 1), AtJsonPtr("/error/code", -32601))));

  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Foobar.unknownMethod"
                               })");
}

TYPED_TEST(JsiIntegrationPortableTest, ExecutionContextNotifications) {
  this->connect();

  InSequence s;

  this->expectMessageFromPage(JsonEq(R"({
                                         "method": "Runtime.executionContextCreated",
                                         "params": {
                                           "context": {
                                             "id": 1,
                                             "origin": "",
                                             "name": "main"
                                           }
                                         }
                                       })"));
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.enable"
                               })");

  this->expectMessageFromPage(JsonEq(R"({
                                         "method": "Runtime.executionContextDestroyed",
                                         "params": {
                                           "executionContextId": 1
                                         }
                                       })"));
  this->expectMessageFromPage(JsonEq(R"({
                                         "method": "Runtime.executionContextsCleared"
                                       })"));

  this->expectMessageFromPage(JsonEq(R"({
                                         "method": "Runtime.executionContextCreated",
                                         "params": {
                                           "context": {
                                             "id": 2,
                                             "origin": "",
                                             "name": "main"
                                           }
                                         }
                                       })"));
  // Simulate a reload triggered by the app (not by the debugger).
  this->reload();

  this->expectMessageFromPage(JsonEq(R"({
                                         "method": "Runtime.executionContextDestroyed",
                                         "params": {
                                           "executionContextId": 2
                                         }
                                       })"));
  this->expectMessageFromPage(JsonEq(R"({
                                         "method": "Runtime.executionContextsCleared"
                                       })"));
  this->expectMessageFromPage(JsonEq(R"({
                                                     "method": "Runtime.executionContextCreated",
                                                     "params": {
                                                       "context": {
                                                         "id": 3,
                                                         "origin": "",
                                                         "name": "main"
                                                       }
                                                     }
                                                   })"));
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 2,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 2,
                                 "method": "Page.reload"
                               })");
}

TYPED_TEST(JsiIntegrationPortableTest, AddBinding) {
  this->connect();

  InSequence s;

  auto executionContextInfo = this->expectMessageFromPage(JsonParsed(
      AllOf(AtJsonPtr("/method", "Runtime.executionContextCreated"))));
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.enable"
                               })");
  ASSERT_TRUE(executionContextInfo->has_value());
  auto executionContextId =
      executionContextInfo->value()["params"]["context"]["id"];

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 2,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 2,
                                 "method": "Runtime.addBinding",
                                 "params": {"name": "foo"}
                               })");

  this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/method", "Runtime.bindingCalled"),
      AtJsonPtr("/params/name", "foo"),
      AtJsonPtr("/params/payload", "bar"),
      AtJsonPtr("/params/executionContextId", executionContextId))));
  this->eval("globalThis.foo('bar');");
}

TYPED_TEST(JsiIntegrationPortableTest, AddedBindingSurvivesReload) {
  this->connect();

  InSequence s;

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 1,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.addBinding",
                                 "params": {"name": "foo"}
                               })");

  this->reload();

  // Get the new context ID by sending Runtime.enable now.
  auto executionContextInfo = this->expectMessageFromPage(JsonParsed(
      AllOf(AtJsonPtr("/method", "Runtime.executionContextCreated"))));
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.enable"
                               })");
  ASSERT_TRUE(executionContextInfo->has_value());
  auto executionContextId =
      executionContextInfo->value()["params"]["context"]["id"];

  this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/method", "Runtime.bindingCalled"),
      AtJsonPtr("/params/name", "foo"),
      AtJsonPtr("/params/payload", "bar"),
      AtJsonPtr("/params/executionContextId", executionContextId))));
  this->eval("globalThis.foo('bar');");
}

TYPED_TEST(JsiIntegrationPortableTest, RemovedBindingRemainsInstalled) {
  this->connect();

  InSequence s;

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 1,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.addBinding",
                                 "params": {"name": "foo"}
                               })");

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 2,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 2,
                                 "method": "Runtime.removeBinding",
                                 "params": {"name": "foo"}
                               })");

  this->eval("globalThis.foo('bar');");
}

TYPED_TEST(JsiIntegrationPortableTest, RemovedBindingDoesNotSurviveReload) {
  this->connect();

  InSequence s;

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 1,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.addBinding",
                                 "params": {"name": "foo"}
                               })");

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 2,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 2,
                                 "method": "Runtime.removeBinding",
                                 "params": {"name": "foo"}
                               })");

  this->reload();

  EXPECT_TRUE(this->eval("typeof globalThis.foo === 'undefined'").getBool());
}

TYPED_TEST(JsiIntegrationPortableTest, AddBindingClobbersExistingProperty) {
  this->connect();

  InSequence s;

  this->eval(R"(
    globalThis.foo = 'clobbered value';
  )");

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 1,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.addBinding",
                                 "params": {"name": "foo"}
                               })");

  this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/method", "Runtime.bindingCalled"),
      AtJsonPtr("/params/name", "foo"),
      AtJsonPtr("/params/payload", "bar"))));
  this->eval("globalThis.foo('bar');");
}

TYPED_TEST(JsiIntegrationPortableTest, ExceptionDuringAddBindingIsIgnored) {
  this->connect();

  InSequence s;

  this->eval(R"(
    Object.defineProperty(globalThis, 'foo', {
      get: function () { return 42; },
      set: function () { throw new Error('nope'); },
    });
  )");

  this->expectMessageFromPage(JsonEq(R"({
                                          "id": 1,
                                          "result": {}
                                        })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.addBinding",
                                 "params": {"name": "foo"}
                               })");

  EXPECT_TRUE(this->eval("globalThis.foo === 42").getBool());
}

#pragma endregion // AllEngines
#pragma region AllHermesVariants

TYPED_TEST(JsiIntegrationHermesTest, EvaluateExpression) {
  this->connect();

  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {
                                           "result": {
                                             "type": "number",
                                             "value": 42
                                           }
                                         }
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.evaluate",
                                 "params": {"expression": "42"}
                               })");
}

TYPED_TEST(JsiIntegrationHermesTest, EvaluateExpressionInExecutionContext) {
  this->connect();

  InSequence s;

  auto executionContextInfo = this->expectMessageFromPage(JsonParsed(
      AllOf(AtJsonPtr("/method", "Runtime.executionContextCreated"))));
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Runtime.enable"
                               })");
  ASSERT_TRUE(executionContextInfo->has_value());
  auto executionContextId =
      executionContextInfo->value()["params"]["context"]["id"].getInt();

  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {
                                           "result": {
                                             "type": "number",
                                             "value": 42
                                           }
                                         }
                                       })"));
  this->toPage_->sendMessage(sformat(
      R"({{
        "id": 1,
        "method": "Runtime.evaluate",
        "params": {{"expression": "42", "contextId": {0}}}
      }})",
      std::to_string(executionContextId)));

  // Silence notifications about execution contexts.
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 2,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 2,
                                 "method": "Runtime.disable"
                               })");
  this->reload();

  // Now the old execution context is stale.
  this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/id", 3),
      AtJsonPtr(
          "/error/code",
          // HermesRuntimeAgentDelegateNew responds more correctly with -32600
          // (invalid request), old responds -32000 (server error). Accept
          // either.
          AnyOf(-32600, -32000)))));
  this->toPage_->sendMessage(sformat(
      R"({{
        "id": 3,
        "method": "Runtime.evaluate",
        "params": {{"expression": "10000", "contextId": {0}}}
      }})",
      std::to_string(executionContextId)));
}

#pragma endregion // AllHermesVariants
#pragma region ModernHermesVariants

TYPED_TEST(JsiIntegrationHermesModernTest, ResolveBreakpointAfterReload) {
  this->connect();

  InSequence s;

  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Debugger.enable"
                               })");

  this->expectMessageFromPage(JsonParsed(AtJsonPtr("/id", 2)));
  this->toPage_->sendMessage(R"({
                                 "id": 2,
                                 "method": "Debugger.setBreakpointByUrl",
                                 "params": {"lineNumber": 2, "url": "breakpointTest.js"}
                               })");

  this->reload();

  auto scriptInfo = this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/method", "Debugger.scriptParsed"),
      AtJsonPtr("/params/url", "breakpointTest.js"))));
  auto breakpointInfo = this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/method", "Debugger.breakpointResolved"),
      AtJsonPtr("/params/location/lineNumber", 2))));
  this->eval(R"( // line 0
    globalThis.foo = function() { // line 1
      Date.now(); // line 2
    };
    //# sourceURL=breakpointTest.js
  )");
  ASSERT_TRUE(breakpointInfo->has_value());
  ASSERT_TRUE(scriptInfo->has_value());
  EXPECT_EQ(
      breakpointInfo->value()["params"]["location"]["scriptId"],
      scriptInfo->value()["params"]["scriptId"]);
}

TYPED_TEST(JsiIntegrationHermesModernTest, CDPAgentReentrancyRegressionTest) {
  this->connect();

  // TODO(moti): Add an InSequence guard here once Hermes processes the messages
  // in the order they were received.

  this->inspectorExecutor_([&]() {
    // Tasks scheduled on our executor here will be executed when this lambda
    // returns. This is integral to the bug we're trying to reproduce, so we
    // place the EXPECT_* calls at the end of the lambda body to ensure the
    // test fails if we get eager (unexpected) responses.

    // 1. Cause CDPAgent to schedule a task on the JS executor to process the
    //    message. The task is simultaneously scheduled as an interrupt on the
    //    JS VM (but will be called via the executor, since the interpreter is
    //    idle at the moment).
    this->toPage_->sendMessage(R"({
                                   "id": 1,
                                   "method": "Runtime.evaluate",
                                   "params": {"expression": "1 + 2"}
                                 })");

    // 2. Cause CDPAgent to schedule another task+interrupt.
    this->toPage_->sendMessage(R"({
                                   "id": 2,
                                   "method": "Runtime.evaluate",
                                   "params": {"expression": "3 + 4"}
                                 })");

    // 3. When the first scheduled task runs (via the executor), it enters the
    //    interpreter to evaluate the expression, at which point the
    //    interpreter begins processing interrupts and enters the second task.
    //    This used to trigger two distinct bugs in CDPAgent:
    //      - The first task would be triggered twice due to a race condition
    //        between the executor and the interrupt handler. (D54771697)
    //      - The second task would deadlock due to the first task holding a
    //        lock preventing any other CDPAgent tasks from running. (D54838179)

    this->expectMessageFromPage(JsonEq(R"({
                                            "id": 1,
                                            "result": {
                                              "result": {
                                                "type": "number",
                                                "value": 3
                                              }
                                            }
                                          })"));

    this->expectMessageFromPage(JsonEq(R"({
                                            "id": 2,
                                            "result": {
                                              "result": {
                                                "type": "number",
                                                "value": 7
                                              }
                                            }
                                          })"));
  });
}

TYPED_TEST(JsiIntegrationHermesModernTest, ScriptParsedExactlyOnce) {
  // Regression test for T182003727 (multiple scriptParsed events for a single
  // script under Hermes lazy compilation).

  this->connect();

  InSequence s;

  this->eval(R"(
    // NOTE: Triggers lazy compilation in Hermes when running with
    // CompilationMode::ForceLazyCompilation.
    (function foo(){var x = 2;})()
    //# sourceURL=script.js
  )");

  this->expectMessageFromPage(JsonParsed(AllOf(
      AtJsonPtr("/method", "Debugger.scriptParsed"),
      AtJsonPtr("/params/url", "script.js"))));
  this->expectMessageFromPage(JsonEq(R"({
                                         "id": 1,
                                         "result": {}
                                       })"));
  this->toPage_->sendMessage(R"({
                                 "id": 1,
                                 "method": "Debugger.enable"
                               })");
}

#pragma endregion // ModernHermesVariants

} // namespace facebook::react::jsinspector_modern
