/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

jest
  .disableAutomock()
  .setMock('Text', {})
  .setMock('View', {})
  .setMock('Image', {})
  .setMock('React', {Component: class {}})
  .setMock('NativeModules', {
    NativeAnimatedModule: {},
  })
  // findNodeHandle is imported from ReactNative so mock that whole module.
  .setMock('ReactNative', {findNodeHandle: () => 1});

const Animated = require('Animated');

function createAndMountComponent(ComponentClass, props) {
  const component = new ComponentClass();
  component.props = props;
  component.componentWillMount();
  // Simulate that refs were set.
  component._component = {};
  component.componentDidMount();
  return component;
}

describe('Animated', () => {

  let nativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

  beforeEach(() => {
    nativeAnimatedModule.createAnimatedNode = jest.fn();
    nativeAnimatedModule.connectAnimatedNodes = jest.fn();
    nativeAnimatedModule.disconnectAnimatedNodes = jest.fn();
    nativeAnimatedModule.startAnimatingNode = jest.fn();
    nativeAnimatedModule.stopAnimation = jest.fn();
    nativeAnimatedModule.setAnimatedNodeValue = jest.fn();
    nativeAnimatedModule.connectAnimatedNodeToView = jest.fn();
    nativeAnimatedModule.disconnectAnimatedNodeFromView = jest.fn();
    nativeAnimatedModule.dropAnimatedNode = jest.fn();

    // jest environment doesn't have cancelAnimationFrame :(
    if (!global.cancelAnimationFrame) {
      global.cancelAnimationFrame = jest.fn();
    }
  });

  it('creates and detaches nodes', () => {
    const anim = new Animated.Value(0);
    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: anim,
      },
    });

    Animated.timing(anim, {toValue: 10, duration: 1000, useNativeDriver: true}).start();

    c.componentWillUnmount();

    expect(nativeAnimatedModule.createAnimatedNode.mock.calls.length).toBe(3);
    expect(nativeAnimatedModule.connectAnimatedNodes.mock.calls.length).toBe(2);

    expect(nativeAnimatedModule.startAnimatingNode).toBeCalledWith(
      jasmine.any(Number),
      jasmine.any(Number),
      {type: 'frames', frames: jasmine.any(Array), toValue: jasmine.any(Number), delay: jasmine.any(Number)},
      jasmine.any(Function)
    );

    expect(nativeAnimatedModule.disconnectAnimatedNodes.mock.calls.length).toBe(2);
    expect(nativeAnimatedModule.dropAnimatedNode.mock.calls.length).toBe(2);
  });

  it('sends a valid description for value, style and props nodes', () => {
    const anim = new Animated.Value(0);
    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: anim,
      },
    });

    Animated.timing(anim, {toValue: 10, duration: 1000, useNativeDriver: true}).start();

    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'value', value: 0, offset: 0 });
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'style', style: { opacity: jasmine.any(Number) }});
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'props', props: { style: jasmine.any(Number) }});
  });

  it('sends a valid graph description for Animated.add nodes', () => {
    const first = new Animated.Value(1);
    const second = new Animated.Value(2);

    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: Animated.add(first, second),
      },
    });

    Animated.timing(first, {toValue: 2, duration: 1000, useNativeDriver: true}).start();
    Animated.timing(second, {toValue: 3, duration: 1000, useNativeDriver: true}).start();

    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'addition', input: jasmine.any(Array) });
    const additionCalls = nativeAnimatedModule.createAnimatedNode.mock.calls.filter(
      (call) => call[1].type === 'addition'
    );
    expect(additionCalls.length).toBe(1);
    const additionCall = additionCalls[0];
    const additionNodeTag = additionCall[0];
    const additionConnectionCalls = nativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
      (call) => call[1] === additionNodeTag
    );
    expect(additionConnectionCalls.length).toBe(2);
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(additionCall[1].input[0], { type: 'value', value: 1, offset: 0 });
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(additionCall[1].input[1], { type: 'value', value: 2, offset: 0 });
  });

  it('sends a valid graph description for Animated.multiply nodes', () => {
    const first = new Animated.Value(2);
    const second = new Animated.Value(1);

    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: Animated.multiply(first, second),
      },
    });

    Animated.timing(first, {toValue: 5, duration: 1000, useNativeDriver: true}).start();
    Animated.timing(second, {toValue: -1, duration: 1000, useNativeDriver: true}).start();

    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'multiplication', input: jasmine.any(Array) });
    const multiplicationCalls = nativeAnimatedModule.createAnimatedNode.mock.calls.filter(
      (call) => call[1].type === 'multiplication'
    );
    expect(multiplicationCalls.length).toBe(1);
    const multiplicationCall = multiplicationCalls[0];
    const multiplicationNodeTag = multiplicationCall[0];
    const multiplicationConnectionCalls = nativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
      (call) => call[1] === multiplicationNodeTag
    );
    expect(multiplicationConnectionCalls.length).toBe(2);
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(multiplicationCall[1].input[0], { type: 'value', value: 2, offset: 0 });
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(multiplicationCall[1].input[1], { type: 'value', value: 1, offset: 0 });
  });

  it('sends a valid graph description for interpolate() nodes', () => {
    const node = new Animated.Value(10);

    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: node.interpolate({
          inputRange: [10, 20],
          outputRange: [0, 1],
        }),
      },
    });

    Animated.timing(node, {toValue: 20, duration: 1000, useNativeDriver: true}).start();

    expect(nativeAnimatedModule.createAnimatedNode).toBeCalledWith(
      jasmine.any(Number),
      { type: 'value', value: 10, offset: 0 }
    );
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), {
        type: 'interpolation',
        inputRange: [10, 20],
        outputRange: [0, 1],
        extrapolateLeft: 'extend',
        extrapolateRight: 'extend',
      });
    const interpolationNodeTag = nativeAnimatedModule.createAnimatedNode.mock.calls.find(
      (call) => call[1].type === 'interpolation'
    )[0];
    const valueNodeTag = nativeAnimatedModule.createAnimatedNode.mock.calls.find(
      (call) => call[1].type === 'value'
    )[0];
    expect(nativeAnimatedModule.connectAnimatedNodes).toBeCalledWith(valueNodeTag, interpolationNodeTag);
  });

  it('sends a valid timing animation description', () => {
    const anim = new Animated.Value(0);
    Animated.timing(anim, {toValue: 10, duration: 1000, useNativeDriver: true}).start();

    expect(nativeAnimatedModule.startAnimatingNode).toBeCalledWith(
      jasmine.any(Number),
      jasmine.any(Number),
      {type: 'frames', frames: jasmine.any(Array), toValue: jasmine.any(Number), delay: jasmine.any(Number)},
      jasmine.any(Function)
    );
  });

  it('proxies `setValue` correctly', () => {
    const anim = new Animated.Value(0);
    Animated.timing(anim, {toValue: 10, duration: 1000, useNativeDriver: true}).start();

    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: anim,
      },
    });

    // We expect `setValue` not to propagate down to `setNativeProps`, otherwise it may try to access `setNativeProps`
    // via component refs table that we override here.
    c.refs = {
      node: {
        setNativeProps: jest.genMockFunction(),
      },
    };

    anim.setValue(0.5);

    expect(nativeAnimatedModule.setAnimatedNodeValue).toBeCalledWith(jasmine.any(Number), 0.5);
    expect(c.refs.node.setNativeProps.mock.calls.length).toBe(0);
  });

  it('doesn\'t call into native API if useNativeDriver is set to false', () => {
    const anim = new Animated.Value(0);

    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: anim,
      },
    });

    Animated.timing(anim, {toValue: 10, duration: 1000, useNativeDriver: false}).start();

    c.componentWillUnmount();

    expect(nativeAnimatedModule.createAnimatedNode).not.toBeCalled();
  });

  it('fails when trying to run non-native animation on native node', () => {
    const anim = new Animated.Value(0);

    const c = createAndMountComponent(Animated.View, {
      style: {
        opacity: anim,
      },
    });

    Animated.timing(anim, {toValue: 10, duration: 50, useNativeDriver: true}).start();
    jest.runAllTimers();

    Animated.timing(anim, {toValue: 4, duration: 500, useNativeDriver: false}).start();
    expect(jest.runAllTimers).toThrow();
  });

  it('fails for unsupported styles', () => {
    const anim = new Animated.Value(0);

    const c = createAndMountComponent(Animated.View, {
      style: {
        left: anim,
      },
    });

    const animation = Animated.timing(anim, {toValue: 10, duration: 50, useNativeDriver: true});
    expect(animation.start).toThrowError(/left/);
  });

  it('works for any `static` props and styles', () => {
    // Passing "unsupported" props should work just fine as long as they are not animated
    const anim = new Animated.Value(0);

    const node = new Animated.__PropsOnlyForTests({
      style: {
        left: 10,
        top: 20,
        opacity: anim,
      },
      removeClippedSubviews: true,
    });
    Animated.timing(anim, {toValue: 10, duration: 50, useNativeDriver: true}).start();
    node.__detach();

    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'style', style: { opacity: jasmine.any(Number) }});
    expect(nativeAnimatedModule.createAnimatedNode)
      .toBeCalledWith(jasmine.any(Number), { type: 'props', props: { style: jasmine.any(Number) }});
  });

  it('sends stopAnimation command to native', () => {
    const value = new Animated.Value(0);
    const animation = Animated.timing(value, {toValue: 10, duration: 50, useNativeDriver: true});

    animation.start();
    expect(nativeAnimatedModule.startAnimatingNode).toBeCalledWith(
      jasmine.any(Number),
      jasmine.any(Number),
      {type: 'frames', frames: jasmine.any(Array), toValue: jasmine.any(Number), delay: jasmine.any(Number)},
      jasmine.any(Function)
    );
    const animationId = nativeAnimatedModule.startAnimatingNode.mock.calls[0][0];

    animation.stop();
    expect(nativeAnimatedModule.stopAnimation).toBeCalledWith(animationId);
  });

});
