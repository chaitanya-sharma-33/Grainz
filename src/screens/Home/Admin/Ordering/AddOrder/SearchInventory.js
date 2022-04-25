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
  unMapProductAdminApi,
  getInsideInventoryNewApi,
  addBasketApi,
  updateBasketApi,
  updateInventoryProductApi,
} from '../../../../../connectivity/api';
import CheckBox from '@react-native-community/checkbox';
import Modal from 'react-native-modal';
import styles from '../style';
import moment from 'moment';

import {translate} from '../../../../../utils/translations';

class SearchInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      sectionName: '',
      modalLoader: true,
      supplierId: '',
      modalData: [],
      catId: '',
      inventoryId: '',
      productId: '',
      finalBasketData: [],
      screenType: 'New',
      basketId: '',
      navigateType: '',
      supplierName: '',
      basketLoader: false,
      orderingThreeModal: false,
      pageData: '',
      viewModalStatus: false,
      todayDate: new Date(),
      privatePriceValue: '',
      privatePrice: true,
      discountPrice: false,
      discountPriceValue: '',
      priceFinalBackup: '',
      userDefinedUnit: '',
      modalDataBackUp: [],
      listLoader: false,
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
    const {
      searchType,
      searchData,
      supplierId,
      screenType,
      basketId,
      navigateType,
      supplierName,
    } = this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          searchType,
          searchData,
          supplierId,
          screenType,
          basketId,
          navigateType,
          supplierName,
        },
        () => this.getInsideCatFun(),
      );
    });
  }

  getInsideCatFun = () => {
    this.setState(
      {
        modalLoader: true,
      },
      () => this.getInsideCatFunSec(),
    );
  };

  getInsideCatFunSec = () => {
    const {searchData} = this.state;
    const finalArr = searchData;
    finalArr.forEach(function (item) {
      item.isSelected = false;
      item.quantityProduct = '';
      item.deltaNew = item.delta;
    });
    setTimeout(() => {
      this.setState({
        modalData: [...finalArr],
        modalDataBackUp: [...finalArr],
        modalLoader: false,
      });
    }, 500);
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  actionFun = data => {
    this.setState(
      {
        inventoryId: data.id,
        productId: data.productId,
        pageData: data,
      },
      () => this.unMapInventoryFun(),
    );
  };

  unMapInventoryFun = () => {
    Alert.alert('Grainz', 'Would you like to unmap this product?', [
      {
        text: 'Yes',
        onPress: () => this.hitUnMapApi(),
      },
      {
        text: 'No',
      },
    ]);
  };

  hitUnMapApi = () => {
    const {inventoryId, productId} = this.state;
    let payload = {
      inventoryId: inventoryId,
      productId: productId,
    };

    unMapProductAdminApi(payload)
      .then(res => {
        Alert.alert('Grainz', 'Product unmapped successfully', [
          {
            text: 'Okay',
            // onPress: () => this.getInsideCatFun(),
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  editQuantityFun = (index, type, data, valueType) => {
    this.setState(
      {
        inventoryId: data.id,
      },
      () => this.editQuantityFunSec(index, type, data, valueType),
    );
  };

  editQuantityFunSec = (index, type, data, valueType) => {
    if (valueType === 'add') {
      this.editQuantityFunThird(index, type, data, valueType);
    } else {
      if (data.quantityProduct > 0) {
        this.editQuantityFunThird(index, type, data, valueType);
      }
    }
  };

  editQuantityFunThird = (index, type, data, valueType) => {
    const valueSec =
      data.quantityProduct === '' ? Number(0) : Number(data.quantityProduct);
    const valueMinus = valueSec - Number(1);
    const valueAdd = Number(1) + valueSec;
    const value = valueType === 'add' ? valueAdd : valueMinus;
    const {modalData, screenType} = this.state;
    const deltaOriginal = Number(data.delta);
    const isSelectedValue = value !== '' && value > 0 ? true : false;
    const newDeltaVal =
      value !== ''
        ? Number(data.delta) - Number(value) * Number(data.volume)
        : deltaOriginal;

    let newArr = modalData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
            ['deltaNew']: newDeltaVal,
            ['isSelected']: isSelectedValue,
          }
        : item,
    );
    var filteredArray = newArr.filter(function (itm) {
      if (itm.quantityProduct !== '') {
        return itm.isSelected === true;
      }
    });
    const finalArr = [];
    filteredArray.map(item => {
      finalArr.push({
        inventoryId: item.id,
        inventoryProductMappingId: item.inventoryProductMappingId,
        unitPrice: item.productPrice,
        quantity: Number(item.quantityProduct),
        action:
          screenType === 'New'
            ? 'New'
            : screenType === 'Update'
            ? 'New'
            : 'String',
        value: Number(item.quantityProduct * item.productPrice * item.packSize),
      });
    });
    this.setState({
      modalData: [...newArr],
      finalBasketData: [...finalArr],
    });
  };

  addToBasketFun = () => {
    this.setState(
      {
        basketLoader: true,
      },
      () => this.addToBasketFunSec(),
    );
  };

  addToBasketFunSec = () => {
    const {
      finalBasketData,
      supplierId,
      screenType,
      basketId,
      navigateType,
      productId,
      supplierName,
    } = this.state;
    if (screenType === 'New') {
      if (finalBasketData.length > 0) {
        let payload = {
          supplierId: supplierId,
          shopingBasketItemList: finalBasketData,
        };
        addBasketApi(payload)
          .then(res => {
            this.setState(
              {
                basketLoader: false,
              },
              () => this.navigateToBasket(res),
            );
          })
          .catch(err => {
            Alert.alert(
              `Error - ${err.response.status}`,
              'Something went wrong',
              [
                {
                  text: 'Okay',
                },
              ],
            );
          });
      } else {
        Alert.alert('Grainz', 'Please add atleast one item', [
          {
            text: 'okay',
            onPress: () => this.closeBasketLoader(),
            style: 'default',
          },
        ]);
      }
    } else {
      let payload = {
        supplierId: supplierId,
        shopingBasketItemList: finalBasketData,
        id: basketId,
      };
      if (finalBasketData.length > 0) {
        updateBasketApi(payload)
          .then(res => {
            if (navigateType === 'EditDraft') {
              this.setState(
                {
                  basketLoader: false,
                },
                () => this.navigateToEditScreen(),
              );
            } else {
              this.setState(
                {
                  basketLoader: false,
                },
                () => this.navigateToBasket(res),
              );
            }
          })
          .catch(err => {
            Alert.alert(
              `Error - ${err.response.status}`,
              'Something went wrong',
              [
                {
                  text: 'Okay',
                },
              ],
            );
          });
      } else {
        Alert.alert('Grainz', 'Please add atleast one item', [
          {
            text: 'okay',
            onPress: () => this.closeBasketLoader(),
            style: 'default',
          },
        ]);
      }
    }
  };

  closeBasketLoader = () => {
    this.setState({
      basketLoader: false,
    });
  };

  navigateToEditScreen = () => {
    const {basketId, productId, supplierName} = this.state;
    this.props.navigation.navigate('EditDraftOrderScreen', {
      productId,
      basketId,
      supplierName,
    });
  };

  navigateToBasket = res => {
    const {supplierId, productId, supplierName} = this.state;
    this.props.navigation.navigate('BasketOrderScreen', {
      finalData: res.data && res.data.id,
      supplierId,
      itemType: 'Inventory',
      productId,
      supplierName,
    });
  };

  saveProductConfigFun = () => {
    const {
      userDefinedQuantity,
      pageData,
      userDefinedUnit,
      privatePriceValue,
      discountPriceValue,
    } = this.state;
    let payload = {
      discount: discountPriceValue,
      id: pageData.inventoryProductMappingId,
      privatePrice: privatePriceValue,
      userDefinedQuantity: userDefinedQuantity,
      userDefinedUnit: userDefinedUnit,
    };
    updateInventoryProductApi(payload)
      .then(res => {
        Alert.alert('Grainz', 'Inventory updated successfully', [
          {
            text: 'Oky',
            onPress: () =>
              this.setState(
                {
                  orderingThreeModal: false,
                },
                () => this.props.navigation.goBack(),
              ),
          },
        ]);
      })
      .catch(err => {
        console.log('err', err);
      });
  };

  viewInventoryFun = data => {
    this.setState(
      {
        pageData: data,
      },
      () => this.openViewModal(),
    );
  };

  openViewModal = () => {
    this.setState({
      viewModalStatus: true,
    });
  };

  changeDiscountFun = value => {
    const {priceFinalBackup} = this.state;
    this.setState(
      {
        discountPriceValue: value,
        priceFinal: priceFinalBackup,
      },
      () => this.changeDiscountFunSec(),
    );
  };

  changeDiscountFunSec = () => {
    const {priceFinalBackup, discountPriceValue, priceFinal} = this.state;

    const finalDiscountVal = priceFinalBackup * (discountPriceValue / 100);

    const finalPriceCal = priceFinalBackup - finalDiscountVal;

    if (discountPriceValue) {
      this.setState({
        priceFinal: finalPriceCal,
      });
    } else {
      this.setState({
        priceFinal: priceFinalBackup,
      });
    }
  };

  changePriceFun = value => {
    this.setState(
      {
        privatePriceValue: value,
        discountPriceValue: '',
      },
      () => this.changePriceFunSec(),
    );
  };

  changePriceFunSec = () => {
    const {privatePriceValue, priceFinalBackup, pageData} = this.state;

    const finalPriceCal = pageData.packSize * privatePriceValue;
    if (privatePriceValue) {
      this.setState({
        priceFinal: finalPriceCal,
      });
    } else {
      this.setState({
        priceFinal: priceFinalBackup,
      });
    }
  };

  openModalFun = item => {
    const priceFinal = item.productPrice * item.packSize;
    const finalDiscountVal = priceFinal * (item.discount / 100);

    const finalPriceCal = priceFinal - finalDiscountVal;
    let finalPrice =
      item && item.discount ? finalPriceCal : item.price * item.packSize;
    this.setState({
      orderingThreeModal: true,
      priceFinal: finalPrice,
      priceFinalBackup: item.productPrice * item.packSize,
      userDefinedQuantity: item.userDefinedQuantity,
      pageData: item,
      userDefinedUnit: item.userDefinedUnit,
      privatePriceValue: item.privatePrice,
      discountPriceValue: item.discount,
    });
  };

  searchFun = txt => {
    this.setState(
      {
        searchItem: txt,
        listLoader: true,
      },
      () =>
        setTimeout(() => {
          this.filterData(txt);
        }, 200),
    );
  };

  filterData = text => {
    //passing the inserted text in textinput
    const newData = this.state.modalDataBackUp.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      modalData: newData,
      searchItem: text,
      listLoader: false,
    });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      modalLoader,
      finalBasketData,
      screenType,
      productId,
      basketLoader,
      orderingThreeModal,
      pageData,
      viewModalStatus,
      todayDate,
      supplierName,
      priceFinal,
      privatePriceValue,
      privatePrice,
      discountPrice,
      userDefinedQuantity,
      discountPriceValue,
      userDefinedUnit,
      searchItem,
      listLoader,
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
                <Text style={styles.adminTextStyle}>Inventory</Text>
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
          {modalLoader ? null : (
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
                marginVertical: hp('2%'),
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
          )}
          {searchItem ? (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              {basketLoader ? (
                <View
                  style={{
                    height: hp('6%'),
                    width: wp('80%'),
                    backgroundColor: '#94C036',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                    borderRadius: 100,
                    marginBottom: hp('2%'),
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                    }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => this.addToBasketFun()}
                  style={{
                    height: hp('6%'),
                    width: wp('80%'),
                    backgroundColor: '#94C036',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                    borderRadius: 100,
                    marginBottom: hp('2%'),
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
                      {screenType === 'New'
                        ? translate('Add to basket')
                        : translate('Update basket')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {listLoader ? (
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
                    {searchItem ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        <View>
                          <View style={{marginTop: hp('2%')}}>
                            <View>
                              <View
                                style={{
                                  paddingVertical: 15,
                                  paddingHorizontal: 20,
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  backgroundColor: '#EFFBCF',
                                }}>
                                <View
                                  style={{
                                    width: wp('40%'),
                                  }}>
                                  <Text>{translate('Quantity')}</Text>
                                </View>

                                {/* <View
                            style={{
                              width: wp('40%'),
                              marginLeft: wp('5%'),
                            }}>
                            <Text>Name</Text>
                          </View> */}

                                <View
                                  style={{
                                    width: wp('30%'),
                                    marginLeft: wp('5%'),
                                  }}>
                                  <Text>{translate('Product Name')}</Text>
                                </View>
                                {/* <View
                            style={{
                              width: wp('30%'),
                              marginLeft: wp('5%'),
                            }}>
                            <Text>Stock</Text>
                          </View> */}
                                <View
                                  style={{
                                    width: wp('30%'),
                                    marginLeft: wp('5%'),
                                  }}>
                                  <Text>{translate('Price')}</Text>
                                </View>
                                {/* <View
                            style={{
                              width: wp('30%'),
                            }}>
                            <Text>In stock ?</Text>
                          </View> */}
                                {/* <View
                            style={{
                              width: wp('30%'),
                              marginLeft: wp('5%'),
                            }}></View> */}
                              </View>
                              <View>
                                {modalData.length > 0 ? (
                                  modalData.map((item, index) => {
                                    return (
                                      <View
                                        key={index}
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
                                            width: wp('40%'),
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                          }}>
                                          <TouchableOpacity
                                            onPress={() =>
                                              this.editQuantityFun(
                                                index,
                                                'quantityProduct',
                                                item,
                                                'minus',
                                              )
                                            }
                                            style={{
                                              backgroundColor: '#ED3833',
                                              width: 30,
                                              padding: 10,
                                              alignItems: 'center',
                                              marginRight: 2,
                                              borderRadius: 5,
                                            }}>
                                            <Text
                                              style={{
                                                color: '#fff',
                                              }}>
                                              -
                                            </Text>
                                          </TouchableOpacity>
                                          <TextInput
                                            placeholder="0"
                                            editable={false}
                                            keyboardType="number-pad"
                                            value={String(item.quantityProduct)}
                                            style={{
                                              borderWidth: 1,
                                              borderRadius: 5,
                                              padding: 10,
                                              width: wp('15%'),
                                            }}
                                            // onChangeText={value =>
                                            //   this.editQuantityFun(
                                            //     index,
                                            //     'quantityProduct',
                                            //     value,
                                            //     item,
                                            //   )
                                            // }
                                          />
                                          <TouchableOpacity
                                            onPress={() =>
                                              this.editQuantityFun(
                                                index,
                                                'quantityProduct',
                                                item,
                                                'add',
                                              )
                                            }
                                            style={{
                                              backgroundColor: '#94C036',
                                              width: 30,
                                              padding: 10,
                                              alignItems: 'center',
                                              marginLeft: 2,
                                              borderRadius: 5,
                                            }}>
                                            <Text
                                              style={{
                                                color: '#fff',
                                              }}>
                                              +
                                            </Text>
                                          </TouchableOpacity>
                                        </View>

                                        {/* <TouchableOpacity
                                    onPress={() =>
                                      this.viewInventoryFun(item)
                                    }
                                    style={{
                                      width: wp('40%'),
                                      marginLeft: wp('5%'),
                                      justifyContent: 'center',
                                    }}>
                                    <Text>{item.name}</Text>
                                    {item.deltaNew > 0 ? (
                                      <Text style={{color: 'red'}}>
                                        ( Δ{' '}
                                        {Number(item.deltaNew).toFixed(0)}{' '}
                                        {item.unit} )
                                      </Text>
                                    ) : (
                                      <Text style={{color: 'black'}}>
                                        ( Δ 0 {item.unit} )
                                      </Text>
                                    )}
                                  </TouchableOpacity> */}

                                        <TouchableOpacity
                                          onPress={() =>
                                            this.openModalFun(item)
                                          }
                                          style={{
                                            width: wp('30%'),
                                            marginLeft: wp('5%'),
                                            justifyContent: 'center',
                                          }}>
                                          <Text>{item.productName}</Text>
                                          {item.deltaNew > 0 ? (
                                            <Text
                                              style={{
                                                color: 'red',
                                                marginTop: 5,
                                              }}>
                                              ( Δ {item.deltaNew.toFixed(2)}{' '}
                                              {item.unit} )
                                            </Text>
                                          ) : (
                                            <Text
                                              style={{
                                                color: 'black',
                                                marginTop: 5,
                                              }}>
                                              ( Δ 0 {item.unit} )
                                            </Text>
                                          )}
                                        </TouchableOpacity>
                                        {/* <View
                                    style={{
                                      width: wp('30%'),
                                      marginLeft: wp('5%'),
                                      justifyContent: 'center',
                                    }}>
                                    <Text>
                                      {item.volume} {item.unit}
                                    </Text>
                                  </View> */}
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            justifyContent: 'center',
                                            marginLeft: wp('5%'),
                                          }}>
                                          <Text>
                                            {item.comparePrice} /{' '}
                                            {item.compareUnit}
                                          </Text>
                                        </View>

                                        {/* <View
                                    style={{
                                      width: wp('30%'),
                                      justifyContent: 'center',
                                    }}>
                                    <CheckBox
                                      disabled={true}
                                      value={item.isInStock}
                                      // onValueChange={() =>
                                      //   this.setState({htvaIsSelected: !htvaIsSelected})
                                      // }
                                      style={{
                                        height: 20,
                                        width: 20,
                                      }}
                                    />
                                  </View> */}
                                        {/* <TouchableOpacity
                                    onPress={() => this.actionFun(item)}
                                    style={{
                                      width: wp('30%'),
                                      marginLeft: wp('5%'),
                                      justifyContent: 'center',
                                    }}>
                                    <View
                                      style={{
                                        backgroundColor: '#94C036',
                                        padding: 10,
                                        alignItems: 'center',
                                        borderRadius: 5,
                                      }}>
                                      <Text
                                        style={{
                                          fontFamily: 'Inter-Regular',
                                          fontSize: 15,
                                          color: '#fff',
                                        }}>
                                        UnMap
                                      </Text>
                                    </View>
                                  </TouchableOpacity> */}
                                      </View>
                                    );
                                  })
                                ) : (
                                  <View style={{marginTop: hp('3%')}}>
                                    <Text
                                      style={{
                                        color: 'red',
                                        fontSize: 20,
                                      }}>
                                      {translate('No data available')}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    ) : null}
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          <Modal isVisible={orderingThreeModal} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('75%'),
                backgroundColor: '#F0F4FE',
                alignSelf: 'center',
                borderRadius: 14,
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
                    {translate('Product Configuration')}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        orderingThreeModal: false,
                        pageData: '',
                        priceFinal: '',
                        priceFinalBackup: '',
                        userDefinedQuantity: '',
                        userDefinedUnit: '',
                      })
                    }>
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
              <ScrollView
                style={{marginBottom: hp('5%')}}
                showsVerticalScrollIndicator={false}>
                <View style={{marginTop: hp('3%'), marginHorizontal: wp('5%')}}>
                  <View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Supplier :
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          editable={false}
                          value={supplierName}
                          placeholder="Supplier"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    {/* <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Product Code :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          editable={false}
                          value={pageData.productCode}
                          placeholder="Product Code"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View> */}
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          {translate('Product Name')} :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={pageData.productName}
                          editable={false}
                          placeholder="Product Name"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Pack Size:{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.packSize)}
                          editable={false}
                          placeholder="Pack Size"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          List Price :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={
                            String(pageData.productPrice) +
                            ' / ' +
                            String(pageData.productUnit)
                          }
                          editable={false}
                          placeholder="List Price"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Inventory Item:{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={pageData.name}
                          editable={false}
                          placeholder="Inventory Item"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Inventory Unit (default):{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={pageData.unit}
                          editable={false}
                          placeholder="Inventory Unit"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          {translate('Price')}:{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={`€ ${Number(priceFinal).toFixed(2)}`}
                          editable={false}
                          placeholder="Price"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          width: wp('30%'),
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: hp('2%'),
                        }}>
                        <View style={{}}>
                          <CheckBox
                            value={privatePrice}
                            onValueChange={() =>
                              this.setState({
                                privatePrice: !privatePrice,
                                discountPrice: false,
                                priceFinal: this.state.priceFinalBackup,
                                discountPriceValue: '',
                              })
                            }
                            style={{
                              backgroundColor: '#E9ECEF',
                              height: 20,
                              width: 20,
                            }}
                          />
                        </View>
                        <Text style={{marginLeft: 10}}>Private price: </Text>
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{marginRight: 5}}>€ </Text>
                        <TextInput
                          value={String(privatePriceValue)}
                          editable={privatePrice ? true : false}
                          keyboardType="number-pad"
                          style={{
                            padding: 10,
                            width: wp('45%'),
                            borderRadius: 5,
                            backgroundColor: privatePrice ? '#fff' : '#E9ECEF',
                          }}
                          onChangeText={value => this.changePriceFun(value)}
                        />
                        <Text style={{marginLeft: 5}}>STK</Text>
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          width: wp('30%'),
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: hp('2%'),
                        }}>
                        <View style={{}}>
                          <CheckBox
                            value={discountPrice}
                            onValueChange={() =>
                              this.setState({
                                discountPrice: !discountPrice,
                                privatePrice: false,
                                privatePriceValue: '',
                                priceFinal: this.state.priceFinalBackup,
                              })
                            }
                            style={{
                              backgroundColor: '#E9ECEF',
                              height: 20,
                              width: 20,
                            }}
                          />
                        </View>
                        <Text style={{marginLeft: 10}}>Discount: </Text>
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TextInput
                          value={String(discountPriceValue)}
                          editable={discountPrice ? true : false}
                          keyboardType="number-pad"
                          style={{
                            padding: 10,
                            width: wp('50%'),
                            borderRadius: 5,
                            backgroundColor: discountPrice ? '#fff' : '#E9ECEF',
                          }}
                          onChangeText={value => this.changeDiscountFun(value)}
                        />
                        <Text style={{marginLeft: 5}}>%</Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <View
                          style={{flexDirection: 'row', marginTop: hp('3%')}}>
                          <View style={{width: wp('40%')}}>
                            <Text>Order * 1</Text>
                          </View>
                          <View style={{width: wp('40%')}}>
                            <Text>{translate('Quantity')}</Text>
                          </View>
                          <View style={{width: wp('40%')}}>
                            <Text>Unit</Text>
                          </View>
                        </View>
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: hp('3%'),
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                              }}>
                              <Text>Grainz suggested: </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: wp('40%'),
                              }}>
                              <TextInput
                                value={String(pageData.grainzVolume)}
                                editable={false}
                                style={{
                                  padding: 10,
                                  width: wp('25%'),
                                  borderRadius: 5,
                                  backgroundColor: '#fff',
                                }}
                              />
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: wp('40%'),
                              }}>
                              <TextInput
                                value={pageData.grainzUnit}
                                editable={false}
                                style={{
                                  padding: 10,
                                  width: wp('25%'),
                                  borderRadius: 5,
                                  backgroundColor: '#fff',
                                }}
                              />
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: hp('3%'),
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                              }}>
                              <Text>User Defined: </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: wp('40%'),
                              }}>
                              <TextInput
                                value={String(userDefinedQuantity)}
                                style={{
                                  padding: 10,
                                  width: wp('25%'),
                                  borderRadius: 5,
                                  backgroundColor: '#fff',
                                }}
                                onChangeText={value =>
                                  this.setState({
                                    userDefinedQuantity: value,
                                  })
                                }
                              />
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: wp('40%'),
                              }}>
                              <TextInput
                                value={userDefinedUnit}
                                // editable={false}
                                style={{
                                  borderRadius: 5,
                                  backgroundColor: '#fff',
                                  padding: 10,
                                  width: wp('25%'),
                                }}
                                onChangeText={value =>
                                  this.setState({
                                    userDefinedUnit: value,
                                  })
                                }
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: wp('10%'),
                  }}>
                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          orderingThreeModal: false,
                          pageData: '',
                          priceFinal: '',
                          priceFinalBackup: '',
                          userDefinedQuantity: '',
                          userDefinedUnit: '',
                        })
                      }
                      style={{
                        height: hp('6%'),
                        width: wp('25%'),
                        backgroundColor: '#E7943B',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                        borderRadius: 5,
                      }}>
                      <View style={{}}>
                        <Text style={{color: 'white'}}>Cancel</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() => this.saveProductConfigFun()}
                      style={{
                        height: hp('6%'),
                        width: wp('25%'),
                        backgroundColor: '#94C036',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                        borderRadius: 5,
                      }}>
                      <View style={{}}>
                        <Text style={{color: 'white', marginLeft: 5}}>
                          Save
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
          <Modal isVisible={viewModalStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('75%'),
                backgroundColor: '#F0F4FE',
                alignSelf: 'center',
                borderRadius: 14,
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
                    {translate('Order Line Item')}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        viewModalStatus: false,
                        pageData: '',
                      })
                    }>
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
              <ScrollView
                style={{marginBottom: hp('5%')}}
                showsVerticalScrollIndicator={false}>
                <View style={{marginTop: hp('3%'), marginHorizontal: wp('5%')}}>
                  <View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Date :
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          editable={false}
                          value={moment(todayDate).format('L')}
                          placeholder="Date"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Supplier :
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          editable={false}
                          value={supplierName}
                          placeholder="Supplier"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    {/* <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Product Code :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          editable={false}
                          value={pageData.productCode}
                          placeholder="Product Code"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View> */}
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          {translate('Product Name')} :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={pageData.productName}
                          editable={false}
                          placeholder="Product Name"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Pack Size:{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.packSize)}
                          editable={false}
                          placeholder="Pack Size"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          {translate('Price')} :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={
                            String(pageData.productPrice) +
                            ' / ' +
                            String(pageData.productUnit)
                          }
                          editable={false}
                          placeholder="Price"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Order value :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={`€ ${Number(priceFinal).toFixed(2)}`}
                          editable={false}
                          placeholder="Price"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Inventory Item:{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={pageData.name}
                          editable={false}
                          placeholder="Inventory Item"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Inventory Unit (default):{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={pageData.unit}
                          editable={false}
                          placeholder="Inventory Unit"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Delta :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.delta)}
                          editable={false}
                          placeholder="Delta"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          This order :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.delta)}
                          editable={false}
                          placeholder="This order"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Current Level :{' '}
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.delta)}
                          editable={false}
                          placeholder="Current Level"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          On Order :
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.delta)}
                          editable={false}
                          placeholder="On Order"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        marginTop: hp('3%'),
                      }}>
                      <View
                        style={{
                          marginBottom: hp('2%'),
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                          Target :
                        </Text>
                      </View>
                      <View style={{}}>
                        <TextInput
                          value={String(pageData.reorderLevel)}
                          editable={false}
                          placeholder="Target"
                          style={{
                            padding: 10,
                            width: wp('70%'),
                            borderRadius: 5,
                            backgroundColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: wp('10%'),
                    justifyContent: 'center',
                  }}>
                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          viewModalStatus: false,
                          pageData: '',
                        })
                      }
                      style={{
                        height: hp('6%'),
                        width: wp('25%'),
                        backgroundColor: '#E7943B',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                        borderRadius: 5,
                      }}>
                      <View style={{}}>
                        <Text style={{color: 'white'}}>Close</Text>
                      </View>
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

export default connect(mapStateToProps, {UserTokenAction})(SearchInventory);
