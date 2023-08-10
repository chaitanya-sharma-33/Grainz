import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../../constants/images';
import SubHeader from '../../../../../components/SubHeader';
import Header from '../../../../../components/Header';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getOrderByIdApi,
  processPendingOrderApi,
  processPendingOrderItemApi,
  flagApi,
  viewCreditNoteApi,
  updateCreditNoteApi,
} from '../../../../../connectivity/api';
import styles from '../style';
import {translate} from '../../../../../utils/translations';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LoaderComp from '../../../../../components/Loader';
import TriStateToggleSwitch from 'rn-tri-toggle-switch';
import Modal from 'react-native-modal';

class ViewReviewOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      buttonsSubHeader: [],
      loader: true,
      userId: '',
      userArr: [],
      pageData: '',
      finalOfferListArr: [],
      productId: '',
      isDatePickerVisibleDeliveryDate: false,
      finalDeliveryDate: '',
      apiDeliveryDate: '',
      isDatePickerVisibleArrivalDate: false,
      finalArrivalDate: '',
      apiArrivalDate: '',
      pageInvoiceNumber: '',
      creditApprovedValue: '',
      pageDeliveryNoteReference: '',
      pageAmbientTemp: '',
      pageChilledTemp: '',
      pageFrozenTemp: '',
      pageNotes: '',
      pageOrderItems: [],
      finalApiData: [],
      loaderCompStatus: false,
      allSwitchStatus: false,
      arrivalDataStatus: false,
      modalVisibleEditElement: false,
      modalOrderedInventoryVolume: '',
      modalQuantityOrdered: '',
      modalQuantityDelivered: '',
      modalUserQuantityDelivered: '',
      modalQuantityInvoiced: '',
      modalUserQuantityInvoiced: '',
      modalPricePaid: '',
      switchValueAll: false,
      flagStatus: false,
      modalNotes: '',
      modalData: '',
      totalValue: '',
      isAuditStatus: false,
      initialValueAllCorrect: 'null',
      isCheckedEditableStatus: true,
      supplierId: '',
      isDatePickerArrivalDateSpecific: false,
      basketId: '',
      supplierName: '',
      listId: '',
      showMoreStatus: false,
      listIndex: '',
      finalData: '',
      isFreemium: '',
      creditRequested: '',
      netValue: '',
      choicesProp: [
        {
          choiceCode: 'Y',
          choiceText: 'Y',
        },
        {
          choiceCode: 'N',
          choiceText: 'N',
        },
      ],
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
        this.setState({
          loader: false,

          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        console.warn('ERr', err.response);
      });
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  componentDidMount() {
    this.getData();
    const {productId, supplierId, supplierName, basketId, listId, finalData} =
      this.props.route && this.props.route.params;

    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          productId: productId,
          arrivalDataStatus: false,
          loaderCompStatus: true,
          supplierId: supplierId,
          supplierName: supplierName,
          basketId: basketId,
          listId: listId,
          finalData,
        },
        () => this.getOrderFun(),
      );
    });
  }

  getOrderFun = () => {
    const {productId} = this.state;
    getOrderByIdApi(productId)
      .then(res => {
        const {data} = res;
        console.log('data', data);
        this.setState(
          {
            pageData: data,
            finalDeliveryDate: moment(data.deliveryDate).format('DD-MM-YYYY'),
            pageInvoiceNumber: data.invoiceNumber,
            pageDeliveryNoteReference: data.deliveryNoteReference,
            pageAmbientTemp: data.ambientTemp,
            pageChilledTemp: data.chilledTemp,
            pageFrozenTemp: data.frozenTemp,
            pageNotes: data.notes,
            apiDeliveryDate: data.deliveryDate,
            pageOrderItems: data.orderItems,
            apiArrivalDate: data.deliveredDate,
            emailDetails: data.emailDetails,
            finalArrivalDate: moment(data.deliveredDate).format('DD-MM-YYYY'),
            loaderCompStatus: false,
            totalValue: data.htva.toFixed(2),
          },
          () => this.createFinalData(),
        );
      })
      .catch(err => {
        console.log('ERR MEP', err);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            // onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  createFinalData = () => {
    const {pageOrderItems, finalStatusSwitch} = this.state;
    let finalArray = pageOrderItems.map((item, index) => {
      return {
        arrivedDate: item.arrivedDate,
        id: item.id,
        inventoryId: item.inventoryId,
        inventoryProductMappingId:
          item.inventoryMapping && item.inventoryMapping.id,
        isCorrect: item.isCorrect,
        notes: item.notes,
        orderValue: item.orderValue,
        pricePaid: item.pricePaid,
        quantityDelivered: item.quantityDelivered,
        quantityInvoiced: item.quantityInvoiced,
        quantityOrdered: item.quantityOrdered,
        userQuantityDelivered: item.userQuantityDelivered,
        userQuantityInvoiced: item.userQuantityInvoiced,
        isFlagged: item.isFlagged,
      };
    });

    const result = finalArray;
    this.setState(
      {
        finalApiData: [...result],
        switchValueAll: !finalStatusSwitch,
      },
      () => this.isCheckedEditableStatusFun(),
    );
  };

  isCheckedEditableStatusFun = () => {
    const {pageData} = this.state;
    const finalStatus = pageData.orderItems.some((item, index) => {
      return item.isCorrect === false || item.isCorrect === null;
    });
    this.setState({
      isCheckedEditableStatus: finalStatus,
      loaderCompStatus: false,
      switchValueAll: !finalStatus,
    });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  saveFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.hitProcessOrderApi(),
    );
  };

  hitProcessOrderApi = () => {
    const {
      apiDeliveryDate,
      apiArrivalDate,
      pageInvoiceNumber,
      pageDeliveryNoteReference,
      pageAmbientTemp,
      pageChilledTemp,
      pageFrozenTemp,
      pageNotes,
      pageData,
      finalApiData,
      productId,
      isAuditStatus,
      switchValueAll,
    } = this.state;
    let payload = {
      ambientTemp: pageAmbientTemp,
      chilledTemp: pageChilledTemp,
      deliveredDate: apiArrivalDate,
      deliveryDate: apiDeliveryDate,
      deliveryNoteReference: pageDeliveryNoteReference,
      frozenTemp: pageFrozenTemp,
      id: productId,
      invoiceNumber: pageInvoiceNumber,
      isAuditComplete: isAuditStatus,
      notes: pageNotes,
      orderDate: pageData.orderDate,
      orderItems: finalApiData,
      orderReference: pageData.orderReference,
      placedBy: pageData.placedByNAme,
      isChecked: switchValueAll,
    };

    processPendingOrderApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.navigateToOrderScreen(),
        );
        // Alert.alert(`Grainz`, 'Order processed successfully', [
        //   {
        //     text: 'Okay',
        //     onPress: () => this.navigateToOrderScreen(),
        //   },
        // ]);
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

  navigateToOrderScreen = () => {
    const {arrivalDataStatus} = this.state;
    if (arrivalDataStatus) {
      this.getOrderFun();
      // this.setState(
      //   {
      //     loaderCompStatus: true,
      //   },
      //   () => this.getOrderFun(),
      // );
    } else {
      this.props.navigation.navigate('OrderingAdminScreen', {
        item: '',
      });
    }
  };

  deleteFun = item => {
    Alert.alert(
      ``,
      translate('Are you sure you want to delete this order line item?'),
      [
        {
          text: translate('Yes'),
          onPress: () =>
            this.setState(
              {
                loaderCompStatus: true,
              },
              () => this.hitDeleteApi(item),
            ),
        },
        {
          text: translate('No'),
        },
      ],
    );
  };

  hitDeleteApi = item => {
    let payload = {
      action: 'Delete',
      id: item.id,
      inventoryId: item.inventoryId,
      inventoryProductMappingId:
        item.inventoryMapping && item.inventoryMapping.id,
      isCorrect: !item.isCorrect,
      notes: item.notes,
      orderId: item.orderId,
      orderValue: item.orderValue,
      position: item.position,
      pricePaid: item.pricePaid,
      quantityDelivered: item.quantityDelivered,
      quantityInvoiced: item.quantityInvoiced,
      quantityOrdered: item.quantityOrdered,
      userQuantityDelivered: item.userQuantityDelivered,
      userQuantityInvoiced: item.userQuantityInvoiced,
    };

    processPendingOrderItemApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.getOrderFun(),
        );

        // Alert.alert(`Grainz`, 'Order line item deleted successfully', [
        //   {
        //     text: 'Okay',
        //     onPress: () =>
        //       this.setState(
        //         {
        //           loaderCompStatus: true,
        //         },

        //         () => this.getOrderFun(),
        //       ),
        //   },
        // ]);
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

  showDatePickerDeliveryDate = () => {
    this.setState({
      isDatePickerVisibleDeliveryDate: true,
    });
  };

  handleConfirmDeliveryDate = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
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

  showDatePickerArrivalDate = () => {
    this.setState({
      isDatePickerVisibleArrivalDate: true,
    });
  };

  showDatePickerArrivalDateSpecific = () => {
    Alert.alert(``, '', [
      {
        text: translate('Cancel'),
        style: 'cancel',
      },
      {
        text: translate('Clear'),
        onPress: () =>
          this.setState({
            finalArrivedDate: '',
            finalArrivalDateSpecific: '',
            apiArrivalDate: '',
            apiArrivalDateSpecific: '',
          }),
      },
      {
        text: translate('Select Date'),
        onPress: () => this.showDatePickerArrivalDateSpecificSec(),
      },
    ]);
  };

  showDatePickerArrivalDateSpecificSec = () => {
    this.setState({
      isDatePickerArrivalDateSpecific: true,
    });
  };

  handleConfirmArrivalDate = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    let apiArrivalDate = date.toISOString();
    this.hideDatePickerArrivalDate();
    this.setState(
      {
        finalArrivalDate: newdate,
        apiArrivalDate,
        arrivalDataStatus: true,
      },
      () =>
        setTimeout(() => {
          this.editArrivalDateFun();
        }, 300),
    );
  };

  editArrivalDateFun = index => {
    const {finalApiData, apiArrivalDate} = this.state;
    const arrivedDate = apiArrivalDate;
    let newArr = finalApiData.map((item, i) =>
      index === i
        ? {
            ...item,
            ['arrivedDate']: arrivedDate,
          }
        : {
            ...item,
            ['arrivedDate']: arrivedDate,
          },
    );

    this.setState(
      {
        finalApiData: [...newArr],
      },
      () => this.saveFun(),
    );
  };

  handleConfirmArrivalDateSpecific = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    let apiArrivalDateSpecific = date.toISOString();
    this.hideDatePickerArrivalDateSpecific();
    this.setState({
      finalArrivalDateSpecific: newdate,
      apiArrivalDateSpecific,
    });
  };

  hideDatePickerArrivalDateSpecific = () => {
    this.setState({
      isDatePickerArrivalDateSpecific: false,
    });
  };

  hideDatePickerArrivalDate = () => {
    this.setState({
      isDatePickerVisibleArrivalDate: false,
    });
  };
  updateCorrectStatus = (item, value) => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.updateCorrectStatusSec(item, value),
    );
  };

  updateCorrectStatusSec = (item, value) => {
    const finalValue = value;
    let payload = {
      action: 'Update',
      arrivedDate: item.arrivedDate,
      id: item.id,
      inventoryId: item.inventoryId,
      inventoryProductMappingId:
        item.inventoryMapping && item.inventoryMapping.id,
      isCorrect: finalValue,
      notes: item.notes,
      orderId: item.orderId,
      orderValue: item.orderValue,
      position: item.position,
      pricePaid: item.pricePaid,
      quantityDelivered: item.quantityDelivered,
      quantityInvoiced: item.quantityInvoiced,
      quantityOrdered: item.quantityOrdered,
      userQuantityDelivered: item.userQuantityDelivered,
      userQuantityInvoiced: item.userQuantityInvoiced,
      isFlagged: item.isFlagged,
    };
    if (item.arrivedDate) {
      processPendingOrderItemApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
            },
            () => this.getOrderFun(),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: 'Okay',
                onPress: () => this.props.navigation.goBack(),
              },
            ],
          );
        });
    } else {
      Alert.alert(`Grainz`, 'Kildly fill arrived date first', [
        {
          text: 'Okay',
          onPress: () => this.closeLoader(),
        },
      ]);
    }
  };

  closeLoader = () => {
    this.setState(
      {
        pageOrderItems: [],
        allSwitchStatus: false,
      },

      () => this.getOrderFun(),
    );
  };

  updateCorrectStatusForAll = value => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.createFinalDataForCorrect(value),
    );
  };

  createFinalDataForCorrect = value => {
    const {pageOrderItems} = this.state;
    const finalValue =
      value && value.choiceCode === 'Y'
        ? true
        : value && value.choiceCode === 'N'
        ? false
        : null;
    let finalArray = pageOrderItems.map((item, index) => {
      return {
        arrivedDate: item.arrivedDate,
        id: item.id,
        inventoryId: item.inventoryId,
        inventoryProductMappingId:
          item.inventoryMapping && item.inventoryMapping.id,
        isCorrect: finalValue,
        notes: item.notes,
        orderValue: item.orderValue,
        pricePaid: item.pricePaid,
        quantityDelivered: item.quantityDelivered,
        quantityInvoiced: item.quantityInvoiced,
        quantityOrdered: item.quantityOrdered,
        userQuantityDelivered: item.userQuantityDelivered,
        userQuantityInvoiced: item.userQuantityInvoiced,
        isFlagged: item.isFlagged,
      };
    });

    const result = finalArray;
    this.setState(
      {
        finalApiData: [...result],
        allSwitchStatus: true,
      },
      () => this.updateCorrectStatusForAllSec(value),
    );
  };

  updateCorrectStatusForAllSec = value => {
    const {
      apiDeliveryDate,
      apiArrivalDate,
      pageInvoiceNumber,
      pageDeliveryNoteReference,
      pageAmbientTemp,
      pageChilledTemp,
      pageFrozenTemp,
      pageNotes,
      pageData,
      finalApiData,
      productId,
    } = this.state;
    let payload = {
      ambientTemp: pageAmbientTemp,
      chilledTemp: pageChilledTemp,
      deliveredDate: apiArrivalDate,
      deliveryDate: apiDeliveryDate,
      deliveryNoteReference: pageDeliveryNoteReference,
      frozenTemp: pageFrozenTemp,
      id: productId,
      invoiceNumber: pageInvoiceNumber,
      isAuditComplete: pageData.isAuditComplete,
      notes: pageNotes,
      orderDate: pageData.orderDate,
      orderItems: finalApiData,
      orderReference: pageData.orderReference,
      placedBy: pageData.placedByNAme,
    };
    const finalValue =
      value && value.choiceCode === 'Y'
        ? 'Y'
        : value && value.choiceCode === 'N'
        ? 'N'
        : null;
    if (apiArrivalDate) {
      processPendingOrderApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
              arrivalDataStatus: true,
              allSwitchStatus: false,
              initialValueAllCorrect: finalValue,
              pageOrderItems: [],
            },
            () => this.navigateToOrderScreen(value),
            // Alert.alert(`Grainz`, 'Order processed successfully', [
            //   {
            //     text: 'Okay',
            //     onPress: () => this.navigateToOrderScreen(value),
            //   },
            // ]),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: 'Okay',
                onPress: () => this.props.navigation.goBack(),
              },
            ],
          );
        });
    } else {
      Alert.alert(`Grainz`, 'Kildly fill arrived date first', [
        {
          text: 'Okay',
          onPress: () => this.closeLoader(),
        },
      ]);
    }
  };

  showEditModal = (item, index) => {
    console.log('ITEM', item);
    this.setState(
      {
        modalData: item,
        modalVisibleEditElement: true,
        modalOrderedInventoryVolume: item.grainzVolume,
        modalQuantityOrdered: item.quantityOrdered,
        modalQuantityDelivered: item.quantityDelivered,
        modalUserQuantityDelivered: item.userQuantityDelivered,
        modalQuantityInvoiced: item.quantityInvoiced,
        modalUserQuantityInvoiced: item.userQuantityInvoiced,
        modalPricePaid: item.orderValue.toFixed(2),
        modalNotes: item.notes,
        finalArrivalDateSpecific:
          item.arrivedDate && moment(item.arrivedDate).format('DD-MM-YYYY'),
        apiArrivalDateSpecific: moment.utc(item.arrivedDate).format(),
        volume: item.inventoryMapping
          ? item.inventoryMapping.volume
          : item.grainzVolume,

        packSize: item.inventoryMapping
          ? item.inventoryMapping.packSize
          : item.packSize,
        unitPrizeModal: item.unitPrice,
        inventoryName: item.inventoryName,
        productName: item.productName,
        productCode: item.productCode,
        flagStatus: item.isFlagged,
        orderValueExpected: item.orderValueExpected,
        priceExpected: item.priceExpected,
        priceActual: item.priceActual,
        finalUnit: item.unit,
      },
      () => this.getCreditNote(item.id),
    );
  };

  getCreditNote = id => {
    const {modalPricePaid} = this.state;
    viewCreditNoteApi(id)
      .then(res => {
        const {data} = res;
        this.setState({
          creditRequested: data.requestedValue,
          creditApprovedValue: data.creditValue,
          netValue: (modalPricePaid - data.creditValue).toFixed(2),
        });
        // console.log('DATA1212121', data);
      })
      .catch(err => {
        console.warn('ERr', err.response);
      });
  };

  updateCreditNoteFun = () => {
    const {modalNotes, modalData, creditApprovedValue} = this.state;
    let payload = {};
    // console.log('creditApprovedValue', creditApprovedValue);
    // console.log('modalNotes', modalNotes);
    // console.log('modalData', modalData.id);

    updateCreditNoteApi(modalData.id, creditApprovedValue, modalNotes, payload)
      .then(res => {
        // console.log('res--> UPDATE CREDIT', res);
        // this.setState({
        //   loaderCompStatus: false,
        //   modalVisibleEditElement: false,
        // });
      })
      .catch(err => {
        Alert.alert(
          `Error - ${err.response.status}`,
          'Something went wrong-Credit',
          [
            {
              text: translate('Ok'),
              onPress: () => this.props.navigation.goBack(),
            },
          ],
        );
      });
  };

  changeCreditRequestedFun = value => {
    const {modalPricePaid} = this.state;

    const finalPrice = parseFloat(modalPricePaid) - parseFloat(value);

    this.setState({
      creditApprovedValue: value,
      netValue: finalPrice.toFixed(2),
    });
  };

  openAccordianFun = (index, item) => {
    console.log('item-->', item);
    const {listIndex} = this.state;
    if (listIndex || listIndex === 0) {
      this.setState({
        modalData: item,
        modalOrderedInventoryVolume: item.grainzVolume,
        modalQuantityOrdered: item.quantityOrdered,
        modalQuantityDelivered: item.quantityDelivered,
        modalUserQuantityDelivered: item.userQuantityDelivered,
        modalQuantityInvoiced: item.quantityInvoiced,
        modalUserQuantityInvoiced: item.userQuantityInvoiced,
        modalPricePaid: item.orderValue,
        modalNotes: item.notes,
        finalArrivalDateSpecific: moment(item.arrivedDate).format('DD-MM-YYYY'),
        listIndex: '',
      });
    } else {
      this.setState({
        modalData: item,
        modalOrderedInventoryVolume: item.grainzVolume,
        modalQuantityOrdered: item.quantityOrdered,
        modalQuantityDelivered: item.quantityDelivered,
        modalUserQuantityDelivered: item.userQuantityDelivered,
        modalQuantityInvoiced: item.quantityInvoiced,
        modalUserQuantityInvoiced: item.userQuantityInvoiced,
        modalPricePaid: item.orderValue,
        modalNotes: item.notes,
        finalArrivalDateSpecific: moment(item.arrivedDate).format('DD-MM-YYYY'),
        listIndex: index,
      });
    }
  };

  setModalVisibleFalse = () => {
    this.setState({
      modalVisibleEditElement: false,
      listIndex: '',
    });
  };

  saveFunInventoryItem = flagStatus => {
    this.setState(
      {
        listIndex: '',
      },
      () =>
        setTimeout(() => {
          this.saveFunInventoryItemSec(flagStatus);
        }, 500),
    );
  };

  saveFunInventoryItemSec = flagStatus => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () =>
        setTimeout(() => {
          this.saveFunInventoryItemThird(flagStatus);
          if (this.state.creditApprovedValue) {
            this.updateCreditNoteFun();
          }
        }, 300),
    );
  };

  saveFunInventoryItemThird = flagStatus => {
    const {
      finalArrivalDateSpecific,
      modalData,
      modalQuantityOrdered,
      modalOrderedInventoryVolume,
      modalQuantityDelivered,
      modalUserQuantityDelivered,
      modalQuantityInvoiced,
      modalUserQuantityInvoiced,
      modalPricePaid,
      modalNotes,
      totalValue,
      apiArrivalDateSpecific,
      priceActual,
    } = this.state;
    const finalPriceActual = priceActual && priceActual.split(' ')[0];
    let payload = {
      arrivedDate: apiArrivalDateSpecific,
      id: modalData.id,
      inventoryId: modalData.inventoryId,
      inventoryProductMappingId:
        modalData.inventoryMapping && modalData.inventoryMapping.id,
      isCorrect: modalData.isCorrect,
      notes: modalNotes,
      orderId: modalData.orderId,
      orderValue: modalPricePaid,
      orderedInventoryVolume: modalOrderedInventoryVolume,
      pricePaid: finalPriceActual,
      quantityDelivered: Number(modalQuantityDelivered),
      quantityInvoiced: Number(modalQuantityInvoiced),
      quantityOrdered: modalQuantityOrdered,
      userQuantityDelivered: Number(modalUserQuantityDelivered),
      userQuantityInvoiced: Number(modalUserQuantityInvoiced),
      isFlagged: flagStatus,
    };
    console.log('payload->Saveinvventory', payload);
    processPendingOrderItemApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
            modalVisibleEditElement: false,
          },
          () => this.getOrderFun(),
        );
      })
      .catch(err => {
        console.log('errr', err.response);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            // onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  addNewOrderLineFun = () => {
    const {supplierId, supplierName, basketId, productId, listId} = this.state;
    this.props.navigation.navigate('AddNewOrderLineScreen', {
      supplierValue: supplierId,
      basketId: basketId,
      supplierName: supplierName,
      productId: productId,
      listId: listId,
    });
  };

  flagFunction = () => {
    const {flagStatus} = this.state;
    console.log('fla', flagStatus);
    this.setState(
      {
        flagStatus: !flagStatus,
      },
      () => this.flagFunctionSec(),
    );
  };

  flagFunctionSec = () => {
    const {modalData, flagStatus} = this.state;
    let payload = {};
    flagApi(payload, modalData.id, flagStatus)
      .then(res => {
        console.log('res-FLAGGG', res);
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.getOrderFun(),
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

  checkSingleItemFun = (item, value, index) => {
    this.setState(
      {
        switchSingleValue: value,
      },
      () => this.updateCorrectStatus(item, value),
    );
  };

  checkAllItemFun = value => {
    this.setState(
      {
        switchValueAll: value,
      },
      () => this.editStatusFun(value),
    );
  };

  editStatusFun = value => {
    const {pageOrderItems} = this.state;

    const finalValue = value;
    const index = 0;

    let newArr = pageOrderItems.map((item, i) =>
      index === i
        ? {
            ...item,
            ['isCorrect']: finalValue,
          }
        : {
            ...item,
            ['isCorrect']: finalValue,
          },
    );
    this.setState(
      {
        pageOrderItems: [...newArr],
        finalApiData: [...newArr],
      },
      () => this.processOrderFun(),
    );
  };

  flagFunctionChecklist = item => {
    let payload = {};
    const flagStatus = !item.isFlagged;

    flagApi(payload, item.id, flagStatus)
      .then(res => {
        console.log('res-FLAGGG', res);
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.getOrderFun(),
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

  editChecklistFun = (index, type, value, data, valueType) => {
    const {pageOrderItems} = this.state;

    console.log('data', data);

    const finalValue = value;
    const volume = data.inventoryMapping && data.inventoryMapping.volume;
    const modalQuantityOrdered = data.quantityOrdered;
    const finalValueSec = value * volume;

    const finalValueThird =
      (value / Number(volume * modalQuantityOrdered)) * modalQuantityOrdered;

    console.log('finalValue', finalValue);

    if (valueType === 'DeliveredNo') {
      let newArr = pageOrderItems.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: finalValue,
              ['userQuantityDelivered']: finalValueSec,
              ['action']: 'Update',
            }
          : item,
      );
      this.setState({
        pageOrderItems: [...newArr],
        finalApiData: [...newArr],
      });
    } else if (valueType === 'InvoicedQty') {
      let newArr = pageOrderItems.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: finalValue,
              ['action']: 'Update',
            }
          : item,
      );

      this.setState({
        pageOrderItems: [...newArr],
        finalApiData: [...newArr],
      });
    } else if (valueType === 'DeliveredQty') {
      let newArr = pageOrderItems.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: finalValue,
              ['quantityDelivered']: finalValueThird,
              ['action']: 'Update',
            }
          : item,
      );
      this.setState({
        pageOrderItems: [...newArr],
        finalApiData: [...newArr],
      });
    } else if (valueType === 'Qty') {
      let newArr = pageOrderItems.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: finalValue,
              ['action']: 'Update',
            }
          : item,
      );
      this.setState({
        pageOrderItems: [...newArr],
        finalApiData: [...newArr],
      });
    }
  };

  processOrderFun = () => {
    console.log('5');
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.hitProcessOrderApi(),
    );
  };

  hitProcessOrderApi = () => {
    const {
      apiDeliveryDate,
      apiArrivalDate,
      pageInvoiceNumber,
      pageDeliveryNoteReference,
      pageAmbientTemp,
      pageChilledTemp,
      pageFrozenTemp,
      pageNotes,
      pageData,
      finalApiData,
      productId,
      isCheckedStatus,
      switchValueAll,
      isAuditStatus,
    } = this.state;
    let payload = {
      ambientTemp: pageAmbientTemp,
      chilledTemp: pageChilledTemp,
      deliveredDate: apiArrivalDate,
      deliveryDate: apiDeliveryDate,
      deliveryNoteReference: pageDeliveryNoteReference,
      frozenTemp: pageFrozenTemp,
      id: productId,
      invoiceNumber: pageInvoiceNumber,
      isAuditComplete: isAuditStatus,
      notes: pageNotes,
      orderDate: pageData.orderDate,
      orderItems: finalApiData,
      orderReference: pageData.orderReference,
      placedBy: pageData.placedByNAme,
      isChecked: switchValueAll,
    };

    console.log('PAYLOAD----->PRO', payload);

    processPendingOrderApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
            // checklistModalStatus: false,
          },
          () => this.navigateBackFun(),
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

  navigateBackFun = () => {
    const {switchValueAll, isAuditStatus} = this.state;
    // if (switchValueAll && isAuditStatus) {
    this.props.navigation.goBack();
    // }
  };

  requestCredtiNoteFun = () => {
    const {modalData, emailDetails} = this.state;
    this.setState(
      {
        modalVisibleEditElement: false,
      },
      () =>
        setTimeout(() => {
          this.props.navigation.navigate('RequestCreditNoteScreen', {
            modalData,
            emailDetails,
          });
        }, 200),
    );
  };

  arrangeListFun = funType => {
    console.log('funType', funType);
    if (funType === 'Code') {
      this.setState(
        {
          arrangeStatusCode: Number(1) + this.state.arrangeStatusCode,
        },
        () => this.arrangeListFunSec('Code'),
      );
    } else if (funType === 'Name') {
      this.setState(
        {
          arrangeStatusName: Number(1) + this.state.arrangeStatusName,
        },
        () => this.arrangeListFunSec('Name'),
      );
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusCode, arrangeStatusName} = this.state;
    const finalData =
      type === 'Code'
        ? arrangeStatusCode
        : type === 'Name'
        ? arrangeStatusName
        : null;
    if (finalData % 2 == 0) {
      console.log('FINAL DATA', finalData);
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusCode, arrangeStatusName} = this.state;
    const finalData =
      type === 'Code'
        ? arrangeStatusCode
        : type === 'Name'
        ? arrangeStatusName
        : null;
    if (finalData % 2 == 0) {
      console.log('FINAL DATA', finalData);
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  descendingOrderFun = type => {
    const {pageOrderItems} = this.state;

    if (type === 'Code') {
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
      const finalKeyValue = type === 'Code' ? 'code' : null;

      const finalData = pageOrderItems.sort(dynamicSort(finalKeyValue));

      this.setState({
        deliveryPendingData: finalData,
      });
    } else {
      function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a, b) {
          var result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
          return result * sortOrder;
        };
      }
      const finalKeyValue = type === 'Name' ? 'inventoryName' : null;
      const finalData = pageOrderItems.sort(dynamicSort(finalKeyValue));

      this.setState({
        pageOrderItems: finalData,
      });
    }
  };

  reverseFun = () => {
    const {pageOrderItems} = this.state;
    const finalData = pageOrderItems.reverse();

    this.setState({
      pageOrderItems: finalData,
    });
  };

  render() {
    const {
      buttonsSubHeader,
      loader,
      managerName,
      pageData,
      isDatePickerVisibleDeliveryDate,
      finalDeliveryDate,
      isDatePickerVisibleArrivalDate,
      finalArrivalDate,
      pageInvoiceNumber,
      pageDeliveryNoteReference,
      pageAmbientTemp,
      pageChilledTemp,
      pageFrozenTemp,
      pageNotes,
      pageOrderItems,
      loaderCompStatus,
      choicesProp,
      allSwitchStatus,
      initialValueAllCorrect,
      modalVisibleEditElement,
      modalOrderedInventoryVolume,
      modalQuantityOrdered,
      modalQuantityDelivered,
      modalUserQuantityDelivered,
      modalQuantityInvoiced,
      modalUserQuantityInvoiced,
      modalPricePaid,
      modalNotes,
      isDatePickerArrivalDateSpecific,
      finalArrivalDateSpecific,
      modalData,
      isAuditStatus,
      totalValue,
      isCheckedEditableStatus,
      showMoreStatus,
      listIndex,
      finalData,
      isDatePickerVisibleArrived,
      productionDateArrived,
      checklistModalStatus,
      checklistNotes,
      inventoryName,
      productName,
      productCode,
      notArrivedStatus,
      flagStatus,
      packSize,
      volume,
      unitPrizeModal,
      switchSingleValue,
      switchValueAll,
      priceExpected,
      priceActual,
      orderValueExpected,
      isFreemium,
      finalUnit,
      creditRequested,
      creditApprovedValue,
      netValue,
    } = this.state;

    console.log('pageData', pageData);
    console.log('isFreemium-->', typeof isFreemium);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="small" color="#98C13E" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}
        <LoaderComp loaderComp={loaderCompStatus} />
        <View style={{...styles.subContainer, flex: 1}}>
          <TouchableOpacity
            style={styles.firstContainer}
            onPress={() => this.props.navigation.goBack()}>
            <View style={styles.goBackContainer}>
              <Image source={img.backIcon} style={styles.tileImageBack} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.adminTextStyle}>{translate('Review')}</Text>
            </View>
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <ScrollView style={{}} showsVerticalScrollIndicator={false}>
              <View style={{marginHorizontal: hp('3%')}}>
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
                          {translate('Order No')}.
                        </Text>
                      </View>
                      <View
                        style={{
                          marginTop: 10,
                        }}>
                        <TextInput
                          value={finalData.orderReference}
                          editable={false}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: 'black',
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate(
                            'ReviewOrderDeliveryScreen',
                            {finalData: finalData, pageOrderItems},
                          )
                        }
                        style={{
                          marginTop: 15,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#66A4C8',
                          }}>
                          {translate('See details')}
                        </Text>
                      </TouchableOpacity>
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
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 10,
                        }}>
                        <TextInput
                          value={moment(finalData.deliveryDate).format(
                            'DD/MM/YYYY',
                          )}
                          editable={false}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: 'black',
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={{
                          marginTop: 15,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#66A4C8',
                          }}></Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      checklistModalStatus: true,
                    })
                  }
                  style={{
                    height: hp('7%'),
                    width: wp('87%'),
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
                      source={img.checkIcon}
                      style={{
                        height: 15,
                        width: 15,
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
                      {translate('Checklist')}
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* <View style={{}}>
                  <View
                    style={{
                      marginBottom: hp('3%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          marginLeft: 5,
                        }}>
                        Delivery Date :
                      </Text>
                    </View>
                    <View style={{flex: 2}}>
                      <TouchableOpacity
                        onPress={() => this.showDatePickerDeliveryDate()}
                        style={{
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
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      marginBottom: hp('3%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          marginLeft: 5,
                        }}>
                        Arrived Date :
                      </Text>
                    </View>
                    <View style={{flex: 2}}>
                      <TouchableOpacity
                        onPress={() => this.showDatePickerArrivalDate()}
                        style={{
                          padding: Platform.OS === 'ios' ? 15 : 5,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          backgroundColor: '#fff',
                          borderRadius: 5,
                        }}>
                        <TextInput
                          placeholder="Arrived Date"
                          value={finalArrivalDate}
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
                        isVisible={isDatePickerVisibleArrivalDate}
                        mode={'date'}
                        onConfirm={this.handleConfirmArrivalDate}
                        onCancel={this.hideDatePickerArrivalDate}
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
                      flex: 1,
                      marginBottom: hp('2%'),
                      alignItems: 'center',
                      backgroundColor: '#EFFBCF',
                      justifyContent: 'center',
                      paddingVertical: 10,
                    }}>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                        }}>
                        {showMoreStatus ? 'Show Less' : 'Show More'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showMoreStatus ? (
                    <View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Supplier :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            editable={false}
                            placeholder="Supplier"
                            value={pageData.supplierName}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#E9ECEF',
                              borderWidth: 0.2,
                            }}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Order Date :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            editable={false}
                            placeholder="Order Date"
                            value={
                              pageData.orderDate &&
                              moment(pageData.orderDate).format('DD-MM-YYYY')
                            }
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#E9ECEF',
                              borderWidth: 0.2,
                            }}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Order reference :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Order reference"
                            value={pageData.orderReference}
                            editable={false}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#E9ECEF',
                              borderWidth: 0.2,
                            }}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Invoice number :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Invoice number"
                            value={pageInvoiceNumber}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.setState({
                                pageInvoiceNumber: value,
                              })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Delivery note reference :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Delivery note reference"
                            value={pageDeliveryNoteReference}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.setState({
                                pageDeliveryNoteReference: value,
                              })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Ambient Temperature :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Ambient Temperature"
                            value={pageAmbientTemp && String(pageAmbientTemp)}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.setState({
                                pageAmbientTemp: value,
                              })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Chilled Temperature :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Chilled Temperature"
                            value={pageChilledTemp && String(pageChilledTemp)}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.setState({
                                pageChilledTemp: value,
                              })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Frozen Temperature :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Frozen Temperature"
                            value={pageFrozenTemp && String(pageFrozenTemp)}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.setState({
                                pageFrozenTemp: value,
                              })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Notes :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Notes"
                            value={pageNotes}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.setState({
                                pageNotes: value,
                              })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          marginBottom: hp('3%'),
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              marginLeft: 5,
                            }}>
                            Placed by :
                          </Text>
                        </View>
                        <View style={{flex: 2}}>
                          <TextInput
                            placeholder="Placed by"
                            value={pageData.placedByNAme}
                            editable={false}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              elevation: 3,
                              shadowOpacity: 2.0,
                              shadowColor: 'rgba(0, 0, 0, 0.05)',
                              shadowOffset: {
                                width: 2,
                                height: 2,
                              },
                              shadowRadius: 10,
                              borderRadius: 5,
                              backgroundColor: '#E9ECEF',
                              borderWidth: 0.2,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View> */}

                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      flex: 1,
                      // backgroundColor: '#C9C9C9',
                      backgroundColor: '#fff',
                      paddingVertical: hp('2%'),
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5,
                      paddingHorizontal: wp('3%'),
                      // borderWidth: 0.2,
                      // borderColor: 'grey',
                      marginTop: hp('2%'),
                    }}>
                    {/* <TouchableOpacity
                        onPress={() => this.arrangeListFun('Code')}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 14,
                          }}>
                          {translate('Code')}
                        </Text>
                        <View>
                          <Image
                            style={{
                              width: 15,
                              height: 15,
                              resizeMode: 'contain',
                            }}
                            source={img.doubleArrowIconNew}
                          />
                        </View>
                      </TouchableOpacity> */}
                    <TouchableOpacity
                      onPress={() => this.arrangeListFun('Name')}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      <Text
                        style={{
                          color: '#161C27',
                          fontFamily: 'Inter-SemiBold',
                          fontSize: 14,
                        }}>
                        {translate('Name')}
                      </Text>
                      <View>
                        <Image
                          style={{
                            width: 15,
                            height: 15,
                            resizeMode: 'contain',
                            marginLeft: 5,
                          }}
                          source={img.doubleArrowIconNew}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  {/* <View
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: '#EFFBCF',
                        marginTop: hp('3%'),
                        borderRadius: 6,
                      }}>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'flex-start',
                        }}>
                        {allSwitchStatus ? (
                          <ActivityIndicator size="small" color="grey" />
                        ) : (
                          <TriStateToggleSwitch
                            initialValue={initialValueAllCorrect}
                            width={80}
                            height={30}
                            selectedNoneBgColor={'#999999'}
                            selectedLeftBgColor={'#75CF41'}
                            selectedRightBgColor={'#D72E30'}
                            fontColor={'#fff'}
                            fontSize={12}
                            circleBgColor={'white'}
                            choices={choicesProp}
                            onChange={value =>
                              this.updateCorrectStatusForAll(value)
                            }
                          />
                        )}
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          justifyContent: 'center',
                          marginLeft: wp('1%'),
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 12,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Inventory item
                        </Text>
                      </View>
                    
                      <View
                        style={{
                          width: wp('30%'),
                          marginLeft: wp('5%'),
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 12,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {translate('Quantity')}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('25%'),
                          marginLeft: wp('5%'),
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 12,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          € HTVA
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('12%'),
                          justifyContent: 'center',
                          marginLeft: wp('5%'),
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 12,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Action
                        </Text>
                      </View>
                    </View> */}
                  <View>
                    {pageData && pageOrderItems.length > 0 ? (
                      pageOrderItems.map((item, index) => {
                        console.log('item->REVIEW-MAIN', item);
                        return (
                          <View key={index}>
                            {/* <View
                              style={{
                                position: 'absolute',
                                flexDirection: 'row',
                                borderRadius: 5,
                                bottom: '84%',
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
                                      item.inventoryMapping.departmentName ===
                                        'Other'
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
                                    item.inventoryMapping.departmentName ===
                                      'Bar'
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

                            <View style={{marginTop: hp('3%')}}>
                              <View
                                style={{
                                  borderTopLeftRadius: 6,
                                  borderTopRightRadius: 6,
                                  padding: 10,
                                  flex: 1,
                                  backgroundColor: '#fff',
                                  borderBottomWidth: 0.5,
                                  borderBottomColor: 'grey',
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      this.showEditModal(item, index)
                                    }
                                    style={{
                                      flex: 3,
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                      }}>
                                      {item.inventoryMapping &&
                                        item.inventoryMapping.inventoryName}
                                    </Text>
                                    {item.isFlagged === true ? (
                                      <View
                                        style={{
                                          // position: 'absolute',
                                          borderRadius: 5,
                                          // bottom: '80%',
                                          // left: '15%',
                                          // zIndex: 10,
                                          padding: 5,
                                        }}>
                                        <View>
                                          <Image
                                            style={{
                                              width: 20,
                                              height: 20,
                                              resizeMode: 'contain',
                                              marginLeft: 5,
                                            }}
                                            source={img.flagIcon}
                                          />
                                        </View>
                                      </View>
                                    ) : null}
                                    {item.hasCreditNote > 0 ? (
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.showEditModal(item, index)
                                        }
                                        style={{}}>
                                        <Image
                                          source={img.envolopeIcon}
                                          style={{
                                            width: 18,
                                            height: 18,
                                            resizeMode: 'contain',
                                            tintColor: 'black',
                                            marginLeft: 5,
                                          }}
                                        />
                                      </TouchableOpacity>
                                    ) : null}

                                    {item.notes ? (
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.showEditModal(item, index)
                                        }
                                        style={{}}>
                                        <Image
                                          source={img.messageIcon}
                                          style={{
                                            width: 18,
                                            height: 18,
                                            resizeMode: 'contain',
                                            tintColor: 'black',
                                            marginLeft: 7,
                                          }}
                                        />
                                      </TouchableOpacity>
                                    ) : null}
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    onPress={() => this.deleteFun(item, index)}
                                    style={{
                                      flex: 1,
                                      alignItems: 'flex-end',
                                      padding: 10,
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
                                    marginTop: 8,
                                  }}>
                                  {isFreemium === 'false' ? (
                                    <View
                                      style={{
                                        flex: 1,
                                      }}>
                                      <Text style={{}}>
                                        {item.inventoryMapping &&
                                          item.inventoryMapping
                                            .productName}{' '}
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                              </View>

                              <View
                                style={{
                                  flex: 1,
                                  flexDirection: 'row',
                                  padding: 10,
                                  backgroundColor: '#fff',
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                  }}>
                                  <Text style={{fontSize: 10}}>
                                    {translate('Delivered No')}
                                  </Text>
                                  <Text
                                    style={{
                                      marginTop: 10,
                                      fontSize: 14,
                                      fontWeight: 'bold',
                                    }}>
                                    {item.displayQuantity.split('=')[0]}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                  }}>
                                  <Text style={{fontSize: 10}}>
                                    {translate('Order Val')}
                                  </Text>
                                  <Text
                                    style={{
                                      marginTop: 10,
                                      fontSize: 14,
                                      fontWeight: 'bold',
                                    }}>
                                    {/* {item.value.toFixed(2)} */}
                                    {item.orderValue.toFixed(2)} €
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      marginRight: 10,
                                    }}>
                                    {translate('Correct')}
                                  </Text>
                                  <Switch
                                    thumbColor={'#fff'}
                                    trackColor={{
                                      false: 'grey',
                                      true: '#5197C1',
                                    }}
                                    ios_backgroundColor="white"
                                    onValueChange={value =>
                                      this.checkSingleItemFun(
                                        item,
                                        value,
                                        index,
                                      )
                                    }
                                    value={item.isCorrect}
                                  />
                                </View>

                                {/* <View
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
                                      item.inventoryMapping.productPrice}{' '}
                                    Є/
                                    {item.inventoryMapping.productUnit}
                                  </Text>
                                </View> */}
                              </View>
                              {/* <View
                                style={{
                                  flex: 1,
                                  flexDirection: 'row',
                                  borderBottomLeftRadius: 6,
                                  borderBottomRightRadius: 6,
                                  padding: 10,
                                  backgroundColor: '#fff',
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                  }}>
                                  <Text style={{fontSize: 10}}>
                                    Arrived Date
                                  </Text>
                                  <Text
                                    style={{
                                      marginTop: 10,
                                      fontSize: 14,
                                      fontWeight: 'bold',
                                    }}>
                                    {item.deliveredDate
                                      ? moment(item.deliveredDate).format(
                                          'DD/MM/YYYY',
                                        )
                                      : ''}
                                  </Text>
                                </View>
                                
                              </View> */}
                            </View>
                            {/* <View
                              style={{
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                flexDirection: 'row',
                                backgroundColor: '#fff',
                              }}>
                              <View
                                style={{
                                  width: wp('30%'),
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                }}>
                                <TriStateToggleSwitch
                                  initialValue={
                                    item.isCorrect === false
                                      ? 'N'
                                      : item.isCorrect === true
                                      ? 'Y'
                                      : 'Null'
                                  }
                                  width={80}
                                  height={30}
                                  selectedNoneBgColor={'#999999'}
                                  selectedLeftBgColor={'#75CF41'}
                                  selectedRightBgColor={'#D72E30'}
                                  fontColor={'#fff'}
                                  fontSize={12}
                                  circleBgColor={'white'}
                                  choices={choicesProp}
                                  onChange={value =>
                                    this.updateCorrectStatus(item, value)
                                  }
                                />
                              </View>

                              <TouchableOpacity
                                onPress={() =>
                                  this.openAccordianFun(index, item)
                                }
                                // onPress={() =>
                                //   this.showEditModal(item, index)
                                // }
                                style={{
                                  width: wp('30%'),
                                  marginLeft: wp('1%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontSize: 12,
                                    fontFamily: 'Inter-SemiBold',
                                    marginBottom: 8,
                                  }}>
                                  {item.inventoryMapping &&
                                    item.inventoryMapping.inventoryName}
                                </Text>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {item.productName}
                                </Text>
                              </TouchableOpacity>
                              
                              <View
                                style={{
                                  width: wp('30%'),
                                  marginLeft: wp('5%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontSize: 12,
                                    fontFamily: 'Inter-SemiBold',
                                    marginBottom: 8,
                                  }}>
                                  {item.grainzVolume} {item.grainzUnit}
                                </Text>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {item.displayQuantity}
                                </Text>
                                <Text
                                  style={{
                                    color: 'red',
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                    marginTop: 8,
                                  }}>
                                  {item.displayWarningQuantity
                                    ? item.displayWarningQuantity
                                    : null}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('25%'),
                                  marginLeft: wp('5%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  € {Number(item.orderValue).toFixed(2)}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => this.deleteFun(item)}
                                style={{
                                  width: wp('12%'),
                                  alignItems: 'center',
                                }}>
                                <View
                                  style={{
                                    backgroundColor: 'red',
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    borderRadius: 5,
                                    marginLeft: 20,
                                  }}>
                                  <Image
                                    source={img.deleteIconNew}
                                    style={{
                                      width: 18,
                                      height: 18,
                                      tintColor: '#fff',
                                      resizeMode: 'contain',
                                    }}
                                  />
                                </View>
                              </TouchableOpacity>
                            </View> */}
                            {index === listIndex ? (
                              <View
                                style={{
                                  backgroundColor: '#F0F4FF',
                                }}>
                                <View style={{backgroundColor: '#EFFBCF'}}>
                                  <View>
                                    <View
                                      style={{
                                        paddingVertical: 15,
                                        paddingHorizontal: 5,
                                        flexDirection: 'row',
                                        backgroundColor: '#EFFBCF',
                                        borderRadius: 6,
                                      }}>
                                      <View
                                        style={{
                                          width: wp('20%'),
                                          alignItems: 'center',
                                        }}></View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            color: '#161C27',
                                            fontSize: 12,
                                            fontFamily: 'Inter-SemiBold',
                                          }}>
                                          #
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            color: '#161C27',
                                            fontSize: 12,
                                            fontFamily: 'Inter-SemiBold',
                                            textAlign: 'center',
                                          }}>
                                          {translate('Inventory')} Volume
                                        </Text>
                                      </View>
                                    </View>
                                    <View>
                                      <View
                                        style={{
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                          backgroundColor: '#fff',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('20%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text
                                            style={{
                                              color: '#161C27',
                                              fontSize: 12,
                                              fontFamily: 'Inter-SemiBold',
                                            }}>
                                            {translate('Ordered')}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Ordered"
                                            keyboardType="numeric"
                                            editable={false}
                                            value={String(modalQuantityOrdered)}
                                            style={{
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 80,
                                              backgroundColor: '#E9ECEF',
                                            }}
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Volume"
                                            keyboardType="numeric"
                                            value={Number(
                                              modalOrderedInventoryVolume,
                                            ).toFixed(2)}
                                            editable={false}
                                            style={{
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 80,
                                              backgroundColor: '#E9ECEF',
                                            }}
                                          />
                                          <Text
                                            style={{
                                              fontFamily: 'Inter-Regular',
                                              marginLeft: 5,
                                            }}>
                                            {modalData && modalData.unit}
                                          </Text>
                                        </View>
                                      </View>
                                      <View
                                        style={{
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                          backgroundColor: '#fff',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('20%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text
                                            style={{
                                              color: '#161C27',
                                              fontSize: 12,
                                              fontFamily: 'Inter-SemiBold',
                                            }}>
                                            Delivered
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Delivered"
                                            editable={
                                              item.canChangeDeliveredQuantity ===
                                              true
                                                ? true
                                                : false
                                            }
                                            keyboardType="numeric"
                                            style={{
                                              borderWidth: 0.5,
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 80,
                                              backgroundColor:
                                                item.canChangeDeliveredQuantity ===
                                                true
                                                  ? '#fff'
                                                  : '#E9ECEF',
                                            }}
                                            value={
                                              modalQuantityDelivered &&
                                              String(modalQuantityDelivered)
                                            }
                                            onChangeText={value =>
                                              this.setState({
                                                modalQuantityDelivered: value,
                                                modalUserQuantityDelivered:
                                                  value *
                                                  modalOrderedInventoryVolume,
                                              })
                                            }
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Volume"
                                            keyboardType="numeric"
                                            editable={
                                              item.canChangeDeliveredQuantity ===
                                              true
                                                ? true
                                                : false
                                            }
                                            value={
                                              modalUserQuantityDelivered &&
                                              String(modalUserQuantityDelivered)
                                            }
                                            style={{
                                              borderWidth: 0.5,
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 80,
                                              backgroundColor:
                                                item.canChangeDeliveredQuantity ===
                                                true
                                                  ? '#fff'
                                                  : '#E9ECEF',
                                            }}
                                            onChangeText={value =>
                                              this.setState({
                                                modalUserQuantityDelivered:
                                                  value,
                                              })
                                            }
                                          />
                                          <Text
                                            style={{
                                              fontFamily: 'Inter-Regular',
                                              marginLeft: 5,
                                            }}>
                                            {modalData && modalData.unit}
                                          </Text>
                                        </View>
                                      </View>
                                      <View
                                        style={{
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                          backgroundColor: '#fff',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('20%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text
                                            style={{
                                              color: '#161C27',
                                              fontSize: 12,
                                              fontFamily: 'Inter-SemiBold',
                                              marginBottom: 8,
                                            }}>
                                            {translate('Invoiced')}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Invoiced"
                                            editable={
                                              item.canChangeInvoiceQuantity ===
                                              true
                                                ? true
                                                : false
                                            }
                                            keyboardType="numeric"
                                            style={{
                                              borderWidth: 0.5,
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 80,
                                              backgroundColor:
                                                item.canChangeInvoiceQuantity ===
                                                true
                                                  ? '#fff'
                                                  : '#E9ECEF',
                                            }}
                                            value={
                                              modalQuantityInvoiced &&
                                              String(modalQuantityInvoiced)
                                            }
                                            onChangeText={value =>
                                              this.setState({
                                                modalQuantityInvoiced: value,
                                                modalUserQuantityInvoiced:
                                                  value *
                                                  modalOrderedInventoryVolume,
                                              })
                                            }
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Volume"
                                            keyboardType="numeric"
                                            editable={
                                              item.canChangeInvoiceQuantity ===
                                              true
                                                ? true
                                                : false
                                            }
                                            style={{
                                              borderWidth: 0.5,
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 80,
                                              backgroundColor:
                                                item.canChangeInvoiceQuantity ===
                                                true
                                                  ? '#fff'
                                                  : '#E9ECEF',
                                            }}
                                            value={
                                              modalUserQuantityInvoiced &&
                                              String(modalUserQuantityInvoiced)
                                            }
                                            onChangeText={value =>
                                              this.setState({
                                                modalUserQuantityInvoiced:
                                                  value,
                                              })
                                            }
                                          />
                                          <Text
                                            style={{
                                              fontFamily: 'Inter-Regular',
                                              marginLeft: 5,
                                            }}>
                                            {modalData && modalData.unit}
                                          </Text>
                                        </View>
                                      </View>
                                      <View
                                        style={{
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                          backgroundColor: '#fff',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('20%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text
                                            style={{
                                              color: '#161C27',
                                              fontSize: 12,
                                              fontFamily: 'Inter-SemiBold',
                                            }}>
                                            {translate('Price')}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <TextInput
                                            placeholder="Price"
                                            keyboardType="numeric"
                                            editable={
                                              item.canChangeInvoiceQuantity ===
                                                true &&
                                              item.canChangeDeliveredQuantity ===
                                                true
                                                ? true
                                                : false
                                            }
                                            style={{
                                              borderWidth: 0.5,
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 100,
                                              backgroundColor:
                                                item.canChangeInvoiceQuantity ===
                                                  true &&
                                                item.canChangeDeliveredQuantity
                                                  ? '#fff'
                                                  : '#E9ECEF',
                                            }}
                                            value={
                                              modalPricePaid &&
                                              String(modalPricePaid)
                                            }
                                            onChangeText={value =>
                                              this.setState({
                                                modalPricePaid: value,
                                              })
                                            }
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}></View>
                                      </View>
                                      <View
                                        style={{
                                          paddingVertical: 8,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('20%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text
                                            style={{
                                              color: '#161C27',
                                              fontSize: 12,
                                              fontFamily: 'Inter-SemiBold',
                                            }}>
                                            Arrived Date
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <View
                                            style={{
                                              marginBottom: hp('3%'),
                                            }}>
                                            <View
                                              style={{
                                                marginTop: 12,
                                              }}>
                                              <TouchableOpacity
                                                onPress={() =>
                                                  this.showDatePickerArrivalDateSpecific()
                                                }
                                                style={{
                                                  width: 120,
                                                  flexDirection: 'row',
                                                  justifyContent:
                                                    'space-between',
                                                  backgroundColor: '#E9ECEF',
                                                  borderRadius: 5,
                                                  padding: 10,
                                                  marginTop: 5,
                                                }}>
                                                <Text>
                                                  {finalArrivalDateSpecific}
                                                </Text>
                                                <Image
                                                  source={img.calenderIcon}
                                                  style={{
                                                    width: 15,
                                                    height: 15,
                                                    resizeMode: 'contain',
                                                    marginTop: 15,
                                                    marginRight: 15,
                                                  }}
                                                />
                                              </TouchableOpacity>
                                              <DateTimePickerModal
                                                isVisible={
                                                  isDatePickerArrivalDateSpecific
                                                }
                                                mode={'date'}
                                                onConfirm={
                                                  this
                                                    .handleConfirmArrivalDateSpecific
                                                }
                                                onCancel={
                                                  this
                                                    .hideDatePickerArrivalDateSpecific
                                                }
                                              />
                                            </View>
                                          </View>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}></View>
                                      </View>
                                      <View
                                        style={{
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                          backgroundColor: '#fff',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('20%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text
                                            style={{
                                              color: '#161C27',
                                              fontSize: 12,
                                              fontFamily: 'Inter-SemiBold',
                                            }}>
                                            Notes
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            marginLeft: wp('5%'),
                                          }}>
                                          <TextInput
                                            placeholder="Notes"
                                            multiline
                                            style={{
                                              borderWidth: 0.5,
                                              borderRadius: 5,
                                              padding: 8,
                                              width: 150,
                                              height: 100,
                                            }}
                                            value={
                                              modalNotes && String(modalNotes)
                                            }
                                            onChangeText={value =>
                                              this.setState({
                                                modalNotes: value,
                                              })
                                            }
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}></View>
                                      </View>
                                    </View>
                                  </View>
                                  <View>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 15,
                                      }}>
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.saveFunInventoryItem()
                                        }
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
                                          {translate('Save')}
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.setModalVisibleFalse()
                                        }
                                        style={{
                                          width: wp('30%'),
                                          height: hp('5%'),
                                          alignSelf: 'flex-end',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          marginLeft: wp('2%'),
                                          borderRadius: 100,
                                          borderWidth: 1,
                                          borderColor: '#482813',
                                        }}>
                                        <Text
                                          style={{
                                            color: '#482813',
                                            fontSize: 15,
                                            fontWeight: 'bold',
                                          }}>
                                          {translate('Close')}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            ) : null}
                          </View>
                        );
                      })
                    ) : (
                      <ActivityIndicator size="small" color="grey" />
                    )}
                  </View>
                </View>

                {/* <View>
                  <View
                    style={{
                      justifyContent: 'center',
                      marginTop: hp('2%'),
                      alignItems: 'center',
                      marginTop: '5%',
                      marginBottom: '5%',
                      borderBottomWidth: 1,
                      paddingBottom: 20,
                      borderBottomColor: '#DCDCDC',
                    }}>
                    <TouchableOpacity
                      onPress={() => this.addNewOrderLineFun()}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: wp('90%'),
                      }}>
                      <View>
                        <Text
                          style={{
                            color: '#5197C1',
                            fontSize: 15,
                            fontWeight: 'bold',
                          }}>
                          {translate('Add order item')}
                        </Text>
                      </View>

                      <View>
                        <Image
                          source={img.arrowDownIcon}
                          style={{
                            width: 15,
                            height: 15,
                            resizeMode: 'contain',
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View> */}

                <View>
                  <View
                    style={{
                      justifyContent: 'center',
                      marginTop: hp('2%'),
                      alignItems: 'center',
                      marginTop: '5%',
                      marginBottom: '5%',
                    }}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: wp('90%'),
                      }}>
                      <View>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 15,
                            fontWeight: 'bold',
                          }}>
                          {translate('Mark all as Correct')}
                        </Text>
                      </View>

                      <View>
                        <Switch
                          thumbColor={'#fff'}
                          trackColor={{
                            false: 'grey',
                            true: '#5197C1',
                          }}
                          ios_backgroundColor="white"
                          onValueChange={value => this.checkAllItemFun(value)}
                          value={switchValueAll}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View>
                  <View
                    style={{
                      justifyContent: 'center',
                      marginTop: hp('2%'),
                      alignItems: 'center',
                      marginTop: '5%',
                      marginBottom: '5%',
                      backgroundColor: '#fff',
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
                          {parseFloat(finalData.htva).toFixed(2)} €
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

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
                    <TouchableOpacity
                      disabled={switchValueAll ? false : true}
                      onPress={() =>
                        this.setState({isAuditStatus: !isAuditStatus})
                      }
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          borderRadius: 100,
                        }}>
                        <CheckBox
                          disabled={true}
                          value={isAuditStatus}
                          style={{
                            height: 20,
                            width: 20,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          marginLeft: 10,
                          textAlign: 'center',
                        }}>
                        {translate('Audit Complete')}
                        {/* (You can select when all items are checked
                        correct) */}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                {/* <TouchableOpacity
                  // onPress={() => this.sendFun()}
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
                    }}>
                    <Text
                      style={{
                        color: '#5197C1',
                        marginLeft: 10,
                        fontFamily: 'Inter-SemiBold',
                      }}>
                      {translate('Preview PDF')}
                    </Text>
                  </View>
                </TouchableOpacity> */}

                <TouchableOpacity
                  onPress={() => this.processOrderFun()}
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
              {/* <View>
                <View
                  style={{
                    justifyContent: 'center',
                    marginTop: hp('2%'),
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.addNewOrderLineFun()}
                    style={{
                      width: wp('60%'),
                      height: hp('5%'),
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
                      {translate('Add New Order Line')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View> */}
              {/* <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: hp('2%'),
                    marginBottom: hp('3%'),
                  }}>
                  <TouchableOpacity
                    onPress={() => this.saveFun()}
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
                      {translate('Save')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={{
                      width: wp('30%'),
                      height: hp('5%'),
                      alignSelf: 'flex-end',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: wp('2%'),
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: '#482813',
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
              </View> */}
            </ScrollView>

            {/* <Modal isVisible={checklistModalStatus} backdropOpacity={0.35}>
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
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          height: hp('10%'),
                          marginHorizontal: wp('6%'),
                          marginTop: hp('4%'),
                          borderBottomWidth: 0.5,
                          borderBottomColor: 'grey',
                        }}>
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              checklistModalStatus: false,
                            })
                          }
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 100,
                            padding: 5,
                            marginRight: wp('2%'),
                          }}>
                          <Image
                            source={img.backIcon}
                            style={{
                              height: 15,
                              width: 15,
                              resizeMode: 'contain',
                            }}
                          />
                        </TouchableOpacity>
                        <View
                          style={{
                            flex: 4,
                          }}>
                          <Text style={styles.textStylingLogo}>
                            {translate('Delivery checklist')}
                          </Text>
                        </View>
                      </View>
                      {pageOrderItems.map((item, index) => {
                        console.log('item----->', item);
                        return (
                          <View
                            style={{
                              marginTop: hp('3%'),
                              borderBottomWidth: 0.5,
                              borderBottomColor: 'grey',
                              paddingBottom: 15,
                              marginHorizontal: wp('3%'),
                            }}>
                            <View style={styles.insideContainer}>
                              <View>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'black',
                                  }}>
                                  {item.inventoryName}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: 'black',
                                    marginTop: 10,
                                  }}>
                                  {item.productName}
                                </Text>
                              </View>

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
                                    Ordered No.
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}>
                                    {item.quantityOrdered}
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
                                    {item.grainzVolume * item.quantityOrdered}{' '}
                                    {item.unit}
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
                                    Delivered No.
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}>
                                    {item.quantityDelivered}
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
                                    Delivered Qty.
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}>
                                    {item.userQuantityDelivered} {item.unit}
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
                                    Invoiced No.
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}>
                                    {item.quantityInvoiced}
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
                                    Invoiced Qty.
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}>
                                    {item.userQuantityInvoiced} {item.unit}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </KeyboardAwareScrollView>
                  <View style={{}}>
                    <View
                      style={{
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholder="Notes"
                        multiline
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 10,
                          width: wp('88%'),
                          height: hp('15%'),
                          marginTop: 10,
                        }}
                        value={checklistNotes}
                        onChangeText={value =>
                          this.setState({
                            checklistNotes: value,
                          })
                        }
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        checklistModalStatus: false,
                      })
                    }
                    style={{
                      height: hp('7%'),
                      width: wp('87%'),
                      backgroundColor: '#5197C1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      alignSelf: 'center',
                      marginTop: hp('3%'),
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
                        Save
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        checklistModalStatus: false,
                      })
                    }
                    style={{
                      height: hp('7%'),
                      width: wp('80%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: hp('3%'),
                      alignSelf: 'center',
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
              </View>
            </Modal> */}

            <Modal isVisible={checklistModalStatus} backdropOpacity={0.35}>
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
                            checklistModalStatus: false,
                          })
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          height: hp('10%'),
                          marginHorizontal: wp('6%'),
                          marginTop: hp('4%'),
                          borderBottomWidth: 0.5,
                          borderBottomColor: 'grey',
                        }}>
                        <View
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 100,
                            padding: 5,
                            marginRight: wp('2%'),
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
                        <View
                          style={{
                            flex: 4,
                          }}>
                          <Text style={styles.textStylingLogo}>
                            {translate('Checklist')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {pageOrderItems.map((item, index) => {
                        return (
                          <View
                            style={{
                              marginTop: hp('3%'),
                              borderBottomWidth: 0.5,
                              borderBottomColor: 'grey',
                              paddingBottom: 15,
                              marginHorizontal: wp('3%'),
                            }}>
                            <View style={styles.insideContainer}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  flex: 1,
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      fontWeight: 'bold',
                                      color: 'black',
                                    }}>
                                    {item.inventoryName}
                                  </Text>
                                  {isFreemium === 'false' ? (
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: 'black',
                                        marginTop: 10,
                                      }}>
                                      {item.productName}
                                    </Text>
                                  ) : null}
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                  }}>
                                  <View
                                    style={{
                                      flex: 1,
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                    }}>
                                    <Text
                                      style={{
                                        marginRight: 10,
                                      }}>
                                      {translate('Correct')}
                                    </Text>
                                    <Switch
                                      thumbColor={'#fff'}
                                      trackColor={{
                                        false: 'grey',
                                        true: '#5197C1',
                                      }}
                                      ios_backgroundColor="white"
                                      onValueChange={value =>
                                        this.checkSingleItemFun(
                                          item,
                                          value,
                                          index,
                                        )
                                      }
                                      value={item.isCorrect}
                                    />
                                  </View>
                                </View>
                                <View
                                  style={{
                                    flex: 0.5,
                                    alignItems: 'flex-end',
                                  }}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      this.flagFunctionChecklist(item)
                                    }
                                    style={{}}>
                                    <Image
                                      source={img.flagIcon}
                                      style={{
                                        width: 25,
                                        height: 25,
                                        resizeMode: 'contain',
                                        tintColor:
                                          item.isFlagged === false
                                            ? 'grey'
                                            : null,
                                      }}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>

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
                                      fontSize: 14,
                                    }}>
                                    {translate('_Ordered No')}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}>
                                    {item.displayQuantity.split('=')[0]}
                                    {/* {item.unit} */}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#fff',
                                    padding: 8,
                                    borderRadius: 6,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                    }}>
                                    {translate('_Delivered No')}
                                  </Text>

                                  <TextInput
                                    placeholder={translate('_Delivered No')}
                                    value={String(item.quantityDelivered)}
                                    keyboardType="number-pad"
                                    style={{
                                      width: 30,
                                      marginTop: 10,
                                      fontWeight: 'bold',
                                    }}
                                    onChangeText={value =>
                                      this.editChecklistFun(
                                        index,
                                        'quantityDelivered',
                                        value,
                                        item,
                                        'DeliveredNo',
                                      )
                                    }
                                  />
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#fff',
                                    padding: 8,
                                    borderRadius: 6,
                                    marginLeft: 10,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                    }}>
                                    {translate('_Invoiced Qty')}
                                  </Text>
                                  <TextInput
                                    placeholder={translate('_Invoiced Qty')}
                                    value={String(item.quantityInvoiced)}
                                    keyboardType="number-pad"
                                    style={{
                                      width: 30,
                                      fontWeight: 'bold',
                                      marginTop: 10,
                                    }}
                                    onChangeText={value =>
                                      this.editChecklistFun(
                                        index,
                                        'quantityInvoiced',
                                        value,
                                        item,
                                        'InvoicedQty',
                                      )
                                    }
                                  />
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </KeyboardAwareScrollView>

                  <View>
                    <View
                      style={{
                        justifyContent: 'center',
                        marginTop: hp('2%'),
                        alignItems: 'center',
                        marginTop: '5%',
                        marginBottom: '5%',
                      }}>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: wp('90%'),
                        }}>
                        <View>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 15,
                              fontWeight: 'bold',
                            }}>
                            {translate('Mark all as Correct')}
                          </Text>
                        </View>

                        <View>
                          <Switch
                            thumbColor={'#fff'}
                            trackColor={{
                              false: 'grey',
                              true: '#5197C1',
                            }}
                            ios_backgroundColor="white"
                            onValueChange={value => this.checkAllItemFun(value)}
                            value={switchValueAll}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => this.processOrderFun()}
                    style={{
                      height: hp('7%'),
                      width: wp('87%'),
                      backgroundColor: '#5197C1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      alignSelf: 'center',
                      marginTop: hp('3%'),
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
                      this.setState({
                        checklistModalStatus: false,
                      })
                    }
                    style={{
                      height: hp('7%'),
                      width: wp('80%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: hp('3%'),
                      alignSelf: 'center',
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
              </View>
            </Modal>
            <Modal isVisible={modalVisibleEditElement} backdropOpacity={0.35}>
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
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          height: hp('10%'),
                          marginHorizontal: wp('6%'),
                          marginTop: hp('4%'),
                        }}>
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              modalVisibleEditElement: false,
                            })
                          }
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 100,
                            padding: 5,
                            marginRight: wp('2%'),
                          }}>
                          <Image
                            source={img.backIcon}
                            style={{
                              height: 15,
                              width: 15,
                              resizeMode: 'contain',
                            }}
                          />
                        </TouchableOpacity>
                        <View
                          style={{
                            flex: 4,
                          }}>
                          <Text style={styles.textStylingLogo}>
                            {inventoryName}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          marginHorizontal: wp('3%'),
                        }}>
                        <View style={styles.insideContainer}>
                          {isFreemium === 'false' ? (
                            <View
                              style={{
                                padding: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: 'black',
                                  marginTop: 10,
                                }}>
                                {productName}
                              </Text>
                            </View>
                          ) : null}

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              flex: 1,
                              marginTop: hp('3%'),
                              borderBottomWidth: 0.5,
                              borderBottomColor: 'grey',
                              paddingBottom: 15,
                            }}>
                            <View
                              style={{
                                flex: 1,
                                padding: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('Product Code')}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 13,
                                  fontWeight: 'bold',
                                  marginTop: 10,
                                }}>
                                {productCode}
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 0.3,
                              }}></View>

                            <View
                              style={{
                                flex: 1,
                                padding: 8,
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
                                {packSize}
                              </Text>
                            </View>
                          </View>

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
                                padding: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('Ordered No')}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 13,
                                  fontWeight: 'bold',
                                  marginTop: 10,
                                }}>
                                {modalQuantityOrdered}
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 0.3,
                              }}></View>

                            <View
                              style={{
                                flex: 1,
                                padding: 8,
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
                                {volume * modalQuantityOrdered} {modalData.unit}
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
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('Delivered No')}
                              </Text>
                              <TextInput
                                placeholder="Delivered"
                                keyboardType="numeric"
                                style={{
                                  width: 80,
                                  marginTop: 5,
                                  fontWeight: 'bold',
                                }}
                                value={
                                  modalQuantityDelivered &&
                                  String(modalQuantityDelivered)
                                }
                                onChangeText={value =>
                                  this.setState({
                                    modalQuantityDelivered: value,
                                    modalUserQuantityDelivered: value * volume,
                                  })
                                }
                              />
                            </View>
                            <View
                              style={{
                                flex: 0.3,
                              }}></View>

                            <View
                              style={{
                                flex: 1,
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Delivered Qty')}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <TextInput
                                  placeholder="Delivered Qty."
                                  value={
                                    modalUserQuantityDelivered &&
                                    String(modalUserQuantityDelivered)
                                  }
                                  style={{
                                    width: 80,
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}
                                  onChangeText={value =>
                                    this.setState({
                                      modalUserQuantityDelivered: value,
                                      modalQuantityDelivered:
                                        (value /
                                          Number(
                                            volume * modalQuantityOrdered,
                                          )) *
                                        modalQuantityOrdered,
                                    })
                                  }
                                />
                                <Text
                                  style={{
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}>
                                  {finalUnit}
                                </Text>
                              </View>
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
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Invoiced No')}
                              </Text>
                              <TextInput
                                placeholder={translate('_Invoiced No')}
                                style={{
                                  width: 80,
                                  fontWeight: 'bold',
                                  marginTop: 5,
                                }}
                                value={
                                  modalQuantityInvoiced &&
                                  String(modalQuantityInvoiced)
                                }
                                onChangeText={value =>
                                  this.setState({
                                    modalQuantityInvoiced: value,
                                    modalUserQuantityInvoiced: value * volume,
                                    modalPricePaid: (
                                      value *
                                      packSize *
                                      unitPrizeModal
                                    ).toFixed(2),
                                  })
                                }
                              />
                            </View>

                            <View
                              style={{
                                flex: 0.3,
                              }}></View>

                            <View
                              style={{
                                flex: 1,
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Invoiced Qty')}
                              </Text>
                              <View
                                style={{
                                  alignItems: 'center',
                                  flexDirection: 'row',
                                }}>
                                <TextInput
                                  placeholder={translate('_Invoiced Qty')}
                                  style={{
                                    width: 80,
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}
                                  value={
                                    modalUserQuantityInvoiced &&
                                    String(modalUserQuantityInvoiced)
                                  }
                                  onChangeText={value =>
                                    this.setState({
                                      modalUserQuantityInvoiced: value,
                                      modalQuantityInvoiced:
                                        (value /
                                          Number(
                                            volume * modalQuantityOrdered,
                                          )) *
                                        modalQuantityOrdered,
                                    })
                                  }
                                />
                                <Text
                                  style={{
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}>
                                  {finalUnit}
                                </Text>
                              </View>
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
                                padding: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Ordered Val Expected')}
                              </Text>
                              <TextInput
                                placeholder={translate('_Ordered Val Expected')}
                                style={{
                                  width: 80,
                                  fontWeight: 'bold',
                                  marginTop: 5,
                                }}
                                value={
                                  orderValueExpected &&
                                  String(orderValueExpected)
                                }
                                editable={false}
                              />
                            </View>

                            <View
                              style={{
                                flex: 0.3,
                              }}></View>

                            <View
                              style={{
                                flex: 1,
                                backgroundColor: '#fff',
                                padding: 8,
                                borderRadius: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Ordered Val Actual')}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <TextInput
                                  placeholder={translate('Order Value Ex-VAT')}
                                  keyboardType="number-pad"
                                  style={{
                                    width: 80,
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}
                                  value={
                                    modalPricePaid && String(modalPricePaid)
                                  }
                                  onChangeText={value =>
                                    this.setState({
                                      modalPricePaid: value,
                                    })
                                  }
                                />
                                <Text
                                  style={{
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}>
                                  Є
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              flex: 1,
                              marginTop: hp('2%'),
                              borderBottomWidth: 0.5,
                              borderBottomColor: 'grey',
                              paddingBottom: 15,
                            }}>
                            <View
                              style={{
                                flex: 1,
                                padding: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Price Expected')}
                              </Text>
                              <TextInput
                                placeholder={translate('_Price Expected')}
                                style={{
                                  width: 80,
                                  fontWeight: 'bold',
                                  marginTop: 5,
                                }}
                                value={priceExpected && String(priceExpected)}
                                editable={false}
                              />
                            </View>

                            <View
                              style={{
                                flex: 0.3,
                              }}></View>

                            <View
                              style={{
                                flex: 1,
                                padding: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('_Price Actual')}
                              </Text>
                              <TextInput
                                placeholder={translate('_Price Actual')}
                                style={{
                                  width: 80,
                                  marginTop: 5,
                                  fontWeight: 'bold',
                                }}
                                value={priceActual && String(priceActual)}
                                editable={false}
                              />
                            </View>
                          </View>

                          {modalData.hasCreditNote > 0 ? (
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
                                  padding: 8,
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                  }}>
                                  {translate('_Credit Requested')}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <TextInput
                                    placeholder={translate('_Credit Requested')}
                                    keyboardType="numeric"
                                    style={{
                                      width: 80,
                                      fontWeight: 'bold',
                                      marginTop: 5,
                                    }}
                                    value={String(creditRequested)}
                                    editable={false}
                                  />
                                  <Text
                                    style={{
                                      fontWeight: 'bold',
                                      marginTop: 5,
                                    }}>
                                    €
                                  </Text>
                                </View>
                              </View>

                              <View
                                style={{
                                  flex: 0.3,
                                }}></View>

                              <View
                                style={{
                                  flex: 1,
                                  backgroundColor: '#fff',
                                  padding: 8,
                                  borderRadius: 6,
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                  }}>
                                  {translate('_Credit Approved Value')}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <TextInput
                                    placeholder={translate(
                                      '_Credit Approved Value',
                                    )}
                                    style={{
                                      width: 80,
                                      marginTop: 5,
                                      fontWeight: 'bold',
                                    }}
                                    value={String(creditApprovedValue)}
                                    onChangeText={value =>
                                      this.changeCreditRequestedFun(value)
                                    }
                                  />
                                  <Text
                                    style={{
                                      fontWeight: 'bold',
                                      marginTop: 5,
                                    }}>
                                    €
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ) : null}

                          {modalData.hasCreditNote > 0 ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1,
                                marginTop: hp('2%'),
                                borderBottomWidth: 0.5,
                                borderBottomColor: 'grey',
                                paddingBottom: 15,
                              }}>
                              <View
                                style={{
                                  flex: 1,
                                  padding: 5,
                                }}>
                                {/* <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                Price Expected
                              </Text>
                              <TextInput
                                placeholder="Price Expected"
                                style={{
                                  width: 80,
                                  fontWeight: 'bold',
                                  marginTop: 5,
                                }}
                                value={priceExpected && String(priceExpected)}
                                editable={false}
                              /> */}
                              </View>

                              <View
                                style={{
                                  flex: 0.3,
                                }}></View>

                              <View
                                style={{
                                  flex: 1,
                                  padding: 8,
                                  // backgroundColor: '#fff',
                                  // padding: 5,
                                  // borderRadius: 6,
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                  }}>
                                  {translate('_Net Value')}
                                </Text>
                                <TextInput
                                  placeholder={translate('_Net Value')}
                                  editable={false}
                                  style={{
                                    width: 80,
                                    marginTop: 5,
                                    fontWeight: 'bold',
                                  }}
                                  value={netValue && String(netValue) + ' Є '}
                                />
                              </View>
                            </View>
                          ) : null}

                          <TouchableOpacity
                            onPress={() =>
                              this.setState({
                                notArrivedStatus: !notArrivedStatus,
                                finalArrivalDateSpecific: '',
                                apiArrivalDateSpecific: '',
                              })
                            }
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: hp('2%'),
                            }}>
                            <View style={{}}>
                              <CheckBox
                                disabled={true}
                                value={notArrivedStatus}
                                style={{
                                  height: 20,
                                  width: 20,
                                }}
                              />
                            </View>
                            <Text
                              style={{
                                fontFamily: 'Inter-Regular',
                                marginLeft: 10,
                              }}>
                              {' '}
                              {translate('_Not Arrived')}
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              flex: 1,
                              marginTop: hp('2%'),
                              backgroundColor: '#fff',
                              padding: 8,
                              borderRadius: 6,
                            }}>
                            <TouchableOpacity
                              onPress={() =>
                                this.showDatePickerArrivalDateSpecific()
                              }
                              style={{
                                flex: 1,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                }}>
                                {translate('Arrived Date')}
                              </Text>
                              <TextInput
                                placeholder={translate('Arrived Date')}
                                editable={false}
                                style={{
                                  width: 100,
                                  fontWeight: 'bold',
                                  marginTop: 5,
                                }}
                                value={
                                  finalArrivalDateSpecific &&
                                  String(finalArrivalDateSpecific)
                                }
                              />
                            </TouchableOpacity>
                          </View>

                          <DateTimePickerModal
                            isVisible={isDatePickerArrivalDateSpecific}
                            mode={'date'}
                            onConfirm={this.handleConfirmArrivalDateSpecific}
                            onCancel={this.hideDatePickerArrivalDateSpecific}
                          />
                        </View>
                      </View>
                      <View style={{}}>
                        <View
                          style={{
                            alignItems: 'center',
                          }}>
                          <TextInput
                            placeholder={translate('Notes')}
                            multiline
                            style={{
                              padding: 10,
                              backgroundColor: '#fff',
                              borderRadius: 10,
                              width: wp('85%'),
                              height: hp('12%'),
                              marginTop: 15,
                            }}
                            value={modalNotes}
                            onChangeText={value =>
                              this.setState({
                                modalNotes: value,
                              })
                            }
                          />
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => this.flagFunction()}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: hp('2%'),
                          marginHorizontal: wp('7%'),
                        }}>
                        <Image
                          source={img.flagIcon}
                          style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: flagStatus === false ? 'grey' : null,
                          }}
                        />

                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            marginLeft: 10,
                          }}>
                          {translate('_Flagged')}
                        </Text>
                      </TouchableOpacity>
                      {modalData.hasCreditNote > 0 ? (
                        <TouchableOpacity
                          onPress={() => this.requestCredtiNoteFun()}
                          style={{
                            height: hp('7%'),
                            width: wp('87%'),
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            alignSelf: 'center',
                            marginTop: hp('3%'),
                            backgroundColor: '#DCDCDC',
                          }}>
                          <View
                            style={{
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#fff',
                                marginLeft: 10,
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('_Credit note Requested')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.requestCredtiNoteFun()}
                          style={{
                            height: hp('7%'),
                            width: wp('87%'),
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            alignSelf: 'center',
                            marginTop: hp('3%'),
                            borderWidth: 1,
                            borderColor: '#5197C1',
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
                              {translate('_Request credit note')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => this.saveFunInventoryItem(flagStatus)}
                        style={{
                          height: hp('7%'),
                          width: wp('87%'),

                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 10,
                          alignSelf: 'center',
                          marginTop: hp('3%'),
                          borderWidth: 1,
                          borderColor: '#5197C1',
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
                            {translate('Save')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            modalVisibleEditElement: false,
                          })
                        }
                        style={{
                          height: hp('7%'),
                          width: wp('87%'),
                          backgroundColor: '#5197C1',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 10,
                          alignSelf: 'center',
                          marginTop: hp('3%'),
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
                            {translate('Confirmed checked')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            modalVisibleEditElement: false,
                          })
                        }
                        style={{
                          height: hp('7%'),
                          width: wp('80%'),
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: hp('3%'),
                          alignSelf: 'center',
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
                  </KeyboardAwareScrollView>
                </View>
              </View>
            </Modal>
            {/* <Modal isVisible={modalVisibleEditElement} backdropOpacity={0.35}>
              <View
                style={{
                  width: wp('80%'),
                  height: hp('75%'),
                  backgroundColor: '#F0F4FF',
                  alignSelf: 'center',
                  borderRadius: 6,
                }}>
                <View
                  style={{
                    backgroundColor: '#7EA52D',
                    height: hp('6%'),
                    flexDirection: 'row',
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                  }}>
                  <View
                    style={{
                      flex: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#fff',
                        fontFamily: 'Inter-Regular',
                      }}>
                      Edit inventory item
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => this.setModalVisibleFalse()}>
                      <Image
                        source={img.cancelIcon}
                        style={{
                          height: 22,
                          width: 22,
                          tintColor: 'white',
                          resizeMode: 'contain',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{paddingHorizontal: hp('2%')}}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <View
                          style={{
                            paddingVertical: 15,
                            paddingHorizontal: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            backgroundColor: '#EFFBCF',
                            marginTop: hp('3%'),
                            borderRadius: 6,
                          }}>
                          <View
                            style={{
                              width: wp('20%'),
                              alignItems: 'center',
                            }}></View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontSize: 12,
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              #
                            </Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontSize: 12,
                                fontFamily: 'Inter-SemiBold',
                                textAlign: 'center',
                              }}>
                              Inventory Volume
                            </Text>
                          </View>
                        </View>
                        <View>
                          <View
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <View
                              style={{
                                width: wp('20%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#161C27',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                Ordered
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Ordered"
                                editable={false}
                                value={String(modalQuantityOrdered)}
                                style={{
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 80,
                                  backgroundColor: '#E9ECEF',
                                }}
                              />
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Volume"
                                value={Number(
                                  modalOrderedInventoryVolume,
                                ).toFixed(2)}
                                editable={false}
                                style={{
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 80,
                                  backgroundColor: '#E9ECEF',
                                }}
                              />
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                  marginLeft: 5,
                                }}>
                                {modalData && modalData.unit}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <View
                              style={{
                                width: wp('20%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#161C27',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                Delivered
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Delivered"
                                style={{
                                  borderWidth: 0.5,
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 80,
                                }}
                                value={
                                  modalQuantityDelivered &&
                                  String(modalQuantityDelivered)
                                }
                                onChangeText={value =>
                                  this.setState({
                                    modalQuantityDelivered: value,
                                    modalUserQuantityDelivered:
                                      value * modalOrderedInventoryVolume,
                                  })
                                }
                              />
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Volume"
                                value={
                                  modalUserQuantityDelivered &&
                                  String(modalUserQuantityDelivered)
                                }
                                style={{
                                  borderWidth: 0.5,
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 80,
                                }}
                                onChangeText={value =>
                                  this.setState({
                                    modalUserQuantityDelivered: value,
                                  })
                                }
                              />
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                  marginLeft: 5,
                                }}>
                                {modalData && modalData.unit}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <View
                              style={{
                                width: wp('20%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#161C27',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                  marginBottom: 8,
                                }}>
                                Invoiced
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Invoiced"
                                style={{
                                  borderWidth: 0.5,
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 80,
                                }}
                                value={
                                  modalQuantityInvoiced &&
                                  String(modalQuantityInvoiced)
                                }
                                onChangeText={value =>
                                  this.setState({
                                    modalQuantityInvoiced: value,
                                    modalUserQuantityInvoiced:
                                      value * modalOrderedInventoryVolume,
                                  })
                                }
                              />
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Volume"
                                style={{
                                  borderWidth: 0.5,
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 80,
                                }}
                                value={
                                  modalUserQuantityInvoiced &&
                                  String(modalUserQuantityInvoiced)
                                }
                                onChangeText={value =>
                                  this.setState({
                                    modalUserQuantityInvoiced: value,
                                  })
                                }
                              />
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                  marginLeft: 5,
                                }}>
                                {modalData && modalData.unit}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <View
                              style={{
                                width: wp('20%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#161C27',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                {translate('Price')}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="Price"
                                style={{
                                  borderWidth: 0.5,
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 100,
                                }}
                                value={modalPricePaid && String(modalPricePaid)}
                                onChangeText={value =>
                                  this.setState({
                                    modalPricePaid: value,
                                  })
                                }
                              />
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}></View>
                          </View>
                          <View
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <View
                              style={{
                                width: wp('20%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#161C27',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                  textAlign: 'center',
                                }}>
                                Arrived Date
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}>
                              <View
                                style={{
                                  marginBottom: hp('3%'),
                                }}>
                                <View style={{}}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      this.showDatePickerArrivalDateSpecific()
                                    }
                                    style={{
                                      width: 120,
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      backgroundColor: '#E9ECEF',
                                      borderRadius: 5,
                                      padding: 10,
                                      marginTop: 5,
                                    }}>
                                    <Text>{finalArrivalDateSpecific}</Text>
                                    <Image
                                      source={img.calenderIcon}
                                      style={{
                                        width: 15,
                                        height: 15,
                                        resizeMode: 'contain',
                                        marginTop: 15,
                                        marginRight: 15,
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <DateTimePickerModal
                                    isVisible={isDatePickerArrivalDateSpecific}
                                    mode={'date'}
                                    onConfirm={
                                      this.handleConfirmArrivalDateSpecific
                                    }
                                    onCancel={
                                      this.hideDatePickerArrivalDateSpecific
                                    }
                                  />
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}></View>
                          </View>
                          <View
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#fff',
                            }}>
                            <View
                              style={{
                                width: wp('20%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#161C27',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                Notes
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <TextInput
                                placeholder="Notes"
                                multiline
                                style={{
                                  borderWidth: 0.5,
                                  borderRadius: 5,
                                  padding: 8,
                                  width: 150,
                                  height: 100,
                                }}
                                value={modalNotes && String(modalNotes)}
                                onChangeText={value =>
                                  this.setState({
                                    modalNotes: value,
                                  })
                                }
                              />
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                alignItems: 'center',
                              }}></View>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: hp('3%'),
                          marginBottom: hp('4%'),
                        }}>
                        <TouchableOpacity
                          onPress={() => this.saveFunInventoryItem()}
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
                            {translate('Save')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.setModalVisibleFalse()}
                          style={{
                            width: wp('30%'),
                            height: hp('5%'),
                            alignSelf: 'flex-end',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: wp('2%'),
                            borderRadius: 100,
                            borderWidth: 1,
                            borderColor: '#482813',
                          }}>
                          <Text
                            style={{
                              color: '#482813',
                              fontSize: 15,
                              fontWeight: 'bold',
                            }}>
                            {translate('Close')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Modal> */}
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

export default connect(mapStateToProps, {UserTokenAction})(ViewReviewOrder);
