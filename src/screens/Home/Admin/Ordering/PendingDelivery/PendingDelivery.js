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
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';
import Modal from 'react-native-modal';

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
    const {listId} = this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          listId,
          modalLoaderDrafts: true,
        },
        () => this.getFinalData(),
      );
    });
  }

  getFinalData = () => {
    const {listId} = this.state;
    if (listId === 2) {
      this.getDeliveryPendingData();
    } else if (listId === 3) {
      this.getReviewOrdersData();
    } else if (listId === 4) {
      this.getHistoryOrdersData();
    }
  };

  getDeliveryPendingData = () => {
    deliveryPendingApi()
      .then(res => {
        this.setState({
          deliveryPendingData: res.data,
          deliveryPendingDataBackup: res.data,
          modalLoaderDrafts: false,
          type: 'Pending',
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  getReviewOrdersData = () => {
    reviewOrderApi()
      .then(res => {
        this.setState({
          deliveryPendingData: res.data,
          deliveryPendingDataBackup: res.data,
          modalLoaderDrafts: false,
          type: 'Review',
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  getHistoryOrdersData = () => {
    historyOrderApi()
      .then(res => {
        this.setState({
          deliveryPendingData: res.data,
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
      });
    } else if (listId === 3) {
      this.props.navigation.navigate('ViewReviewOrderScreen', {
        productId: item.id,
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        basketId: item.shopingBasketId,
        listId: 3,
      });
    } else if (listId === 4) {
      if (item.isTDC === true) {
        console.log('item', item);
        this.props.navigation.navigate('EditHistoryOrderScreen', {
          orderData: item,
        });
      } else {
        this.props.navigation.navigate('ViewHistoryOrderScreen', {
          productId: item.id,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          basketId: item.shopingBasketId,
          listId: 4,
        });
      }
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
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
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
          </View>

          <View
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
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{}}>
              <ScrollView>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      padding: hp('2%'),
                    }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <View
                          style={{
                            paddingVertical: 15,
                            paddingHorizontal: 5,
                            marginTop: 10,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            backgroundColor: '#EFFBCF',
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                          }}>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('Order')}#
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => this.arrangeListFun('SUPPLIER')}
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('Supplier')}
                            </Text>
                            <View>
                              <Image
                                style={{
                                  width: 13,
                                  height: 13,
                                  resizeMode: 'contain',
                                  marginLeft: 5,
                                }}
                                source={img.doubleArrowIconNew}
                              />
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => this.arrangeListFun('DATE')}
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {listId === 2
                                ? translate('Delivery date')
                                : translate('Order date')}
                            </Text>
                            <View>
                              <Image
                                style={{
                                  width: 13,
                                  height: 13,
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
                              width: wp('30%'),
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('HTVA')}
                            </Text>
                            <View>
                              <Image
                                style={{
                                  width: 13,
                                  height: 13,
                                  resizeMode: 'contain',
                                  marginLeft: 5,
                                }}
                                source={img.doubleArrowIconNew}
                              />
                            </View>
                          </TouchableOpacity>
                          {/* <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              {translate('Action')}
                            </Text>
                          </View> */}
                        </View>
                        <View>
                          {deliveryPendingData && deliveryPendingData.length > 0
                            ? deliveryPendingData.map((item, index) => {
                                return (
                                  <View
                                    style={{
                                      paddingVertical: 10,
                                      paddingHorizontal: 5,
                                      flexDirection: 'row',
                                      backgroundColor:
                                        index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                                    }}>
                                    <TouchableOpacity
                                      onPress={() => this.viewFun(item)}
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                      }}>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            textAlign: 'center',
                                            color: item.isRed ? 'red' : 'black',
                                          }}
                                          numberOfLines={1}>
                                          {item.orderReference}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          numberOfLines={1}
                                          style={{
                                            color: item.isRed ? 'red' : 'black',
                                          }}>
                                          {item.supplierName}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            color: item.isRed ? 'red' : 'black',
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
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            color: item.isRed ? 'red' : 'black',
                                          }}>
                                          €{' '}
                                          {item && Number(item.htva).toFixed(2)}
                                        </Text>
                                      </View>
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
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>
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
