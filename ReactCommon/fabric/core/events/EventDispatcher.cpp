/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "EventDispatcher.h"

#include <react/core/StateUpdate.h>

#include "BatchedEventQueue.h"
#include "RawEvent.h"
#include "UnbatchedEventQueue.h"

#define REACT_FABRIC_SYNC_EVENT_DISPATCHING_DISABLED

namespace facebook {
namespace react {

EventDispatcher::EventDispatcher(
    EventPipe const &eventPipe,
    StatePipe const &statePipe,
    EventBeat::Factory const &synchonousEventBeatFactory,
    EventBeat::Factory const &asynchonousEventBeatFactory,
    EventBeat::SharedOwnerBox const &ownerBox) {
  // Synchronous/Unbatched
  eventQueues_[(int)EventPriority::SynchronousUnbatched] =
      std::make_unique<UnbatchedEventQueue>(
          eventPipe, statePipe, synchonousEventBeatFactory(ownerBox));

  // Synchronous/Batched
  eventQueues_[(int)EventPriority::SynchronousBatched] =
      std::make_unique<BatchedEventQueue>(
          eventPipe, statePipe, synchonousEventBeatFactory(ownerBox));

  // Asynchronous/Unbatched
  eventQueues_[(int)EventPriority::AsynchronousUnbatched] =
      std::make_unique<UnbatchedEventQueue>(
          eventPipe, statePipe, asynchonousEventBeatFactory(ownerBox));

  // Asynchronous/Batched
  eventQueues_[(int)EventPriority::AsynchronousBatched] =
      std::make_unique<BatchedEventQueue>(
          eventPipe, statePipe, asynchonousEventBeatFactory(ownerBox));
}

void EventDispatcher::dispatchEvent(
    RawEvent const &rawEvent,
    EventPriority priority) const {
  getEventQueue(priority).enqueueEvent(std::move(rawEvent));
}

void EventDispatcher::dispatchStateUpdate(
    StateUpdate &&stateUpdate,
    EventPriority priority) const {
  getEventQueue(priority).enqueueStateUpdate(std::move(stateUpdate));
}

const EventQueue &EventDispatcher::getEventQueue(EventPriority priority) const {
#ifdef REACT_FABRIC_SYNC_EVENT_DISPATCHING_DISABLED
  priority = EventPriority::AsynchronousBatched;
#endif

  return *eventQueues_[(int)priority];
}

} // namespace react
} // namespace facebook
