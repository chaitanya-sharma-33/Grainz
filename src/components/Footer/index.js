import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity, Switch} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import {getUserLocationApi, setCurrentLocation} from '../../connectivity/api';
import url from '../../connectivity/Environment.json';
import {translate, setI18nConfig} from '../../utils/translations';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

let baseURL = url['STAGING_TWO'].BaseURL;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      finalLocation: '',
      locationArr: [],
      finalDataVal: '',
    };
  }

  componentDidMount() {
    this.getUserLocationFun();
  }

  setLocationFun = value => {
    if (value) {
      this.setState(
        {
          finalLocation: value,
          finalDataVal: value,
        },
        () =>
          setTimeout(() => {
            this.setCurrentLocFun(value);
          }, 300),
      );
    }
  };

  setCurrentLocFun = id => {
    setCurrentLocation(id)
      .then(res => {
        this.storeLocationFun(res);
        console.log('res-SETLOC', res);
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  storeLocationFun = async res => {
    const {finalLocation} = this.state;
    console.log('res-STORE', finalLocation);
    await AsyncStorage.setItem('@location', finalLocation);
    const finalData = (res.data && res.data.isFreemium).toString();
    console.log('final', finalData);
    await AsyncStorage.setItem('@isFreemium', finalData);
  };

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

        let defaultValue = res.data.map((item, index) => {
          if (item.isDefault === true) {
            return item.id;
          }
        });
        let finalData = defaultUser.filter(function (element) {
          return element !== undefined;
        });

        let finalDataVal = defaultValue.filter(function (element) {
          return element !== undefined;
        });

        console.log('res-->finalData', finalData);

        this.setState({
          locationArr: finalUsersList,
          finalLocation: finalData[0],
          finalDataVal: finalDataVal[0],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  render() {
    const {finalLocation, locationArr, finalDataVal} = this.state;

    console.log('FinalLoca', finalLocation);
    console.log('baseURL', baseURL.includes('uat'));
    console.log('locationArr', locationArr);
    console.log('finalDataVal', finalDataVal);

    return (
      <View style={styles.container}>
        <View
          style={{
            padding: 6,
            borderRadius: 6,
            flex: 1,
            backgroundColor: '#fff',
          }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
            }}>
            {translate('Location')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              flex: 3,
              height: hp('6%'),
              alignSelf: 'center',
            }}>
            <View
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
                flex: 3,
              }}>
              <RNPickerSelect
                placeholder={{
                  label: 'Please select location*',
                  value: null,
                  color: 'black',
                }}
                onValueChange={value => {
                  this.setLocationFun(value);
                }}
                style={{
                  inputIOS: {
                    fontSize: 14,
                    color: 'black',
                    width: '100%',
                    alignSelf: 'center',
                    fontWeight: 'bold',
                  },
                  inputAndroid: {
                    fontSize: 14,
                    color: 'black',
                    width: '100%',
                    alignSelf: 'center',
                    paddingVertical: 6,
                    fontWeight: 'bold',
                  },
                  iconContainer: {
                    top: '40%',
                  },
                }}
                items={locationArr}
                value={finalDataVal}
                useNativeAndroidPickerStyle={false}
              />
            </View>
            <View style={{marginRight: wp('5%')}}>
              <Image
                source={img.arrowDownIcon}
                resizeMode="contain"
                style={{
                  height: 16,
                  width: 16,
                  resizeMode: 'contain',
                  marginTop: Platform.OS === 'ios' ? 13 : 13,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default index;
