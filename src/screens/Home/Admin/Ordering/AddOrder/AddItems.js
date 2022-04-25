import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
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
  getInventoryBySupplierIdApi,
  getSupplierCatalogApi,
  getInsideInventoryNewApi,
  searchInventoryItemLApi,
  getSupplierProductsApi,
  addBasketApi,
  updateBasketApi,
  updateInventoryProductApi,
  addDraftApi,
  getBasketApi,
} from '../../../../../connectivity/api';
import Accordion from 'react-native-collapsible/Accordion';
import styles from '../style';
import RNPickerSelect from 'react-native-picker-select';
import Modal from 'react-native-modal';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';
import {ARRAY} from '../../../../../constants/dummy';

import {translate} from '../../../../../utils/translations';

class AddItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      activeSections: ARRAY,
      SECTIONS: [],
      SECTIONS_HORIZONTAL: [],
      recipeLoader: true,
      sectionData: {},
      isMakeMeStatus: true,
      productionDate: '',
      recipeID: '',
      selectedItems: [],
      items: [],
      departmentName: '',
      itemTypes: '',
      loading: false,
      selectedItemObjects: '',
      buttonsSubHeader: [],
      finalName: '',
      SECTIONS_SEC_INVEN: [],
      modalVisibleSetup: false,
      modalData: [],
      modalLoader: false,
      modalSupplierLoader: false,
      sectionName: '',
      categoryLoader: false,
      supplierStatus: false,
      inventoryStatus: true,
      supplierId: '',
      screenType: '',
      basketId: '',
      SECTIONS_SEC_SUPP: [],
      supplierName: '',
      searchItemInventory: '',
      searchItemSupplier: '',
      searchLoader: false,
      listIndex: '',
      catId: '',
      catName: '',
      basketLoader: false,
      finalBasketData: [],
      orderingThreeModal: false,
      todayDate: new Date(),
      pageData: '',
      priceFinalBackup: '',
      priceFinal: '',
      privatePriceValue: '',
      privatePrice: true,
      discountPrice: false,
      discountPriceValue: '',
      apiOrderDate: new Date().toISOString(),
      apiDeliveryDate: '',
      placedByValue: '',
      finalApiData: [],
      SECTIONS_BACKUP: [],
      modalDataBackup: [],
      draftStatus: false,
      innerIndex: 0,
      closeStatus: false,
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
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  getManualLogsData = () => {
    this.setState(
      {
        modalLoader: true,
      },
      () => this.createFirstData(),
    );
  };

  getSupplierData = () => {
    this.setState(
      {
        modalSupplierLoader: true,
      },
      () => this.createSupplierData(),
    );
  };

  createSupplierData = () => {
    const {supplierId} = this.state;
    getSupplierCatalogApi(supplierId)
      .then(res => {
        let finalArray = res.data.map((item, index) => {
          return {
            title: item,
            content: item,
          };
        });

        const result = finalArray;

        this.setState({
          SECTIONS_HORIZONTAL: [...result],
          modalSupplierLoader: false,
          SECTIONS_SEC_SUPP: [...result],
        });
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            // onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  createFirstData = () => {
    const {supplierId} = this.state;
    getInventoryBySupplierIdApi(supplierId)
      .then(res => {
        let finalArray = res.data.map((item, index) => {
          return {
            title: item.name,
            content: item.id,
            departmentName: item.departmentName,
          };
        });
        const result = finalArray;
        this.setState({
          SECTIONS_HORIZONTAL: [...result],
          modalLoader: false,
          SECTIONS_SEC_INVEN: [...result],
        });
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            // onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  componentDidMount() {
    this.getData();
    this.props.navigation.addListener('focus', () => {
      const {supplierValue, screen, basketId, navigateType, supplierName} =
        this.props.route && this.props.route.params;
      this.setState(
        {
          supplierId: supplierValue,
          supplierStatus: false,
          inventoryStatus: true,
          screenType: screen,
          basketId,
          navigateType,
          departmentName: '',
          supplierName,
          searchItemInventory: '',
          searchItemSupplier: '',
          listIndex: '',
          SECTIONS: [],
          modalData: [],
        },
        () => this.getManualLogsData(),
      );
    });
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  _renderHeader = (section, index, isActive) => {
    const {innerIndex} = this.state;
    // console.log('innerIndex', innerIndex);

    const finalAmt = section.content.reduce(
      (n, {totalQuantity}) => n + totalQuantity,
      0,
    );
    // console.log('finalAmt', finalAmt);

    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: '#F0F0F0',
          borderLeftColor: '#F0F0F0',
          borderRightWidth: 1,
          borderRightColor: '#F0F0F0',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
          borderRadius: 6,
          justifyContent: 'space-around',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            style={{
              height: 18,
              width: 18,
              resizeMode: 'contain',
              marginLeft: wp('3%'),
            }}
            source={isActive ? img.upArrowIcon : img.arrowRightIcon}
          />
          <Text
            style={{
              color: '#492813',
              fontSize: 15,
              marginLeft: wp('2%'),
              fontFamily: 'Inter-Regular',
            }}>
            {section.title}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
          }}>
          {section.content[0] && section.content[0].deltaNew > 0 ? (
            <Text
              numberOfLines={1}
              style={{
                color: 'red',
                fontSize: 12,
                marginRight: wp('3%'),
                alignSelf: 'flex-end',
              }}>
              Δ {section.content[0] && section.content[0].deltaNew.toFixed(2)}{' '}
              {section.content[0] && section.content[0].unit}
            </Text>
          ) : (
            <Text
              style={{
                color: 'black',
                marginRight: wp('3%'),
                fontSize: 12,
                alignSelf: 'flex-end',
              }}>
              Δ 0 {section.content[0] && section.content[0].unit}
            </Text>
          )}
        </View>
        <View
          style={{
            flex: 0.8,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: 'black',
              fontSize: 12,
              marginRight: wp('3%'),
              alignSelf: 'flex-end',
            }}>
            Q: {finalAmt}
            {section.content[0] && section.content[0].unit}
          </Text>
        </View>
      </View>
    );
  };

  editQuantityFun = (index, type, data, valueType, section, value) => {
    this.setState(
      {
        inventoryId: data.id,
        innerIndex: index,
      },
      () =>
        this.editQuantityFunSec(index, type, data, valueType, section, value),
    );
  };

  editQuantityFunSec = (index, type, data, valueType, section, value) => {
    // console.log('vaaaaa', value);
    if (valueType === 'add') {
      this.editQuantityFunThird(index, type, data, valueType, section);
    } else if (valueType === 'minus') {
      if (data.quantityProduct > 0) {
        this.editQuantityFunThird(index, type, data, valueType, section);
      }
    } else if (valueType === 'input') {
      this.editQuantityFunFourth(index, type, data, valueType, section, value);
    }
  };

  editQuantityFunFourth = (
    index,
    type,
    data,
    valueType,
    section,
    valueData,
  ) => {
    // console.log('valueData', valueData);

    const {inventoryStatus, finalBasketData} = this.state;
    if (inventoryStatus) {
      const headerIndex = section.headerIndex;
      // const valueSec =
      //   data.quantityProduct === '' || valueData === ''
      //     ? Number(0)
      //     : Number(data.quantityProduct);
      // console.log('valueSec', valueSec);

      const valueMinus = Number(valueData);
      // console.log('valueMinus', valueMinus);

      const valueAdd = Number(valueData);
      // console.log('valueAdd', valueAdd);

      const value = valueType === 'input' ? valueAdd : valueMinus;
      // console.log('Value', value);
      const {screenType, SECTIONS, activeSections} = this.state;
      const deltaOriginal = Number(data.delta);
      const isSelectedValue = value !== '' && value > 0 ? true : false;
      const newDeltaVal =
        value !== ''
          ? Number(data.delta) - Number(value) * Number(data.volume)
          : deltaOriginal;
      const newAddTotalQuantity =
        Number(data.volume) * (data.quantityProduct === null ? 1 : valueData);
      // console.log('newAddTotalQuantity', newAddTotalQuantity);

      // const newMinusTotalQuantity =
      //   Number(data.volume) * (data.quantityProduct === null ? 1 : valueData);
      // console.log('newMinusTotalQuantity', newMinusTotalQuantity);

      const finalTotalQuantity = newAddTotalQuantity;
      // valueType === 'input' ? newAddTotalQuantity : newMinusTotalQuantity;
      // console.log('finalTotalQuantity', finalTotalQuantity);

      let newArr = section.content.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: value,
              ['isSelected']: isSelectedValue,
              ['deltaNew']: newDeltaVal,
              ['totalQuantity']: finalTotalQuantity,
            }
          : {
              ...item,
              ['deltaNew']: newDeltaVal,
              // ['totalQuantity']: finalTotalQuantity,
            },
      );

      let LastArr = SECTIONS.map((item, i) =>
        headerIndex === i
          ? {
              ...item,
              ['content']: newArr,
            }
          : {
              ...item,
            },
      );

      // console.log('LastArr--> ', LastArr);

      const finalArr = LastArr.map((item, index) => {
        const firstArr = item.content.filter(function (itm) {
          if (itm.quantityProduct !== '') {
            return itm.isSelected === true;
          }
        });
        return firstArr;
      });

      // console.log('finAAA', finalArr);

      var merged = [].concat.apply([], finalArr);
      // console.log('merged', merged);

      const basketArr = [];
      merged.map(item => {
        basketArr.push({
          id: item.orderItemId ? item.orderItemId : null,
          inventoryId: item.id,
          inventoryProductMappingId: item.inventoryProductMappingId,
          unitPrice: item.productPrice,
          quantity: Number(item.quantityProduct),
          action:
            screenType === 'New'
              ? 'New'
              : screenType === 'Update' && item.orderItemId !== null
              ? 'Update'
              : 'New',
          value: Number(
            item.quantityProduct * item.productPrice * item.packSize,
          ),
          headerIndex: headerIndex,
        });
      });

      // console.log('basketArr-->', basketArr);

      this.setState({
        SECTIONS: [...LastArr],
        finalBasketData: [...basketArr],
        draftStatus: false,
      });
    } else {
      const valueMinus = Number(valueData);
      // console.log('valueMinus-->', valueMinus);

      const valueAdd = Number(valueData);
      // console.log('valueAdd-->', valueAdd);

      const value = valueType === 'input' ? valueAdd : valueMinus;
      // console.log('value-->', value);

      const {modalData, screenType} = this.state;
      const isSelectedValue = value !== '' && value > 0 ? true : false;
      if (data.isMapped === true) {
        let newArr = modalData.map((item, i) =>
          index === i
            ? {
                ...item,
                [type]: value,
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
            id: item.orderItemId ? item.orderItemId : null,
            inventoryId:
              item.inventoryMapping && item.inventoryMapping.inventoryId,
            inventoryProductMappingId:
              item.inventoryMapping && item.inventoryMapping.id,
            unitPrice: item.price,
            quantity: Number(item.quantityProduct),
            action:
              screenType === 'New'
                ? 'New'
                : screenType === 'Update' && item.orderItemId !== null
                ? 'Update'
                : 'New',
            value: Number(item.quantityProduct * item.price * item.packSize),
          });
        });
        this.setState({
          modalData: [...newArr],
          modalDataBackup: [...newArr],
          finalBasketData: [...finalArr],
          draftStatus: false,
        });
      }
    }
  };

  editQuantityFunThird = (index, type, data, valueType, section) => {
    const {inventoryStatus, finalBasketData} = this.state;
    if (inventoryStatus) {
      const headerIndex = section.headerIndex;
      const valueSec =
        data.quantityProduct === '' ? Number(0) : Number(data.quantityProduct);
      // console.log('valueSec--> ', valueSec);

      const valueMinus = valueSec - Number(1);
      // console.log('valueMinus--> ', valueMinus);

      const valueAdd = Number(1) + valueSec;
      // console.log('valueAdd--> ', valueAdd);

      const value = valueType === 'add' ? valueAdd : valueMinus;
      // console.log('value--> ', value);

      const {screenType, SECTIONS, activeSections} = this.state;
      const deltaOriginal = Number(data.delta);
      const isSelectedValue = value !== '' && value > 0 ? true : false;
      const newDeltaVal =
        value !== ''
          ? Number(data.delta) - Number(value) * Number(data.volume)
          : deltaOriginal;
      const newAddTotalQuantity =
        Number(data.volume) *
        (data.quantityProduct === null ? 1 : Number(data.quantityProduct) + 1);

      const newMinusTotalQuantity =
        Number(data.totalQuantity) - Number(data.volume);

      const finalTotalQuantity =
        valueType === 'add' ? newAddTotalQuantity : newMinusTotalQuantity;

      // console.log('data.quantityProduct', data.quantityProduct);
      // console.log('newTotalQuantity', newTotalQuantity);
      // console.log(' Number(data.volume)', Number(data.volume));

      let newArr = section.content.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: value,
              ['isSelected']: isSelectedValue,
              ['deltaNew']: newDeltaVal,
              ['totalQuantity']: finalTotalQuantity,
            }
          : {
              ...item,
              ['deltaNew']: newDeltaVal,
              // ['totalQuantity']: finalTotalQuantity,
            },
      );

      let LastArr = SECTIONS.map((item, i) =>
        headerIndex === i
          ? {
              ...item,
              ['content']: newArr,
            }
          : {
              ...item,
            },
      );

      // console.log('LastArr--> ', LastArr);

      const finalArr = LastArr.map((item, index) => {
        const firstArr = item.content.filter(function (itm) {
          if (itm.quantityProduct !== '') {
            return itm.isSelected === true;
          }
        });
        return firstArr;
      });

      // console.log('finAAA', finalArr);

      var merged = [].concat.apply([], finalArr);
      // console.log('merged', merged);

      const basketArr = [];
      merged.map(item => {
        basketArr.push({
          id: item.orderItemId ? item.orderItemId : null,
          inventoryId: item.id,
          inventoryProductMappingId: item.inventoryProductMappingId,
          unitPrice: item.productPrice,
          quantity: Number(item.quantityProduct),
          action:
            screenType === 'New'
              ? 'New'
              : screenType === 'Update' && item.orderItemId !== null
              ? 'Update'
              : 'New',
          value: Number(
            item.quantityProduct * item.productPrice * item.packSize,
          ),
          headerIndex: headerIndex,
        });
      });

      // console.log('basketArr-->', basketArr);

      this.setState({
        SECTIONS: [...LastArr],
        finalBasketData: [...basketArr],
        draftStatus: false,
      });
    } else {
      const valueSec =
        data.quantityProduct === '' ? Number(0) : Number(data.quantityProduct);
      const valueMinus = valueSec - Number(1);
      const valueAdd = Number(1) + valueSec;
      const value = valueType === 'add' ? valueAdd : valueMinus;
      const {modalData, screenType} = this.state;
      const isSelectedValue = value !== '' && value > 0 ? true : false;
      if (data.isMapped === true) {
        let newArr = modalData.map((item, i) =>
          index === i
            ? {
                ...item,
                [type]: value,
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
            id: item.orderItemId ? item.orderItemId : null,
            inventoryId:
              item.inventoryMapping && item.inventoryMapping.inventoryId,
            inventoryProductMappingId:
              item.inventoryMapping && item.inventoryMapping.id,
            unitPrice: item.price,
            quantity: Number(item.quantityProduct),
            action:
              screenType === 'New'
                ? 'New'
                : screenType === 'Update' && item.orderItemId !== null
                ? 'Update'
                : 'New',
            value: Number(item.quantityProduct * item.price * item.packSize),
          });
        });
        this.setState({
          modalData: [...newArr],
          modalDataBackup: [...newArr],
          finalBasketData: [...finalArr],
          draftStatus: false,
        });
      }
    }
  };

  _renderContent = section => {
    // console.log('sec', section);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{backgroundColor: '#fff'}}>
          {section.content.map((item, index) => {
            return (
              <View
                style={{
                  paddingHorizontal: 10,
                  marginBottom:
                    index === section.content.length - 1 ? 30 : null,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{width: wp('25%')}}>
                    <TouchableOpacity
                      onPress={() => this.openModalFun(item)}
                      style={{
                        width: wp('25%'),
                        marginLeft: wp('3%'),
                      }}>
                      <Text>{item.productName}</Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                        }}>
                        ( {item.volume} {item.unit} )
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      width: wp('25%'),
                      justifyContent: 'center',
                      marginLeft: wp('6%'),
                    }}>
                    <Text>
                      {item.comparePrice} / {item.compareUnit}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderRadius: 5,
                      height: hp('5%'),
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        this.editQuantityFun(
                          index,
                          'quantityProduct',
                          item,
                          'minus',
                          section,
                        )
                      }
                      style={{
                        width: wp('10%'),
                        height: hp('5%'),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{}}>-</Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        width: wp('10%'),
                        height: hp('5%'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRightWidth: 1,
                        borderLeftWidth: 1,
                      }}>
                      <TextInput
                        placeholder="0"
                        keyboardType="number-pad"
                        value={
                          item.quantityProduct
                            ? String(item.quantityProduct)
                            : ''
                        }
                        style={{
                          width: wp('10%'),
                          height: hp('5%'),
                          paddingLeft: 6,
                        }}
                        onChangeText={value =>
                          this.editQuantityFun(
                            index,
                            'quantityProduct',
                            item,
                            'input',
                            section,
                            value,
                          )
                        }
                      />
                      {/* <Text style={{color: 'black', fontSize: 15}}>
                        {item.quantityProduct > 0
                          ? String(item.quantityProduct)
                          : 0}
                      </Text> */}
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        this.editQuantityFun(
                          index,
                          'quantityProduct',
                          item,
                          'add',
                          section,
                        )
                      }
                      style={{
                        width: wp('10%'),
                        height: hp('5%'),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{color: 'black', fontSize: 15}}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      marginLeft: wp('20%'),
                      fontWeight: 'bold',
                      fontSize: 16,
                      color: 'grey',
                    }}>
                    {item.notes}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
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
                () => this.getInsideInventoryFun(),
              ),
          },
        ]);
      })
      .catch(err => {
        console.log('err', err);
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

  _updateSections = activeSections => {
    this.setState({
      activeSections,
    });
  };

  setAdminModalVisible = visible => {
    this.setState({
      modalVisibleSetup: visible,
    });
  };

  // hitInventorySearch = () => {
  //   this.setState(
  //     {
  //       searchLoader: true,
  //     },
  //     () => this.hitSearchApiInventory(),
  //   );
  // };

  // hitSearchApiInventory = txt => {
  //   const {
  //     supplierId,
  //     searchItemInventory,
  //     screenType,
  //     basketId,
  //     navigateType,
  //     supplierName,
  //   } = this.state;
  //   searchInventoryItemLApi(supplierId, searchItemInventory)
  //     .then(res => {
  //       this.setState(
  //         {
  //           searchLoader: false,
  //         },
  //         () =>
  //           this.props.navigation.navigate('SearchInventoryScreen', {
  //             searchType: 'Inventory',
  //             searchData: res.data,
  //             supplierId,
  //             screenType,
  //             basketId,
  //             navigateType,
  //             supplierName,
  //           }),
  //       );
  //     })
  //     .catch(err => {
  //       Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
  //         {
  //           text: 'Okay',
  //           onPress: () => this.props.navigation.goBack(),
  //         },
  //       ]);
  //     });
  // };

  // hitSupplierSearch = () => {
  //   this.setState(
  //     {
  //       searchLoader: true,
  //     },
  //     () =>
  //       setTimeout(() => {
  //         this.hitSearchApiSupplier();
  //       }, 300),
  //   );
  // };

  // hitSearchApiSupplier = () => {
  //   const {
  //     supplierId,
  //     searchItemSupplier,
  //     screenType,
  //     basketId,
  //     navigateType,
  //     supplierName,
  //   } = this.state;
  //   this.setState(
  //     {
  //       searchLoader: false,
  //     },
  //     () =>
  //       this.props.navigation.navigate('SearchSupplierScreen', {
  //         searchType: 'Supplier',
  //         supplierId,
  //         screenType,
  //         basketId,
  //         navigateType,
  //         supplierName,
  //         searchItemSupplier,
  //       }),
  //   );
  // };

  inventoryFun = () => {
    this.setState(
      {
        supplierStatus: false,
        inventoryStatus: true,
        activeSections: [],
        searchItemSupplier: '',
        SECTIONS: [],
        modalData: [],
        listIndex: '',
      },
      () => this.getManualLogsData(),
    );
  };

  supplierFun = () => {
    this.setState(
      {
        supplierStatus: true,
        inventoryStatus: false,
        activeSections: [],
        searchItemInventory: '',
        SECTIONS: [],
        modalData: [],
        listIndex: '',
      },
      () => this.getSupplierData(),
    );
  };

  selectDepartementNameFun = value => {
    this.setState(
      {
        departmentName: value,
      },
      () => this.filterDepartmentData(value),
    );
  };

  filterDepartmentData = value => {
    this.filterDataDepartmentName(value);
  };

  filterDataDepartmentName = value => {
    console.log('VALUE', value);
    //passing the inserted text in textinput
    const newData = this.state.SECTIONS_SEC_INVEN.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.departmentName
        ? item.departmentName.toUpperCase()
        : ''.toUpperCase();
      const textData = value !== null ? value.toUpperCase() : '';
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      SECTIONS_HORIZONTAL: newData,
      SECTIONS: [],
      listIndex: '',
    });
  };

  onPressInventoryFun = (item, index) => {
    this.setState(
      {
        listIndex: index,
      },
      () => this.navigateSubFun(item),
    );
  };

  addToBasketFunHorizontal = () => {
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
      console.log('NEWWW_HORIZONTAL');
      let payload = {
        supplierId: supplierId,
        shopingBasketItemList: finalBasketData,
      };
      // console.log('Payload--> New', payload);
      addBasketApi(payload)
        .then(res => {
          this.setState(
            {
              basketId: res.data && res.data.id,
            },
            () => this.getBasketDataFun(),
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
      let payload = {
        supplierId: supplierId,
        shopingBasketItemList: finalBasketData,
        id: basketId,
      };
      console.log('UPDATEEE_HORIZONTAL');
      // console.log('Payload--> ELSE', payload);
      updateBasketApi(payload)
        .then(res => {
          if (navigateType === 'EditDraft') {
            this.setState(
              {
                basketLoader: false,
              },
              () => this.navigateToEditDraft(res),
            );
          } else {
            this.setState(
              {
                basketLoader: false,
                draftStatus: true,
              },
              () => this.navigateToBasket(),
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
                onPress: () =>
                  this.setState({
                    basketLoader: false,
                  }),
              },
            ],
          );
        });
    }
  };

  navigateSubFun = item => {
    const {inventoryStatus, finalBasketData, supplierId} = this.state;
    if (finalBasketData.length > 0) {
      console.log('addToBasketFunHorizontal-->');
      this.addToBasketFunHorizontal();
    }
    if (inventoryStatus) {
      const {
        SECTIONS,
        activeSections,
        supplierId,
        screenType,
        basketId,
        navigateType,
        supplierName,
      } = this.state;
      const catId = item.content;
      const catName = item.title;

      this.setState(
        {
          supplierId,
          catName,
          catId,
          screenType,
          basketId,
          navigateType,
          finalBasketData: [],
          supplierName,
        },
        () => this.getInsideInventoryFun(),
      );
    } else {
      const {
        supplierId,
        SECTIONS,
        activeSections,
        screenType,
        basketId,
        navigateType,
        supplierName,
      } = this.state;
      const catName = item.title;
      this.setState(
        {
          supplierId,
          catName,
          screenType,
          basketId,
          navigateType,
          finalBasketData: [],
          supplierName,
        },
        () => this.getInsideSupplierFun(),
      );
    }
  };

  getInsideInventoryFun = () => {
    const {catId, supplierId, basketId} = this.state;
    const finalBasketId = basketId ? basketId : null;
    this.setState(
      {
        modalLoader: true,
      },
      () =>
        getInsideInventoryNewApi(catId, supplierId, finalBasketId)
          .then(res => {
            // console.log('res', res);
            const finalArr = res.data;
            finalArr.forEach(function (item) {
              item.isSelected = item.quantityProduct ? true : false;
              item.quantityProduct = item.quantityProduct;
              item.deltaNew = item.delta;
              item.totalQuantity = null;
            });

            this.setState(
              {
                modalData: [...finalArr],
              },
              () => this.createDataFun(),
            );
          })
          .catch(err => {
            Alert.alert(
              `Error - ${err.response.status}`,
              'Something went wrong',
              [
                {
                  text: 'Okay',
                  // onPress: () => this.props.navigation.goBack(),
                },
              ],
            );
          }),
    );
  };

  createDataFun = () => {
    const {modalData} = this.state;
    function extract() {
      var groups = {};

      modalData.forEach(function (val) {
        var date = val.name;
        if (date in groups) {
          groups[date].push(val);
        } else {
          groups[date] = new Array(val);
        }
      });

      return groups;
    }

    let final = extract();

    // console.log('fina', final);

    // function dynamicSort(property) {
    //   var sortOrder = 1;

    //   if (property[0] === '-') {
    //     sortOrder = -1;
    //     property = property.substr(1);
    //   }

    //   return function (a, b) {
    //     if (sortOrder == -1) {
    //       return b[property].localeCompare(a[property]);
    //     } else {
    //       return a[property].localeCompare(b[property]);
    //     }
    //   };
    // }

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

    let finalArray = Object.keys(final).map((item, index) => {
      // console.log('finaIT---', final[item]);
      return {
        headerIndex: index,
        title: item,
        content: final[item].sort(dynamicSort('comparePrice')),
      };
    });

    this.setState({
      SECTIONS: [...finalArray],
      SECTIONS_BACKUP: [...finalArray],
      modalLoader: false,
    });
  };

  getInsideSupplierFun = () => {
    const {supplierId, catName, basketId} = this.state;
    const finalBasketId = basketId ? basketId : null;
    this.setState(
      {
        modalSupplierLoader: true,
      },
      () =>
        getSupplierProductsApi(supplierId, catName, finalBasketId)
          .then(res => {
            const finalArr = res.data;
            finalArr.forEach(function (item) {
              item.isSelected = item.quantityProduct ? true : false;
              item.quantityProduct = item.quantityProduct;
            });

            this.setState({
              modalData: [...finalArr],
              modalDataBackup: [...finalArr],
              modalSupplierLoader: false,
            });
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
          }),
    );
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
      console.log('NEWWW');
      if (finalBasketData.length > 0) {
        let payload = {
          supplierId: supplierId,
          shopingBasketItemList: finalBasketData,
        };
        // console.log('Payload--> New', payload);
        addBasketApi(payload)
          .then(res => {
            this.setState(
              {
                basketId: res.data && res.data.id,
              },
              () => this.getBasketDataFun(),
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
      console.log('UPDATEEE');
      // console.log('Payload--> ELSE', payload);
      if (finalBasketData.length > 0 || basketId) {
        updateBasketApi(payload)
          .then(res => {
            if (navigateType === 'EditDraft') {
              this.setState(
                {
                  basketLoader: false,
                },
                () => this.navigateToEditDraft(res),
              );
            } else {
              this.setState(
                {
                  basketLoader: false,
                  draftStatus: true,
                },
                () => this.navigateToBasket(),
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
                  onPress: () =>
                    this.setState({
                      basketLoader: false,
                    }),
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

  getBasketDataFun = () => {
    const {basketId} = this.state;
    getBasketApi(basketId)
      .then(res => {
        // console.log('res', res);
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
            // onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  createApiData = () => {
    const {modalData} = this.state;
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
    this.setState(
      {
        finalApiData: [...finalArr],
      },
      () => this.saveDraftFun(),
    );
  };

  navigateToEditDraft = res => {
    const {basketId, productId, supplierName} = this.state;
    this.props.navigation.navigate('EditDraftOrderScreen', {
      productId,
      basketId,
      supplierName,
    });
  };

  closeBasketLoader = () => {
    this.setState({
      basketLoader: false,
    });
  };

  navigateToBasket = () => {
    const {supplierId, productId, supplierName, basketId, closeStatus} =
      this.state;
    if (closeStatus) {
      this.props.navigation.navigate('BasketOrderScreen', {
        finalData: basketId,
        supplierId,
        itemType: 'Inventory',
        productId,
        supplierName,
      });
    }
  };

  saveDraftFun = () => {
    const {
      apiDeliveryDate,
      apiOrderDate,
      placedByValue,
      supplierId,
      basketId,
      finalApiData,
    } = this.state;
    let payload = {
      id: basketId,
      supplierId: supplierId,
      orderDate: apiOrderDate,
      deliveryDate: apiDeliveryDate,
      placedBy: placedByValue,
      shopingBasketItemList: finalApiData,
    };

    // console.log('Payload', payload);
    addDraftApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
            basketLoader: false,
            draftStatus: true,
            screenType: 'Update',
          },
          () => this.navigateToBasket(),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            // onPress: () => this.closeLoaderComp(),
          },
        ]);
      });
  };

  searchFunInventory = txt => {
    this.setState(
      {
        searchItemInventory: txt,
      },
      () => this.filterDataInventory(txt),
    );
  };

  filterDataInventory = text => {
    //passing the inserted text in textinput
    const newData = this.state.SECTIONS_BACKUP.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      SECTIONS: newData,
      searchItemInventory: text,
    });
  };

  searchFunSupplier = txt => {
    this.setState(
      {
        searchItemSupplier: txt,
      },
      () => this.filterDataSupplier(txt),
    );
  };

  filterDataSupplier = text => {
    //passing the inserted text in textinput
    const newData = this.state.modalDataBackup.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      modalData: newData,
      searchItemSupplier: text,
    });
  };

  closeBasketFun = () => {
    this.setState(
      {
        closeStatus: true,
      },
      () => this.closeBasketFunSec(),
    );
  };

  closeBasketFunSec = () => {
    const {
      supplierId,
      productId,
      supplierName,
      basketId,
      draftStatus,
      finalBasketData,
    } = this.state;

    if (draftStatus) {
      this.props.navigation.navigate('BasketOrderScreen', {
        finalData: basketId,
        supplierId,
        itemType: 'Inventory',
        productId,
        supplierName,
      });
    } else {
      this.saveChangesFun();
    }
  };

  saveChangesFun = () => {
    this.addToBasketFun();
  };

  render() {
    const {
      recipeLoader,
      SECTIONS,
      activeSections,
      buttonsSubHeader,
      supplierStatus,
      inventoryStatus,
      searchItemInventory,
      modalLoader,
      modalSupplierLoader,
      screenType,
      basketId,
      departmentName,
      searchItemSupplier,
      searchLoader,
      listIndex,
      SECTIONS_HORIZONTAL,
      modalData,
      basketLoader,
      orderingThreeModal,
      todayDate,
      supplierName,
      pageData,
      priceFinal,
      privatePrice,
      privatePriceValue,
      discountPrice,
      discountPriceValue,
      userDefinedQuantity,
      userDefinedUnit,
      finalBasketData,
      modalDataBackup,
      innerIndex,
      draftStatus,
      SECTIONS_SEC_INVEN,
    } = this.state;

    console.log('SECTIONS_SEC_INVEN', SECTIONS_SEC_INVEN);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator color="#94C036" size="small" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Order/Product List')}
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
          <View style={{}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: wp('8%'),
                marginVertical: hp('2%'),
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => this.inventoryFun()}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderBottomColor: inventoryStatus ? '#82A72F' : '#D8DCE6',
                  borderBottomWidth: 3,
                  paddingBottom: 5,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: inventoryStatus
                      ? 'Inter-Regular'
                      : 'Inter-SemiBold',
                    color: inventoryStatus ? '#82A72F' : '#D8DCE6',
                  }}>
                  {translate('InventoryList')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.supplierFun()}
                style={{
                  flex: 1,
                  borderBottomColor: supplierStatus ? '#82A72F' : '#D8DCE6',
                  borderBottomWidth: 3,
                  paddingBottom: 5,
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 18,
                    fontFamily: supplierStatus
                      ? 'Inter-Regular'
                      : 'Inter-SemiBold',
                    color: supplierStatus ? '#82A72F' : '#D8DCE6',
                  }}>
                  {translate('Supplier catalog')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {inventoryStatus ? (
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 100,
                backgroundColor: '#fff',
                marginHorizontal: wp('5%'),
                marginVertical: hp('2%'),
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  width: wp('80%'),
                  height: hp('6%'),
                }}>
                <RNPickerSelect
                  placeholder={{
                    label: 'All',
                    value: null,
                    color: 'black',
                  }}
                  onValueChange={value => {
                    this.selectDepartementNameFun(value);
                  }}
                  style={{
                    inputIOS: {
                      fontSize: 14,
                      paddingHorizontal: '5%',
                      color: '#161C27',
                      width: '100%',
                      alignSelf: 'center',
                      paddingVertical: 15,
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
                  items={[
                    {
                      label: 'Bar',
                      value: 'Bar',
                    },
                    {
                      label: 'Kitchen',
                      value: 'Kitchen',
                    },
                    {
                      label: 'Retail',
                      value: 'Retail',
                    },
                    {
                      label: 'Other',
                      value: 'Other',
                    },
                  ]}
                  value={departmentName}
                  useNativeAndroidPickerStyle={false}
                />
              </View>
              <View style={{marginRight: wp('5%')}}>
                <Image
                  source={img.arrowDownIcon}
                  resizeMode="contain"
                  style={{
                    height: 18,
                    width: 18,
                    resizeMode: 'contain',
                    marginTop: Platform.OS === 'ios' ? 15 : 15,
                  }}
                />
              </View>
            </View>
          ) : null}

          <View style={{marginTop: hp('2%'), marginHorizontal: wp('5%')}}>
            <ScrollView horizontal style={{}}>
              {SECTIONS_HORIZONTAL.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => this.onPressInventoryFun(item, index)}
                    style={{
                      borderRadius: 50,
                      backgroundColor:
                        index === listIndex ? '#412916' : '#94C01F',
                      height: hp('5%'),
                      marginRight: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 15,
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 12,
                      }}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* {SECTIONS.length > 0 || modalData.length > 0 ? (
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
                    <ActivityIndicator color="#fff" size="small" />
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
          ) : null} */}

          {SECTIONS.length > 0 || modalData.length > 0 ? (
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
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => this.closeBasketFun()}
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
                      {translate('Save')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {SECTIONS.length > 0 || modalData.length > 0 ? (
            <View>
              {inventoryStatus ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: hp('7%'),
                    width: wp('90%'),
                    alignSelf: 'center',
                    marginVertical: hp('2%'),
                    borderRadius: 100,
                    backgroundColor: '#fff',
                  }}>
                  <TextInput
                    placeholder="Search"
                    value={searchItemInventory}
                    style={{
                      padding: 15,
                      width: wp('75%'),
                    }}
                    onChangeText={value => this.searchFunInventory(value)}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        searchItemInventory: '',
                      })
                    }
                    style={{
                      marginLeft: wp('3%'),
                      padding: 10,
                    }}>
                    <Image
                      source={img.crossIcon}
                      style={{
                        height: 15,
                        width: 15,
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                  {/* 
              <TouchableOpacity
                onPress={() => this.hitInventorySearch()}
                style={{
                  backgroundColor: '#94C036',
                  padding: 13,
                  borderTopRightRadius: 100,
                  borderBottomRightRadius: 100,
                  marginLeft: 5,
                }}>
                {searchLoader ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Image
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                      marginRight: wp('5%'),
                      tintColor: '#fff',
                    }}
                    source={img.searchIcon}
                  />
                )}
              </TouchableOpacity> */}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: hp('7%'),
                    width: wp('90%'),
                    alignSelf: 'center',
                    justifyContent: 'space-between',
                    marginVertical: hp('2%'),
                    borderRadius: 100,
                    backgroundColor: '#fff',
                  }}>
                  <TextInput
                    placeholder="Search"
                    value={searchItemSupplier}
                    style={{
                      padding: 15,
                      width: wp('75%'),
                    }}
                    onChangeText={value => this.searchFunSupplier(value)}
                  />
                  {/* 
              <TouchableOpacity
                onPress={() => this.hitSupplierSearch()}
                style={{
                  backgroundColor: '#94C036',
                  padding: 13,
                  borderTopRightRadius: 100,
                  borderBottomRightRadius: 100,
                  marginLeft: 5,
                }}>
                {searchLoader ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Image
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                      marginRight: wp('5%'),
                      tintColor: '#fff',
                    }}
                    source={img.searchIcon}
                  />
                )}
              </TouchableOpacity> */}
                </View>
              )}
            </View>
          ) : null}

          <View style={{}}>
            <View style={{marginHorizontal: wp('5%')}}>
              {modalLoader ? (
                <ActivityIndicator size="large" color="#94C036" />
              ) : (
                <Accordion
                  expandMultiple
                  underlayColor="#fff"
                  sections={SECTIONS}
                  activeSections={activeSections}
                  renderHeader={this._renderHeader}
                  renderContent={this._renderContent}
                  onChange={this._updateSections}
                />
              )}
            </View>
          </View>

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

          {inventoryStatus ? null : (
            <View style={{}}>
              <ScrollView>
                {modalSupplierLoader ? (
                  <ActivityIndicator size="large" color="#94C036" />
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
                                paddingHorizontal: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: '#EFFBCF',
                              }}>
                              <View
                                style={{
                                  width: wp('25%'),
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {translate('Product Name')}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('25%'),
                                  marginLeft: wp('5%'),
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {translate('Price')}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {translate('Quantity')}
                                </Text>
                              </View>
                            </View>
                            <View>
                              {modalData && modalData.length > 0
                                ? modalData.map((item, index) => {
                                    return (
                                      <View key={index}>
                                        {item.isMapped ? (
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
                                            <TouchableOpacity
                                              onPress={() =>
                                                this.openModalFun(item)
                                              }
                                              style={{
                                                width: wp('25%'),
                                                justifyContent: 'center',
                                              }}>
                                              <Text
                                                style={{
                                                  fontSize: 12,
                                                  fontFamily: 'Inter-Regular',
                                                  fontFamily: item.isMapped
                                                    ? 'Inter-SemiBold'
                                                    : 'Inter-Regular',
                                                  color: item.isMapped
                                                    ? 'black'
                                                    : 'grey',
                                                }}>
                                                {item.name}
                                              </Text>
                                            </TouchableOpacity>

                                            <View
                                              style={{
                                                width: wp('25%'),
                                                marginLeft: wp('2%'),
                                                justifyContent: 'center',
                                              }}>
                                              <Text
                                                style={{
                                                  fontSize: 12,
                                                  fontFamily: 'Inter-Regular',
                                                }}>
                                                {Number(item.price).toFixed(2)}{' '}
                                                € / {item.unit}
                                              </Text>
                                            </View>

                                            <View
                                              style={{
                                                width: wp('30%'),
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                borderWidth: 1,
                                                borderRadius: 5,
                                                height: hp('5%'),
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
                                                  width: wp('10%'),
                                                  height: hp('5%'),
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                }}>
                                                <Text style={{}}>-</Text>
                                              </TouchableOpacity>
                                              <View
                                                style={{
                                                  width: wp('10%'),
                                                  height: hp('5%'),
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  borderRightWidth: 1,
                                                  borderLeftWidth: 1,
                                                }}>
                                                <TextInput
                                                  placeholder="0"
                                                  keyboardType="number-pad"
                                                  value={
                                                    item.quantityProduct
                                                      ? String(
                                                          item.quantityProduct,
                                                        )
                                                      : ''
                                                  }
                                                  style={{
                                                    width: wp('10%'),
                                                    height: hp('5%'),
                                                    paddingLeft: 6,
                                                  }}
                                                  onChangeText={value =>
                                                    this.editQuantityFun(
                                                      index,
                                                      'quantityProduct',
                                                      item,
                                                      'input',
                                                      value,
                                                      value,
                                                    )
                                                  }
                                                />
                                                {/* <Text
                                                  style={{
                                                    color: 'black',
                                                    fontSize: 12,
                                                    fontFamily: 'Inter-Regular',
                                                  }}>
                                                  {item.quantityProduct > 0
                                                    ? String(
                                                        item.quantityProduct,
                                                      )
                                                    : 0}
                                                </Text> */}
                                              </View>

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
                                                  width: wp('10%'),
                                                  height: hp('5%'),
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                }}>
                                                <Text style={{}}>+</Text>
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        ) : null}
                                      </View>
                                    );
                                  })
                                : null}
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

export default connect(mapStateToProps, {UserTokenAction})(AddItems);
