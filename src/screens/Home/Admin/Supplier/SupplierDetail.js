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
import img from '../../../../constants/images';
import SubHeader from '../../../../components/SubHeader';
import Header from '../../../../components/Header';
import {UserTokenAction} from '../../../../redux/actions/UserTokenAction';
import {getMyProfileApi} from '../../../../connectivity/api';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate, setI18nConfig} from '../../../../utils/translations';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';
import SurePopUp from '../../../../components/SurePopUp';
import call from 'react-native-phone-call';

class SupplierDetail extends Component {
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
      switchValue: false,
      loader: false,
      supplierData: '',
    };
  }

  async componentDidMount() {
    const {route} = this.props;
    const supplierData = route.params.supplierData;
    console.log('supplierData', supplierData);
    this.setState({
      supplierData,
    });
    this.getLanguageFun();
  }

  getLanguageFun = async () => {
    const lan = await AsyncStorage.getItem('Language');
    console.log('LANNNN', lan);

    this.setState({
      finalLang: lan,
      pageLoader: false,
    });
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
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

  callSupplierFun = () => {
    const {supplierData} = this.state;
    console.log('supplierData', supplierData);
    const args = {
      number: supplierData.telephone, // String value with the number to call
      prompt: false, // Optional boolean property. Determines if the user should be prompted prior to the call
      skipCanOpen: true, // Skip the canOpenURL check
    };

    call(args).catch(console.error);
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
      loader,
      languageArr,
      finalLang,
      supplierData,
    } = this.state;
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
              <View style={styles.subContainer}>
                <View style={styles.firstContainer}>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={styles.goBackContainer}>
                    <Image source={img.backIcon} style={styles.tileImageBack} />
                  </TouchableOpacity>
                  <View style={styles.flex}>
                    <Text style={styles.adminTextStyle}>
                      {supplierData.name}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  marginHorizontal: wp('7%'),
                  marginTop: 15,
                }}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    Address
                  </Text>
                  <TextInput
                    value={supplierData.addresss}
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
                  flex: 1,
                  marginHorizontal: wp('7%'),
                  marginTop: 15,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  Website
                </Text>
                <TextInput
                  value={supplierData.website}
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
                  flex: 1,
                  marginHorizontal: wp('7%'),
                  marginTop: 15,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  Contact details
                </Text>
                <TextInput
                  value={supplierData.name}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  editable={false}
                />
                <TouchableOpacity
                  onPress={() => this.callSupplierFun()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={img.addIcon}
                    style={{
                      height: 22,
                      width: 22,
                      resizeMode: 'contain',
                      tintColor: '#5197C1',
                    }}
                  />
                  <Text
                    style={{
                      paddingVertical: 10,
                      fontWeight: 'bold',
                      color: 'black',
                      marginLeft: 10,
                      color: '#5197C1',
                      textDecorationLine: 'underline',
                    }}>
                    {supplierData.telephone}
                  </Text>
                  {/* <TextInput
                    value={supplierData.telephone}
                    placeholder={translate('Last name')}
                    style={{
                      paddingVertical: 10,
                      fontWeight: 'bold',
                      color: 'black',
                      marginLeft: 10,
                      color: '#5197C1',
                      textDecorationLine: 'underline',
                    }}
                    editable={false}
                  /> */}
                </TouchableOpacity>
                {/* <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={img.addIcon}
                    style={{
                      height: 22,
                      width: 22,
                      resizeMode: 'contain',
                      tintColor: '#5197C1',
                    }}
                  />
                  <TextInput
                    value={supplierData.telephone}
                    style={{
                      paddingVertical: 10,
                      fontWeight: 'bold',
                      color: 'black',
                      marginLeft: 10,
                      color: '#5197C1',
                      textDecorationLine: 'underline',
                    }}
                    editable={false}
                  />
                </View> */}
              </View>

              <View
                style={{
                  flex: 1,
                  marginHorizontal: wp('7%'),
                  marginTop: 15,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  Status
                </Text>
                <TextInput
                  value={supplierData.status}
                  style={{
                    paddingVertical: 10,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  editable={false}
                />
                <TouchableOpacity
                  style={{}}
                  onPress={() =>
                    this.props.navigation.navigate('OrderingAdminScreen', {
                      item: supplierData,
                    })
                  }>
                  <Text
                    style={{
                      fontSize: 14,
                      textDecorationLine: 'underline',
                      color: '#5197C1',
                    }}>
                    See orders for this supplier
                  </Text>
                </TouchableOpacity>
              </View>
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

export default connect(mapStateToProps, {UserTokenAction})(SupplierDetail);
