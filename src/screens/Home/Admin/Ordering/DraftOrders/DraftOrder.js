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
  duplicateApi,
  orderByStatusApi,
  getfilteredOrderDataApi,
} from '../../../../../connectivity/api';
import moment from 'moment';
import styles from '../style';
import ModalDropdown from 'react-native-modal-dropdown';
import {translate} from '../../../../../utils/translations';
import SurePopUp from '../../../../../components/SurePopUp';
import Modal from 'react-native-modal';

class DraftOrder extends Component {
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
      deleteModalStatus: false,
      pageSize: '10',
      selectedPage: '1',
      loadMoreStatus: false,
      payloadFilter: '',
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
      const filterData = route.params.filterData;
      const payloadData = route.params.payloadData;
      const supplierData = route.params.supplierData;
      console.log('supplierData', supplierData);
      this.setState({
        filterData,
        payloadFilter: payloadData,
      });

      if (filterData) {
        this.setState(
          {
            casualListLoader: true,
          },
          () => this.filterDataFun(filterData),
        );
      } else {
        this.setState(
          {
            draftsOrderData: [],
            draftsOrderDataBackup: [],
            selectedPage: '1',
          },
          () => this.getDraftOrderData(supplierData),
        );
      }
      this.getData();
    });
  }

  filterDataFun = filterData => {
    this.setState({
      draftsOrderData: filterData,
      modalLoaderDrafts: false,
      draftsOrderDataBackup: filterData,
    });
  };

  getDraftOrderData = supplierData => {
    const {selectedPage, pageSize, loadMoreStatus, draftsOrderData} =
      this.state;

    let payload = {
      status: 'Draft',
      selectedPage: selectedPage,
      pageSize: pageSize,
      supplierId: supplierData ? supplierData.id : '',
    };

    console.log('payload', payload);
    orderByStatusApi(payload)
      .then(res => {
        console.log('res-->ORDER', res);
        console.log('res-->draftsOrderData', draftsOrderData);

        const finalArr = [...draftsOrderData, ...res.data];
        console.log('res-->finalArr', finalArr);

        this.setState({
          draftsOrderData: loadMoreStatus ? finalArr : res.data,
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

  deleteFun = () => {
    const {param} = this.state;
    this.setState(
      {
        recipeLoader: true,
        deleteModalStatus: false,
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

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  closeModalFun = () => {
    this.setState({
      pickerModalStatus: false,
      duplicateModalStatus: false,
      deleteModalStatus: false,
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
    // shopingBasketId = param.shopingBasketId
    // this.setState({
    //   duplicateModalStatus: false,
    // });

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
            this.setState({
              deleteLoader: false,
            });
            console.warn('Duplicateerror', error.response);
          }),
    );
  };

  deleteModalFun = () => {
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(
          () =>
            this.setState({
              deleteModalStatus: true,
            }),
          1000,
        ),
    );
  };

  pickerFun = item => {
    // console.log('item', item);
    this.setState({
      pickerModalStatus: true,
      param: item,
    });
  };

  addFilteredData = res => {
    const {draftsOrderData} = this.state;

    const finalArr = [...draftsOrderData, ...res.data];

    this.setState({
      draftsOrderData: finalArr,
      draftsOrderDataBackup: finalArr,
      modalLoaderDrafts: false,
    });
  };

  getFilteredData = async () => {
    const {payloadFilter, selectedPage} = this.state;
    const {
      suppliers,
      startDate,
      endDate,
      flagged,
      hasCreditNote,
      pageSize,
      status,
    } = payloadFilter;
    let payload = {
      suppliers: suppliers ? suppliers : [],
      startDate: startDate,
      endDate: endDate,
      flagged: flagged,
      selectedPage: selectedPage,
      hasCreditNote: hasCreditNote,
      pageSize: pageSize,
      status: status,
    };
    console.log('payload', payload);

    getfilteredOrderDataApi(payload)
      .then(res => {
        console.log('res', res);

        this.addFilteredData(res);
      })
      .catch(err => {
        Alert.alert(
          `Error - Filter ${err.response.status}`,
          'Something went wrong',
          [
            {
              text: 'Okay',
              onPress: () => this.props.navigation.goBack(),
            },
          ],
        );
      });
  };

  addMoreFun = () => {
    const {selectedPage} = this.state;
    const newPageNumber = parseInt(selectedPage) + 1;
    const {filterData} = this.state;
    if (filterData) {
      this.setState(
        {
          selectedPage: newPageNumber,
          modalLoaderDrafts: true,
          loadMoreStatus: true,
        },
        () => this.getFilteredData(),
      );
    } else {
      this.setState(
        {
          selectedPage: newPageNumber,
          modalLoaderDrafts: true,
          loadMoreStatus: true,
        },
        () => this.getDraftOrderData(),
      );
    }
  };

  render() {
    const {
      recipeLoader,
      modalLoaderDrafts,
      draftsOrderData,
      searchItem,
      pickerModalStatus,
      duplicateModalStatus,
      deleteModalStatus,
      filterData,
      supplierData,
    } = this.state;

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
                    {translate('Draft Orders')}
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
                width: wp('60%'),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 5,
              }}>
              <TextInput
                placeholder="Search"
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
            <TouchableOpacity
              style={{
                width: wp('29%'),
                marginLeft: 10,
                backgroundColor: '#fff',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 5,
              }}
              onPress={() =>
                this.props.navigation.navigate('FilterOrderScreen', {
                  item: '',
                  screenType: 'Draft',
                })
              }>
              <View>
                <Image
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    marginLeft: 10,
                    tintColor: 'grey',
                  }}
                  source={img.filterIcon}
                />
              </View>
              <View>
                <Text
                  style={{
                    padding: 12,
                    color: 'grey',
                  }}>
                  Filter
                </Text>
              </View>
              {filterData ? (
                <TouchableOpacity
                  onPress={() =>
                    this.setState(
                      {
                        filterData: undefined,
                      },
                      () => this.getDraftOrderData(supplierData),
                    )
                  }>
                  <Image
                    style={{
                      width: 18,
                      height: 18,
                      resizeMode: 'contain',
                    }}
                    source={img.deleteIcon}
                  />
                </TouchableOpacity>
              ) : null}
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
                            fontSize: 14,
                          }}>
                          {translate('Order date')}
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
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 14,
                          }}>
                          {translate('Value')} €
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
                      <View
                        onPress={() => this.arrangeListFun('HTVA')}
                        style={{
                          flex: 0.2,
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
                                  index % 2 === 0 ? '#FFFFFF' : '#F5F8FE',
                                // borderTopLeftRadius: 5,
                                // borderTopRightRadius: 5,
                                paddingHorizontal: wp('3%'),
                                borderWidth: 0.2,
                                borderColor: 'grey',
                              }}>
                              <TouchableOpacity
                                // onPress={() => console.log('item', item)}
                                onPress={() =>
                                  this.props.navigation.navigate(
                                    'EditDraftOrderScreen',
                                    {
                                      productId: item.id,
                                      basketId: item.shopingBasketId,
                                      finalData: item,
                                    },
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
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                    }}>
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
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                    }}>
                                    {item.supplierName}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                    }}>
                                    € {item.htva && item.htva.toFixed(2)}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => this.pickerFun(item)}
                                style={{
                                  flex: 0.2,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Image
                                  style={{
                                    width: 17,
                                    height: 17,
                                    resizeMode: 'contain',
                                    tintColor: 'grey',
                                  }}
                                  source={img.threeDotsIcon}
                                />
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
                        onPress={() => this.duplicateModalFun()}
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
                          {translate('Duplicate')}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => this.deleteModalFun()}
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
                            color: 'red',
                            fontSize: 14,
                            fontWeight: 'bold',
                          }}>
                          {translate('Delete')}
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
                bodyText="Whole list of items from this order will be duplicated in a new draft. Are you sure you want to proceed?"
                cancelFun={() => this.closeModalFun()}
                saveFun={() => this.duplicateModalFunSec()}
                yesStatus
              />
              <SurePopUp
                pickerModalStatus={deleteModalStatus}
                headingText={translate('Delete')}
                crossFun={() => this.closeModalFun()}
                bodyText="Are you sure you want to delete this item from the list?"
                cancelFun={() => this.closeModalFun()}
                saveFun={() => this.deleteFun()}
                yesStatus
              />
              <TouchableOpacity
                // onPress={() =>
                //   this.props.navigation.navigate('NewOrderScreen', {
                //     ScreenType: '',
                //   })
                // }
                onPress={() =>
                  this.props.navigation.navigate('NewOrderSecScreen', {
                    item: '',
                  })
                }
                style={{
                  position: 'absolute',
                  right: 20,
                  top: hp('50%'),
                  flexDirection: 'row',
                  backgroundColor: '#5297c1',
                  padding: 15,
                  borderRadius: 5,
                }}>
                <View>
                  <Image
                    style={{...styles.listImageStyling, tintColor: '#fff'}}
                    source={img.plusIcon}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter-SemiBold',
                    color: 'black',
                    marginLeft: 5,
                    color: '#fff',
                    fontWeight: 'bold',
                  }}>
                  {translate('New Order')}
                </Text>
              </TouchableOpacity>
              {draftsOrderData.length > 5 ? (
                <TouchableOpacity
                  onPress={() => this.addMoreFun()}
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
                </TouchableOpacity>
              ) : null}
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

