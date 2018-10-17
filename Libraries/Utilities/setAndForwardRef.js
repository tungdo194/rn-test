/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const invariant = require('fbjs/lib/invariant');

import type React from 'React';

type Args = $ReadOnly<{|
  getForwardedRef: () => ?React.Ref<any>,
  setLocalRef: (ref: React.ElementRef<any>) => mixed,
|}>;

/**
 * This is a helper function for when a component needs to be able to forward a ref
 * to a child component, but still needs to have access to that component as part of
 * its implementation.
 *
 * Its main use case is in wrappers for native components.
 *
 * Usage:
 *
 *   class MyView extends React.Component {
 *     _nativeRef = null;
 *
 *     _setNativeRef = setAndForwardRef({
 *       getForwardedRef: () => this.props.forwardedRef,
 *       setLocalRef: ref => {
 *         this._nativeRef = ref;
 *       },
 *     });
 *
 *     render() {
 *       return <View ref={this._setNativeRef} />;
 *     }
 *   }
 *
 *   const MyViewWithRef = React.forwardRef((props, ref) => (
 *     <MyView {...props} forwardedRef={ref} />
 *   ));
 *
 *   module.exports = MyViewWithRef;
 */

function setAndForwardRef({getForwardedRef, setLocalRef}: Args) {
  return function forwardRef(ref: React.ElementRef<any>) {
    const forwardedRef = getForwardedRef();

    setLocalRef(ref);

    // Forward to user ref prop (if one has been specified)
    // String-based refs cannot be shared.
    if (typeof forwardedRef === 'string') {
      invariant(
        false,
        `String-based refs are not supported on this component. Got ref: '${forwardedRef}'`,
      );
    } else if (typeof forwardedRef === 'function') {
      forwardedRef(ref);
    } else if (typeof forwardedRef === 'object' && forwardedRef != null) {
      forwardedRef.current = ref;
    }
  };
}

module.exports = setAndForwardRef;
