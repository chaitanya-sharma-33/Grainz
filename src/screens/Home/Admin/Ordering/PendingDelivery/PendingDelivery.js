import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
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
  deliveryPendingApi,
  reviewOrderApi,
  historyOrderApi,
  duplicateApi,
  orderByStatusApi,
  updateOrderStatusApi,
  getfilteredOrderDataApi,
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';
import Modal from 'react-native-modal';
import SurePopUp from '../../../../../components/SurePopUp';

import {translate} from '../../../../../utils/translations';

class PendingDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      modalLoaderDrafts: true,
      deliveryPendingData: [],
      deliveryPendingDataBackup: [],
      listId: '',
      type: '',
      arrangeStatusSupplier: 0,
      arrangeStatusDate: 0,
      arrangeStatusHTVA: 0,
      mailModalVisible: false,
      mailTitleValue: '',
      toRecipientValue: '',
      ccRecipientValue: '',
      mailMessageValue: '',
      loaderCompStatus: false,
      duplicateModalStatus: false,
      deleteModalStatus: false,
      param: '',
      loadMoreStatus: false,
      pageSize: '10',
      selectedPage: '1',
      pickerModalStatusOption: false,
      supplierData: '',
      filterData: [],
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
    this.props.navigation.addListener('focus', () => {
      const {listId} = this.props.route && this.props.route.params;
      const {filterData} = this.props.route && this.props.route.params;
      const {supplierData} = this.props.route && this.props.route.params;
      const {payloadData} = this.props.route && this.props.route.params;

      console.log('filterData', filterData);

      this.setState({
        filterData,
        payloadFilter: payloadData,
      });
      console.log('filterData', filterData);
      if (filterData) {
        this.setState({
          deliveryPendingData: filterData,
          deliveryPendingDataBackup: filterData,
          modalLoaderDrafts: false,
          supplierData,
        });
      } else {
        this.setState(
          {
            listId,
            modalLoaderDrafts: true,
            deliveryPendingData: [],
            deliveryPendingDataBackup: [],
            selectedPage: '1',
            supplierData,
          },
          () => this.getFinalData(supplierData),
        );
      }
    });
  }

  getFinalData = supplierData => {
    const {listId} = this.state;
    if (listId === 2) {
      this.getDeliveryPendingData(supplierData);
    } else if (listId === 3) {
      this.getReviewOrdersData(supplierData);
    } else if (listId === 4) {
      this.getHistoryOrdersData(supplierData);
    }
  };

  getDeliveryPendingData = supplierData => {
    const {
      selectedPage,
      pageSize,
      loadMoreStatus,
      deliveryPendingData,
      filterData,
    } = this.state;

    let payload = {
      status: 'Pending',
      selectedPage: selectedPage,
      pageSize: pageSize,
      supplierId: supplierData ? supplierData.id : '',
    };

    console.log('PAYLOAD-PENDING', payload);
    orderByStatusApi(payload)
      .then(res => {
        console.log('res-->Pending', res);
        console.log('res-->deliveryPendingData', deliveryPendingData);

        const finalArr = [...deliveryPendingData, ...res.data];
        console.log('res-->finalArr', finalArr);
        this.setState({
          deliveryPendingData: loadMoreStatus ? finalArr : res.data,
          deliveryPendingDataBackup: res.data,
          modalLoaderDrafts: false,
          type: 'Pending',
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  getReviewOrdersData = supplierData => {
    const {selectedPage, pageSize, loadMoreStatus, deliveryPendingData} =
      this.state;
    let payload = {
      status: 'Review',
      selectedPage: selectedPage,
      pageSize: pageSize,
      supplierId: supplierData ? supplierData.id : '',
    };

    console.log('PAYLOAD-REVIEW', payload);
    orderByStatusApi(payload)
      .then(res => {
        console.log('res-->Pending', res);
        console.log('res-->deliveryPendingData', deliveryPendingData);

        const finalArr = [...deliveryPendingData, ...res.data];
        console.log('res-->finalArr', finalArr);
        this.setState({
          deliveryPendingData: loadMoreStatus ? finalArr : res.data,
          deliveryPendingDataBackup: res.data,
          modalLoaderDrafts: false,
          type: 'Review',
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  getHistoryOrdersData = supplierData => {
    const {selectedPage, pageSize, loadMoreStatus, deliveryPendingData} =
      this.state;
    let payload = {
      status: 'History',
      selectedPage: selectedPage,
      pageSize: pageSize,
      supplierId: supplierData ? supplierData.id : '',
    };

    console.log('PAYLOAD-HISTORY', payload);
    orderByStatusApi(payload)
      .then(res => {
        console.log('res-->Pending', res);
        console.log('res-->deliveryPendingData', deliveryPendingData);

        const finalArr = [...deliveryPendingData, ...res.data];
        console.log('res-->finalArr', finalArr);
        this.setState({
          deliveryPendingData: loadMoreStatus ? finalArr : res.data,
          deliveryPendingDataBackup: res.data,
          modalLoaderDrafts: false,
          type: 'History',
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  searchFun = txt => {
    this.setState(
      {
        searchItem: txt,
      },
      () => this.filterData(txt),
    );
  };

  filterData = text => {
    //passing the inserted text in textinput

    const newData = this.state.deliveryPendingDataBackup.filter(function (
      item,
    ) {
      //applying filter for the inserted text in search bar
      const itemData = item.supplierName
        ? item.supplierName.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      deliveryPendingData: newData,
      searchItem: text,
    });
  };

  viewFun = item => {
    const {listId} = this.state;
    if (listId === 2) {
      this.props.navigation.navigate('ViewPendingDeliveryScreen', {
        productId: item.id,
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        basketId: item.shopingBasketId,
        listId: 2,
        finalData: item,
      });
    } else if (listId === 3) {
      if (item.isTDC === true) {
        this.props.navigation.navigate('EditPurchase', {
          item: item,
          orderData: item,
        });

        //   this.props.navigation.navigate('ViewReviewOrderScreen', {
        //   productId: item.id,
        //   supplierId: item.supplierId,
        //   supplierName: item.supplierName,
        //   basketId: item.shopingBasketId,
        //   listId: 3,
        //   finalData: item,
        // });
      } else {
        this.props.navigation.navigate('ViewReviewOrderScreen', {
          productId: item.id,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          basketId: item.shopingBasketId,
          listId: 3,
          finalData: item,
        });
      }
    } else if (listId === 4) {
      // if (item.isTDC === true) {
      //   console.log('item', item);
      //   this.props.navigation.navigate('EditHistoryOrderScreen', {
      //     orderData: item,
      //     finalData: item,
      //   });
      // } else {
      this.props.navigation.navigate('ViewHistoryOrderScreen', {
        productId: item.id,
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        basketId: item.shopingBasketId,
        listId: 4,
        finalData: item,
      });
      // }
    }
  };

  arrangeListFun = funType => {
    if (funType === 'SUPPLIER') {
      this.setState(
        {
          arrangeStatusSupplier: Number(1) + this.state.arrangeStatusSupplier,
        },
        () => this.arrangeListFunSec('SUPPLIER'),
      );
    } else if (funType === 'DATE') {
      this.setState(
        {
          arrangeStatusDate: Number(1) + this.state.arrangeStatusDate,
        },
        () => this.arrangeListFunSec('DATE'),
      );
    } else if (funType === 'HTVA') {
      this.setState(
        {
          arrangeStatusHTVA: Number(1) + this.state.arrangeStatusHTVA,
        },
        () => this.arrangeListFunSec('HTVA'),
      );
    }
  };

  reverseFun = () => {
    const {deliveryPendingData} = this.state;
    const finalData = deliveryPendingData.reverse();

    this.setState({
      deliveryPendingData: finalData,
    });
  };

  arrangeListFunSec = type => {
    const {arrangeStatusSupplier, arrangeStatusDate, arrangeStatusHTVA} =
      this.state;
    const finalData =
      type === 'SUPPLIER'
        ? arrangeStatusSupplier
        : type === 'DATE'
        ? arrangeStatusDate
        : arrangeStatusHTVA;
    if (finalData % 2 == 0) {
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  descendingOrderFun = type => {
    const {deliveryPendingData} = this.state;

    if (type === 'SUPPLIER') {
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
      const finalKeyValue =
        type === 'SUPPLIER'
          ? 'supplierName'
          : type === 'DATE'
          ? 'deliveryDate'
          : 'htva';

      const finalData = deliveryPendingData.sort(dynamicSort(finalKeyValue));

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
      const finalKeyValue =
        type === 'SUPPLIER'
          ? 'supplierName'
          : type === 'DATE'
          ? 'deliveryDate'
          : 'htva';

      const finalData = deliveryPendingData.sort(dynamicSort(finalKeyValue));

      this.setState({
        deliveryPendingData: finalData,
      });
    }
  };

  openMailFun = item => {
    this.setState({
      mailModalVisible: true,
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
        loaderCompStatus: false,
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

    console.log('Payload', payload);

    // sendOrderApi(payload)
    //   .then(res => {
    //     this.setState({
    //       mailModalVisible: false,
    //       loaderCompStatus: false,
    //     });
    //   })
    //   .catch(err => {
    //     Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
    //       {
    //         text: 'Okay',
    //       },
    //     ]);
    //   });
  };

  closeModalFun = () => {
    this.setState({
      pickerModalStatus: false,
      duplicateModalStatus: false,
      deleteModalStatus: false,
    });
  };

  pickerFun = item => {
    this.setState({
      pickerModalStatusOption: true,
      param: item,
    });
  };

  duplicateModalFun = () => {
    this.setState(
      {
        pickerModalStatusOption: false,
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

  duplicateModalFunSec = () => {
    const {param} = this.state;
    this.setState(
      {
        recipeLoader: true,
        duplicateModalStatus: false,
      },
      () =>
        duplicateApi(param.id)
          .then(res => {
            this.setState({
              recipeLoader: false,
            });
          })
          .catch(error => {
            this.setState({
              deleteLoader: false,
            });
            console.warn('Duplicateerror', error.response);
          }),
    );
  };

  addFilteredData = res => {
    const {deliveryPendingData} = this.state;

    const finalArr = [...deliveryPendingData, ...res.data];

    console.log('res-->finalArr', finalArr);

    this.setState({
      deliveryPendingData: finalArr,
      deliveryPendingDataBackup: finalArr,
      modalLoaderDrafts: false,
    });
  };

  getFilteredData = async () => {
    const {payloadFilter, selectedPage} = this.state;
    const {
      suppliers,
      startDate,
      endDate,
      flagged,
      hasCreditNote,
      pageSize,
      status,
    } = payloadFilter;
    let payload = {
      suppliers: suppliers ? suppliers : [],
      startDate: startDate,
      endDate: endDate,
      flagged: flagged,
      selectedPage: selectedPage,
      hasCreditNote: hasCreditNote,
      pageSize: pageSize,
      status: status,
    };
    console.log('payload', payload);

    getfilteredOrderDataApi(payload)
      .then(res => {
        console.log('res', res);

        this.addFilteredData(res);
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

  addMoreFun = () => {
    const {selectedPage, filterData} = this.state;
    const newPageNumber = parseInt(selectedPage) + 1;
    if (filterData) {
      this.setState(
        {
          selectedPage: newPageNumber,
          modalLoaderDrafts: true,
          loadMoreStatus: true,
        },
        () => this.getFilteredData(),
      );
    } else {
      this.setState(
        {
          selectedPage: newPageNumber,
          modalLoaderDrafts: true,
          loadMoreStatus: true,
        },
        () => this.getFinalData(),
      );
    }
  };

  pendingFun = () => {
    const {param} = this.state;

    console.log('param', param);

    let payload = {};

    updateOrderStatusApi(payload, param.id, 'Pending')
      .then(res => {
        this.setState(
          {
            pickerModalStatusOption: false,
            modalLoaderDrafts: true,
          },
          () => this.getFinalData(),
        );
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  reviewFun = () => {
    const {param} = this.state;

    console.log('param', param);

    let payload = {};

    updateOrderStatusApi(payload, param.id, 'Review')
      .then(res => {
        this.setState(
          {
            pickerModalStatusOption: false,
            modalLoaderDrafts: true,
          },
          () => this.getFinalData(),
        );
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalLoaderDrafts,
      deliveryPendingData,
      listId,
      searchItem,
      type,
      mailModalVisible,
      mailTitleValue,
      toRecipientValue,
      ccRecipientValue,
      mailMessageValue,
      loaderCompStatus,
      pickerModalStatus,
      duplicateModalStatus,
      deleteModalStatus,
      pickerModalStatusOption,
      filterData,
      supplierData,
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
        <View style={{marginBottom: hp('2%')}}>
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
                    {listId === 2
                      ? translate('Pending Deliveries')
                      : listId === 3
                      ? translate('Review')
                      : listId === 4
                      ? translate('History')
                      : null}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {listId === 2
                    ? translate('Pending Deliveries')
                    : listId === 3
                    ? translate('Review')
                    : listId === 4
                    ? translate('History')
                    : null}
                </Text>
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

          <View
            style={{
              flexDirection: 'row',
              paddingLeft: wp('5%'),
            }}>
            <View
              style={{
                width: wp('60%'),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 5,
              }}>
              <TextInput
                placeholder={translate('Search')}
                style={{
                  padding: 12,
                  borderRadius: 5,
                  width: '85%',
                }}
                value={searchItem}
                onChangeText={value => this.searchFun(value)}
              />
              <View>
                <Image
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                  }}
                  source={img.searchIcon}
                />
              </View>
            </View>
            <View
              style={{
                width: wp('29%'),
                marginLeft: 10,
                backgroundColor: '#fff',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 5,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('FilterOrderScreen', {
                    item: '',
                    screenType: 'Pending',
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View>
                  <Image
                    style={{
                      width: 18,
                      height: 18,
                      resizeMode: 'contain',
                      marginLeft: 10,
                      tintColor: 'grey',
                    }}
                    source={img.filterIcon}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      padding: 12,
                      color: 'grey',
                    }}>
                    {translate('Filter')}
                  </Text>
                </View>
              </TouchableOpacity>
              {filterData ? (
                <TouchableOpacity
                  onPress={() =>
                    this.setState(
                      {
                        filterData: undefined,
                      },
                      () => this.getFinalData(supplierData),
                    )
                  }>
                  <Image
                    style={{
                      width: 18,
                      height: 18,
                      resizeMode: 'contain',
                    }}
                    source={img.deleteIcon}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              height: hp('7%'),
              width: wp('90%'),
              borderRadius: 100,
              backgroundColor: '#fff',
              alignSelf: 'center',
              justifyContent: 'space-between',
              marginVertical: hp('1.5%'),
            }}>
            <TextInput
              placeholder="Search"
              value={searchItem}
              style={{
                padding: 15,
                width: wp('75%'),
              }}
              onChangeText={value => this.searchFun(value)}
            />
            <Image
              style={{
                height: 18,
                width: 18,
                resizeMode: 'contain',
                marginRight: wp('5%'),
              }}
              source={img.searchIcon}
            />
          </View> */}

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('3%'), height: hp('60%')}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      marginHorizontal: wp('4%'),
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flex: 1,
                        backgroundColor: '#C9C9C9',
                        paddingVertical: hp('2%'),
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                        paddingHorizontal: wp('3%'),
                        borderWidth: 0.2,
                        borderColor: 'grey',
                      }}>
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('DATE')}
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
                          {listId === 2
                            ? translate('Delivery date')
                            : translate('Order date')}
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
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('SUPPLIER')}
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
                          {translate('Supplier')}
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
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('HTVA')}
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
                          {translate('HTVA')} €
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
                      <View
                        style={{
                          flex: 0.2,
                          alignItems: 'center',
                        }}></View>
                    </View>
                    <View>
                      {deliveryPendingData && deliveryPendingData.length > 0
                        ? deliveryPendingData.map((item, index) => {
                            console.log('item', item);
                            return (
                              <View
                                style={{
                                  // paddingVertical: 10,
                                  // paddingHorizontal: 5,
                                  // flexDirection: 'row',
                                  // backgroundColor:
                                  //   index % 2 === 0 ? '#FFFFFF' : '#F5F8FE',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  flex: 1,
                                  backgroundColor:
                                    index % 2 === 0 ? '#FFFFFF' : '#F5F8FE',
                                  paddingHorizontal: wp('3%'),
                                  borderWidth: 0.2,
                                  borderColor: 'grey',
                                }}>
                                <TouchableOpacity
                                  onPress={() => this.viewFun(item)}
                                  style={{
                                    // flexDirection: 'row',
                                    // alignItems: 'center',
                                    flexDirection: 'row',
                                    flex: 2.2,
                                    paddingVertical: hp('2%'),
                                  }}>
                                  {/* <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            textAlign: 'center',
                                            color: item.flaggedCount > 0 ? 'red' : 'black',
                                          }}
                                          numberOfLines={1}>
                                          {item.orderReference}
                                        </Text>
                                      </View> */}

                                  <View
                                    style={{
                                      flex: 1,
                                      justifyContent: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        color:
                                          item.flaggedCount > 0
                                            ? 'red'
                                            : 'black',
                                        fontSize: 14,
                                      }}>
                                      {type === 'Pending'
                                        ? moment(item.deliveryDate).format(
                                            'DD/MM/YYYY',
                                          )
                                        : type === 'Review'
                                        ? moment(item.orderDate).format(
                                            'DD/MM/YYYY',
                                          )
                                        : type === 'History'
                                        ? moment(item.orderDate).format(
                                            'DD/MM/YYYY',
                                          )
                                        : null}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                      }}>
                                      <Text
                                        style={{
                                          color:
                                            item.flaggedCount > 0
                                              ? 'red'
                                              : 'black',
                                          fontSize: 14,
                                          textAlign: 'left',
                                        }}>
                                        {item.supplierName}
                                      </Text>
                                      <View>
                                        {item.creditNotesCount > 0 ? (
                                          <Image
                                            source={img.envolopeIcon}
                                            style={{
                                              width: 16,
                                              height: 16,
                                              resizeMode: 'contain',
                                              marginLeft: 5,
                                            }}
                                          />
                                        ) : null}
                                      </View>
                                    </View>
                                    {/* {item.flaggedCount > 0 ? (
                                      <Image
                                        source={img.flagIcon}
                                        style={{
                                          width: 25,
                                          height: 25,
                                          resizeMode: 'contain',
                                        }}
                                      />
                                    ) : null} */}

                                    <View>
                                      {item.notes ? (
                                        <Image
                                          source={img.messageIcon}
                                          style={{
                                            width: 16,
                                            height: 16,
                                            resizeMode: 'contain',
                                            marginLeft: 2,
                                          }}
                                        />
                                      ) : null}
                                    </View>
                                  </View>
                                  <View
                                    style={{
                                      // width: wp('30%'),
                                      // alignItems: 'center',
                                      flex: 1,
                                      justifyContent: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        color:
                                          item.flaggedCount > 0
                                            ? 'red'
                                            : 'black',
                                        fontSize: 14,
                                      }}>
                                      € {item && Number(item.htva).toFixed(2)}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => this.pickerFun(item)}
                                  style={{
                                    flex: 0.2,
                                    justifyContent: 'center',
                                  }}>
                                  <Image
                                    style={{
                                      width: 17,
                                      height: 17,
                                      resizeMode: 'contain',
                                      tintColor: 'grey',
                                    }}
                                    source={img.threeDotsIcon}
                                  />
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                      onPress={() => this.openMailFun(item)}
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Image
                                        style={{
                                          height: 35,
                                          width: 35,
                                          resizeMode: 'contain',
                                        }}
                                        source={img.emailIcon}
                                      />
                                    </TouchableOpacity> */}
                              </View>
                            );
                          })
                        : null}
                      {deliveryPendingData.length > 5 ? (
                        <TouchableOpacity
                          onPress={() => this.addMoreFun()}
                          style={{
                            marginTop: hp('4%'),
                            alignSelf: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Inter-SemiBold',
                              color: 'black',
                              color: '#5297c1',
                              fontWeight: 'bold',
                              textDecorationLine: 'underline',
                            }}>
                            {translate('Load more')}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                )}
              </ScrollView>

              <Modal
                isVisible={pickerModalStatusOption}
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
                            pickerModalStatusOption: false,
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

                      {listId === 2 ? null : listId === 3 ? (
                        <TouchableOpacity
                          onPress={() => this.pendingFun()}
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
                              color: 'black',
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}>
                            {translate('Move to Pending')}
                          </Text>
                        </TouchableOpacity>
                      ) : listId == 4 ? (
                        <TouchableOpacity
                          onPress={() => this.reviewFun()}
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
                              color: 'black',
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}>
                            {translate('Move to review')}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </ScrollView>
                </View>
              </Modal>
              <Modal isVisible={mailModalVisible} backdropOpacity={0.35}>
                <View
                  style={{
                    width: wp('80%'),
                    height: hp('60%'),
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
                      <Text style={{fontSize: 16, color: '#fff'}}>
                        Send Mail
                      </Text>
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
                          {loaderCompStatus ? (
                            <View
                              style={{
                                width: wp('30%'),
                                height: hp('5%'),
                                alignSelf: 'flex-end',
                                backgroundColor: '#94C036',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 100,
                              }}>
                              <ActivityIndicator size="small" color="#fff" />
                            </View>
                          ) : (
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
                          )}
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
                              {translate('Close')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
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
              {/* <SurePopUp
                pickerModalStatus={deleteModalStatus}
                headingText={translate('Delete')}
                crossFun={() => this.closeModalFun()}
                bodyText="Are you sure you want to delete this item from the list?"
                cancelFun={() => this.closeModalFun()}
                saveFun={() => this.deleteFun()}
                yesStatus
              /> */}
              {/* <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('NewOrderSecScreen', {
                    ScreenType: '',
                  })
                }
                // onPress={() =>
                //   this.props.navigation.navigate('OrderCreationScreen', {
                //     item: '',
                //   })
                // }
                style={{
                  position: 'absolute',
                  right: 20,
                  top: hp('50%'),
                  flexDirection: 'row',
                  backgroundColor: '#5297c1',
                  padding: 15,
                  borderRadius: 5,
                }}>
                <View>
                  <Image
                    style={{...styles.listImageStyling, tintColor: '#fff'}}
                    source={img.plusIcon}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter-SemiBold',
                    color: 'black',
                    marginLeft: 5,
                    color: '#fff',
                    fontWeight: 'bold',
                  }}>
                  {translate('New Order')}
                </Text>
              </TouchableOpacity> */}
            </View>
          )}
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

export default connect(mapStateToProps, {UserTokenAction})(PendingDelivery);
