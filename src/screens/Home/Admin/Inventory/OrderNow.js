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
  getMappedProductsInventoryAdminApi,
  getDraftOrdersInventoryAdminApi,
  addOrderItemAdminApi,
} from '../../../../connectivity/api';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';

import styles from './style';

import {translate} from '../../../../utils/translations';

class InventorySec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      modalLoader: true,
      basketModal: false,
      draftData: [],
      draftLoader: false,
      indexValue: '',
      itemLoader: false,
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
    const {item} = this.props.route && this.props.route.params;
    this.setState(
      {
        finalName: item.name,
      },
      () => this.getMappedProductsFun(item.id),
    );
  }

  getMappedProductsFun = id => {
    getMappedProductsInventoryAdminApi(id)
      .then(res => {
        this.setState({
          modalData: res.data,
          modalLoader: false,
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

  addToBasketFun = (item, index) => {
    this.setState(
      {
        basketModal: true,
        draftLoader: true,
        indexValue: index,
      },
      () => this.getDraftOrdersFun(item.supplierId),
    );
  };

  getDraftOrdersFun = id => {
    getDraftOrdersInventoryAdminApi(id)
      .then(res => {
        this.setState({
          draftData: res.data,
          draftLoader: false,
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  closeModal = () => {
    this.setState({
      basketModal: false,
    });
  };

  addItemFun = item => {
    const {modalData, indexValue} = this.state;
    let payload = {
      inventoryId: modalData[indexValue].inventoryId,
      inventoryProductMappingId: modalData[indexValue].id,
      notes: null,
      orderId: item.id,
      quantityOrdered: modalData[indexValue].Quantity,
      unitPrice: modalData[indexValue].listPrice,
    };

    this.setState(
      {
        itemLoader: true,
      },
      () =>
        addOrderItemAdminApi(payload)
          .then(res => {
            this.setState(
              {
                basketModal: false,
                itemLoader: false,
              },
              () =>
                setTimeout(() => {
                  Alert.alert('Grainz', 'Item Added Successfully', [
                    {
                      text: 'Okay',
                      onPress: () => this.props.navigation.goBack(),
                    },
                  ]);
                }, 500),
            );
          })
          .catch(err => {
            console.log('erradd', err);
          }),
    );
  };

  editQuantityFun = (index, type, value) => {
    const {modalData} = this.state;

    let newArr = modalData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
          }
        : item,
    );
    this.setState({
      modalData: [...newArr],
    });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      finalName,
      modalLoader,
      basketModal,
      draftData,
      draftLoader,
      itemLoader,
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
                  {' '}
                  Mapped Products - {finalName}
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

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{}}>
              <ScrollView>
                {modalLoader ? (
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
                              }}>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>In Stock?</Text>
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
                                <Text>Code</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Name</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>{translate('Quantity')}</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>{translate('Price')}</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Preferred?</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>{translate('Quantity')}</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Action</Text>
                              </View>
                            </View>
                            <View>
                              {modalData && modalData.length > 0 ? (
                                modalData.map((item, index) => {
                                  return (
                                    <View
                                      key={index}
                                      style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 5,
                                        flexDirection: 'row',
                                        backgroundColor:
                                          index % 2 === 0
                                            ? '#FFFFFF'
                                            : '#F7F8F5',
                                      }}>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <CheckBox
                                          value={item.isInStock}
                                          // onValueChange={() =>
                                          //   this.setState({htvaIsSelected: !htvaIsSelected})
                                          // }
                                          style={{
                                            height: 20,
                                            width: 20,
                                          }}
                                        />
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text>{item.supplierName}</Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text>{item.productCode}</Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text>{item.productName}</Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text>
                                          {item.volume} {item.unit}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text>€ {item.comparePrice}</Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <CheckBox
                                          value={item.isPreferred}
                                          // onValueChange={() =>
                                          //   this.setState({htvaIsSelected: !htvaIsSelected})
                                          // }
                                          style={{
                                            height: 20,
                                            width: 20,
                                          }}
                                        />
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <TextInput
                                          placeholder="Quantity"
                                          style={{
                                            borderWidth: 1,
                                            paddingLeft: 10,
                                            width: wp('20%'),
                                            height: hp('5%'),
                                            borderRadius: 6,
                                          }}
                                          onChangeText={value =>
                                            this.editQuantityFun(
                                              index,
                                              'Quantity',
                                              value,
                                            )
                                          }
                                        />
                                      </View>
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.addToBasketFun(item, index)
                                        }
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          backgroundColor: '#94C036',
                                          justifyContent: 'center',
                                          borderRadius: 100,
                                        }}>
                                        <Text
                                          style={{
                                            color: '#fff',
                                            fontSize: 14,
                                            fontFamily: 'Inter-Regular',
                                          }}>
                                          {translate('Add to basket')}
                                        </Text>
                                      </TouchableOpacity>
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
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          <Modal isVisible={basketModal} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('70%'),
                backgroundColor: '#F0F4FE',
                alignSelf: 'center',
                borderRadius: 6,
              }}>
              <View
                style={{
                  backgroundColor: '#93BA3A',
                  height: hp('7%'),
                  flexDirection: 'row',
                  borderTopRightRadius: 6,
                  borderTopLeftRadius: 6,
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
                    {translate('Draft Orders')}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity onPress={() => this.closeModal()}>
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
                <View style={{padding: hp('3%')}}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {draftLoader ? (
                      <View
                        style={{
                          marginLeft: wp('30%'),
                        }}>
                        <ActivityIndicator size="large" color="#94C036" />
                      </View>
                    ) : (
                      <View>
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
                              }}>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}></View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#151B26',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  Supplier
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#151B26',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  Order Date
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#151B26',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  Delivery date
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('40%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#151B26',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  Action
                                </Text>
                              </View>
                            </View>
                            <View>
                              {draftData && draftData.length > 0 ? (
                                draftData.map((item, index) => {
                                  return (
                                    <View
                                      key={index}
                                      style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 5,
                                        flexDirection: 'row',
                                        backgroundColor:
                                          index % 2 === 0
                                            ? '#FFFFFF'
                                            : '#F7F8F5',
                                      }}>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <CheckBox
                                          value={item.checkedBy}
                                          // onValueChange={() =>
                                          //   this.setState({htvaIsSelected: !htvaIsSelected})
                                          // }
                                          style={{
                                            height: 20,
                                            width: 20,
                                          }}
                                        />
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            color: '#151B26',
                                            fontFamily: 'Inter-Regular',
                                          }}>
                                          {item.supplierName}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            color: '#151B26',
                                            fontFamily: 'Inter-Regular',
                                          }}>
                                          {item.orderDate}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            color: '#151B26',
                                            fontFamily: 'Inter-Regular',
                                          }}>
                                          {item.deliveryDate}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() => this.addItemFun(item)}
                                        style={{
                                          width: wp('40%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backgroundColor: '#94C036',
                                          height: hp('5%'),
                                          borderRadius: 100,
                                          marginLeft: wp('2%'),
                                        }}>
                                        {itemLoader ? (
                                          <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                          />
                                        ) : (
                                          <Text
                                            style={{
                                              fontSize: 14,
                                              color: '#fff',
                                              fontFamily: 'Inter-Regular',
                                            }}>
                                            Add item
                                          </Text>
                                        )}
                                      </TouchableOpacity>
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
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </ScrollView>
                </View>

                <View>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: hp('3%'),
                    }}>
                    <TouchableOpacity
                      onPress={() => this.closeModal()}
                      style={{
                        width: wp('50%'),
                        height: hp('5%'),
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

export default connect(mapStateToProps, {UserTokenAction})(InventorySec);
