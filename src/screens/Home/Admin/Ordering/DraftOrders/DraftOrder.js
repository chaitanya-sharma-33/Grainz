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
  draftOrderingApi,
  deleteOrderApi,
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';

import {translate} from '../../../../../utils/translations';

class DraftOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      modalLoaderDrafts: true,
      draftsOrderData: [],
      draftsOrderDataBackup: [],
      searchItem: '',
      arrangeStatusSupplier: 0,
      arrangeStatusDate: 0,
      arrangeStatusHTVA: 0,
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
    this.props.navigation.addListener('focus', () => {
      this.getData();
      this.getDraftOrderData();
    });
  }

  getDraftOrderData = () => {
    draftOrderingApi()
      .then(res => {
        this.setState({
          draftsOrderData: res.data,
          draftsOrderDataBackup: res.data,
          modalLoaderDrafts: false,
        });
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
      const itemData = item.supplierName
        ? item.supplierName.toUpperCase()
        : ''.toUpperCase();
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
        type === 'SUPPLIER'
          ? 'supplierName'
          : type === 'DATE'
          ? 'orderDate'
          : 'htva';

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

  deleteDraftFun = param => {
    Alert.alert('Grainz!', 'Are you sure you want to delete this order?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => this.deleteFun(param),
      },
    ]);
  };

  deleteFun = param => {
    this.setState(
      {
        recipeLoader: true,
      },
      () =>
        deleteOrderApi(param.id)
          .then(res => {
            this.setState(
              {
                recipeLoader: false,
              },
              () => this.getDraftOrderData(),
            );
          })
          .catch(error => {
            this.setState({
              deleteLoader: false,
            });
            console.warn('DELETEerror', error.response);
          }),
    );
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalLoaderDrafts,
      draftsOrderData,
      searchItem,
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
                <Text style={styles.adminTextStyle}>
                  {' '}
                  {translate('Draft Orders')}
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
              marginVertical: hp('1.5%'),
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

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('3%')}}>
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
                        backgroundColor: '#EFFBCF',
                        paddingVertical: hp('3%'),
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                        paddingHorizontal: wp('3%'),
                      }}>
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('SUPPLIER')}
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {translate('Supplier')}
                        </Text>
                        <View>
                          <Image
                            style={{
                              width: 13,
                              height: 13,
                              resizeMode: 'contain',
                              marginLeft: 5,
                            }}
                            source={img.doubleArrowIconNew}
                          />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('DATE')}
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {translate('Order date')}
                        </Text>
                        <View>
                          <Image
                            style={{
                              width: 13,
                              height: 13,
                              resizeMode: 'contain',
                              marginLeft: 5,
                            }}
                            source={img.doubleArrowIconNew}
                          />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('HTVA')}
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {translate('Value')}
                        </Text>
                        <View>
                          <Image
                            style={{
                              width: 13,
                              height: 13,
                              resizeMode: 'contain',
                              marginLeft: 5,
                            }}
                            source={img.doubleArrowIconNew}
                          />
                        </View>
                      </TouchableOpacity>
                      <View
                        onPress={() => this.arrangeListFun('HTVA')}
                        style={{
                          flex: 0.5,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {translate('Action')}
                        </Text>
                      </View>
                    </View>
                    {draftsOrderData &&
                      draftsOrderData.map((item, index) => {
                        return (
                          <View>
                            <View
                              // onPress={() =>
                              //   this.props.navigation.navigate(
                              //     'ViewDraftOrdersScreen',
                              //     {
                              //       supplierName: item.supplierName,
                              //       productId: item.id,
                              //       basketId: item.shopingBasketId,
                              //       placedByName: item.placedByNAme,
                              //     },
                              //   )
                              // }

                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                                backgroundColor:
                                  index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                                // borderTopLeftRadius: 5,
                                // borderTopRightRadius: 5,
                                paddingHorizontal: wp('3%'),
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  this.props.navigation.navigate(
                                    'EditDraftOrderScreen',
                                    {
                                      productId: item.id,
                                      basketId: item.shopingBasketId,
                                    },
                                  )
                                }
                                style={{
                                  flexDirection: 'row',
                                  flex: 2.2,
                                  paddingVertical: hp('3%'),
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text style={{}}>{item.supplierName}</Text>
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    {item.orderDate &&
                                      moment(item.orderDate).format(
                                        'DD/MM/YYYY',
                                      )}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    € {item.htva && item.htva.toFixed(2)}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => this.deleteDraftFun(item)}
                                style={{
                                  flex: 0.5,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Image
                                  style={{
                                    width: 17,
                                    height: 17,
                                    resizeMode: 'contain',
                                    tintColor: 'red',
                                  }}
                                  source={img.deleteIconNew}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
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

export default connect(mapStateToProps, {UserTokenAction})(DraftOrder);
