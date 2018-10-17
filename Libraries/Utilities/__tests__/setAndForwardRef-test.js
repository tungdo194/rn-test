/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+react_native
 */

'use strict';

const React = require('React');
const ReactTestRenderer = require('react-test-renderer');

const setAndForwardRef = require('setAndForwardRef');

describe('setAndForwardRef', () => {
  let innerFuncCalled = false;
  let outerFuncCalled = false;

  class ForwardedComponent extends React.Component<{||}> {
    testFunc() {
      innerFuncCalled = true;
      return true;
    }

    render() {
      return null;
    }
  }

  type Props = $ReadOnly<{|
    callFunc?: ?boolean,
    forwardedRef: React.Ref<typeof ForwardedComponent>,
  |}>;

  class TestComponent extends React.Component<Props> {
    _nativeRef: ?React.ElementRef<typeof ForwardedComponent> = null;
    _setNativeRef = setAndForwardRef({
      getForwardedRef: () => this.props.forwardedRef,
      setLocalRef: ref => {
        this._nativeRef = ref;
      },
    });

    componentDidMount() {
      if (this.props.callFunc) {
        outerFuncCalled = this._nativeRef && this._nativeRef.testFunc();
      }
    }

    render() {
      return <ForwardedComponent ref={this._setNativeRef} />;
    }
  }

  // $FlowFixMe - TODO T29156721 `React.forwardRef` is not defined in Flow, yet.
  const TestComponentWithRef = React.forwardRef((props, ref) => (
    <TestComponent {...props} forwardedRef={ref} />
  ));

  beforeEach(() => {
    innerFuncCalled = false;
    outerFuncCalled = false;
  });

  it('should forward refs (function-based)', () => {
    let testRef: ?React.ElementRef<typeof ForwardedComponent> = null;

    ReactTestRenderer.create(
      <TestComponentWithRef
        ref={ref => {
          testRef = ref;
        }}
      />,
    );

    const val = testRef && testRef.testFunc();

    expect(innerFuncCalled).toBe(true);
    expect(val).toBe(true);
  });

  it('should forward refs (createRef-based)', () => {
    const createdRef = React.createRef<typeof ForwardedComponent>();

    ReactTestRenderer.create(<TestComponentWithRef ref={createdRef} />);

    const val = createdRef.current && createdRef.current.testFunc();

    expect(innerFuncCalled).toBe(true);
    expect(val).toBe(true);
  });

  it('should forward refs (string-based)', () => {
    class Test extends React.Component<{||}> {
      refs: $ReadOnly<{|
        stringRef?: ?React.ElementRef<typeof ForwardedComponent>,
      |}>;

      componentDidMount() {
        this.refs.stringRef && this.refs.stringRef.testFunc();
      }

      render() {
        /**
         * Can't directly pass the test component to `ReactTestRenderer.create`,
         * otherwise it will throw. See:
         * https://reactjs.org/warnings/refs-must-have-owner.html#strings-refs-outside-the-render-method
         */
        /* eslint-disable react/no-string-refs */
        return <TestComponentWithRef ref="stringRef" />;
        /* eslint-enable react/no-string-refs */
      }
    }

    ReactTestRenderer.create(<Test />);

    expect(innerFuncCalled).toBe(true);
  });

  it('should be able to use the ref from inside of the forwarding class', () => {
    expect(() =>
      ReactTestRenderer.create(<TestComponentWithRef callFunc={true} />),
    ).not.toThrow();

    expect(innerFuncCalled).toBe(true);
    expect(outerFuncCalled).toBe(true);
  });
});
