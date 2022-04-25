import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../../constants/images';
import SubHeader from '../../../../../components/SubHeader';
import Header from '../../../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getSupplierListAdminApi,
  getCurrentLocUsersAdminApi,
  getBasketApi,
  updateBasketApi,
  updateDraftOrderNewApi,
  sendOrderApi,
  viewShoppingBasketApi,
  viewHTMLApi,
  deleteOrderApi,
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {translate} from '../../../../../utils/translations';
import Modal from 'react-native-modal';
import LoaderComp from '../../../../../components/Loader';

class EditDraftOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      modalLoaderDrafts: true,
      draftsOrderData: [],
      productId: '',
      finalData: '',
      buttons: [],
      supplierList: [],
      supplierValue: '',
      isDatePickerVisibleOrderDate: false,
      isDatePickerVisibleDeliveryDate: false,
      placedByValue: '',
      sentValue: 'NO',
      usersList: [],
      actionModalStatus: false,
      inventoryData: [],
      basketId: '',
      finalArrData: [],
      editStatus: true,
      toRecipientValue: '',
      mailMessageValue: '',
      ccRecipientValue: '',
      mailTitleValue: '',
      mailModalVisible: false,
      loaderCompStatus: false,
      finalOrderMinDate: '',
    };
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@appToken');
      if (value !== null) {
        this.setState(
          {
            token: value,
            recipeLoader: true,
          },
          () => this.getProfileData(),
        );
      }
    } catch (e) {
      console.warn('ErrHome', e);
    }
  };

  sendFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.sendFunSec(),
    );
  };
  sendFunSec = () => {
    const {
      apiDeliveryDate,
      apiOrderDate,
      placedByValue,
      supplierValue,
      basketId,
      draftsOrderData,
      finalApiData,
    } = this.state;
    if (
      apiOrderDate &&
      placedByValue &&
      supplierValue &&
      finalApiData &&
      apiDeliveryDate
    ) {
      let payload = {
        id: basketId,
        supplierId: supplierValue,
        orderDate: apiOrderDate,
        deliveryDate: apiDeliveryDate,
        placedBy: placedByValue,
        totalValue: draftsOrderData.totalValue,
        shopingBasketItemList: finalApiData,
      };
      console.log('payload', payload);
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
            },
            () => this.openMailModal(res),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: 'Okay',
              },
            ],
          );
        });
    } else {
      Alert.alert(`Grainz`, 'Please select all values.', [
        {
          text: 'Okay',
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  openMailModal = res => {
    this.setState({
      mailModalVisible: true,
      toRecipientValue: res.data && res.data.emailDetails.toRecipient,
      ccRecipientValue: res.data && res.data.emailDetails.ccRecipients,
      mailTitleValue: res.data && res.data.emailDetails.subject,
      mailMessageValue: res.data && res.data.emailDetails.text,
    });
  };

  updateDraftFun = () => {
    const {
      apiDeliveryDate,
      apiOrderDate,
      placedByValue,
      supplierValue,
      basketId,
      draftsOrderData,
      finalApiData,
    } = this.state;
    let payload = {
      id: basketId,
      supplierId: supplierValue,
      orderDate: apiOrderDate,
      deliveryDate: apiDeliveryDate,
      placedBy: placedByValue,
      totalValue: draftsOrderData.totalValue,
      shopingBasketItemList: finalApiData,
    };
    console.log('payload-updateDraftFun', payload);
    updateDraftOrderNewApi(payload)
      .then(res => {
        console.log('res-updateDraftFun', res);
        this.setState({
          loaderCompStatus: false,
          finalDeliveryDate:
            res.data.deliveryDate &&
            moment(res.data && res.data.deliveryDate).format('DD/MM/YY'),
        });
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  getProfileData = () => {
    getMyProfileApi()
      .then(res => {
        this.setState({
          recipeLoader: false,
          buttons: [
            {
              name: translate('Add items'),
              icon: img.addIconNew,
              id: 0,
            },
            {
              name: 'Update',
              // name: 'Update draft',
              icon: img.draftIcon,
              id: 1,
            },

            {
              name: translate('View'),
              icon: img.pendingIcon,
              id: 2,
            },
          ],
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        this.setState({
          recipeLoader: false,
        });
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getData();
    this.getSupplierListData();
    this.getUsersListData();
    const {productId, basketId} = this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          productId,
          basketId,
          modalLoaderDrafts: true,
        },
        () => this.getInventoryFun(),
      );
    });
  }

  getSupplierListData = () => {
    getSupplierListAdminApi()
      .then(res => {
        const {data} = res;
        let finalSupplierList = data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        this.setState({
          supplierList: finalSupplierList,
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  getUsersListData = () => {
    getCurrentLocUsersAdminApi()
      .then(res => {
        const {data} = res;
        let finalUsersList = data.map((item, index) => {
          return {
            label: item.firstName,
            value: item.id,
          };
        });
        this.setState({
          usersList: finalUsersList,
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  flatListFun = item => {
    const {supplierValue, placedByValue, basketId} = this.state;
    if (item.id === 0) {
      this.props.navigation.navigate('AddItemsOrderScreen', {
        screen: 'Update',
        navigateType: 'EditDraft',
        basketId: basketId,
        supplierValue,
      });
    } else if (item.id === 1) {
      const {editStatus} = this.state;
      // if (editStatus) {
      this.updateBasketFun();

      // } else {
      // this.setState(
      //   {
      //     loaderCompStatus: true,
      //   },
      // );
      // }
    } else {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.viewFun(),
      );
    }
  };

  viewFun = () => {
    const {
      apiDeliveryDate,
      apiOrderDate,
      placedByValue,
      supplierValue,
      basketId,
      draftsOrderData,
      finalApiData,
    } = this.state;
    if (
      apiOrderDate &&
      placedByValue &&
      supplierValue &&
      finalApiData &&
      apiDeliveryDate
    ) {
      let payload = {
        id: basketId,
        supplierId: supplierValue,
        orderDate: apiOrderDate,
        deliveryDate: apiDeliveryDate,
        placedBy: placedByValue,
        totalValue: draftsOrderData.totalValue,
        shopingBasketItemList: finalApiData,
      };
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.viewFunSec();
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: 'Okay',
              },
            ],
          );
        });
    } else {
      Alert.alert(`Grainz`, 'Please select all values.', [
        {
          text: 'Okay',
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  viewFunSec = () => {
    const {basketId} = this.state;
    viewHTMLApi(basketId)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.navigateToPdfScreen(res),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  closeLoaderComp = () => {
    this.setState({
      loaderCompStatus: false,
    });
  };

  navigateToPdfScreen = res => {
    const {
      apiDeliveryDate,
      apiOrderDate,
      placedByValue,
      supplierValue,
      basketId,
      draftsOrderData,
      finalApiData,
    } = this.state;
    this.props.navigation.navigate('PdfViewDraftScreen', {
      htmlData: res.data,
      apiOrderDate,
      placedByValue,
      supplierValue,
      finalApiData,
      basketId,
      apiDeliveryDate,
      draftsOrderData,
    });
  };

  showDatePickerOrderDate = () => {
    this.setState({
      isDatePickerVisibleOrderDate: true,
    });
  };

  handleConfirmOrderDate = date => {
    let newdate = moment(date).format('MM/DD/YYYY');
    let newMinDate = date;
    let apiOrderDate = date.toISOString();
    this.setState({
      finalOrderDate: newdate,
      finalOrderMinDate: newMinDate,
      apiOrderDate,
    });
    this.hideDatePickerOrderDate();
  };

  hideDatePickerOrderDate = () => {
    this.setState({
      isDatePickerVisibleOrderDate: false,
    });
  };

  showDatePickerDeliveryDate = () => {
    this.setState({
      isDatePickerVisibleDeliveryDate: true,
    });
  };

  handleConfirmDeliveryDate = date => {
    let newdate = moment(date).format('MM/DD/YYYY');
    let apiDeliveryDate = date.toISOString();
    this.setState({
      finalDeliveryDate: newdate,
      apiDeliveryDate,
    });
    this.hideDatePickerDeliveryDate();
  };

  hideDatePickerDeliveryDate = () => {
    this.setState({
      isDatePickerVisibleDeliveryDate: false,
    });
  };

  actionFun = (data, index) => {
    this.setState({
      actionModalStatus: true,
      finalArrData: data,
    });
  };

  setModalVisibleFalse = visible => {
    this.setState({
      actionModalStatus: visible,
      mailModalVisible: visible,
    });
  };

  editFun = () => {
    const {editStatus} = this.state;
    if (editStatus) {
      this.setState({
        // editStatus: false,
        actionModalStatus: false,
      });
    } else {
      this.setState({
        editStatus: true,
        actionModalStatus: false,
      });
    }
  };

  deleteFun = (data, index) => {
    this.setState(
      {
        actionModalStatus: false,
        finalArrData: data,
      },
      () =>
        setTimeout(() => {
          this.deleteFunSec();
        }, 300),
    );
  };

  deleteFunSec = () => {
    setTimeout(() => {
      Alert.alert('Grainz', 'Are you sure you want to delete this inventory?', [
        {
          text: 'Yes',
          onPress: () => this.hitDeleteApi(),
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ]);
    }, 100);
  };

  hitDeleteApi = () => {
    const {supplierValue, basketId, finalArrData} = this.state;
    let payload = {
      supplierId: supplierValue,
      shopingBasketItemList: [
        {
          id: finalArrData.id,
          inventoryId: finalArrData.inventoryId,
          inventoryProductMappingId: finalArrData.inventoryProductMappingId,
          unitPrice: finalArrData.unitPrice,
          quantity: finalArrData.quantity,
          action: 'Delete',
          value: finalArrData.value,
        },
      ],
      id: basketId,
    };

    updateBasketApi(payload)
      .then(res => {
        this.setState(
          {
            modalLoaderDrafts: true,
          },
          () => this.getInventoryFun(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  getInventoryFun = () => {
    const {productId, basketId, apiDeliveryDate} = this.state;

    getBasketApi(basketId)
      .then(res => {
        console.log('res', res);
        this.setState(
          {
            draftsOrderData: res.data,
            inventoryData: res.data && res.data.shopingBasketItemList,
            modalLoaderDrafts: false,
            supplierValue: res.data && res.data.supplierId,
            finalOrderDate: moment(res.data && res.data.orderDate).format(
              'DD/MM/YY',
            ),
            finalOrderMinDate: new Date(),
            finalDeliveryDate:
              res.data.deliveryDate &&
              moment(res.data && res.data.deliveryDate).format('DD/MM/YY'),
            apiDeliveryDate:
              res.data && res.data.deliveryDate !== null
                ? res.data && res.data.deliveryDate
                : apiDeliveryDate,
            apiOrderDate: res.data && res.data.orderDate,
            placedByValue: res.data && res.data.placedBy,
            productId,
          },
          () => this.createApiData(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () =>
              this.setState({
                modalLoaderDrafts: false,
              }),
          },
        ]);
      });
  };

  createApiData = () => {
    const {inventoryData} = this.state;
    const finalArr = [];
    inventoryData.map(item => {
      finalArr.push({
        id: item.id,
        inventoryId: item.inventoryId,
        inventoryProductMappingId: item.inventoryProductMappingId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        calculatedQuantity: item.calculatedQuantity,
        unit: item.unit,
        action: item.action,
        value: item.value,
      });
    });
    this.setState(
      {
        finalApiData: [...finalArr],
      },
      () => this.updateDraftFun(),
    );
  };

  editQuantityFun = (index, type, value) => {
    const {inventoryData} = this.state;

    let newArr = inventoryData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
            ['action']: 'Update',
          }
        : item,
    );
    this.setState({
      inventoryData: [...newArr],
      finalApiData: [...newArr],
    });
  };

  updateBasketFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.updateBasketFunSec(),
    );
  };

  updateBasketFunSec = () => {
    const {supplierValue, basketId, finalApiData} = this.state;
    let payload = {
      supplierId: supplierValue,
      shopingBasketItemList: finalApiData,
      id: basketId,
    };
    console.log('payload', payload);
    updateBasketApi(payload)
      .then(res => {
        this.setState(
          {
            modalLoaderDrafts: true,
            // editStatus: false,
            loaderCompStatus: false,
          },
          () => this.getInventoryFun(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  closeMailModal = () => {
    this.setState({
      mailModalVisible: false,
    });
  };

  sendMailFun = () => {
    const {
      basketId,
      toRecipientValue,
      mailMessageValue,
      ccRecipientValue,
      mailTitleValue,
    } = this.state;
    let payload = {
      emailDetails: {
        ccRecipients: ccRecipientValue,
        subject: mailTitleValue,
        text: mailMessageValue,
        toRecipient: toRecipientValue,
      },
      shopingBasketId: basketId,
    };

    sendOrderApi(payload)
      .then(res => {
        this.setState(
          {
            mailModalVisible: false,
          },
          () => this.props.navigation.navigate('OrderingAdminScreen'),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  deleteOrderFun = () => {};

  deleteDraftFun = () => {
    Alert.alert('Grainz!', 'Are you sure you want to delete this order?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => this.deleteFun(),
      },
    ]);
  };

  deleteFun = () => {
    const {productId} = this.state;
    console.log('productId', productId);
    this.setState(
      {
        modalLoaderDrafts: true,
      },
      () =>
        deleteOrderApi(productId)
          .then(res => {
            this.setState(
              {
                modalLoaderDrafts: false,
              },
              () => this.props.navigation.goBack(),
            );
          })
          .catch(error => {
            this.setState({
              deleteLoader: false,
            });
            console.warn('DELETEerror', error.response);
          }),
    );
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalLoaderDrafts,
      buttons,
      supplierList,
      supplierValue,
      finalOrderDate,
      isDatePickerVisibleOrderDate,
      isDatePickerVisibleDeliveryDate,
      finalDeliveryDate,
      placedByValue,
      sentValue,
      usersList,
      actionModalStatus,
      inventoryData,
      draftsOrderData,
      finalArrData,
      editStatus,
      finalApiData,
      mailModalVisible,
      toRecipientValue,
      mailMessageValue,
      ccRecipientValue,
      mailTitleValue,
      loaderCompStatus,
      finalOrderMinDate,
      apiDeliveryDate,
    } = this.state;

    console.log('apiDeliveryDate', apiDeliveryDate);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}
        <LoaderComp loaderComp={loaderCompStatus} />
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>Order Edit</Text>
              </View>

              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={styles.goBackContainer}>
                <Text style={styles.goBackTextStyle}>
                  {translate('Go Back')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{marginHorizontal: wp('5%')}}>
            <View
              style={{
                flexDirection: 'row',
                width: wp('90%'),
                backgroundColor: '#fff',
                paddingVertical: Platform.OS === 'ios' ? 15 : 5,
                borderRadius: 5,
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  width: wp('80%'),
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}>
                <RNPickerSelect
                  placeholder={{
                    label: 'Select supplier*',
                    value: null,
                    color: 'black',
                  }}
                  onValueChange={value => {
                    this.setState({
                      supplierValue: value,
                    });
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
                    },
                    iconContainer: {
                      top: '40%',
                    },
                  }}
                  disabled={true}
                  items={supplierList}
                  value={supplierValue}
                  useNativeAndroidPickerStyle={false}
                />
              </View>
              {/* <View style={{marginRight: wp('5%')}}>
                <Image
                  source={img.arrowDownIcon}
                  resizeMode="contain"
                  style={{
                    height: 18,
                    width: 18,
                    resizeMode: 'contain',
                    marginTop: Platform.OS === 'ios' ? 0 : 15,
                  }}
                />
              </View> */}
            </View>
            <View
              style={{
                marginTop: hp('3%'),
              }}>
              <View style={{}}>
                <TouchableOpacity
                  onPress={() => this.showDatePickerOrderDate()}
                  style={{
                    width: wp('90%'),
                    padding: Platform.OS === 'ios' ? 15 : 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff',
                    borderRadius: 5,
                  }}>
                  <TextInput
                    placeholder="Order Date"
                    value={finalOrderDate}
                    editable={false}
                  />
                  <Image
                    source={img.calenderIcon}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginTop: Platform.OS === 'android' ? 15 : 0,
                      marginRight: Platform.OS === 'android' ? 15 : 0,
                    }}
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleOrderDate}
                  mode={'date'}
                  onConfirm={this.handleConfirmOrderDate}
                  onCancel={this.hideDatePickerOrderDate}
                />
              </View>
            </View>
            <View
              style={{
                marginTop: hp('3%'),
              }}>
              <View style={{}}>
                <TouchableOpacity
                  onPress={() => this.showDatePickerDeliveryDate()}
                  style={{
                    width: wp('90%'),
                    padding: Platform.OS === 'ios' ? 15 : 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff',
                    borderRadius: 5,
                  }}>
                  <TextInput
                    placeholder="Delivery Date"
                    value={finalDeliveryDate}
                    editable={false}
                  />
                  <Image
                    source={img.calenderIcon}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginTop: Platform.OS === 'android' ? 15 : 0,
                      marginRight: Platform.OS === 'android' ? 15 : 0,
                    }}
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleDeliveryDate}
                  mode={'date'}
                  onConfirm={this.handleConfirmDeliveryDate}
                  onCancel={this.hideDatePickerDeliveryDate}
                  minimumDate={finalOrderMinDate}
                />
              </View>
            </View>
            <View>
              <View
                style={{
                  marginTop: hp('3%'),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: wp('90%'),
                    backgroundColor: '#fff',
                    paddingVertical: Platform.OS === 'ios' ? 15 : 5,
                    borderRadius: 5,
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      width: wp('80%'),
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}>
                    <RNPickerSelect
                      placeholder={{
                        label: 'Select placed by*',
                        value: null,
                        color: 'grey',
                      }}
                      onValueChange={value => {
                        this.setState({
                          placedByValue: value,
                        });
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
                        },
                        iconContainer: {
                          top: '40%',
                        },
                      }}
                      items={usersList}
                      value={placedByValue}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                  <View style={{marginRight: wp('5%')}}>
                    <Image
                      source={img.arrowDownIcon}
                      resizeMode="contain"
                      style={{
                        height: 20,
                        width: 20,
                        marginTop: Platform.OS === 'ios' ? 0 : 15,
                      }}
                    />
                  </View>
                </View>
              </View>
              {/* <View
                style={{
                  marginTop: hp('3%'),
                }}>
                <View style={{}}>
                  <TextInput
                    editable={false}
                    value={sentValue}
                    placeholder="Sent"
                    style={{
                      width: wp('90%'),
                      padding: 15,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: '#fff',
                      borderRadius: 5,
                    }}
                  />
                </View>
              </View> */}
            </View>
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('4%')}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View style={{marginHorizontal: wp('4%')}}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                            backgroundColor: '#EFFBCF',
                            paddingVertical: hp('3%'),
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                            paddingHorizontal: 20,
                          }}>
                          <View
                            style={{
                              width: wp('40%'),
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Inventory item
                            </Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('Quantity')}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              HTVA €
                            </Text>
                          </View>
                          <View
                            onPress={() => this.editFun()}
                            style={{
                              width: wp('20%'),
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('Action')}
                            </Text>
                          </View>
                        </View>
                        {inventoryData &&
                          inventoryData.map((item, index) => {
                            return (
                              <View
                                onLongPress={() => this.actionFun(item, index)}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 1,
                                    backgroundColor:
                                      index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                                    paddingVertical: hp('3%'),
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                    paddingHorizontal: 20,
                                  }}>
                                  <View
                                    style={{
                                      width: wp('40%'),
                                      justifyContent: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        fontFamily: 'Inter-SemiBold',
                                        marginBottom: 5,
                                      }}>
                                      {item.inventoryMapping &&
                                        item.inventoryMapping.inventoryName}
                                    </Text>
                                    <Text style={{}}>
                                      {item.inventoryMapping &&
                                        item.inventoryMapping.productName}
                                    </Text>
                                  </View>
                                  {editStatus ? (
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        justifyContent: 'center',
                                      }}>
                                      <Text style={{marginBottom: 5}}>
                                        {item.calculatedQuantity.toFixed(2)}{' '}
                                        {item.unit}
                                      </Text>

                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                        }}>
                                        <TextInput
                                          value={String(item.quantity)}
                                          keyboardType="numeric"
                                          style={{
                                            borderWidth: 1,
                                            borderRadius: 6,
                                            padding: 10,
                                            width: wp('10%'),
                                          }}
                                          onChangeText={value =>
                                            this.editQuantityFun(
                                              index,
                                              'quantity',
                                              value,
                                              item,
                                            )
                                          }
                                        />
                                        <Text>
                                          {' '}
                                          X{' '}
                                          {item.inventoryMapping &&
                                            item.inventoryMapping.packSize}
                                          /
                                          {item.inventoryMapping &&
                                            item.inventoryMapping.productUnit}
                                        </Text>
                                      </View>
                                    </View>
                                  ) : (
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        justifyContent: 'center',
                                      }}>
                                      <Text style={{marginBottom: 5}}>
                                        {item.calculatedQuantity.toFixed(2)}{' '}
                                        {item.unit}
                                      </Text>
                                      <Text>{`${item.quantity} X ${
                                        item.inventoryMapping &&
                                        item.inventoryMapping.packSize
                                      }/${
                                        item.inventoryMapping &&
                                        item.inventoryMapping.productUnit
                                      }`}</Text>
                                    </View>
                                  )}
                                  <View
                                    style={{
                                      width: wp('30%'),
                                      justifyContent: 'center',
                                    }}>
                                    <Text>
                                      € {Number(item.value).toFixed(2)}
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => this.deleteFun(item, index)}
                                    style={{
                                      width: wp('20%'),
                                      justifyContent: 'center',
                                    }}>
                                    <View
                                      style={{
                                        backgroundColor: 'red',
                                        padding: 10,
                                        alignItems: 'center',
                                      }}>
                                      <Image
                                        source={img.deleteIconNew}
                                        style={{
                                          width: 18,
                                          height: 18,
                                          resizeMode: 'contain',
                                          tintColor: '#fff',
                                        }}
                                      />
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor: '#FFFFFF',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}></View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text style={{}}>Total HTVA</Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text>
                                €{' '}
                                {Number(draftsOrderData.totalValue).toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          <View style={{marginVertical: hp('3%')}}>
            <FlatList
              data={buttons}
              renderItem={({item}) => (
                <View style={styles.itemContainer}>
                  <TouchableOpacity
                    onPress={() => this.flatListFun(item)}
                    style={{
                      backgroundColor: '#fff',
                      flex: 1,
                      margin: 10,
                      borderRadius: 8,
                      padding: 15,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        source={item.icon}
                        style={{
                          height: 40,
                          width: 40,
                          resizeMode: 'contain',
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 13,
                          textAlign: 'center',
                          fontFamily: 'Inter-Regular',
                        }}
                        numberOfLines={1}>
                        {' '}
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={item => item.id}
              numColumns={3}
            />
          </View>
          {/* <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => this.deleteOrderFun()}
              style={{
                height: hp('6%'),
                width: wp('80%'),
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 100,
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Delete')}
                </Text>
              </View>
            </TouchableOpacity>
          </View> */}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => this.deleteDraftFun()}
              style={{
                height: hp('6%'),
                width: wp('80%'),
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 100,
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Delete')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.sendFun()}
              style={{
                height: hp('6%'),
                width: wp('80%'),
                backgroundColor: '#94C036',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 100,
                marginBottom: hp('5%'),
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Send')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Modal isVisible={mailModalVisible} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('65%'),
                backgroundColor: '#F0F4FE',
                alignSelf: 'center',
                borderRadius: 6,
              }}>
              <View
                style={{
                  backgroundColor: '#87AF30',
                  height: hp('6%'),
                  flexDirection: 'row',
                  borderTopRightRadius: 6,
                  borderTopLeftRadius: 6,
                }}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 16, color: '#fff'}}>Send Mail</Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    padding: hp('3%'),
                  }}>
                  <View style={{}}>
                    <View style={{}}>
                      <TextInput
                        value={mailTitleValue}
                        placeholder="Title"
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                        }}
                        onChangeText={value =>
                          this.setState({
                            mailTitleValue: value,
                          })
                        }
                      />
                    </View>
                    <View style={{marginTop: hp('3%')}}>
                      <TextInput
                        value={toRecipientValue}
                        placeholder="To"
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                        }}
                        onChangeText={value =>
                          this.setState({
                            toRecipientValue: value,
                          })
                        }
                      />
                    </View>
                    <View style={{marginTop: hp('3%')}}>
                      <TextInput
                        value={ccRecipientValue}
                        placeholder="CC"
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                        }}
                        onChangeText={value =>
                          this.setState({
                            ccRecipientValue: value,
                          })
                        }
                      />
                    </View>

                    <View style={{marginTop: hp('3%')}}>
                      <TextInput
                        value={mailMessageValue}
                        placeholder="Message"
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                        }}
                        onChangeText={value =>
                          this.setState({
                            mailMessageValue: value,
                          })
                        }
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: hp('4%'),
                      }}>
                      <TouchableOpacity
                        onPress={() => this.sendMailFun()}
                        style={{
                          width: wp('30%'),
                          height: hp('5%'),
                          alignSelf: 'flex-end',
                          backgroundColor: '#94C036',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 100,
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 'bold',
                          }}>
                          {translate('Confirm')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.closeMailModal()}
                        style={{
                          width: wp('30%'),
                          height: hp('5%'),
                          alignSelf: 'flex-end',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: wp('2%'),
                          borderRadius: 100,
                          borderColor: '#482813',
                          borderWidth: 1,
                        }}>
                        <Text
                          style={{
                            color: '#482813',
                            fontSize: 15,
                            fontWeight: 'bold',
                          }}>
                          {translate('Cancel')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
          <Modal isVisible={actionModalStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('19%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
                borderRadius: 14,
              }}>
              <TouchableOpacity
                style={{flex: 1, justifyContent: 'center'}}
                onPress={() => this.editFun()}>
                <View
                  style={{
                    paddingHorizontal: wp('8%'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: '#161C27',
                      fontFamily: 'Inter-Regular',
                      fontSize: 18,
                    }}>
                    Edit
                  </Text>
                  <Image
                    source={img.editIconNew}
                    style={{
                      height: 15,
                      width: 15,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{flex: 1, justifyContent: 'center'}}
                onPress={() => this.deleteFun()}>
                <View
                  style={{
                    paddingHorizontal: wp('8%'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: 'red',
                      fontFamily: 'Inter-Regular',
                      fontSize: 18,
                    }}>
                    Delete
                  </Text>
                  <Image
                    source={img.deleteIconNew}
                    style={{
                      height: 15,
                      width: 15,
                      resizeMode: 'contain',
                      tintColor: 'red',
                    }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setModalVisibleFalse(false)}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View style={{}}>
                  <Text
                    style={{
                      color: '#161C27',
                      fontFamily: 'Inter-Regular',
                      fontSize: 18,
                    }}>
                    Close
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Modal>
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

export default connect(mapStateToProps, {UserTokenAction})(EditDraftOrder);
