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

  getProfileData = () => {
    getMyProfileApi()
      .then(res => {
        this.setState({
          recipeLoader: false,
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
    const {
      finalData,
      supplierId,
      itemType,
      productId,
      supplierName,
      finalDataSec,
    } = this.props.route && this.props.route.params;
    this.setState(
      {
        supplierId,
        itemType,
        basketId: finalData,
        modalLoader: true,
        finalOrderDate: moment(new Date()).format('DD-MM-YY'),
        finalOrderMinDate: new Date(),
        apiOrderDate: new Date().toISOString(),
        productId,
        supplierName,
        finalDataSec,
      },
      () => this.getBasketDataFun(),
    );
  }

  getBasketDataFun = () => {
    const {basketId} = this.state;
    getBasketApi(basketId)
      .then(res => {
        console.log('res', res);
        this.setState(
          {
            modalData: res.data && res.data.shopingBasketItemList,
            modalLoader: false,
            totalHTVAVal: res.data && res.data.totalValue,
            placedByValue: res.data && res.data.placedBy,
            loaderCompStatus: false,
          },
          () => this.createApiData(),
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

  createApiData = () => {
    const {modalData, finalDataSec} = this.state;
    console.log('FINAAP', finalDataSec);
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
      });
    });
    this.setState({
      finalApiData: [...finalArr],
      placedByValue: finalDataSec.placedByData,
      supplierId: finalDataSec.supplierId,
      apiDeliveryDate: finalDataSec.productionDateDelivery,
      apiOrderDate: finalDataSec.productionDateOrder,
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

  editQuantityFun = (index, type, value) => {
    const {modalData} = this.state;

    let newArr = modalData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
            ['action']: 'Update',
          }
        : item,
    );
    this.setState({
      modalData: [...newArr],
    });
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
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
      totalHTVAVal,
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
      };
      console.log('payload', payload);
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.setState({
            mailModalVisible: true,
            loaderCompStatus: false,
            toRecipientValue: res.data && res.data.emailDetails.toRecipient,
            ccRecipientValue: res.data && res.data.emailDetails.ccRecipients,
            mailTitleValue: res.data && res.data.emailDetails.subject,
            mailMessageValue: res.data && res.data.emailDetails.text,
          });
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
      Alert.alert(`Grainz`, 'Please select all values.', [
        {
          text: 'Okay',
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }
  };

  editInventoryFun = () => {
    this.setState({
      actionModalStatus: false,
      // editStatus: true,
    });
  };

  deleteInventoryFun = () => {
    this.setState(
      {
        actionModalStatus: false,
      },
      () =>
        setTimeout(() => {
          Alert.alert('Grainz', 'Are you sure you want to delete it?', [
            {
              text: 'Yes',
              onPress: () => this.hitDeleteApiFun(),
            },
            {
              text: 'No',
              onPress: () => this.closeLoaderComp(),
            },
          ]);
        }, 100),
    );
  };

  hitDeleteApiFun = () => {
    const {supplierId, basketId, finalArrData} = this.state;
    let payload = {
      supplierId: supplierId,
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
            text: 'Okay',
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
    } = this.state;
    let payload = {
      id: basketId,
      supplierId: supplierId,
      orderDate: apiOrderDate,
      deliveryDate: apiDeliveryDate,
      placedBy: placedByValue,
      totalValue: totalHTVAVal,
      shopingBasketItemList: finalApiData,
    };
    console.log('payload', payload);
    if (apiOrderDate && placedByValue && supplierId && finalApiData) {
      updateDraftOrderNewApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
            },
            () => this.props.navigation.navigate('OrderingAdminScreen'),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: 'Okay',
                onPress: () => this.closeLoaderComp(),
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

  closeLoaderComp = () => {
    this.setState({
      loaderCompStatus: false,
    });
  };

  flatListFun = item => {
    const {basketId} = this.state;
    if (item.id === 0) {
      this.props.navigation.navigate('AddItemsOrderScreen', {
        screen: 'Update',
        basketId: basketId,
      });
    } else if (item.id === 1) {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.viewFun(),
      );
    }
  };

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
    } = this.state;
    let payload = {
      id: basketId,
      supplierId: supplierId,
      orderDate: apiOrderDate,
      deliveryDate: apiDeliveryDate,
      placedBy: placedByValue,
      totalValue: totalHTVAVal,
      shopingBasketItemList: finalApiData,
    };

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
                text: 'Okay',
                onPress: () => this.closeLoaderComp(),
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
    const finalDeliveryDate = moment(date).format('DD-MM-YY');
    if (finalDeliveryDate < finalOrderDate) {
      alert('Delivery date cannot be less than or equal to order date');
    } else {
      let newdate = moment(date).format('DD-MM-YY');
      let apiDeliveryDate = date.toISOString();
      this.setState({
        finalDeliveryDate: newdate,
        apiDeliveryDate,
      });
      this.hideDatePickerDeliveryDate();
    }
  };

  hideDatePickerDeliveryDate = () => {
    this.setState({
      isDatePickerVisibleDeliveryDate: false,
    });
  };

  updateBasketFun = () => {
    const {supplierId, basketId, modalData} = this.state;
    let payload = {
      supplierId: supplierId,
      shopingBasketItemList: modalData,
      id: basketId,
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
            text: 'Okay',
            onPress: () => this.closeLoaderComp(),
          },
        ]);
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
            loaderCompStatus: false,
          },
          () => this.props.navigation.navigate('OrderingAdminScreen'),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.closeLoaderComp(),
          },
        ]);
      });
  };

  closeMailModal = () => {
    this.setState(
      {
        mailModalVisible: false,
      },
      () => this.props.navigation.navigate('OrderingAdminScreen'),
    );
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

    console.log;

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
    } = this.state;

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
            </View>
          </View>

          <View style={{marginHorizontal: wp('3%')}}>
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
                    padding: Platform.OS === 'ios' ? 15 : 0,
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
                      editable={false}
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={{flex: 1}}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    padding: Platform.OS === 'ios' ? 15 : 0,
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
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
                        width: 15,
                        height: 15,
                        resizeMode: 'contain',
                        alignSelf: Platform.OS === 'android' ? 'center' : null,
                        marginRight: Platform.OS === 'android' ? 10 : 0,
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
                      value={finalDataSec.finalDeliveryDate}
                      editable={false}
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
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
                      padding: Platform.OS === 'ios' ? 15 : 0,
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
                        }}
                      />
                    </View>
                  </View>
                </View>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      padding: Platform.OS === 'ios' ? 15 : 0,
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
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
                        value={finalDataSec.finalOrderDate}
                        editable={false}
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
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
                                // flexDirection: 'row',
                                // alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                {translate('Inventory item')}
                              </Text>
                              {/* <TouchableOpacity
                                onPress={() => this.arrangeListFun('NAME')}>
                                <Image
                                  style={{
                                    width: 13,
                                    height: 13,
                                    resizeMode: 'contain',
                                    marginLeft: 5,
                                  }}
                                  source={img.doubleArrowIconNew}
                                />
                              </TouchableOpacity> */}
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
          )}

          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => this.previewPDFFun()}
              style={{
                height: hp('5.5%'),
                width: wp('80%'),
                backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('2%'),
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
                  {translate('Preview PDF')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.sendFun()}
              style={{
                height: hp('6%'),
                width: wp('80%'),
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
                  {translate('Send')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.saveDraftFunGreen()}
              style={{
                height: hp('6%'),
                width: wp('80%'),
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
                this.props.navigation.navigate('OrderingAdminScreen')
              }
              style={{
                height: hp('6%'),
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
                height: hp('65%'),
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
                    Send Order
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
                      <Text style={{fontSize: 11, paddingLeft: 15}}>From</Text>
                      <TextInput
                        value={mailTitleValue}
                        placeholder="From"
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
                      <Text style={{fontSize: 11, paddingLeft: 15}}> To </Text>
                      <TextInput
                        value={toRecipientValue}
                        placeholder="To"
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
                            height: hp('5%'),
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
                            height: hp('5%'),
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
                            {translate('Confirm')}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => this.closeMailModal()}
                        style={{
                          width: wp('68%'),
                          height: hp('5%'),
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
                          {translate('Close')}
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
