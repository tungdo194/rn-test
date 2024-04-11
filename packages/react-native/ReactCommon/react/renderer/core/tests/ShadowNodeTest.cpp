/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include <memory>

#include <gtest/gtest.h>
#include <react/renderer/core/ConcreteShadowNode.h>
#include <react/renderer/core/ShadowNode.h>

#include "TestComponent.h"

using namespace facebook::react;

class ShadowNodeTest : public ::testing::Test {
 protected:
  ShadowNodeTest()
      : eventDispatcher_(std::shared_ptr<const EventDispatcher>()),
        componentDescriptor_(TestComponentDescriptor({eventDispatcher_})) {
    /*
     * The structure:
     * <A>
     *  <AA/>
     *  <AB>
     *    <ABA/>
     *    <ABB/>
     *  </AB>
     *  <AC/>
     * </A>
     * </Z>
     */

    auto props = std::make_shared<const TestProps>();

    auto traits = TestShadowNode::BaseTraits();

    auto familyAA = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 11,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeAA_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
        },
        familyAA,
        traits);

    auto familyABA = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 12,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeABA_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
        },
        familyABA,
        traits);

    auto familyABB = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 13,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeABB_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
        },
        familyABB,
        traits);

    auto nodeABChildren = std::make_shared<ShadowNode::ListOfShared>(
        ShadowNode::ListOfShared{nodeABA_, nodeABB_});

    auto familyAB = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 15,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeAB_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ nodeABChildren,
        },
        familyAB,
        traits);

    auto familyAC = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 16,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeAC_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
        },
        familyAC,
        traits);

    auto nodeAChildren = std::make_shared<ShadowNode::ListOfShared>(
        ShadowNode::ListOfShared{nodeAA_, nodeAB_, nodeAC_});

    auto familyA = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 17,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeA_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ nodeAChildren,
        },
        familyA,
        traits);

    auto familyZ = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
        /* .tag = */ 18,
        /* .surfaceId = */ surfaceId_,
        /* .instanceHandle = */ nullptr,
    });
    nodeZ_ = std::make_shared<TestShadowNode>(
        ShadowNodeFragment{
            /* .props = */ props,
            /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
        },
        familyZ,
        traits);
  }

  std::shared_ptr<const EventDispatcher> eventDispatcher_;
  std::shared_ptr<TestShadowNode> nodeA_;
  std::shared_ptr<TestShadowNode> nodeAA_;
  std::shared_ptr<TestShadowNode> nodeABA_;
  std::shared_ptr<TestShadowNode> nodeABB_;
  std::shared_ptr<TestShadowNode> nodeAB_;
  std::shared_ptr<TestShadowNode> nodeAC_;
  std::shared_ptr<TestShadowNode> nodeZ_;
  TestComponentDescriptor componentDescriptor_;

  SurfaceId surfaceId_ = 1;
};

TEST_F(ShadowNodeTest, handleShadowNodeCreation) {
  EXPECT_FALSE(nodeZ_->getSealed());
  EXPECT_STREQ(nodeZ_->getComponentName(), "Test");
  EXPECT_EQ(nodeZ_->getTag(), 18);
  EXPECT_EQ(nodeZ_->getSurfaceId(), surfaceId_);
  EXPECT_NE(nodeZ_->getEventEmitter(), nullptr);
  EXPECT_EQ(nodeZ_->getChildren().size(), 0);
}

TEST_F(ShadowNodeTest, handleSealRecusive) {
  nodeZ_->sealRecursive();
  EXPECT_TRUE(nodeZ_->getSealed());
  EXPECT_TRUE(nodeZ_->getProps()->getSealed());
}

TEST_F(ShadowNodeTest, handleShadowNodeSimpleCloning) {
  auto nodeARevision2 =
      std::make_shared<TestShadowNode>(*nodeA_, ShadowNodeFragment{});

  EXPECT_STREQ(nodeA_->getComponentName(), nodeARevision2->getComponentName());
  EXPECT_EQ(nodeA_->getTag(), nodeARevision2->getTag());
  EXPECT_EQ(nodeA_->getSurfaceId(), nodeARevision2->getSurfaceId());
  EXPECT_EQ(nodeA_->getEventEmitter(), nodeARevision2->getEventEmitter());
}

TEST_F(ShadowNodeTest, handleShadowNodeMutation) {
  auto nodeABChildren = nodeAB_->getChildren();
  EXPECT_EQ(nodeABChildren.size(), 2);
  EXPECT_EQ(nodeABChildren.at(0), nodeABA_);
  EXPECT_EQ(nodeABChildren.at(1), nodeABB_);

  auto nodeABArevision2 =
      std::make_shared<TestShadowNode>(*nodeABA_, ShadowNodeFragment{});
  nodeAB_->replaceChild(*nodeABA_, nodeABArevision2);
  nodeABChildren = nodeAB_->getChildren();
  EXPECT_EQ(nodeABChildren.size(), 2);
  EXPECT_EQ(nodeABChildren.at(0), nodeABArevision2);
  EXPECT_EQ(nodeABChildren.at(1), nodeABB_);

  // Seal the entire tree.
  nodeAB_->sealRecursive();
  EXPECT_TRUE(nodeAB_->getSealed());
  EXPECT_TRUE(nodeABArevision2->getSealed());
  EXPECT_TRUE(nodeABB_->getSealed());
}

