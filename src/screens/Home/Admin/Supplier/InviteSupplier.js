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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../constants/images';
import SubHeader from '../../../../components/SubHeader';
import Header from '../../../../components/Header';
import {UserTokenAction} from '../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getCountriesApi,
  setCurrentLocation,
  requestSupplierApi,
} from '../../../../connectivity/api';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate, setI18nConfig} from '../../../../utils/translations';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';

class InviteSupplierScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      contactPerson: '',
      website: '',
      supplierName: '',
      pageLoader: false,
      buttonsSubHeader: [],
      countryArr: [],
      id: '',
      orderingEmail: '',
      finalCountry: '',
      switchValue: false,
      loader: false,
    };
  }

  async componentDidMount() {
    const location = await AsyncStorage.getItem('@locationName');
    console.log('LocationNAME', location);
    this.getCountryFun();
  }

  getCountryFun = () => {
    getCountriesApi()
      .then(res => {
        console.log('res-->', res);
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        console.log('res-->finalUsersList', finalUsersList);

        this.setState({
          countryArr: finalUsersList,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  setCountryFun = (value, index) => {
    console.log('index', index);
    const finalIndex = index - 1;
    console.log('finalIndex', finalIndex);
    const {countryArr} = this.state;
    if (value) {
      this.setState({
        finalCountry: value,
      });
    }
  };

  requestCollaborationFun = () => {
    this.setState(
      {
        pageLoader: true,
      },
      () => this.requestCollaborationFunSec(),
    );
  };
  requestCollaborationFunSec = () => {
    const {
      email,
      phoneNumber,
      supplierName,
      finalCountry,
      orderingEmail,
      contactPerson,
      note,
      website,
    } = this.state;
    const payload = {
      aditionalEmail: orderingEmail,
      contactPerson: contactPerson,
      countryId: finalCountry,
      email: email,
      name: supplierName,
      note: note,
      phoneNumber: phoneNumber,
      website: website,
    };

    console.log('payload-->', payload);

    requestSupplierApi(payload)
      .then(res => {
        this.setState({
          pageLoader: false,
        });
        Alert.alert(
          translate(
            `Thank you Your invitation has been sent We will take it from here`,
          ),
          translate(
            `We will let you know when supplier's catalog has been uploaded after which you will be able to place orders`,
          ),
          [
            {
              text: translate('Supplier list'),
              onPress: () => this.props.navigation.goBack(),
            },
          ],
        );
      })
      .catch(err => {
        this.setState({
          pageLoader: false,
        });
        console.log('err', err.response);
        console.warn('ERr', err);
      });
  };

  render() {
    const {
      pageLoader,
      supplierName,
      email,
      phoneNumber,
      firstName,
      lastName,
      buttonsSubHeader,
      countryArr,
      finalCountry,
      loader,
      finalLocationName,
      website,
      contactPerson,
      orderingEmail,
      note,
    } = this.state;

    console.log('finalCountry', finalCountry);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
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
                      {translate('Invite new supplier')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  padding: 6,
                  borderRadius: 6,
                  flex: 1,
                  marginHorizontal: wp('7%'),
                  backgroundColor: '#fff',
                  marginBottom: hp('2%'),
                  marginTop: hp('2%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Supplier Name')}*
                </Text>
                <TextInput
                  value={supplierName}
                  placeholder={translate('Supplier Name')}
                  style={{
                    paddingVertical: 8,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      supplierName: value,
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
                  {translate('Email')}*
                </Text>
                <TextInput
                  value={email}
                  placeholder={translate('Email')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      email: value,
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
                  {translate('Country')}*
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
                        label: translate('Country'),
                        value: null,
                        color: 'black',
                      }}
                      onValueChange={(value, index) => {
                        this.setCountryFun(value, index);
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
                      items={countryArr}
                      value={finalCountry}
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
                  marginBottom: hp('2%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Website')}
                </Text>
                <TextInput
                  value={website}
                  placeholder={translate('Website')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      website: value,
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
                  {translate('Contact person')}
                </Text>
                <TextInput
                  value={contactPerson}
                  placeholder={translate('Contact person')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      contactPerson: value,
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
                  {translate('Ordering Email')}
                </Text>
                <TextInput
                  value={orderingEmail}
                  placeholder={translate('Ordering Email')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      orderingEmail: value,
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
                  {translate('Note')}
                </Text>
                <TextInput
                  value={note}
                  placeholder={translate('Note')}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  onChangeText={value =>
                    this.setState({
                      note: value,
                    })
                  }
                />
              </View>

              <TouchableOpacity
                onPress={() => this.requestCollaborationFun()}
                disabled={supplierName && email && finalCountry ? false : true}
                style={{
                  width: wp('90%'),
                  height: hp('7%'),
                  backgroundColor:
                    supplierName && email && finalCountry
                      ? '#5297c1'
                      : '#8BBBD7',
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
                  {translate('Request collaboration')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
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

export default connect(mapStateToProps, {UserTokenAction})(
  InviteSupplierScreen,
);
