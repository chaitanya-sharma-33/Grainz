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
    const {productId, supplierId, supplierName, basketId, listId} =
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
    const {pageOrderItems} = this.state;
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
      };
    });

    const result = finalArray;
    this.setState({
      finalApiData: [...result],
    });
  };

  // isCheckedEditableStatusFun = () => {
  //   const {pageData} = this.state;
  //   const finalStatus = pageData.orderItems.some((item, index) => {
  //     return item.isCorrect === null;
  //   });
  //   this.setState({
  //     isCheckedEditableStatus: finalStatus,
  //   });
  // };

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
      isChecked: true,
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
      this.props.navigation.navigate('OrderingAdminScreen');
    }
  };

  deleteFun = item => {
    Alert.alert(
      `Grainz`,
      'Are you sure you want to delete this order line item?',
      [
        {
          text: 'Yes',
          onPress: () =>
            this.setState(
              {
                loaderCompStatus: true,
              },
              () => this.hitDeleteApi(item),
            ),
        },
        {
          text: 'No',
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
    const finalValue =
      value && value.choiceCode === 'Y'
        ? 'true'
        : value && value.choiceCode === 'N'
        ? 'false'
        : null;
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
          // Alert.alert(`Grainz`, 'Correct status updated successfully', [
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
    this.setState({
      modalData: item,
      modalVisibleEditElement: true,
      modalOrderedInventoryVolume: item.grainzVolume,
      modalQuantityOrdered: item.quantityOrdered,
      modalQuantityDelivered: item.quantityDelivered,
      modalUserQuantityDelivered: item.userQuantityDelivered,
      modalQuantityInvoiced: item.quantityInvoiced,
      modalUserQuantityInvoiced: item.userQuantityInvoiced,
      modalPricePaid: item.pricePaid,
      modalNotes: item.notes,
      finalArrivalDateSpecific: moment(item.arrivedDate).format('DD-MM-YYYY'),
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

  saveFunInventoryItem = () => {
    this.setState(
      {
        listIndex: '',
      },
      () =>
        setTimeout(() => {
          this.saveFunInventoryItemSec();
        }, 500),
    );
  };

  saveFunInventoryItemSec = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () =>
        setTimeout(() => {
          this.saveFunInventoryItemThird();
        }, 300),
    );
  };

  saveFunInventoryItemThird = () => {
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
    } = this.state;
    let payload = {
      arrivedDate: apiArrivalDateSpecific,
      id: modalData.id,
      inventoryId: modalData.inventoryId,
      inventoryProductMappingId:
        modalData.inventoryMapping && modalData.inventoryMapping.id,
      isCorrect: modalData.isCorrect,
      notes: modalNotes,
      orderId: modalData.orderId,
      orderValue: totalValue,
      orderedInventoryVolume: modalOrderedInventoryVolume,
      // pricePaid: modalPricePaid,
      quantityDelivered: Number(modalQuantityDelivered),
      quantityInvoiced: Number(modalQuantityInvoiced),
      quantityOrdered: modalQuantityOrdered,
      userQuantityDelivered: Number(modalUserQuantityDelivered),
      userQuantityInvoiced: Number(modalUserQuantityInvoiced),
    };
    console.log('payload', payload);
    processPendingOrderItemApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.getOrderFun(),
        );
        // Alert.alert(`Grainz`, 'Order line item updated successfully', [
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
    } = this.state;

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
          <View style={styles.firstContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.adminTextStyle}>Review Order</Text>
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>{translate('Go Back')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{flex: 1}}>
            <ScrollView style={{}} showsVerticalScrollIndicator={false}>
              <View style={{padding: hp('3%')}}>
                <View style={{}}>
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
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View
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
                      {/* <View
                        style={{
                          width: wp('30%'),
                          marginLeft: wp('5%'),
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Arrived date
                        </Text>
                      </View> */}
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
                    </View>
                    <View>
                      {pageData && pageOrderItems.length > 0 ? (
                        pageOrderItems.map((item, index) => {
                          console.log('item', item);
                          return (
                            <View key={index}>
                              <View
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
                                {/* <View
                                style={{
                                  width: wp('30%'),
                                  marginLeft: wp('5%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {item.arrivedDate &&
                                    moment(item.arrivedDate).format('DD-MM-YYYY')}
                                </Text>
                              </View> */}
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
                                    {/* {`${item.quantityOrdered} X ${item.packSize}/${item.unit}`} */}
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
                                    {/* {`${item.quantityOrdered} X ${item.packSize}/${item.unit}`} */}
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
                              </View>
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
                                              value={String(
                                                modalQuantityOrdered,
                                              )}
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
                                                String(
                                                  modalUserQuantityDelivered,
                                                )
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
                                                String(
                                                  modalUserQuantityInvoiced,
                                                )
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
                                                      marginTop:
                                                        Platform.OS ===
                                                        'android'
                                                          ? 15
                                                          : 0,
                                                      marginRight:
                                                        Platform.OS ===
                                                        'android'
                                                          ? 15
                                                          : 0,
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
                </ScrollView>

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
                      onPress={() =>
                        this.setState({isAuditStatus: !isAuditStatus})
                      }
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          borderRadius: 100,
                          // backgroundColor: isCheckedEditableStatus
                          //   ? '#D6D6D6'
                          //   : '#fff',
                        }}>
                        <CheckBox
                          disabled={true}
                          value={isAuditStatus}
                          // onValueChange={() =>
                          //   this.setState({isAuditStatus: !isAuditStatus})
                          // }
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
                        {' '}
                        Audit Complete ?
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        marginLeft: wp('5%'),
                      }}>
                      <Text style={{}}>Total HTVA</Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        marginLeft: wp('5%'),
                      }}>
                      <Text> € {totalValue}</Text>
                      {/* <Text> $ {Number(totalHTVAVal).toFixed(2)}</Text> */}
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
              </View>
              <View>
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
              </View>
            </ScrollView>
            <Modal isVisible={modalVisibleEditElement} backdropOpacity={0.35}>
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
                                        marginTop:
                                          Platform.OS === 'android' ? 15 : 0,
                                        marginRight:
                                          Platform.OS === 'android' ? 15 : 0,
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
            </Modal>
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
