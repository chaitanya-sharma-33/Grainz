import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity, Switch} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import {getUserLocationApi} from '../../connectivity/api';
import url from '../../connectivity/Environment.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

let baseURL = url['STAGING_TWO'].BaseURL;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      finalLocation: '',
    };
  }

  async componentDidMount() {
    const location = await AsyncStorage.getItem('@locationName');
    if (location) {
      this.setState({
        finalLocation: location,
      });
      console.log('LOCATION', location);
    } else {
      this.getUserLocationFun();
    }
  }

  getUserLocationFun = () => {
    getUserLocationApi()
      .then(res => {
        console.log('res-->LOC', res);
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        let defaultUser = res.data.map((item, index) => {
          if (item.isDefault === true) {
            return item.name;
          }
        });
        let finalData = defaultUser.filter(function (element) {
          return element !== undefined;
        });
        this.setState({
          locationArr: finalUsersList,
          finalLocation: finalData[0],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  render() {
    const {finalLocation} = this.state;

    // console.log('FinalLoca', finalLocation);
    // console.log('baseURL', baseURL.includes('uat'));

    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
          <TouchableOpacity
            onPress={this.props.logoFun}
            style={{
              flex: 2,
              marginLeft: 20,
            }}>
            <Image
              source={img.appLogo}
              style={{
                height: 60,
                width: 150,
                resizeMode: 'contain',
              }}
            />

            <View
              style={{
                justifyContent: 'space-around',
                flexDirection: 'row',
              }}>
              {baseURL.includes('uat') ? (
                <View
                  style={{
                    backgroundColor: '#428855',
                    padding: 5,
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                    }}>
                    UAT
                  </Text>
                </View>
              ) : baseURL.includes('dev') ? (
                <View
                  style={{
                    backgroundColor: '#428855',
                    padding: 5,
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                    }}>
                    DEV
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={this.props.logoutFun}
              style={{
                width: 45,
                height: 45,
                borderRadius: 60 / 2,
                borderColor: 'black',
              }}>
              <Image
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'contain',
                }}
                source={img.profilePhotoIcon}
              />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: '#428855',
                padding: 5,
                borderRadius: 10,
                marginTop: 12,
              }}>
              <Text
                style={{
                  color: '#fff',
                }}>
                {this.props.finalLocation
                  ? this.props.finalLocation
                  : finalLocation}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default index;