export default connect(mapStateToProps, {UserTokenAction})(DraftOrder);

// import React, {Component} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   TextInput,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {connect} from 'react-redux';
// import img from '../../../../../constants/images';
// import SubHeader from '../../../../../components/SubHeader';
// import Header from '../../../../../components/Header';
// import moment from 'moment';
// import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
// import {
//   getMyProfileApi,
//   draftOrderingApi,
// } from '../../../../../connectivity/api';
// import {translate} from '../../../../../utils/translations';
// import styles from '../style';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';

// class DraftOrder extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       token: '',
//       draftsOrderData: [],
//       modalLoaderDrafts: true,
//       recipeLoader: true,
//       arrangeStatusSupplier: 0,
//       arrangeStatusDate: 0,
//       arrangeStatusHTVA: 0,
//       searchItem: '',
//       draftsOrderDataBackup: [],
//     };
//   }

//   getProfileDataFun = async () => {
//     try {
//       const value = await AsyncStorage.getItem('@appToken');
//       if (value !== null) {
//         this.setState(
//           {
//             token: value,
//           },
//           () => this.getProfileData(),
//         );
//       }
//     } catch (e) {
//       console.warn('ErrHome', e);
//     }
//   };

//   getProfileData = () => {
//     getMyProfileApi()
//       .then(res => {
//         this.setState({
//           recipeLoader: false,