TEST_F(ShadowNodeTest, handleCloneFunction) {
  auto nodeABClone = nodeAB_->clone({});

  // Those two nodes are *not* same.
  EXPECT_NE(nodeAB_, nodeABClone);

#ifndef ANDROID
  // `secondNodeClone` is an instance of `TestShadowNode`.
  EXPECT_NE(
      std::dynamic_pointer_cast<const TestShadowNode>(nodeABClone), nullptr);
#endif

  // Both nodes have same content.
  EXPECT_EQ(nodeAB_->getTag(), nodeABClone->getTag());
  EXPECT_EQ(nodeAB_->getSurfaceId(), nodeABClone->getSurfaceId());
  EXPECT_EQ(nodeAB_->getProps(), nodeABClone->getProps());
}

TEST_F(ShadowNodeTest, handleCloningWithTraits) {
  auto clonedWithoutTraits = nodeAB_->clone({});

  EXPECT_FALSE(clonedWithoutTraits->getTraits().check(
      ShadowNodeTraits::Trait::Reserved));

  auto newTraits = ShadowNodeTraits();
  newTraits.set(ShadowNodeTraits::Trait::Reserved);

  auto clonedWithTraits = clonedWithoutTraits->clone({.traits = newTraits});

  EXPECT_TRUE(
      clonedWithTraits->getTraits().check(ShadowNodeTraits::Trait::Reserved));
}

TEST_F(ShadowNodeTest, handleState) {
  auto family = componentDescriptor_.createFamily(ShadowNodeFamilyFragment{
      /* .tag = */ 9,
      /* .surfaceId = */ surfaceId_,
      /* .instanceHandle = */ nullptr,
  });

  auto traits = TestShadowNode::BaseTraits();

  auto props = std::make_shared<const TestProps>();

  const auto initialState =
      componentDescriptor_.createInitialState(props, family);

  auto firstNode = std::make_shared<TestShadowNode>(
      ShadowNodeFragment{
          /* .props = */ props,
          /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
          /* .state = */ initialState},
      family,
      traits);
  auto secondNode = std::make_shared<TestShadowNode>(
      ShadowNodeFragment{
          /* .props = */ props,
          /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
          /* .state = */ initialState},
      family,
      traits);
  auto thirdNode = std::make_shared<TestShadowNode>(
      ShadowNodeFragment{
          /* .props = */ props,
          /* .children = */ ShadowNode::emptySharedShadowNodeSharedList(),
          /* .state = */ initialState},
      family,
      traits);

  TestShadowNode::ConcreteState::Shared _state =
      std::static_pointer_cast<TestShadowNode::ConcreteState const>(
          initialState);
  _state->updateState(TestState());

  thirdNode->setStateData(TestState());
  // State object are compared by pointer, not by value.
  EXPECT_EQ(firstNode->getState(), secondNode->getState());
  EXPECT_NE(firstNode->getState(), thirdNode->getState());
  secondNode->setStateData(TestState());
  EXPECT_NE(firstNode->getState(), secondNode->getState());

  // State cannot be changed for sealed shadow node.
  secondNode->sealRecursive();
  EXPECT_DEATH_IF_SUPPORTED(
      { secondNode->setStateData(TestState()); },
      "Attempt to mutate a sealed object.");
}

TEST_F(ShadowNodeTest, testCloneTree) {
  auto& family = nodeABA_->getFamily();
  auto newTraits = ShadowNodeTraits();
  newTraits.set(ShadowNodeTraits::Trait::Reserved);
  auto rootNode = nodeA_->cloneTree(
      family,
      [newTraits](ShadowNode const& oldShadowNode) {
        return oldShadowNode.clone({.traits = newTraits});
      },
      newTraits);

  EXPECT_TRUE(rootNode->getTraits().check(ShadowNodeTraits::Trait::Reserved));

  EXPECT_FALSE(rootNode->getChildren()[0]->getTraits().check(
      ShadowNodeTraits::Trait::Reserved));

  auto const& firstLevelChild = *rootNode->getChildren()[1];

  EXPECT_TRUE(
      firstLevelChild.getTraits().check(ShadowNodeTraits::Trait::Reserved));

  EXPECT_FALSE(firstLevelChild.getChildren()[1]->getTraits().check(
      ShadowNodeTraits::Trait::Reserved));

  auto const& secondLevelchild = *firstLevelChild.getChildren()[0];

  EXPECT_TRUE(
      secondLevelchild.getTraits().check(ShadowNodeTraits::Trait::Reserved));
}
