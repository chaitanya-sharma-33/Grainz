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
  updateInventoryProductApi,
} from '../../../../connectivity/api';
import Modal from 'react-native-modal';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';

import {translate, setI18nConfig} from '../../../../utils/translations';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

class OrderingThree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      firstName: '',
      buttonsSubHeader: [],
      loader: false,
      pageData: '',
      privatePrice: true,
      privatePriceValue: '',
      discountPrice: false,
      discountPriceValue: '',
      userDefinedQuantity: '',
      priceFinalBackup: '',
    };
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@appToken');
      if (value !== null) {
        this.setState(
          {
            token: value,
            loader: true,
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
          loader: false,
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
    // const pageData = this.props.route && this.props.route.params.data;

    // const finalPrice = pageData.price * pageData.grainzVolume;
    this.setState({
      // pageData,
      // userDefinedQuantity: String(pageData.userDefinedQuantity),
      // priceFinal: finalPrice.toFixed(2),
      // priceFinalBackup: finalPrice.toFixed(2),
    });
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  saveProductConfigFun = () => {
    const {
      userDefinedQuantity,
      pageData,
      privatePriceValue,
      discountPriceValue,
    } = this.state;
    let payload = {
      discount: null,
      id: pageData.id,
      privatePrice: null,
      userDefinedQuantity: userDefinedQuantity,
      userDefinedUnit: pageData.userDefinedUnit,
    };
    updateInventoryProductApi(payload)
      .then(res => {
        Alert.alert('Grainz', 'Inventory updated successfully', [
          {text: 'Oky', onPress: () => this.props.navigation.goBack()},
        ]);
      })
      .catch(err => {
        console.log('err', err);
      });
  };

  changePriceFun = value => {
    const {privatePriceValue, userDefinedQuantity, priceFinal} = this.state;
    this.setState(
      {
        privatePriceValue: value,
        discountPriceValue: '',
      },
      () => this.changePriceFunSec(),
    );
  };

  changePriceFunSec = () => {
    const {privatePriceValue, userDefinedQuantity, priceFinalBackup} =
      this.state;
    const finalPriceCal = userDefinedQuantity * privatePriceValue;
    if (privatePriceValue) {
      this.setState({
        priceFinal: finalPriceCal,
      });
    } else {
      this.setState({
        priceFinal: priceFinalBackup,
      });
    }
  };

  render() {
    const {
      firstName,
      buttonsSubHeader,
      loader,
      pageData,
      privatePrice,
      privatePriceValue,
      discountPrice,
      discountPriceValue,
      userDefinedQuantity,
      priceFinal,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Header
          logout={firstName}
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="large" color="grey" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          {loader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View style={{marginTop: hp('3%'), marginHorizontal: wp('5%')}}>
              <View>
                <View>
                  <Text style={{fontSize: 20, color: '#656565'}}>
                    {translate('Product Configuration').toLocaleUpperCase()}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>Supplier: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      editable={false}
                      // value={pageData.supplierName}
                      placeholder="Supplier"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>Product Code: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      editable={false}
                      // value={pageData.productCode}
                      placeholder="Product Code"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>{translate('Product Name')}: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      // value={pageData.productName}
                      editable={false}
                      placeholder="Product Name"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>Pack Size: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      // value={String(pageData.packSize)}
                      editable={false}
                      placeholder="Pack Size"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>List Price: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      // value={pageData.price + ' / ' + pageData.unit}
                      editable={false}
                      placeholder="List Price"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>{translate('Price')}: </Text>
                  </View>
                  <Text style={{marginLeft: 5}}>$</Text>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      value={String(priceFinal)}
                      editable={false}
                      placeholder="Price"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('45%'),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>Inventory Item: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      // value={pageData.inventoryName}
                      editable={false}
                      placeholder="Inventory Item"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                    }}>
                    <Text>Inventory Unit (default): </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      // value={pageData.inventoryUnit}
                      editable={false}
                      placeholder="Inventory Unit"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                      }}
                    />
                  </View>
                </View>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{}}>
                      <CheckBox
                        value={privatePrice}
                        onValueChange={() =>
                          this.setState({
                            privatePrice: !privatePrice,
                            discountPrice: false,
                          })
                        }
                        style={{
                          backgroundColor: '#E9ECEF',
                          height: 20,
                          width: 20,
                        }}
                      />
                    </View>
                    <Text style={{marginLeft: 5}}>Private price: </Text>
                  </View>
                  <Text style={{marginLeft: 5}}>$</Text>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      value={privatePriceValue}
                      editable={privatePrice ? true : false}
                      keyboardType="number-pad"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('45%'),
                        backgroundColor: privatePrice ? '#fff' : '#E9ECEF',
                      }}
                      onChangeText={value => this.changePriceFun(value)}
                    />
                  </View>
                  <Text style={{marginLeft: 5}}>STK</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{}}>
                      <CheckBox
                        value={discountPrice}
                        onValueChange={() =>
                          this.setState({
                            discountPrice: !discountPrice,
                            privatePrice: false,
                          })
                        }
                        style={{
                          backgroundColor: '#E9ECEF',
                          height: 20,
                          width: 20,
                        }}
                      />
                    </View>
                    <Text style={{marginLeft: 5}}>Discount: </Text>
                  </View>
                  <View style={{marginLeft: wp('3%')}}>
                    <TextInput
                      value={discountPriceValue}
                      editable={discountPrice ? true : false}
                      keyboardType="number-pad"
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        width: wp('50%'),
                        backgroundColor: discountPrice ? '#fff' : '#E9ECEF',
                      }}
                      onChangeText={value =>
                        this.setState({
                          discountPriceValue: value,
                          privatePriceValue: '',
                        })
                      }
                    />
                  </View>
                  <Text style={{marginLeft: 5}}>%</Text>
                </View>
              </View>
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{flexDirection: 'row', marginTop: hp('3%')}}>
                      <View style={{width: wp('40%')}}>
                        <Text>Order * 1</Text>
                      </View>
                      <View style={{width: wp('40%')}}>
                        <Text>{translate('Quantity')}</Text>
                      </View>
                      <View style={{width: wp('40%')}}>
                        <Text>Unit</Text>
                      </View>
                    </View>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: hp('3%'),
                        }}>
                        <View
                          style={{
                            width: wp('40%'),
                          }}>
                          <Text>Grainz suggested: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            // value={String(pageData.grainzVolume)}
                            editable={false}
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                            }}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            // value={pageData.grainzUnit}
                            editable={false}
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                            }}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: hp('3%'),
                        }}>
                        <View
                          style={{
                            width: wp('40%'),
                          }}>
                          <Text>User Defined: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            value={userDefinedQuantity}
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                            }}
                            onChangeText={value =>
                              this.setState({
                                userDefinedQuantity: value,
                              })
                            }
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            // value={pageData.userDefinedUnit}
                            editable={false}
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginHorizontal: wp('15%'),
            }}>
            <View style={{}}>
              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={{
                  height: hp('6%'),
                  width: wp('30%'),
                  backgroundColor: '#E7943B',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <View style={{}}>
                  <Text style={{color: 'white', marginLeft: 5}}>Cancel</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{}}>
              <TouchableOpacity
                onPress={() => this.saveProductConfigFun()}
                style={{
                  height: hp('6%'),
                  width: wp('30%'),
                  backgroundColor: '#94C036',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <View style={{}}>
                  <Text style={{color: 'white', marginLeft: 5}}>Save</Text>
                </View>
              </TouchableOpacity>
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

export default connect(mapStateToProps, {UserTokenAction})(OrderingThree);
