import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
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
  getUserNameEventsApi,
  getEventDetailsAdminApi,
  lookupDepartmentsApi,
} from '../../../../connectivity/api';
import styles from './style';
import {translate} from '../../../../utils/translations';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';

class ViewEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      buttonsSubHeader: [],
      loader: true,
      hideEventDetails: false,
      kitchenInstructions: false,
      userId: '',
      userArr: [],
      productionDate: '',
      pageData: '',
      departmentNameArr: [],
      finalOfferListArr: [],
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
      });
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  componentDidMount() {
    this.getData();
    const {detailsId, eventManagerId, offerArray} =
      this.props.route && this.props.route.params;
    this.getPageData(detailsId);
    this.getUserData(eventManagerId);
    this.getDeparmentData(offerArray);
  }

  getDeparmentData = offerArray => {
    lookupDepartmentsApi()
      .then(res => {
        const array1 = offerArray;
        const array2 = res.data;
        const finalArr = array1.map(item => {
          return {
            ...item,
            departmentName: array2
              .map(subItem => {
                if (item.departmentId === subItem.id) {
                  return subItem.name;
                }
              })
              .filter(notUndefined => notUndefined !== undefined)[0],
          };
        });

        this.setState({
          finalOfferListArr: finalArr,
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);

        this.setState({
          recipeLoader: false,
        });
      });
  };

  getUserData = eventManagerId => {
    getUserNameEventsApi()
      .then(res => {
        const managerName = res.data.map(item => {
          if (item.id === eventManagerId) {
            this.setState({
              managerName: item.firstName + ' ' + item.lastName,
            });
          }
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  getPageData = detailsId => {
    getEventDetailsAdminApi(detailsId)
      .then(res => {
        this.setState({
          pageData: res.data,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    alert('Work in Progress');
  };

  showEventDetails = () => {
    this.setState({
      hideEventDetails: !this.state.hideEventDetails,
    });
  };

  showKitchenIns = () => {
    this.setState({
      kitchenInstructions: !this.state.kitchenInstructions,
    });
  };

  render() {
    const {
      buttonsSubHeader,
      loader,
      hideEventDetails,
      kitchenInstructions,
      managerName,
      pageData,
      finalOfferListArr,
    } = this.state;

    const newDate = moment(pageData.eventDate).format('L');

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="small" color="#98C13E" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}

        <View style={{...styles.subContainer, flex: 1}}>
          <View style={styles.firstContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.adminTextStyle}>{translate('Events')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>
                {' '}
                {translate('Go Back')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{flex: 1}}>
            <ScrollView style={{}} showsVerticalScrollIndicator={false}>
              <View style={{padding: hp('3%')}}>
                <TouchableOpacity
                  onPress={() => this.showEventDetails()}
                  style={{
                    padding: 13,
                    marginBottom: hp('3%'),
                    flexDirection: 'row',
                    backgroundColor: '#fff',
                    elevation: 3,
                    shadowOpacity: 2.0,
                    shadowColor: 'rgba(0, 0, 0, 0.05)',
                    shadowOffset: {
                      width: 2,
                      height: 2,
                    },
                    shadowRadius: 10,
                    borderRadius: 5,
                  }}>
                  {hideEventDetails ? (
                    <Image
                      source={img.plusIcon}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        tintColor: '#492813',
                      }}
                    />
                  ) : (
                    <Image
                      source={img.dashIcon}
                      style={{
                        width: 15,
                        height: 15,
                        resizeMode: 'contain',
                        tintColor: '#492813',
                      }}
                    />
                  )}
                  <Text
                    style={{
                      marginLeft: 10,
                      fontFamily: 'Inter-Regular',
                      color: '#492813',
                    }}>
                    Event Details
                  </Text>
                </TouchableOpacity>
                {hideEventDetails ? null : (
                  <View style={{}}>
                    <View
                      style={{
                        padding: 12,
                        marginBottom: hp('3%'),
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        elevation: 3,
                        shadowOpacity: 2.0,
                        shadowColor: 'rgba(0, 0, 0, 0.05)',
                        shadowOffset: {
                          width: 2,
                          height: 2,
                        },
                        shadowRadius: 10,
                        borderRadius: 5,
                      }}>
                      <TextInput
                        placeholder="Select Date"
                        value={newDate}
                        editable={false}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 20,
                          height: 20,
                          resizeMode: 'contain',
                        }}
                      />
                    </View>

                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        editable={false}
                        placeholder="Time"
                        value={pageData.eventTime}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Client Name"
                        value={pageData.clientName}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="No. of people"
                        value={String(pageData.pax)}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Contact Details"
                        value={pageData.clientDetails}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Notes-External"
                        value={pageData.externalNotes}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Notes-Internal"
                        value={pageData.internalNotes}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Select user"
                        value={managerName}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>

                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        flexDirection: 'row',
                        borderWidth: 0.5,
                        borderColor: '#F0F0F0',
                        height: 60,
                        alignItems: 'center',
                        borderRadius: 6,
                        justifyContent: 'space-between',
                        marginBottom: hp('3%'),
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            marginLeft: wp('2%'),
                            fontFamily: 'Inter-Regular',
                          }}>
                          Confirmed ?
                        </Text>
                      </View>
                      <View
                        style={{
                          alignItems: 'center',
                          marginRight: 15,
                        }}>
                        <CheckBox
                          value={pageData.isConfirmed}
                          disabled={true}
                          style={{
                            margin: 5,
                            height: 20,
                            width: 20,
                          }}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        flexDirection: 'row',
                        borderWidth: 0.5,
                        borderColor: '#F0F0F0',
                        height: 60,
                        alignItems: 'center',
                        borderRadius: 6,
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            marginLeft: wp('2%'),
                            fontFamily: 'Inter-Regular',
                          }}>
                          Paid ?
                        </Text>
                      </View>
                      <View
                        style={{
                          alignItems: 'center',
                          marginRight: 15,
                        }}>
                        <CheckBox
                          value={pageData.isPaid}
                          disabled={true}
                          style={{
                            margin: 5,
                            height: 20,
                            width: 20,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 5,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        marginTop: hp('3%'),
                        borderRadius: 6,
                      }}>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Description
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Department
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          #
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {translate('Price')}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          VAT%
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Total HTVA
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Total TVAC
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Ex till ?
                        </Text>
                      </View>
                    </View>
                    <View>
                      {pageData && finalOfferListArr.length > 0
                        ? finalOfferListArr.map((item, index) => {
                            return (
                              <View
                                key={index}
                                style={{
                                  paddingVertical: 10,
                                  paddingHorizontal: 5,
                                  flexDirection: 'row',
                                  backgroundColor: '#fff',
                                }}>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    {item.description}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    {item.departmentName}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    {item.quantity}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    € {item.price}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    {item.vat} %
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    HTVA
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                    }}>
                                    TAVC
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <CheckBox
                                    value={item.isExTill}
                                    disabled={true}
                                    style={{
                                      height: 17,
                                      width: 17,
                                    }}
                                  />
                                </View>
                              </View>
                            );
                          })
                        : null}
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={() => this.showKitchenIns()}
                  style={{
                    padding: 13,
                    marginBottom: hp('3%'),
                    flexDirection: 'row',
                    backgroundColor: '#fff',
                    elevation: 3,
                    shadowOpacity: 2.0,
                    shadowColor: 'rgba(0, 0, 0, 0.05)',
                    shadowOffset: {
                      width: 2,
                      height: 2,
                    },
                    shadowRadius: 10,
                    borderRadius: 5,
                    marginTop: hp('3%'),
                  }}>
                  {kitchenInstructions ? (
                    <Image
                      source={img.plusIcon}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        tintColor: '#492813',
                      }}
                    />
                  ) : (
                    <Image
                      source={img.dashIcon}
                      style={{
                        width: 15,
                        height: 15,
                        resizeMode: 'contain',
                        tintColor: '#492813',
                      }}
                    />
                  )}
                  <Text
                    style={{
                      marginLeft: 10,
                      fontFamily: 'Inter-Regular',
                      color: '#492813',
                    }}>
                    Kitchen instructions
                  </Text>
                </TouchableOpacity>
                {kitchenInstructions ? null : (
                  <View style={{}}>
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
                            backgroundColor: '#fff',
                            borderRadius: 6,
                          }}>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontSize: 14,
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Menu Items
                            </Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontSize: 14,
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Quanity
                            </Text>
                          </View>

                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontSize: 14,
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Ex till ?
                            </Text>
                          </View>
                        </View>
                        <View>
                          {pageData && pageData.eventItemList.length > 0
                            ? pageData.eventItemList.map((item, index) => {
                                return (
                                  <View
                                    key={index}
                                    style={{
                                      paddingVertical: 10,
                                      paddingHorizontal: 5,
                                      flexDirection: 'row',
                                      backgroundColor: '#fff',
                                    }}>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Text
                                        style={{
                                          color: '#161C27',
                                          fontSize: 14,
                                          fontFamily: 'Inter-Regular',
                                        }}>
                                        {item.menuItemName}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <Text
                                        style={{
                                          color: '#161C27',
                                          fontSize: 14,
                                          fontFamily: 'Inter-Regular',
                                        }}>
                                        {item.quantity}
                                      </Text>
                                    </View>

                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <CheckBox
                                        value={item.isExTill}
                                        disabled={true}
                                        style={{
                                          height: 17,
                                          width: 17,
                                        }}
                                      />
                                    </View>
                                  </View>
                                );
                              })
                            : null}
                        </View>
                      </View>
                    </ScrollView>

                    <View style={{marginVertical: hp('3%')}}>
                      <TextInput
                        placeholder="Kitchen notes"
                        value={pageData.kitchenNotes}
                        editable={false}
                        style={{
                          padding: 14,
                          justifyContent: 'space-between',
                          elevation: 3,
                          shadowOpacity: 2.0,
                          shadowColor: 'rgba(0, 0, 0, 0.05)',
                          shadowOffset: {
                            width: 2,
                            height: 2,
                          },
                          shadowRadius: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
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

export default connect(mapStateToProps, {UserTokenAction})(ViewEvent);