//         });
//       })
//       .catch(err => {
//         console.warn('ERr', err);
//       });
//   };

//   getDraftOrderData = () => {
//     draftOrderingApi()
//       .then(res => {
//         this.setState({
//           draftsOrderData: res.data,
//           draftsOrderDataBackup: res.data,
//           modalLoaderDrafts: false,
//         });
//       })
//       .catch(err => {
//         Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
//           {
//             text: 'Okay',
//             onPress: () => this.props.navigation.goBack(),
//           },
//         ]);
//       });
//   };

//   componentDidMount() {
//     this.props.navigation.addListener('focus', () => {
//       this.getDraftOrderData();
//     });
//     this.getProfileDataFun();
//   }

//   navigateToEditFun(order) {
//     this.props.navigation.navigate('EditPurchase', {
//       orderData: order,
//     });
//   }

//   arrangeListFun = funType => {
//     if (funType === 'SUPPLIER') {
//       this.setState(
//         {
//           arrangeStatusSupplier: Number(1) + this.state.arrangeStatusSupplier,
//         },
//         () => this.arrangeListFunSec('SUPPLIER'),
//       );
//     } else if (funType === 'DATE') {
//       this.setState(
//         {
//           arrangeStatusDate: Number(1) + this.state.arrangeStatusDate,
//         },
//         () => this.arrangeListFunSec('DATE'),
//       );
//     } else if (funType === 'HTVA') {
//       this.setState(
//         {
//           arrangeStatusHTVA: Number(1) + this.state.arrangeStatusHTVA,
//         },
//         () => this.arrangeListFunSec('HTVA'),
//       );
//     }
//   };

