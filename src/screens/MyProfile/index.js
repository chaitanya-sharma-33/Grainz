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
      languageArr: [
        {
          label: 'French',
          value: 'fr',
        },
        {
          label: 'English',
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
        const {firstName, lastName, email, jobTitle, phoneNumber} = res.data;
        this.setState({
          firstName,
          lastName,
          email,
          jobTitle,
          phoneNumber,
          pageLoader: false,
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

  componentDidMount() {
    this.getProfileData();
    this.getUserLocationFun();
    this.getLanguageFun();
  }

  getLanguageFun = async () => {
    const lan = await AsyncStorage.getItem('Language');
    console.log('LANNNN', lan);

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
        this.setState({
          locationArr: finalUsersList,
          finalLocation: finalData[0],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  setCurrentLocFun = id => {
    setCurrentLocation(id)
      .then(res => {})
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  setLocationFun = value => {
    if (value) {
      this.setState(
        {
          finalLocation: value,
        },
        () =>
          setTimeout(() => {
            this.setCurrentLocFun(value);
          }, 300),
      );
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

      pickerModalStatus,
    } = this.state;
    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* <Loader loaderComp={loader} /> */}

        <ScrollView style={styles.subContainer}>
          {pageLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View>
              <View style={styles.subContainer}>
                <View style={styles.firstContainer}>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={styles.goBackContainer}>
                    <Image source={img.backIcon} style={styles.tileImageBack} />
                  </TouchableOpacity>
                  <View style={styles.flex}>
                    <Text style={styles.adminTextStyle}>
                      {translate('Profile')}
                    </Text>
                  </View>
                  {/* <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.goBackContainer}>
                  <Text style={styles.goBackTextStyle}>
                    {translate('Go Back')}
                  </Text>
                </TouchableOpacity> */}
                </View>
              </View>

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
                    style={{paddingVertical: 10, fontWeight: 'bold'}}
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
                    style={{paddingVertical: 10, fontWeight: 'bold'}}
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
                  style={{paddingVertical: 10, fontWeight: 'bold'}}
                  editable={false}
                />
              </View>

              <View
                style={{
                  padding: 5,
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
                  style={{paddingVertical: 8, fontWeight: 'bold'}}
                  editable={false}
                />
              </View>

              <View
                style={{
                  padding: 5,
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
                  placeholder={translate('Mobile phone')}
                  style={{paddingVertical: 10, fontWeight: 'bold'}}
                  editable={false}
                />
              </View>

              <View
                style={{
                  padding: 5,
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
                      placeholderTextColor="red"
                      onValueChange={value => {
                        this.setLocationFun(value);
                      }}
                      style={{
                        inputIOS: {
                          fontSize: 14,
                          color: '#161C27',
                          width: '100%',
                          alignSelf: 'center',
                        },
                        inputAndroid: {
                          fontSize: 14,
                          color: '#161C27',
                          width: '100%',
                          alignSelf: 'center',
                          paddingVertical: 6,
                        },
                        iconContainer: {
                          top: '40%',
                        },
                      }}
                      items={locationArr}
                      value={finalLocation}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                  <View style={{marginRight: wp('5%')}}>
                    <Image
                      source={img.arrowDownIcon}
                      resizeMode="contain"
                      style={{
                        height: 15,
                        width: 15,
                        resizeMode: 'contain',
                        marginTop: Platform.OS === 'ios' ? 13 : 13,
                      }}
                    />
                  </View>
                </View>
              </View>

              <View
                style={{
                  padding: 5,
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
                        label: 'Please select language*',
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
                          color: '#161C27',
                          width: '100%',
                          alignSelf: 'center',
                        },
                        inputAndroid: {
                          fontSize: 14,
                          color: '#161C27',
                          width: '100%',
                          alignSelf: 'center',
                          paddingVertical: 6,
                        },
                        iconContainer: {
                          top: '40%',
                        },
                      }}
                      items={languageArr}
                      value={finalLang}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                  <View style={{marginRight: wp('5%')}}>
                    <Image
                      source={img.arrowDownIcon}
                      resizeMode="contain"
                      style={{
                        height: 15,
                        width: 15,
                        resizeMode: 'contain',
                        marginTop: Platform.OS === 'ios' ? 13 : 13,
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
              {/* <View style={styles.dataContainer}>
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
              </View> */}
              <TouchableOpacity
                onPress={() => this.createOrder()}
                style={{
                  width: wp('90%'),
                  height: hp('5%'),
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
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  {translate('Save')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    pickerModalStatus: true,
                  })
                }
                style={{
                  width: wp('90%'),
                  height: hp('5%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: '#5297c1',
                    fontSize: 14,
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
