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
  getManualLogTypes,
  getManualLogItemList,
  addManualLogApi,
} from '../../connectivity/api';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import DropDownPicker from 'react-native-dropdown-picker';
import {translate} from '../../utils/translations';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

class AddManualLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      firstName: '',
      recipeLoader: false,
      isMakeMeStatus: true,
      isDatePickerVisible: false,
      finalDate: moment(new Date()).format('DD-MM-YYYY'),
      itemsTypesArr: [],
      productionDate: moment.utc(new Date()).format(),
      quantity: '',
      notes: '',
      recipeID: '',
      quantityName: '',
      selectedItems: [],
      items: [],
      departmentName: '',
      itemTypes: '',
      loading: false,
      selectedItemObjects: '',
      buttonsSubHeader: [],
      quantityList: [],
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
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onSelectedItemsChange = selectedItems => {
    this.setState({selectedItems});
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  getRecipesTypesData = () => {
    getManualLogTypes()
      .then(res => {
        const {data} = res;
        let newData = [];
        data.map(item => {
          const obj = {};
          obj.label = item.name;
          obj.value = item.id;
          newData = [...newData, obj];
        });
        this.setState({
          itemsTypesArr: newData,
        });
      })
      .catch(err => {
        console.warn('Err', err);
      });
  };

  getItemListData = () => {
    const {departmentName} = this.state;
    getManualLogItemList()
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

        let groupedCategory = groupByKey(firstArr, 'category');

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
        console.warn('Err', err.response);
      });
  };

  handleConfirm = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    this.setState({
      finalDate: newdate,
      productionDate: date,
    });

    this.hideDatePicker();
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  // payloadValidation = () => {
  //   let formIsValid = true;
  //   const {orderItemsFinal} = this.state;
  //   console.log('order---->', orderItemsFinal);
  //   if (orderItemsFinal.length > 0) {
  //     for (let i of orderItemsFinal) {
  //       if (i.quantityOrdered === '') {
  //         i.error = 'Quantity is required';
  //         formIsValid = false;
  //       } else if (i.unitPrice === '') {
  //         i.error = 'Price is required';
  //         formIsValid = false;
  //       } else if (i.unitId === null) {
  //         i.error = 'Please select a unit';
  //         formIsValid = false;
  //       }
  //     }
  //   }
  //   this.setState({
  //     orderItemsFinal,
  //   });
  //   return formIsValid;
  // };

  addManualLogFun = () => {
    const {
      productionDate,
      departmentName,
      selectedItemObjects,
      notes,
      quantity,
      itemTypes,
      quantityName,
      quantityList,
    } = this.state;

    if (
      productionDate === '' ||
      quantity === '' ||
      departmentName === '' ||
      selectedItemObjects === '' ||
      itemTypes === '' ||
      quantityName === null
    ) {
      alert('Please select all options');
    } else {
      let payload = {
        category: selectedItemObjects[0].category,
        countInInventory: false,
        departmentId: selectedItemObjects[0].departmentId,
        departmentName: selectedItemObjects[0].departmentName,
        id: selectedItemObjects[0].id,
        inUse: true,
        itemId: selectedItemObjects[0].itemId,
        itemTypeId: selectedItemObjects[0].itemTypeId,
        itemTypeName: selectedItemObjects[0].itemTypeName,
        loggedDate: productionDate,
        name: selectedItemObjects[0].name,
        notes: notes,
        quantity: parseInt(quantity),
        reviewed: false,
        subCategory: null,
        typeId: itemTypes.value,
        typeName: itemTypes.label,
        unit: '',
        unitId: quantityName,
        units: quantityList,
        userFullName: null,
        userId: '8e194fe1-5cac-439e-a036-c2009bfb455a',
      };
      addManualLogApi(payload)
        .then(res => {
          this.setState(
            {
              items: [],
            },
            () => this.props.navigation.goBack(),
          );
        })
        .catch(err => {
          console.warn('ERR', err.response);
        });
    }
  };

  selectDepartementNameFun = item => {
    this.setState(
      {
        departmentName: item.value,
        loading: true,
      },
      () => this.getManualData(),
    );
  };

  getManualData = () => {
    this.getRecipesTypesData();
    this.getItemListData();
  };

  onSelectedItemObjectsChange = selectedItemObjects => {
    let finalArray = selectedItemObjects[0].units.map((item, index) => {
      return {
        label: item.name,
        value: item.id,
      };
    });

    this.setState({
      selectedItemObjects,
      quantityList: finalArray,
      quantityName:
        selectedItemObjects[0] && selectedItemObjects[0].units[0].id,
    });
  };

  selectQuantityFun = item => {
    if (item) {
      this.setState({
        quantityName: item,
      });
    }
  };
  render() {
    const {
      recipeLoader,
      firstName,
      isDatePickerVisible,
      finalDate,
      itemsTypesArr,
      quantity,
      notes,
      items,
      buttonsSubHeader,
      productionDate,
      departmentName,
      selectedItemObjects,
      itemTypes,
      quantityName,
      quantityList,
    } = this.state;
    return (
      <View style={styles.container}>
        <Header
          logout={firstName}
          logoutFun={this.myProfile}
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
          <View>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <View style={{flex: 1}}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Manual Log small')} -{' '}
                    {translate('Add new item')}
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
              <View>
                <View style={{}}>
                  <View style={{padding: hp('3%')}}>
                    <View style={{}}>
                      <TouchableOpacity
                        onPress={() => this.showDatePickerFun()}
                        style={{
                          padding: Platform.OS === 'ios' ? 12 : 0,
                          marginBottom: hp('3%'),
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          borderRadius: 6,
                          backgroundColor: '#fff',
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

                      <View>
                        <DropDownPicker
                          placeholder="Select Department"
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
                          zIndex={1000000}
                          containerStyle={{
                            height: 50,
                            marginBottom: hp('3%'),
                          }}
                          style={{
                            backgroundColor: '#fff',
                            borderColor: '#fff',
                          }}
                          itemStyle={{
                            justifyContent: 'flex-start',
                          }}
                          dropDownStyle={{backgroundColor: '#fff'}}
                          onChangeItem={item =>
                            this.selectDepartementNameFun(item)
                          }
                        />
                        <SectionedMultiSelect
                          styles={{
                            container: {
                              paddingTop: hp('2%'),
                              marginTop: hp('7%'),
                            },
                            selectToggle: {
                              paddingVertical: 10,
                              paddingHorizontal: 10,
                              backgroundColor: '#fff',
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
                          loading={this.state.loading}
                          single={true}
                          items={items}
                          IconRenderer={Icon}
                          uniqueKey="id"
                          subKey="children"
                          selectText="Select"
                          showDropDowns={true}
                          readOnlyHeadings={true}
                          onSelectedItemObjectsChange={
                            this.onSelectedItemObjectsChange
                          }
                          onSelectedItemsChange={this.onSelectedItemsChange}
                          selectedItems={this.state.selectedItems}
                        />
                        <DropDownPicker
                          placeholder="Select Type"
                          items={itemsTypesArr}
                          containerStyle={{
                            height: 50,
                            marginTop: hp('3%'),
                          }}
                          style={{
                            backgroundColor: '#fff',
                            borderColor: '#fff',
                          }}
                          itemStyle={{
                            justifyContent: 'flex-start',
                          }}
                          dropDownStyle={{backgroundColor: '#fff'}}
                          onChangeItem={item =>
                            this.setState({
                              itemTypes: item,
                            })
                          }
                        />

                        <View
                          style={{
                            marginTop: hp('3%'),
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <View>
                            <TextInput
                              placeholder="Quantity"
                              value={quantity}
                              style={{
                                padding: 12,
                                justifyContent: 'space-between',
                                borderTopLeftRadius: 5,
                                borderBottomLeftRadius: 5,
                                backgroundColor: '#fff',
                                width: wp('68%'),
                              }}
                              keyboardType="number-pad"
                              onChangeText={value => {
                                this.setState({
                                  quantity: value,
                                });
                              }}
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
                                width: wp('20%'),
                              }}>
                              <View
                                style={{
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  width: wp('13%'),
                                }}>
                                <RNPickerSelect
                                  placeholder={{
                                    label: 'Select Unit*',
                                    value: null,
                                    color: 'black',
                                  }}
                                  onValueChange={value => {
                                    this.selectQuantityFun(value);
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
                                      color: '#161C27',
                                      width: '100%',
                                      alignSelf: 'center',
                                    },
                                    iconContainer: {
                                      top: '40%',
                                    },
                                  }}
                                  items={quantityList}
                                  value={quantityName}
                                  useNativeAndroidPickerStyle={false}
                                />
                              </View>
                              <View style={{marginRight: wp('5%')}}>
                                <Image
                                  source={img.arrowDownIcon}
                                  resizeMode="contain"
                                  style={{
                                    height: 15,
                                    width: 15,
                                    resizeMode: 'contain',
                                    tintColor: '#fff',
                                    marginTop: Platform.OS === 'ios' ? 12 : 15,
                                  }}
                                />
                              </View>
                            </View>
                          </View>
                        </View>

                        <View
                          style={{
                            padding: 15,
                            marginTop: hp('3%'),
                            backgroundColor: '#fff',
                            borderRadius: 6,
                          }}>
                          <TextInput
                            placeholder={translate('Note')}
                            onChangeText={value =>
                              this.setState({
                                notes: value,
                              })
                            }
                            value={notes}
                          />
                        </View>
                      </View>

                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode={'date'}
                        onConfirm={this.handleConfirm}
                        onCancel={this.hideDatePicker}
                        maximumDate={minTime}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 15,
                    }}>
                    {productionDate === '' ||
                    quantity == '' ||
                    departmentName === '' ||
                    selectedItemObjects === '' ||
                    itemTypes === '' ? (
                      <View
                        opacity={0.5}
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
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => this.addManualLogFun()}
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
                    )}

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
                        borderColor: '#482813',
                        borderWidth: 1,
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
              </View>
            </View>
          </View>
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

export default connect(mapStateToProps, {UserTokenAction})(AddManualLog);
