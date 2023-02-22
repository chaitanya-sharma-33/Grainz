import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {loginApi, forgotPassApi} from '../../connectivity/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {translate, setI18nConfig} from '../../utils/translations';
import Loader from '../../components/Loader';
import Header from '../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';

var querystring = require('querystring');

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      emailError: '',
      password: '',
      passwordError: '',
      buttonLoader: false,
      switchValue: false,
      loader: false,
      passStatus: true,
      switchValueRemember: false,
      forgetPassModal: false,
      resetEmail: '',
    };
  }

  async componentDidMount() {
    // const rememberMe = await AsyncStorage.getItem('RememberMe');
    // const rememberEmail = await AsyncStorage.getItem('email');
    // const rememberPass = await AsyncStorage.getItem('password');

    // if (rememberMe != null && rememberMe != undefined && rememberMe == 'true') {
    //   this.setState({
    //     switchValueRemember: rememberMe,
    //     email: rememberEmail,
    //     password: rememberPass,
    //   });
    // } else {
    //   this.setState({
    //     switchValueRemember: false,
    //     email: '',
    //     password: '',
    //   });
    // }
    setI18nConfig();

    const lang = await AsyncStorage.getItem('Language');
    if (lang !== null && lang !== undefined) {
      if (lang == 'en') {
        this.setState({
          switchValue: false,
          loader: false,
        });
        setI18nConfig();
      } else {
        this.setState({
          switchValue: true,
          loader: false,
        });
        setI18nConfig();
      }
    } else {
      await AsyncStorage.setItem('Language', 'en');
      this.setState({switchValue: false, loader: false});
      setI18nConfig();
    }
  }

  verification = () => {
    let emailError = '';
    let passwordError = '';
    let formIsValid = true;

    if (this.state.email === '') {
      emailError = 'Email can not be empty';
      formIsValid = false;
    }
    if (this.state.password === '') {
      passwordError = 'Passsword can not be empty';
      formIsValid = false;
    }

    this.setState({
      emailError: emailError,
      passwordError: passwordError,
    });

    if (formIsValid == true) {
      return true;
    } else {
      return false;
    }
  };

  storeData = async value => {
    try {
      await AsyncStorage.setItem('@appToken', value);
      this.props.UserTokenAction(value);
    } catch (e) {
      console.warn('e', e);
    }
  };

  signInFun = async () => {
    if (this.verification()) {
      const {email, password, switchValueRemember} = this.state;
      const payload = {
        username: email.trim(),
        password: password.trim(),
        grant_type: 'password',
      };

      // if (switchValueRemember === true) {
      //   await AsyncStorage.setItem('RememberMe', 'true');
      //   await AsyncStorage.setItem('email', email);
      //   await AsyncStorage.setItem('password', password);
      // } else {
      //   this.setState(
      //     {
      //       switchValueRemember: false,
      //     },
      //     await AsyncStorage.setItem('RememberMe', 'false'),
      //   );
      // }

      console.log('payload', payload);

      const finalData = querystring.stringify(payload);
      this.setState({
        buttonLoader: true,
      });

      loginApi(finalData)
        .then(res => {
          this.storeData(res.data.access_token);
          this.setState({
            buttonLoader: false,
          });
        })
        .catch(err => {
          console.warn('ERR', err.response);
          this.setState({
            buttonLoader: false,
          });
          Alert.alert(
            'Error',
            err.response && err.response.data && err.response.data.error,
            [{text: 'Okay', onPress: () => console.log('OK Pressed')}],
          );
        });
    }
  };

  toggleSwitch = value => {
    this.setState({switchValue: value, loader: true}, () =>
      this.languageSelector(),
    );
  };

  languageSelector = async () => {
    let language = '';
    this.state.switchValue === true ? (language = 'fr') : (language = 'en');
    await AsyncStorage.setItem('Language', language);
    setI18nConfig();
    setTimeout(
      () =>
        this.setState({
          loader: false,
        }),
      2000,
    );
  };

  rememberMeFun = value => {
    this.setState({
      switchValueRemember: value,
    });
  };

  setModalVisibleForgetPass = value => {
    this.setState({
      forgetPassModal: value,
    });
  };

  sendLinkFun = () => {
    const {resetEmail} = this.state;
    let payload = {
      email: resetEmail,
      clientURI: 'string',
    };
    console.log('Payload', payload);

    forgotPassApi(payload)
      .then(res => {
        this.setState({
          forgetPassModal: false,
        });
      })
      .catch(err => {
        console.log('ERR', err);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () =>
              this.setState({
                forgetPassModal: false,
              }),
          },
        ]);
      });
  };

  render() {
    const {
      loader,
      passStatus,
      switchValueRemember,
      forgetPassModal,
      resetEmail,
    } = this.state;
    // console.log('switchValueRemember', switchValueRemember);
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          enableOnAndroid>
          <Loader loaderComp={loader} />
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
          </View>
          <View style={styles.secondContainer}>
            <View style={styles.imageContainer}>
              {/* <Image source={img.appLogo} style={styles.logoStyling} /> */}
              <Text style={styles.textStylingLogo}>
                {translate('Log in to your account')}
              </Text>
            </View>
            <View>
              <View style={styles.insideContainer}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 5,
                    // marginBottom: hp('3%'),
                  }}>
                  <View
                    style={{
                      marginLeft: '5%',
                      marginTop: '2.5%',
                    }}>
                    <Text style={styles.textStyling}>
                      {translate('username')}
                    </Text>
                  </View>
                  <TextInput
                    value={this.state.email}
                    onChangeText={value =>
                      this.setState({
                        email: value,
                        emailError: '',
                      })
                    }
                    // placeholder={translate('username')}
                    style={styles.textInputStyling}
                  />
                </View>
                {this.state.emailError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorStyling}>
                      {this.state.emailError}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 5,
                    marginTop: hp('2.5%'),
                  }}>
                  <View style={styles.passContainer}>
                    <Text style={styles.textStyling}>
                      {translate('Password')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <TextInput
                      value={this.state.password}
                      secureTextEntry={passStatus}
                      onChangeText={value =>
                        this.setState({
                          password: value,
                          passwordError: '',
                        })
                      }
                      // placeholder={translate('Password')}
                      style={styles.textInputStyling}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          passStatus: !passStatus,
                        })
                      }
                      style={{}}>
                      <Image
                        source={passStatus ? img.eyeCloseIcon : img.eyeOpenIcon}
                        style={{
                          width: 25,
                          height: 25,
                          resizeMode: 'contain',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {this.state.passwordError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorStyling}>
                      {this.state.passwordError}
                    </Text>
                  </View>
                ) : null}
                {/* <View style={styles.langContainer}>
                  <Text style={styles.langStyling}>English</Text>
                  <Switch
                    thumbColor={'#94BB3B'}
                    trackColor={{false: 'grey', true: 'grey'}}
                    ios_backgroundColor="white"
                    onValueChange={this.toggleSwitch}
                    value={this.state.switchValue}
                  />
                  <Text style={styles.langStyling}>Français</Text>
                </View> */}
                <View style={{flexDirection: 'row', marginTop: 15}}>
                  <View>
                    <CheckBox
                      value={switchValueRemember}
                      onValueChange={value => this.rememberMeFun(value)}
                      style={{
                        height: 18,
                        width: 18,
                        marginRight: 10,
                      }}
                    />
                    {/* <Switch
                            thumbColor={'#94BB3B'}
                            trackColor={{false: 'grey', true: 'grey'}}
                            ios_backgroundColor="white"
                            onValueChange={value =>
                              this.addDataFun(
                                'index',
                                'isRollingAverageUsed',
                                value,
                                'rollingAveragePrice',
                                'quantityOrdered',
                                'isRollingAverageUsed',
                                'all',
                              )
                            }
                            value={switchValue}
                          /> */}
                  </View>
                  <Text
                    style={{
                      color: '#222526',
                      fontSize: 14,
                      fontFamily: 'Inter-Regular',
                    }}>
                    {translate('Remember me')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => this.signInFun()}
                  style={styles.signInStyling}>
                  {this.state.buttonLoader ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.signInStylingText}>
                      {translate('Login')}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.setModalVisibleForgetPass(true)}
                  style={styles.forgotPassStyling}>
                  {this.state.buttonLoader ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{}}>{translate('Forgoten Password?')}</Text>
                  )}
                </TouchableOpacity>
                <Modal isVisible={forgetPassModal} backdropOpacity={0.35}>
                  <View
                    style={{
                      width: wp('80%'),
                      height: hp('35%'),
                      backgroundColor: '#fff',
                      alignSelf: 'center',
                      borderRadius: 10,
                    }}>
                    <View
                      style={{
                        height: hp('7%'),
                        flexDirection: 'row',
                      }}>
                      <View
                        style={{
                          flex: 3,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                          {translate('Forgoten Password?')}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <TouchableOpacity
                          onPress={() => this.setModalVisibleForgetPass(false)}>
                          <Image
                            source={img.cancelIcon}
                            style={{
                              height: 22,
                              width: 22,
                              resizeMode: 'contain',
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{padding: hp('3%')}}>
                      {/* <View>
                        <Image
                          style={{
                            width: wp('60%'),
                            height: 100,
                            resizeMode: 'cover',
                          }}
                          source={{uri: imageData.path}}
                        />
                      </View> */}
                      <View style={{}}>
                        <TextInput
                          placeholder="Email"
                          value={resetEmail}
                          style={{
                            borderWidth: 1,
                            padding: 12,
                            marginBottom: hp('3%'),
                            justifyContent: 'space-between',
                            marginTop: 20,
                          }}
                          onChangeText={value => {
                            this.setState({
                              resetEmail: value,
                            });
                          }}
                        />
                      </View>

                      <TouchableOpacity
                        onPress={() => this.sendLinkFun()}
                        style={{
                          width: wp('70%'),
                          height: hp('5%'),
                          alignSelf: 'flex-end',
                          backgroundColor: '#5297C1',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 10,
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 'bold',
                          }}>
                          {translate('Reset Password')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    LoginReducer: state.LoginReducer,
    SocialLoginReducer: state.SocialLoginReducer,
  };
};

export default connect(mapStateToProps, {UserTokenAction})(index);
