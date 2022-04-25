import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/Login';
import AppIntroScreen from '../screens/Intro';
import ContactUsScreen from '../screens/ContactUs';

const AuthNav = createStackNavigator();

export default function AuthNavFun() {
  return (
    <AuthNav.Navigator headerMode="none">
      <AuthNav.Screen name="AppIntroScreen" component={AppIntroScreen} />
      <AuthNav.Screen name="LoginScreen" component={LoginScreen} />
      <AuthNav.Screen name="ContactUsScreen" component={ContactUsScreen} />
    </AuthNav.Navigator>
  );
}
