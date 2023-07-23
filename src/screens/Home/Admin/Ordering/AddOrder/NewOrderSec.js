import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  Switch,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../../constants/images';
import SubHeader from '../../../../../components/SubHeader';
import Header from '../../../../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import moment from 'moment';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getSupplierListApi,
  addOrderApi,
  getInventoryListApi,
  getCasualListNewApi,
  lookupDepartmentsApi,
} from '../../../../../connectivity/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {translate} from '../../../../../utils/translations';
import Modal from 'react-native-modal';
import styles from '../style';
import RNPickerSelect from 'react-native-picker-select';
import ModalPicker from '../../../../../components/ModalPicker';
import TreeSelect from 'react-native-tree-select';

// var minTime = new Date();
// minTime.setHours(0);
// minTime.setMinutes(0);
// minTime.setMilliseconds(0);

let todayDate = moment(new Date()).format('DD/MM/YYYY');
let todayDateProd = moment.utc(new Date()).format();

class NewOrderSec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      isDatePickerVisibleOrder: false,
      finalOrderDate: todayDate,
      productionDateOrder: todayDateProd,
      isDatePickerVisibleDelivery: false,
      finalDeliveryDate: '',
      productionDateDelivery: '',
      supplierName: translate('Select Supplier'),
      supplierId: '',
      items: [],
      selectedTextUser: translate('Select Supplier'),
      orderItemsFinal: [],
      saveLoader: false,
      saveTouchableStatus: false,
      recipeLoader: true,
      placedByData: '',
      customerNumber: '',
      channel: '',
      minTime: new Date(),
    };
  }

  getProfileDataFun = async () => {
    try {
      const value = await AsyncStorage.getItem('@appToken');
      if (value !== null) {
        this.setState(
          {
            token: value,
          },
          () => this.getProfileData(),
        );
      }
    } catch (e) {
      console.warn('ErrHome', e);
    }
  };

  getProfileData = () => {
    getMyProfileApi()
      .then(res => {
        console.log('res------->', res);
        const {firstName} = res.data;
        this.setState({
          recipeLoader: false,
          placedByData: firstName,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      const {route} = this.props;
      const item = route.params.item;
      if (item) {
        this.setState({
          supplierId: item.id,
          supplierName: item.name,
          customerNumber: item.customerNumber,
          channel: item.channel,
        });
      }
      this.getDepartmentData();
      // this.getSupplierListData();
    });
    this.getProfileDataFun();
  }

  getDepartmentData() {
    lookupDepartmentsApi()
      .then(res => {
        console.log('resss', res.data);
        let finalArray = res.data.map((item, index) => {
          return {
            id: item.id,
            name: item.name,
          };
        });
        this.setState({
          buttons: finalArray,
        });
      })
      .catch(error => {
        console.log('err', error.response);
      });
  }

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  handleConfirmOrder = date => {
    console.log('DATE-->', date);
    let newdate = moment(date).format('DD/MM/YYYY');
    this.setState({
      finalOrderDate: newdate,
      productionDateOrder: date,
      minTime: date,
    });

    this.hideDatePickerOrder();
  };

  handleConfirmDelivery = date => {
    let newdate = moment(date).format('DD/MM/YYYY');
    this.setState({
      finalDeliveryDate: newdate,
      productionDateDelivery: date,
    });

    this.hideDatePickerDelivery();
  };

  hideDatePickerOrder = () => {
    this.setState({
      isDatePickerVisibleOrder: false,
    });
  };

  hideDatePickerDelivery = () => {
    this.setState({
      isDatePickerVisibleDelivery: false,
    });
  };

  showDatePickerFunOrder = () => {
    this.setState({
      isDatePickerVisibleOrder: true,
    });
  };

  showDatePickerFunDelivery = () => {
    this.setState({
      isDatePickerVisibleDelivery: true,
    });
  };

  payloadValidation = () => {
    let formIsValid = true;
    const {orderItemsFinal} = this.state;
    console.log('order---->', orderItemsFinal);
    if (orderItemsFinal.length > 0) {
      for (let i of orderItemsFinal) {
        if (i.quantityOrdered === '') {
          i.error = 'Quantity is required';
          formIsValid = false;
        } else if (i.unitPrice === '') {
          i.error = 'Price is required';
          formIsValid = false;
        } else if (i.unitId === null) {
          i.error = 'Please select a unit';
          formIsValid = false;
        }
      }
    }
    this.setState({
      orderItemsFinal,
    });
    return formIsValid;
  };

  createOrder() {
    const {
      supplierName,
      supplierId,
      productionDateDelivery,
      productionDateOrder,
      finalDeliveryDate,
      finalOrderDate,
      placedByData,
      customerNumber,
      channel,
    } = this.state;

    let finalData = {
      supplierName,
      supplierId,
      productionDateDelivery,
      productionDateOrder,
      finalDeliveryDate,
      finalOrderDate,
      placedByData,
      customerNumber,
      channel,
    };

    if (finalDeliveryDate && supplierId) {
      this.props.navigation.navigate('NewOrderThirdScreen', {
        finalData,
      });
    } else {
      Alert.alert('', translate('Please select all values'), [
        {
          text: translate('Ok'),
        },
      ]);
    }
  }

  render() {
    const {
      isDatePickerVisibleOrder,
      isDatePickerVisibleDelivery,
      finalOrderDate,
      finalDeliveryDate,
      orderItemsFinal,
      saveLoader,
      saveTouchableStatus,
      selectedTextUser,
      supplierId,
      supplierName,
      placedByData,
      customerNumber,
      channel,
      productionDateOrder,
      minTime,
    } = this.state;

    console.log('minTime', minTime);
    console.log('productionDateOrder', productionDateOrder);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfileFun}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginBottom: hp('2%')}}
          ref={ref => {
            this.scrollListReftop = ref;
          }}>
          <View>
            <View style={styles.subContainer}>
              <TouchableOpacity
                style={styles.firstContainer}
                onPress={() => this.props.navigation.goBack()}>
                <View style={styles.goBackContainer}>
                  <Image source={img.backIcon} style={styles.tileImageBack} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.adminTextStyle}>
                    {translate('New Order')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{marginHorizontal: wp('6%'), marginTop: hp('2%')}}>
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('NewOrderScreen', {
                      ScreenType: 'NewOrderSec',
                      item: '',
                    })
                  }
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Supplier')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <Text
                      style={{
                        color: '#4A4C55',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        fontWeight: 'bold',
                      }}
                      numberOfLines={1}>
                      {supplierName ? supplierName : selectedTextUser}
                    </Text>
                    <Image
                      source={img.calenderIcon}
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'contain',
                        tintColor: 'grey',
                        marginRight: 10,
                      }}
                    />
                  </View>
                </TouchableOpacity>

                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => this.showDatePickerFunOrder()}
                    style={{
                      backgroundColor: '#fff',
                      padding: 12,
                      marginBottom: hp('2%'),
                      borderRadius: 6,
                    }}>
                    <View style={{}}>
                      <Text>{translate('Order Date')}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholder={translate('DD/MM/YY')}
                        value={finalOrderDate}
                        editable={false}
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 20,
                          tintColor: 'grey',
                          height: 20,
                          resizeMode: 'contain',
                          marginRight: 10,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleOrder}
                  mode={'date'}
                  onConfirm={this.handleConfirmOrder}
                  onCancel={this.hideDatePickerOrder}
                  // minimumDate={minTime}
                />

                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => this.showDatePickerFunDelivery()}
                    style={{
                      backgroundColor: '#fff',
                      padding: 12,
                      marginBottom: hp('2%'),
                      borderRadius: 6,
                    }}>
                    <View style={{}}>
                      <Text>{translate('Delivery Date')}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <TextInput
                        placeholder={translate('DD/MM/YY')}
                        value={finalDeliveryDate}
                        editable={false}
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 20,
                          height: 20,
                          resizeMode: 'contain',
                          marginRight: 10,
                          tintColor: 'grey',
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleDelivery}
                  mode={'date'}
                  onConfirm={this.handleConfirmDelivery}
                  onCancel={this.hideDatePickerDelivery}
                  minimumDate={minTime}
                />
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Placed by')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#4A4C55',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        fontWeight: 'bold',
                      }}>
                      {placedByData}
                    </Text>
                    <Image
                      source={img.calenderIcon}
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'contain',
                        tintColor: 'grey',
                        marginRight: 10,
                        tintColor: 'grey',
                      }}
                    />
                  </View>
                </View>

                {customerNumber ? (
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 6,
                      padding: 12,
                      marginTop: 10,
                    }}>
                    <View style={{}}>
                      <Text style={{}}>Customer Number</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          color: '#4A4C55',
                          fontSize: 14,
                          fontFamily: 'Inter-Regular',
                          fontWeight: 'bold',
                        }}>
                        {customerNumber}
                      </Text>
                      <Image
                        source={img.calenderIcon}
                        style={{
                          height: 20,
                          width: 20,
                          resizeMode: 'contain',
                          tintColor: 'grey',
                          marginRight: 10,
                          tintColor: 'grey',
                        }}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={{}}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: hp('1%'),
            }}>
            <TouchableOpacity
              disabled={supplierId ? false : true}
              onPress={() => this.createOrder()}
              style={{
                width: wp('90%'),
                height: hp('7%'),
                backgroundColor: supplierId ? '#5297c1' : '#DCDCDC',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginBottom: 5,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                {saveLoader ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  translate('Next')
                )}
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
              }}>
              <Text
                style={{
                  color: '#5297c1',
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                {translate('Cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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

export default connect(mapStateToProps, {UserTokenAction})(NewOrderSec);
