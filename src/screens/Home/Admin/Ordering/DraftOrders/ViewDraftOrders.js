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
  deleteOrderApi,
  getBasketApi,
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';
import Modal from 'react-native-modal';
import LoaderComp from '../../../../../components/Loader';

import {translate} from '../../../../../utils/translations';

class ViewDraftOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      modalLoaderDrafts: true,
      draftsOrderData: [],
      supplierName: '',
      productId: '',
      totalHTVAVal: '',
      orderDate: '',
      deliveryDate: '',
      placedByName: '',
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
    const {supplierName, productId, basketId, placedByName} =
      this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          supplierName,
          productId,
          modalLoaderDrafts: true,
          basketId,
          placedByName,
        },
        () => this.getDraftOrderData(),
      );
    });
  }

  getDraftOrderData = () => {
    const {productId, basketId} = this.state;
    getBasketApi(basketId)
      .then(res => {
        this.setState({
          draftsOrderData: res.data.shopingBasketItemList,
          modalLoaderDrafts: false,
          totalHTVAVal: res.data.totalValue,
          orderDate: res.data.orderDate,
          deliveryDate: res.data.deliveryDate,
        });
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

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  editFun = () => {
    const {productId, basketId} = this.state;
    this.props.navigation.navigate('EditDraftOrderScreen', {
      productId,
      basketId,
    });
  };

  deleteFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.deleteFunSec(),
    );
  };

  deleteFunSec = () => {
    setTimeout(() => {
      Alert.alert('Grainz', 'Are you sure you want to delete this order?', [
        {
          text: 'Yes',
          onPress: () => this.hitDeleteApi(),
        },
        {
          text: 'No',
          style: 'cancel',
          onPress: () => this.closeLoaderComp(),
        },
      ]);
    }, 100);
  };

  closeLoaderComp = () => {
    this.setState({
      loaderCompStatus: false,
    });
  };

  hitDeleteApi = () => {
    const {draftsOrderData, productId} = this.state;
    let payload = draftsOrderData;
    deleteOrderApi(productId, payload)
      .then(res => {
        this.setState({
          loaderCompStatus: false,
        });
        Alert.alert('Grainz', 'Order deleted successfully', [
          {
            text: 'Okay',
            onPress: () =>
              this.props.navigation.navigate('OrderingAdminScreen'),
          },
        ]);
      })
      .catch(error => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalLoaderDrafts,
      draftsOrderData,
      supplierName,
      totalHTVAVal,
      orderDate,
      deliveryDate,
      placedByName,
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
        <LoaderComp loaderComp={loaderCompStatus} />
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>{supplierName}</Text>
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
          <View style={{}}>
            <View style={styles.firstContainer}>
              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => this.editFun()}>
                <View
                  style={{
                    color: '#523622',
                    paddingVertical: 8,
                    borderRadius: 15,
                    backgroundColor: '#94C036',
                    width: '55%',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={img.editIconNew}
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                      tintColor: '#fff',
                    }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.deleteFun()}
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                <View
                  style={{
                    color: '#523622',
                    paddingVertical: 8,
                    borderRadius: 15,
                    backgroundColor: 'red',
                    width: '55%',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={img.deleteIconNew}
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                      tintColor: '#fff',
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              marginTop: hp('3%'),
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
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
                  placeholder="Order Date"
                  value={orderDate && moment(orderDate).format('L')}
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              marginTop: hp('3%'),
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
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
                  placeholder="Delivery Date"
                  value={deliveryDate && moment(deliveryDate).format('L')}
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              marginTop: hp('3%'),
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
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
                  placeholder="Placed by"
                  value={placedByName}
                  editable={false}
                />
              </View>
            </View>
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('3%')}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      marginHorizontal: wp('4%'),
                    }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
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
                                  marginLeft: wp('5%'),
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
                                  marginLeft: wp('5%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#161C27',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  HTVA €
                                </Text>
                              </View>
                            </View>
                            {draftsOrderData &&
                              draftsOrderData.length > 0 &&
                              draftsOrderData.map((item, index) => {
                                return (
                                  <View>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        flex: 1,
                                        backgroundColor:
                                          index % 2 === 0
                                            ? '#FFFFFF'
                                            : '#F7F8F5',
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
                                        <Text
                                          style={{fontFamily: 'Inter-Regular'}}>
                                          {item.inventoryMapping &&
                                            item.inventoryMapping.productName}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          marginLeft: wp('5%'),
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
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          marginLeft: wp('5%'),
                                          justifyContent: 'center',
                                        }}>
                                        <Text>
                                          € {Number(item.value).toFixed(2)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                );
                              })}
                          </View>
                        </ScrollView>
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
                        }}>
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}></View>
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                          }}>
                          <Text style={{}}>Total HTVA</Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            marginLeft: wp('5%'),
                          }}>
                          <Text> € {Number(totalHTVAVal).toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
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

export default connect(mapStateToProps, {UserTokenAction})(ViewDraftOrders);
