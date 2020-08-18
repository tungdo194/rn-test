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

const {BackHandler, StyleSheet, useColorScheme, View} = require('react-native');

const RNTesterExampleContainer = require('./components/RNTesterExampleContainer');
const RNTesterExampleList = require('./components/RNTesterExampleList');
const RNTesterList = require('./utils/RNTesterList');
const React = require('react');
const RNTesterNavBar = require('./components/RNTesterNavbar');
import {
  Screens,
  initialState,
  getExamplesListWithBookmarksAndRecentlyUsed,
  getInitialStateFromAsyncStorage,
} from './utils';

import {useAsyncStorageReducer} from './utils/useAsyncStorageReducer';
import {RNTesterReducer} from './utils/RNTesterReducer';

import {RNTesterThemeContext, themes} from './components/RNTesterTheme';
import {Header} from './components/RNTesterHeader';

const APP_STATE_KEY = 'RNTesterAppState.v3';

const DisplayIfVisible = ({isVisible, children}) => (
  <View style={[styles.container, !isVisible && styles.hidden]}>
    {children}
  </View>
);

const ExampleListsContainer = ({
  theme,
  screen,
  title,
  examplesList,
  toggleBookmark,
  handleExampleCardPress,
  isVisible,
}) => {
  return (
    <DisplayIfVisible isVisible={isVisible}>
      <Header title={title} theme={theme} />
      <DisplayIfVisible isVisible={screen === Screens.COMPONENTS}>
        <RNTesterExampleList
          sections={examplesList.components}
          toggleBookmark={toggleBookmark}
          handleExampleCardPress={handleExampleCardPress}
        />
      </DisplayIfVisible>
      <DisplayIfVisible isVisible={screen === Screens.APIS}>
        <RNTesterExampleList
          sections={examplesList.apis}
          toggleBookmark={toggleBookmark}
          handleExampleCardPress={handleExampleCardPress}
        />
      </DisplayIfVisible>
      <DisplayIfVisible isVisible={screen === Screens.BOOKMARKS}>
        <RNTesterExampleList
          sections={examplesList.bookmarks}
          toggleBookmark={toggleBookmark}
          handleExampleCardPress={handleExampleCardPress}
        />
      </DisplayIfVisible>
    </DisplayIfVisible>
  );
};

const RNTesterApp = () => {
  const [state, dispatch] = useAsyncStorageReducer(
    RNTesterReducer,
    initialState,
    APP_STATE_KEY,
  );

  React.useEffect(() => {
    getInitialStateFromAsyncStorage(APP_STATE_KEY).then(
      initialStateFromStorage => {
        dispatch({
          type: 'initialize_state_from_storage',
          data: initialStateFromStorage,
        });
      },
    );
  }, [dispatch]);

  const {openExample, screen, bookmarks, recentlyUsed} = state;

  const examplesList = React.useMemo(
    () =>
      getExamplesListWithBookmarksAndRecentlyUsed({bookmarks, recentlyUsed}),
    [bookmarks, recentlyUsed],
  );

  // Setup hardware back button press listener
  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (openExample) {
        dispatch({type: 'update_open_example', data: null});
        return true;
      }
      return false;
    });
  }, [dispatch, openExample]);

  const handleExampleCardPress = React.useCallback(
    ({exampleType, key}) => {
      dispatch({type: 'update_open_example', data: {exampleType, key}});
    },
    [dispatch],
  );

  const toggleBookmark = React.useCallback(
    ({exampleType, key}) => {
      dispatch({type: 'toggle_bookmark', data: {exampleType, key}});
    },
    [dispatch],
  );

  const updateScreen = React.useCallback(
    ({screen}) => {
      dispatch({type: 'update_screen', data: screen});
    },
    [dispatch],
  );

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? themes.dark : themes.light;

  if (examplesList === null) {
    return null;
  }

  const ExampleModule = RNTesterList.Modules[openExample];
  const title = Screens.COMPONENTS
    ? 'Components'
    : Screens.APIS
    ? 'APIs'
    : 'Bookmarks';

  return (
    <RNTesterThemeContext.Provider value={theme}>
      {ExampleModule && (
        <View style={styles.container}>
          <Header title={title} theme={theme} />
          <RNTesterExampleContainer module={ExampleModule} />
        </View>
      )}

      <ExampleListsContainer
        isVisible={!ExampleModule}
        screen={screen}
        title={title}
        theme={theme}
        examplesList={examplesList}
        handleExampleCardPress={handleExampleCardPress}
        toggleBookmark={toggleBookmark}
      />
      <View style={styles.bottomNavbar}>
        <RNTesterNavBar screen={screen} updateScreen={updateScreen} />
      </View>
    </RNTesterThemeContext.Provider>
  );
};

export default RNTesterApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavbar: {
    bottom: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
  },
  hidden: {
    display: 'none',
  },
});
