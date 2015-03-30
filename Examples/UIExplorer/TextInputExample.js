/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @flow
 */
'use strict';

var React = require('react-native');
var {
  Text,
  TextInput,
  View,
  StyleSheet,
} = React;

var WithLabel = React.createClass({
  render: function() {
    return (
      <View style={styles.labelContainer}>
        <View style={styles.label}>
          <Text>{this.props.label}</Text>
        </View>
        {this.props.children}
      </View>
    );
  }
});

var TextEventsExample = React.createClass({
  getInitialState: function() {
    return {
      curText: '<No Event>',
      prevText: '<No Event>',
    };
  },

  updateText: function(text) {
    this.setState({
      curText: text,
      prevText: this.state.curText,
    });
  },

  render: function() {
    return (
      <View>
        <TextInput
          autoCapitalize="none"
          placeholder="Enter text to see events"
          autoCorrect={false}
          onFocus={() => this.updateText('onFocus')}
          onBlur={() => this.updateText('onBlur')}
          onChange={(event) => this.updateText(
            'onChange text: ' + event.nativeEvent.text
          )}
          onEndEditing={(event) => this.updateText(
            'onEndEditing text: ' + event.nativeEvent.text
          )}
          onSubmitEditing={(event) => this.updateText(
            'onSubmitEditing text: ' + event.nativeEvent.text
          )}
          style={styles.default}
        />
        <Text style={styles.eventLabel}>
          {this.state.curText}{'\n'}
          (prev: {this.state.prevText})
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  page: {
    paddingBottom: 300,
  },
  default: {
    height: 26,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    flex: 1,
    fontSize: 13,
  },
  multiline: {
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    flex: 1,
    fontSize: 13,
    height: 50,
  },
  eventLabel: {
    margin: 3,
    fontSize: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    flex: 1,
  },
  label: {
    width: 80,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginRight: 10,
    paddingTop: 2,
  },
});

exports.title = '<TextInput>';
exports.description = 'Single-line text inputs.';
exports.examples = [
  {
    title: 'Auto-focus',
    render: function() {
      return <TextInput autoFocus={true} style={styles.default} />;
    }
  },
  {
    title: 'Auto-capitalize',
    render: function() {
      return (
        <View>
          <WithLabel label="none">
            <TextInput
              autoCapitalize="none"
              style={styles.default}
            />
          </WithLabel>
          <WithLabel label="sentences">
            <TextInput
              autoCapitalize="sentences"
              style={styles.default}
            />
          </WithLabel>
          <WithLabel label="words">
            <TextInput
              autoCapitalize="words"
              style={styles.default}
            />
          </WithLabel>
          <WithLabel label="characters">
            <TextInput
              autoCapitalize="characters"
              style={styles.default}
            />
          </WithLabel>
        </View>
      );
    }
  },
  {
    title: 'Keyboard type',
    render: function() {
      return (
        <View>
          <TextInput
            keyboardType="default"
            placeholder="default"
            style={styles.default}
          />
          <TextInput
            keyboardType="ascii"
            placeholder="ascii"
            style={styles.default}
          />
          <TextInput
            keyboardType="email"
            placeholder="email"
            style={styles.default}
          />
          <TextInput
            keyboardType="numbers-and-punctuation"
            placeholder="numbers-and-punctuation"
            style={styles.default}
          />
          <TextInput
            keyboardType="numeric"
            placeholder="numeric"
            style={styles.default}
          />
          <TextInput
            keyboardType="pin"
            placeholder="pin"
            style={styles.default}
          />
          <TextInput
            keyboardType="phone-name"
            placeholder="phone-name"
            style={styles.default}
          />
          <TextInput
            keyboardType="search"
            placeholder="search"
            style={styles.default}
          />
          <TextInput
            keyboardType="twitter"
            placeholder="twitter"
            style={styles.default}
          />
          <TextInput
            keyboardType="url"
            placeholder="url"
            style={styles.default}
          />
        </View>
      );
    }
  },
  {
    title: 'Auto-correct',
    render: function() {
      return (
        <View>
          <WithLabel label="true">
            <TextInput autoCorrect={true} style={styles.default} />
          </WithLabel>
          <WithLabel label="false">
            <TextInput autoCorrect={false} style={styles.default} />
          </WithLabel>
        </View>
      );
    }
  },
  {
    title: 'Event handling',
    render: function(): ReactElement { return <TextEventsExample /> },
  },
  {
    title: 'Colored input text',
    render: function() {
      return (
        <View>
          <TextInput
            style={[styles.default, {color: 'blue'}]}
            value="Blue"
          />
          <TextInput
            style={[styles.default, {color: 'green'}]}
            value="Green"
          />
        </View>
      );
    }
  },
  {
    title: 'Clear button mode',
    render: function () {
      return (
        <View>
          <WithLabel label="never">
            <TextInput
              style={styles.default}
              clearButtonMode="never"
            />
          </WithLabel>
          <WithLabel label="while editing">
            <TextInput
              style={styles.default}
              clearButtonMode="while-editing"
            />
          </WithLabel>
          <WithLabel label="unless editing">
            <TextInput
              style={styles.default}
              clearButtonMode="unless-editing"
            />
          </WithLabel>
          <WithLabel label="always">
            <TextInput
              style={styles.default}
              clearButtonMode="always"
            />
          </WithLabel>
        </View>
      );
    }
  },
];
