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
import {getMyProfileApi, getInventoryByIdApi} from '../../connectivity/api';
import {translate} from '../../utils/translations';
import styles from './style';
import Modal from 'react-native-modal';
import CheckBox from '@react-native-community/checkbox';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      modalVisibleAdd: false,
      activeSections: [],
      SECTIONS: [],
      recipeLoader: true,
      modalVisibleRecipeDetails: false,
      sectionData: {},
      isMakeMeStatus: true,
      makeMeText: 'Make me',
      SECTIONS_HISTORY: [],
      activeSectionsHistory: [],
      recipeLoaderHistory: true,
      isDatePickerVisible: false,
      finalDate: '',
      selectectedItems: [],
      isShownPicker: false,
      items: [],
      productionDate: '',
      applyStatus: false,
      detailsLoader: false,
      quantity: '',
      advanceDetailsLoader: true,
      sectionAdvanceData: {},
      buttonsSubHeader: [],
      mappedProductStatus: false,
      mappedProductsLoader: false,
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
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getProfileDataFun();
    this.setState(
      {
        pageData: this.props.route && this.props.route.params.pageData,
      },
      () => this.getAdvanceRecipeDetails(),
    );
  }

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    if (item.name === 'Edit') {
      alert('Edit');
    } else if (item.name === 'Back') {
      this.props.navigation.goBack();
    }
  };

  getAdvanceRecipeDetails = () => {
    const {pageData} = this.state;
    this.setState(
      {
        advanceDetailsLoader: true,
      },
      () =>
        getInventoryByIdApi(pageData.inventoryId)
          .then(res => {
            this.setState({
              sectionAdvanceData: res.data,
              advanceDetailsLoader: false,
            });
          })
          .catch(err => {
            this.setState({
              advanceDetailsLoader: false,
            });
            console.warn('ERR', err);
          }),
    );
  };

  closeModal = visible => {
    this.setState({
      mappedProductStatus: visible,
    });
  };

  render() {
    const {
      firstName,
      advanceDetailsLoader,
      sectionAdvanceData,
      recipeLoader,
      buttonsSubHeader,
      mappedProductStatus,
      mappedProductsLoader,
    } = this.state;
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
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('View inventory item')}
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
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {sectionAdvanceData.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => alert('Edit')}
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  source={img.editIconGreen}
                  style={{width: 20, height: 20, resizeMode: 'contain'}}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter-Regular',
                    color: '#94C01F',
                    marginLeft: 10,
                  }}>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{}}>
            <View style={styles.firstContainer}>
              <TouchableOpacity
                onPress={() => alert('New Inventory')}
                style={{
                  height: 110,
                  width: 110,
                  borderRadius: 6,
                  backgroundColor: '#fff',
                  padding: 5,
                }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={img.viewInventoryIcon}
                    style={{width: 35, height: 35, resizeMode: 'contain'}}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Inter-Regular',
                      color: '#000000',
                      textAlign: 'center',
                    }}>
                    New Inventory
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {advanceDetailsLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <ScrollView>
              <View style={{}}>
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: 'row',
                    marginHorizontal: wp('6%'),
                  }}>
                  <View style={{flex: 1.5}}>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Department')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Category')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Units')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Target Inventory')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Current Inventory Level')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Mapped products')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Price (per default unit)')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Allergens')} :
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 15,
                          }}>
                          {translate('Recipes')} :
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                          }}>
                          {sectionAdvanceData.departmentName}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                          }}>
                          Cat
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                          flexDirection: 'row',
                        }}>
                        {sectionAdvanceData.units.map((item, index) => {
                          return (
                            <View style={{}}>
                              <Text
                                style={{
                                  color: '#151B26',
                                  fontFamily: 'Inter-Regular',
                                  fontSize: 15,
                                }}>
                                {index > 0 ? ' , ' : null}
                                {item.name}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                          }}>
                          {sectionAdvanceData.reorderLevel} Unit
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                          }}>
                          {sectionAdvanceData.currentInventory.toFixed(2)} Unit
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                          }}>
                          {sectionAdvanceData.productMappings.length}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({
                              mappedProductStatus: true,
                            })
                          }
                          style={{
                            backgroundColor: '#CAFBC5',
                            paddingHorizontal: 15,
                            borderRadius: 6,
                            marginLeft: wp('3%'),
                          }}>
                          <Text
                            style={{
                              color: '#151B26',
                              fontFamily: 'Inter-Regular',
                              fontSize: 15,
                            }}>
                            View
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        <Text
                          style={{
                            color: '#151B26',
                            fontFamily: 'Inter-Regular',
                            fontSize: 15,
                          }}>
                          € {sectionAdvanceData.defaultPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <TouchableOpacity
                          onPress={() => alert('Allergens')}
                          style={{
                            backgroundColor: '#CAFBC5',
                            paddingHorizontal: 15,
                            borderRadius: 6,
                          }}>
                          <Text
                            style={{
                              color: '#151B26',
                              fontFamily: 'Inter-Regular',
                              fontSize: 15,
                            }}>
                            View
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'flex-start',
                        }}>
                        {sectionAdvanceData.recipes.map((item, index) => {
                          return (
                            <View style={{}}>
                              <Text
                                style={{
                                  color: '#151B26',
                                  fontFamily: 'Inter-Regular',
                                  fontSize: 15,
                                }}>
                                {item.name}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          <Modal
            isVisible={mappedProductStatus}
            backdropOpacity={0.35}
            animationIn="slideInUp"
            animationOut="slideOutDown">
            <View
              style={{
                width: wp('85%'),
                height: hp('50%'),
                backgroundColor: '#F0F4FE',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#9AC33F',
                  height: hp('7%'),
                  flexDirection: 'row',
                  paddingLeft: 20,
                }}>
                <View
                  style={{
                    flex: 3,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#fff',
                      fontFamily: 'Inter-SemiBold',
                    }}>
                    {translate('Mapped products')} - {sectionAdvanceData.name}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity onPress={() => this.closeModal(false)}>
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
              {mappedProductsLoader ? (
                <ActivityIndicator size="large" color="#94C036" />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      padding: hp('2%'),
                    }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}>
                          <View>
                            <View
                              style={{
                                paddingVertical: 15,
                                paddingHorizontal: 5,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: '#EFFBCF',
                              }}>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text style={{textAlign: 'center'}}>
                                  In Stock ?
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Supplier</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Code</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Name</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>{translate('Quantity')}</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>{translate('Price')}</Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text>Preferred</Text>
                              </View>
                            </View>
                            <View>
                              {sectionAdvanceData.productMappings &&
                              sectionAdvanceData.productMappings.length > 0 ? (
                                sectionAdvanceData.productMappings.map(
                                  (item, index) => {
                                    return (
                                      <View
                                        style={{
                                          paddingVertical: 10,
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
                                            justifyContent: 'center',
                                          }}>
                                          <CheckBox
                                            disabled={true}
                                            value={item.isInStock}
                                            style={{
                                              height: 20,
                                              width: 20,
                                            }}
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Text>{item.supplierName}</Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text>{item.productCode}</Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text>{item.productName}</Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text>
                                            {item.quantity} {item.unit}
                                          </Text>
                                        </View>

                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text>
                                            {item.productPrice} € / {item.unit}
                                          </Text>
                                        </View>

                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <CheckBox
                                            disabled={true}
                                            value={item.isPreferred}
                                            style={{
                                              height: 20,
                                              width: 20,
                                            }}
                                          />
                                        </View>
                                      </View>
                                    );
                                  },
                                )
                              ) : (
                                <View style={{marginTop: hp('3%')}}>
                                  <Text style={{color: 'red', fontSize: 20}}>
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
                </ScrollView>
              )}
            </View>
          </Modal>
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

export default connect(mapStateToProps, {UserTokenAction})(ViewInventory);