//   arrangeListFunSec = type => {
//     const {arrangeStatusSupplier, arrangeStatusDate, arrangeStatusHTVA} =
//       this.state;
//     const finalData =
//       type === 'SUPPLIER'
//         ? arrangeStatusSupplier
//         : type === 'DATE'
//         ? arrangeStatusDate
//         : arrangeStatusHTVA;
//     if (finalData % 2 == 0) {
//       this.reverseFun();
//     } else {
//       this.descendingOrderFun(type);
//     }
//   };

//   reverseFun = () => {
//     const {draftsOrderData} = this.state;
//     const finalData = draftsOrderData.reverse();

//     this.setState({
//       draftsOrderData: finalData,
//     });
//   };

//   descendingOrderFun = type => {
//     const {draftsOrderData} = this.state;

//     if (type === 'SUPPLIER') {
//       function dynamicSort(property) {
//         var sortOrder = 1;

//         if (property[0] === '-') {
//           sortOrder = -1;
//           property = property.substr(1);
//         }

//         return function (a, b) {
//           if (sortOrder == -1) {
//             return b[property].localeCompare(a[property]);
//           } else {
//             return a[property].localeCompare(b[property]);
//           }
//         };
//       }
//       const finalKeyValue =
//         type === 'SUPPLIER'
//           ? 'supplierName'
//           : type === 'DATE'
//           ? 'orderDate'
//           : 'htva';

//       const finalData = draftsOrderData.sort(dynamicSort(finalKeyValue));

//       this.setState({
//         draftsOrderData: finalData,
//       });
//     } else {
//       function dynamicSort(property) {
//         var sortOrder = 1;
//         if (property[0] === '-') {
//           sortOrder = -1;
//           property = property.substr(1);
//         }
//         return function (a, b) {
//           var result =
//             a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
//           return result * sortOrder;
//         };
//       }
//       const finalKeyValue =
//         type === 'SUPPLIER'
//           ? 'supplierName'
//           : type === 'DATE'
//           ? 'orderDate'
//           : 'htva';

//       const finalData = draftsOrderData.sort(dynamicSort(finalKeyValue));

//       this.setState({
//         draftsOrderData: finalData,
//       });
//     }
//   };

//   searchFun = txt => {
//     console.log('value={searchItem}', txt);
//     this.setState(
//       {
//         searchItem: txt,
//       },
//       () => this.filterData(txt),
//     );
//   };

