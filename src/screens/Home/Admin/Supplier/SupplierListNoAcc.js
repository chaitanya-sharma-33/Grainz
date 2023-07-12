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
  getSupplierListNoAccApi,
  createCollaborationApi,
  getUserLocationApi,
} from '../../../../connectivity/api';
import moment from 'moment';
import styles from './style';
import ModalDropdown from 'react-native-modal-dropdown';
import {translate} from '../../../../utils/translations';
import SurePopUp from '../../../../components/SurePopUp';
import Modal from 'react-native-modal';
import call from 'react-native-phone-call';

class SupplierListNoAcc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      finalName: '',
      modalLoaderDrafts: true,
      draftsOrderData: [],
      draftsOrderDataBackup: [],
      searchItem: '',
      arrangeStatusSupplier: 0,
      arrangeStatusDate: 0,
      arrangeStatusHTVA: 0,
      pickerModalStatus: false,
      param: '',
      pageSize: '10',
      selectedPage: '1',
      loadMoreStatus: false,
      selectAllStatus: false,
      payloadArr: [],
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
    // this.props.navigation.addListener('focus', () => {
    const {route} = this.props;

    this.getSupplierListData();
    this.getUserLocationFun();
    this.getData();
    // });
  }

  getSupplierListData() {
    this.setState(
      {
        modalLoaderDrafts: true,
      },
      () =>
        getSupplierListNoAccApi()
          .then(res => {
            console.log('res->getSupplierListNoAccApi', res);

            let finalArray = res.data.map((item, index) => {
              return {
                name: item,
                content: item,
              };
            });

            this.setState({
              draftsOrderData: res.data,
              draftsOrderDataBackup: res.data,
              modalLoaderDrafts: false,
            });
          })
          .catch(error => {
            console.log('err', error);
          }),
    );
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  searchFun = txt => {
    this.setState(
      {
        searchItem: txt,
      },
      () => this.filterData(txt),
    );
  };

  filterData = text => {
    //passing the inserted text in textinput
    const newData = this.state.draftsOrderDataBackup.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      draftsOrderData: newData,
      searchItem: text,
    });
  };

  arrangeListFun = funType => {
    if (funType === 'SUPPLIER') {
      this.setState(
        {
          arrangeStatusSupplier: Number(1) + this.state.arrangeStatusSupplier,
        },
        () => this.arrangeListFunSec('SUPPLIER'),
      );
    } else if (funType === 'DATE') {
      this.setState(
        {
          arrangeStatusDate: Number(1) + this.state.arrangeStatusDate,
        },
        () => this.arrangeListFunSec('DATE'),
      );
    } else if (funType === 'HTVA') {
      this.setState(
        {
          arrangeStatusHTVA: Number(1) + this.state.arrangeStatusHTVA,
        },
        () => this.arrangeListFunSec('HTVA'),
      );
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusSupplier, arrangeStatusDate, arrangeStatusHTVA} =
      this.state;
    const finalData =
      type === 'SUPPLIER'
        ? arrangeStatusSupplier
        : type === 'DATE'
        ? arrangeStatusDate
        : arrangeStatusHTVA;
    if (finalData % 2 == 0) {
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  reverseFun = () => {
    const {draftsOrderData} = this.state;
    const finalData = draftsOrderData.reverse();

    this.setState({
      draftsOrderData: finalData,
    });
  };

  descendingOrderFun = type => {
    const {draftsOrderData} = this.state;

    if (type === 'SUPPLIER') {
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
      const finalKeyValue =
        type === 'SUPPLIER' ? 'name' : type === 'DATE' ? 'orderDate' : 'htva';

      const finalData = draftsOrderData.sort(dynamicSort(finalKeyValue));

      this.setState({
        draftsOrderData: finalData,
      });
    } else {
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
      const finalKeyValue =
        type === 'SUPPLIER'
          ? 'supplierName'
          : type === 'DATE'
          ? 'orderDate'
          : 'htva';

      const finalData = draftsOrderData.sort(dynamicSort(finalKeyValue));

      this.setState({
        draftsOrderData: finalData,
      });
    }
  };

  getUserLocationFun = () => {
    getUserLocationApi()
      .then(res => {
        console.log('res-->LOC', res);
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        let defaultUser = res.data.map((item, index) => {
          if (item.isCurrent === true) {
            return item.id;
          }
        });
        let finalData = defaultUser.filter(function (element) {
          return element !== undefined;
        });

        let defaultUserName = res.data.map((item, index) => {
          if (item.isCurrent === true) {
            return item.name;
          }
        });
        let finalDataName = defaultUserName.filter(function (element) {
          return element !== undefined;
        });

        // console.warn('finalDataName', finalDataName[0]);

        this.setState({
          locationArr: finalUsersList,
          finalLocation: finalData[0],
          finalLocationName: finalDataName[0],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  selectSupplierFun = (item, index) => {
    console.log('ITEM', item);
    console.log('index', index);

    const {draftsOrderData, finalLocation} = this.state;

    const isSelectedValue = item.isSelected === false ? true : false;

    let newArr = draftsOrderData.map((item, i) =>
      index === i
        ? {
            ...item,
            ['isSelected']: isSelectedValue,
          }
        : {
            ...item,
          },
    );

    let selectedArr = newArr.map((item, index) => {
      if (item.isSelected === true) {
        return {
          locationId: finalLocation,
          supplierId: item.id,
        };
      }
    });

    var filteredArr = selectedArr.filter(function (el) {
      return el != null;
    });

    console.log('filteredArr', filteredArr);

    this.setState({
      draftsOrderData: newArr,
      draftsOrderDataBackup: newArr,
      modalLoaderDrafts: false,
      payloadArr: filteredArr,
    });
  };

  selectAllFun = () => {
    const {selectAllStatus, draftsOrderData, finalLocation} = this.state;
    this.setState({
      selectAllStatus: !selectAllStatus,
    });
    const index = 0;
    const i = 0;

    let newArr = draftsOrderData.map((item, i) =>
      index === i
        ? {
            ...item,
            ['isSelected']: !selectAllStatus,
          }
        : {
            ...item,
            ['isSelected']: !selectAllStatus,
          },
    );

    let finalArray = newArr.map((item, index) => {
      if (item.isSelected === true) {
        return {
          locationId: finalLocation,
          supplierId: item.id,
        };
      }
    });

    console.log('finalArray', finalArray);
    console.log('selectAllStatus', !selectAllStatus);

    this.setState({
      draftsOrderData: newArr,
      draftsOrderDataBackup: newArr,
      modalLoaderDrafts: false,
      payloadArr: !selectAllStatus && finalArray,
    });
  };

  requestCollaborationFun = () => {
    const {payloadArr} = this.state;

    if (payloadArr.length > 0) {
      this.setState(
        {
          recipeLoader: true,
        },
        () => this.requestCollaborationFunSec(),
      );
    } else {
      alert(translate('Please select supplier first'));
    }
  };
  requestCollaborationFunSec = () => {
    const {payloadArr} = this.state;
    const payload = {
      suppliers: payloadArr,
    };

    console.log('payload-->', payload);

    createCollaborationApi(payload)
      .then(res => {
        console.log('res-CreateColl', res);
        this.setState({
          recipeLoader: false,
        });
      })
      .catch(err => {
        Alert.alert(
          err.response.data && err.response.data.message,
          err.response.data && err.response.data.errors[0].message,
          [
            {
              text: translate('Ok'),
              onPress: () =>
                this.setState({
                  recipeLoader: false,
                  filteredArr: [],
                }),
            },
          ],
        );
      });
  };

  render() {
    const {
      recipeLoader,
      modalLoaderDrafts,
      draftsOrderData,
      searchItem,
      param,
      selectAllStatus,
    } = this.state;

    console.log('draftsOrderData', draftsOrderData);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfileFun}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />

        <View style={{marginBottom: hp('2%')}}>
          <View>
            <View style={styles.subContainer}>
              <TouchableOpacity
                style={styles.firstContainer}
                onPress={() => this.props.navigation.goBack()}>
                <View style={styles.goBackContainer}>
                  <Image source={img.backIcon} style={styles.tileImageBack} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Select supplier')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingLeft: wp('5%'),
            }}>
            <View
              style={{
                width: wp('90%'),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 5,
                height: hp('7%'),
              }}>
              <TextInput
                placeholder={translate('SearchDot')}
                style={{
                  padding: 12,
                  borderRadius: 5,
                  width: '85%',
                }}
                value={searchItem}
                onChangeText={value => this.searchFun(value)}
              />
              <View>
                <Image
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                  }}
                  source={img.searchIcon}
                />
              </View>
            </View>
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="grey" />
          ) : (
            <View style={{marginTop: hp('3%'), height: hp('60%')}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      marginHorizontal: wp('4%'),
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flex: 1,
                        backgroundColor: '#C9C9C9',
                        paddingVertical: hp('2%'),
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                        paddingHorizontal: wp('2%'),
                        borderWidth: 0.2,
                        borderColor: 'grey',
                      }}>
                      <TouchableOpacity
                        onPress={() => this.selectAllFun()}
                        style={{
                          flex: 0.2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <View
                          style={{
                            borderWidth: 0.5,
                            borderRadius: 2,
                            padding: 3,
                            backgroundColor: '#fff',
                            borderColor: 'grey',
                          }}>
                          {selectAllStatus ? (
                            <Image
                              style={{
                                width: 15,
                                height: 15,
                                resizeMode: 'contain',
                                marginLeft: 5,
                                tintColor: '#5297c1',
                              }}
                              source={img.tickIcon}
                            />
                          ) : (
                            <View
                              style={{
                                backgroundColor: '#fff',
                                padding: 7,
                              }}></View>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('SUPPLIER')}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          flexDirection: 'row',
                          marginLeft: wp('2%'),
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 14,
                          }}>
                          {translate('Supplier')}
                        </Text>
                        <View>
                          <Image
                            style={{
                              width: 15,
                              height: 15,
                              resizeMode: 'contain',
                              marginLeft: 5,
                            }}
                            source={img.doubleArrowIconNew}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    {draftsOrderData &&
                      draftsOrderData.map((item, index) => {
                        return (
                          <View style={{}}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,

                                paddingHorizontal: wp('3%'),
                                borderWidth: 0.2,
                                borderColor: 'grey',
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  this.selectSupplierFun(item, index)
                                }
                                style={{
                                  flexDirection: 'row',
                                  flex: 2.2,
                                  paddingVertical: hp('2%'),
                                }}>
                                <View
                                  style={{
                                    flex: 0.2,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <View
                                    style={{
                                      borderWidth: 0.5,
                                      borderRadius: 2,
                                      padding: 3,
                                      backgroundColor: '#fff',
                                      borderColor: 'grey',
                                    }}>
                                    {item.isSelected ? (
                                      <Image
                                        style={{
                                          width: 15,
                                          height: 15,
                                          resizeMode: 'contain',
                                          marginLeft: 5,
                                          tintColor: '#5297c1',
                                        }}
                                        source={img.tickIcon}
                                      />
                                    ) : (
                                      <View
                                        style={{
                                          backgroundColor: '#fff',
                                          padding: 7,
                                        }}></View>
                                    )}
                                  </View>
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    marginLeft: wp('2%'),
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                    }}>
                                    {item.name}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={() => this.requestCollaborationFun()}
                style={{
                  width: wp('90%'),
                  height: hp('7%'),
                  backgroundColor: '#5297c1',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                  marginTop: hp('3%'),
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {translate('Request collaboration')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={{
                  width: wp('90%'),
                  height: hp('7%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: '#5297c1',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {translate('Cancel')}
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                // onPress={() => this.addMoreFun()}
                style={{
                  marginTop: hp('4%'),
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter-SemiBold',
                    color: 'black',
                    color: '#5297c1',
                    fontWeight: 'bold',
                    textDecorationLine: 'underline',
                  }}>
                  {translate('Load more')}
                </Text>
              </TouchableOpacity> */}
            </View>
          )}
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

export default connect(mapStateToProps, {UserTokenAction})(SupplierListNoAcc);
