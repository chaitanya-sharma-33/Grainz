import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../constants/images';
import SubHeader from '../../../../components/SubHeader';
import Header from '../../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getOrderingCountApi,
  draftOrderingApi,
  deliveryPendingApi,
  reviewOrderApi,
  historyOrderApi,
} from '../../../../connectivity/api';
import Modal from 'react-native-modal';
import moment from 'moment';

import {translate} from '../../../../utils/translations';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

class Ordering extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
      token: '',
      firstName: '',
      buttonsSubHeader: [],
      loader: true,
      countData: '',
      modalVisibleDraftOrder: false,
      modalLoaderDrafts: false,
      draftsOrderDataBackup: [],
      draftsOrderData: [],
      modalVisibleCommon: false,
      deliveryPendingData: [],
      deliveryPendingDataBackup: [],
      listId: '',
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
          firstName: res.data.firstName,
          loader: false,
          buttons: [
            {
              name: translate('New'),
              icon: img.addIcon,
              id: 0,
            },
            {
              name: translate('Draft Orders'),
              icon: img.addIcon,
              id: 1,
            },

            {
              name: translate('Pending Deliveries'),
              icon: img.addIcon,
              id: 2,
            },

            {
              name: translate('Review'),
              icon: img.addIcon,
              id: 3,
            },
            {
              name: translate('History'),
              icon: img.addIcon,
              id: 4,
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
        console.warn('ERr', err.response);
        this.setState({
          loader: false,
        });
      });
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  getOrderingData = () => {
    getOrderingCountApi()
      .then(res => {
        this.setState({
          countData: res.data,
        });
      })
      .catch(err => {
        console.warn('Err', err);
      });
  };

  componentDidMount() {
    this.getData();
    this.getOrderingData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  getDraftOrderData = () => {
    draftOrderingApi()
      .then(res => {
        this.setState({
          draftsOrderData: res.data,
          draftsOrderDataBackup: res.data,
          modalLoaderDrafts: false,
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  getDeliveryPendingData = () => {
    deliveryPendingApi()
      .then(res => {
        this.setState({
          deliveryPendingData: res.data,
          deliveryPendingDataBackup: res.data,
          modalLoaderDrafts: false,
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
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  onPressFun = id => {
    if (id === 0) {
      this.props.navigation.navigate('OrderingSecAdminScreen');
    } else if (id === 1) {
      this.setState(
        {
          modalVisibleDraftOrder: true,
          modalLoaderDrafts: true,
          listId: 1,
        },
        () => this.getDraftOrderData(),
      );
    } else if (id === 2) {
      this.setState(
        {
          modalVisibleCommon: true,
          modalLoaderDrafts: true,
          listId: 2,
        },
        () => this.getDeliveryPendingData(),
      );
    } else if (id === 3) {
      this.setState(
        {
          modalVisibleCommon: true,
          modalLoaderDrafts: true,
          listId: 3,
        },
        () => this.getReviewOrdersData(),
      );
    } else {
      this.setState(
        {
          modalVisibleCommon: true,
          modalLoaderDrafts: true,
          listId: 4,
        },
        () => this.getHistoryOrdersData(),
      );
    }
  };

  setModalVisibleFalse = visible => {
    this.setState({
      modalVisibleDraftOrder: visible,
      draftsOrderData: [],
      draftsOrderDataBackup: [],
      modalVisibleCommon: visible,
      deliveryPendingData: [],
      deliveryPendingDataBackup: [],
    });
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
    const newData = this.state.draftsOrderDataBackup.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.orderDate
        ? item.orderDate.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    console.warn('newData', newData);
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      draftsOrderData: newData,
      searchItem: text,
    });
  };

  render() {
    const {
      firstName,
      buttons,
      buttonsSubHeader,
      loader,
      countData,
      modalVisibleDraftOrder,
      searchItem,
      modalLoaderDrafts,
      draftsOrderData,
      modalVisibleCommon,
      deliveryPendingData,
      listId,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Header
          logout={firstName}
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="large" color="grey" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: '#412916',
              alignItems: 'center',
              paddingVertical: hp('3%'),
            }}>
            <Text style={{fontSize: 22, color: 'white'}}>
              {translate('Ordering').toLocaleUpperCase()}
            </Text>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            {buttons.map((item, index) => {
              return (
                <View style={{}} key={index}>
                  <TouchableOpacity
                    onPress={() => this.onPressFun(item.id)}
                    style={{
                      flexDirection: 'row',
                      height: hp('6%'),
                      width: wp('70%'),
                      backgroundColor: '#94C036',
                      alignItems: 'center',
                      marginTop: 20,
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        source={item.icon}
                        style={{
                          height: 22,
                          width: 22,
                          tintColor: 'white',
                          resizeMode: 'contain',
                          marginLeft: 15,
                        }}
                      />
                      <Text style={{color: 'white', marginLeft: 5}}>
                        {item.name}
                      </Text>
                    </View>

                    {item.id > 0 ? (
                      <View
                        style={{
                          backgroundColor: 'red',
                          marginRight: wp('6%'),
                          borderRadius: 20,
                          padding: 5,
                        }}>
                        {item.id === 1 ? (
                          <Text style={{color: '#fff', fontSize: 12}}>
                            {countData.draftOrdersCount}
                          </Text>
                        ) : item.id === 2 ? (
                          <Text style={{color: '#fff', fontSize: 12}}>
                            {countData.pendingOrdersCount}
                          </Text>
                        ) : item.id === 3 ? (
                          <Text style={{color: '#fff', fontSize: 12}}>
                            {countData.deliveredOrdersCount}
                          </Text>
                        ) : (
                          <Text style={{color: '#fff', fontSize: 12}}>
                            {countData.historyOrdersCount}
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Review/Deliveries/History Modal */}
          <Modal isVisible={modalVisibleCommon} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('80%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#412916',
                  height: hp('6%'),
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    flex: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 16, color: '#fff'}}>
                    {listId === 2
                      ? translate('Pending Deliveries')
                      : listId === 3
                      ? translate('Review')
                      : listId === 4
                      ? translate('History')
                      : null}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.setModalVisibleFalse(false)}>
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
              <ScrollView>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      padding: hp('3%'),
                    }}>
                    {/* <View
                      style={{
                        padding: hp('3%'),
                      }}>
                      <View style={{}}>
                        <View style={{}}>
                          <View style={{}}>
                            <Text style={{color: 'grey'}}>
                              {translate('Search')} :{' '}
                            </Text>
                          </View>
                        </View>
                        <TextInput
                          placeholder="Search"
                          value={searchItem}
                          style={{
                            flexDirection: 'row',
                            height: hp('5%'),
                            width: wp('70%'),
                            marginTop: 10,
                            paddingLeft: 10,
                            borderWidth: 1,
                            alignSelf: 'center',
                            borderColor: '#C9CCD7',
                          }}
                          // onChangeText={value => this.searchFun(value)}
                        />
                      </View>
                    </View> */}
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
                            borderWidth: 1,
                          }}>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text style={{textAlign: 'center'}}>Order#</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Supplier</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>
                              {listId === 2 ? 'Delivery date' : 'Order date'}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Total HTVA</Text>
                          </View>
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
                                    }}>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Text style={{textAlign: 'center'}}>
                                        {item.orderReference}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Text>{item.supplierName}</Text>
                                    </View>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Text>
                                        {moment(item.deliveryDate).format('L')}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Text>{item && item.htva}</Text>
                                    </View>
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

export default connect(mapStateToProps, {UserTokenAction})(Ordering);