//   filterData = text => {
//     console.log('draftsOrderData', this.state.draftsOrderData);
//     // passing the inserted text in textinput
//     const newData = this.state.draftsOrderDataBackup.filter(function (item) {
//       //applying filter for the inserted text in search bar
//       const itemData = item.supplierName
//         ? item.supplierName.toUpperCase()
//         : ''.toUpperCase();
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     this.setState({
//       //setting the filtered newData on datasource
//       //After setting the data it will automatically re-render the view
//       draftsOrderData: newData,
//       searchItem: text,
//     });
//   };

//   render() {
//     const {
//       draftsOrderData,
//       modalLoaderDrafts,
//       recipeLoader,
//       searchItem,
//     } = this.state;
//     console.log('draftsOrderData', draftsOrderData);
//     return (
//       <View style={styles.container}>
//         <Header
//           logoutFun={this.myProfileFun}
//           logoFun={() => this.props.navigation.navigate('HomeScreen')}
//         />
//
//         {/* <ScrollView
//           ref={ref => {
//             this.scrollListReftop = ref;
//           }}> */}
//         <View>
//           <View style={styles.subContainer}>
//             <View style={styles.firstContainer}>
//               <TouchableOpacity
//                 onPress={() => this.props.navigation.goBack()}
//                 style={styles.goBackContainer}>
//                 <Image source={img.backIcon} style={styles.tileImageBack} />
//               </TouchableOpacity>
//               <View style={styles.flex}>
//                 <Text style={styles.adminTextStyle}>
//                   {translate('Draft Orders')}
//                 </Text>
//               </View>
//               {/* <TouchableOpacity
//                   onPress={() => this.props.navigation.goBack()}
//                   style={styles.goBackContainer}>
//                   <Text style={styles.goBackTextStyle}>
//                     {' '}
//                     {translate('Go Back')}
//                   </Text>
//                 </TouchableOpacity> */}
//             </View>
//           </View>
//         </View>
//         <View
//           style={{
//             flexDirection: 'row',
//             paddingLeft: wp('5%'),
//           }}>
//           <View
//             style={{
//               width: wp('60%'),
//               flexDirection: 'row',
//               alignItems: 'center',
//               backgroundColor: '#fff',
//               borderRadius: 5,
//             }}>
//             <TextInput
//               placeholder="Search"
//               style={{
//                 padding: 12,
//                 borderRadius: 5,
//                 width: '85%',
//               }}
//               value={searchItem}
//               onChangeText={value => this.searchFun(value)}
//             />
//             <View>
//               <Image
//                 style={{
//                   width: 18,
//                   height: 18,
//                   resizeMode: 'contain',
//                 }}
//                 source={img.searchIcon}
//               />
//             </View>
//           </View>
//           <TouchableOpacity
//             style={{
//               width: wp('29%'),
//               marginLeft: 10,
//               backgroundColor: '#fff',
//               flexDirection: 'row',
//               alignItems: 'center',
//               borderRadius: 5,
//             }}
//             onPress={() =>
//               this.props.navigation.navigate('FilterPurchaseScreen')
//             }>
//             <View>
//               <Image
//                 style={{
//                   width: 18,
//                   height: 18,
//                   resizeMode: 'contain',
//                   marginLeft: 10,
//                   tintColor: 'grey',
//                 }}
//                 source={img.filterIcon}
//               />
//             </View>
//             <View>
//               <Text
//                 style={{
//                   padding: 12,
//                   color: 'grey',
//                 }}>
//                 Filter
//               </Text>
//             </View>
//             {/* <TextInput
//               placeholder="Filter"
//               style={{
//                 backgroundColor: '#fff',
//                 padding: 12,
//                 borderRadius: 5,
//               }}
//               editable={false}
//             /> */}
//           </TouchableOpacity>
//         </View>
//         <View style={{marginTop: '5%'}}>
//           <View style={styles.listHeading}>
//             <TouchableOpacity
//               style={styles.listSubHeading}
//               onPress={() => this.arrangeListFun('DATE')}>
//               <Text style={styles.listTextStyling}>
//                 {translate('Order date')}
//               </Text>
//               <View>
//                 <Image
//                   style={styles.listImageStyling}
//                   source={img.doubleArrowIconNew}
//                 />
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.listSubHeading}
//               onPress={() => this.arrangeListFun('SUPPLIER')}>
//               <Text style={styles.listTextStyling}>
//                 {translate('Supplier')}
//               </Text>
//               <View>
//                 <Image
//                   style={styles.listImageStyling}
//                   source={img.doubleArrowIconNew}
//                 />
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.listSubHeading}
//               onPress={() => this.arrangeListFun('HTVA')}>
//               <Text style={styles.listTextStyling}>{translate('Value')} €</Text>
//               <View>
//                 <Image
//                   style={styles.listImageStyling}
//                   source={img.doubleArrowIconNew}
//                 />
//               </View>
//             </TouchableOpacity>
//             {/* <View style={styles.listSubHeading}></View> */}
//           </View>

