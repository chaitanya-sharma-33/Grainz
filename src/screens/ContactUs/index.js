import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import img from '../../constants/images';
import Header from '../../components/Header';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {getCountriesApi, createProspectApi} from '../../connectivity/api';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate} from '../../utils/translations';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';
import Loader from '../../components/Loader';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      email: '',
      phoneNumber: '',
      businessName: '',
      streetAddress: '',
      townName: '',
      roleArr: [
        {label: 'Owner', value: 'Owner'},
        {label: 'Head Chef', value: 'Head Chef'},
        {label: 'Bar Manager', value: 'Bar Manager'},
        {label: 'Other (Please Specify)', value: 'Other (Please Specify)'},
      ],
      finalRole: '',
      loader: false,
      countriesArr: [],
      finalCountry: '',
      postCode: '',
      messageValue: '',
      finalSpecificRole: '',
    };
  }

  componentDidMount = () => {
    this.getCountriesFun();
  };

  getCountriesFun = () => {
    getCountriesApi()
      .then(res => {
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        this.setState({
          countriesArr: finalUsersList,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  setRoleFun = value => {
    this.setState({
      finalRole: value,
      roleError: '',
    });
  };

  setCountryFun = value => {
    this.setState({
      finalCountry: value,
      countryError: '',
    });
  };

  verification = () => {
    const {
      email,
      phoneNumber,
      firstName,
      finalRole,
      businessName,
      streetAddress,
      townName,
      postCode,
      finalCountry,
      finalSpecificRole,
    } = this.state;
    let emailError = '';
    let nameError = '';
    let phoneNumberError = '';
    let roleError = '';
    let businessNameError = '';
    let streetAddressError = '';
    let townNameError = '';
    let postCodeError = '';
    let countryError = '';
    let finalSpecificRoleError = '';

    let formIsValid = true;

    if (email === '') {
      emailError = 'Email can not be empty';
      formIsValid = false;
    }
    if (firstName === '') {
      nameError = 'Name can not be empty';
      formIsValid = false;
    }
    if (phoneNumber === '') {
      phoneNumberError = 'Phone number can not be empty';
      formIsValid = false;
    }
    if (finalRole === '' || finalRole === null) {
      roleError = 'Please select a role';
      formIsValid = false;
    }

    if (businessName === '') {
      businessNameError = 'Business name can not be empty';
      formIsValid = false;
    }

    if (streetAddress === '') {
      streetAddressError = 'Address can not be empty';
      formIsValid = false;
    }
    if (townName === '') {
      townNameError = 'Town name can not be empty';
      formIsValid = false;
    }
    if (postCode === '') {
      postCodeError = 'Postal code name can not be empty';
      formIsValid = false;
    }
    if (finalCountry === '' || finalCountry === null) {
      countryError = 'Please select a country';
      formIsValid = false;
    }

    if (finalSpecificRole === '' && finalRole === 'Other (Please Specify)') {
      finalSpecificRoleError = 'Role is required';
      formIsValid = false;
    }

    this.setState({
      emailError,
      nameError,
      phoneNumberError,
      roleError,
      businessNameError,
      streetAddressError,
      townNameError,
      postCodeError,
      countryError,
      finalSpecificRoleError,
    });

    if (formIsValid == true) {
      return true;
    } else {
      return false;
    }
  };

  submitFun = () => {
    if (this.verification()) {
      this.setState(
        {
          loader: true,
        },
        () => this.submitFunSec(),
      );
    }
  };

  submitFunSec = () => {
    const {
      email,
      phoneNumber,
      firstName,
      finalRole,
      businessName,
      streetAddress,
      townName,
      postCode,
      finalCountry,
      messageValue,
      finalSpecificRole,
    } = this.state;
    let payload = {
      address: streetAddress,
      company: businessName,
      contactName: firstName,
      countryId: finalCountry,
      email: email,
      message: messageValue,
      postCode: postCode,
      role:
        finalRole === 'Other (Please Specify)' ? finalSpecificRole : finalRole,
      telephone: phoneNumber,
      town: townName,
    };

    console.log('PAY', payload);

    createProspectApi(payload)
      .then(res => {
        this.setState({
          loader: false,
        });
        Alert.alert('Success', 'Prospect added successfully', [
          {text: 'Okay', onPress: () => this.props.navigation.goBack()},
        ]);
      })
      .catch(err => {
        console.warn('ERR', err.response);
        this.setState({
          loader: false,
        });
        Alert.alert(
          'Error',
          err.response &&
            err.response.data &&
            err.response.data.errors[0].message,
          [{text: 'Okay', onPress: () => console.log('OK Pressed')}],
        );
      });
  };
  changeTextFun = (value, data) => {
    if (data === 'firstName') {
      this.setState({
        firstName: value,
        nameError: '',
      });
    } else if (data === 'email') {
      this.setState({
        email: value,
        emailError: '',
      });
    } else if (data === 'phoneNumber') {
      this.setState({
        phoneNumber: value,
        phoneNumberError: '',
      });
    } else if (data === 'finalRole') {
      this.setState({
        finalRole: value,
        roleError: '',
      });
    } else if (data === 'businessName') {
      this.setState({
        businessName: value,
        businessNameError: '',
      });
    } else if (data === 'streetAddress') {
      this.setState({
        streetAddress: value,
        streetAddressError: '',
      });
    } else if (data === 'townName') {
      this.setState({
        townName: value,
        townNameError: ' ',
      });
    } else if (data === 'postCode') {
      this.setState({
        postCode: value,
        postCodeError: '',
      });
    } else if (data === 'messageValue') {
      this.setState({
        messageValue: value,
      });
    } else if (data === 'finalSpecificRole') {
      this.setState({
        finalSpecificRole: value,
        finalSpecificRoleError: '',
      });
    }
  };

  render() {
    const {
      email,
      phoneNumber,
      firstName,
      roleArr,
      finalRole,
      loader,
      businessName,
      streetAddress,
      townName,
      postCode,
      countriesArr,
      finalCountry,
      messageValue,
      nameError,
      emailError,
      phoneNumberError,
      roleError,
      businessNameError,
      streetAddressError,
      townNameError,
      postCodeError,
      countryError,
      finalSpecificRole,
      finalSpecificRoleError,
    } = this.state;
    return (
      <View style={styles.container}>
        <Loader loaderComp={loader} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: wp('100%'),
            justifyContent: 'space-between',
            height: hp('10%'),
            backgroundColor: '#fff',
          }}>
          <View style={{marginLeft: wp('5%')}}>
            <Image
              source={img.grainzLogo}
              style={{width: 100, height: 100, resizeMode: 'contain'}}
            />
          </View>
          <View style={{marginRight: wp('5%')}}>
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => this.props.navigation.navigate('LoginScreen')}>
              <Text
                style={{
                  color: '#1E1E1E',
                  fontWeight: 'bold',
                  fontSize: 18,
                }}>
                Log In{' '}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          enableOnAndroid>
          <View>
            <View
              style={{
                height: hp('5%'),
                marginHorizontal: wp('5%'),
                flexDirection: 'row',
              }}>
              <View style={styles.dataFirstContainer}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  {translate('About You')} -
                </Text>
              </View>
            </View>
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>{translate('Name')}</Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={firstName}
                  placeholder={translate('Name')}
                  style={styles.textInputStyling}
                  onChangeText={value => this.changeTextFun(value, 'firstName')}
                />
              </View>
            </View>
            {nameError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{nameError}</Text>
              </View>
            ) : null}
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>{translate('Email')}</Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={email}
                  keyboardType="email-address"
                  placeholder={translate('Email')}
                  style={styles.textInputStyling}
                  onChangeText={value => this.changeTextFun(value, 'email')}
                />
              </View>
            </View>
            {emailError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{emailError}</Text>
              </View>
            ) : null}

            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>
                  {translate('Mobile phone')}
                </Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={phoneNumber}
                  keyboardType="number-pad"
                  placeholder={translate('Mobile phone')}
                  style={styles.textInputStyling}
                  onChangeText={value =>
                    this.changeTextFun(value, 'phoneNumber')
                  }
                />
              </View>
            </View>

            {phoneNumberError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{phoneNumberError}</Text>
              </View>
            ) : null}

            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>{translate('Role')}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  justifyContent: 'space-between',
                  borderWidth: 0.5,
                  borderColor: 'grey',
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
                      label: 'Please select role*',
                      value: null,
                      color: 'black',
                    }}
                    placeholderTextColor="red"
                    onValueChange={value => {
                      this.setRoleFun(value);
                    }}
                    style={{
                      inputIOS: {
                        fontSize: 14,
                        paddingHorizontal: '3%',
                        color: '#161C27',
                        width: '100%',
                        alignSelf: 'center',
                      },
                      inputAndroid: {
                        fontSize: 14,
                        paddingHorizontal: '3%',
                        color: '#161C27',
                        width: '100%',
                        alignSelf: 'center',
                        paddingVertical: 6,
                      },
                      iconContainer: {
                        top: '40%',
                      },
                    }}
                    items={roleArr}
                    value={finalRole}
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
            {roleError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{roleError}</Text>
              </View>
            ) : null}
            {finalRole === 'Other (Please Specify)' ? (
              <View style={styles.dataContainer}>
                <View style={styles.dataFirstContainer}></View>
                <View style={styles.dataSecondContainer}>
                  <TextInput
                    value={finalSpecificRole}
                    placeholder={translate(
                      'in case role is other, please specify here',
                    )}
                    style={styles.textInputStyling}
                    onChangeText={value =>
                      this.changeTextFun(value, 'finalSpecificRole')
                    }
                  />
                </View>
              </View>
            ) : null}

            {finalSpecificRoleError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>
                  {finalSpecificRoleError}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                height: hp('5%'),
                marginHorizontal: wp('5%'),
                flexDirection: 'row',
              }}>
              <View style={styles.dataFirstContainer}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  {translate('About Your Business')} -
                </Text>
              </View>
            </View>
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>
                  {translate('Business Name')}
                </Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={businessName}
                  placeholder={translate('Business Name')}
                  style={styles.textInputStyling}
                  onChangeText={value =>
                    this.changeTextFun(value, 'businessName')
                  }
                />
              </View>
            </View>

            {businessNameError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{businessNameError}</Text>
              </View>
            ) : null}
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>
                  {translate('Street address')}
                </Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={streetAddress}
                  placeholder={translate('Street address')}
                  style={styles.textInputStyling}
                  onChangeText={value =>
                    this.changeTextFun(value, 'streetAddress')
                  }
                />
              </View>
            </View>
            {streetAddressError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{streetAddressError}</Text>
              </View>
            ) : null}
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>{translate('Town')}</Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={townName}
                  placeholder={translate('Town')}
                  style={styles.textInputStyling}
                  onChangeText={value => this.changeTextFun(value, 'townName')}
                />
              </View>
            </View>
            {townNameError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{townNameError}</Text>
              </View>
            ) : null}
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>
                  {translate('Postal code')}
                </Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={postCode}
                  keyboardType="number-pad"
                  placeholder={translate('Postal code')}
                  style={styles.textInputStyling}
                  onChangeText={value => this.changeTextFun(value, 'postCode')}
                />
              </View>
            </View>
            {postCodeError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{postCodeError}</Text>
              </View>
            ) : null}
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>
                  {translate('Select a Country')}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  justifyContent: 'space-between',
                  borderWidth: 0.5,
                  borderColor: 'grey',
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
                      label: 'Select a Country*',
                      value: null,
                      color: 'black',
                    }}
                    placeholderTextColor="red"
                    onValueChange={value => {
                      this.setCountryFun(value);
                    }}
                    style={{
                      inputIOS: {
                        fontSize: 14,
                        paddingHorizontal: '3%',
                        color: '#161C27',
                        width: '100%',
                        alignSelf: 'center',
                      },
                      inputAndroid: {
                        fontSize: 14,
                        paddingHorizontal: '3%',
                        color: '#161C27',
                        width: '100%',
                        alignSelf: 'center',
                        paddingVertical: 6,
                      },
                      iconContainer: {
                        top: '40%',
                      },
                    }}
                    items={countriesArr}
                    value={finalCountry}
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
            {countryError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorStyling}>{countryError}</Text>
              </View>
            ) : null}
            <View style={styles.dataContainer}>
              <View style={styles.dataFirstContainer}>
                <Text style={styles.textStyling}>{translate('Message')}</Text>
              </View>
              <View style={styles.dataSecondContainer}>
                <TextInput
                  value={messageValue}
                  placeholder={translate('Message')}
                  style={styles.textInputStyling}
                  onChangeText={value =>
                    this.changeTextFun(value, 'messageValue')
                  }
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => this.submitFun()}
              style={{
                backgroundColor: '#427EA3',
                marginTop: hp('2%'),
                padding: 10,
                width: wp('50%'),
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                }}>
                {translate('Submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
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
