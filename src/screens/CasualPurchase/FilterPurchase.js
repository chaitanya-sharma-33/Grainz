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
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getSupplierListApi} from '../../connectivity/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {translate, setI18nConfig} from '../../utils/translations';
import Loader from '../../components/Loader';
import Header from '../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import ModalPicker from '../../components/ModalPicker';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

var querystring = require('querystring');

class FilterScreen extends Component {
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
      isDatePickerVisible: false,
      fromDate: '',
      toDate: '',
      fromProductionDate: '',
      toProductionDate: '',
      isDatePickerVisibleToDate: false,
      dataListLoader: false,
      placeHolderTextDept: 'All Suppliers',
      supplierList: [],
      selectedTextUser: '',
    };
  }

  async componentDidMount() {
    this.getSupplierListData();
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
    alert('ApplyFilters');
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

  rememberMeFun = async value => {
    this.setState({
      switchValueRemember: value,
    });
  };

  handleConfirm = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    this.setState({
      fromDate: newdate,
      fromProductionDate: date,
    });

    this.hideDatePicker();
  };
  handleConfirmToDate = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    this.setState({
      toDate: newdate,
      toProductionDate: date,
    });

    this.hideDatePickerToDate();
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  hideDatePickerToDate = () => {
    this.setState({
      isDatePickerVisibleToDate: false,
    });
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  showDatePickerFunToDate = () => {
    this.setState({
      isDatePickerVisibleToDate: true,
    });
  };

  clearFiltersFun = () => {
    this.setState({
      toDate: '',
      fromDate: '',
      toProductionDate: '',
      fromProductionDate: '',
    });
  };

  getSupplierListData() {
    this.setState(
      {
        dataListLoader: true,
      },
      () =>
        getSupplierListApi()
          .then(res => {
            const finalArr = [];
            res.data.map(item => {
              finalArr.push({
                name: item.name,
                id: item.id,
              });
            });
            this.setState({
              supplierList: [...finalArr],
              dataListLoader: false,
            });
          })
          .catch(error => {
            console.log('err', error);
          }),
    );
  }

  selectUserNameFun = item => {
    this.setState({
      supplier: item.name,
      selectedTextUser: item.name,
      supplierId: item.id,
      supplieReference: item.reference,
    });
  };

  render() {
    const {
      loader,
      passStatus,
      switchValueRemember,
      fromDate,
      isDatePickerVisible,
      toDate,
      isDatePickerVisibleToDate,
      dataListLoader,
      placeHolderTextDept,
      supplierList,
      selectedTextUser,
    } = this.state;
    console.log('toDate', toDate);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f2efef',
        }}>
        {/* <View
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
        </View> */}
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
                      onPress={() => this.showDatePickerFun()}
                      style={{
                        padding: Platform.OS === 'ios' ? 14 : 0,
                        marginBottom: hp('3%'),
                        // flexDirection: 'row',
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
                          From Date
                        </Text>
                      </View>
                      <TextInput
                        placeholder={'DD-MM-YYYY'}
                        value={fromDate}
                        editable={false}
                        style={{}}
                      />
                    </TouchableOpacity>
                  </View>

                  <DateTimePickerModal
                    // is24Hour={true}
                    isVisible={isDatePickerVisible}
                    mode={'date'}
                    onConfirm={this.handleConfirm}
                    onCancel={this.hideDatePicker}
                    // minimumDate={minTime}
                  />

                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() => this.showDatePickerFunToDate()}
                      style={{
                        padding: Platform.OS === 'ios' ? 14 : 0,
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
                          To Date
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <TextInput
                          placeholder={'DD-MM-YYYY'}
                          value={toDate}
                          editable={false}
                          style={{
                            borderLeftWidth: 1,
                            borderLeftColor: 'grey',
                            paddingLeft: 15,
                          }}
                        />
                        <Image
                          source={img.calenderIcon}
                          style={{
                            width: 15,
                            height: 15,
                            resizeMode: 'contain',
                            marginLeft: wp('10%'),
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
                <View style={{marginBottom: hp('3%')}}>
                  <ModalPicker
                    dataListLoader={dataListLoader}
                    placeHolderLabel={placeHolderTextDept}
                    placeHolderLabelColor="grey"
                    dataSource={supplierList}
                    selectedLabel={selectedTextUser}
                    onSelectFun={item => this.selectUserNameFun(item)}
                    imageIcon={img.inventoryIcon}
                    tintColor={'grey'}
                  />
                </View>

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
                  </View>
                  <Text
                    style={{
                      color: '#222526',
                      fontSize: 14,
                      fontFamily: 'Inter-Regular',
                    }}>
                    {translate('Show only flagged purchases')}
                  </Text>
                </View>
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
                    <Text style={{color: '#5297C1'}}>
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

export default connect(mapStateToProps, {UserTokenAction})(FilterScreen);