//           <ScrollView>
//             {modalLoaderDrafts ? (
//               <ActivityIndicator color="grey" size="large" />
//             ) : (
//               draftsOrderData.map((item, index) => {
//                 // console.log('ITEM', item);
//                 const date = moment(item.orderDate).format('DD/MM/YYYY');
//                 const price = Math.round(item.htva);
//                 return (
//                   <TouchableOpacity
//                     onPress={() => this.navigateToEditFun(item)}
//                     style={{
//                       ...styles.listDataHeadingContainer,
//                       backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#EEF2FD',
//                       borderColor: '#EAEAF0',
//                       borderWidth: 1,
//                     }}>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                       }}>
//                       <View
//                         style={styles.listSubHeading}
//                         onPress={() => this.arrangeListFun('DATE')}>
//                         <Text style={styles.listTextStyling}>{date}</Text>
//                       </View>
//                       <View
//                         style={styles.listSubHeading}
//                         onPress={() => this.arrangeListFun('SUPPLIER')}>
//                         <Text
//                           style={{
//                             ...styles.listTextStyling,
//                             width: wp('15%'),
//                           }}
//                           numberOfLines={1}>
//                           {item.supplierName}
//                         </Text>
//                         <View>
//                           {item.hasWarning ? (
//                             <View style={styles.listDataContainer}>
//                               <Image
//                                 style={{
//                                   width: 15,
//                                   height: 15,
//                                   resizeMode: 'contain',
//                                   marginLeft: 10,
//                                 }}
//                                 source={img.flagIcon}
//                               />
//                             </View>
//                           ) : (
//                             <View style={styles.listDataContainer}></View>
//                           )}
//                         </View>
//                       </View>
//                       <View
//                         style={styles.listSubHeading}
//                         onPress={() => this.arrangeListFun('HTVA')}>
//                         <Text style={styles.listTextStyling}>€ {price}</Text>
//                       </View>
//                     </View>

//                     {/* <TouchableOpacity
//                       style={styles.listDataHeadingSubContainer}
//                       onPress={() => this.navigateToEditFun(item)}>
//                       <View style={styles.listDataContainer}>
//                         <Text style={styles.listDataTextStyling}>{date}</Text>
//                       </View>
//                       <View style={styles.listDataContainer}>
//                         <Text style={styles.listDataTextStyling}>
//                           {item.supplierName}
//                         </Text>
//                       </View>
//                       <View style={styles.listDataContainer}>
//                         <Text style={styles.listDataTextStyling}>
//                           € {price}
//                         </Text>
//                       </View>
//                       {item.hasWarning ? (
//                         <View style={styles.listDataContainer}>
//                           <Image
//                             style={{
//                               width: 15,
//                               height: 15,
//                               resizeMode: 'contain',
//                             }}
//                             source={img.errorIcon}
//                           />
//                         </View>
//                       ) : (
//                         <View style={styles.listDataContainer}></View>
//                       )}
//                     </TouchableOpacity> */}
//                   </TouchableOpacity>
//                 );
//               })
//             )}
//           </ScrollView>
//           <TouchableOpacity
//             onPress={() =>
//               this.props.navigation.navigate('AddPurchaseScreen', {
//                 item: '',
//               })
//             }
//             style={{
//               position: 'absolute',
//               right: 20,
//               top: hp('50%'),
//               flexDirection: 'row',
//               backgroundColor: '#5297c1',
//               padding: 15,
//               borderRadius: 5,
//             }}>
//             <View>
//               <Image
//                 style={{...styles.listImageStyling, tintColor: '#fff'}}
//                 source={img.plusIcon}
//               />
//             </View>
//             <Text
//               style={{
//                 fontSize: 12,
//                 fontFamily: 'Inter-SemiBold',
//                 color: 'black',
//                 marginLeft: 5,
//                 color: '#fff',
//                 fontWeight: 'bold',
//               }}>
//               {translate('New Purchase')}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         {/* </ScrollView> */}
//       </View>
//     );
//   }
// }

// const mapStateToProps = state => {
//   return {
//     UserTokenReducer: state.UserTokenReducer,
//     GetMyProfileReducer: state.GetMyProfileReducer,
//   };
// };

// export default connect(mapStateToProps, {UserTokenAction})(DraftOrder);
