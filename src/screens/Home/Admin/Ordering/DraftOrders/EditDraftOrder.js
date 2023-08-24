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
  lookupDepartmentsApi,
  deleteOrderApi,
  duplicateApi,
  validateUserApi,
  checkStockApi,
  setDeliveryDateApi,
  validateDeliveryDateApi,
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {translate} from '../../../../../utils/translations';
import Modal from 'react-native-modal';
import LoaderComp from '../../../../../components/Loader';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SurePopUp from '../../../../../components/SurePopUp';

const numColumns = 2;

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
      showMoreStatus: false,
      deliveryDateOrder: '',
      departmentData: [],
      buttonsLoader: true,
      channel: '',
      pageNotes: '',
      itemNotes: '',
      lineDetailsModalStatus: false,
      modalQuantity: '0',
      lineData: '',
      pickerModalStatus: false,
      duplicateModalStatus: false,
      deleteModalStatus: false,
      totalHTVA: '',
      isFreemium: '',
      validateDateModalStatus: false,
      stockStatus: false,
      validateData: '',
      stockData: '',
      emailData: '',
      validateDateData: '',
      selectIndex: 0,
    };
  }

  getDepartmentData() {
    lookupDepartmentsApi()
      .then(res => {
        console.log('resssDepartData--->', res.data);
        let finalArray = res.data.map((item, index) => {
          return {
            id: item.id,
            name: item.name,
            displayName: item.displayName,
          };
        });
        this.setState({
          departmentData: finalArray,
          buttonsLoader: false,
        });
      })
      .catch(error => {
        console.log('err', error.response);
      });
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
    // console.log('payload->validateUserApi', payload);
    validateUserApi(payload)
      .then(res => {
        // console.log('res-Validate', res);
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
              text: 'Okay',
            },
          ],
        );
      });
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

  sendFun = () => {
    const {finalDeliveryDate} = this.state;

    if (finalDeliveryDate) {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.sendFunSec(),
      );
    } else {
      Alert.alert(``, translate('Please select delivery date first'), [
        {
          text: translate('Ok'),
        },
      ]);
    }

    // const {channel} = this.state;
    // if (channel === 'Ftp') {
    //   Alert.alert(`Grainz`, 'Do yo want to send this order?', [
    //     {
    //       text: 'Yes',
    //       onPress: () => this.sendFunSec(),
    //     },
    //     {
    //       text: 'No',
    //       // onPress: () => this.props.navigation.goBack(),
    //     },
    //   ]);
    // } else {
    //   this.setState(
    //     {
    //       loaderCompStatus: true,
    //     },
    //     () => this.sendFunSec(),
    //   );
    // }
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
      finalApiData
      // apiDeliveryDate
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
      // console.log('payload', payload);
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
              // },
              // () => this.validateDeliveryDateFun(res),
            },
            () => this.checkStockFun(res),
          );
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
    } else {
      Alert.alert(``, translate('Please select all values'), [
        {
          text: translate('Ok'),
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  optionFun = (data, res) => {
    const {channel} = this.state;
    console.log('CHANNEL', channel);
    if (channel === 'Ftp') {
      console.log('IF');
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
      console.log('ELSE');
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
    // console.log('payload-updateDraftFun', payload);
    updateDraftOrderNewApi(payload)
      .then(res => {
        // console.log('res-updateDraftFun', res);
        this.setState({
          loaderCompStatus: false,
          finalDeliveryDate:
            res.data.deliveryDate &&
            moment(res.data && res.data.deliveryDate).format('DD/MM/YYYY'),
        });
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-2',
          [
            {
              text: 'Okay',
            },
          ],
        );
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
    const {productId, basketId, finalData} =
      this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          productId,
          basketId,
          modalLoaderDrafts: true,
          finalData,
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
        finalDataSec: '',
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

  previewPDFFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.viewFun(),
    );
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
            'Something went wrong-3',
            [
              {
                text: translate('Ok'),
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
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-4',
          [
            {
              text: 'Okay',
            },
          ],
        );
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
    let newdate = moment(date).format('DD/MM/YYYY');
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

  deleteFunOrder = (data, index) => {
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
      Alert.alert(
        '',
        translate('Are you sure you want to delete this order line item?'),
        [
          {
            text: translate('Yes'),
            onPress: () => this.hitDeleteApi(),
          },
          {
            text: translate('No'),
            style: 'cancel',
          },
        ],
      );
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
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-5',
          [
            {
              text: 'Okay',
            },
          ],
        );
      });
  };

  getInventoryFun = () => {
    const {productId, basketId, apiDeliveryDate} = this.state;
    // console.log('BASKWTID', basketId);

    getBasketApi(basketId)
      .then(res => {
        console.log('res-BASKETDATA', res);

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
        this.setState({
          departmentData: finalArray,
          buttonsLoader: false,
        });

        this.setState(
          {
            departmentData: finalArray,
            buttonsLoader: false,
            draftsOrderData: res.data,
            inventoryData: res.data && res.data.shopingBasketItemList,
            modalLoaderDrafts: false,
            supplierValue: res.data && res.data.supplierId,
            finalOrderDate: moment(res.data && res.data.orderDate).format(
              'DD/MM/YYYY',
            ),
            finalOrderMinDate: new Date(),
            finalDeliveryDate:
              res.data.deliveryDate &&
              moment(res.data && res.data.deliveryDate).format('DD/MM/YYYY'),
            apiDeliveryDate:
              res.data && res.data.deliveryDate !== null
                ? res.data && res.data.deliveryDate
                : apiDeliveryDate,
            apiOrderDate: res.data && res.data.orderDate,
            placedByValue: res.data && res.data.placedBy,
            productId,
            channel: res.data.deliveryChannel,
            totalHTVA: res.data.totalValue,
          },
          () => this.createApiData(),
        );
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-6',
          [
            {
              text: 'Okay',
              onPress: () =>
                this.setState({
                  modalLoaderDrafts: false,
                }),
            },
          ],
        );
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
        notes: item.notes,
      });
    });
    this.setState(
      {
        finalApiData: [...finalArr],
      },
      () => this.updateDraftFun(),
    );
  };

  editQuantityFun = (index, type, value, data, valueType) => {
    const {inventoryData} = this.state;

    // console.log('data', data);

    const valueSec = data.quantity === '' ? Number(0) : Number(data.quantity);
    const volume = data.inventoryMapping && data.inventoryMapping.volume;
    const valueMinus = valueSec - Number(1);
    // console.log('valueMinus--> ', valueMinus);

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

    // console.log('inven-->', inventoryData);

    if (valueType === 'minus') {
      let newArr = inventoryData.map((item, i) =>
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
        inventoryData: [...newArr],
        finalApiData: [...newArr],
        totalHTVA: newArr.reduce((n, {value}) => n + value, 0),
      });
    } else if (valueType === 'input') {
      let newArr = inventoryData.map((item, i) =>
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
        inventoryData: [...newArr],
        finalApiData: [...newArr],
        totalHTVA: newArr.reduce((n, {value}) => n + value, 0),
      });
    } else if (valueType === 'add') {
      let newArr = inventoryData.map((item, i) =>
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

      // console.log();

      this.setState({
        inventoryData: [...newArr],
        finalApiData: [...newArr],
        totalHTVA: newArr.reduce((n, {value}) => n + value, 0),
      });
    }
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
    // console.log('payload', payload);
    updateBasketApi(payload)
      .then(res => {
        this.setState(
          {
            modalLoaderDrafts: true,
            // editStatus: false,
            loaderCompStatus: false,
          },
          () => this.props.navigation.goBack(),
          // ,
          // () => this.getInventoryFun(),
        );
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-7',
          [
            {
              text: 'Okay',
              onPress: () => this.props.navigation.goBack(),
            },
          ],
        );
      });
  };

  closeMailModal = () => {
    this.setState({
      mailModalVisible: false,
    });
  };

  sendMailFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.sendMailFunSec(),
    );
  };

  sendMailFunSec = () => {
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
      itemsToRemove: ['123229'],
    };

    sendOrderApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
            mailModalVisible: false,
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
          'Something went wrong-8',
          [
            {
              text: 'Okay',
            },
          ],
        );
      });
  };

  deleteOrderFun = () => {};

  deleteDraftFun = () => {
    Alert.alert(
      '',
      translate('Are you sure you want to delete this draft from the list?'),
      [
        {
          text: translate('No'),
          style: 'cancel',
        },
        {
          text: translate('Yes'),
          onPress: () => this.deleteFun(),
        },
      ],
    );
  };

  deleteFun = () => {
    const {productId} = this.state;
    // console.log('productId', productId);
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

  onPressFun = item => {
    const {supplierValue, placedByValue, basketId} = this.state;
    this.props.navigation.navigate('AddItemsOrderScreen', {
      departID: item.id,
      departName: item.displayName,
      screen: 'Update',
      navigateType: 'EditDraft',
      basketId: basketId,
      supplierValue,
      finalDataSec: '',
    });
  };

  saveNoteFun = () => {
    const {inventoryData, itemNotes, lineIndex} = this.state;
    // console.log('lineIndex', lineIndex);
    let newArr = inventoryData.map((item, i) =>
      lineIndex === i
        ? {
            ...item,
            ['notes']: itemNotes,
          }
        : item,
    );
    this.setState(
      {
        inventoryData: [...newArr],
        finalApiData: [...newArr],
        lineDetailsModalStatus: false,
      },
      () => this.updateBasketFun(),
    );
  };

  deleteModalItemFun = data => {
    this.setState(
      {
        lineDetailsModalStatus: false,
      },
      () => this.deleteFunOrder(data),
    );
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

  pickerFun = item => {
    // console.log('item', item);
    this.setState({
      pickerModalStatus: true,
      param: item,
    });
  };

  duplicateModalFun = () => {
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(
          () =>
            this.setState({
              duplicateModalStatus: true,
            }),
          1000,
        ),
    );
  };

  closeModalFun = () => {
    this.setState({
      pickerModalStatus: false,
      duplicateModalStatus: false,
      deleteModalStatus: false,
    });
  };

  duplicateModalFunSec = () => {
    // shopingBasketId = param.shopingBasketId
    // this.setState({
    //   duplicateModalStatus: false,
    // });

    const {param} = this.state;
    this.setState(
      {
        recipeLoader: true,
        duplicateModalStatus: false,
      },
      () =>
        duplicateApi(param.id)
          .then(res => {
            // console.log('Res', res);
            this.setState(
              {
                recipeLoader: false,
              },
              () => this.props.navigation.goBack(),
            );
          })
          .catch(error => {
            this.setState({
              deleteLoader: false,
            });
            console.warn('Duplicateerror', error.response);
          }),
    );
  };

  deleteModalFun = () => {
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(
          () =>
            this.setState({
              deleteModalStatus: true,
            }),
          1000,
        ),
    );
  };

  goBackFun = () => {
    this.props.navigation.navigate('DraftOrderAdminScreen');
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
        // console.log('res-DELIVERYDAATE', res);
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

  updatedMailFun = () => {
    const {emailData, stockData, channel} = this.state;

    let finalArray =
      stockData &&
      stockData.data.stockDetails.map((item, index) => {
        return item.code;
      });

    console.log('FINALARRRR', finalArray);
    console.log('channel', channel);

    if (channel === 'Ftp') {
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
      showMoreStatus,
      finalData,
      buttonsLoader,
      departmentData,
      pageNotes,
      itemNotes,
      lineDetailsModalStatus,
      modalQuantity,
      lineData,
      pickerModalStatus,
      duplicateModalStatus,
      deleteModalStatus,
      totalHTVA,
      isFreemium,
      validateDateModalStatus,
      stockStatus,
      validateData,
      stockData,
      emailData,
      validateDateStatus,
      validateDateData,
      selectIndex,
    } = this.state;

    // console.log('finalData', finalData);
    // console.log('stockData', stockData);

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
          <View>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 4,
                  }}
                  onPress={() => this.goBackFun()}>
                  <View style={styles.goBackContainer}>
                    <Image source={img.backIcon} style={styles.tileImageBack} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.adminTextStyle}>
                      {translate('Draft')} - {finalData.supplierName}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.pickerFun(finalData)}
                  style={{
                    flex: 1,
                    alignItems: 'flex-end',
                  }}>
                  <Image
                    source={img.threeDotsIcon}
                    style={{
                      height: 16,
                      width: 16,
                      resizeMode: 'contain',
                      tintColor: 'grey',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* <View style={styles.subContainer}>
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
          </View> */}
          <View style={{marginHorizontal: wp('5%')}}>
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
                    borderTopLeftRadius: 6,
                    padding: 15,
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

              {/* <TouchableOpacity
                onPress={() =>
                  this.setState({
                    showMoreStatus: !showMoreStatus,
                  })
                }
                style={{
                  flex: 0.2,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  borderTopRightRadius: 6,
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
              </TouchableOpacity> */}
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
                        value={finalData.placedByNAme}
                        editable={false}
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                      {/* <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={{
                          marginTop: 15,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#66A4C8',
                          }}>
                          Edit Details
                        </Text>
                      </TouchableOpacity> */}
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
                  <View style={{flex: 2}}>
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
                        value={moment(finalData.orderDate).format('DD/MM/YYYY')}
                        editable={false}
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        showMoreStatus: !showMoreStatus,
                      })
                    }
                    style={{
                      flex: 0.5,
                    }}></TouchableOpacity>
                </View>

                {/* <View style={{flex: 1}}>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      padding: 15,
                      marginBottom: hp('3%'),
                      borderBottomRightRadius: 6,''
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
                        value={moment(finalData.orderDate).format('DD/MM/YYYY')}
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
                        marginTop: 10,
                      }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                        }}></Text>
                    </TouchableOpacity>
                  </View>
                </View> */}
              </View>
            ) : null}
            {/* <View
              style={{
                flexDirection: 'row',
                width: wp('90%'),
                backgroundColor: '#fff',
                paddingVertical: 15,
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
                    padding:  15,
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
                      marginTop:  15,
                      marginRight: 15 ,
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
                    padding: 15,
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
                      marginTop: 15 ,
                      marginRight: 15,
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
            <View>
              {/* <View
                style={{
                  marginTop: hp('3%'),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: wp('90%'),
                    backgroundColor: '#fff',
                    paddingVertical: 15,
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
                        marginTop:  15,
                      }}
                    />
                  </View>
                </View>
              </View> */}
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
                        Dimensions.get('window').width / numColumns - wp('3%'),
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

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('2%'), marginBottom: hp('2%')}}>
              {inventoryData &&
                inventoryData.map((item, index) => {
                  // console.log('item--11-1-1-1>', item);
                  return (
                    <View
                      style={{
                        marginHorizontal: wp('6%'),
                        marginBottom: 10,
                        // borderWidth: 1,
                        borderRadius: 6,
                        // borderColor: 'grey',
                        backgroundColor: '#fff',
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
                          <Text style={{fontSize: 16, fontWeight: 'bold'}}>
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
                          onPress={() => this.deleteFunOrder(item, index)}
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
                                fontSize: 30,
                                fontWeight: 'bold',
                                color: '#5197C1',
                              }}>
                              -
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              width: '30%',
                              backgroundColor: '#fff',
                            }}>
                            <TextInput
                              value={String(item.quantity)}
                              keyboardType="numeric"
                              style={{
                                borderRadius: 6,
                                padding: 10,
                                width: '100%',
                                color: 'black',
                                height: '100%',
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
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#5197C1',
                                fontSize: 25,
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
                            }}>
                            {item.inventoryMapping &&
                              item.inventoryMapping.price &&
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
                        {parseFloat(totalHTVA).toFixed(2)} €
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: hp('2%'),
                  marginHorizontal: wp('5%'),
                  borderRadius: 6,
                }}>
                <View style={{}}>
                  <Text style={{}}>Note</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                  }}>
                  <TextInput
                    value={pageNotes}
                    onChangeText={value =>
                      this.setState({
                        pageNotes: value,
                      })
                    }
                    style={{
                      fontWeight: 'bold',
                      color: 'black',
                      width: '90%',
                      height: hp('15%'),
                    }}
                    multiline
                  />
                </View>
              </View> */}

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
          {/* <View style={{marginVertical: hp('3%')}}>
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
          </View> */}
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
          {/* <View style={{justifyContent: 'center', alignItems: 'center'}}>
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
          </View> */}

          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => this.previewPDFFun()}
              style={{
                height: hp('7%'),
                width: wp('87%'),
                // backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('2%'),
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#5197C1',
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
                    tintColor: '#5197C1',
                  }}
                />
                <Text
                  style={{
                    color: '#5197C1',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Preview')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.sendFun()}
              // onPress={() => this.sendFunSec()}
              style={{
                height: hp('7%'),
                width: wp('87%'),
                // backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#5197C1',
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
                    tintColor: '#5197C1',
                  }}
                />
                <Text
                  style={{
                    color: '#5197C1',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Send')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.updateBasketFun()}
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
              onPress={() => this.props.navigation.goBack()}
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
          <Modal
            isVisible={pickerModalStatus}
            backdropOpacity={0.35}
            animationIn="bounceInRight">
            <View
              style={{
                width: wp('80%'),
                height: hp('20%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
                borderRadius: 6,
              }}>
              <View
                style={{
                  height: hp('5%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flex: 3,
                  }}></View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        pickerModalStatus: false,
                      })
                    }>
                    <Image
                      source={img.cancelIcon}
                      style={{
                        height: 22,
                        width: 22,
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView>
                <View style={{padding: hp('3%')}}>
                  <TouchableOpacity
                    onPress={() => this.duplicateModalFun()}
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      backgroundColor: '#5297c1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 6,
                      marginBottom: 5,
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {translate('Duplicate')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => this.deleteModalFun()}
                    style={{
                      width: wp('90%'),
                      height: hp('5%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      marginBottom: 5,
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'red',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {translate('Delete')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>

          <SurePopUp
            pickerModalStatus={duplicateModalStatus}
            headingText={translate('Duplicate')}
            crossFun={() => this.closeModalFun()}
            bodyText={translate('WholeList')}
            cancelFun={() => this.closeModalFun()}
            saveFun={() => this.duplicateModalFunSec()}
            yesStatus
          />
          <SurePopUp
            pickerModalStatus={deleteModalStatus}
            headingText={translate('Delete')}
            crossFun={() => this.closeModalFun()}
            bodyText={translate(
              'Are you sure you want to delete this draft from the list?',
            )}
            cancelFun={() => this.closeModalFun()}
            saveFun={() => this.deleteFun()}
            yesStatus
          />
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
                              {Number(lineData.value).toFixed(2)} €
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
                              {translate('Price')}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              {lineData.inventoryMapping &&
                                lineData.inventoryMapping.price}{' '}
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
                          onPress={() => this.saveNoteFun()}
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
                          <Text style={styles.signInStylingText}>
                            {translate('Save')}
                          </Text>
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
                            {translate('Cancel')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </View>
            </View>
          </Modal>
          <Modal isVisible={mailModalVisible} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('100%'),
                height: hp('100%'),
                alignSelf: 'center',
                borderRadius: 6,
                backgroundColor: '#F5F8FE',
              }}>
              <View style={{marginTop: hp('4%')}}>
                <Header
                  logoutFun={this.myProfileFun}
                  logoFun={() => this.props.navigation.navigate('HomeScreen')}
                />
              </View>
              <View style={{}}>
                <View style={styles.subContainer}>
                  <View style={styles.firstContainer}>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.goBack()}
                      style={styles.goBackContainer}>
                      <Image
                        source={img.backIcon}
                        style={styles.tileImageBack}
                      />
                    </TouchableOpacity>
                    <View style={styles.flex}>
                      <Text style={styles.adminTextStyle}>
                        {translate('Send Order')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    padding: hp('3%'),
                  }}>
                  <View style={{}}>
                    <View
                      style={{
                        backgroundColor: '#fff',
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: hp('3%'),
                      }}>
                      <Text style={{fontSize: 11, marginBottom: 10}}>From</Text>
                      <TextInput
                        value={mailTitleValue}
                        placeholder={translate('From')}
                        style={{
                          width: '100%',
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
                        backgroundColor: '#fff',
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: hp('3%'),
                      }}>
                      <Text style={{fontSize: 11, marginBottom: 10}}> To </Text>
                      <TextInput
                        value={toRecipientValue}
                        placeholder={translate('To')}
                        style={{
                          width: '100%',
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
                        backgroundColor: '#fff',
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: hp('3%'),
                      }}>
                      <Text style={{fontSize: 11, marginBottom: 10}}> Cc </Text>
                      <TextInput
                        value={ccRecipientValue}
                        placeholder="CC"
                        style={{
                          width: '100%',
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
                        backgroundColor: '#fff',
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: hp('3%'),
                      }}>
                      <Text style={{fontSize: 11, marginBottom: 10}}>
                        Message
                      </Text>
                      <TextInput
                        value={mailMessageValue}
                        placeholder={translate('Note')}
                        style={{
                          width: '100%',

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
                      <TouchableOpacity
                        onPress={() => this.sendMailFun()}
                        style={{
                          width: wp('87%'),
                          height: hp('5%'),
                          backgroundColor: '#5197C1',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 8,
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
                      <TouchableOpacity
                        onPress={() => this.closeMailModal()}
                        style={{
                          width: wp('87%'),
                          height: hp('5%'),
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 8,
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
                      {validateDateData.message}
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
                        marginLeft: 37,
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

          {/* <Modal isVisible={actionModalStatus} backdropOpacity={0.35}>
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

export default connect(mapStateToProps, {UserTokenAction})(EditDraftOrder);
