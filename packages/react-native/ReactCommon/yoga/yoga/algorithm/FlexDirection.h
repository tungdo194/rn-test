/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <yoga/Yoga.h>

#include <yoga/debug/AssertFatal.h>
#include <yoga/enums/Dimension.h>
#include <yoga/enums/Direction.h>
#include <yoga/enums/Edge.h>
#include <yoga/enums/FlexDirection.h>

namespace facebook::yoga {

inline bool isRow(const FlexDirection flexDirection) {
  return flexDirection == FlexDirection::Row ||
      flexDirection == FlexDirection::RowReverse;
}

inline bool isColumn(const FlexDirection flexDirection) {
  return flexDirection == FlexDirection::Column ||
      flexDirection == FlexDirection::ColumnReverse;
}

inline FlexDirection resolveDirection(
    const FlexDirection flexDirection,
    const Direction direction) {
  if (direction == Direction::RTL) {
    if (flexDirection == FlexDirection::Row) {
      return FlexDirection::RowReverse;
    } else if (flexDirection == FlexDirection::RowReverse) {
      return FlexDirection::Row;
    }
  }

  return flexDirection;
}

inline FlexDirection resolveCrossDirection(
    const FlexDirection flexDirection,
    const Direction direction) {
  return isColumn(flexDirection)
      ? resolveDirection(FlexDirection::Row, direction)
      : FlexDirection::Column;
}

inline Edge flexStartEdge(const FlexDirection flexDirection) {
  switch (flexDirection) {
    case FlexDirection::Column:
      return Edge::Top;
    case FlexDirection::ColumnReverse:
      return Edge::Bottom;
    case FlexDirection::Row:
      return Edge::Left;
    case FlexDirection::RowReverse:
      return Edge::Right;
  }

  fatalWithMessage("Invalid FlexDirection");
}

inline Edge flexEndEdge(const FlexDirection flexDirection) {
  switch (flexDirection) {
    case FlexDirection::Column:
      return Edge::Bottom;
    case FlexDirection::ColumnReverse:
      return Edge::Top;
    case FlexDirection::Row:
      return Edge::Right;
    case FlexDirection::RowReverse:
      return Edge::Left;
  }

  fatalWithMessage("Invalid FlexDirection");
}

inline Edge inlineStartEdge(
    const FlexDirection flexDirection,
    const Direction direction) {
  if (isRow(flexDirection)) {
    return direction == Direction::RTL ? Edge::Right : Edge::Left;
  }

  return Edge::Top;
}

inline Edge inlineEndEdge(
    const FlexDirection flexDirection,
    const Direction direction) {
  if (isRow(flexDirection)) {
    return direction == Direction::RTL ? Edge::Left : Edge::Right;
  }

  return Edge::Bottom;
}

inline Dimension dimension(const FlexDirection flexDirection) {
  switch (flexDirection) {
    case FlexDirection::Column:
      return Dimension::Height;
    case FlexDirection::ColumnReverse:
      return Dimension::Height;
    case FlexDirection::Row:
      return Dimension::Width;
    case FlexDirection::RowReverse:
      return Dimension::Width;
  }

  fatalWithMessage("Invalid FlexDirection");
}

} // namespace facebook::yoga
