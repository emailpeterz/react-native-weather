// @flow

import React, {Component} from 'react';
import {AppRegistry, ScrollView, Text, View} from 'react-native';
import {
  addNavigationHelpers,
  DrawerItems,
  DrawerNavigator,
  StackNavigator,
  TabNavigator
} from 'react-navigation';
import {ConnectedHomeScreen} from '../HomeScreen';
import {DetailsScreen1} from '../DetailsScreen1';
import {DetailsScreen2} from '../DetailsScreen2';
import {SettingsScreen} from '../SettingsScreen';
import * as css from '../Styles';
import {Icon} from 'react-native-elements';
import {connect, Provider} from 'react-redux';
import {create_store} from '../state/Context';

/**
 * This is where the navigation hierarchy for the app is setup using DrawerNavigator,
 * StackNavigator, and TabNavigator.
 *
 * The Redux store is also wired into the Provider, which sits at the root of the view
 * hierarchy.
 */

//
// TABS
//

const NavTab = TabNavigator(
  // route config
  {
    DetailsRoute1: {screen: DetailsScreen1},
    DetailsRoute2: {screen: DetailsScreen2},
  },
  // navigator config
  {
    lazyLoad      : false, // render the tabs lazily
    tabBarPosition: 'bottom', // where are the tabs shown
    backBehavior  : 'none', // back button doesn't take you to the initial tab
    tabBarOptions : css.tabs,
  },
);

// connect this component to navigation state
@connect(
  (state) => {
    return {navState: state.nav_tab};
  },
)
class NavTabReduxWrapper extends Component {
  render() {
    const {dispatch, navState} = this.props;
    return (
      <NavTab
        navigation={addNavigationHelpers({
                                           dispatch: dispatch,
                                           state   : navState,
                                         })}
      />
    );
  }
}

//
// STACK
//

const titleAndIcon =
        <View style={css.header.container}>
          <Icon name="wb-sunny" color={css.colors.text_light}/>
          <Text style={css.header.text}>Weather App</Text>
        </View>;

const NavStack = StackNavigator(
  // route config
  {
    HomeRoute   : {screen: ConnectedHomeScreen}, // this is displayed first
    DetailsRoute: {screen: NavTabReduxWrapper}, // not NavTab
  },
  // navigator config
  {
    //headerMode: 'none', // this removes the navigation header
    navigationOptions: {
      // label text
      headerTitle: titleAndIcon,
      // other styling
      ...css.header,
    },
  },
);

// connect this component to navigation state
@connect(
  (state) => {
    return {navState: state.nav_stack};
  },
)
class NavStackReduxWrapper extends Component {
  render() {
    const {dispatch, navState} = this.props;
    return (
      <NavStack
        navigation={addNavigationHelpers({
                                           dispatch: dispatch,
                                           state   : navState,
                                         })}
      />
    );
  }
}

//
// DRAWER
//

/**
 * drawer ... more info https://goo.gl/2Dnmtl
 */
const customDrawerComponent = (props) =>
  <ScrollView
    style={{
      flex           : 1,
      backgroundColor: css.drawer.style.backgroundColor,
    }}>
    <DrawerItems {...props} />
  </ScrollView>;

/**
 * more info on why this variable name must begin with CAPITAL letters due to JSX syntax
 * https://goo.gl/nGRaAl
 */
const NavDrawer = DrawerNavigator(
  // route config
  {
    HomeRoute    : {
      screen           : NavStackReduxWrapper, //not NavStack
      navigationOptions: {
        drawerLabel: 'Main App',
        drawerIcon : ({tintColor}) => <Icon name="wb-sunny" color={tintColor}/>,
      },
    },
    SettingsRoute: {
      screen           : SettingsScreen,
      navigationOptions: {
        drawerLabel: 'Settings',
        drawerIcon : ({tintColor}) => <Icon name="settings" color={tintColor}/>,
      },
    },
  },
  // navigator config
  {
    contentComponent: customDrawerComponent,
    drawerPosition  : 'left',
    // styling for for DrawerView.Items in contentOptions
    contentOptions  : css.drawer,
  },
);

// connect this component to navigation state
@connect(
  (state) => {
    return {navState: state.nav_drawer};
  },
)
class NavDrawerReduxWrapper extends Component {
  render() {
    const {dispatch, navState} = this.props;
    return (
      <NavDrawer
        navigation={addNavigationHelpers({
                                           dispatch: dispatch,
                                           state   : navState,
                                         })}
      />
    );
  }
}

// create the store by passing the nav_drawer_reducer to the store creator
const store = create_store(NavDrawer, NavStack, NavTab);

/**
 * Place the Provider at the root of the view hierarchy for Redux.
 *
 * Note that JSX syntax requires the name to start with an uppercase letter!
 * more info - https://goo.gl/nGRaAl
 */
class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <NavDrawerReduxWrapper/>
      </Provider>
    );
  }
}

// wire the WeatherApp to the AppRegistry
AppRegistry.registerComponent('WeatherApp', () => Root);