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
  Platform,
} from 'react-native';
import styles from './style';
import img from '../../../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getfilteredOrderDataApi} from '../../../../connectivity/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {UserTokenAction} from '../../../../redux/actions/UserTokenAction';
import {translate, setI18nConfig} from '../../../../utils/translations';
import Loader from '../../../../components/Loader';
import Header from '../../../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

let todayDateProd = moment.utc(new Date()).format();

var querystring = require('querystring');

class FilterOrder extends Component {
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
      isDatePickerVisibleFromDate: false,
      fromDate: '',
      toDate: '',
      fromProductionDate: '',
      toProductionDate: '',
      isDatePickerVisibleToDate: false,
      supplierName: translate('All Suppliers'),
      supplierId: '',
      supplieReference: '',
      flagStatus: false,
      selectedPage: '1',
      pageSize: '15',
      screenType: '',
      creditNoteValue: false,
    };
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      const {route} = this.props;
      const item = route.params.item;
      const screenType = route.params.screenType;
      console.log('itemmmmFilter', item);
      if (item) {
        this.selectUserNameFun(item);
      }
      if (screenType) {
        this.setState({
          screenType,
        });
      } else {
        this.setState({
          screenType: '',
        });
      }
    });
  }

  storeData = async value => {
    try {
      await AsyncStorage.setItem('@appToken', value);
      this.props.UserTokenAction(value);
    } catch (e) {
      console.warn('e', e);
    }
  };

  applyFilters = async () => {
    const {
      supplierId,
      toProductionDate,
      fromProductionDate,
      flagStatus,
      selectedPage,
      pageSize,
      screenType,
      creditNoteValue,
    } = this.state;
    let payload = {
      suppliers: supplierId ? [supplierId] : [],
      startDate: fromProductionDate ? fromProductionDate : todayDateProd,
      endDate: toProductionDate ? toProductionDate : todayDateProd,
      flagged: flagStatus,
      selectedPage: selectedPage,
      hasCreditNote: creditNoteValue,
      pageSize: pageSize,
      status:
        screenType === 'Draft'
          ? 'Draft'
          : screenType === 'Pending'
          ? 'Pending'
          : screenType === 'Review'
          ? 'Review'
          : screenType === 'History'
          ? 'History'
          : '',
    };
    console.log('payload', payload);

    getfilteredOrderDataApi(payload)
      .then(res => {
        console.log('res', res);
        if (screenType === 'Draft') {
          this.props.navigation.navigate('DraftOrderAdminScreen', {
            filterData: res.data,
            payloadData: payload,
          });
        } else if (screenType === 'Pending') {
          this.props.navigation.navigate('PendingDeliveryAdminScreen', {
            filterData: res.data,
            payloadData: payload,
          });
        } else if (screenType === 'Review') {
          this.props.navigation.navigate('PendingDeliveryAdminScreen', {
            filterData: res.data,
            payloadData: payload,
          });
        } else if (screenType === 'History') {
          this.props.navigation.navigate('PendingDeliveryAdminScreen', {
            filterData: res.data,
            payloadData: payload,
          });
        }
      })
      .catch(err => {
        Alert.alert(
          `Error - Filter ${err.response.status}`,
          'Something went wrong',
          [
            {
              text: 'Okay',
              onPress: () => this.props.navigation.goBack(),
            },
          ],
        );
      });
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

  handleConfirmFromDate = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    let fromDateProduction = moment.utc(date).format();

    this.setState({
      fromDate: newdate,
      fromProductionDate: fromDateProduction,
    });

    this.hideDatePickerFromDate();
  };
  handleConfirmToDate = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    let toDateProduction = moment.utc(date).format();

    this.setState({
      toDate: newdate,
      toProductionDate: toDateProduction,
    });

    this.hideDatePickerToDate();
  };

  hideDatePickerFromDate = () => {
    this.setState({
      isDatePickerVisibleFromDate: false,
    });
  };

  hideDatePickerToDate = () => {
    this.setState({
      isDatePickerVisibleToDate: false,
    });
  };

  showDatePickerFromFun = () => {
    this.setState({
      isDatePickerVisibleFromDate: true,
    });
  };

  showDatePickerFunToDate = () => {
    this.setState({
      isDatePickerVisibleToDate: true,
    });
  };

  clearFiltersFun = () => {
    this.setState(
      {
        toDate: '',
        fromDate: '',
        toProductionDate: '',
        fromProductionDate: '',
      },
      () => this.navigateFun(),
    );
  };

  navigateFun = () => {
    const {screenType} = this.state;
    if (screenType === 'Draft') {
      this.props.navigation.navigate('DraftOrderAdminScreen', {
        filterData: '',
      });
    } else if (screenType === 'Pending') {
      this.props.navigation.navigate('PendingDeliveryAdminScreen', {
        filterData: '',
      });
    } else if (screenType === 'Review') {
      this.props.navigation.navigate('PendingDeliveryAdminScreen', {
        filterData: '',
      });
    } else if (screenType === 'History') {
      this.props.navigation.navigate('PendingDeliveryAdminScreen', {
        filterData: '',
      });
    }
  };

  selectUserNameFun = item => {
    this.setState({
      supplierName: item.name,
      supplierId: item.id,
      supplieReference: item.reference,
    });
  };

  flagFun = () => {
    const {switchValueRemember} = this.state;
    this.setState({
      switchValueRemember: !switchValueRemember,
      flagStatus: !switchValueRemember,
    });
  };

  creditNoteFun = () => {
    const {creditNoteValue} = this.state;
    this.setState({
      creditNoteValue: !creditNoteValue,
    });
  };

  render() {
    const {
      loader,
      passStatus,
      switchValueRemember,
      fromDate,
      isDatePickerVisibleFromDate,
      toDate,
      isDatePickerVisibleToDate,
      supplierName,
      screenType,
      creditNoteValue,
    } = this.state;
    console.log('switchValueRemember', switchValueRemember);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f2efef',
        }}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          enableOnAndroid>
          <Loader loaderComp={loader} />
          <View style={styles.secondContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: hp('15%'),
                marginHorizontal: wp('6%'),
              }}>
              <View
                style={{
                  flex: 4,
                }}>
                <Text style={styles.textStylingLogo}>
                  {translate('Filters')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 100,
                  padding: 5,
                }}>
                <Image
                  source={img.crossIcon}
                  style={{
                    height: 15,
                    width: 15,
                    resizeMode: 'contain',
                  }}
                />
              </TouchableOpacity>
            </View>
            <View>
              <View style={styles.insideContainer}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() => this.showDatePickerFromFun()}
                      style={{
                        padding: 14,
                        marginBottom: hp('3%'),
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                        width: wp('40%'),
                      }}>
                      <View style={{}}>
                        <Text
                          style={{
                            marginBottom: 10,
                          }}>
                          {translate('From Date')}
                        </Text>
                      </View>
                      <TextInput
                        placeholder={translate('DD-MM-YYYY')}
                        value={fromDate}
                        editable={false}
                        style={{
                          color: 'black',
                          fontWeight: 'bold',
                        }}
                      />
                    </TouchableOpacity>
                  </View>

                  <DateTimePickerModal
                    // is24Hour={true}
                    isVisible={isDatePickerVisibleFromDate}
                    mode={'date'}
                    onConfirm={this.handleConfirmFromDate}
                    onCancel={this.hideDatePickerFromDate}
                    // minimumDate={minTime}
                  />

                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() => this.showDatePickerFunToDate()}
                      style={{
                        padding: 14,
                        marginBottom: hp('3%'),
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                        width: wp('50%'),
                      }}>
                      <View style={{}}>
                        <Text
                          style={{
                            paddingLeft: 15,
                            marginBottom: 10,
                          }}>
                          {translate('To Date')}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <TextInput
                          placeholder={translate('DD-MM-YYYY')}
                          value={toDate}
                          editable={false}
                          style={{
                            borderLeftWidth: 1,
                            borderLeftColor: 'grey',
                            paddingLeft: 15,
                            color: 'black',
                            fontWeight: 'bold',
                          }}
                        />
                        <Image
                          source={img.calenderIcon}
                          style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            tintColor: 'grey',
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisibleToDate}
                    mode={'date'}
                    onConfirm={this.handleConfirmToDate}
                    onCancel={this.hideDatePickerToDate}
                    // minimumDate={minTime}
                  />
                </View>

                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('SupplierListScreen', {
                      screenType: 'FilterOrder',
                    })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 6,
                    flex: 1,
                    backgroundColor: '#fff',
                    marginBottom: hp('4%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    {translate('Supplier')}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingTop: 10,
                      justifyContent: 'space-between',
                    }}>
                    <TextInput
                      value={supplierName}
                      placeholder={translate('All Supplier')}
                      style={{fontWeight: 'bold', color: 'black'}}
                      editable={false}
                    />
                    <Image
                      source={img.listIcon}
                      style={{
                        width: 18,
                        height: 18,
                        resizeMode: 'contain',
                        tintColor: 'grey',
                      }}
                    />
                  </View>
                </TouchableOpacity>

                {screenType !== 'Draft' ? (
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() => this.flagFun()}>
                    <View>
                      <CheckBox
                        value={switchValueRemember}
                        style={{
                          height: 18,
                          width: 18,
                          marginRight: 10,
                        }}
                        disabled={true}
                      />
                    </View>
                    <Text
                      style={{
                        color: '#222526',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                      }}>
                      {translate('Show only flagged purchases')}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {screenType !== 'Draft' ? (
                  <TouchableOpacity
                    style={{flexDirection: 'row', marginTop: 15}}
                    onPress={() => this.creditNoteFun()}>
                    <View>
                      <CheckBox
                        value={creditNoteValue}
                        style={{
                          height: 18,
                          width: 18,
                          marginRight: 10,
                        }}
                        disabled={true}
                      />
                    </View>
                    <Text
                      style={{
                        color: '#222526',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                      }}>
                      {translate('Orders with credit note')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={() => this.applyFilters()}
                  style={styles.signInStyling}>
                  {this.state.buttonLoader ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.signInStylingText}>
                      {translate('Apply filters')}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.clearFiltersFun()}
                  style={styles.forgotPassStyling}>
                  {this.state.buttonLoader ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{color: '#5297C1', fontSize: 15}}>
                      {translate('Clear all filters')}
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

export default connect(mapStateToProps, {UserTokenAction})(FilterOrder);
