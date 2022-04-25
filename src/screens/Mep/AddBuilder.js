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
  getMepRecipesApi,
  newMepListApi,
  getMepRecipeByIdsApi,
} from '../../connectivity/api';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {MultipleSelectPicker} from 'react-native-multi-select-picker';
import {translate} from '../../utils/translations';
import styles from './style';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);
var todayDate = moment(new Date()).format('DD-MM-YY');
var todayProdDate = new Date().toISOString();

class AddBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      recipeLoader: false,
      modalVisibleRecipeDetails: false,
      isDatePickerVisible: false,
      finalDate: todayDate,
      productionDate: todayProdDate,
      selectectedItems: [],
      isShownPicker: false,
      items: [],
      buttonsSubHeader: [],
      buttonLoader: false,
      applyClickStatus: false,
      buttonStatus: false,
      selectectedItemsNew: [],
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

  componentDidMount() {
    this.getData();
    this.getRecipesData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  getRecipesData = () => {
    const {productionDate} = this.state;
    getMepRecipesApi(productionDate)
      .then(res => {
        const {data} = res;
        let newData = [];
        data.map(item => {
          const obj = {};
          obj.label = item.name;
          obj.value = item.id;
          obj.quantity = item.batchQuantity;
          obj.unit = item.batchUnit;
          newData = [...newData, obj];
        });
        this.setState({
          items: newData,
        });
      })
      .catch(err => {
        console.warn('Err', err);
      });
  };

  handleConfirm = date => {
    let newdate = moment(date).format('DD-MM-YY');
    this.setState(
      {
        finalDate: newdate,
        productionDate: date,
      },
      // ,
      // () => this.getRecipesData(),
    );

    this.hideDatePicker();
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  addMepListFun = () => {
    const {selectectedItems, productionDate, applyClickStatus} = this.state;

    if (
      productionDate === '' ||
      selectectedItems.length === 0 ||
      applyClickStatus === false
    ) {
      alert('Please select and apply recipe');
    } else {
      this.setState(
        {
          buttonLoader: true,
        },
        () => this.hitAddApi(),
      );
    }
  };

  hitAddApi = () => {
    const {selectectedItemsNew} = this.state;
    newMepListApi(selectectedItemsNew)
      .then(res => {
        this.setState(
          {
            selectectedItems: [],
            selectectedItemsNew: [],
            buttonLoader: false,
          },
          () => this.props.navigation.goBack(),
        );
      })
      .catch(err => {
        console.warn('ERRADDMep', err.response);
      });
  };

  openRecipeDropDown = () => {
    const {finalDate, isShownPicker, buttonStatus} = this.state;
    if (finalDate) {
      this.setState(
        {
          isShownPicker: !isShownPicker,
          applyClickStatus: true,
          buttonStatus: !buttonStatus,
        },
        () => this.createpayloadFun(),
      );
    } else {
      alert('Please select date first.');
    }
  };

  // onPressApplyFun = () => {
  //   const {selectectedItems, productionDate} = this.state;
  //   if (productionDate === '' || selectectedItems.length === 0) {
  //     alert('Please select recipe');
  //   } else {
  //     this.setState(
  //       {
  //         isShownPicker: false,
  //         applyClickStatus: true,
  //       },
  //       () => this.createpayloadFun(),
  //     );
  //   }
  // };

  createpayloadFun = () => {
    let newData = [];
    const {selectectedItems, productionDate} = this.state;
    selectectedItems.map(item => {
      const obj = {};
      obj.isSelected = true;
      obj.notes = '';
      obj.productionDate = productionDate;
      obj.quantity = item.quantity;
      obj.recipeId = item.value;
      obj.name = item.label;
      obj.unit = item.unit;
      newData = [...newData, obj];
    });
    this.setState({
      selectectedItemsNew: newData,
    });
  };

  editQuantityFun = (index, type, value) => {
    const {selectectedItemsNew} = this.state;

    let newArr = selectectedItemsNew.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
          }
        : item,
    );
    this.setState({
      selectectedItemsNew: [...newArr],
    });
  };

  removeItemFun = index => {
    const {selectectedItemsNew, selectectedItems} = this.state;

    let temp = selectectedItemsNew;
    let tempSec = selectectedItems;

    temp.splice(index, 1);
    tempSec.splice(index, 1);
    this.setState({selectectedItemsNew: temp, selectectedItems: tempSec});
  };

  render() {
    const {
      recipeLoader,
      firstName,
      isDatePickerVisible,
      finalDate,
      isShownPicker,
      selectectedItems,
      items,
      buttonsSubHeader,
      buttonLoader,
      applyClickStatus,
      selectectedItemsNew,
      buttonStatus,
    } = this.state;
    console.log('applyClickStatus', applyClickStatus);
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
        <ScrollView style={{marginBottom: hp('2%')}}>
          <View>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <View style={{flex: 1}}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Mise-en-Place')}
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
                <View>
                  <ScrollView>
                    <View style={{padding: hp('3%')}}>
                      <View style={{}}>
                        <TouchableOpacity
                          onPress={() => this.showDatePickerFun()}
                          style={{
                            padding: Platform.OS === 'ios' ? 14 : 0,
                            marginBottom: hp('3%'),
                            backgroundColor: '#fff',
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

                        <View style={{}}>
                          <TouchableOpacity
                            onPress={() => {
                              this.openRecipeDropDown();
                            }}
                            style={{
                              padding: 14,
                              justifyContent: 'space-between',
                              backgroundColor: '#fff',
                              borderRadius: 6,
                              flexDirection: 'row',
                            }}>
                            {buttonStatus ? (
                              <Text
                                style={{
                                  // color: '#D6D7D9',
                                  color: 'black',
                                }}>
                                {translate('Apply')}
                              </Text>
                            ) : (
                              <Text
                                style={{
                                  // color: '#D6D7D9',
                                  color: 'black',
                                }}>
                                {translate('Select recipe')}
                              </Text>
                            )}
                            {/* {selectectedItems.length > 0 ? (
                              <View>
                                <View>
                                  {selectectedItems.map(item => {
                                    return (
                                      <View style={{marginTop: hp('1%')}}>
                                        <Text>{item.label}</Text>
                                      </View>
                                    );
                                  })}
                                </View>
                              </View>
                            ) : (
                              <Text style={{color: '#D6D7D9'}}>
                                Select recipe
                              </Text>
                            )} */}

                            <Image
                              source={img.arrowDownIcon}
                              style={{
                                width: 15,
                                height: 15,
                                resizeMode: 'contain',
                              }}
                            />
                          </TouchableOpacity>
                        </View>

                        {isShownPicker ? (
                          <MultipleSelectPicker
                            items={items}
                            onSelectionsChange={ele => {
                              console.log('ererer', ele);
                              this.setState({selectectedItems: ele});
                            }}
                            selectedItems={selectectedItems}
                            buttonStyle={{
                              height: 100,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            buttonText="hello"
                            checkboxStyle={{height: 20, width: 20}}
                          />
                        ) : null}

                        {applyClickStatus ? (
                          <View
                            style={{
                              marginTop: hp('3%'),
                            }}>
                            {selectectedItemsNew.map((item, index) => {
                              return (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: hp('2%'),
                                  }}>
                                  <View
                                    style={{
                                      zIndex: 10,
                                      marginBottom: 20,
                                    }}>
                                    <TouchableOpacity
                                      onPress={() => this.removeItemFun(index)}>
                                      <Image
                                        source={img.cancelIcon}
                                        style={{
                                          width: 25,
                                          height: 25,
                                          resizeMode: 'contain',
                                          tintColor: 'red',
                                        }}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                  <View style={{flex: 1}}>
                                    <Text
                                      style={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 12,
                                      }}>
                                      {item.name}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flex: 2,
                                      marginLeft: 10,
                                      marginRight: 10,
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      borderRadius: 6,
                                      borderWidth: 1,
                                      borderColor: '#C9CCD7',
                                    }}>
                                    <View style={{flex: 1}}>
                                      <TextInput
                                        placeholder="Quantity"
                                        value={String(item.quantity)}
                                        style={{
                                          paddingLeft: 10,
                                        }}
                                        onChangeText={value =>
                                          this.editQuantityFun(
                                            index,
                                            'quantity',
                                            value,
                                          )
                                        }
                                      />
                                    </View>
                                    <View
                                      style={{
                                        flex: 1,
                                        backgroundColor: '#68AFFF',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderTopRightRadius: 6,
                                        borderBottomRightRadius: 6,
                                      }}>
                                      <Text
                                        numberOfLines={1}
                                        style={{
                                          fontSize: 12,
                                          fontFamily: 'Inter-Regular',
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                        }}>
                                        {item.unit}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={{
                                      flex: 1,
                                      borderWidth: 1,
                                      borderColor: '#C9CCD7',
                                      borderRadius: 6,
                                    }}>
                                    <TextInput
                                      placeholder="Notes"
                                      value={item.notes}
                                      style={{
                                        padding: 10,
                                      }}
                                      onChangeText={value =>
                                        this.editQuantityFun(
                                          index,
                                          'notes',
                                          value,
                                        )
                                      }
                                    />
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        ) : null}

                        {/* {applyClickStatus ? null : (
                          <View>
                            <View
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: hp('5%'),
                              }}>
                              <TouchableOpacity
                                onPress={() => {
                                  this.onPressApplyFun();
                                }}
                                style={{
                                  width: wp('30%'),
                                  height: hp('5%'),
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
                                  {translate('Apply')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )} */}

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: hp('3%'),
                            }}>
                            {buttonLoader ? (
                              <View
                                style={{
                                  width: wp('30%'),
                                  height: hp('5%'),
                                  alignSelf: 'flex-end',
                                  backgroundColor: '#94C036',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderRadius: 100,
                                }}>
                                <ActivityIndicator color="#fff" size="small" />
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => this.addMepListFun()}
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
                        <DateTimePickerModal
                          // is24Hour={true}
                          isVisible={isDatePickerVisible}
                          mode={'date'}
                          onConfirm={this.handleConfirm}
                          onCancel={this.hideDatePicker}
                          minimumDate={minTime}

                          // maximumDate={maxTime}
                          // minimumDate={new Date()}
                        />
                      </View>
                    </View>
                  </ScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(AddBuilder);
