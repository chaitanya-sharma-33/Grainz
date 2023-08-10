import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  FlatList,
  Platform,
  PermissionsAndroid,
  Dimensions,
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  getMyProfileApi,
  getSupplierProductsApi,
  addDraftApi,
  getCurrentLocUsersAdminApi,
  getBasketApi,
  updateBasketApi,
  sendOrderApi,
  viewShoppingBasketApi,
  downloadPDFApi,
  viewHTMLApi,
  updateDraftOrderNewApi,
  lookupDepartmentsApi,
  validateUserApi,
  setDeliveryDateApi,
  validateDeliveryDateApi,
  checkStockApi,
} from '../../../../../connectivity/api';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';
import styles from '../style';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {translate} from '../../../../../utils/translations';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import LoaderComp from '../../../../../components/Loader';

const numColumns = 2;

class Basket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      modalLoader: false,
      actionModalStatus: false,
      buttons: [],
      apiOrderDate: '',
      supplierId: '',
      finalApiData: [],
      modalVisible: false,
      supplierValue: '',
      finalOrderDate: '',
      finalOrderMinDate: '',
      isDatePickerVisibleOrderDate: false,
      finalDeliveryDate: '',
      placedByValue: '',
      supplierList: [],
      usersList: [],
      clonePreviouseModalStatus: false,
      cloneLoader: false,
      cloneOrderData: [],
      sentValue: 'No',
      apiDeliveryDate: '',
      itemType: '',
      basketId: '',
      finalArrData: [],
      editStatus: true,
      totalHTVAVal: '',
      mailModalVisible: false,
      productId: '',
      toRecipientValue: '',
      mailMessageValue: '',
      ccRecipientValue: '',
      mailTitleValue: '',
      supplierName: '',
      loaderCompStatus: false,
      arrangeStatusName: 0,
      finalDataSec: '',
      showMoreStatus: false,
      departmentData: [],
      buttonsLoader: true,
      supplierValue: '',
      finalLanguage: '',
      lineDetailsModalStatus: false,
      modalQuantity: '0',
      lineData: '',
      itemNotes: '',
      isFreemium: '',
      validateDateModalStatus: false,
      validateData: '',
      emailData: '',
      validateDateData: '',
      stockStatus: false,
    };
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@appToken');
      const userStatus = await AsyncStorage.getItem('@isFreemium');
      if (value !== null) {
        this.setState(
          {
            token: value,
            recipeLoader: true,
            isFreemium: userStatus,
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
        // console.log('res', res);
        this.setState({
          recipeLoader: false,
          finalLanguage: res.data.language,
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
          buttons: [
            {
              name: translate('Add items'),
              icon: img.addIconNew,
              id: 0,
            },
            {
              name: translate('View'),
              icon: img.pendingIcon,
              id: 1,
            },
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
    this.getUsersListData();

    // this.props.navigation.addListener('focus', () => {
    const {
      finalData,
      supplierId,
      itemType,
      productId,
      supplierName,
      finalDataSec,
      basketId,
    } = this.props.route && this.props.route.params;

    this.setState(
      {
        supplierId,
        itemType,
        basketId,
        modalLoader: true,
        finalOrderDate: moment(new Date()).format('DD-MM-YY'),
        finalOrderMinDate: new Date(),
        apiOrderDate: new Date().toISOString(),
        productId,
        supplierName,
        finalDataSec,
        supplierValue: supplierId,
        finalData,
      },
      () => this.getBasketDataFun(),
    );
    // });
  }

  getBasketDataFun = () => {
    const {basketId} = this.state;
    console.log('basketId->BASKET', basketId);

    getBasketApi(basketId)
      .then(res => {
        console.log('res->GetBasketId', res);

        let finalArray =
          res.data &&
          res.data.departmentsCount.map((item, index) => {
            return {
              id: item.id,
              name: item.name,
              count: item.count,
              displayName: item.displayName,
            };
          });

        this.setState(
          {
            modalData: res.data && res.data.shopingBasketItemList,
            modalLoader: false,
            totalHTVAVal: res.data && res.data.totalValue,
            placedByValue: res.data && res.data.placedBy,
            loaderCompStatus: false,
            departmentData: finalArray,
            buttonsLoader: false,
          },
          () => this.createApiData(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: translate('Ok'),
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  createApiData = () => {
    const {modalData, finalDataSec} = this.state;
    // console.log('FINAAP', finalDataSec);
    const finalArr = [];
    modalData.map(item => {
      finalArr.push({
        id: item.id,
        inventoryId: item.inventoryId,
        inventoryProductMappingId: item.inventoryProductMappingId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        action: 'string',
        value: item.value,
        notes: item.notes,
      });
    });
    this.setState({
      finalApiData: [...finalArr],
      placedByValue: finalDataSec.placedByData,
      supplierId: finalDataSec.supplierId,
      apiDeliveryDate: finalDataSec.productionDateDelivery,
      apiOrderDate: finalDataSec.productionDateOrder,
      finalDeliveryDate: finalDataSec.finalDeliveryDate,
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

  actionFun = (data, index) => {
    this.setState(
      {
        actionModalStatus: false,
        finalArrData: data,
      },
      () => this.deleteInventoryFun(),
    );
  };

  setModalVisibleFalse = visible => {
    this.setState({
      actionModalStatus: visible,
      mailModalVisible: visible,
    });
  };

  // editQuantityFun = (index, type, value) => {
  //   const {modalData} = this.state;

  //   let newArr = modalData.map((item, i) =>
  //     index === i
  //       ? {
  //           ...item,
  //           [type]: value,
  //           ['action']: 'Update',
  //         }
  //       : item,
  //   );
  //   this.setState({
  //     modalData: [...newArr],
  //   });
  // };

  editQuantityFun = (index, type, value, data, valueType) => {
    const {modalData} = this.state;

    // console.log('value', value);
    // console.log('data', data);

    const valueSec = data.quantity === '' ? Number(0) : Number(data.quantity);

    const valueMinus = valueSec - Number(1);
    // console.log('valueMinus--> ', valueMinus);

    const volume = data.inventoryMapping && data.inventoryMapping.volume;

    const valueAdd = Number(1) + valueSec;
    // console.log('valueAdd--> ', valueAdd);

    const finalQuantityMinus = volume * valueMinus;
    const finalQuantityAdd = volume * valueAdd;
    const finalQuantityInput = volume * value;

    const finalValueMinus =
      data.inventoryMapping.price * data.inventoryMapping.packSize * valueMinus;
    const finalValueAdd =
      data.inventoryMapping.price * data.inventoryMapping.packSize * valueAdd;
    const finalValueInput =
      data.inventoryMapping.price * data.inventoryMapping.packSize * value;

    if (valueType === 'minus') {
      let newArr = modalData.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: valueMinus,
              ['calculatedQuantity']: finalQuantityMinus,
              ['value']: finalValueMinus,
              ['action']: 'Update',
            }
          : item,
      );
      this.setState({
        modalData: [...newArr],
        finalApiData: [...newArr],
        totalHTVAVal: newArr.reduce((n, {value}) => n + value, 0),
      });
    } else if (valueType === 'input') {
      let newArr = modalData.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: value,
              ['calculatedQuantity']: finalQuantityInput,
              ['value']: finalValueInput,
              ['action']: 'Update',
            }
          : item,
      );
      this.setState({
        modalData: [...newArr],
        finalApiData: [...newArr],
        totalHTVAVal: newArr.reduce((n, {value}) => n + value, 0),
      });
    } else if (valueType === 'add') {
      let newArr = modalData.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: valueAdd,
              ['calculatedQuantity']: finalQuantityAdd,
              ['value']: finalValueAdd,
              ['action']: 'Update',
            }
          : item,
      );
      this.setState({
        modalData: [...newArr],
        finalApiData: [...newArr],
        totalHTVAVal: newArr.reduce((n, {value}) => n + value, 0),
      });
    }
  };

  sendFun = () => {
    const {finalDataSec} = this.state;
    console.log('FINALDATASEC', finalDataSec);
    if (finalDataSec.channel === 'Ftp') {
      Alert.alert(`Grainz`, 'Do yo want to send this order?', [
        {
          text: translate('Yes'),
          onPress: () => this.sendFTPFun(),
        },
        {
          text: translate('No'),
          // onPress: () => this.props.navigation.goBack(),
        },
      ]);
    } else {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.sendFunSec(),
      );
    }
  };

  sendFTPFun = () => {
    const {finalDataSec} = this.state;
    console.log('FINALDATASEC', finalDataSec);
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.sendFunSec(),
    );
  };

  sendFunSec = () => {
    const {
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
      totalHTVAVal,
      finalDataSec,
    } = this.state;
    if (
      apiOrderDate &&
      placedByValue &&
      supplierId &&
      finalApiData &&
      apiDeliveryDate
    ) {
      let payload = {
        id: basketId,
        supplierId: supplierId,
        orderDate: apiOrderDate,
        deliveryDate: apiDeliveryDate,
        placedBy: placedByValue,
        totalValue: totalHTVAVal,
        shopingBasketItemList: finalApiData,
        customerNumber: finalDataSec.customerNumber,
        channel: finalDataSec.channel,
      };
      // console.log('payload', payload);
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
            },
            () => this.checkStockFun(res),
            // ,
            // () => this.validateDeliveryDateFun(res),
          );
          // this.setState(
          //   {
          //     mailModalVisible: finalDataSec.channel === 'Ftp' ? false : true,
          //     loaderCompStatus: false,
          //     toRecipientValue: res.data && res.data.emailDetails.toRecipient,
          //     ccRecipientValue: res.data && res.data.emailDetails.ccRecipients,
          //     mailTitleValue: res.data && res.data.emailDetails.subject,
          //     mailMessageValue: res.data && res.data.emailDetails.text,
          //   },
          //   () => this.sendOrderCheckFun(),
          // );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: translate('Ok'),
                onPress: () => this.props.navigation.goBack(),
              },
            ],
          );
        });
    } else {
      Alert.alert(``, translate('Please select all values'), [
        {
          text: translate('Ok'),
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  checkStockFun = data => {
    const {basketId, supplierValue} = this.state;
    let payload = {};
    // console.log('payload->validateUserApi', payload);
    checkStockApi(payload, basketId, supplierValue)
      .then(res => {
        console.log('res-checkStockFun', res);
        if (res.data === '') {
          this.optionFun(data, res);
        } else {
          this.setState({
            stockStatus: true,
            stockData: res,
            emailData: data,
          });
        }
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-1',
          [
            {
              text: 'Okay',
            },
          ],
        );
      });
  };

  validateDeliveryDateFun = data => {
    const {basketId} = this.state;
    let payload = {
      emailDetails: {
        ccRecipients: data.data && data.data.emailDetails.ccRecipients,
        subject: data.data && data.data.emailDetails.subject,
        text: data.data && data.data.emailDetails.text,
        toRecipient: data.data && data.data.emailDetails.toRecipient,
      },
      shopingBasketId: basketId,
    };
    console.log('payload->validateUserApi', payload);
    validateUserApi(payload)
      .then(res => {
        console.log('res-Validate', res);
        if (res.data === '') {
          this.optionFun(data, res);
        } else {
          this.setState({
            validateDateModalStatus: true,
            validateData: res,
            emailData: data,
          });
        }
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-1',
          [
            {
              text: translate('Ok'),
            },
          ],
        );
      });
  };

  optionFun = (data, res) => {
    const {channel} = this.state;
    if (channel === 'Ftp') {
      this.setState(
        {
          toRecipientValue: data.data && data.data.emailDetails.toRecipient,
          ccRecipientValue: data.data && data.data.emailDetails.ccRecipients,
          mailTitleValue: data.data && data.data.emailDetails.subject,
          mailMessageValue: data.data && data.data.emailDetails.text,
        },
        () => this.sendMailFun(),
      );
    } else {
      this.openMailModal(data);
    }
  };

  openMailModal = data => {
    this.setState({
      mailModalVisible: true,
      toRecipientValue: data.data && data.data.emailDetails.toRecipient,
      ccRecipientValue: data.data && data.data.emailDetails.ccRecipients,
      mailTitleValue: data.data && data.data.emailDetails.subject,
      mailMessageValue: data.data && data.data.emailDetails.text,
    });
  };

  sendOrderCheckFun = () => {
    // console.log('FTP');
    const {finalDataSec, finalLanguage, basketId} = this.state;
    if (finalDataSec.channel === 'Ftp') {
      // console.log('FTP-SEC');

      let payload = {
        shopingBasketId: basketId,
        lang: finalLanguage,
      };

      // console.log('Payload', payload);

      sendOrderApi(payload)
        .then(res => {
          // console.log('res-FTP', res);
          this.setState(
            {
              mailModalVisible: false,
              loaderCompStatus: false,
            },
            () =>
              this.props.navigation.navigate('OrderingAdminScreen', {
                item: '',
              }),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: translate('Ok'),
                onPress: () => this.closeLoaderComp(),
              },
            ],
          );
        });
    }
  };

  editInventoryFun = () => {
    this.setState({
      actionModalStatus: false,
      // editStatus: true,
    });
  };

  deleteInventoryFun = data => {
    this.setState(
      {
        actionModalStatus: false,
        finalArrData: data,
      },
      () =>
        setTimeout(() => {
          Alert.alert('', translate('Are you sure you want to delete it?'), [
            {
              text: translate('Yes'),
              onPress: () => this.hitDeleteApiFun(),
            },
            {
              text: translate('No'),
              onPress: () => this.closeLoaderComp(),
            },
          ]);
        }, 100),
    );
  };

  hitDeleteApiFun = () => {
    const {supplierId, basketId, finalArrData, finalDataSec} = this.state;
    // console.log(supplierId, basketId, finalArrData);
    let payload = {
      supplierId: supplierId,
      customerNumber: finalDataSec.customerNumber,
      channel: finalDataSec.channel,
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
            modalLoader: true,
          },
          () => this.getBasketDataFun(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: translate('Ok'),
            onPress: () => this.closeLoaderComp(),
          },
        ]);
      });
  };

  saveDraftFun = () => {
    const {
      apiDeliveryDate,
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      modalData,
      totalHTVAVal,
      finalDataSec,
    } = this.state;
    let payload = {
      id: basketId,
      supplierId: supplierId,
      orderDate: apiOrderDate,
      deliveryDate: apiDeliveryDate,
      placedBy: placedByValue,
      totalValue: totalHTVAVal,
      shopingBasketItemList: finalApiData,
      customerNumber: finalDataSec.customerNumber,
      channel: finalDataSec.channel,
    };
    console.log('payload -->saveDraftFun', payload);
    if (apiOrderDate && placedByValue && supplierId && finalApiData) {
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
            },

            () =>
              this.props.navigation.navigate('OrderingAdminScreen', {
                item: '',
              }),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: translate('Ok'),
                onPress: () => this.closeLoaderComp(),
              },
            ],
          );
        });
    } else {
      Alert.alert(``, translate('Please select all values'), [
        {
          text: translate('Ok'),
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  closeLoaderComp = () => {
    this.setState({
      loaderCompStatus: false,
    });
  };

  // flatListFun = item => {
  //   const {basketId} = this.state;
  //   if (item.id === 0) {
  //     this.props.navigation.navigate('AddItemsOrderScreen', {
  //       screen: 'Update',
  //       basketId: basketId,
  //     });
  //   } else if (item.id === 1) {
  //     this.setState(
  //       {
  //         loaderCompStatus: true,
  //       },
  //       () => this.viewFun(),
  //     );
  //   }
  // };

  saveAndUpdateFun = () => {
    const {editStatus} = this.state;
    if (editStatus) {
      this.updateBasketFun();
    } else {
      this.saveDraftFun();
    }
  };

  viewFun = () => {
    const {
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
      totalHTVAVal,
      finalDataSec,
    } = this.state;
    let payload = {
      id: basketId,
      supplierId: supplierId,
      orderDate: apiOrderDate,
      deliveryDate: apiDeliveryDate,
      placedBy: placedByValue,
      totalValue: totalHTVAVal,
      shopingBasketItemList: finalApiData,
      customerNumber: finalDataSec.customerNumber,
      channel: finalDataSec.channel,
    };

    console.log('VIEWFUN--payload', payload);

    if (
      apiDeliveryDate &&
      placedByValue &&
      apiDeliveryDate &&
      basketId &&
      finalApiData &&
      supplierId
    ) {
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
                text: translate('Ok'),
                onPress: () => this.closeLoaderComp(),
              },
            ],
          );
        });
    } else {
      Alert.alert(``, translate('Please select all values'), [
        {
          text: translate('Ok'),
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  viewFunSec = () => {
    const {basketId} = this.state;

    console.log('basketId', basketId);

    viewHTMLApi(basketId)
      .then(res => {
        console.log('res', res);
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
            text: translate('Ok'),
            onPress: () => this.closeLoaderComp(),
          },
        ]);
      });
  };

  navigateToPdfScreen = res => {
    const {
      basketId,
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      apiDeliveryDate,
    } = this.state;
    this.props.navigation.navigate('PdfViewScreen', {
      htmlData: res.data,
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
    });
  };

  showDatePickerOrderDate = () => {
    this.setState({
      isDatePickerVisibleOrderDate: true,
    });
  };

  showDatePickerDeliveryDate = () => {
    this.setState({
      isDatePickerVisibleDeliveryDate: true,
    });
  };

  handleConfirmOrderDate = date => {
    let newdate = moment(date).format('DD-MM-YY');
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

  handleConfirmDeliveryDate = date => {
    const {finalOrderDate} = this.state;
    const finalDeliveryDate = moment(date).format('DD/MM/YYYY');

    let newdate = moment(date).format('DD/MM/YYYY');
    let apiDeliveryDate = date.toISOString();
    this.setState(
      {
        finalDeliveryDate: newdate,
        apiDeliveryDate,
      },
      () => this.validateDateFun(),
    );
    this.hideDatePickerDeliveryDate();
    // if (finalDeliveryDate < finalOrderDate) {
    //   alert('Delivery date cannot be less than or equal to order date');
    // } else {
    //   let newdate = moment(date).format('DD-MM-YY');
    //   let apiDeliveryDate = date.toISOString();
    //   this.setState({
    //     finalDeliveryDate: newdate,
    //     apiDeliveryDate,
    //   });
    //   this.hideDatePickerDeliveryDate();
    // }
  };

  openDatePickerModal = res => {
    this.setState({
      validateDateStatus: true,
      validateDateData: res.data,
    });
  };

  validateDateFun = () => {
    const {supplierValue, apiDeliveryDate} = this.state;
    console.log('supplierValue', supplierValue);
    let payload = {};
    // console.log('apiDeliveryDate', apiDeliveryDate);
    // console.log('basketId', basketId);

    validateDeliveryDateApi(payload, supplierValue, apiDeliveryDate)
      .then(res => {
        console.log('res-validateDateFun', res);
        console.log('res-validateDateFun', res.data);

        if (res.data === '') {
          this.setDeliveryDateFun();
        } else {
          this.openDatePickerModal(res);
        }
      })
      .catch(err => {
        // Alert.alert(
        //   `Error - ${err.response.status}`,
        //   'Something went wrong-1',
        //   [
        //     {
        //       text: translate('Ok'),
        //     },
        //   ],
        // );
      });
  };

  setDeliveryDateFun = () => {
    const {basketId, apiDeliveryDate} = this.state;
    let payload = {};
    console.log('apiDeliveryDate', apiDeliveryDate);
    console.log('basketId', basketId);

    setDeliveryDateApi(basketId, apiDeliveryDate, payload)
      .then(res => {
        console.log('res-DELIVERYDAATE', res);
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-1',
          [
            {
              text: translate('Ok'),
            },
          ],
        );
      });
  };

  hideDatePickerDeliveryDate = () => {
    this.setState({
      isDatePickerVisibleDeliveryDate: false,
    });
  };

  updateBasketFun = () => {
    const {supplierId, basketId, modalData, finalDataSec} = this.state;
    let payload = {
      supplierId: supplierId,
      shopingBasketItemList: modalData,
      id: basketId,
      customerNumber: finalDataSec.customerNumber,
      channel: finalDataSec.channel,
    };
    updateBasketApi(payload)
      .then(res => {
        this.setState(
          {
            modalLoader: true,
            editStatus: false,
          },
          () => this.saveDraftFun(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: translate('Ok'),
            onPress: () => this.closeLoaderComp(),
          },
        ]);
      });
  };

  sendMailFun = finalArray => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.sendMailFunSec(finalArray),
    );
  };

  updatedMailFun = () => {
    const {emailData, stockData, finalDataSec} = this.state;

    let finalArray =
      stockData &&
      stockData.data.stockDetails.map((item, index) => {
        return item.code;
      });

    console.log('FINALARRRR', finalArray);
    console.log('channel', finalDataSec);

    if (finalDataSec.channel === 'Ftp') {
      this.setState(
        {
          toRecipientValue:
            emailData.data && emailData.data.emailDetails.toRecipient,
          ccRecipientValue:
            emailData.data && emailData.data.emailDetails.ccRecipients,
          mailTitleValue: emailData.data && emailData.data.emailDetails.subject,
          mailMessageValue: emailData.data && emailData.data.emailDetails.text,
        },
        () => this.sendMailFun(finalArray),
      );
    } else {
      this.openMailModal(emailData);
    }
  };

  sendMailFunSec = finalArray => {
    const {
      basketId,
      toRecipientValue,
      mailMessageValue,
      ccRecipientValue,
      mailTitleValue,
      supplierValue,
    } = this.state;
    let payload = {
      emailDetails: {
        ccRecipients: ccRecipientValue,
        subject: mailTitleValue,
        text: mailMessageValue,
        toRecipient: toRecipientValue,
      },
      shopingBasketId: basketId,
      supplierId: supplierValue,
      itemsToRemove: finalArray ? finalArray : null,
    };

    console.log('PAYLOAD', payload);

    sendOrderApi(payload)
      .then(res => {
        this.setState(
          {
            mailModalVisible: false,
            loaderCompStatus: false,
          },
          () =>
            this.props.navigation.navigate('OrderingAdminScreen', {
              item: '',
            }),
        );
      })
      .catch(err => {
        console.log('err', err.response);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: translate('Ok'),
            onPress: () => this.closeLoaderComp(),
          },
        ]);
      });
  };

  closeMailModal = () => {
    this.setState({
      mailModalVisible: false,
    });
  };

  downLoadPdf = data => {
    this.historyDownload(data);
  };

  historyDownload = data => {
    if (Platform.OS === 'ios') {
      this.downloadHistory(data);
    } else {
      try {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'storage title',
            message: 'storage_permission',
          },
        ).then(granted => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //Once user grant the permission start downloading
            this.downloadHistory(data);
          } else {
            //If permission denied then show alert 'Storage Permission Not Granted'
            Alert.alert('Please grant storage permission');
          }
        });
      } catch (err) {
        //To handle permission related issue
        // console.log('error', err);
      }
    }
  };

  downloadHistory = async data => {
    var pdf_url = data.receipt;
    let PictureDir =
      Platform.OS === 'ios'
        ? RNFetchBlob.fs.dirs.DocumentDir
        : RNFetchBlob.fs.dirs.DownloadDir;
    let date = new Date();
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/grainz_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          '.pdf',
        description: 'Order File',
      },
    };
    RNFetchBlob.config(options)
      .fetch('GET', 'http://www.africau.edu/images/default/sample.pdf')
      .then(res => {
        Alert.alert('Ticket receipt downloaded successfully!');
      })
      .catch(err => {
        console.log('PDFErr', err);
      });
  };

  saveDraftFunGreen = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.saveAndUpdateFun(),
    );
  };

  arrangeListFun = funType => {
    if (funType === 'NAME') {
      this.setState(
        {
          arrangeStatusName: Number(1) + this.state.arrangeStatusName,
        },
        () => this.arrangeListFunSec('NAME'),
      );
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusName} = this.state;
    const finalData = type === 'NAME' ? arrangeStatusName : null;
    if (finalData % 2 == 0) {
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  reverseFun = () => {
    const {modalData} = this.state;
    const finalData = modalData.reverse();

    this.setState({
      modalData: finalData,
    });
  };

  descendingOrderFun = type => {
    const {modalData} = this.state;

    // console.log;

    if (type === 'NAME') {
      function dynamicSort(property) {
        var sortOrder = 1;

        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }

        return function (a, b) {
          if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
          } else {
            return a[property].localeCompare(b[property]);
          }
        };
      }
      // const finalKeyValue = type === 'NAME' ? 'productName' : null;

      // item.inventoryMapping.productName

      const finalData = modalData.sort(
        dynamicSort(item.inventoryMapping && item.inventoryMapping.productName),
      );

      this.setState({
        modalData: finalData,
      });
    }
  };

  previewPDFFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.viewFun(),
    );
  };

  onPressFun = item => {
    const {supplierValue, placedByValue, basketId, finalDataSec} = this.state;
    console.log('finalDataSec-->', finalDataSec);
    console.log('item-->', item);

    this.props.navigation.navigate('AddItemsOrderScreen', {
      basketId: basketId,
      supplierValue,
      departID: item.id,
      departName: item.displayName,
      screen: 'Update',
      finalData: '',
      navigateType: 'Add',
      finalDataSec,
      supplierName: finalDataSec.supplierName,
    });
  };

  editModalQuantityFun = (type, value) => {
    const {modalQuantity} = this.state;
    // console.log('modalQuantity', modalQuantity);
    // console.log('value', value);

    if (type === 'minus' && modalQuantity !== 0) {
      const valFinal = parseInt(modalQuantity) - parseInt(value);
      // console.log('valFinal', valFinal);
      this.setState({
        modalQuantity: valFinal,
      });
    } else if (type === 'input') {
      this.setState({
        modalQuantity: value,
      });
    } else if (type === 'add') {
      const valFinal = parseInt(modalQuantity) + parseInt(value);
      // console.log('valFinal', valFinal);
      this.setState({
        modalQuantity: valFinal,
      });
    }
  };

  deleteModalItemFun = data => {
    this.setState(
      {
        lineDetailsModalStatus: false,
      },
      () => this.deleteInventoryFun(data),
    );
  };

  saveNotesFun = () => {
    const {modalData, itemNotes, lineIndex} = this.state;
    console.log('lineIndex', lineIndex);
    let newArr = modalData.map((item, i) =>
      lineIndex === i
        ? {
            ...item,
            ['notes']: itemNotes,
          }
        : item,
    );
    this.setState(
      {
        modalData: [...newArr],
        finalApiData: [...newArr],
        lineDetailsModalStatus: false,
      },
      () => this.saveDraftFunGreen(),
    );
  };

  goBackFun = () => {
    const {supplierValue, placedByValue, basketId, finalDataSec, finalData} =
      this.state;
    console.log('finalDataSec-->', finalDataSec);
    console.log('finalData-->', finalData);

    this.props.navigation.navigate('AddItemsOrderScreen', {
      basketId: basketId,
      supplierValue,
      // departID: item.id,
      // departName: item.name,
      screen: 'Update',
      finalData: '',
      navigateType: 'Add',
      finalDataSec,
      supplierName: finalDataSec.supplierName,
    });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      modalLoader,
      actionModalStatus,
      buttons,
      supplierValue,
      finalOrderDate,
      isDatePickerVisibleOrderDate,
      isDatePickerVisibleDeliveryDate,
      finalDeliveryDate,
      placedByValue,
      supplierList,
      usersList,
      clonePreviouseModalStatus,
      cloneLoader,
      cloneOrderData,
      sentValue,
      editStatus,
      totalHTVAVal,
      mailModalVisible,
      toRecipientValue,
      mailMessageValue,
      ccRecipientValue,
      mailTitleValue,
      supplierName,
      loaderCompStatus,
      basketId,
      finalOrderMinDate,
      finalDataSec,
      showMoreStatus,
      departmentData,
      buttonsLoader,
      lineDetailsModalStatus,
      modalQuantity,
      lineData,
      itemNotes,
      isFreemium,
      validateDateModalStatus,
      emailData,
      validateData,
      validateDateStatus,
      validateDateData,
      selectIndex,
      stockStatus,
      stockData,
    } = this.state;

    console.log('finalDataSec', finalDataSec);

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
            <View
              style={styles.firstContainer}
              // onPress={() => this.goBackFun()}
            >
              {/* <View style={styles.goBackContainer}>
                <Image source={img.backIcon} style={styles.tileImageBack} />
              </View> */}
              <View style={styles.flex}>
                <Text style={styles.adminTextStyle}>
                  {translate('Items of New order')}
                </Text>
              </View>
            </View>
          </View>

          <View style={{marginHorizontal: wp('3%')}}>
            <View
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
                    borderBottomLeftRadius: 6,
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
                      value={finalDataSec.supplierName}
                      numberOfLines={1}
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
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  padding: 15,
                  borderTopRightRadius: 6,
                }}>
                <TouchableOpacity
                  onPress={() => this.showDatePickerDeliveryDate()}
                  style={{flex: 2}}>
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
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={finalDeliveryDate}
                      editable={false}
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'black',
                      }}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      showMoreStatus: !showMoreStatus,
                    })
                  }
                  style={{
                    flex: 0.5,
                  }}>
                  <Image
                    source={
                      showMoreStatus === false
                        ? img.arrowDownIcon
                        : img.upArrowIcon
                    }
                    style={{
                      width: 15,
                      height: 15,
                      resizeMode: 'contain',
                      marginRight: 10,
                    }}
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleDeliveryDate}
                  mode={'date'}
                  onConfirm={this.handleConfirmDeliveryDate}
                  onCancel={this.hideDatePickerDeliveryDate}
                  // minimumDate={finalOrderMinDate}
                />
              </View>
            </View>
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
                      borderTopLeftRadius: 6,
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
                        value={finalDataSec.placedByData}
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
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    backgroundColor: '#fff',
                    padding: 15,
                    borderBottomRightRadius: 6,
                  }}>
                  <View
                    style={{
                      flex: 2,
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
                        {translate('Order date')}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <TextInput
                        value={finalDataSec.finalOrderDate}
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
              </View>
            ) : null}

            {buttonsLoader ? (
              <ActivityIndicator size="small" color="grey" />
            ) : (
              <View
                style={{
                  ...styles.subContainer,
                  alignItems: 'center',
                }}>
                <FlatList
                  data={departmentData}
                  renderItem={({item}) => (
                    <View
                      style={{
                        width:
                          Dimensions.get('window').width / numColumns -
                          wp('3%'),
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
                          margin: 10,
                          borderRadius: 8,
                          padding: 10,
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
                              tintColor: '#fff',
                            }}
                          />
                        </View>
                        <View style={{flex: 3}}>
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
                              {item.displayName}
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
                              {item.count}
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

            {/* <View
              style={{
                marginTop: hp('3%'),
              }}>
              <View>
                <View
                  style={{
                    width: wp('90%'),
                    padding: Platform.OS === 'ios' ? 15 : 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff',
                    borderRadius: 5,
                  }}>
                  <TextInput
                    placeholder="Supplier"
                    value={supplierName}
                    editable={false}
                  />
                </View>
              </View>
            </View> */}
            {/* <View
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
              </View> */}
            {/* <View
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
              </View> */}
            {/* <View>
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
            </View> */}
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('2%'), marginBottom: hp('2%')}}>
              {modalData &&
                modalData.map((item, index) => {
                  // console.log('item--11-1-1-1>', item);
                  return (
                    <View
                      style={{
                        marginHorizontal: wp('6%'),
                        marginBottom: 15,
                        borderWidth: 1,
                        borderColor: 'grey',
                        borderRadius: 6,
                      }}>
                      {/* <View
                        style={{
                          position: 'absolute',
                          flexDirection: 'row',
                          borderRadius: 5,
                          bottom: '95%',
                          left: '5%',
                          zIndex: 10,
                          backgroundColor:
                            item.inventoryMapping &&
                            item.inventoryMapping.departmentName === 'Bar'
                              ? '#B2B4B8'
                              : item.inventoryMapping &&
                                item.inventoryMapping.departmentName ===
                                  'Kitchen'
                              ? '#D448A7'
                              : item.inventoryMapping &&
                                item.inventoryMapping.departmentName ===
                                  'Rental'
                              ? '#E1A72E'
                              : item.inventoryMapping &&
                                item.inventoryMapping.departmentName === 'Other'
                              ? '#85CF31'
                              : null,
                          padding: 5,
                        }}>
                        <View>
                          <Image
                            style={{
                              width: 15,
                              height: 15,
                              resizeMode: 'contain',
                            }}
                            source={
                              item.inventoryMapping &&
                              item.inventoryMapping.departmentName === 'Bar'
                                ? img.barIcon
                                : item.inventoryMapping &&
                                  item.inventoryMapping.departmentName ===
                                    'Kitchen'
                                ? img.kitchenIcon
                                : item.inventoryMapping &&
                                  item.inventoryMapping.departmentName ===
                                    'Rental'
                                ? img.retailIcon
                                : item.inventoryMapping &&
                                  item.inventoryMapping.departmentName ===
                                    'Other'
                                ? img.otherIcon
                                : null
                            }
                          />
                        </View>
                      </View> */}
                      <View
                        style={{
                          flexDirection: 'row',
                          padding: 10,
                          flex: 1,
                        }}>
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              lineDetailsModalStatus: true,
                              lineData: item,
                              lineIndex: index,
                              itemNotes: item.notes,
                            })
                          }
                          style={{
                            flex: 3,
                          }}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                            {item.inventoryMapping &&
                              item.inventoryMapping.inventoryName}
                          </Text>
                        </TouchableOpacity>
                        {item.notes ? (
                          <TouchableOpacity
                            onPress={() =>
                              this.setState({
                                lineDetailsModalStatus: true,
                                lineData: item,
                                lineIndex: index,
                                itemNotes: item.notes,
                              })
                            }
                            style={{
                              flex: 1,
                              alignItems: 'center',
                            }}>
                            <Image
                              source={img.messageIcon}
                              style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                                tintColor: 'black',
                              }}
                            />
                          </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                          onPress={() => this.deleteInventoryFun(item, index)}
                          style={{
                            flex: 1,
                            alignItems: 'flex-end',
                          }}>
                          <Image
                            source={img.deleteIconNew}
                            style={{
                              width: 15,
                              height: 15,
                              resizeMode: 'contain',
                              tintColor: 'red',
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',

                          borderBottomWidth: 1,
                          borderColor: 'grey',
                          padding: 10,
                        }}>
                        {isFreemium === 'false' ? (
                          <View
                            style={{
                              flex: 1,
                            }}>
                            <Text style={{}}>
                              {item.inventoryMapping &&
                                item.inventoryMapping.productName}
                            </Text>
                          </View>
                        ) : null}
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent:
                              isFreemium === 'false' ? null : 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              this.editQuantityFun(
                                index,
                                'quantity',
                                '1',
                                item,
                                'minus',
                              )
                            }
                            style={{
                              width: '30%',
                              height: '100%',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 29,
                                fontWeight: 'bold',
                                color: '#5197C1',
                              }}>
                              -
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              width: '50%',
                              backgroundColor: '#fff',
                            }}>
                            <TextInput
                              value={String(item.quantity)}
                              keyboardType="numeric"
                              style={{
                                borderRadius: 6,
                                padding: 10,
                                width: '100%',
                                height: '100%',
                                color: 'black',
                                textAlign: 'center',
                              }}
                              onChangeText={value =>
                                this.editQuantityFun(
                                  index,
                                  'quantity',
                                  value,
                                  item,
                                  'input',
                                )
                              }
                            />
                          </View>
                          <TouchableOpacity
                            onPress={() =>
                              this.editQuantityFun(
                                index,
                                'quantity',
                                '1',
                                item,
                                'add',
                              )
                            }
                            style={{
                              width: '30%',
                              height: '100%',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#5197C1',
                                fontSize: 20,
                                fontWeight: 'bold',
                              }}>
                              +
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',

                          padding: 10,
                        }}>
                        <View
                          style={{
                            flex: 1,
                          }}>
                          <Text style={{fontSize: 10}}>
                            {translate('Price')}
                          </Text>
                          <Text
                            style={{
                              marginTop: 10,
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}>
                            {item.inventoryMapping &&
                              item.inventoryMapping.price.toFixed(2)}{' '}
                            Є/
                            {item.inventoryMapping.productUnit}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                          }}>
                          <Text style={{fontSize: 10}}>
                            {translate('Ordered Val')}
                          </Text>
                          <Text
                            style={{
                              marginTop: 10,
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}>
                            {Number(item.value).toFixed(2)} €
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                          }}>
                          <Text style={{fontSize: 10}}>
                            {translate('Ordered Qty')}
                          </Text>
                          <Text
                            style={{
                              marginTop: 10,
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}>
                            {item.calculatedQuantity} {item.unit}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

              <View>
                <View
                  style={{
                    justifyContent: 'center',
                    marginTop: hp('2%'),
                    alignItems: 'center',
                    marginTop: '5%',
                    marginBottom: '5%',
                    backgroundColor: '#fff',
                    marginHorizontal: wp('5%'),
                    borderRadius: 6,
                  }}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: wp('90%'),
                      padding: 10,
                    }}>
                    <View>
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 15,
                          fontWeight: 'bold',
                        }}>
                        Total HTVA:
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                        }}>
                        {parseFloat(totalHTVAVal).toFixed(2)} €
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* <ScrollView showsVerticalScrollIndicator={false}>
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
              </ScrollView> */}
            </View>
          )}

          {/* {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('2%')}}>
              {modalLoader ? (
                <ActivityIndicator size="large" color="grey" />
              ) : (
                <View
                  style={{
                    padding: hp('2%'),
                  }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        <View>
                          <View
                            style={{
                              paddingVertical: 15,
                              paddingHorizontal: 20,
                              flexDirection: 'row',
                              backgroundColor: '#EFFBCF',
                            }}>
                            <View
                              style={{
                                width: wp('25%'),
                             
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                {translate('Inventory item')}
                              </Text>
                             
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                {translate('Quantity')}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('25%'),
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                HTVA (€)
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
                          <View>
                            {modalData && modalData.length > 0 ? (
                              modalData.map((item, index) => {
                                console.log('item', item);
                                return (
                                  <View key={index}>
                                    <View
                                      style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        flexDirection: 'row',
                                        backgroundColor:
                                          index % 2 === 0
                                            ? '#FFFFFF'
                                            : '#F7F8F5',
                                      }}>
                                      <View
                                        style={{
                                          width: wp('25%'),
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
                                        <Text
                                          style={{
                                            fontFamily: 'Inter-Regular',
                                          }}>
                                          {item.inventoryMapping &&
                                            item.inventoryMapping.productName}
                                        </Text>
                                      </View>
                                      {editStatus ? (
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            justifyContent: 'center',
                                            marginLeft: wp('5%'),
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
                                                item.inventoryMapping
                                                  .productUnit}
                                            </Text>
                                          </View>
                                        </View>
                                      ) : (
                                        <View
                                          onLongPress={() =>
                                            this.actionFun(item)
                                          }
                                          style={{
                                            width: wp('25%'),
                                            justifyContent: 'center',
                                            marginLeft: wp('5%'),
                                          }}>
                                          <Text
                                            style={{
                                              marginBottom: 5,
                                              fontFamily: 'Inter-Regular',
                                            }}>
                                            {Number(
                                              item.calculatedQuantity,
                                            ).toFixed(2)}{' '}
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
                                          width: wp('25%'),
                                          justifyContent: 'center',
                                          marginLeft: wp('5%'),
                                        }}>
                                        <Text>
                                          € {Number(item.value).toFixed(2)}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.actionFun(item, index)
                                        }
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
                              })
                            ) : (
                              <View style={{marginTop: hp('3%')}}>
                                <Text style={{color: 'red', fontSize: 20}}>
                                  {translate('No data available')}
                                </Text>
                              </View>
                            )}
                            <View
                              style={{
                                paddingVertical: 15,
                                paddingHorizontal: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: '#FFFFFF',
                              }}>
                              <View
                                style={{
                                  width: wp('25%'),
                                  justifyContent: 'center',
                                }}></View>
                              <View
                                style={{
                                  width: wp('25%'),
                                  justifyContent: 'center',
                                  marginLeft: wp('5%'),
                                }}>
                                <Text>Total HTVA</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('25%'),
                                  justifyContent: 'center',
                                  marginLeft: wp('5%'),
                                }}>
                                <Text>
                                  {' '}
                                  € {Number(totalHTVAVal).toFixed(2)}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('25%'),
                                  justifyContent: 'center',
                                  marginLeft: wp('5%'),
                                }}></View>
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          )} */}

          <Modal isVisible={validateDateStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('60%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
                borderRadius: 6,
              }}>
              <ScrollView>
                <View style={{padding: hp('3%')}}>
                  <View style={{}}>
                    <View style={{}}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        {translate('Delivery date warning')}
                      </Text>
                    </View>
                  </View>
                  <View style={{marginTop: hp('2%')}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                      }}>
                      {validateDateData && validateDateData.message}
                    </Text>
                  </View>
                  {/* <View style={{marginTop: hp('2%')}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                        fontWeight: 'bold',
                      }}>
                      {validateData && validateData.data.header2}
                    </Text>
                  </View> */}
                  {validateDateData &&
                  validateDateData.datesAvailable !== null ? (
                    <View style={{marginTop: hp('2%')}}>
                      {validateDateData &&
                        validateDateData.datesAvailable.map((item, index) => {
                          return (
                            <TouchableOpacity
                              onPress={() =>
                                this.setState({
                                  selectIndex: index,
                                  apiDeliveryDate: item,
                                  finalDeliveryDate:
                                    moment(item).format('DD/MM/YYYY'),
                                })
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <View
                                style={{
                                  borderRadius: 50,
                                  borderWidth: 0.5,
                                  borderColor: 'grey',
                                  padding: 8,
                                  marginTop: 12,
                                  backgroundColor:
                                    index === selectIndex ? '#579BC3' : null,
                                }}></View>
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: 'black',
                                  marginTop: 12,
                                  marginLeft: 10,
                                  padding: 8,
                                }}>
                                {moment(item).format('DD/MM/YYYY')}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    onPress={() =>
                      this.setState(
                        {
                          validateDateStatus: false,
                        },
                        () =>
                          setTimeout(() => {
                            this.setDeliveryDateFun();
                          }, 300),
                      )
                    }
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      backgroundColor: '#5297c1',
                      borderRadius: 6,
                      marginBottom: 5,
                      alignSelf: 'center',
                      marginTop: hp('3%'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {translate('Save')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        validateDateStatus: false,
                      })
                    }
                    style={{
                      width: wp('90%'),
                      height: hp('5%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      marginBottom: 5,
                      alignSelf: 'center',
                      marginTop: hp('1%'),
                    }}>
                    <Text
                      style={{
                        color: '#5297c1',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {translate('Cancel')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>

          <Modal isVisible={stockStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('50%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
                borderRadius: 6,
              }}>
              <ScrollView>
                <View style={{padding: hp('3%')}}>
                  <View style={{}}>
                    <View style={{}}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        {translate('Current stock')}
                      </Text>
                    </View>
                  </View>
                  <View style={{marginTop: hp('2%')}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                      }}>
                      {stockData && stockData.data.message}
                    </Text>
                  </View>
                  {/* <View style={{marginTop: hp('2%')}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                        fontWeight: 'bold',
                      }}>
                      {validateData && validateData.data.header2}
                    </Text>
                  </View> */}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                        marginTop: 10,
                      }}>
                      {translate('Code')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                        marginTop: 10,
                        marginLeft: 20,
                      }}>
                      {translate('Name')}
                    </Text>
                  </View>
                  {stockData && stockData.data.stockDetails !== null ? (
                    <View style={{marginTop: hp('2%')}}>
                      {stockData &&
                        stockData.data.stockDetails.map((item, index) => {
                          return (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: 'black',
                                  marginTop: 10,
                                }}>
                                {item.code}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 15,
                                  color: 'black',
                                  marginTop: 10,
                                  marginLeft: 20,
                                }}>
                                {item.name}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    onPress={() =>
                      this.setState(
                        {
                          stockStatus: false,
                        },
                        () => this.updatedMailFun(),
                      )
                    }
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      backgroundColor: '#5297c1',
                      borderRadius: 6,
                      marginBottom: 5,
                      alignSelf: 'center',
                      marginTop: hp('3%'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {translate('Update')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        stockStatus: false,
                      })
                    }
                    style={{
                      width: wp('90%'),
                      height: hp('5%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      marginBottom: 5,
                      alignSelf: 'center',
                      marginTop: hp('1%'),
                    }}>
                    <Text
                      style={{
                        color: '#5297c1',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {translate('Cancel')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>

          <Modal isVisible={lineDetailsModalStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('100%'),
                height: hp('100%'),
                backgroundColor: '#F0F4FE',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#f2efef',
                }}>
                <KeyboardAwareScrollView
                  keyboardShouldPersistTaps="always"
                  showsVerticalScrollIndicator={false}
                  enableOnAndroid>
                  <View style={styles.secondContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          lineDetailsModalStatus: false,
                        })
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: hp('15%'),
                        marginHorizontal: wp('6%'),
                        marginTop: hp('2%'),
                      }}>
                      <View
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 100,
                          padding: 5,
                        }}>
                        <Image
                          source={img.backIcon}
                          style={{
                            height: 15,
                            width: 15,
                            resizeMode: 'contain',
                          }}
                        />
                      </View>
                      <View style={{marginLeft: 10}}>
                        <Text style={styles.textStylingLogo}>
                          {lineData.inventoryMapping &&
                            lineData.inventoryMapping.inventoryName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View>
                      <View style={styles.insideContainer}>
                        {/* <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              flex: 1,
                            }}>
                            <Text>
                              {lineData.inventoryMapping &&
                                lineData.inventoryMapping.productName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1.5,
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}>
                            <TouchableOpacity
                              onPress={() =>
                                this.editModalQuantityFun('minus', '1')
                              }
                              style={{
                                width: wp('20%'),
                                height: hp('5%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 29,
                                  fontWeight: 'bold',
                                  color: '#5197C1',
                                }}>
                                -
                              </Text>
                            </TouchableOpacity>

                            <TextInput
                              value={String(modalQuantity)}
                              keyboardType="numeric"
                              style={{
                                borderRadius: 6,
                                padding: 10,
                                width: wp('20%'),
                                backgroundColor: '#fff',
                              }}
                              onChangeText={value =>
                                this.editModalQuantityFun('input', value)
                              }
                            />
                            <TouchableOpacity
                              onPress={() =>
                                this.editModalQuantityFun('add', '1')
                              }
                              style={{
                                width: wp('10%'),
                                height: hp('5%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#5197C1',
                                  fontSize: 20,
                                  fontWeight: 'bold',
                                }}>
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View> */}

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            marginTop: hp('3%'),
                          }}>
                          <View
                            style={{
                              flex: 1,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                              }}>
                              {translate('Package size')}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              {lineData.inventoryMapping &&
                                lineData.inventoryMapping.packSize}{' '}
                              {lineData.inventoryMapping &&
                                lineData.inventoryMapping.productUnit}
                            </Text>
                          </View>

                          <View
                            style={{
                              flex: 1,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                              }}>
                              {translate('Ordered Val')}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              € {Number(lineData.value).toFixed(2)}{' '}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            marginTop: hp('2%'),
                          }}>
                          <View
                            style={{
                              flex: 1,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                              }}>
                              Price
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              {lineData.inventoryMapping &&
                                lineData.inventoryMapping.price.toFixed(2)}{' '}
                              €/
                              {lineData.inventoryMapping &&
                                lineData.inventoryMapping.productUnit}
                            </Text>
                          </View>

                          <View
                            style={{
                              flex: 1,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                              }}>
                              {translate('Ordered Qty')}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              {lineData.calculatedQuantity} {lineData.unit}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 6,
                            padding: 12,
                            borderRadius: 6,
                            marginTop: hp('3%'),
                          }}>
                          <View style={{}}>
                            <Text style={{}}>{translate('Notes')}</Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginTop: 10,
                            }}>
                            <TextInput
                              value={itemNotes}
                              onChangeText={value =>
                                this.setState({
                                  itemNotes: value,
                                })
                              }
                              style={{
                                fontWeight: 'bold',
                                color: 'black',
                                width: '90%',
                                height: hp('10%'),
                              }}
                              multiline
                            />
                          </View>
                        </View>
                        {/* <TouchableOpacity
                          onPress={() => this.deleteModalItemFun(lineData)}
                          style={{
                            height: hp('7%'),
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: hp('25%'),
                            width: wp('85%'),
                            borderRadius: 10,
                            alignSelf: 'center',
                            flexDirection: 'row',
                          }}>
                          <Image
                            source={img.deleteIcon}
                            style={{
                              width: 18,
                              height: 18,
                              resizeMode: 'contain',
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 15,
                              color: 'red',
                              fontFamily: 'Inter-SemiBold',
                              fontWeight: 'bold',
                              marginLeft: 10,
                            }}>
                            Delete item from the list
                          </Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                          onPress={() => this.saveNotesFun()}
                          style={{
                            height: hp('7%'),
                            backgroundColor: '#5297C1',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: wp('85%'),
                            borderRadius: 10,
                            alignSelf: 'center',
                            marginTop: hp('20%'),
                          }}>
                          <Text style={styles.signInStylingText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              lineDetailsModalStatus: false,
                            })
                          }
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: hp('2%'),
                          }}>
                          <Text style={{color: '#5297C1', fontWeight: 'bold'}}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </View>
            </View>
          </Modal>

          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => this.previewPDFFun()}
              style={{
                height: hp('7%'),
                width: wp('87%'),
                backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('2%'),
                borderRadius: 10,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  source={img.eyeOpenIcon}
                  style={{
                    width: 22,
                    height: 22,
                    resizeMode: 'contain',
                    tintColor: '#fff',
                  }}
                />
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Preview')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={() => this.sendFun()}
              onPress={() => this.sendFTPFun()}
              style={{
                height: hp('7%'),
                width: wp('87%'),
                backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 10,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  source={img.sendIcon}
                  style={{
                    width: 22,
                    height: 22,
                    resizeMode: 'contain',
                    tintColor: '#fff',
                  }}
                />
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

            <TouchableOpacity
              onPress={() => this.saveDraftFunGreen()}
              style={{
                height: hp('7%'),
                width: wp('87%'),
                backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 10,
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
                  {translate('Save')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('OrderingAdminScreen', {
                  item: '',
                })
              }
              style={{
                height: hp('7%'),
                width: wp('80%'),
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('1.5%'),
                borderRadius: 10,
                marginBottom: hp('3%'),
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#5197C1',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Cancel')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* <View style={{}}>
            <FlatList
              horizontal
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
              // numColumns={3}
            />
          </View> */}
          <Modal isVisible={mailModalVisible} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('85%'),
                alignSelf: 'center',
                borderRadius: 6,
                backgroundColor: '#F5F8FE',
              }}>
              <View
                style={{
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
                  <Text
                    style={{fontSize: 16, color: 'black', fontWeight: 'bold'}}>
                    {translate('Send Order')}
                  </Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    padding: hp('3%'),
                  }}>
                  <View style={{}}>
                    <View style={{backgroundColor: '#fff', padding: 5}}>
                      <Text style={{fontSize: 11, paddingLeft: 15}}>
                        {translate('From')}
                      </Text>
                      <TextInput
                        value={mailTitleValue}
                        placeholder={translate('From')}
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
                    <View
                      style={{
                        marginTop: hp('3%'),
                        backgroundColor: '#fff',
                        padding: 5,
                      }}>
                      <Text style={{fontSize: 11, paddingLeft: 15}}>
                        {' '}
                        {translate('To')}{' '}
                      </Text>
                      <TextInput
                        value={toRecipientValue}
                        placeholder={translate('To')}
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                        onChangeText={value =>
                          this.setState({
                            toRecipientValue: value,
                          })
                        }
                      />
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                        backgroundColor: '#fff',
                        padding: 5,
                      }}>
                      <Text style={{fontSize: 11, paddingLeft: 15}}> Cc </Text>
                      <TextInput
                        value={ccRecipientValue}
                        placeholder="CC"
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                        onChangeText={value =>
                          this.setState({
                            ccRecipientValue: value,
                          })
                        }
                      />
                    </View>

                    <View
                      style={{
                        marginTop: hp('3%'),
                        backgroundColor: '#fff',
                        padding: 5,
                      }}>
                      <Text style={{fontSize: 11, paddingLeft: 15}}>
                        Message
                      </Text>
                      <TextInput
                        value={mailMessageValue}
                        placeholder="Note"
                        style={{
                          padding: 15,
                          width: '100%',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                          fontSize: 14,
                          fontWeight: 'bold',
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
                        justifyContent: 'center',
                        marginTop: hp('4%'),
                      }}>
                      {loaderCompStatus ? (
                        <View
                          style={{
                            width: wp('68%'),
                            height: hp('7%'),
                            alignSelf: 'flex-end',
                            backgroundColor: '#5197C1',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                          }}>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.sendMailFun()}
                          style={{
                            width: wp('68%'),
                            height: hp('7%'),
                            backgroundColor: '#5197C1',
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
                            {translate('Send')}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => this.closeMailModal()}
                        style={{
                          width: wp('68%'),
                          height: hp('7%'),
                          alignSelf: 'flex-end',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: wp('2%'),
                          borderRadius: 100,
                          marginTop: hp('2%'),
                        }}>
                        <Text
                          style={{
                            color: '#5197C1',
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
                onPress={() => this.editInventoryFun()}>
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
                    Edit Inventory
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
                onPress={() => this.deleteInventoryFun()}>
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
                    Delete Inventory
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

          {/* <Modal isVisible={validateDateStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('50%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
                borderRadius: 6,
              }}>
              <ScrollView>
                <View style={{padding: hp('3%')}}>
                  <View style={{}}>
                    <View style={{}}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        {validateData && validateData.data.header1}
                      </Text>
                    </View>
                  </View>
                  <View style={{marginTop: hp('2%')}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                      }}>
                      {validateData && validateData.data.message}
                    </Text>
                  </View>
                  <View style={{marginTop: hp('2%')}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                        fontWeight: 'bold',
                      }}>
                      {validateData && validateData.data.header2}
                    </Text>
                  </View>
                  {validateData && validateData.data.parameters !== null ? (
                    <View style={{marginTop: hp('2%')}}>
                      {validateData &&
                        validateData.data.parameters.map((item, index) => {
                          return (
                            <Text
                              style={{
                                fontSize: 15,
                                color: 'black',
                                marginTop: 10,
                              }}>
                              {item}
                            </Text>
                          );
                        })}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        validateDateModalStatus: false,
                      })
                    }
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      backgroundColor: '#5297c1',
                      borderRadius: 6,
                      marginBottom: 5,
                      alignSelf: 'center',
                      marginTop: hp('3%'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {validateData && validateData.data.severity < 3
                        ? translate('No')
                        : translate('Ok')}
                    </Text>
                  </TouchableOpacity>

                  {validateData && validateData.data.severity < 3 ? (
                    <TouchableOpacity
                      onPress={() =>
                        this.setState(
                          {
                            validateDateModalStatus: false,
                          },
                          () =>
                            setTimeout(() => {
                              this.optionFun(emailData);
                            }, 300),
                        )
                      }
                      style={{
                        width: wp('90%'),
                        height: hp('5%'),
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                        marginBottom: 5,
                        alignSelf: 'center',
                        marginTop: hp('1%'),
                      }}>
                      <Text
                        style={{
                          color: '#5297c1',
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}>
                        {translate('Yes')}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </ScrollView>
            </View>
          </Modal> */}
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

export default connect(mapStateToProps, {UserTokenAction})(Basket);
