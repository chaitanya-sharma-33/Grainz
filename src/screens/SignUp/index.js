import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {Component} from 'react';
import styles from './style';
import {WebView} from 'react-native-webview';
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export class index extends Component {
  render() {
    return (
      <View style={styles.container}>
        {/* <View
          style={{
            height: hp('10%'),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={{
              flex: 2,
              marginLeft: 20,
            }}>
            <Image
              source={img.appLogo}
              style={{
                height: 100,
                width: 150,
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}></View>
        </View> */}
        <WebView
          startInLoadingState={true}
          renderLoading={() => {
            return (
              <View style={{flex: 1}}>
                <ActivityIndicator size="large" color="grey" />
              </View>
            );
          }}
          originWhitelist={['*']}
          source={{
            uri: 'https://grainz.com/#/auth/signup',
          }}
          style={{
            flex: 1,
            backgroundColor: '#F0F4FE',
          }}
        />
      </View>
    );
  }
}

export default index;
