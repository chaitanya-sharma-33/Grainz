import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  Image,
} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {loginApi} from '../../connectivity/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {translate, setI18nConfig} from '../../utils/translations';
import Loader from '../../components/Loader';

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
    };
  }

  async componentDidMount() {
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

  signInFun = () => {
    if (this.verification()) {
      const {email, password} = this.state;
      const payload = {
        username: email.trim(),
        password: password.trim(),
        grant_type: 'password',
      };

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

  render() {
    const {loader, passStatus} = this.state;
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          enableOnAndroid>
          <Loader loaderComp={loader} />
          <View style={styles.secondContainer}>
            <View style={styles.imageContainer}>
              <Image source={img.appLogo} style={styles.logoStyling} />
            </View>
            <View>
              <View style={styles.insideContainer}>
                <View>
                  <Text style={styles.textStyling}>
                    {translate('username')}*
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
                  placeholder={translate('username')}
                  style={styles.textInputStyling}
                />
                {this.state.emailError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorStyling}>
                      {this.state.emailError}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.passContainer}>
                  <Text style={styles.textStyling}>
                    {translate('Password')}*
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
                    placeholder={translate('Password')}
                    style={styles.textInputStyling}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        passStatus: !passStatus,
                      })
                    }
                    style={{
                      borderBottomColor: 'grey',
                      borderBottomWidth: 1,
                      paddingVertical: 7.9,
                    }}>
                    <Image
                      source={passStatus ? img.eyeCloseIcon : img.eyeOpenIcon}
                      style={{
                        width: 25,
                        height: 25,
                        resizeMode: 'contain',
                        marginTop: 10,
                      }}
                    />
                  </TouchableOpacity>
                </View>
                {this.state.passwordError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorStyling}>
                      {this.state.passwordError}
                    </Text>
                  </View>
                ) : null}
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
                <TouchableOpacity
                  onPress={() => this.signInFun()}
                  style={styles.signInStyling}>
                  {this.state.buttonLoader ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.signInStylingText}>
                      {' '}
                      {translate('Sign in')}
                    </Text>
                  )}
                </TouchableOpacity>
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
