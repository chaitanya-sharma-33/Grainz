import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getUserLocationApi,
  setCurrentLocation,
  updateUserApi,
} from '../../connectivity/api';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate, setI18nConfig} from '../../utils/translations';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';
import SurePopUp from '../../components/SurePopUp';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      jobTitle: '',
      pageLoader: true,
      buttonsSubHeader: [],
      locationArr: [],
      id: '',
      languageArr: [
        {
          label: translate('French'),
          value: 'fr',
        },
        {
          label: translate('English'),
          value: 'en',
        },
      ],
      finalLang: '',
      finalLocation: '',
      switchValue: false,
      loader: false,
      pickerModalStatus: false,
    };
  }

  closeModalFun = () => {
    this.setState({
      pickerModalStatus: false,
    });
  };

  getProfileData = () => {
    getMyProfileApi()
      .then(res => {
        console.log('res---->USER', res);
        const {firstName, lastName, email, jobTitle, phoneNumber, id} =
          res.data;
        this.setState({
          firstName,
          lastName,
          email,
          jobTitle,
          phoneNumber,
          pageLoader: false,
          id,
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        this.setState({
          pageLoader: false,
        });
        console.warn('ERr', err);
      });
  };

  async componentDidMount() {
    this.getProfileData();
    const location = await AsyncStorage.getItem('@locationName');
    console.log('LocationNAME', location);
    this.getUserLocationFun();
    this.getLanguageFun();
  }

  getLanguageFun = async () => {
    const lan = await AsyncStorage.getItem('Language');
    // console.log('LANNNN', lan);

    this.setState({
      finalLang: lan,
    });

    // if (lan === 'en') {
    //   this.setState({
    //     switchValue: false,
    //   });
    // } else {
    //   this.setState({
    //     switchValue: true,
    //   });
    // }
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
          if (item.isCurrent === true) {
            return item.id;
          }
        });
        let finalData = defaultUser.filter(function (element) {
          return element !== undefined;
        });

        let defaultUserName = res.data.map((item, index) => {
          if (item.isCurrent === true) {
            return item.name;
          }
        });
        let finalDataName = defaultUserName.filter(function (element) {
          return element !== undefined;
        });

        // console.warn('finalDataName', finalDataName[0]);

        this.setState({
          locationArr: finalUsersList,
          finalLocation: finalData[0],
          finalLocationName: finalDataName[0],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  setCurrentLocFun = () => {
    const {finalLocation} = this.state;
    console.log('finllocation', finalLocation);
    setCurrentLocation(finalLocation)
      .then(res => {
        this.storeLocationFun(res);
        // console.log('res-SETLOC', res);
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  storeLocationFun = async res => {
    const {finalLocation, finalLocationName} = this.state;
    console.log('res-STORE', finalLocationName);
    await AsyncStorage.setItem('@location', finalLocation);
    await AsyncStorage.setItem('@locationName', finalLocationName);
    const finalData = (res.data && res.data.isFreemium).toString();
    console.log('final', finalLocationName);
    await AsyncStorage.setItem('@isFreemium', finalData);

    this.setState(
      {
        pageLoader: true,
      },
      () => this.updateUserFunSec(),
    );
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    await AsyncStorage.removeItem('@locationName');

    this.props.UserTokenAction(null);
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  setLocationFun = (value, index) => {
    console.log('index', index);
    const finalIndex = index - 1;
    console.log('finalIndex', finalIndex);
    const {locationArr} = this.state;
    if (value) {
      this.setState({
        finalLocation: value,
        finalLocationName: locationArr[finalIndex].label,
      });
    }
  };

  setLanguageFun = value => {
    if (value) {
      this.setState(
        {
          finalLang: value,
          pageLoader: true,
        },
        () =>
          setTimeout(() => {
            this.languageSelector(value);
          }, 300),
      );
    }
  };

  // toggleSwitch = value => {
  //   this.setState({switchValue: value, loader: true}, () =>
  //     this.languageSelector(),
  //   );
  // };

  languageSelector = async () => {
    let language = '';
    this.state.finalLang === 'fr' ? (language = 'fr') : (language = 'en');
    await AsyncStorage.setItem('Language', language);
    setI18nConfig();
    setTimeout(
      () =>
        this.setState({
          pageLoader: false,
        }),
      2000,
    );
  };

  updateUserFun = () => {
    this.setCurrentLocFun();
  };
  updateUserFunSec = () => {
    const {
      email,
      phoneNumber,
      jobTitle,
      finalLang,
      finalLocation,
      firstName,
      lastName,
      id,
    } = this.state;
    const payload = {
      email: email,
      firstName: firstName,
      id: id,
      jobTitle: jobTitle,
      language: finalLang,
      lastName: lastName,
      phoneNumber: phoneNumber,
    };

    console.log('payload-->', payload);

    updateUserApi(payload)
      .then(res => {
        this.setState(
          {
            pageLoader: false,
          },
          () => this.props.navigation.navigate('HomeScreen'),
        );
        console.log('Res', res);
      })
      .catch(err => {
        console.log('err', err.response);
        console.warn('ERr', err);
      });
  };

  render() {
    const {
      pageLoader,
      jobTitle,
      email,
      phoneNumber,
      firstName,
      lastName,
      buttonsSubHeader,
      locationArr,
      finalLocation,
      loader,
      languageArr,
      finalLang,
      finalLocationName,
      pickerModalStatus,
    } = this.state;

    console.log('locationArr', locationArr);
    console.log('finalLocationName', finalLocationName);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
          finalLocation={finalLocationName}
        />

        <ScrollView
          style={styles.subContainer}
          showsVerticalScrollIndicator={false}>
          {pageLoader ? (
            <ActivityIndicator color="#5297c1" size="large" />
          ) : (
            <View>
              <TouchableOpacity
                style={styles.subContainer}
                onPress={() => this.props.navigation.goBack()}>
                <View style={styles.firstContainer}>
                  <View style={styles.goBackContainer}>
                    <Image source={img.backIcon} style={styles.tileImageBack} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.adminTextStyle}>
                      {translate('Profile')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  marginHorizontal: wp('7%'),
                }}>
                <View
                  style={{
                    padding: 5,
                    borderRadius: 6,
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    {translate('First name')}
                  </Text>
                  <TextInput
                    value={firstName}
                    placeholder={translate('First name')}
                    style={{
                      paddingVertical: 10,
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                    editable={false}
                  />
                </View>
                <View
                  style={{
                    padding: 5,
                    borderRadius: 6,
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    {translate('Last name')}
                  </Text>
                  <TextInput
                    value={lastName}
                    placeholder={translate('Last name')}
                    style={{
                      paddingVertical: 10,
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                    editable={false}
                  />
                </View>
              </View>

              <View
                style={{
                  padding: 5,
                  borderRadius: 6,
                  flex: 1,
                  marginHorizontal: wp('7%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Email')}
                </Text>
                <TextInput
                  value={email}
                  placeholder={translate('Email')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  editable={false}
                />
              </View>

              <View
                style={{
                  padding: 6,
                  borderRadius: 6,
                  flex: 1,
                  marginHorizontal: wp('7%'),
                  backgroundColor: '#fff',
                  marginBottom: hp('2%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('job')}
                </Text>
                <TextInput
                  value={jobTitle}
                  placeholder={translate('job')}
                  style={{
                    paddingVertical: 8,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      jobTitle: value,
                    })
                  }
                />
              </View>

              <View
                style={{
                  padding: 6,
                  borderRadius: 6,
                  flex: 1,
                  marginHorizontal: wp('6%'),
                  backgroundColor: '#fff',
                  marginBottom: hp('2%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Mobile phone')}
                </Text>
                <TextInput
                  value={phoneNumber}
                  keyboardType="numeric"
                  placeholder={translate('Mobile phone')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      phoneNumber: value,
                    })
                  }
                />
              </View>

              <View
                style={{
                  padding: 6,
                  borderRadius: 6,
                  flex: 1,
                  marginHorizontal: wp('6%'),
                  backgroundColor: '#fff',
                  marginBottom: hp('2%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Location')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flex: 3,
                    height: hp('5%'),
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
                        label: translate('Please select location*'),
                        value: null,
                        color: 'black',
                      }}
                      onValueChange={(value, index) => {
                        this.setLocationFun(value, index);
                      }}
                      style={{
                        inputIOS: {
                          fontSize: 14,
                          color: 'black',
                          width: '100%',
                          alignSelf: 'center',
                          fontWeight: 'bold',
                          paddingVertical: 10,
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
                      value={finalLocation}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => {
                        return (
                          <View style={{marginRight: wp('5%')}}>
                            <Image
                              source={img.arrowDownIcon}
                              resizeMode="contain"
                              style={{
                                height: 16,
                                width: 16,
                                resizeMode: 'contain',
                                position: 'absolute',
                              }}
                            />
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              </View>

              <View
                style={{
                  padding: 6,
                  borderRadius: 6,
                  flex: 1,
                  marginHorizontal: wp('6%'),
                  backgroundColor: '#fff',
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Language')}
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
                        label: translate('Please select language*'),
                        value: null,
                        color: 'black',
                      }}
                      placeholderTextColor="red"
                      onValueChange={value => {
                        this.setLanguageFun(value);
                      }}
                      style={{
                        inputIOS: {
                          fontSize: 14,
                          color: 'black',
                          width: '100%',
                          alignSelf: 'center',
                          fontWeight: 'bold',
                          paddingVertical: 10,
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
                      items={languageArr}
                      value={finalLang}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => {
                        return (
                          <View style={{marginRight: wp('5%')}}>
                            <Image
                              source={img.arrowDownIcon}
                              resizeMode="contain"
                              style={{
                                height: 16,
                                width: 16,
                                resizeMode: 'contain',
                                position: 'absolute',
                              }}
                            />
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* <View style={styles.dataContainer}>
                <View style={styles.dataFirstContainer}>
                  <Text style={styles.textStyling}>
                    {translate('Language')}
                  </Text>
                </View>
                <View style={styles.dataSecondContainer}>
                  <View style={styles.langContainer}>
                    <Text style={styles.langStyling}>English</Text>
                    <Switch
                      thumbColor={'#94BB3B'}
                      trackColor={{false: 'grey', true: 'grey'}}
                      ios_backgroundColor="white"
                      onValueChange={this.toggleSwitch}
                      value={this.state.switchValue}
                    />
                    <Text style={styles.langStyling}>Français</Text>
                  </View>
                </View>
              </View> */}
              <View style={styles.dataContainer}>
                <View style={styles.dataSecondContainer}></View>
                <TouchableOpacity
                  onPress={() => this.removeToken()}
                  style={{
                    ...styles.dataFirstContainer,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.textStyling}>{translate('Logout')}</Text>
                  <Image
                    source={img.logOutIcon}
                    style={styles.logOutIconStyling}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => this.updateUserFun()}
                style={{
                  width: wp('90%'),
                  height: hp('7%'),
                  backgroundColor: '#5297c1',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                  marginTop: hp('3%'),
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {translate('Save')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() =>
                //   this.setState({
                //     pickerModalStatus: true,
                //   })
                // }
                onPress={() => this.props.navigation.goBack()}
                style={{
                  width: wp('90%'),
                  height: hp('7%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: '#5297c1',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {translate('Cancel')}
                </Text>
              </TouchableOpacity>
              <SurePopUp
                pickerModalStatus={pickerModalStatus}
                headingText="Heading"
                crossFun={() => this.closeModalFun()}
                extraButton
                extraButtonText="Discard"
                bodyText="Are you sure!"
                cancelFun={() => this.closeModalFun()}
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    UserTokenReducer: state.UserTokenReducer,
    GetMyProfileReducer: state.GetMyProfileReducer,
  };
};

export default connect(mapStateToProps, {UserTokenAction})(index);
