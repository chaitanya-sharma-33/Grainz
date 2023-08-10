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
  draftOrderingApi,
  duplicateApi,
  orderByStatusApi,
  getSupplierListApi,
} from '../../../../connectivity/api';
import moment from 'moment';
import styles from './style';
import ModalDropdown from 'react-native-modal-dropdown';
import {translate} from '../../../../utils/translations';
import SurePopUp from '../../../../components/SurePopUp';
import Modal from 'react-native-modal';
import call from 'react-native-phone-call';

class SupplierList extends Component {
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
      duplicateModalStatus: false,
      pageSize: '10',
      selectedPage: '1',
      loadMoreStatus: false,
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
    this.props.navigation.addListener('focus', () => {
      const {route} = this.props;

      this.getSupplierListData();
      this.getData();
    });
  }

  getSupplierListData() {
    this.setState(
      {
        modalLoaderDrafts: true,
      },
      () =>
        getSupplierListApi()
          .then(res => {
            console.log('res', res);

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

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  closeModalFun = () => {
    this.setState({
      pickerModalStatus: false,
      duplicateModalStatus: false,
    });
  };

  duplicateModalFun = () => {
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(
          () =>
            this.setState({
              duplicateModalStatus: true,
            }),
          1000,
        ),
    );
  };

  duplicateModalFunSec = () => {
    const {param} = this.state;
    this.setState(
      {
        recipeLoader: true,
        duplicateModalStatus: false,
      },
      () =>
        duplicateApi(param.id)
          .then(res => {
            this.setState(
              {
                recipeLoader: false,
              },
              () => this.getDraftOrderData(),
            );
          })
          .catch(error => {
            console.warn('Duplicateerror', error.response);
          }),
    );
  };

  pickerFun = item => {
    console.log('item-->', item);
    this.setState({
      pickerModalStatus: true,
      param: item,
    });
  };

  //   addMoreFun = () => {
  //     const {selectedPage} = this.state;
  //     const newPageNumber = parseInt(selectedPage) + 1;
  //     this.setState(
  //       {
  //         selectedPage: newPageNumber,
  //         modalLoaderDrafts: true,
  //         loadMoreStatus: true,
  //       },
  //       () => this.getDraftOrderData(),
  //     );
  //   };

  callSupplierFun = () => {
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(() => {
          this.callSupplierFunSec();
        }, 500),
    );
  };

  callSupplierFunSec = () => {
    const {param} = this.state;
    console.log('param', param);
    const args = {
      number: param.telephone, // String value with the number to call
      prompt: false, // Optional boolean property. Determines if the user should be prompted prior to the call
      skipCanOpen: true, // Skip the canOpenURL check
    };

    call(args).catch(console.error);
  };

  seeOrdersFun = () => {
    const {param} = this.state;
    console.log('param', param);
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(() => {
          this.props.navigation.navigate('OrderingAdminScreen', {
            item: param,
          });
        }, 100),
    );
  };

  inviteNewSupplierFun = () => {
    this.props.navigation.navigate('InviteSupplierScreen');
  };

  selectSupplierFun = () => {
    this.props.navigation.navigate('SupplierListNoAccScreen');
  };
  render() {
    const {
      recipeLoader,
      modalLoaderDrafts,
      draftsOrderData,
      searchItem,
      pickerModalStatus,
      duplicateModalStatus,
      param,
    } = this.state;

    console.log('  item: param,', param);

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
                    {translate('Suppliers')}
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
                placeholder={translate('Search')}
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: hp('3%'),
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={() => this.inviteNewSupplierFun()}
              style={{
                height: hp('7%'),
                width: wp('40%'),
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#5197C1',
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#5197C1',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Invite new supplier')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.selectSupplierFun()}
              style={{
                height: hp('7%'),
                width: wp('40%'),
                backgroundColor: '#5197C1',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginLeft: wp('5%'),
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
                  {translate('Grainz suppliers')}
                </Text>
              </View>
            </TouchableOpacity>
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
                        onPress={() => this.arrangeListFun('SUPPLIER')}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          flexDirection: 'row',
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
                      <TouchableOpacity
                        onPress={() => this.arrangeListFun('HTVA')}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 14,
                          }}>
                          Contact
                        </Text>
                        <View></View>
                      </TouchableOpacity>
                      <View
                        onPress={() => this.arrangeListFun('HTVA')}
                        style={{
                          flex: 0.5,
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}></Text>
                      </View>
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
                                  this.props.navigation.navigate(
                                    'SupplierDetailScreen',
                                    {supplierData: item},
                                  )
                                }
                                style={{
                                  flexDirection: 'row',
                                  flex: 2.2,
                                  paddingVertical: hp('2%'),
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                    }}>
                                    {item.name}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                    }}>
                                    {item.telephone}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                // onPress={() => this.pickerFun(item)}
                                style={{
                                  flex: 0.5,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                {/* <Image
                                  style={{
                                    width: 17,
                                    height: 17,
                                    resizeMode: 'contain',
                                    tintColor: 'grey',
                                  }}
                                  source={img.threeDotsIcon}
                                /> */}
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                )}
              </ScrollView>
              <Modal
                isVisible={pickerModalStatus}
                backdropOpacity={0.35}
                animationIn="bounceInRight">
                <View
                  style={{
                    width: wp('80%'),
                    height: hp('20%'),
                    backgroundColor: '#fff',
                    alignSelf: 'center',
                    borderRadius: 6,
                  }}>
                  <View
                    style={{
                      height: hp('5%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        flex: 3,
                      }}></View>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            pickerModalStatus: false,
                          })
                        }>
                        <Image
                          source={img.cancelIcon}
                          style={{
                            height: 22,
                            width: 22,
                            resizeMode: 'contain',
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ScrollView>
                    <View style={{padding: hp('3%')}}>
                      <TouchableOpacity
                        onPress={() => this.callSupplierFun()}
                        style={{
                          width: wp('70%'),
                          height: hp('5%'),
                          backgroundColor: '#5297c1',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 6,
                          marginBottom: 5,
                          alignSelf: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 'bold',
                          }}>
                          Call supplier
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => this.seeOrdersFun()}
                        style={{
                          width: wp('90%'),
                          height: hp('5%'),
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 10,
                          marginBottom: 5,
                          alignSelf: 'center',
                        }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 14,
                            fontWeight: 'bold',
                          }}>
                          See Orders
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </Modal>
              <SurePopUp
                pickerModalStatus={duplicateModalStatus}
                headingText={translate('Duplicate')}
                crossFun={() => this.closeModalFun()}
                bodyText={translate('WholeList')}
                cancelFun={() => this.closeModalFun()}
                saveFun={() => this.duplicateModalFunSec()}
                yesStatus
              />

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

export default connect(mapStateToProps, {UserTokenAction})(SupplierList);
