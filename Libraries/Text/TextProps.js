/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  AccessibilityRole,
  AccessibilityState,
  Role,
} from '../Components/View/ViewAccessibility';
import type {TextStyleProp} from '../StyleSheet/StyleSheet';
import type {
  LayoutEvent,
  PointerEvent,
  PressEvent,
  TextLayoutEvent,
} from '../Types/CoreEventTypes';
import type {Node} from 'react';

export type PressRetentionOffset = $ReadOnly<{|
  top: number,
  left: number,
  bottom: number,
  right: number,
|}>;

type PointerEventProps = $ReadOnly<{|
  onPointerEnter?: (event: PointerEvent) => void,
  onPointerLeave?: (event: PointerEvent) => void,
  onPointerMove?: (event: PointerEvent) => void,
|}>;

/**
 * @see https://reactnative.dev/docs/text#reference
 */
export type TextProps = $ReadOnly<{|
  ...PointerEventProps,

  /**
   * Indicates whether the view is an accessibility element.
   *
   * See https://reactnative.dev/docs/text#accessible
   */
  accessible?: ?boolean,
  accessibilityActions?: ?$ReadOnlyArray<AccessibilityActionInfo>,
  onAccessibilityAction?: ?(event: AccessibilityActionEvent) => mixed,
  accessibilityHint?: ?Stringish,
  accessibilityLanguage?: ?Stringish,
  accessibilityLabel?: ?Stringish,
  accessibilityRole?: ?AccessibilityRole,
  accessibilityState?: ?AccessibilityState,
  'aria-label'?: ?string,

  /**
   * Whether font should be scaled down automatically.
   *
   * See https://reactnative.dev/docs/text#adjustsfontsizetofit
   */
  adjustsFontSizeToFit?: ?boolean,

  /**
   * Whether fonts should scale to respect Text Size accessibility settings.
   *
   * See https://reactnative.dev/docs/text#allowfontscaling
   */
  allowFontScaling?: ?boolean,

  /**
   * Set hyphenation strategy on Android.
   *
   */
  android_hyphenationFrequency?: ?('normal' | 'none' | 'full'),

  /**
   * alias for accessibilityState
   *
   * see https://reactnative.dev/docs/accessibility#accessibilitystate
   */
  'aria-busy'?: ?boolean,
  'aria-checked'?: ?boolean | 'mixed',
  'aria-disabled'?: ?boolean,
  'aria-expanded'?: ?boolean,
  'aria-selected'?: ?boolean,

  /**
   * Represents the nativeID of the associated label text. When the assistive technology focuses on the component with this props, the text is read aloud.
   * This prop is listed for cross-platform reasons and has no real effect on Android or iOS.
   */
  'aria-labelledby'?: ?string,

  children?: ?Node,

  /**
   * When `numberOfLines` is set, this prop defines how text will be
   * truncated.
   *
   * See https://reactnative.dev/docs/text#ellipsizemode
   */
  ellipsizeMode?: ?('clip' | 'head' | 'middle' | 'tail'),

  /**
   * Used to locate this view from native code.
   *
   * See https://reactnative.dev/docs/text#nativeid
   */
  id?: string,

  /**
   * Specifies largest possible scale a font can reach when `allowFontScaling` is enabled.
   * Possible values:
   * `null/undefined` (default): inherit from the parent node or the global default (0)
   * `0`: no max, ignore parent/global default
   * `>= 1`: sets the maxFontSizeMultiplier of this node to this value
   */
  maxFontSizeMultiplier?: ?number,

  /**
   * Used to locate this view from native code.
   *
   * See https://reactnative.dev/docs/text#nativeid
   */
  nativeID?: ?string,

  /**
   * Used to truncate the text with an ellipsis.
   *
   * See https://reactnative.dev/docs/text#numberoflines
   */
  numberOfLines?: ?number,

  /**
   * Invoked on mount and layout changes.
   *
   * See https://reactnative.dev/docs/text#onlayout
   */
  onLayout?: ?(event: LayoutEvent) => mixed,

  /**
   * This function is called on long press.
   *
   * See https://reactnative.dev/docs/text#onlongpress
   */
  onLongPress?: ?(event: PressEvent) => mixed,

  /**
   * This function is called on press.
   *
   * See https://reactnative.dev/docs/text#onpress
   */
  onPress?: ?(event: PressEvent) => mixed,
  onPressIn?: ?(event: PressEvent) => mixed,
  onPressOut?: ?(event: PressEvent) => mixed,
  onResponderGrant?: ?(event: PressEvent) => void,
  onResponderMove?: ?(event: PressEvent) => void,
  onResponderRelease?: ?(event: PressEvent) => void,
  onResponderTerminate?: ?(event: PressEvent) => void,
  onResponderTerminationRequest?: ?() => boolean,
  onStartShouldSetResponder?: ?() => boolean,
  onMoveShouldSetResponder?: ?() => boolean,
  onTextLayout?: ?(event: TextLayoutEvent) => mixed,

  /**
   * Defines how far your touch may move off of the button, before
   * deactivating the button.
   *
   * See https://reactnative.dev/docs/text#pressretentionoffset
   */
  pressRetentionOffset?: ?PressRetentionOffset,

  /**
   * Indicates to accessibility services to treat UI component like a specific role.
   */
  role?: ?Role,

  /**
   * Lets the user select text.
   *
   * See https://reactnative.dev/docs/text#selectable
   */
  selectable?: ?boolean,
  style?: ?TextStyleProp,

  /**
   * Used to locate this view in end-to-end tests.
   *
   * See https://reactnative.dev/docs/text#testid
   */
  testID?: ?string,

  /**
   * Android Only
   */

  /**
   * Used for nested Text accessibility announcements.
   * The nested text accessibilityLabel should set to the values of:
   *
   * Ordinal and Cardinal https://developer.android.com/reference/android/text/style/TtsSpan#ARG_NUMBER
   * Argument used to specify a whole number.
   * The value can be a string of digits of any size optionally prefixed with a - or +.
   * Can be used with TYPE_CARDINAL and TYPE_ORDINAL.
   *
   * Measure refer to  https://developer.android.com/reference/android/text/style/TtsSpan#ARG_UNIT
   * Argument used to specify the unit of a measure.
   * The unit should always be specified in English singular form.
   * Prefixes may be used. Engines will do their best to pronounce them correctly in the language used.
   * Engines are expected to at least support the most common ones like "meter",
   * "second", "degree celsius" and "degree fahrenheit" with some common prefixes like "milli" and "kilo".
   * Can be used with TYPE_MEASURE.
   *
   * Telephone refer to https://developer.android.com/reference/android/text/style/TtsSpan#ARG_NUMBER_PARTS
   * Argument used to specify the main number part of a telephone number.
   * Can be a string of digits where the different parts of the telephone
   * number can be separated with a space, '-', '/' or '.'.
   * Can be used with TYPE_TELEPHONE.
   *
   * Verbatim refer to https://developer.android.com/reference/android/text/style/TtsSpan#ARG_VERBATIM
   * Argument used to specify a string where the characters are read verbatim, except whitespace.
   * Can be used with TYPE_VERBATIM.
   */
  accessibilitySpan?: ?(
    | 'none'
    | 'cardinal'
    | 'ordinal'
    | 'measure'
    | 'telephone'
    | 'verbatim'
  ),

  /**
   * Specifies the disabled state of the text view for testing purposes.
   *
   * See https://reactnative.dev/docs/text#disabled
   */
  disabled?: ?boolean,

  /**
   * The highlight color of the text.
   *
   * See https://reactnative.dev/docs/text#selectioncolor
   */
  selectionColor?: ?string,

  dataDetectorType?: ?('phoneNumber' | 'link' | 'email' | 'none' | 'all'),

  /**
   * Set text break strategy on Android.
   *
   * See https://reactnative.dev/docs/text#textbreakstrategy
   */
  textBreakStrategy?: ?('balanced' | 'highQuality' | 'simple'),

  /**
   * iOS Only
   */
  adjustsFontSizeToFit?: ?boolean,

  /**
   * The Dynamic Text scale ramp to apply to this element on iOS.
   */
  dynamicTypeRamp?: ?(
    | 'caption2'
    | 'caption1'
    | 'footnote'
    | 'subheadline'
    | 'callout'
    | 'body'
    | 'headline'
    | 'title3'
    | 'title2'
    | 'title1'
    | 'largeTitle'
  ),

  /**
   * Smallest possible scale a font can reach.
   *
   * See https://reactnative.dev/docs/text#minimumfontscale
   */
  minimumFontScale?: ?number,

  /**
   * When `true`, no visual change is made when text is pressed down.
   *
   * See https://reactnative.dev/docs/text#supperhighlighting
   */
  suppressHighlighting?: ?boolean,

  /**
   * Set line break strategy on iOS.
   *
   * See https://reactnative.dev/docs/text.html#linebreakstrategyios
   */
  lineBreakStrategyIOS?: ?('none' | 'standard' | 'hangul-word' | 'push-out'),
|}>;
