import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  FlatList,
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
  addStockTakeApi,
  updateStockTakeApi,
} from '../../connectivity/api';
import RNPickerSelect from 'react-native-picker-select';
import styles from './style';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LoaderComp from '../../components/Loader';

import {translate} from '../../utils/translations';

class EditStock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      sectionName: '',
      modalLoader: true,
      unitData: [],
      inventoryId: '',
      pageDate: '',
      pageData: '',
      departmentId: '',
      categoryId: '',
      loaderCompStatus: false,
      screenType: '',
      deleteStatus: false,
      saveStatus: false,
      finalSum: '',
      finalUnit: '',
      topValueStatus: '',
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
      item,
      pageDate,
      inventoryId,
      departmentId,
      categoryId,
      screenType,
      topValueStatus,
      activeSections,
    } = this.props.route && this.props.route.params;
    console.log('item-->', item);

    let finalUnitData = item.units.map((item, index) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    if (item.updateStockTakeItems === null) {
      let finalModalData =
        item.units &&
        item.units.map((item, index) => {
          return {
            action: 'New',
            id: null,
            inventoryId: item.inventoryId,
            isDefault: item.isDefault,
            quantity: '',
            recipeId: null,
            stockTakeDate: pageDate,
            unit: item.name,
            unitId: item.id,
            convertor: item.converter,
          };
        });

      // finalModalData.sort(item => {
      //   if (item.isDefault === true) {
      //     return 0;
      //   }
      // });

      this.setState({
        sectionName: 'Test',
        finalName: item.name,
        modalData: [...finalModalData],
        modalLoader: false,
        unitData: [...finalUnitData],
        pageDate,
        inventoryId,
        pageData: item,
        departmentId,
        categoryId,
        screenType,
        deleteStatus: false,
        finalSum: item.quantity ? item.quantity : '',
        finalUnit: item.unit ? item.unit : '',
        topValueStatus,
        activeSections,
      });
    } else {
      let finalModalData =
        item.updateStockTakeItems &&
        item.updateStockTakeItems.map((item, index) => {
          return {
            action: 'Update',
            id: null,
            inventoryId: item.inventoryId,
            isDefault: item.isDefault,
            quantity: String(item.quantity),
            recipeId: null,
            stockTakeDate: item.stockTakeDate,
            unit: item.unit,
            unitId: item.unitId,
            createdBy: item.createdBy,
            convertor: item.converter,
            stockTakeInventoryId: item.stockTakeInventoryId,
            stockTakeRecipeId: null,
          };
        });
      let unitData =
        item.units &&
        item.units.map((item, index) => {
          return {
            action: 'New',
            id: null,
            inventoryId: item.inventoryId,
            isDefault: item.isDefault,
            quantity: '',
            recipeId: null,
            stockTakeDate: pageDate,
            unit: item.name,
            unitId: item.id,
            createdBy: '',
            convertor: item.converter,
          };
        });

      const arr1 = finalModalData;
      const arr2 = unitData;

      function comparer(otherArray) {
        return function (current) {
          return (
            otherArray.filter(function (other) {
              return other.unitId == current.unitId;
            }).length == 0
          );
        };
      }

      var onlyInA = arr1.filter(comparer(arr2));
      var onlyInB = arr2.filter(comparer(arr1));

      const result = onlyInA.concat(onlyInB);

      this.setState({
        sectionName: 'Test',
        finalName: item.name,
        modalData: [...arr1, ...result],
        modalLoader: false,
        unitData: [...finalUnitData],
        pageDate,
        inventoryId,
        pageData: item,
        departmentId,
        categoryId,
        screenType,
        deleteStatus: true,
        finalSum: item.quantity ? item.quantity : '',
        finalUnit: item.unit ? item.unit : '',
        topValueStatus,
        activeSections,
      });
    }
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  deleteQuantityFun = (item, index) => {
    Alert.alert('Are you sure?', "You won't be able to revert this!", [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => this.deleteFun(item, index),
      },
    ]);
  };

  deleteFun = (item, index) => {
    const {screenType} = this.state;
    if (screenType === 'History') {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.deleteHistoryFunSec(item, index),
      );
    } else {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.deleteFunSec(item, index),
      );
    }
  };

  deleteHistoryFunSec = (item, index) => {
    let payload = [
      {
        action: 'Delete',
        convertor: item.converter,
        id: null,
        inventoryId: item.inventoryId,
        isDefault: item.isDefault,
        quantity: item.quantity,
        recipeId: null,
        stockTakeDate: item.stockTakeDate,
        stockTakeInventoryId: item.stockTakeInventoryId,
        stockTakeRecipeId: null,
        unit: item.unit,
        unitId: item.unitId,
      },
    ];
    if (item.action === 'Update') {
      updateStockTakeApi(payload)
        .then(res => {
          this.setState(
            {
              isModalVisible: false,
            },
            () => this.removeFromList(index),
          );
          // Alert.alert('Grainz', 'Stock trade deleted successfully', [
          //   {
          //     text: 'Okay',
          //     onPress: () => this.removeFromList(index),
          //   },
          // ]);
        })
        .catch(err => {
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
        });
    } else {
      this.removeFromList(index);
    }
  };

  deleteFunSec = (item, index) => {
    console.log('item', item);
    let payload = [
      {
        action: 'Delete',
        convertor: item.converter,
        id: null,
        inventoryId: item.inventoryId,
        isDefault: item.isDefault,
        quantity: item.quantity,
        recipeId: null,
        stockTakeDate: item.stockTakeDate,
        stockTakeInventoryId: item.stockTakeInventoryId,
        stockTakeRecipeId: null,
        unit: item.unit,
        unitId: item.unitId,
      },
    ];
    if (item.action === 'Update') {
      addStockTakeApi(payload)
        .then(res => {
          this.setState(
            {
              isModalVisible: false,
            },
            () => this.removeFromList(index),
          );
          // Alert.alert('Grainz', 'Stock trade deleted successfully', [
          //   {
          //     text: 'Okay',
          //     onPress: () => this.removeFromList(index),
          //   },
          // ]);
        })
        .catch(err => {
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
        });
    } else {
      this.setState({
        loaderCompStatus: false,
      });
    }

    // else {
    //   this.removeFromList(index);
    // }
  };

  removeFromList = index => {
    // let temp = this.state.modalData;
    // temp.splice(index, 1);
    // this.setState({modalData: temp, loaderCompStatus: false});

    const {modalData} = this.state;
    // console.log('modalData', modalData);
    let newArr = modalData.map((item, i) =>
      index === i
        ? {
            ...item,
            ['quantity']: '',
            ['action']: 'New',
          }
        : item,
    );

    console.log('NEWARR', newArr);

    this.setState({
      modalData: [...newArr],
      loaderCompStatus: false,
    });
  };

  editOfferItemsFun = (index, type, value) => {
    const {modalData} = this.state;
    // console.log('modalData', modalData);
    let newArr = modalData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: Number(value),
          }
        : item,
    );
    const finalUnitTotal = modalData.map((item, i) => {
      return item.isDefault === true ? item.unit : null;
    });
    var filtered = finalUnitTotal.filter(function (el) {
      return el != null;
    });
    // console.log('filtered', filtered);

    console.log('NEWARR', newArr);

    const sum = newArr.reduce(function (sum, current) {
      console.log('sum', sum);
      console.log('current', current);

      return sum + Number(current.quantity) * current.convertor;
    }, 0);

    console.log('Sum', sum);
    this.setState({
      modalData: [...newArr],
      saveStatus: value ? true : false,
      finalSum: sum.toFixed(2),
      finalUnit: filtered[0],
    });
  };

  saveFun = () => {
    const {screenType} = this.state;
    if (screenType === 'History') {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.updateFun(),
      );
    } else {
      this.setState(
        {
          loaderCompStatus: true,
        },
        () => this.saveFunSec(),
      );
    }
  };

  updateFun = () => {
    const {modalData} = this.state;

    const finalArr = modalData.map((item, index) => {
      if (item.quantity) {
        return item;
      }
    });

    const finalArrSec = finalArr.filter(function (element) {
      return element !== undefined;
    });

    let payload = finalArrSec;
    console.log('PAYLOAD-UPDATE', payload);
    updateStockTakeApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.props.navigation.goBack(),
        );

        // Alert.alert('Grainz', 'Stock trade added successfully', [
        //   {
        //     text: 'Okay',
        //     onPress: () =>
        //       this.setState({
        //         loaderCompStatus: false,
        //       }),
        //   },
        // ]);
      })
      .catch(err => {
        console.log('er', err.response);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  saveFunSec = () => {
    const {modalData} = this.state;

    const finalArr = modalData.map((item, index) => {
      if (item.quantity) {
        return item;
      }
    });

    const finalArrSec = finalArr.filter(function (element) {
      return element !== undefined;
    });

    let payload = finalArrSec;
    console.log('PAYLOAD', payload);
    addStockTakeApi(payload)
      .then(res => {
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.props.navigation.goBack(),
        );

        // Alert.alert('Grainz', 'Stock trade added successfully', [
        //   {
        //     text: 'Okay',
        //     onPress: () =>
        //       this.setState({
        //         loaderCompStatus: false,
        //       }),
        //   },
        // ]);
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

  navigateFun = () => {
    const {topValueStatus, activeSections} = this.state;
    if (topValueStatus) {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.navigate('CategoryStockScreen', {
        activeSections,
      });
    }
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      finalName,
      modalLoader,
      unitData,
      loaderCompStatus,
      screenType,
      deleteStatus,
      saveStatus,
      finalSum,
      finalUnit,
      topValueStatus,
      activeSections,
    } = this.state;
    console.log('activeSections', activeSections);

    // console.log('finalUnit', finalUnit);

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
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={styles.flex}>
                <Text style={styles.adminTextStyle}> {finalName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => this.navigateFun()}
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
            <View>
              <ScrollView>
                {modalLoader ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View style={styles.paddingContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}>
                          <View>
                            <View style={styles.headingEditContainer}>
                              <View style={styles.headingSubContainer}>
                                <Text style={{textAlign: 'center'}}>
                                  {translate('Quantity')}
                                </Text>
                              </View>
                              <View style={styles.headingSubContainer}>
                                <Text>{translate('Unit')}</Text>
                              </View>

                              {/* <View style={styles.headingSubContainer}>
                                <Text>{translate('Inventory')}</Text>
                              </View> */}

                              <View style={styles.headingSubContainer}>
                                {screenType === 'New' && deleteStatus ? (
                                  <Text>{translate('Action')}</Text>
                                ) : (
                                  <Text>{translate('Action')}</Text>
                                )}
                              </View>
                            </View>
                            <View>
                              {modalData && modalData.length > 0 ? (
                                modalData.map((item, index) => {
                                  console.log('item', item);
                                  return (
                                    <View
                                      style={{
                                        paddingVertical: 15,
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
                                        }}>
                                        <TextInput
                                          returnKeyType="done"
                                          style={{
                                            paddingVertical: 8,
                                            borderColor: '#00000033',
                                            borderWidth: 1,
                                            width: wp('20%'),
                                            paddingLeft: 10,
                                            backgroundColor: '#fff',
                                            // backgroundColor: editableStatus
                                            //   ? '#fff'
                                            //   : '#E9ECEF',
                                          }}
                                          numberOfLines={1}
                                          keyboardType="numeric"
                                          onChangeText={value => {
                                            this.editOfferItemsFun(
                                              index,
                                              'quantity',
                                              value,
                                            );
                                          }}
                                          value={item.quantity}
                                        />
                                      </View>
                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <TextInput
                                          editable={false}
                                          returnKeyType="done"
                                          style={{
                                            paddingVertical: 8,
                                            borderColor: '#00000033',
                                            borderWidth: 1,
                                            width: wp('20%'),
                                            paddingLeft: 10,
                                            backgroundColor: '#E9ECEF',
                                          }}
                                          numberOfLines={1}
                                          keyboardType="numeric"
                                          value={item.unit}
                                        />
                                      </View>
                                      {/* <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                        }}>
                                        <TextInput
                                          editable={false}
                                          returnKeyType="done"
                                          style={{
                                            paddingVertical: 8,
                                            borderColor: '#00000033',
                                            borderWidth: 1,
                                            width: wp('20%'),
                                            paddingLeft: 10,
                                            backgroundColor: '#E9ECEF',
                                          }}
                                          numberOfLines={1}
                                          keyboardType="numeric"
                                          value={item.unit}
                                        />
                                      </View> */}

                                      {screenType === 'New' && deleteStatus ? (
                                        <TouchableOpacity
                                          onPress={() =>
                                            this.deleteQuantityFun(item, index)
                                          }
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            paddingVertical: 10,
                                          }}>
                                          <Image
                                            source={img.deleteIconNew}
                                            style={{
                                              height: 18,
                                              width: 18,
                                              resizeMode: 'contain',
                                              tintColor: 'red',
                                            }}
                                          />
                                        </TouchableOpacity>
                                      ) : (
                                        <TouchableOpacity
                                          onPress={() =>
                                            this.deleteQuantityFun(item, index)
                                          }
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            paddingVertical: 10,
                                          }}>
                                          <Image
                                            source={img.deleteIconNew}
                                            style={{
                                              height: 18,
                                              width: 18,
                                              resizeMode: 'contain',
                                              tintColor: 'red',
                                            }}
                                          />
                                        </TouchableOpacity>
                                      )}
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
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: '#EFFBCF',
                                }}>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    marginTop: hp('2%'),
                                    marginBottom: hp('2%'),
                                  }}>
                                  <Text
                                    styl={{
                                      fontSize: 16,
                                    }}>
                                    Total
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    styl={{
                                      fontSize: 16,
                                    }}>
                                    {finalSum} {finalUnit}
                                  </Text>
                                </View>
                              </View>
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
          {saveStatus ? (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: hp('2%'),
                }}>
                <TouchableOpacity
                  onPress={() => this.saveFun()}
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
                    {translate('Save')}
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
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
              </TouchableOpacity> */}
              </View>
            </View>
          ) : null}
        </KeyboardAwareScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(EditStock);
