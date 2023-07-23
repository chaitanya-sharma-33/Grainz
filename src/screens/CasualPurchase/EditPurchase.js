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
  Pressable,
  Alert,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import DropDownPicker from 'react-native-dropdown-picker';
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
  deleteOrderApi,
  updateOrderApi,
  getOrderByIdApi,
  getInventoryByIdApi,
  getInventoryListApi,
  getOrderImagesByIdApi,
  getCasualListNewApi,
  lookupDepartmentsApi,
} from '../../connectivity/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {translate} from '../../utils/translations';
import ImagePicker from 'react-native-image-crop-picker';
import styles from './style';
import ModalPicker from '../../components/ModalPicker';
import RNPickerSelect from 'react-native-picker-select';
import TreeSelect from 'react-native-tree-select';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);
const numColumns = 2;

let list = [];
let total = 0;

class EditPurchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      isDatePickerVisible: false,
      finalDate: '',
      productionDate: '',
      purchaseLines: [],
      htva: false,
      htvaIsSelected: false,
      auditIsSelected: false,
      note: '',
      supplierList: [],
      treeselectDataBackup: [],
      object: {
        date: '',
        supplier: '',
        items: [{name: '', quantity: null, price: null}],
      },
      showSuppliers: false,
      supplier: 'Select Supplier',
      editDisabled: true,
      editColor: '#E9ECEF',
      swapButton: false,
      yourOrder: {},
      supplierId: '',
      supplieReference: '',
      itemsTypesArr: [],
      departmentName: '',
      loading: true,
      items: [],
      selectedItems: [],
      selectedItemObjects: '',
      yourOrderItems: [],
      yourOrderItemsBackup: [],
      newOrderItems: [],
      testItem: null,
      orderTotal: 0,
      photo: null,
      editDataLoader: true,
      orderId: '',
      orderItemsFinal: [],
      deleteLoader: false,
      updateLoader: false,
      imageData: '',
      imageShow: false,
      imageModalStatus: false,
      imageName: '',
      imageDesc: '',
      imageDataEdit: '',
      buttonsSubHeader: [],
      recipeLoader: true,
      placeHolderTextDept: 'Select Supplier',
      dataListLoader: false,
      selectedTextUser: '',
      treeselectData: [],
      switchValue: false,
      imagesLoader: true,
      orderData: '',
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
          firstName: res.data.firstName,
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
    getSupplierListApi()
      .then(res => {
        this.setState({supplierList: res.data});
      })
      .catch(error => {
        console.warn('erro', error);
      });
  }

  getDepartmentData() {
    lookupDepartmentsApi()
      .then(res => {
        console.log('resss', res.data);
        let finalArray = res.data.map((item, index) => {
          return {
            id: item.id,
            name: item.displayName,
          };
        });
        this.setState({
          departmentData: finalArray,
          buttonsLoader: false,
        });
      })
      .catch(error => {
        console.log('err', error.response);
      });
  }

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      const {route} = this.props;
      const order = route.params.orderData;
      const item = route.params.item;
      this.getProfileDataFun();
      this.getSupplierListData();
      this.showEditCasualPurchase(order);
      this.getImagesFun(order);
      this.getNewCasualListFun();
      this.getDepartmentData();
      this.setState({
        orderData: order,
      });
      console.log('itemmmmFilter', item);
      if (item) {
        this.selectUserNameFun(item);
      }
    });
  }

  getNewCasualListFun() {
    getCasualListNewApi()
      .then(res => {
        // console.log('resss-->getNewCasualListFun', res);
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

  getImagesFun = order => {
    console.log('order-->IMages', order);

    const id = order.id;
    getOrderImagesByIdApi(id)
      .then(res => {
        console.log('res-->IMages', res);
        this.setState({
          imageData: res.data,
          imagesLoader: false,
        });
      })
      .catch(error => {
        this.setState({
          imagesLoader: false,
        });
        console.log('ErrorImages', error);
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

  showEditCasualPurchase(order) {
    total = 0;
    this.getOrderById(order.id);
    this.setState({
      supplier: order.supplierName,
      yourOrder: order,
      departmentName: order.departmentName,
      orderId: order.id,
      supplierId: order.supplierId,
      productionDate: order.orderDate,
      auditIsSelected: order.isAuditComplete,
      note: order.notes,
      selectedTextUser: order.supplierName,
    });
    list = [];

    // this.getInventoryList('9df266dc-bf87-454e-b678-21c14647a23d');
  }

  getOrderById(id) {
    let list = [];
    let obj = {};
    getOrderByIdApi(id)
      .then(res => {
        // console.log('res-->getOrderByIdApi', res);
        const orderTotal = res.data.orderItems.reduce(
          (n, {unitPrice}) => n + Number(unitPrice),
          0,
        );
        this.setState({
          yourOrder: res.data,
          orderTotal,
        });

        res.data.orderItems.map(item => {
          this.getItem(item.inventoryId, item);
          this.getFinalArray(item);
        });
      })
      .catch(error => console.warn(error));
  }

  getFinalArray = item => {
    // const {orderItemsFinal} = this.state;
    let objSec = {};
    let newlist = [];
    objSec = {
      action: 'Update',
      id: item.id,
      inventoryId: item.inventoryId,
      inventoryProductMappingId: '',
      isCorrect: item.isCorrect,
      notes: '',
      position: 1,
      quantityOrdered: item.quantityOrdered,
      tdcVolume: 0,
      unitId: item.unitId,
      unitPrice: item.unitPrice,
      hasWarning: item.hasWarning,
    };

    newlist.push(objSec);
    this.setState({
      // orderItemsFinal: [...orderItemsFinal, ...newlist],
    });
  };

  getItem(id, item) {
    // console.log('item', item);
    let obj = {};

    getInventoryByIdApi(id)
      .then(res => {
        // console.log('res--> getInventoryByIdApi', res);
        const finalUnits = res.data.units.map((subItem, subIndex) => {
          return {
            label: subItem.name,
            value: subItem.id,
            converter: subItem.converter,
            isDefault: subItem.isDefault,
          };
        });

        // total = total + item.orderValue;
        obj = {
          action: 'Update',
          id: item.id,
          inventoryId: item.inventoryId,
          inventoryProductMappingId: '',
          isCorrect: item.isCorrect,
          notes: '',
          position: 1,
          quantityOrdered:
            item.quantityOrdered && item.quantityOrdered.toString(),
          tdcVolume: 0,
          unitId: item.unitId,
          unitPrice: item.unitPrice && item.unitPrice.toString(),
          name: res.data.name,
          departmentName: res.data.departmentName,
          units: finalUnits,
          isRollingAverageUsed: item.isRollingAverageUsed,
          rollingAveragePrice: item.rollingAveragePrice,
          hasWarning: item.hasWarning,
        };

        list.push(obj);
        this.setState({
          // orderTotal: total,
          yourOrderItems: list,
          yourOrderItemsBackup: list,
          editDataLoader: false,
          departmentName: res.data.departmentName,
        });
      })
      .catch(error => console.warn('invIdError', error));
  }

  showCasualPurchases() {
    this.setState({
      editDisabled: true,
      editColor: '#FFFFFF',
      swapButton: false,
    });
  }

  editCasualPurchase() {
    this.setState({
      editDisabled: false,
      editColor: '#FFFFFF',
      swapButton: true,
      departmentName: '',
    });
  }

  updateCasualPurchase() {
    const {
      note,
      auditIsSelected,
      supplierId,
      productionDate,
      orderId,
      // orderItemsFinal,
      imageName,
      imageDesc,
      imageData,
      imageDataEdit,
      yourOrderItems,
      htvaIsSelected,
    } = this.state;
    let payload = {
      id: orderId,
      supplierId: supplierId,
      isHTVA: htvaIsSelected,
      isAuditComplete: auditIsSelected,
      orderDate: productionDate,
      notes: note,
      orderItems: yourOrderItems,
      // images: [],
      images: imageDataEdit ? imageDataEdit : imageData ? imageData : [],
    };

    console.log('payload', payload);

    if (this.payloadValidation()) {
      if (yourOrderItems.length > 0) {
        this.setState(
          {
            updateLoader: true,
          },
          () =>
            updateOrderApi(payload)
              .then(res => {
                this.setState(
                  {
                    updateLoader: false,
                  },
                  () => this.goBackFun(),
                );
                // Alert.alert('Grainz', 'Order updated successfully', [
                //   {text: 'OK', onPress: () => this.goBackFun()},
                // ]);
              })
              .catch(error => {
                this.setState({
                  updateLoader: false,
                });
                console.warn('updateFailed', error.response);
              }),
        );
      } else {
        alert('Please add atleast one item');
      }
    }
  }

  deleteCasualPurchase(param) {
    Alert.alert('Are you sure?', "You won't be able to revert this!", [
      {
        text: 'Cancel',
        onPress: () => this.showCasualPurchases(),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => this.deleteFun(param),
      },
    ]);
  }

  deleteFun = param => {
    this.setState(
      {
        deleteLoader: true,
      },
      () =>
        deleteOrderApi(param)
          .then(res => {
            this.showCasualPurchases();
            this.setState(
              {
                deleteLoader: false,
              },
              () => this.goBackFun(),
            );
            // Alert.alert('Grainz', 'Order deleted successfully', [
            //   {
            //     text: 'Okay',
            //     onPress: () => this.goBackFun(),
            //   },
            // ]);
          })
          .catch(error => {
            this.setState({
              deleteLoader: false,
            });
            console.warn('DELETEerror', error.response);
          }),
    );
  };

  handleConfirm = date => {
    let newdate = moment(date).format('DD/MM/YYYY');
    this.setState({
      finalDate: newdate,
      productionDate: date,
    });

    this.hideDatePicker();
  };

  handleChoosePhoto() {
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
          description: item.description,
          imageText: `data:image/png;base64,${item.data}`,
          name: item.name,
          path: item.path,
          position: 1,
          type: 'png',
        };
      });
      this.setState({
        // imageModalStatus: true,
        imageData: [],
        imageDataEdit: finalImageData,
      });
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

  addPurchaseLine() {
    const {yourOrderItems} = this.state;
    let obj = {};
    let newlist = [];
    obj = {
      action: 'New',
      id: '',
      inventoryId: '',
      inventoryProductMappingId: '',
      isCorrect: false,
      notes: '',
      position: '',
      quantityOrdered: '',
      tdcVolume: 0,
      unitId: '',
      unitPrice: '',
      name: '',
      hasWarning: null,
    };

    newlist.push(obj);

    this.setState({yourOrderItems: [...yourOrderItems, ...newlist]});
  }

  deletePurchaseLine(index, type) {
    // this.setState({yourOrderItems: temp});

    const {yourOrderItems} = this.state;
    // const {orderItemsFinal} = this.state;

    // let newArr = orderItemsFinal.map((item, i) =>
    let newArr = yourOrderItems.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: 'Delete',
          }
        : item,
    );

    let temp = this.state.yourOrderItemsBackup;
    temp.splice(index, 1);

    this.setState({
      // orderItemsFinal: [...newArr],
      yourOrderItems: [...newArr],
      yourOrderItemsBackup: temp,
    });

    // let temp = this.state.purchaseLines;
    // temp.pop();
    // this.setState({purchaseLines: temp});
  }

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

        // console.log('finArr', finalArray);

        this.setState({
          items: [...finalArray],
          loading: false,
        });
      })
      .catch(err => {
        console.warn('GETITEMSErr', err.response);
      });
  };

  filterData(array) {
    const restArray = array.filter(item => item.departmentName === 'Kitchen');
    restArray.sort();
    const barArray = array.filter(item => item.departmentName === 'Bar');
    barArray.sort();
    const otherArray = array.filter(item => item.departmentName === 'Other');
    otherArray.sort();
    const retailArray = array.filter(item => item.departmentName === 'Retail');
    retailArray.sort();
  }

  onSelectedItemsChange = selectedItems => {
    this.setState({selectedItems});
  };

  goBackFun = () => {
    this.props.navigation.goBack();
  };

  // selectDepartementNameFun = (index, type, item) => {
  //   const {yourOrderItems} = this.state;
  //   const value = item.value;

  //   let newArr = yourOrderItems.map(
  //     (item, i) =>
  //       index === i
  //         ? {
  //             ...item,
  //             [type]: value,
  //           }
  //         : item,
  //     //   if (index === i) {
  //     //     if (type === 'quantityOrdered') {
  //     //       return item.quantityOrdered === value;
  //     //     }
  //     //   }
  //   );
  //   this.setState(
  //     {
  //       yourOrderItems: [...newArr],
  //       orderItemsFinal: [...newArr],
  //       departmentName: item.value,
  //       loading: true,
  //       viewStatus: true,
  //     },
  //     () => this.getManualData(),
  //   );
  // };

  selectDepartementNameFun = value => {
    if (value) {
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
    }
  };

  payloadValidation = () => {
    let formIsValid = true;
    const {yourOrderItems} = this.state;
    // console.log('PAYVALIDATION', yourOrderItems);
    if (yourOrderItems.length > 0) {
      for (let i of yourOrderItems) {
        if (i.quantityOrdered === '' && i.action !== 'Delete') {
          i.error = 'Quantity is required';
          formIsValid = false;
          // this.setState({
          //   quantityError: 'Quantity is required',
          // });
        } else if (i.unitPrice === '' && i.action !== 'Delete') {
          i.error = 'Price is required';
          formIsValid = false;
          // this.setState({
          //   priceError: 'Price is required',
          // });
        } else if (i.unitId === null) {
          i.error = 'Please select unit';
          formIsValid = false;
          // this.setState({
          //   priceError: 'Price is required',
          // });
        }
      }
    } else {
      alert('NO');
    }
    this.setState({
      yourOrderItems,
    });
    return formIsValid;
  };

  onSelectedItemObjectsChange = async (type, value, finalValue) => {
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
        hasWarning: item.hasWarning,
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
        yourOrderItems: [...finalArray],
        yourOrderItemsBackup: [...finalArray],
      },
      // ,
      // () => this.addDataFun(index, type, value, finalValue),
    );
  };

  // onSelectedItemObjectsChange = (
  //   index,
  //   type,
  //   selectedItemObjects,
  //   id,
  //   invId,
  // ) => {
  //   const {yourOrderItems} = this.state;

  //   const value = selectedItemObjects[0].name;
  //   const unitId = selectedItemObjects[0].units[0].id;
  //   const inventoryId = selectedItemObjects[0].units[0].inventoryId;

  //   let newArr = yourOrderItems.map((item, i) =>
  //     index === i
  //       ? {
  //           ...item,
  //           [type]: value,
  //           [id]: unitId,
  //           [invId]: inventoryId,
  //         }
  //       : item,
  //   );
  //   this.setState({
  //     selectedItemObjects,
  //     yourOrderItems: [...newArr],
  //     // orderItemsFinal: [...newArr],
  //   });
  // };

  editQuantityPriceFun = (index, type, value) => {
    const {yourOrderItems} = this.state;

    let newArr = yourOrderItems.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
          }
        : item,
    );
    this.setState({
      yourOrderItems: [...newArr],
      yourOrderItemsBackup: [...newArr],
      // orderItemsFinal: [...newArr],
    });
  };

  setModalVisibleImage = () => {
    this.setState({
      imageModalStatus: false,
      imageDataEdit: '',
    });
  };

  deleteImageFun = () => {
    this.setState({
      imageModalStatus: false,
      imageDataEdit: '',
      imageShow: false,
    });
  };

  saveImageFun = () => {
    this.setState({
      imageModalStatus: false,
      // imageShow: true,
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
    const {yourOrderItems} = this.state;
    // const finalUnitId =
    //   selectedItemObjects && selectedItemObjects[0].units[0].id;
    if (type === 'isRollingAverageUsed' && key === 'all') {
      const finalVal = value;
      // console.log('finalVal', finalVal);
      // console.log('type', type);
      // console.log('key', key);

      let newArr = yourOrderItems.map((item, i) =>
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

      // console.log('NEWA--ALLITEMS', newArr);
      const orderTotal = newArr.reduce(
        (n, {unitPrice}) => n + Number(unitPrice),
        0,
      );

      // console.log('orderTotal--ALLITEMS', orderTotal);

      this.setState({
        yourOrderItems: [...newArr],
        yourOrderItemsBackup: [...newArr],
        orderTotal: value === true ? orderTotal : 0.0,
        switchValue: finalVal,
      });
    } else {
      if (type === 'isRollingAverageUsed') {
        // console.log('rollingAveragePrice', rollingAveragePrice);
        const finalQuantity = quantityOrdered === '' ? 0 : quantityOrdered;
        // console.log('finalQuantity', finalQuantity);
        // const finalPrice = rollingAveragePrice * finalQuantity;

        var indexUnitsSec = item.units.findIndex(p => p.value == item.unitId);
        const converter = item.units[indexUnitsSec].converter;

        console.log('converter', converter);

        const finalPrice = rollingAveragePrice * finalQuantity * converter;
        // console.log('finalPrice', finalPrice);
        // console.log('valueee', value);

        let newArr = yourOrderItems.map((item, i) =>
          index === i
            ? {
                ...item,
                [type]: value,
                ['unitPrice']: value === true ? finalPrice.toFixed(2) : '',
              }
            : item,
        );

        // console.log('NEWA', newArr);
        const orderTotal = newArr.reduce(
          (n, {unitPrice}) => n + Number(unitPrice),
          0,
        );

        this.setState({
          yourOrderItems: [...newArr],
          yourOrderItemsBackup: [...newArr],
          orderTotal,
        });
      } else {
        if (type === 'quantityOrdered' && isRollingAverageUsed === true) {
          // console.log('rollingAveragePrice', rollingAveragePrice);
          const finalQuantity = value ? value : 1;
          // console.log('finalQuantity', finalQuantity);
          // const finalPrice = rollingAveragePrice * finalQuantity;
          // console.log('finalPrice', finalPrice);

          var indexUnitsSec = item.units.findIndex(p => p.value == item.unitId);
          const converter = item.units[indexUnitsSec].converter;

          console.log('converter', converter);

          const finalPrice = rollingAveragePrice * finalQuantity * converter;
          let newArr = yourOrderItems.map((item, i) =>
            index === i
              ? {
                  ...item,
                  [type]: value,
                  ['unitPrice']: finalPrice.toFixed(2),
                }
              : item,
          );
          // console.log('NEWA', newArr);
          const orderTotal = newArr.reduce(
            (n, {unitPrice}) => n + Number(unitPrice),
            0,
          );

          this.setState({
            yourOrderItems: [...newArr],
            yourOrderItemsBackup: [...newArr],
            orderTotal,
            // selectedItems: finalValue,
          });
        } else {
          if (isRollingAverageUsed === true && value !== null) {
            // console.log('va-->', value);
            // console.log('UNITS-->', item.units);
            // console.log('indexUnits-->', indexUnits);
            const finalUnit = indexUnits - 1;
            const isDefault = item.units[finalUnit].isDefault;
            const converter = item.units[finalUnit].converter;

            // console.log('isDefault-->', isDefault);

            // console.log('rollingAveragePrice', rollingAveragePrice);
            const finalQuantity = item.quantityOrdered
              ? item.quantityOrdered
              : 1;
            // console.log('finalQuantity', finalQuantity);
            const finalPrice = rollingAveragePrice * finalQuantity;
            const finalPriceSec =
              rollingAveragePrice * finalQuantity * converter;
            const lastPrice =
              isDefault === true ? finalPriceSec : finalPriceSec;
            // console.log('finalPrice', finalPrice);
            // console.log('valueee', value);

            let newArr = yourOrderItems.map((item, i) =>
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
            // console.log('NEWA', newArr);
            const orderTotal = newArr.reduce(
              (n, {unitPrice}) => n + Number(unitPrice),
              0,
            );

            this.setState({
              yourOrderItems: [...newArr],
              yourOrderItemsBackup: [...newArr],
              orderTotal,
              // selectedItems: finalValue,
            });
          } else {
            let newArr = yourOrderItems.map((item, i) =>
              index === i
                ? {
                    ...item,
                    [type]: value,
                    // ['unitId']: finalUnitId,
                    // ['position']: index,
                  }
                : item,
            );
            // console.log('NEWA', newArr);
            const orderTotal = newArr.reduce(
              (n, {unitPrice}) => n + Number(unitPrice),
              0,
            );

            this.setState({
              yourOrderItems: [...newArr],
              yourOrderItemsBackup: [...newArr],
              orderTotal,
              // selectedItems: finalValue,
            });
          }
        }
      }
    }
  };

  // showSupplierList() {
  //   this.setState({showSuppliers: !this.state.showSuppliers});
  // }

  // selectSupplier(param, id, ref) {
  //   this.setState({supplier: param, supplierId: id, supplieReference: ref});
  //   this.showSupplierList();
  // }

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
    // console.log('_onClickLeaf', item);

    // deletePurchaseLine(index) {
    //   const {orderItemsFinal, treeselectDataBackup} = this.state;
    //   let temp = this.state.orderItemsFinal;
    //   temp.splice(index, 1);
    //   this.setState({
    //     orderItemsFinal: temp,
    //     treeselectData: treeselectDataBackup,
    //   });
    // }
    const {yourOrderItems} = this.state;

    const finalData = item.item;
    // console.log('finalData', finalData);

    const finalArr = yourOrderItems;
    // console.log('finalArr', finalArr);

    const magenicIndexS = yourOrderItems.findIndex(vendor =>
      console.log('vendor', vendor),
    );

    let obj = yourOrderItems.find(o => o.inventoryId === finalData.id);

    // console.log('obj', obj);

    const magenicIndex = yourOrderItems.findIndex(
      vendor => vendor.inventoryId === finalData.id,
    );
    // console.log('magenicIndex', magenicIndex);

    if (obj === undefined) {
      finalArr.push(finalData);
      let finalArray = finalArr.map((item, index) => {
        // console.log('item', item);
        let finaUnitVal =
          item &&
          item.units.map((subItem, subIndex) => {
            if (subItem.isDefault === true) {
              return subItem.id ? subItem.id : subItem.value;
            }
          });
        const filteredUnit = finaUnitVal.filter(elm => elm);
        // console.log('filteredUnit--->', filteredUnit);
        const finalUnits = item.units.map((subItem, subIndex) => {
          // console.log('sunItem', subItem);
          return {
            label: subItem.name ? subItem.name : subItem.label,
            value: subItem.id ? subItem.id : subItem.value,
            converter: subItem.converter,
            isDefault: subItem.isDefault,
          };
        });
        return {
          action: item.action === 'Update' ? 'Update' : 'New',
          id: '',
          inventoryId: item.inventoryId ? item.inventoryId : item.id,
          inventoryProductMappingId: '',
          isCorrect: item.isCorrect,
          hasWarning: item.hasWarning,
          notes: '',
          position: index + 1,
          quantityOrdered: item.quantityOrdered ? item.quantityOrdered : '',
          tdcVolume: 0,
          unitId: filteredUnit[0],
          unitPrice: item.unitPrice ? item.unitPrice : '',
          name: item.name,
          units: finalUnits,
          rollingAveragePrice: item.rollingAveragePrice,
          isRollingAverageUsed: item.isRollingAverageUsed,
        };
      });

      this.setState({
        yourOrderItems: [...finalArray],
        yourOrderItemsBackup: [...finalArray],
      });
    } else {
      if (obj.action === 'Delete') {
        finalArr.push(finalData);
        let finalArray = finalArr.map((item, index) => {
          // console.log('item', item);
          let finaUnitVal =
            item &&
            item.units.map((subItem, subIndex) => {
              if (subItem.isDefault === true) {
                return subItem.id ? subItem.id : subItem.value;
              }
            });
          const filteredUnit = finaUnitVal.filter(elm => elm);
          // console.log('filteredUnit--->', filteredUnit);
          const finalUnits = item.units.map((subItem, subIndex) => {
            // console.log('sunItem', subItem);
            return {
              label: subItem.name ? subItem.name : subItem.label,
              value: subItem.id ? subItem.id : subItem.value,
              converter: subItem.converter,
              isDefault: subItem.isDefault,
            };
          });
          return {
            action: item.action === 'Update' ? 'Update' : 'New',
            id: '',
            inventoryId: item.inventoryId ? item.inventoryId : item.id,
            inventoryProductMappingId: '',
            isCorrect: item.isCorrect,
            notes: '',
            hasWarning: item.hasWarning,
            position: index + 1,
            quantityOrdered: item.quantityOrdered ? item.quantityOrdered : '',
            tdcVolume: 0,
            unitId: filteredUnit[0],
            unitPrice: item.unitPrice ? item.unitPrice : '',
            name: item.name,
            units: finalUnits,
            rollingAveragePrice: item.rollingAveragePrice,
            isRollingAverageUsed: item.isRollingAverageUsed,
          };
        });

        this.setState({
          yourOrderItems: [...finalArray],
          yourOrderItemsBackup: [...finalArray],
        });
      }
    }
    // if (magenicIndex === -1) {
    //   finalArr.push(finalData);
    //   let finalArray = finalArr.map((item, index) => {
    //     console.log('item', item);
    //     let finaUnitVal =
    //       item &&
    //       item.units.map((subItem, subIndex) => {
    //         if (subItem.isDefault === true) {
    //           return subItem.id ? subItem.id : subItem.value;
    //         }
    //       });
    //     const filteredUnit = finaUnitVal.filter(elm => elm);
    //     console.log('filteredUnit--->', filteredUnit);
    //     const finalUnits = item.units.map((subItem, subIndex) => {
    //       console.log('sunItem', subItem);
    //       return {
    //         label: subItem.name ? subItem.name : subItem.label,
    //         value: subItem.id ? subItem.id : subItem.value,
    //         converter: subItem.converter,
    //         isDefault: subItem.isDefault,
    //       };
    //     });
    //     return {
    //       action: item.action === 'Update' ? 'Update' : 'New',
    //       id: '',
    //       inventoryId: item.inventoryId ? item.inventoryId : item.id,
    //       inventoryProductMappingId: '',
    //       isCorrect: false,
    //       notes: '',
    //       position: index + 1,
    //       quantityOrdered: item.quantityOrdered ? item.quantityOrdered : '',
    //       tdcVolume: 0,
    //       unitId: filteredUnit[0],
    //       unitPrice: item.unitPrice ? item.unitPrice : '',
    //       name: item.name,
    //       units: finalUnits,
    //       rollingAveragePrice: item.rollingAveragePrice,
    //       isRollingAverageUsed: item.isRollingAverageUsed,
    //     };
    //   });

    //   this.setState({
    //     yourOrderItems: [...finalArray],
    //     yourOrderItemsBackup: [...finalArray],
    //   });
    // } else {
    //   var filteredArray = yourOrderItems.filter(function (e) {
    //     return e.inventoryId !== finalData.id;
    //   });
    //   console.log('filteredArray', filteredArray);

    //   this.setState({
    //     yourOrderItems: filteredArray,
    //     yourOrderItemsBackup: filteredArray,
    //   });
    // }
  };

  render() {
    const {
      firstName,
      buttons,
      isDatePickerVisible,
      finalDate,
      purchaseLines,
      htva,
      htvaIsSelected,
      auditIsSelected,
      note,
      showSuppliers,
      supplierList,
      supplier,
      editDisabled,
      editColor,
      swapButton,
      yourOrder,
      items,
      notes,
      loading,
      departmentName,
      itemsTypesArr,
      selectedItemObjects,
      testItem,
      yourOrderItems,
      yourOrderItemsBackup,
      orderTotal,
      photo,
      newOrderItems,
      editDataLoader,
      deleteLoader,
      updateLoader,
      imageData,
      imageShow,
      imageModalStatus,
      imageDesc,
      imageName,
      imageDataEdit,
      buttonsSubHeader,
      recipeLoader,
      placeHolderTextDept,
      dataListLoader,
      selectedTextUser,
      selectedItems,
      treeselectData,
      switchValue,
      imagesLoader,
      orderData,
      departmentData,
    } = this.state;
    console.log('imageData', imageData);
    console.log('imageDataEdit', imageDataEdit);
    console.log('yourOrderItms', yourOrderItems);

    return (
      <View style={styles.container}>
        <Header
          logout={firstName}
          logoutFun={this.myProfileFun}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <View style={styles.goBackContainer}>
                  <Image source={img.backIcon} style={styles.tileImageBack} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.adminTextStyle}>{supplier}</Text>
                </View>
              </TouchableOpacity>
              {swapButton ? (
                <TouchableOpacity
                  onPress={() => this.deleteCasualPurchase(yourOrder.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // flex: 1,
                    justifyContent: 'flex-end',
                  }}>
                  <Image
                    source={img.deleteIconNew}
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 10,
                      resizeMode: 'contain',
                      tintColor: '#FF0303',
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => this.editCasualPurchase()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: '#fff',
                    borderRadius: 100,
                    padding: 6,
                  }}>
                  <Image
                    source={img.editIconGreen}
                    style={{
                      width: 21,
                      height: 21,
                      resizeMode: 'contain',
                      tintColor: '#77a3d6',
                    }}
                  />
                  {/* <Text
                    style={{
                      fontSize: 18,
                      fontFamily: 'Inter-Regular',
                      color: '#94C01F',
                    }}>
                    {translate('Edit')}
                  </Text> */}
                </TouchableOpacity>
              )}
              {/* <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={styles.goBackContainer}>
                <Text style={styles.goBackTextStyle}>
                  {' '}
                  {translate('Go Back')}
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
          {/* <View style={{}}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Casual purchase')} Details
                </Text>
              </View>
              {swapButton ? (
                <TouchableOpacity
                  onPress={() => this.deleteCasualPurchase(yourOrder.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // flex: 1,
                    justifyContent: 'flex-end',
                  }}>
                  <Image
                    source={img.deleteIconNew}
                    style={{
                      width: 18,
                      height: 18,
                      marginRight: 10,
                      resizeMode: 'contain',
                      tintColor: '#FF0303',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: 'Inter-Regular',
                      color: '#FF0303',
                    }}>
                    {translate('Delete')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => this.editCasualPurchase()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // flex: 1,
                    justifyContent: 'flex-end',
                  }}>
                  <Image
                    source={img.editIconGreen}
                    style={{
                      width: 20,
                      height: 20,
                      marginRight: 10,
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: 'Inter-Regular',
                      color: '#94C01F',
                    }}>
                    {translate('Edit')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View> */}

          {editDataLoader ? (
            <ActivityIndicator color="grey" size="large" />
          ) : (
            <View style={{marginHorizontal: wp('6%'), marginTop: hp('2%')}}>
              <View style={{}}>
                <View style={{}}>
                  <TouchableOpacity
                    disabled={editDisabled}
                    onPress={() => this.showDatePickerFun()}
                    style={{
                      padding: 14,
                      marginBottom: hp('2%'),
                      justifyContent: 'space-between',
                      backgroundColor: '#f2f2f2',
                      borderRadius: 6,
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                        }}>
                        Purchase Date
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <TextInput
                        placeholder={moment(yourOrder.orderDate).format(
                          'DD/MM/YYYY',
                        )}
                        placeholderTextColor="black"
                        value={finalDate}
                        editable={false}
                        style={{
                          width: wp('75%'),
                          marginTop: 10,
                          fontWeight: 'bold',
                        }}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 18,
                          height: 18,
                          resizeMode: 'contain',
                          alignSelf:
                            Platform.OS === 'android' ? 'center' : null,
                          marginRight: Platform.OS === 'android' ? 10 : 0,
                          tintColor: 'grey',
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <DateTimePickerModal
                // is24Hour={true}
                isVisible={isDatePickerVisible}
                mode={'date'}
                onConfirm={this.handleConfirm}
                onCancel={this.hideDatePicker}
                minimumDate={minTime}
              />

              {editDisabled ? null : (
                <View style={{}}>
                  <View style={{}}>
                    <TouchableOpacity
                      // onPress={() => this.showSupplierList()}
                      onPress={() =>
                        this.props.navigation.navigate('SupplierListScreen', {
                          screenType: 'Edit',
                          orderData: orderData,
                        })
                      }
                      style={{
                        padding: 15,
                        marginBottom: hp('3%'),
                        backgroundColor: '#fff',
                        borderRadius: 6,
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                        }}>
                        {translate('Supplier')}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 10,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 16,
                          }}>
                          {supplier}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!editDisabled ? (
                <View
                  style={{
                    ...styles.subContainer,
                    alignItems: 'center',
                  }}>
                  <FlatList
                    data={departmentData}
                    renderItem={({item}) => (
                      <View
                        style={{
                          width:
                            Dimensions.get('window').width / numColumns -
                            wp('6%'),
                          borderRadius: 50,
                        }}>
                        <TouchableOpacity
                          onPress={() => this.onPressFun(item)}
                          style={{
                            backgroundColor:
                              item.name === 'Kitchen'
                                ? '#D448A7'
                                : item.name === 'Bar'
                                ? '#B2B4B8'
                                : item.name === 'Retail'
                                ? '#E1A72E'
                                : '#7CBF31',
                            flex: 1,
                            borderRadius: 8,
                            padding: 10,
                            margin: hp('1%'),
                            flexDirection: 'row',
                          }}>
                          <View
                            style={{
                              flex: 1.5,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Image
                              source={
                                item.name === 'Kitchen'
                                  ? img.stokeTakeIcon
                                  : item.name === 'Bar'
                                  ? img.CasualIcon
                                  : item.name === 'Retail'
                                  ? img.CasualIcon
                                  : img.miscIcon
                              }
                              style={{
                                height: 20,
                                width: 20,
                                resizeMode: 'contain',
                                tintColor: '#fff',
                              }}
                            />
                          </View>
                          <View style={{flex: 3}}>
                            <View
                              style={{
                                flex: 1,
                                justifyContent: 'flex-end',
                              }}>
                              <Text
                                style={{
                                  fontSize: 13.5,
                                  fontFamily: 'Inter-Regular',
                                  fontWeight: 'bold',
                                  color: '#fff',
                                }}
                                numberOfLines={1}>
                                {item.name}
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                justifyContent: 'flex-start',
                                marginTop: 5,
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontFamily: 'Inter-Regular',
                                  color: '#fff',
                                }}
                                numberOfLines={1}>
                                {item.name === 'Kitchen'
                                  ? `1 ${translate('Selected')}`
                                  : item.name === 'Bar'
                                  ? `2 ${translate('Selected')}`
                                  : item.name === 'Retail'
                                  ? `3 ${translate('Selected')}`
                                  : `4 ${translate('Selected')}`}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                    keyExtractor={item => item.id}
                    numColumns={2}
                  />
                </View>
              ) : // <View
              //   style={{
              //     marginBottom: 15,
              //   }}>
              //   <TreeSelect
              //     data={treeselectData}
              //     // isOpen
              //     // openIds={['A01']}
              //     // defaultSelectedId={['B062']}
              //     isShowTreeId={false}
              //     // selectType="single"
              //     selectType="multiple"
              //     itemStyle={{
              //       // backgroudColor: '#8bb0ee',
              //       fontSize: 12,
              //       color: '#995962',
              //     }}
              //     selectedItemStyle={{
              //       backgroudColor: '#f7edca',
              //       fontSize: 16,
              //       color: '#171e99',
              //     }}
              //     onClick={item => this._onClick(item)}
              //     onClickLeaf={item => this._onClickLeaf(item)}
              //     treeNodeStyle={{
              //       // openIcon: <Icon size={18} color="#171e99" style={{ marginRight: 10 }} name="ios-arrow-down" />,
              //       // closeIcon: <Icon size={18} color="#171e99" style={{ marginRight: 10 }} name="ios-arrow-forward" />
              //       openIcon: (
              //         <Image
              //           resizeMode="stretch"
              //           style={{width: 18, height: 15}}
              //           source={img.arrowDownIcon}
              //         />
              //       ),
              //       closeIcon: (
              //         <Image
              //           resizeMode="stretch"
              //           style={{width: 18, height: 15}}
              //           source={img.arrowRightIcon}
              //         />
              //       ),
              //     }}
              //   />
              // </View>
              null}
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
                      width: wp('80%'),
                    }}>
                    <RNPickerSelect
                      disabled={editDisabled}
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
              {/* <View style={{flex: 2}}>
                {showSuppliers ? (
                  <View
                    style={{
                      width: wp('85%'),
                      alignItems: 'center',
                      borderWidth: 0.5,
                      marginTop: hp('2%'),
                    }}>
                    {supplierList.map(item => {
                      return (
                        <View style={{marginVertical: 5, borderBottomWidth: 1}}>
                          <Pressable
                            disabled={editDisabled}
                            onPress={() =>
                              this.selectSupplier(
                                item.name,
                                item.id,
                                item.reference,
                              )
                            }>
                            <Text>{item.name}</Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View> */}
              {/* {editDisabled ? null : (
                <View style={{marginBottom: hp('3%')}}>
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
                </View>
              )} */}
              {!editDisabled ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: hp('2%'),
                    marginTop: hp('2%'),
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
              {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
              {editDisabled ? (
                <View>
                  {yourOrderItems.map((item, indexOrder) => {
                    console.log('item-->YPOURORDERITMS', item);
                    return (
                      <View style={{marginBottom: 10}}>
                        {item.action !== 'Delete' ? (
                          <View
                            style={{
                              backgroundColor: '#fff',
                              padding: 15,
                            }}>
                            {!editDisabled && selectedItems.length === 0 ? (
                              <View
                                style={{
                                  marginLeft: -11,
                                  zIndex: 10,
                                }}>
                                <TouchableOpacity
                                  disabled={editDisabled}
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
                            ) : null}
                            <View>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: 14,
                                    color: 'black',
                                  }}>
                                  {item.name}
                                </Text>
                                {item.hasWarning ? (
                                  <View style={styles.listDataContainer}>
                                    <Image
                                      style={{
                                        width: 15,
                                        height: 15,
                                        resizeMode: 'contain',
                                        marginLeft: 10,
                                      }}
                                      source={img.flagIcon}
                                    />
                                  </View>
                                ) : (
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                    }}></View>
                                )}
                              </View>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <View
                                  style={{
                                    width: wp('30%'),
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                    }}>
                                    Quantity
                                  </Text>
                                  <TextInput
                                    editable={!editDisabled}
                                    placeholder="Quantity"
                                    style={{
                                      borderTopLeftRadius: 5,
                                      borderBottomLeftRadius: 5,
                                      width: wp('30%'),
                                      fontWeight: 'bold',
                                      color: 'black',
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
                                    alignItems: 'center',
                                  }}>
                                  <View style={{}}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                      }}>
                                      Unit
                                    </Text>
                                    <View
                                      style={{
                                        width: wp('20%'),
                                      }}>
                                      <RNPickerSelect
                                        disabled={editDisabled}
                                        placeholder={{
                                          label: 'Select Unit*',
                                          value: null,
                                          color: 'black',
                                        }}
                                        onValueChange={(value, index) => {
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
                                            width: '100%',
                                            color: 'black',
                                            fontWeight: 'bold',
                                          },
                                          inputAndroid: {
                                            fontSize: 14,
                                            color: 'black',
                                            width: '100%',
                                            fontWeight: 'bold',
                                          },
                                          iconContainer: {
                                            top: '40%',
                                          },
                                        }}
                                        items={item.units}
                                        value={item.unitId}
                                        useNativeAndroidPickerStyle={false}
                                      />
                                    </View>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    width: wp('20%'),
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                    }}>
                                    Value
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <TextInput
                                      editable={!editDisabled}
                                      placeholder="Price"
                                      style={{
                                        fontWeight: 'bold',
                                        fontWeight: 'bold',
                                        color: 'black',
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
                                    <Text
                                      style={{
                                        fontWeight: 'bold',
                                        fontSize: 12,
                                      }}>
                                      {' '}
                                      €
                                    </Text>
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
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View
                  style={{
                    marginHorizontal: wp('6%'),
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderTopWidth: 1,
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderColor: 'grey',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      padding: 10,
                      flex: 1,
                    }}>
                    <View
                      style={{
                        flex: 3,
                      }}>
                      <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                        inventory name
                        {/* {item.inventoryMapping &&
                          item.inventoryMapping.inventoryName} */}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <Image
                        source={img.messageIcon}
                        style={{
                          width: 18,
                          height: 18,
                          resizeMode: 'contain',
                          tintColor: 'black',
                        }}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => this.deleteFunOrder(item, index)}
                      style={{
                        flex: 1,
                        alignItems: 'flex-end',
                      }}>
                      <Image
                        source={img.deleteIconNew}
                        style={{
                          width: 15,
                          height: 15,
                          resizeMode: 'contain',
                          tintColor: 'red',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: 'grey',
                      padding: 10,
                    }}>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={{}}>
                        product name
                        {/* {item.inventoryMapping &&
                          item.inventoryMapping.productName} */}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          this.editQuantityFun(
                            index,
                            'quantity',
                            '1',
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
                        // value={String(item.quantity)}
                        keyboardType="numeric"
                        style={{
                          borderRadius: 6,
                          padding: 10,
                          width: wp('15%'),
                          backgroundColor: '#fff',
                        }}
                        onChangeText={value =>
                          this.editQuantityFun(
                            index,
                            'quantity',
                            value,
                            item,
                            'input',
                          )
                        }
                      />
                      <TouchableOpacity
                        onPress={() =>
                          this.editQuantityFun(
                            index,
                            'quantity',
                            '1',
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
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: 'grey',
                      borderBottomLeftRadius: 6,
                      borderBottomRightRadius: 6,
                      padding: 10,
                    }}>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={{fontSize: 10}}>{translate('Price')}</Text>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}>
                        Product Price
                        {/* {item.inventoryMapping &&
                          item.inventoryMapping.productPrice}{' '}
                        Є/
                        {item.inventoryMapping.productUnit} */}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={{fontSize: 10}}>
                        {translate('Ordered Val')}
                      </Text>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}>
                        value
                        {/* {item.value.toFixed(2)} */}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={{fontSize: 10}}>
                        {translate('Ordered Qty')}
                      </Text>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}>
                        cal
                        {/* {item.calculatedQuantity} */}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {/* </ScrollView> */}
              {/* <View>
                {editDisabled ? null : (
                  <View>
                    <TouchableOpacity
                      onPress={() => this.addPurchaseLine()}
                      style={{
                        marginBottom: 20,
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
                          {translate('Add line')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View> */}
              <View style={{}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: hp('2%'),
                    backgroundColor: '#fff',
                    padding: 10,
                  }}>
                  <View>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 16,
                        color: '#151B26',
                        fontWeight: 'bold',
                      }}>
                      {translate('Total')}:
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 16,
                        color: '#151B26',
                        fontWeight: 'bold',
                      }}>
                      {orderTotal.toFixed(2)} €
                    </Text>
                  </View>
                </View>
                {/* <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: hp('2%'),
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 15,
                      color: '#151B26',
                    }}>
                    {translate('Ex-VAT')}?
                  </Text>
                  <CheckBox
                    disabled={editDisabled}
                    value={htvaIsSelected}
                    onValueChange={() =>
                      this.setState({htvaIsSelected: !htvaIsSelected})
                    }
                    style={{
                      backgroundColor: editColor,
                      height: 20,
                      width: 20,
                    }}
                  />
                </View> */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    paddingVertical: 10,
                    borderColor: 'grey',
                  }}>
                  <CheckBox
                    disabled={editDisabled}
                    value={auditIsSelected}
                    onValueChange={() =>
                      this.setState({auditIsSelected: !auditIsSelected})
                    }
                    style={{
                      backgroundColor: editColor,
                      height: 18,
                      width: 18,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 15,
                      color: 'grey',
                      marginLeft: 10,
                    }}>
                    {translate('Audit Complete')}
                  </Text>
                </View>
              </View>
              {imageData.length > 0 ? (
                imageData.map((item, index) => {
                  console.log('item-----<Imaee', item);
                  return (
                    <View style={{marginTop: 15}}>
                      <Image
                        style={{
                          width: wp('50%'),
                          height: 150,
                          resizeMode: 'cover',
                        }}
                        source={{uri: item.imageText}}
                      />
                    </View>
                  );
                })
              ) : imagesLoader ? (
                <ActivityIndicator size="small" color="green" />
              ) : null}
              {imageDataEdit.length > 0
                ? imageDataEdit.map((item, index) => {
                    console.log('item-----<Imaee', item);
                    return (
                      <View style={{marginTop: 15}}>
                        <Image
                          style={{
                            width: wp('50%'),
                            height: 150,
                            resizeMode: 'cover',
                          }}
                          source={{uri: item.imageText}}
                        />
                      </View>
                    );
                  })
                : null}
              {/* {imageShow ? (
                <TouchableOpacity
                  style={{marginTop: 15}}
                  onPress={() =>
                    this.setState({
                      imageModalStatus: true,
                    })
                  }>
                  <Image
                    style={{
                      width: wp('60%'),
                      height: 100,
                      resizeMode: 'cover',
                    }}
                    source={{uri: imageDataEdit.path}}
                  />
                </TouchableOpacity>
              ) : null} */}
              {editDisabled ? null : (
                <View>
                  <TouchableOpacity
                    onPress={() => this.handleChoosePhoto()}
                    style={{
                      paddingVertical: 10,
                      width: wp('50%'),
                      backgroundColor: '#94C01F',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                      borderRadius: 100,
                    }}>
                    <View style={{}}>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          marginLeft: 5,
                        }}>
                        Update image
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* {imageData && imageShow === false ? (
                <View style={{marginTop: 15}}>
                  <Image
                    style={{
                      width: wp('60%'),
                      height: 100,
                      resizeMode: 'cover',
                    }}
                    source={{uri: imageData && imageData.imageText}}
                  />
                </View>
              ) : null} */}

              <View style={{}}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    marginTop: hp('3%'),
                  }}>
                  <TextInput
                    placeholder="Notes"
                    editable={!editDisabled}
                    style={{
                      padding: 10,
                    }}
                    multiline={true}
                    numberOfLines={4}
                    onChangeText={value => this.setState({note: value})}
                    value={note}
                  />
                </View>
              </View>
            </View>
          )}
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
                        resizeMode: 'contain',
                      }}
                      source={{uri: imageDataEdit.path}}
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
        </ScrollView>
        {editDisabled ? null : (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 15,
              }}>
              {yourOrderItemsBackup.length > 0 ? (
                <TouchableOpacity
                  onPress={() => this.updateCasualPurchase()}
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
                    {updateLoader ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      translate('Save')
                    )}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => this.goBackFun()}
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
            </View>
          </View>
        )}
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

export default connect(mapStateToProps, {UserTokenAction})(EditPurchase);
