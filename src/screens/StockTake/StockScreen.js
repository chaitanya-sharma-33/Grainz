import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getStockDataApi,
  getNewTopStockTakeApi,
  lookupInventoryApi,
} from '../../connectivity/api';
import styles from './style';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate} from '../../utils/translations';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';

class StockScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      buttonsSubHeader: [],
      loader: true,
      departmentId: '',
      categoryId: '',
      pageDate: '',
      topValue: '',
      categoryLoader: true,
      catArray: [],
      topValueStatus: true,
      categoryArr: [],
      expandStatus: false,
      selectedIndex: '',
      modalLoader: false,
      modalData: [],
      arrangeStatusName: 0,
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
          loader: false,
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

  componentDidMount() {
    this.getData();

    const {departmentId, pageDate, topValue, topValueStatus} =
      this.props.route && this.props.route.params;
    this.getCategoryData(departmentId);
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          departmentId,
          pageDate,
          topValue,
          topValueStatus,
          categoryLoader: true,
        },
        () => this.getFinalData(),
      );
    });
  }

  getCategoryData = departmentId => {
    lookupInventoryApi(departmentId)
      .then(res => {
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        this.setState({
          categoryArr: finalUsersList,
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);
      });
  };

  getFinalData = () => {
    const {topValueStatus, categoryId} = this.state;
    if (topValueStatus) {
      this.getTopDataFun();
    } else {
      if (categoryId) {
        this.getStockDataFun();
      }
    }
  };

  getTopDataFun = () => {
    const {departmentId, topValue, pageDate} = this.state;
    let newdate = moment(pageDate).format('MM/DD/YYYY');
    getNewTopStockTakeApi(departmentId, newdate, topValue)
      .then(res => {
        this.setState({
          catArray: res.data,
          categoryLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  getStockDataFun = () => {
    const {departmentId, categoryId, pageDate} = this.state;
    getStockDataApi(departmentId, categoryId, pageDate)
      .then(res => {
        this.setState({
          catArray: res.data,
          categoryLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  editUnitsFun = item => {
    const {pageDate, departmentId, categoryId, topValueStatus} = this.state;
    this.props.navigation.navigate('EditStockScreen', {
      item,
      pageDate,
      inventoryId: item.inventoryId,
      departmentId,
      categoryId,
      screenType: 'New',
      topValueStatus,
    });
  };

  selectCategoryFun = value => {
    this.setState(
      {
        categoryId: value,
        catArray: [],
        categoryLoader: true,
      },
      () => this.getStockDataFun(),
    );
  };

  expandScreenFun = (item, index) => {
    const {selectedIndex, expandStatus} = this.state;
    if (index === selectedIndex) {
      this.setState({
        expandStatus: !expandStatus,
        selectedIndex: index,
      });
    } else {
      this.setState({
        expandStatus: true,
        selectedIndex: index,
      });
    }
  };

  arrangeListFun = funType => {
    if (funType === 'NAME') {
      this.setState(
        {
          arrangeStatusName: Number(1) + this.state.arrangeStatusName,
        },
        () => this.arrangeListFunSec('NAME'),
      );
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusName} = this.state;
    const finalData = type === 'NAME' ? arrangeStatusName : null;
    if (finalData % 2 == 0) {
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  reverseFun = () => {
    const {catArray} = this.state;
    console.log('catAA', catArray);
    const finalData = catArray.reverse();

    this.setState({
      catArray: finalData,
    });
  };

  descendingOrderFun = type => {
    const {catArray} = this.state;
    console.log('catAA', catArray);

    if (type === 'NAME') {
      function dynamicSort(property) {
        var sortOrder = 1;

        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }

        return function (a, b) {
          if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
          } else {
            return a[property].localeCompare(b[property]);
          }
        };
      }
      const finalKeyValue = type === 'NAME' ? 'name' : null;

      const finalData = catArray.sort(dynamicSort(finalKeyValue));

      this.setState({
        catArray: finalData,
      });
    }
  };

  render() {
    const {
      buttonsSubHeader,
      loader,
      categoryLoader,
      catArray,
      categoryArr,
      categoryId,
      topValueStatus,
      expandStatus,
      selectedIndex,
      modalLoader,
      modalData,
    } = this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <View style={styles.subContainer}>
          <View style={styles.firstContainer}>
            <View style={styles.flex}>
              <Text style={styles.adminTextStyle}>
                {translate('Stock Take')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>{translate('Go Back')}</Text>
            </TouchableOpacity>
          </View>
          {topValueStatus === false ? (
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 10,
                backgroundColor: '#fff',
                marginHorizontal: wp('5%'),
                marginTop: hp('3%'),
                marginBottom: hp('2%'),
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  width: wp('80%'),
                  height: hp('7%'),
                }}>
                <RNPickerSelect
                  placeholder={{
                    label: 'Select Category*',
                    value: null,
                    color: 'black',
                  }}
                  onValueChange={value => {
                    this.selectCategoryFun(value);
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
                  items={categoryArr}
                  value={categoryId}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.renderContentContainer}>
              <View style={styles.renderContentSubContainer}>
                <TouchableOpacity
                  style={{...styles.boxSizeNew}}
                  onPress={() => this.arrangeListFun('NAME')}>
                  <Text style={styles.boxTextHeadingStyling}>
                    {translate('Name')}
                  </Text>
                  <View style={{padding: 5}}>
                    <Image
                      style={styles.listImageStyling}
                      source={img.doubleArrowIconNew}
                    />
                  </View>
                </TouchableOpacity>
                <View
                  style={{
                    ...styles.boxSize,
                    marginLeft: wp('3%'),
                  }}>
                  <Text style={styles.boxTextHeadingStyling}>
                    {translate('Stock Take')}
                  </Text>
                </View>
                <View
                  style={{
                    width: wp('12%'),
                  }}></View>
                <View style={{...styles.boxSize, marginLeft: wp('2%')}}>
                  <Text style={styles.boxTextHeadingStyling}>
                    {translate('System says')}
                  </Text>
                </View>
                {/* <View style={{...styles.boxSize, marginLeft: wp('2%')}}>
                  <Text style={styles.boxTextHeadingStyling}>Correction</Text>
                </View> */}
              </View>
              {categoryLoader ? (
                <ActivityIndicator size="large" color="#94C036" />
              ) : (
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}>
                  {catArray && catArray.length > 0 ? (
                    catArray.map((item, index) => {
                      console.log('item', item);
                      let finaUnitVal =
                        item &&
                        item.units.map((subItem, subIndex) => {
                          if (subItem.isDefault === true) {
                            return subItem.name;
                          }
                        });
                      const filteredUnit = finaUnitVal.filter(elm => elm);
                      return (
                        <View>
                          <View
                            key={index}
                            style={styles.renderHeaderContentContainer}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <View
                                style={{
                                  width: wp('25%'),
                                  justifyContent: 'center',
                                }}
                                // onPress={() =>
                                //   this.expandScreenFun(item, index)
                                // }
                              >
                                <Text style={styles.boxTextDataStyling}>
                                  {item.name && item.name}
                                </Text>
                                {item.stockTakeLastUpdate ? (
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: '#161C27',
                                      fontFamily: 'Inter-Regular',
                                      marginTop: hp('2%'),
                                    }}>
                                    {moment(item.stockTakeLastUpdate).format(
                                      'DD/MM/YYYY',
                                    )}
                                  </Text>
                                ) : null}
                              </View>

                              <TouchableOpacity
                                onPress={() => this.editUnitsFun(item)}
                                style={{
                                  ...styles.boxSizeSec,
                                  marginLeft: wp('3%'),
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: item.quantity
                                    ? '#E9ECEF'
                                    : '#FDF851',
                                  height: 35,
                                  alignSelf: 'center',
                                }}>
                                <Text style={styles.boxTextDataStyling}>
                                  {item.quantity}
                                </Text>
                              </TouchableOpacity>
                              <View
                                style={{
                                  width: wp('12%'),
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: '#161C27',
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {filteredUnit[0]}
                                </Text>
                              </View>

                              <View
                                style={{
                                  ...styles.boxSizeSec,
                                  marginLeft: wp('2%'),
                                }}>
                                <Text
                                  style={styles.boxTextDataStyling}
                                  numberOfLines={1}>
                                  {item.systemSays &&
                                    item.systemSays.toFixed(2)}{' '}
                                  {filteredUnit[0]}
                                </Text>
                                {item.correction ? (
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color:
                                        item.correction > 0 ? '#94C01F' : 'red',
                                      fontFamily: 'Inter-Regular',
                                      marginTop: hp('2%'),
                                    }}>
                                    ({item.correction}) {filteredUnit[0]}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          </View>
                          {/* {expandStatus && index === selectedIndex ? (
                            <View>
                              <ScrollView>
                                {modalLoader ? (
                                  <ActivityIndicator
                                    size="large"
                                    color="grey"
                                  />
                                ) : (
                                  <View style={styles.paddingContainer}>
                                    <ScrollView
                                      horizontal
                                      showsHorizontalScrollIndicator={false}>
                                      <View>
                                        <ScrollView
                                          horizontal
                                          showsHorizontalScrollIndicator={
                                            false
                                          }>
                                          <View>
                                            <View
                                              style={
                                                styles.headingEditContainer
                                              }>
                                              <View
                                                style={
                                                  styles.headingSubContainer
                                                }>
                                                <Text
                                                  style={{textAlign: 'center'}}>
                                                  Quantity
                                                </Text>
                                              </View>
                                              <View
                                                style={
                                                  styles.headingSubContainer
                                                }>
                                                <Text>Unit</Text>
                                              </View>
                                              <View
                                                style={
                                                  styles.headingSubContainer
                                                }>
                                                <Text>Inventory</Text>
                                              </View>
                                              <View
                                                style={
                                                  styles.headingSubContainer
                                                }>
                                                <Text>Name</Text>
                                              </View>
                                             
                                            </View>
                                            <View>
                                              {modalData &&
                                              modalData.length > 0 ? (
                                                modalData.map((item, index) => {
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
                                                          editable={
                                                            editableStatus
                                                          }
                                                          returnKeyType="done"
                                                          style={{
                                                            paddingVertical: 8,
                                                            borderColor:
                                                              '#00000033',
                                                            borderWidth: 1,
                                                            width: wp('20%'),
                                                            paddingLeft: 10,
                                                            backgroundColor:
                                                              editableStatus
                                                                ? '#fff'
                                                                : '#E9ECEF',
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
                                                        <View
                                                          style={{
                                                            flexDirection:
                                                              'row',
                                                            width: wp('25%'),
                                                            backgroundColor:
                                                              '#fff',
                                                            justifyContent:
                                                              'space-between',
                                                            borderWidth: 1,
                                                            paddingVertical: 8,
                                                            borderColor:
                                                              '#00000033',
                                                            backgroundColor:
                                                              editableStatus
                                                                ? '#fff'
                                                                : '#E9ECEF',
                                                          }}>
                                                          <View
                                                            style={{
                                                              width: wp('20%'),
                                                              alignSelf:
                                                                'center',
                                                              justifyContent:
                                                                'center',
                                                            }}>
                                                            <RNPickerSelect
                                                              placeholder={{
                                                                label: 'Unit*',
                                                                value: null,
                                                                color: 'black',
                                                              }}
                                                              placeholderTextColor="red"
                                                              disabled={
                                                                !editableStatus
                                                              }
                                                              onValueChange={value => {
                                                                this.editOfferItemsFun(
                                                                  index,
                                                                  'unitId',
                                                                  value,
                                                                );
                                                              }}
                                                              style={{
                                                                inputIOS: {
                                                                  fontSize: 14,
                                                                  paddingHorizontal:
                                                                    '3%',
                                                                  color:
                                                                    '#161C27',
                                                                  width: '100%',
                                                                  alignSelf:
                                                                    'center',
                                                                },
                                                                inputAndroid: {
                                                                  fontSize: 14,
                                                                  paddingHorizontal:
                                                                    '3%',
                                                                  color:
                                                                    '#161C27',
                                                                  width: '100%',
                                                                  alignSelf:
                                                                    'center',
                                                                },
                                                                iconContainer: {
                                                                  top: '40%',
                                                                },
                                                              }}
                                                              items={unitData}
                                                              value={
                                                                item.unitId
                                                              }
                                                              useNativeAndroidPickerStyle={
                                                                false
                                                              }
                                                            />
                                                          </View>
                                                          <View
                                                            style={{
                                                              marginRight:
                                                                wp('5%'),
                                                            }}>
                                                            <Image
                                                              source={
                                                                img.arrowDownIcon
                                                              }
                                                              resizeMode="contain"
                                                              style={{
                                                                height: 10,
                                                                width: 10,
                                                                resizeMode:
                                                                  'contain',
                                                                marginTop:
                                                                  Platform.OS ===
                                                                  'ios'
                                                                    ? 3
                                                                    : 15,
                                                              }}
                                                            />
                                                          </View>
                                                        </View>
                                                      </View>
                                                      <View
                                                        style={{
                                                          width: wp('30%'),
                                                          alignItems: 'center',
                                                          paddingVertical: 10,
                                                        }}>
                                                        <Text>
                                                          {item.quantity *
                                                            item.converter}{' '}
                                                          ml
                                                        </Text>
                                                      </View>
                                                      <View
                                                        style={{
                                                          width: wp('30%'),
                                                          alignItems: 'center',
                                                          paddingVertical: 10,
                                                        }}>
                                                        <Text>
                                                          {item.createdBy}
                                                        </Text>
                                                      </View>
                                                     
                                                    </View>
                                                  );
                                                })
                                              ) : (
                                                <View
                                                  style={{marginTop: hp('3%')}}>
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
                                        </ScrollView>
                                      </View>
                                    </ScrollView>
                                  </View>
                                )}
                              </ScrollView>
                            </View>
                          ) : null} */}
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.notAvailableContainer}>
                      {/* <Text style={styles.notAvailableStyling}>
                        {translate('No data available')}
                      </Text> */}
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </ScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(StockScreen);
