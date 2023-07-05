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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getInventoryBySupplierIdApi,
  getInventoryByDepartApi,
  getSupplierCatalogApi,
  getInsideInventoryNewApi,
  searchInventoryItemLApi,
  getSupplierProductsApi,
  addBasketApi,
  updateBasketApi,
  updateInventoryProductApi,
  addDraftApi,
  getBasketApi,
} from '../../connectivity/api';
import Accordion from 'react-native-collapsible/Accordion';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';
import Modal from 'react-native-modal';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';
import {ARRAY} from '../../constants/dummy';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {translate} from '../../utils/translations';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

class DepartmentPurchaseSec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      activeSections: [],
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
      departmentId: '',
      finalData: '',
      mainDepartId: '',
      modalQuantity: '0',
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
        console.log('res---->', res);
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
          },
        ]);
      });
  };

  createFirstData = () => {
    const {departmentId, mainDepartId} = this.state;
    console.log('FIRST', departmentId);
    getInventoryByDepartApi(departmentId)
      .then(res => {
        console.log('departID-->', res);

        // var filteredArray = res.data.filter(function (itm) {
        //   return itm.departmentId === mainDepartId;
        // });

        // console.log('filteredArray', filteredArray);

        let finalArray =
          res.data &&
          res.data.departments[0].categories.map((item, index) => {
            return {
              title: item.name,
              content: item.items,
            };
          });
        const result = finalArray;
        console.log('rest', result);
        // this.setState({
        //   SECTIONS_HORIZONTAL: [...result],
        //   modalLoader: false,
        //   SECTIONS_SEC_INVEN: [...result],
        // });

        this.setState({
          SECTIONS: [...result],
          modalLoader: false,
          SECTIONS_BACKUP: [...result],
        });
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  componentDidMount() {
    this.getData();
    // this.props.navigation.addListener('focus', () => {
    const {
      supplierValue,
      screen,
      basketId,
      navigateType,
      supplierName,
      departName,
      departID,
      finalData,
    } = this.props.route && this.props.route.params;
    this.setState(
      {
        supplierId: supplierValue,
        supplierStatus: false,
        inventoryStatus: true,
        screenType: screen,
        basketId,
        navigateType,
        departmentName: departName,
        supplierName,
        searchItemInventory: '',
        searchItemSupplier: '',
        listIndex: '',
        SECTIONS: [],
        modalData: [],
        departmentId: departID,
        finalData,
        mainDepartId: departID,
      },
      () => this.getManualLogsData(),
    );
    // });
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
    console.log('section', section);

    return (
      <View
        style={{
          backgroundColor: '#F2F2F2',
          flexDirection: 'row',
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: '#F0F0F0',
          borderLeftColor: '#F0F0F0',
          borderRightWidth: 1,
          borderRightColor: '#F0F0F0',
          height: 60,
          width: wp('87%'),
          // marginTop: hp('1.5%'),
          alignItems: 'center',
          // borderRadius: 6,
          justifyContent: 'space-around',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: '#492813',
              fontSize: 14,
              marginLeft: wp('2%'),
              fontFamily: 'Inter-Regular',
            }}>
            {section.title}
          </Text>
          <Image
            style={{
              height: 15,
              width: 15,
              resizeMode: 'contain',
              marginRight: wp('3%'),
              tintColor: 'black',
            }}
            source={img.arrowDownIcon}
          />
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
      const {screenType, SECTIONS} = this.state;
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

      const {screenType, SECTIONS} = this.state;
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
    console.log('sec', section);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{backgroundColor: '#fff', width: wp('87%')}}>
          {section.content.map((item, index) => {
            return (
              <View
                style={{
                  paddingHorizontal: 10,
                  // marginBottom:
                  //   index === section.content.length - 1 ? 30 : null,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    marginVertical: 10,
                  }}>
                  <View style={{marginTop: 10, flex: 3}}>
                    <TouchableOpacity
                      onPress={() => this.openModalFun(item, section, index)}
                      style={{}}>
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'flex-end',
                    }}>
                    <View>
                      {section.content[0] && section.content[0].deltaNew > 0 ? (
                        <Text
                          numberOfLines={1}
                          style={{
                            color: 'red',
                            fontSize: 12,
                            marginRight: wp('3%'),
                            alignSelf: 'flex-end',
                          }}>
                          Δ{' '}
                          {section.content[0] &&
                            section.content[0].deltaNew.toFixed(2)}{' '}
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
                      <Text
                        numberOfLines={1}
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                        }}>
                        Qty: {item.volume} {item.unit}
                      </Text>
                    </View>
                  </View>
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

  openModalFun = (item, section, index) => {
    console.log('item', item);
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
      sectionData: section,
      sectionIndex: index,
      modalQuantity: '0',
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
    const {inventoryStatus, finalBasketData} = this.state;
    if (finalBasketData.length > 0) {
      console.log('addToBasketFunHorizontal-->');
      this.addToBasketFunHorizontal();
    }
    const {
      SECTIONS,

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
            console.log('resINVENTORY', res);
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
    const {
      supplierId,
      productId,
      supplierName,
      basketId,
      closeStatus,
      finalData,
      mainDepartId,
      departmentName,
    } = this.state;
    if (closeStatus) {
      this.props.navigation.navigate('BasketOrderScreen', {
        finalData: basketId,
        supplierId,
        itemType: 'Inventory',
        productId,
        supplierName,
        finalDataSec: finalData,
        departmentName,
        mainDepartId,
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

    console.log('finalBsketData', finalBasketData);

    this.props.navigation.navigate('AddPurchaseScreen', {
      finalBasketData,
    });

    // if (draftStatus) {
    //   this.props.navigation.navigate('BasketOrderScreen', {
    //     finalData: basketId,
    //     supplierId,
    //     itemType: 'Inventory',
    //     productId,
    //     supplierName,
    //     finalData,
    //   });
    // } else {
    //   this.saveChangesFun();
    // }
  };

  saveChangesFun = () => {
    this.addToBasketFun();
  };

  confirmQuantityFun = () => {
    this.setState(
      {
        orderingThreeModal: false,
      },
      () => this.confirmQuantityFunSec(),
    );
  };

  confirmQuantityFunSec = async () => {
    const {
      sectionIndex,
      sectionData,
      modalQuantity,
      pageData,
      screenType,
      SECTIONS,
    } = this.state;
    console.log('sectIndex', sectionIndex);
    console.log('sectionData', sectionData);
    console.log('modalQuantity', modalQuantity);

    // this.editQuantityFun(
    //   sectionIndex,
    //   'quantityProduct',
    //   modalQuantity,
    //   'input',
    //   sectionData,
    // );

    const headerIndex = sectionData.headerIndex;

    const valueType = 'input';

    const valueMinus = Number(modalQuantity);
    console.log('valueMinus', valueMinus);

    const valueAdd = Number(modalQuantity);
    console.log('valueAdd', valueAdd);

    const value = valueType === 'input' ? valueAdd : valueMinus;
    // console.log('Value', value);
    const deltaOriginal = Number(pageData.delta);
    const isSelectedValue =
      modalQuantity !== '' && modalQuantity > 0 ? true : false;
    const newDeltaVal =
      value !== ''
        ? Number(pageData.delta) -
          Number(modalQuantity) * Number(pageData.volume)
        : deltaOriginal;
    const newAddTotalQuantity =
      Number(pageData.volume) *
      (pageData.quantityProduct === null ? 1 : modalQuantity);
    // console.log('newAddTotalQuantity', newAddTotalQuantity);

    // const newMinusTotalQuantity =
    //   Number(data.volume) * (data.quantityProduct === null ? 1 : valueData);
    // console.log('newMinusTotalQuantity', newMinusTotalQuantity);

    const finalTotalQuantity = newAddTotalQuantity;
    // valueType === 'input' ? newAddTotalQuantity : newMinusTotalQuantity;
    // console.log('finalTotalQuantity', finalTotalQuantity);

    let newArr = sectionData.content.map((item, i) =>
      sectionIndex === i
        ? {
            ...item,
            ['quantityProduct']: value,
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

    console.log('LastArr--> ', LastArr);

    // const finalArr = LastArr.map((item, index) => {
    //   const firstArr = item.content.filter(function (itm) {
    //     if (itm.quantityProduct !== '') {
    //       return itm.isSelected === true;
    //     }
    //   });
    //   return firstArr;
    // });

    // console.log('finAAA', finalArr);

    // var merged = [].concat.apply([], finalArr);
    // console.log('merged', merged);

    const basketArr = [];
    // merged.map(item => {
    //   basketArr.push({
    //     action: 'New',
    //     id: '',
    //     inventoryId: item.id,
    //     inventoryProductMappingId: item.inventoryProductMappingId,
    //     isCorrect: '',
    //     isRollingAverageUsed: item.isRollingAverageUsed,
    //     name: item.name,
    //     notes: item.notes,
    //     position: item.position,
    //     quantityOrdered: '',
    //     rollingAveragePrice: item.rollingAveragePrice,
    //     tdcVolume: item.tdcVolume,
    //     unitPrice: item.productPrice,
    //     unitId: item.unitId,
    //     units: item.units,
    //   });
    // });

    LastArr.map(item => {
      basketArr.push({
        action: 'New',
        id: '',
        inventoryId: item.inventoryId,
        inventoryProductMappingId: item.inventoryProductMappingId,
        isCorrect: true,
        notes: '',
        position: 1,
        quantityOrdered: '',
        tdcVolume: 0,
        unitId: item.unitId,
        unitPrice: item.productPrice,
        name: item.name,
        units: item.units,
      });
    });

    console.log('basketArr-->', basketArr);

    this.setState({
      SECTIONS: [...LastArr],
      finalBasketData: [...basketArr],
      draftStatus: false,
    });
  };

  closeFun = () => {
    this.setState({
      orderingThreeModal: false,
    });
  };

  editModalQuantityFun = (type, value) => {
    const {modalQuantity} = this.state;
    console.log('modalQuantity', modalQuantity);
    console.log('value', value);

    if (type === 'minus' && modalQuantity !== 0) {
      const valFinal = parseInt(modalQuantity) - parseInt(value);
      console.log('valFinal', valFinal);
      this.setState({
        modalQuantity: valFinal,
      });
    } else if (type === 'input') {
      this.setState({
        modalQuantity: value,
      });
    } else if (type === 'add') {
      const valFinal = parseInt(modalQuantity) + parseInt(value);
      console.log('valFinal', valFinal);
      this.setState({
        modalQuantity: valFinal,
      });
    }
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
      fromDate,
      isDatePickerVisible,
      toDate,
      isDatePickerVisibleToDate,
      finalData,
      sectionData,
      sectionIndex,
      modalQuantity,
    } = this.state;

    console.log('PAGE DATA', pageData);
    console.log('modalLoooo', modalLoader);

    return (
      <View style={styles.container}>
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <TouchableOpacity
              style={styles.firstContainer}
              onPress={() => this.props.navigation.goBack()}>
              <View style={styles.goBackContainer}>
                <Image source={img.backIcon} style={styles.tileImageBack} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.adminTextStyle}>{departmentName}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* <View style={{}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: wp('8%'),
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => this.inventoryFun()}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomColor: inventoryStatus ? '#5197C1' : '#D8DCE6',
                  borderBottomWidth: 3,
                  backgroundColor: inventoryStatus ? '#E6F3F3' : '#fff',
                  height: hp('5%'),
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: inventoryStatus
                      ? 'Inter-SemiBold'
                      : 'Inter-Regular',
                    color: inventoryStatus ? '#5197C1' : '#DCDCDC',
                  }}>
                  {translate('InventoryList')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.supplierFun()}
                style={{
                  flex: 1,
                  borderBottomColor: supplierStatus ? '#5197C1' : '#D8DCE6',
                  borderBottomWidth: 3,
                  backgroundColor: supplierStatus ? '#E6F3F3' : '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: hp('5%'),
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontFamily: supplierStatus
                      ? 'Inter-SemiBold'
                      : 'Inter-Regular',
                    color: supplierStatus ? '#5197C1' : '#D8DCE6',
                  }}>
                  {translate('Supplier catalog')}
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}

          {SECTIONS.length > 0 || modalData.length > 0 ? (
            <View>
              {inventoryStatus ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: hp('5.5%'),
                    width: wp('90%'),
                    alignSelf: 'center',
                    marginVertical: hp('2%'),
                    borderRadius: 10,
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
                      source={img.searchIcon}
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
                </View>
              )}
            </View>
          ) : null}

          {/* <View style={{marginTop: hp('2%'), marginHorizontal: wp('5%')}}>
            <ScrollView style={{}}>
              {SECTIONS_HORIZONTAL.map((item, index) => {
                return (
                  <View>
                   
                    <View>
                      <View style={{}}>
                        <View style={{}}>
                          {modalLoader ? (
                            <ActivityIndicator size="large" color="#5297c1" />
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
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View> */}

          <View style={{marginTop: hp('2%'), marginHorizontal: wp('5%')}}>
            <View>
              <View>
                <View style={{}}>
                  <View style={{}}>
                    {modalLoader ? (
                      <ActivityIndicator size="large" color="#5297c1" />
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
              </View>
            </View>
          </View>

          <Modal isVisible={orderingThreeModal} backdropOpacity={0.35}>
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
                        height: hp('15%'),
                        marginHorizontal: wp('6%'),
                        marginTop: hp('2%'),
                      }}>
                      <View
                        style={{
                          flex: 4,
                        }}>
                        <Text style={styles.textStylingLogo}>
                          {pageData.name}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            orderingThreeModal: false,
                          })
                        }
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 100,
                          padding: 5,
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
                    </View>
                    <View>
                      <View style={styles.insideContainer}>
                        <View>
                          <Text>{pageData.productName}</Text>
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
                                color: 'red',
                              }}>
                              Delta Δ
                            </Text>

                            {pageData.deltaNew > 0 ? (
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: 'red',
                                  fontSize: 13,
                                  fontWeight: 'bold',
                                  marginTop: 10,
                                }}>
                                Δ {pageData.deltaNew.toFixed(2)} {pageData.unit}
                              </Text>
                            ) : (
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 13,
                                  fontWeight: 'bold',
                                  marginTop: 10,
                                }}>
                                Δ 0 {pageData && pageData.unit}
                              </Text>
                            )}
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
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
                              {pageData.grainzVolume}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
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
                              {pageData.packSize}
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
                              Price
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              {pageData.productPrice} €/{pageData.productUnit}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                              }}>
                              {translate('Ordered Val')}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}>
                              € {pageData.price}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                              }}></Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                marginTop: 10,
                              }}></Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: hp('3%'),
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              this.editModalQuantityFun('minus', '1')
                            }
                            style={{
                              width: wp('20%'),
                              height: hp('5%'),
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 29,
                                fontWeight: 'bold',
                                color: '#5197C1',
                              }}>
                              -
                            </Text>
                          </TouchableOpacity>

                          <TextInput
                            value={String(modalQuantity)}
                            keyboardType="numeric"
                            style={{
                              borderRadius: 6,
                              padding: 10,
                              width: wp('50%'),
                              backgroundColor: '#fff',
                            }}
                            onChangeText={value =>
                              this.editModalQuantityFun('input', value)
                            }
                          />
                          <TouchableOpacity
                            onPress={() =>
                              this.editModalQuantityFun('add', '1')
                            }
                            style={{
                              width: wp('20%'),
                              height: hp('5%'),
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#5197C1',
                                fontSize: 20,
                                fontWeight: 'bold',
                              }}>
                              +
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={() => this.confirmQuantityFun()}
                          style={styles.signInStyling}>
                          <Text style={styles.signInStylingText}>
                            {translate('Confirm Quantity')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.closeFun()}
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <ActivityIndicator color="#fff" size="small" />
                          <Text style={{color: '#5297C1'}}>
                            {translate('Close')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </View>
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
        <TouchableOpacity
          onPress={() => this.closeBasketFun()}
          style={{
            position: 'absolute',
            right: 20,
            top: hp('75%'),
            backgroundColor: '#5297c1',
            padding: 15,
            borderRadius: 5,
          }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Inter-SemiBold',
              color: 'black',
              marginLeft: 5,
              color: '#fff',
              fontWeight: 'bold',
            }}>
            {translate('Apply')}
          </Text>
        </TouchableOpacity>
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

export default connect(mapStateToProps, {UserTokenAction})(
  DepartmentPurchaseSec,
);
