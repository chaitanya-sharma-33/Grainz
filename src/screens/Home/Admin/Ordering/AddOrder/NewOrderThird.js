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
  Dimensions,
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

const numColumns = 2;
var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

let todayDate = moment(new Date()).format('DD-MM-YYYY');
let todayDateProd = moment.utc(new Date()).format();

class NewOrderThird extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      finalData: '',
      isDatePickerVisible: false,
      finalDate: todayDate,
      placeHolderTextDept: 'Select Supplier',
      productionDate: todayDateProd,
      htvaIsSelected: true,
      auditIsSelected: false,
      note: '',
      dataListLoader: false,
      supplierList: [],
      object: {
        date: '',
        supplier: '',
        items: [{name: '', quantity: null, price: null}],
      },
      showSuppliers: false,
      supplier: 'Select Supplier',
      supplierId: '',
      departmentName: '',
      loading: false,
      items: [],
      selectedItems: [],
      selectedTextUser: 'Select',
      selectedItemObjects: [],
      supplierListLoader: false,
      quantityList: [],
      quantityName: '',
      orderItemsFinal: [],
      treeselectDataBackup: [],
      switchValue: false,
      buttonsLoader: true,
      quantityValue: '',
      price: '',
      orderTotal: 0,
      saveLoader: false,
      saveTouchableStatus: false,
      imageModalStatus: false,
      imageDesc: '',
      imageName: '',
      imageData: '',
      imageShow: false,
      chooseImageModalStatus: false,
      quantityError: '',
      priceError: '',
      treeselectData: [],
      clickPhoto: false,
      buttons: [],
      showMoreStatus: false,
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
        this.setState({
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      const {route} = this.props;
      const finalData = route.params.finalData;
      console.log('finalData', finalData);
      this.getDepartmentData();
      if (finalData) {
        this.setState({
          finalData,
        });
      }
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
          buttonsLoader: false,
        });
      })
      .catch(error => {
        console.log('err', error.response);
      });
  }

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    console.log('item', item);
    const {finalData} = this.state;
    this.props.navigation.navigate('AddItemsOrderScreen', {
      departID: item.id,
      departName: item.name,
      supplierValue: finalData.supplierId,
      screen: 'New',
      supplierName: finalData.supplierName,
      finalData,
      finalDataSec: '',
      basketId: '',
    });
  };

  render() {
    const {buttonsLoader, buttons, showMoreStatus, finalData} = this.state;

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
              <View style={styles.firstContainer}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.goBackContainer}>
                  <Image source={img.backIcon} style={styles.tileImageBack} />
                </TouchableOpacity>
                <View style={styles.flex}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Items of New order')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={{}}>
                  <Image source={img.deleteIcon} style={styles.tileImageBack} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{marginHorizontal: wp('6%'), marginTop: hp('2%')}}>
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      showMoreStatus: !showMoreStatus,
                    })
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        backgroundColor: '#fff',
                        padding: 15,
                        borderTopLeftRadius: 6,
                      }}>
                      <View style={{}}>
                        <Text
                          style={{
                            fontSize: 11,
                          }}>
                          {translate('Supplier')}
                        </Text>
                      </View>
                      <View
                        style={{
                          marginTop: 10,
                        }}>
                        <TextInput
                          value={finalData.supplierName}
                          editable={false}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: 'black',
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        backgroundColor: '#fff',
                        padding: 15,
                        borderTopRightRadius: 6,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            fontSize: 11,
                          }}>
                          {translate('Delivery date')}
                        </Text>
                        <Image
                          source={
                            showMoreStatus === false
                              ? img.arrowDownIcon
                              : img.upArrowIcon
                          }
                          style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            marginRight: 10,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 10,
                        }}>
                        <TextInput
                          value={finalData.finalDeliveryDate}
                          editable={false}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: 'black',
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                {showMoreStatus ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}>
                    <View style={{flex: 1}}>
                      <View
                        style={{
                          backgroundColor: '#fff',
                          padding: 15,
                          marginBottom: hp('3%'),
                          borderBottomLeftRadius: 6,
                        }}>
                        <View style={{}}>
                          <Text
                            style={{
                              fontSize: 11,
                            }}>
                            {translate('Placed by')}
                          </Text>
                        </View>
                        <View style={{marginTop: 10}}>
                          <TextInput
                            value={finalData.placedByData}
                            editable={false}
                            style={{
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: 'black',
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => this.props.navigation.goBack()}
                            style={{
                              marginTop: 15,
                            }}>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                color: '#66A4C8',
                              }}>
                              {translate('Edit details')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <View style={{flex: 1}}>
                      <View
                        style={{
                          backgroundColor: '#fff',
                          padding: 15,
                          marginBottom: hp('3%'),
                          borderBottomRightRadius: 6,
                        }}>
                        <View style={{}}>
                          <Text
                            style={{
                              fontSize: 11,
                            }}>
                            {translate('Order date')}
                          </Text>
                        </View>
                        <View style={{marginTop: 10}}>
                          <TextInput
                            value={finalData.finalOrderDate}
                            editable={false}
                            style={{
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: 'black',
                            }}
                          />
                        </View>
                        <TouchableOpacity
                          style={{
                            marginTop: 15,
                          }}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                            }}></Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : null}

                {buttonsLoader ? (
                  <ActivityIndicator size="small" color="grey" />
                ) : (
                  <View style={{...styles.subContainer, alignItems: 'center'}}>
                    <FlatList
                      data={buttons}
                      renderItem={({item}) => (
                        <View
                          style={{
                            width:
                              Dimensions.get('window').width / numColumns -
                              wp('5%'),
                            borderRadius: 50,
                          }}>
                          <TouchableOpacity
                            onPress={() => this.onPressFun(item)}
                            style={{
                              backgroundColor:
                                item.name === 'Kitchen'
                                  ? '#D448A7'
                                  : item.name === 'Bar'
                                  ? '#B2B4B8'
                                  : item.name === 'Retail'
                                  ? '#E1A72E'
                                  : '#7CBF31',
                              flex: 1,
                              margin: 8,
                              borderRadius: 8,
                              padding: 15,
                              flexDirection: 'row',
                            }}>
                            <View
                              style={{
                                flex: 1.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Image
                                source={
                                  item.name === 'Kitchen'
                                    ? img.kitchenIcon
                                    : item.name === 'Bar'
                                    ? img.barIcon
                                    : item.name === 'Retail'
                                    ? img.retailIcon
                                    : img.otherIcon
                                }
                                style={{
                                  height: 20,
                                  width: 20,
                                  resizeMode: 'contain',
                                }}
                              />
                            </View>
                            <View
                              style={{
                                flex: 3,
                              }}>
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: 'flex-end',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 13.5,
                                    fontFamily: 'Inter-Regular',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                  }}
                                  numberOfLines={1}>
                                  {item.name}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: 'flex-start',
                                  marginTop: 5,
                                }}>
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontFamily: 'Inter-Regular',
                                    color: '#fff',
                                  }}
                                  numberOfLines={1}>
                                  {item.name === 'Kitchen'
                                    ? `0 ${translate('Selected')}`
                                    : item.name === 'Bar'
                                    ? `0 ${translate('Selected')}`
                                    : item.name === 'Retail'
                                    ? `0 ${translate('Selected')}`
                                    : `0 ${translate('Selected')}`}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                      numColumns={2}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
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

export default connect(mapStateToProps, {UserTokenAction})(NewOrderThird);
