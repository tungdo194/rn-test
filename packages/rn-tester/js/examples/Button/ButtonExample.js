/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

const React = require('react');

const {
  Alert,
  Button,
  View,
  StyleSheet,
  Text,
  Pressable,
  TouchableNativeFeedback,
} = require('react-native');
const {RNTesterThemeContext} = require('../../components/RNTesterTheme');

function onButtonPress(buttonName) {
  Alert.alert(`Your application has been ${buttonName}!`);
}

exports.displayName = 'ButtonExample';
exports.framework = 'React';
exports.category = 'UI';
exports.title = 'Button';
exports.documentationURL = 'https://reactnative.dev/docs/button';
exports.description = 'Simple React Native button component.';

function TouchableExample(props) {
  return (
    <>
      <View
        style={{backgroundColor: 'red', height: 100, width: 100}}
        accessibilityLabel="accessibilityLabel for View"
        focusable={true}
        accessible={true}></View>
      <TouchableNativeFeedback
        accessibilityLabel="testing"
        accessible={true}
        style={{height: 200, width: 400, backgroundColor: 'red'}}
        importantForAccessibility="yes"
        accessibilityRole="button">
        <Text
          accessible={false}
          focusable={false}
          style={{
            height: 50,
            marginLeft: 50,
            marginTop: 50,
            backgroundColor: 'white',
          }}>
          Text number 1
        </Text>
      </TouchableNativeFeedback>
    </>
  );
}

exports.examples = [
  {
    title: 'Button with default styling',
    render: function (): React.Node {
      return (
        <TouchableExample
          childText="This is the child Text"
          childText2="This is the second child"
        />
      );
    },
  },
];

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
