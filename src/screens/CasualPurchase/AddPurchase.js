import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import moment from 'moment';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getSupplierListApi,
  addOrderApi,
  getInventoryListApi,
  getCasualListNewApi,
} from '../../connectivity/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {translate} from '../../utils/translations';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';
import ModalPicker from '../../components/ModalPicker';
import TreeSelect from 'react-native-tree-select';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

let todayDate = moment(new Date()).format('DD-MM-YYYY');
let todayDateProd = moment.utc(new Date()).format();

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      isDatePickerVisible: false,
      finalDate: todayDate,
      placeHolderTextDept: 'Select Supplier',
      productionDate: todayDateProd,
      htvaIsSelected: true,
      auditIsSelected: false,
      note: '',
      dataListLoader: false,
      supplierList: [],
      object: {
        date: '',
        supplier: '',
        items: [{name: '', quantity: null, price: null}],
      },
      showSuppliers: false,
      supplier: 'Select Supplier',
      supplierId: '',
      supplieReference: '',
      departmentName: '',
      loading: false,
      items: [],
      selectedItems: [],
      selectedTextUser: '',
      selectedItemObjects: [],
      supplierListLoader: true,
      quantityList: [],
      quantityName: '',
      orderItemsFinal: [],
      treeselectDataBackup: [],
      switchValue: false,
      // orderItemsFinal: [
      //   {
      //     action: 'New',
      //     id: '',
      //     inventoryId: '',
      //     inventoryProductMappingId: '',
      //     isCorrect: false,
      //     notes: '',
      //     position: '',
      //     quantityOrdered: '',
      //     tdcVolume: 0,
      //     unitId: '',
      //     unitPrice: '',
      //     name: '',
      //   },
      // ],
      quantityValue: '',
      price: '',
      orderTotal: 0,
      saveLoader: false,
      saveTouchableStatus: false,
      imageModalStatus: false,
      imageDesc: '',
      imageName: '',
      imageData: '',
      imageShow: false,
      recipeLoader: true,
      buttonsSubHeader: [],
      chooseImageModalStatus: false,
      quantityError: '',
      priceError: '',
      treeselectData: [],
      clickPhoto: false,
    };
  }

  getProfileDataFun = async () => {
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
          recipeLoader: false,
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  getSupplierListData() {
    this.setState(
      {
        // supplierListLoader: true,
        dataListLoader: true,
      },
      () =>
        getSupplierListApi()
          .then(res => {
            const finalArr = [];
            res.data.map(item => {
              finalArr.push({
                name: item.name,
                id: item.id,
              });
            });
            this.setState({
              supplierList: [...finalArr],
              // supplierListLoader: false,
              dataListLoader: false,
            });
          })
          .catch(error => {
            console.log('err', error);
            // this.setState({supplierListLoader: false});
          }),
    );
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.clearData();
      this.getSupplierListData();
      this.getNewCasualListFun();
    });
    this.getProfileDataFun();
  }

  getNewCasualListFun() {
    getCasualListNewApi()
      .then(res => {
        // console.log('resss', res);
        let finalArray = res.data.departments.map((item, index) => {
          // console.log('item', item);

          let subArray = item.categories.map((subItem, subIndex) => {
            return {
              id: subItem.id,
              name: subItem.name,
              sortNo: subItem.id,
              parentId: subIndex,
              children: subItem.items,
            };
          });
          return {
            id: item.id,
            name: item.name,
            sortNo: item.id,
            parentId: index,
            children: subArray,
          };
        });

        this.setState({
          treeselectData: finalArray,
          treeselectDataBackup: finalArray,
          supplierListLoader: false,
        });
      })
      .catch(error => {
        console.log('err', error.response);
        // this.setState({supplierListLoader: false});
      });
  }

  clearData = () => {
    this.setState({
      imageData: '',
      imageDesc: '',
      imageName: '',
      quantityValue: '',
    });
  };

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    if (item.name === 'Back') {
      this.props.navigation.goBack();
    }
  };

  newCasualPurchase() {
    this.props.navigation.navigate('AddPurchaseScreen');
  }

  navigateToEditFun(order) {
    this.props.navigation.navigate('EditPurchase', {
      orderData: order,
    });
  }

  handleConfirm = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    this.setState({
      finalDate: newdate,
      productionDate: date,
    });

    this.hideDatePicker();
  };

  handleChoosePhoto() {
    this.setState({
      chooseImageModalStatus: true,
    });
  }

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  // addPurchaseLine() {
  //   const {
  //     quantityValue,
  //     price,
  //     selectedItemObjects,
  //     orderItemsFinal,
  //     orderTotal,
  //   } = this.state;

  //   let obj = {};
  //   let newlist = [];
  //   obj = {
  //     action: 'New',
  //     id: '',
  //     inventoryId: '',
  //     inventoryProductMappingId: '',
  //     isCorrect: false,
  //     notes: '',
  //     position: '',
  //     quantityOrdered: '',
  //     tdcVolume: 0,
  //     unitId: '',
  //     unitPrice: '',
  //     name: '',
  //   };

  //   const finalTotal = parseInt(orderTotal) + parseInt(price);

  //   newlist.push(obj);
  //   this.setState({
  //     orderItemsFinal: [...orderItemsFinal, ...newlist],
  //     quantityValue: '',
  //     price: '',
  //     orderTotal: finalTotal,
  //   });
  // }

  deletePurchaseLine(index) {
    const {orderItemsFinal, treeselectDataBackup} = this.state;
    let temp = orderItemsFinal;
    temp.splice(index, 1);
    this.setState({
      orderItemsFinal: temp,
      treeselectData: treeselectDataBackup,
    });
  }

  // deletePurchaseLine(index, type) {
  //   // this.setState({yourOrderItems: temp});

  //   const {yourOrderItems} = this.state;
  //   // const {orderItemsFinal} = this.state;

  //   // let newArr = orderItemsFinal.map((item, i) =>
  //   let newArr = yourOrderItems.map((item, i) =>
  //     index === i
  //       ? {
  //           ...item,
  //           [type]: 'Delete',
  //         }
  //       : item,
  //   );

  //   // let temp = this.state.yourOrderItems;
  //   // temp.splice(index, 1);

  //   this.setState({
  //     // orderItemsFinal: [...newArr],
  //     orderItemsFinal: [...newArr],
  //   });

  //   // let temp = this.state.purchaseLines;
  //   // temp.pop();
  //   // this.setState({purchaseLines: temp});
  // }

  payloadValidation = () => {
    let formIsValid = true;
    const {orderItemsFinal} = this.state;
    console.log('order---->', orderItemsFinal);
    if (orderItemsFinal.length > 0) {
      for (let i of orderItemsFinal) {
        if (i.quantityOrdered === '') {
          i.error = 'Quantity is required';
          formIsValid = false;
        } else if (i.unitPrice === '') {
          i.error = 'Price is required';
          formIsValid = false;
        } else if (i.unitId === null) {
          i.error = 'Please select a unit';
          formIsValid = false;
        }
      }
    }
    this.setState({
      orderItemsFinal,
    });
    return formIsValid;
  };

  createOrder() {
    const {
      productionDate,
      note,
      supplierId,
      supplieReference,
      htvaIsSelected,
      auditIsSelected,
      orderItemsFinal,
      imageData,
      imageDesc,
      imageName,
    } = this.state;

    let payload = {
      supplierId: supplierId,
      orderDate: productionDate,
      ambientTemp: 0,
      chilledTemp: 0,
      customerReference: '',
      deliveredDate: '',
      deliveryDate: '',
      frozenTemp: 0,
      images: imageData.length > 0 ? imageData : [],
      invoiceNumber: 0,
      isAuditComplete: auditIsSelected,
      isPlaced: false,
      isTDC: htvaIsSelected,
      notes: note,
      orderDate: productionDate,
      orderItems: orderItemsFinal,
      placedBy: '',
      supplieReference: '',
    };

    console.log('PAyload', payload);
    if (this.payloadValidation()) {
      if (orderItemsFinal.length === 0) {
        alert('Please enter values first');
      } else {
        this.setState(
          {
            saveLoader: true,
            saveTouchableStatus: true,
          },
          () =>
            addOrderApi(payload)
              .then(res => {
                this.props.navigation.goBack();
              })
              .catch(err => {
                this.setState({
                  saveLoader: false,
                  saveTouchableStatus: false,
                });
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
              }),
        );
      }
    }
  }

  showSupplierList() {
    this.setState({showSuppliers: !this.state.showSuppliers});
  }

  selectSupplier(param, id, ref) {
    this.setState({supplier: param, supplierId: id, supplieReference: ref});
    this.showSupplierList();
    this.scrollListReftop.scrollTo({x: 0, y: 0, animated: true});
  }

  selectDepartementNameFun = value => {
    this.setState(
      {
        departmentName: value,
        loading: true,
        items: [],
        selectedItemObjects: [],
        selectedItems: [],
      },
      () => this.getManualData(),
    );
  };

  getManualData = () => {
    this.getItemListData();
  };

  getItemListData = () => {
    const {departmentName} = this.state;

    getInventoryListApi()
      .then(res => {
        const {data} = res;

        let firstArr = data.filter(item => {
          return item.departmentName === departmentName;
        });

        function groupByKey(array, key) {
          return array.reduce((hash, obj) => {
            if (obj[key] === undefined) return hash;
            return Object.assign(hash, {
              [obj[key]]: (hash[obj[key]] || []).concat(obj),
            });
          }, {});
        }

        let groupedCategory = groupByKey(firstArr, 'categoryName');

        let finalArray = Object.keys(groupedCategory).map((item, index) => {
          return {
            name: item,
            id: item,
            children: groupedCategory[item],
          };
        });

        this.setState({
          items: [...finalArray],
          loading: false,
        });
      })
      .catch(err => {
        console.warn('ErrITEMSS', err);
      });
  };

  onSelectedItemsChange = selectedItems => {
    this.setState({selectedItems});
  };

  onSelectedItemObjectsChange = async (index, type, value, finalValue) => {
    const {orderItemsFinal} = this.state;

    let finalArray = finalValue.map((item, index) => {
      const finalUnits = item.units.map((subItem, subIndex) => {
        return {
          label: subItem.name,
          value: subItem.id,
        };
      });

      return {
        action: 'New',
        id: '',
        inventoryId: item.id,
        inventoryProductMappingId: '',
        isCorrect: item.isCorrect,
        notes: '',
        position: index + 1,
        quantityOrdered: '',
        tdcVolume: 0,
        unitId: item.units[0].id,
        unitPrice: '',
        name: item.name,
        units: finalUnits,
      };
    });

    // let finalArrayUnit = finalValue.map((item, index) => {
    //   console.log('item', item);
    //   return {
    //     label: item,
    //     value: item,
    //   };
    // });

    this.setState(
      {
        selectedItemObjects: finalValue,
        orderItemsFinal: [...finalArray],
      },
      // ,
      // () => this.addDataFun(index, type, value, finalValue),
    );
  };

  // storeDataFun = async () => {
  //   const {orderItemsFinal} = this.state;
  // };

  setModalVisibleImage = () => {
    this.setState({
      imageModalStatus: false,
      chooseImageModalStatus: false,
    });
  };

  // deleteImageFun = () => {
  //   this.setState({
  //     imageModalStatus: false,
  //     imageData: '',
  //     imageShow: false,
  //   });
  // };

  deleteImageFun = index => {
    let temp = this.state.imageData;
    temp.splice(index, 1);

    this.setState({
      imageData: temp,
    });
  };

  saveImageFun = () => {
    this.setState({
      imageModalStatus: false,
      imageShow: true,
    });
  };

  selectUserNameFun = item => {
    this.setState({
      supplier: item.name,
      selectedTextUser: item.name,
      supplierId: item.id,
      supplieReference: item.reference,
    });
  };

  choosePhotoFun = () => {
    this.setState(
      {
        chooseImageModalStatus: false,
      },
      () =>
        setTimeout(() => {
          ImagePicker.openPicker({
            multiple: true,
            width: 300,
            height: 400,
            includeBase64: true,
            cropping: true,
          }).then(image => {
            const finalImageData = image.map((item, index) => {
              console.log('itemImage', item);
              return {
                action: 'New',
                description: '',
                imageText: `data:image/png;base64,${item.data}`,
                name: '',
                path: item.path,
                position: 1,
                type: 'png',
              };
            });
            console.log('image', image);
            this.setState({
              // imageModalStatus: true,
              imageData: finalImageData,
              // imageShow: true,
            });
          });
        }, 500),
    );
  };

  clickPhotoFun = () => {
    this.setState(
      {
        chooseImageModalStatus: false,
      },
      () =>
        setTimeout(() => {
          ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
          }).then(image => {
            this.setState({
              // imageModalStatus: true,
              imageData: image,
              clickPhoto: true,
            });
          });
        }, 500),
    );
  };

  _onClick = item => {
    // console.log('itemmm', item);
    // let finalArray = finalValue.map((item, index) => {
    //   // const finalUnits = item.units.map((subItem, subIndex) => {
    //   //   return {
    //   //     label: subItem.name,
    //   //     value: subItem.id,
    //   //   };
    //   // });
    //   return {
    //     action: 'New',
    //     id: '',
    //     inventoryId: item.id,
    //     inventoryProductMappingId: '',
    //     isCorrect: false,
    //     notes: '',
    //     position: index + 1,
    //     quantityOrdered: '',
    //     tdcVolume: 0,
    //     unitId: item.units[0].id,
    //     unitPrice: '',
    //     name: item.name,
    //     // units: finalUnits,
    //   };
    // });
    // let finalArrayUnit = finalValue.map((item, index) => {
    //   console.log('item', item);
    //   return {
    //     label: item,
    //     value: item,
    //   };
    // });
    // this.setState(
    //   {
    //     orderItemsFinal: [...finalArray],
    //   },
    //   // ,
    //   // () => this.addDataFun(index, type, value, finalValue),
    // );
  };

  _onClickLeaf = item => {
    console.log('_onClickLeaf', item);

    // deletePurchaseLine(index) {
    //   const {orderItemsFinal, treeselectDataBackup} = this.state;
    //   let temp = this.state.orderItemsFinal;
    //   temp.splice(index, 1);
    //   this.setState({
    //     orderItemsFinal: temp,
    //     treeselectData: treeselectDataBackup,
    //   });
    // }
    const {orderItemsFinal} = this.state;

    const finalData = item.item;
    console.log('finalData', finalData);

    const finalArr = orderItemsFinal;
    // console.log('finalArr', finalArr);

    if (orderItemsFinal.length === 0) {
      finalArr.push(finalData);
      let finalArray = finalArr.map((item, index) => {
        let finaUnitVal =
          item &&
          item.units.map((subItem, subIndex) => {
            if (subItem.isDefault === true) {
              return subItem.id;
            }
          });
        const filteredUnit = finaUnitVal.filter(elm => elm);
        console.log('filteredUnit--->', filteredUnit);
        const finalUnits = item.units.map((subItem, subIndex) => {
          console.log('subItem', subItem);
          return {
            label: subItem.name,
            value: subItem.id,
            converter: subItem.converter,
            isDefault: subItem.isDefault,
          };
        });
        return {
          action: 'New',
          id: '',
          inventoryId: item.id,
          inventoryProductMappingId: '',
          isCorrect: item.isCorrect,
          notes: '',
          position: index + 1,
          quantityOrdered: item.quantityOrdered ? item.quantityOrdered : '',
          tdcVolume: 0,
          unitId: filteredUnit[0],
          unitPrice: item.unitPrice ? item.unitPrice : '',
          name: item.name,
          units: finalUnits,
          rollingAveragePrice: item.rollingAveragePrice,
          isRollingAverageUsed: false,
        };
      });

      this.setState({
        orderItemsFinal: [...finalArray],
      });
    } else {
      const magenicIndex = orderItemsFinal.findIndex(
        vendor => vendor.inventoryId === finalData.id,
      );
      console.log('magenicIndex', magenicIndex);
      if (magenicIndex === -1) {
        finalArr.push(finalData);
        let finalArray = finalArr.map((item, index) => {
          console.log('item', item);
          let finaUnitVal =
            item &&
            item.units.map((subItem, subIndex) => {
              if (subItem.isDefault === true) {
                return subItem.id ? subItem.id : subItem.value;
              }
            });
          const filteredUnit = finaUnitVal.filter(elm => elm);
          console.log('filteredUnit--->', filteredUnit);
          const finalUnits = item.units.map((subItem, subIndex) => {
            console.log('sunItem', subItem);
            return {
              label: subItem.name ? subItem.name : subItem.label,
              value: subItem.id ? subItem.id : subItem.value,
              converter: subItem.converter,
              isDefault: subItem.isDefault,
            };
          });
          return {
            action: 'New',
            id: '',
            inventoryId: item.inventoryId ? item.inventoryId : item.id,
            inventoryProductMappingId: '',
            isCorrect: item.isCorrect,
            notes: '',
            position: index + 1,
            quantityOrdered: item.quantityOrdered ? item.quantityOrdered : '',
            tdcVolume: 0,
            unitId: filteredUnit[0],
            unitPrice: item.unitPrice ? item.unitPrice : '',
            name: item.name,
            units: finalUnits,
            rollingAveragePrice: item.rollingAveragePrice,
            isRollingAverageUsed: false,
          };
        });

        this.setState({
          orderItemsFinal: [...finalArray],
        });
      } else {
        var filteredArray = orderItemsFinal.filter(function (e) {
          return e.inventoryId !== finalData.id;
        });
        console.log('filteredArray', filteredArray);

        this.setState({
          orderItemsFinal: filteredArray,
        });
      }
    }
  };

  // toggleSwitch = (
  //   index,
  //   type,
  //   value,
  //   rollingAveragePrice,
  //   quantityOrdered,
  //   isRollingAverageUsed,
  // ) => {
  //   console.log('index', index);
  //   console.log('type', type);
  //   console.log('VAlue', value);
  //   this.setState({switchValue: value}, () =>
  //     this.addDataFun(
  //       index,
  //       type,
  //       value,
  //       rollingAveragePrice,
  //       quantityOrdered,
  //       isRollingAverageUsed,
  //     ),
  //   );
  // };

  addDataFun = (
    index,
    type,
    value,
    rollingAveragePrice,
    quantityOrdered,
    isRollingAverageUsed,
    key,
    item,
    indexUnits,
  ) => {
    const {orderItemsFinal} = this.state;
    if (type === 'isRollingAverageUsed' && key === 'all') {
      console.log('1---->');
      const finalVal = value;
      console.log('finalVal', finalVal);
      console.log('type', type);
      console.log('key', key);

      let newArr = orderItemsFinal.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: finalVal,
              ['unitPrice']:
                value === true
                  ? (item.rollingAveragePrice * item.quantityOrdered).toFixed(2)
                  : '',
            }
          : {
              ...item,
              [type]: finalVal,
              ['unitPrice']:
                value === true
                  ? (item.rollingAveragePrice * item.quantityOrdered).toFixed(2)
                  : '',
            },
      );

      console.log('NEWA--ALLITEMS', newArr);
      const orderTotal = newArr.reduce(
        (n, {unitPrice}) => n + Number(unitPrice),
        0,
      );

      console.log('orderTotal--ALLITEMS', orderTotal);

      this.setState({
        orderItemsFinal: [...newArr],
        orderTotal: value === true ? orderTotal : 0.0,
        switchValue: finalVal,
      });
    } else {
      console.log('2');
      if (type === 'isRollingAverageUsed') {
        console.log('3');

        console.log('rollingAveragePrice', rollingAveragePrice);
        const finalQuantity = quantityOrdered === '' ? 0 : quantityOrdered;
        console.log('finalQuantity', finalQuantity);

        console.log('valueee', value);
        var indexUnitsSec = item.units.findIndex(p => p.value == item.unitId);
        const converter = item.units[indexUnitsSec].converter;

        console.log('converter', converter);

        const finalPrice = rollingAveragePrice * finalQuantity * converter;
        console.log('finalPrice', finalPrice);

        console.log('indexUnitsSec', indexUnitsSec);

        let newArr = orderItemsFinal.map((item, i) =>
          index === i
            ? {
                ...item,
                [type]: value,
                ['unitPrice']: value === true ? finalPrice.toFixed(2) : '',
              }
            : item,
        );

        console.log('NEWA', newArr);
        const orderTotal = newArr.reduce(
          (n, {unitPrice}) => n + Number(unitPrice),
          0,
        );

        this.setState({
          orderItemsFinal: [...newArr],
          orderTotal,
        });
      } else {
        console.log('4');
        if (type === 'quantityOrdered' && isRollingAverageUsed === true) {
          console.log('5');
          console.log('rollingAveragePrice', rollingAveragePrice);
          const finalQuantity = value ? value : 0;
          console.log('finalQuantity', finalQuantity);

          var indexUnitsSec = item.units.findIndex(p => p.value == item.unitId);
          const converter = item.units[indexUnitsSec].converter;

          console.log('converter', converter);

          const finalPrice = rollingAveragePrice * finalQuantity * converter;
          console.log('finalPrice', finalPrice);
          let newArr = orderItemsFinal.map((item, i) =>
            index === i
              ? {
                  ...item,
                  [type]: value,
                  ['unitPrice']: finalPrice.toFixed(2),
                }
              : item,
          );
          console.log('NEWA', newArr);
          const orderTotal = newArr.reduce(
            (n, {unitPrice}) => n + Number(unitPrice),
            0,
          );

          this.setState({
            orderItemsFinal: [...newArr],
            orderTotal,
            // selectedItems: finalValue,
          });
        } else {
          console.log('6');
          if (isRollingAverageUsed === true && value !== null) {
            console.log('7');
            console.log('va-->', item.value);
            console.log('UNITS-->', item.units);
            console.log('indexUnits-->', indexUnits);
            const finalUnit = indexUnits - 1;
            const isDefault = item.units[finalUnit].isDefault;
            const converter = item.units[finalUnit].converter;

            console.log('isDefault-->', isDefault);

            console.log('rollingAveragePrice', rollingAveragePrice);
            const finalQuantity = item.quantityOrdered
              ? item.quantityOrdered
              : 0;
            console.log('finalQuantity', finalQuantity);
            const finalPrice = rollingAveragePrice * finalQuantity;
            const finalPriceSec =
              rollingAveragePrice * finalQuantity * converter;
            const lastPrice =
              isDefault === true ? finalPriceSec : finalPriceSec;
            // const lastPrice = isDefault === true ? finalPrice : finalPriceSec;
            console.log('finalPrice', finalPrice);
            console.log('valueee', value);

            let newArr = orderItemsFinal.map((item, i) =>
              index === i
                ? {
                    ...item,
                    [type]: value,
                    ['unitPrice']: lastPrice.toFixed(2),
                    // ['unitId']: finalUnitId,
                    // ['position']: index,
                  }
                : item,
            );
            console.log('NEWA', newArr);
            const orderTotal = newArr.reduce(
              (n, {unitPrice}) => n + Number(unitPrice),
              0,
            );

            this.setState({
              orderItemsFinal: [...newArr],
              orderTotal,
              // selectedItems: finalValue,
            });
          } else {
            console.log('8');
            let newArr = orderItemsFinal.map((item, i) =>
              index === i
                ? {
                    ...item,
                    [type]: value,
                    // ['unitId']: finalUnitId,
                    // ['position']: index,
                  }
                : item,
            );
            console.log('NEWA', newArr);
            const orderTotal = newArr.reduce(
              (n, {unitPrice}) => n + Number(unitPrice),
              0,
            );

            this.setState({
              orderItemsFinal: [...newArr],
              orderTotal,
              // selectedItems: finalValue,
            });
          }
        }
      }
    }
  };

  addImageDataFun = (index, type, value) => {
    const {imageData} = this.state;
    const finalVal = value;

    let newArr = imageData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: finalVal,
          }
        : {
            ...item,
          },
    );

    this.setState({
      imageData: [...newArr],
    });
  };
  render() {
    const {
      isDatePickerVisible,
      finalDate,
      htvaIsSelected,
      auditIsSelected,
      note,
      showSuppliers,
      supplierList,
      supplierListLoader,
      supplier,
      items,
      loading,
      orderItemsFinal,
      orderTotal,
      saveLoader,
      saveTouchableStatus,
      imageModalStatus,
      imageDesc,
      imageName,
      imageData,
      imageShow,
      buttonsSubHeader,
      recipeLoader,
      dataListLoader,
      placeHolderTextDept,
      selectedTextUser,
      supplierId,
      productionDate,
      departmentName,
      selectedItemObjects,
      chooseImageModalStatus,
      selectedItems,
      quantityList,
      quantityName,
      treeselectData,
      switchValue,
      clickPhoto,
    } = this.state;
    console.log('imageData', imageData);
    console.log('OrederItemsFinal', orderItemsFinal);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfileFun}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginBottom: hp('2%')}}
          ref={ref => {
            this.scrollListReftop = ref;
          }}>
          <View>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <View style={{flex: 1}}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Casual purchase')}
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
            <View style={{marginHorizontal: wp('6%'), marginTop: hp('2%')}}>
              {supplierListLoader ? (
                <ActivityIndicator color="grey" size="large" />
              ) : (
                <View>
                  <View style={{}}>
                    <View style={{}}>
                      <TouchableOpacity
                        onPress={() => this.showDatePickerFun()}
                        style={{
                          backgroundColor: '#fff',
                          padding: Platform.OS === 'ios' ? 15 : 0,
                          marginBottom: hp('3%'),
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          borderRadius: 6,
                        }}>
                        <TextInput
                          placeholder="dd-mm-yy"
                          value={finalDate}
                          editable={false}
                        />
                        <Image
                          source={img.calenderIcon}
                          style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            alignSelf:
                              Platform.OS === 'android' ? 'center' : null,
                            marginRight: Platform.OS === 'android' ? 10 : 0,
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode={'date'}
                    onConfirm={this.handleConfirm}
                    onCancel={this.hideDatePicker}
                    // minimumDate={minTime}
                  />
                  <View style={{marginBottom: hp('3%')}}>
                    <ModalPicker
                      dataListLoader={dataListLoader}
                      placeHolderLabel={placeHolderTextDept}
                      placeHolderLabelColor="grey"
                      dataSource={supplierList}
                      selectedLabel={selectedTextUser}
                      onSelectFun={item => this.selectUserNameFun(item)}
                    />
                  </View>
                  {supplierId === '' ? null : (
                    <View
                      style={{
                        marginBottom: 15,
                      }}>
                      <TreeSelect
                        data={treeselectData}
                        // isOpen
                        // openIds={['A01']}
                        // defaultSelectedId={['B062']}
                        isShowTreeId={false}
                        // selectType="single"
                        selectType="multiple"
                        itemStyle={{
                          // backgroudColor: '#8bb0ee',
                          fontSize: 12,
                          color: '#995962',
                        }}
                        selectedItemStyle={{
                          backgroudColor: '#f7edca',
                          fontSize: 16,
                          color: '#171e99',
                        }}
                        onClick={item => this._onClick(item)}
                        onClickLeaf={item => this._onClickLeaf(item)}
                        treeNodeStyle={{
                          // openIcon: <Icon size={18} color="#171e99" style={{ marginRight: 10 }} name="ios-arrow-down" />,
                          // closeIcon: <Icon size={18} color="#171e99" style={{ marginRight: 10 }} name="ios-arrow-forward" />
                          openIcon: (
                            <Image
                              resizeMode="stretch"
                              style={{width: 18, height: 15}}
                              source={img.arrowDownIcon}
                            />
                          ),
                          closeIcon: (
                            <Image
                              resizeMode="stretch"
                              style={{width: 18, height: 15}}
                              source={img.arrowRightIcon}
                            />
                          ),
                        }}
                      />
                    </View>
                  )}
                  {/* 
                  <View
                    style={{
                      marginBottom: hp('3%'),
                      width: wp('70%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        borderRadius: 5,
                        backgroundColor: '#fff',
                      }}>
                      <View
                        style={{
                          alignSelf: 'center',
                          justifyContent: 'center',
                          width: index > 0 ? wp('60%') : wp('80%'),
                        }}>
                        <RNPickerSelect
                          placeholder={{
                            label: 'Select Department*',
                            value: null,
                            color: 'black',
                          }}
                          onValueChange={value => {
                            this.selectDepartementNameFun(value);
                          }}
                          style={{
                            inputIOS: {
                              fontSize: 14,
                              paddingHorizontal: '3%',
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
                  </View> */}
                  {/* <View>
                    <SectionedMultiSelect
                      styles={{
                        container: {
                          paddingTop: hp('2%'),
                          marginTop: hp('7%'),
                        },
                        selectToggle: {
                          backgroundColor: '#fff',
                          paddingVertical: 14,
                          paddingHorizontal: 5,
                          borderRadius: 6,
                        },
                      }}
                      loadingComponent={
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <ActivityIndicator size="large" color="#94C036" />
                        </View>
                      }
                      loading={loading}
                      // hideSearch={true}
                      // single={true}
                      items={items}
                      IconRenderer={Icon}
                      uniqueKey="id"
                      subKey="children"
                      showDropDowns={true}
                      readOnlyHeadings={true}
                      // onConfirm={() => this.storeDataFun()}
                      onSelectedItemObjectsChange={value =>
                        this.onSelectedItemObjectsChange(
                          index,
                          'inventoryId',
                          value[0],
                          value,
                        )
                      }
                      // onSelectedItemsChange={value =>
                      //   this.addDataFun(
                      //     index,
                      //     'inventoryId',
                      //     value[0],
                      //     value,
                      //   )
                      // }
                      onSelectedItemsChange={this.onSelectedItemsChange}
                      selectedItems={this.state.selectedItems}
                      // selectedItems={[item.inventoryId]}
                    />
                  </View> */}
                  {orderItemsFinal.length > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: hp('2%'),
                      }}>
                      <View>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                          }}>
                          Items
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            marginRight: 10,
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                            }}>
                            Use average price for all items:
                          </Text>
                        </View>
                        <View>
                          <CheckBox
                            value={switchValue}
                            onValueChange={value =>
                              this.addDataFun(
                                'index',
                                'isRollingAverageUsed',
                                value,
                                'rollingAveragePrice',
                                'quantityOrdered',
                                'isRollingAverageUsed',
                                'all',
                              )
                            }
                            style={{
                              height: 20,
                              width: 20,
                            }}
                          />
                          {/* <Switch
                            thumbColor={'#94BB3B'}
                            trackColor={{false: 'grey', true: 'grey'}}
                            ios_backgroundColor="white"
                            onValueChange={value =>
                              this.addDataFun(
                                'index',
                                'isRollingAverageUsed',
                                value,
                                'rollingAveragePrice',
                                'quantityOrdered',
                                'isRollingAverageUsed',
                                'all',
                              )
                            }
                            value={switchValue}
                          /> */}
                        </View>
                      </View>
                    </View>
                  ) : null}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      {orderItemsFinal.length > 0 &&
                        orderItemsFinal.map((item, indexOrder) => {
                          console.log('item--->ORDERSS', item);
                          // let finaUnitVal =
                          //   item &&
                          //   item.units.map((subItem, subIndex) => {
                          //     if (subItem.isDefault === true) {
                          //       return subItem.value;
                          //     }
                          //   });
                          // const filteredUnit = finaUnitVal.filter(elm => elm);
                          // console.log('filteredUnit--->', filteredUnit);
                          return (
                            <View style={{marginBottom: 10}}>
                              <View style={{}}>
                                <View>
                                  <View style={{}}>
                                    <View>
                                      {/* <View
                                    style={{
                                      marginBottom: hp('3%'),
                                      width: wp('70%'),
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        borderRadius: 5,
                                        backgroundColor: '#fff',
                                      }}>
                                      <View
                                        style={{
                                          alignSelf: 'center',
                                          justifyContent: 'center',
                                          width:
                                            index > 0 ? wp('60%') : wp('80%'),
                                        }}>
                                        <RNPickerSelect
                                          placeholder={{
                                            label: 'Select Department*',
                                            value: null,
                                            color: 'black',
                                          }}
                                          placeholderTextColor="red"
                                          onValueChange={value => {
                                            this.selectDepartementNameFun(
                                              value,
                                            );
                                          }}
                                          style={{
                                            inputIOS: {
                                              fontSize: 14,
                                              paddingHorizontal: '3%',
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
                                          value={item.supplierValue}
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
                                            marginTop:
                                              Platform.OS === 'ios' ? 15 : 15,
                                          }}
                                        />
                                      </View>
                                    </View>
                                    {index > 0 ? (
                                      <TouchableOpacity
                                        onPress={() =>
                                          this.deletePurchaseLine(index)
                                        }
                                        style={{marginLeft: wp('5%')}}>
                                        <Text
                                          style={{
                                            fontFamily: 'Inter-Regular',
                                            color: '#FF0303',
                                            fontSize: 16,
                                            textDecorationLine: 'underline',
                                          }}>
                                          {translate('Remove')}
                                        </Text>
                                      </TouchableOpacity>
                                    ) : null}
                                  </View> */}
                                      {/* <SectionedMultiSelect
                                    styles={{
                                      container: {
                                        paddingTop: hp('2%'),
                                        marginTop: hp('7%'),
                                      },
                                      selectToggle: {
                                        backgroundColor: '#fff',
                                        paddingVertical: 15,
                                        paddingHorizontal: 5,
                                        borderRadius: 6,
                                      },
                                    }}
                                    loadingComponent={
                                      <View
                                        style={{
                                          flex: 1,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                        }}>
                                        <ActivityIndicator
                                          size="large"
                                          color="#94C036"
                                        />
                                      </View>
                                    }
                                    loading={loading}
                                    // hideSearch={true}
                                    // single={true}
                                    items={items}
                                    IconRenderer={Icon}
                                    uniqueKey="id"
                                    subKey="children"
                                    showDropDowns={true}
                                    readOnlyHeadings={true}
                                    onSelectedItemObjectsChange={value =>
                                      this.onSelectedItemObjectsChange(
                                        index,
                                        'inventoryId',
                                        value[0],
                                        value,
                                      )
                                    }
                                    // onSelectedItemsChange={value =>
                                    //   this.addDataFun(
                                    //     index,
                                    //     'inventoryId',
                                    //     value[0],
                                    //     value,
                                    //   )
                                    // }
                                    onSelectedItemsChange={
                                      this.onSelectedItemsChange
                                    }
                                    selectedItems={this.state.selectedItems}
                                    // selectedItems={[item.inventoryId]}
                                  /> */}

                                      <View
                                        style={{
                                          zIndex: 10,
                                          width: wp('10%'),
                                        }}>
                                        <TouchableOpacity
                                          // disabled={editDisabled}
                                          onPress={() =>
                                            this.deletePurchaseLine(
                                              indexOrder,
                                              'action',
                                            )
                                          }>
                                          <Image
                                            source={img.cancelIcon}
                                            style={{
                                              width: 25,
                                              height: 25,
                                              resizeMode: 'contain',
                                            }}
                                          />
                                        </TouchableOpacity>
                                      </View>
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          flex: 1,
                                        }}>
                                        <View
                                          style={{
                                            flex: 0.7,
                                            width: wp('20%'),
                                          }}>
                                          <Text>{item.name}</Text>
                                        </View>
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            flex: 2,
                                            marginLeft: wp('2%'),
                                          }}>
                                          <View>
                                            <TextInput
                                              placeholder="Quantity"
                                              style={{
                                                padding: 12,
                                                borderTopLeftRadius: 5,
                                                borderBottomLeftRadius: 5,
                                                backgroundColor: '#fff',
                                                width: wp('20%'),
                                              }}
                                              keyboardType="number-pad"
                                              value={item.quantityOrdered}
                                              onChangeText={value =>
                                                this.addDataFun(
                                                  indexOrder,
                                                  'quantityOrdered',
                                                  value,
                                                  item.rollingAveragePrice,
                                                  item.quantityOrdered,
                                                  item.isRollingAverageUsed,
                                                  'quanOrdered',
                                                  item,
                                                )
                                              }
                                            />
                                          </View>
                                          <View
                                            style={{
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                            }}>
                                            <View
                                              style={{
                                                flexDirection: 'row',
                                                borderTopRightRadius: 5,
                                                borderBottomRightRadius: 5,
                                                backgroundColor: '#68AFFF',
                                              }}>
                                              <View
                                                style={{
                                                  alignSelf: 'center',
                                                  justifyContent: 'center',
                                                  width: wp('18%'),
                                                }}>
                                                <RNPickerSelect
                                                  placeholder={{
                                                    label: 'Select Unit*',
                                                    value: null,
                                                    color: 'black',
                                                  }}
                                                  onValueChange={(
                                                    value,
                                                    index,
                                                  ) => {
                                                    this.addDataFun(
                                                      indexOrder,
                                                      'unitId',
                                                      value,
                                                      item.rollingAveragePrice,
                                                      item.quantityOrdered,
                                                      item.isRollingAverageUsed,
                                                      'key',
                                                      item,
                                                      index,
                                                    );
                                                  }}
                                                  style={{
                                                    inputIOS: {
                                                      fontSize: 14,
                                                      paddingHorizontal: '3%',
                                                      color: '#fff',
                                                      width: '100%',
                                                      alignSelf: 'center',
                                                      paddingVertical: 12,
                                                      marginLeft: 10,
                                                    },
                                                    inputAndroid: {
                                                      fontSize: 14,
                                                      paddingHorizontal: '3%',
                                                      color: '#fff',
                                                      width: '100%',
                                                      alignSelf: 'center',
                                                      paddingVertical: 15,
                                                      marginLeft: 10,
                                                    },
                                                    iconContainer: {
                                                      top: '40%',
                                                    },
                                                  }}
                                                  items={item.units}
                                                  value={item.unitId}
                                                  // value={filteredUnit[0]}
                                                  useNativeAndroidPickerStyle={
                                                    false
                                                  }
                                                />
                                              </View>
                                              <View
                                                style={{marginRight: wp('4%')}}>
                                                <Image
                                                  source={img.arrowDownIcon}
                                                  resizeMode="contain"
                                                  style={{
                                                    height: 15,
                                                    width: 15,
                                                    resizeMode: 'contain',
                                                    tintColor: '#fff',
                                                    marginTop:
                                                      Platform.OS === 'ios'
                                                        ? 12
                                                        : 15,
                                                  }}
                                                />
                                              </View>
                                            </View>
                                          </View>
                                        </View>

                                        {/* <View
                                      style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderRadius: 6,
                                        backgroundColor: '#fff',
                                      }}>
                                      <TextInput
                                        placeholder="Quantity"
                                        style={{
                                          padding: 15,
                                        }}
                                        value={item.quantityOrdered}
                                        onChangeText={value =>
                                          this.addDataFun(
                                            index,
                                            'quantityOrdered',
                                            value,
                                          )
                                        }
                                      />
                                      <Text
                                        style={{
                                          textAlign: 'center',
                                          backgroundColor: '#F7F8F5',
                                        }}>
                                        {translate('Unit')}
                                      </Text>
                                    </View> */}
                                        {/* {switchValue === false ? ( */}
                                        <View
                                          style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginLeft: 10,
                                          }}>
                                          <Text style={{}}>€</Text>
                                          <TextInput
                                            placeholder="Price"
                                            editable={
                                              item.isRollingAverageUsed
                                                ? false
                                                : true
                                            }
                                            style={{
                                              padding: 15,
                                              marginLeft: wp('2%'),
                                              width: wp('25%'),
                                              backgroundColor: '#fff',
                                              borderRadius: 6,
                                            }}
                                            onChangeText={value =>
                                              this.addDataFun(
                                                indexOrder,
                                                'unitPrice',
                                                value,
                                              )
                                            }
                                            value={String(item.unitPrice)}
                                          />
                                        </View>
                                        {/* ) : null} */}
                                        <View
                                          style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginLeft: 10,
                                          }}>
                                          <Text
                                            style={{
                                              marginRight: 10,
                                              fontSize: 10,
                                            }}>
                                            Use average price
                                          </Text>
                                          <View
                                            style={{
                                              backgroundColor: '#fff',
                                              borderRadius: 6,
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                              paddingHorizontal: 10,
                                            }}>
                                            <TextInput
                                              placeholder="Average Price"
                                              editable={false}
                                              style={{
                                                padding: 15,
                                                width: wp('25%'),
                                              }}
                                              // onChangeText={value =>
                                              //   this.addDataFun(
                                              //     indexOrder,
                                              //     'unitPrice',
                                              //     value,
                                              //   )
                                              // }
                                              value={`€ ${Number(
                                                item.rollingAveragePrice.toFixed(
                                                  2,
                                                ),
                                              )}`}
                                            />
                                            <View>
                                              <CheckBox
                                                value={
                                                  item.isRollingAverageUsed
                                                }
                                                onValueChange={val =>
                                                  this.addDataFun(
                                                    indexOrder,
                                                    'isRollingAverageUsed',
                                                    val,
                                                    item.rollingAveragePrice,
                                                    item.quantityOrdered,
                                                    item.isRollingAverageUsed,
                                                    'singleRolling',
                                                    item,
                                                  )
                                                }
                                                style={{
                                                  height: 20,
                                                  width: 20,
                                                }}
                                              />
                                              {/* <Switch
                                                thumbColor={'#94BB3B'}
                                                trackColor={{
                                                  false: 'grey',
                                                  true: 'grey',
                                                }}
                                                ios_backgroundColor="white"
                                                onValueChange={val =>
                                                  this.addDataFun(
                                                    indexOrder,
                                                    'isRollingAverageUsed',
                                                    val,
                                                    item.rollingAveragePrice,
                                                    item.quantityOrdered,
                                                  )
                                                }
                                                value={
                                                  item.isRollingAverageUsed
                                                }
                                              /> */}
                                            </View>
                                          </View>
                                        </View>
                                        <View
                                          style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginLeft: 10,
                                          }}>
                                          <Text
                                            style={{
                                              marginRight: 10,
                                              fontSize: 10,
                                            }}>
                                            Correct
                                          </Text>
                                          <View style={{}}>
                                            <View>
                                              {/* <CheckBox
                                                value={
                                                  item.isRollingAverageUsed
                                                }
                                                onValueChange={val =>
                                                  this.addDataFun(
                                                    indexOrder,
                                                    'isRollingAverageUsed',
                                                    val,
                                                    item.rollingAveragePrice,
                                                    item.quantityOrdered,
                                                  )
                                                }
                                                style={{
                                                  height: 20,
                                                  width: 20,
                                                }}
                                              /> */}
                                              <Switch
                                                thumbColor={'#fff'}
                                                trackColor={{
                                                  false: 'red',
                                                  true: 'green',
                                                }}
                                                ios_backgroundColor="red"
                                                onValueChange={val =>
                                                  this.addDataFun(
                                                    indexOrder,
                                                    'isCorrect',
                                                    val,
                                                    item.rollingAveragePrice,
                                                    item.quantityOrdered,
                                                  )
                                                }
                                                value={item.isCorrect}
                                              />
                                            </View>
                                          </View>
                                        </View>
                                      </View>
                                      {item.error ? (
                                        <View>
                                          <Text
                                            style={{
                                              color: 'red',
                                              fontSize: 12,
                                              fontFamily: 'Inter-Regular',
                                              marginTop: 5,
                                            }}>
                                            {item.error}
                                          </Text>
                                        </View>
                                      ) : null}
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  </ScrollView>
                  {/* <View>
                    <TouchableOpacity
                      onPress={() => this.addPurchaseLine()}
                      style={{
                        marginBottom: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: hp('3%'),
                      }}>
                      <View style={{}}>
                        <Image
                          source={img.addIconNew}
                          style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: '#94C01F',
                          }}
                        />
                      </View>
                      <View style={{}}>
                        <Text
                          style={{
                            color: '#94C01F',
                            fontSize: 18,
                            fontFamily: 'Inter-Regular',
                            marginLeft: 10,
                          }}>
                          {translate('Add line')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View> */}
                  {supplierId === '' ? null : (
                    <View style={{marginTop: hp('3%')}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: hp('2%'),
                        }}>
                        <View>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              fontSize: 16,
                              color: '#151B26',
                            }}>
                            {translate('Total')}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              fontSize: 16,
                              color: '#151B26',
                            }}>
                            € {orderTotal.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            htvaIsSelected: !htvaIsSelected,
                          })
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                            color: '#151B26',
                          }}>
                          HTVA?
                        </Text>
                        <CheckBox
                          disabled
                          value={htvaIsSelected}
                          // onValueChange={() =>
                          //   this.setState({htvaIsSelected: !htvaIsSelected})
                          // }
                          style={{
                            height: 20,
                            width: 20,
                          }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({auditIsSelected: !auditIsSelected})
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                            color: '#151B26',
                          }}>
                          {translate('Audit Complete')}
                        </Text>
                        <CheckBox
                          disabled
                          value={auditIsSelected}
                          style={{
                            height: 20,
                            width: 20,
                          }}
                          // onValueChange={() =>
                          //   this.setState({auditIsSelected: !auditIsSelected})
                          // }
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  {supplierId === '' ? null : (
                    <View>
                      <TouchableOpacity
                        onPress={() => this.handleChoosePhoto()}
                        style={{
                          marginTop: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{}}>
                          <Image
                            source={img.addIconNew}
                            style={{
                              width: 20,
                              height: 20,
                              resizeMode: 'contain',
                              tintColor: '#94C01F',
                            }}
                          />
                        </View>
                        <View style={{}}>
                          <Text
                            style={{
                              color: '#94C01F',
                              fontSize: 18,
                              fontFamily: 'Inter-Regular',
                              marginLeft: 10,
                            }}>
                            {translate('Add image')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  {clickPhoto === true ? (
                    <View style={{marginTop: 15}}>
                      <Image
                        style={{
                          width: wp('60%'),
                          height: 100,
                          resizeMode: 'contain',
                        }}
                        source={{uri: imageData.path}}
                      />
                    </View>
                  ) : null}
                  {imageData.length > 0 && clickPhoto === false
                    ? imageData.map((item, index) => {
                        console.log('itemIMage', item);
                        return (
                          <View style={{marginTop: 15}}>
                            <Image
                              style={{
                                width: wp('60%'),
                                height: 100,
                                resizeMode: 'contain',
                              }}
                              source={{uri: item.path}}
                            />
                            <View style={{}}>
                              <TextInput
                                placeholder="Enter Name"
                                value={item.name}
                                style={{
                                  borderWidth: 1,
                                  padding: 12,
                                  marginBottom: hp('3%'),
                                  justifyContent: 'space-between',
                                  marginTop: 20,
                                }}
                                onChangeText={value =>
                                  this.addImageDataFun(index, 'name', value)
                                }
                              />
                            </View>
                            <View style={{}}>
                              <TextInput
                                placeholder="Enter Description"
                                value={item.description}
                                style={{
                                  borderWidth: 1,
                                  padding: 12,
                                  marginBottom: hp('3%'),
                                  justifyContent: 'space-between',
                                }}
                                onChangeText={value =>
                                  this.addImageDataFun(
                                    index,
                                    'description',
                                    value,
                                  )
                                }
                              />
                            </View>
                            <View
                              style={{
                                alignSelf: 'center',
                              }}>
                              <TouchableOpacity
                                onPress={() => this.deleteImageFun(index)}
                                style={{
                                  width: wp('40%'),
                                  height: hp('5%'),
                                  backgroundColor: 'red',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                  }}>
                                  {translate('Delete')}
                                </Text>
                              </TouchableOpacity>
                              {/* <TouchableOpacity
                                // onPress={() => this.saveImageFun()}
                                style={{
                                  width: wp('40%'),
                                  height: hp('5%'),
                                  backgroundColor: '#94C036',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                  }}>
                                  {translate('Save')}
                                </Text>
                              </TouchableOpacity> */}
                            </View>
                          </View>
                        );
                      })
                    : null}
                  {supplierId === '' ? null : (
                    <View style={{}}>
                      <View
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 6,
                          marginTop: hp('3%'),
                        }}>
                        <TextInput
                          placeholder="Notes"
                          style={{
                            paddingVertical: '20%',
                            paddingLeft: 20,
                            paddingTop: 10,
                          }}
                          multiline={true}
                          numberOfLines={4}
                          onChangeText={note => this.setState({note})}
                          value={note}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          <Modal isVisible={imageModalStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('70%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#412916',
                  height: hp('7%'),
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    flex: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 16, color: '#fff'}}>
                    {translate('Manual Log small')} -{' '}
                    {translate('Add new item')}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.setModalVisibleImage(false)}>
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
                  <View>
                    <Image
                      style={{
                        width: wp('60%'),
                        height: 100,
                        resizeMode: 'cover',
                      }}
                      source={{uri: imageData.path}}
                    />
                  </View>
                  <View style={{}}>
                    <TextInput
                      placeholder="Enter Name"
                      value={imageName}
                      style={{
                        borderWidth: 1,
                        padding: 12,
                        marginBottom: hp('3%'),
                        justifyContent: 'space-between',
                        marginTop: 20,
                      }}
                      onChangeText={value => {
                        this.setState({
                          imageName: value,
                        });
                      }}
                    />
                  </View>
                  <View style={{}}>
                    <TextInput
                      placeholder="Enter Description"
                      value={imageDesc}
                      style={{
                        borderWidth: 1,
                        padding: 12,
                        marginBottom: hp('3%'),
                        justifyContent: 'space-between',
                      }}
                      onChangeText={value => {
                        this.setState({
                          imageDesc: value,
                        });
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => this.deleteImageFun()}
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      alignSelf: 'flex-end',
                      backgroundColor: 'red',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                      {translate('Delete')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.saveImageFun()}
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      alignSelf: 'flex-end',
                      backgroundColor: '#94C036',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 10,
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
                </View>
              </ScrollView>
            </View>
          </Modal>
          <Modal isVisible={chooseImageModalStatus} backdropOpacity={0.35}>
            <View
              style={{
                width: wp('80%'),
                height: hp('25%'),
                backgroundColor: '#fff',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#412916',
                  height: hp('7%'),
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    flex: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 16, color: '#fff'}}>
                    {translate('Add image')}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.setModalVisibleImage(false)}>
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
                  <TouchableOpacity
                    onPress={() => this.choosePhotoFun()}
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      alignSelf: 'flex-end',
                      backgroundColor: 'red',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                      {translate('Choose image from gallery')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.clickPhotoFun()}
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      alignSelf: 'flex-end',
                      backgroundColor: '#94C036',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                      {translate('Click Photo')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </ScrollView>
        <View style={{}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: hp('2%'),
            }}>
            {supplierId === '' || productionDate === '' ? null : (
              //  (
              //   <View
              //     opacity={0.5}
              //     style={{
              //       width: wp('30%'),
              //       height: hp('5%'),
              //       alignSelf: 'flex-end',
              //       backgroundColor: '#94C036',
              //       justifyContent: 'center',
              //       alignItems: 'center',
              //       borderRadius: 100,
              //     }}>
              //     <Text
              //       style={{
              //         color: '#fff',
              //         fontSize: 15,
              //         fontWeight: 'bold',
              //       }}>
              //       {saveLoader ? (
              //         <ActivityIndicator size="small" color="#fff" />
              //       ) : (
              //         translate('Save')
              //       )}
              //     </Text>
              //   </View>
              // )

              <TouchableOpacity
                disabled={saveTouchableStatus}
                onPress={() => this.createOrder()}
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
                  {saveLoader ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    translate('Save')
                  )}
                </Text>
              </TouchableOpacity>
            )}
            {supplierId === '' ? null : (
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
            )}
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

export default connect(mapStateToProps, {UserTokenAction})(index);
