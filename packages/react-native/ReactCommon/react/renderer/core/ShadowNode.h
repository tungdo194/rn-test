/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <memory>
#include <string>
#include <type_traits>
#include <vector>

#include <butter/small_vector.h>
#include <react/renderer/core/EventEmitter.h>
#include <react/renderer/core/Props.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/core/Sealable.h>
#include <react/renderer/core/ShadowNodeFamily.h>
#include <react/renderer/core/ShadowNodeTraits.h>
#include <react/renderer/core/State.h>
#include <react/renderer/debug/DebugStringConvertible.h>

namespace facebook::react {

static constexpr const int kShadowNodeChildrenSmallVectorSize = 8;

class ComponentDescriptor;
struct ShadowNodeFragment;

class ShadowNode : public Sealable,
                   public DebugStringConvertible,
                   public jsi::NativeState {
 public:
  using Shared = std::shared_ptr<ShadowNode const>;
  using Weak = std::weak_ptr<ShadowNode const>;
  using Unshared = std::shared_ptr<ShadowNode>;
  using ListOfShared =
      butter::small_vector<Shared, kShadowNodeChildrenSmallVectorSize>;
  using ListOfWeak =
      butter::small_vector<Weak, kShadowNodeChildrenSmallVectorSize>;
  using SharedListOfShared = std::shared_ptr<ListOfShared const>;
  using UnsharedListOfShared = std::shared_ptr<ListOfShared>;
  using UnsharedListOfWeak = std::shared_ptr<ListOfWeak>;

  using AncestorList = butter::small_vector<
      std::pair<
          std::reference_wrapper<ShadowNode const> /* parentNode */,
          int /* childIndex */>,
      64>;

  static SharedListOfShared emptySharedShadowNodeSharedList();

  /*
   * Returns `true` if nodes belong to the same family (they were cloned one
   * from each other or from the same source node).
   */
  static bool sameFamily(const ShadowNode &first, const ShadowNode &second);

  /*
   * A set of traits associated with a particular class.
   * Reimplement in subclasses to declare class-specific traits.
   */
  static ShadowNodeTraits BaseTraits() {
    return ShadowNodeTraits{};
  }

#pragma mark - Constructors

  /*
   * Creates a Shadow Node based on fields specified in a `fragment`.
   */
  ShadowNode(
      ShadowNodeFragment const &fragment,
      ShadowNodeFamily::Shared family,
      ShadowNodeTraits traits);

  /*
   * Creates a Shadow Node via cloning given `sourceShadowNode` and
   * applying fields from given `fragment`.
   * Note: `tag`, `surfaceId`, and `eventEmitter` cannot be changed.
   */
  ShadowNode(
      const ShadowNode &sourceShadowNode,
      const ShadowNodeFragment &fragment);

  /*
   * Not copyable.
   */
  ShadowNode(ShadowNode const &shadowNode) noexcept = delete;
  ShadowNode &operator=(ShadowNode const &other) noexcept = delete;

  virtual ~ShadowNode() override = default;

  /*
   * Clones the shadow node using stored `cloneFunction`.
   */
  Unshared clone(const ShadowNodeFragment &fragment) const;

  /*
   * Clones the node (and partially the tree starting from the node) by
   * replacing a `oldShadowNode` (which corresponds to a given
   * `shadowNodeFamily`) with a node that `callback` returns.
   *
   * Returns `nullptr` if the operation cannot be performed successfully.
   */
  Unshared cloneTree(
      ShadowNodeFamily const &shadowNodeFamily,
      std::function<Unshared(ShadowNode const &oldShadowNode)> const &callback)
      const;

#pragma mark - Getters

  ComponentName getComponentName() const;
  ComponentHandle getComponentHandle() const;

  /*
   * Returns a stored traits.
   */
  ShadowNodeTraits getTraits() const;

  Props::Shared const &getProps() const;
  ListOfShared const &getChildren() const;
  SharedEventEmitter const &getEventEmitter() const;
  Tag getTag() const;
  SurfaceId getSurfaceId() const;

  /*
   * Returns a concrete `ComponentDescriptor` that manages nodes of this type.
   */
  const ComponentDescriptor &getComponentDescriptor() const;

  /*
   * Returns the `ContextContainer` used by this ShadowNode.
   */
  ContextContainer::Shared getContextContainer() const;

  /*
   * Returns a state associated with the particular node.
   */
  const State::Shared &getState() const;

  /*
   * Returns a momentary value of the most recently created or committed state
   * associated with a family of nodes which this node belongs to.
   * Sequential calls might return different values.
   * The method may return null pointer in case if the particular `ShadowNode`
   * does not use `State`.
   */
  State::Shared getMostRecentState() const;

  /*
   * Returns a number that specifies the order of the node.
   * A view generated from a node with a greater order index is placed before a
   * view generated from a node with a lower order index.
   */
  int getOrderIndex() const;

  void sealRecursive() const;

  ShadowNodeFamily const &getFamily() const;

#pragma mark - Mutating Methods

  virtual void appendChild(Shared const &child);
  virtual void replaceChild(
      ShadowNode const &oldChild,
      Shared const &newChild,
      size_t suggestedIndex = -1);

  /*
   * Performs all side effects associated with mounting/unmounting in one place.
   * This is not `virtual` on purpose, do not override this.
   * `EventEmitter::DispatchMutex()` must be acquired before calling.
   */
  void setMounted(bool mounted) const;

#pragma mark - DebugStringConvertible

#if RN_DEBUG_STRING_CONVERTIBLE
  std::string getDebugName() const override;
  std::string getDebugValue() const override;
  SharedDebugStringConvertibleList getDebugChildren() const override;
  SharedDebugStringConvertibleList getDebugProps() const override;

  /*
   * A number of the generation of the ShadowNode instance;
   * is used and useful for debug-printing purposes *only*.
   * Do not access this value in any circumstances.
   */
  int const revision_;
#endif

 protected:
  Props::Shared props_;
  SharedListOfShared children_;
  State::Shared state_;
  int orderIndex_;

 private:
  friend ShadowNodeFamily;

  /*
   * Clones the list of children (and creates a new `shared_ptr` to it) if
   * `childrenAreShared_` flag is `true`.
   */
  void cloneChildrenIfShared();

  /*
   * Pointer to a family object that this shadow node belongs to.
   */
  ShadowNodeFamily::Shared family_;

  mutable std::atomic<bool> hasBeenMounted_{false};

  static Props::Shared propsForClonedShadowNode(
      ShadowNode const &sourceShadowNode,
      Props::Shared const &props);

 protected:
  /*
   * Traits associated with the particular `ShadowNode` class and an instance of
   * that class.
   */
  ShadowNodeTraits traits_;
};

static_assert(
    std::has_virtual_destructor<ShadowNode>::value,
    "ShadowNode must have a virtual destructor");

} // namespace facebook::react
