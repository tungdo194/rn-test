/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const ReactNativeStyleAttributes = require('../Components/View/ReactNativeStyleAttributes');
const resolveAssetSource = require('../Image/resolveAssetSource');
const processColor = require('../StyleSheet/processColor').default;
const processColorArray = require('../StyleSheet/processColorArray');
const insetsDiffer = require('../Utilities/differ/insetsDiffer');
const matricesDiffer = require('../Utilities/differ/matricesDiffer');
const pointsDiffer = require('../Utilities/differ/pointsDiffer');
const sizesDiffer = require('../Utilities/differ/sizesDiffer');
const UIManager = require('./UIManager');
const nullthrows = require('nullthrows');

// Memoization cache for previously computed configurations
const configCache = {};

function getNativeComponentAttributes(uiViewClassName: string): any {
  // Check if configuration has been memoized
  if (configCache[uiViewClassName]) {
    return configCache[uiViewClassName];
  }

  const viewConfig = UIManager.getViewManagerConfig(uiViewClassName);

  if (viewConfig == null) {
    return null;
  }

  // TODO: This seems like a whole lot of runtime initialization for every
  // native component that can be either avoided or simplified.
  let { baseModuleName, bubblingEventTypes, directEventTypes } = viewConfig;
  let nativeProps = viewConfig.NativeProps;

  bubblingEventTypes = bubblingEventTypes ?? {};
  directEventTypes = directEventTypes ?? {};

  // Traverse base modules to inherit properties
  while (baseModuleName) {
    const baseModule = UIManager.getViewManagerConfig(baseModuleName);
    if (!baseModule) {
      baseModuleName = null;
    } else {
      bubblingEventTypes = { ...baseModule.bubblingEventTypes, ...bubblingEventTypes };
      directEventTypes = { ...baseModule.directEventTypes, ...directEventTypes };
      nativeProps = { ...baseModule.NativeProps, ...nativeProps };
      baseModuleName = baseModule.baseModuleName;
    }
  }

  const validAttributes: { [string]: mixed } = {};

  // Populate valid attributes with type information
  for (const key in nativeProps) {
    const typeName = nativeProps[key];
    const diff = getDifferForType(typeName);
    const process = getProcessorForType(typeName);

    // If diff or process == null, omit the corresponding property from the Attribute
    validAttributes[key] =
      diff == null
        ? process == null
          ? true
          : { process }
        : process == null
        ? { diff }
        : { diff, process };
  }

  // Unfortunately, the current setup declares style properties as top-level
  // props. This makes it so we allow style properties in the `style` prop.
  // TODO: Move style properties into a `style` prop and disallow them as
  // top-level props on the native side.
  validAttributes.style = ReactNativeStyleAttributes;

  // Update view configuration
  Object.assign(viewConfig, {
    uiViewClassName,
    validAttributes,
    bubblingEventTypes,
    directEventTypes,
  });

  // Attach default event types
  attachDefaultEventTypes(viewConfig);

  // Memoize the configuration
  configCache[uiViewClassName] = viewConfig;

  return viewConfig;
}

// Attach default event types based on platform support
function attachDefaultEventTypes(viewConfig: any) {
  const constants = UIManager.getConstants();
  if (constants.ViewManagerNames || constants.LazyViewManagersEnabled) {
    viewConfig = merge(viewConfig, nullthrows(UIManager.getDefaultEventTypes)());
  } else {
    viewConfig.bubblingEventTypes = merge(viewConfig.bubblingEventTypes, constants.genericBubblingEventTypes);
    viewConfig.directEventTypes = merge(viewConfig.directEventTypes, constants.genericDirectEventTypes);
  }
}

// Merge function for combining event types
function merge(destination: ?Object, source: ?Object): ?Object {
  if (!source) {
    return destination;
  }
  if (!destination) {
    return source;
  }

  for (const key in source) {
    if (!source.hasOwnProperty(key)) {
      continue;
    }

    let sourceValue = source[key];
    if (destination.hasOwnProperty(key)) {
      const destinationValue = destination[key];
      if (typeof sourceValue === 'object' && typeof destinationValue === 'object') {
        sourceValue = merge(destinationValue, sourceValue);
      }
    }
    destination[key] = sourceValue;
  }
  return destination;
}

// Function to retrieve differ function for a given type
function getDifferForType(typeName: string): ?(prevProp: any, nextProp: any) => boolean {
  switch (typeName) {
    case 'CATransform3D':
      return matricesDiffer;
    case 'CGPoint':
      return pointsDiffer;
    case 'CGSize':
      return sizesDiffer;
    case 'UIEdgeInsets':
      return insetsDiffer;
    case 'Point':
      return pointsDiffer;
    case 'EdgeInsets':
      return insetsDiffer;
  }
  return null;
}

// Function to retrieve processor function for a given type
function getProcessorForType(typeName: string): ?(nextProp: any) => any {
  switch (typeName) {
    case 'CGColor':
    case 'UIColor':
      return processColor;
    case 'CGColorArray':
    case 'UIColorArray':
      return processColorArray;
    case 'CGImage':
    case 'UIImage':
    case 'RCTImageSource':
      return resolveAssetSource;
    case 'Color':
      return processColor;
    case 'ColorArray':
      return processColorArray;
    case 'ImageSource':
      return resolveAssetSource;
  }
  return null;
}

module.exports = getNativeComponentAttributes;
