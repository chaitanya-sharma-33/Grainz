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
  FlatList,
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
  getCustomerDataApi,
  updateCustomerDataApi,
} from '../../../../connectivity/api';
import CheckBox from '@react-native-community/checkbox';
import styles from './style';
import Modal from 'react-native-modal';
import Accordion from 'react-native-collapsible/Accordion';
import moment from 'moment';

import {translate} from '../../../../utils/translations';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [
        {name: translate('Price Plan'), id: 0, icon: img.pricePlanIcon},
        {name: translate('Locations'), id: 1, icon: img.locationIcon},
        {name: translate('Users'), id: 2, icon: img.userIcon},
      ],
      token: '',
      modalVisible: false,
      recipeLoader: false,
      pageLoading: false,
      selectedItemObjects: '',
      buttonsSubHeader: [],
      accountName: '',
      businessName: '',
      url: '',
      mainAddress: '',
      contractSigned: '',
      isActive: '',
      tcsAccepted: '',
      updateLoader: false,
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
        console.warn('ERr', err);
      });
  };

  getCustomerData = () => {
    getCustomerDataApi()
      .then(res => {
        const {
          fullName,
          name,
          url,
          contractSigned,
          isActive,
          tcsAccepted,
          mainAddress,
        } = res.data;
        this.setState({
          accountName: fullName,
          businessName: name,
          url: url,
          streetAddress: mainAddress.addressLine1,
          town: mainAddress.city,
          postalCode: mainAddress.postcode,
          contractSigned: contractSigned,
          isActive: isActive,
          tcsAccepted: tcsAccepted,
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  componentDidMount() {
    this.getData();
    this.getCustomerData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    if (item.id === 0) {
      alert('Price Plan');
    } else if (item.id === 1) {
      alert('Locations');
    } else if (item.id === 2) {
      alert('Users');
    } else {
      this.props.navigation.goBack();
    }
  };

  updateFun = () => {
    this.setState(
      {
        updateLoader: true,
      },
      () => this.updateFunSec(),
    );
  };

  updateFunSec = () => {
    const {
      contractSigned,
      accountName,
      businessName,
      url,
      streetAddress,
      town,
      postalCode,
      isActive,
      tcsAccepted,
    } = this.state;
    let payload = {
      contractSigned: contractSigned,
      customerManagementTargetList: [
        {
          departmentId: '9c54b6b6-2c0d-4ddd-bdd3-6fc8d1d43738',
          grainzCorrection: 0,
          grossMargin: 0,
          id: '17c330c5-0428-4532-9555-5aa8a8d275c4',
          inventoryCost: 100,
          other: 0,
          priceGuide: 100,
          rdBudget: 0,
          staffAllowane: 0,
          wasteAllowance: 0,
        },
        {
          departmentId: 'dfd71ff7-7b25-407b-aa2f-0186ccebaa03',
          grainzCorrection: 0,
          grossMargin: 21,
          id: 'd7865e7d-eb83-40d8-9faf-8bee02a81dc1',
          inventoryCost: 79,
          other: 0,
          priceGuide: 79,
          rdBudget: 0,
          staffAllowane: 0,
          wasteAllowance: 0,
        },
        {
          departmentId: '22110ab6-4e63-4afc-8173-e56486024316',
          grainzCorrection: 0,
          grossMargin: 12,
          id: '1422d62b-8e63-4f5a-873b-c8cb09f39c80',
          inventoryCost: 88,
          other: 0,
          priceGuide: 88,
          rdBudget: 0,
          staffAllowane: 0,
          wasteAllowance: 0,
        },
        {
          departmentId: '9df266dc-bf87-454e-b678-21c14647a23d',
          grainzCorrection: 0,
          grossMargin: 0,
          id: '0e46d0c2-32c0-40e3-9535-0e7403f0cd49',
          inventoryCost: 100,
          other: 0,
          priceGuide: 89,
          rdBudget: 0,
          staffAllowane: 11,
          wasteAllowance: 0,
        },
      ],
      fullName: accountName,
      // id: '9f4dab1c-c443-4be6-b198-d8591469588d',
      id: '00000000-0000-0000-0000-000000000000',
      isActive: isActive,
      mainAddress: {
        addressLine1: streetAddress,
        city: town,
        countryId: '7a30e839-5dd5-4e3e-b718-5734b162e596',
        id: 'ac0bd2ce-a5f9-4039-bd36-95ef677c42d8',
        postcode: postalCode,
      },
      name: businessName,
      notes: 'Tetsing. notess',
      tcsAccepted: tcsAccepted,
      url: url,
    };
    updateCustomerDataApi(payload)
      .then(res => {
        Alert.alert('Grainz', 'Details updated successfully', [
          {
            text: 'OK',
            onPress: () =>
              this.setState({
                updateLoader: false,
              }),
          },
        ]);
      })
      .catch(err => {
        this.setState({
          updateLoader: false,
        });
        console.warn('updateCustomerDataApi', err.response);
      });
  };

  render() {
    const {
      recipeLoader,
      pageLoading,
      buttons,
      buttonsSubHeader,
      accountName,
      businessName,
      url,
      streetAddress,
      town,
      postalCode,
      contractSigned,
      isActive,
      tcsAccepted,
      updateLoader,
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
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Account Set Up')}
                </Text>
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
          </View>
          <FlatList
            data={buttons}
            renderItem={({item}) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity
                  onPress={() => this.onPressFun(item)}
                  style={{
                    backgroundColor: '#fff',
                    flex: 1,
                    margin: 10,
                    borderRadius: 8,
                    padding: 10,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={item.icon}
                      style={{
                        height: 40,
                        width: 40,
                        resizeMode: 'contain',
                      }}
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
                        fontSize: 13,
                        textAlign: 'center',
                        fontFamily: 'Inter-Regular',
                      }}
                      numberOfLines={1}>
                      {' '}
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.id}
            numColumns={3}
          />

          {pageLoading ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View style={{marginTop: hp('3%'), marginHorizontal: wp('5%')}}>
              <View>
                <View style={{alignSelf: 'center'}}>
                  <Text
                    style={{
                      fontSize: 20,
                      color: '#492813',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Account
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: hp('5%'),
                  }}>
                  <View style={{}}>
                    <TextInput
                      value={accountName}
                      placeholder="Account name"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          accountName: value,
                        })
                      }
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginTop: hp('3%'),
                  }}>
                  <View style={{}}>
                    <TextInput
                      value={businessName}
                      placeholder="Business name"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          businessName: value,
                        })
                      }
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginTop: hp('3%'),
                  }}>
                  <View style={{}}>
                    <TextInput
                      value={url}
                      placeholder="URL"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          url: value,
                        })
                      }
                    />
                  </View>
                </View>
              </View>
              <View>
                <View style={{marginVertical: hp('5%'), alignSelf: 'center'}}>
                  <Text
                    style={{
                      fontSize: 20,
                      color: '#492813',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Invoice Address
                  </Text>
                </View>
                <View style={{}}>
                  <View style={{}}>
                    <TextInput
                      value={streetAddress}
                      placeholder="Street address"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          streetAddress: value,
                        })
                      }
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginTop: hp('3%'),
                  }}>
                  <View style={{}}>
                    <TextInput
                      value={town}
                      placeholder="Town"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          town: value,
                        })
                      }
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginTop: hp('3%'),
                  }}>
                  <View style={{}}>
                    <TextInput
                      value={postalCode}
                      placeholder="Postal code"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          postalCode: value,
                        })
                      }
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginTop: hp('3%'),
                  }}>
                  <View style={{}}>
                    <TextInput
                      placeholder="Country"
                      style={{
                        padding: 15,
                        width: wp('90%'),
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                    justifyContent: 'space-between',
                  }}>
                  <View style={{}}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: 'Inter-Regular',
                        color: '#161C27',
                      }}>
                      T&Cs accepted?:{' '}
                    </Text>
                  </View>
                  <View style={{}}>
                    <CheckBox
                      value={tcsAccepted}
                      onValueChange={() =>
                        this.setState({tcsAccepted: !tcsAccepted})
                      }
                      style={{
                        backgroundColor: '#E9ECEF',
                        margin: 5,
                        height: 20,
                        width: 20,
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                    justifyContent: 'space-between',
                  }}>
                  <View style={{}}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: 'Inter-Regular',
                        color: '#161C27',
                      }}>
                      Contract signed?:{' '}
                    </Text>
                  </View>
                  <View style={{}}>
                    <CheckBox
                      value={contractSigned}
                      onValueChange={() =>
                        this.setState({contractSigned: !contractSigned})
                      }
                      style={{
                        backgroundColor: '#E9ECEF',
                        margin: 5,
                        height: 20,
                        width: 20,
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: hp('3%'),
                    justifyContent: 'space-between',
                  }}>
                  <View style={{}}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: 'Inter-Regular',
                        color: '#161C27',
                      }}>
                      Active?:{' '}
                    </Text>
                  </View>
                  <View style={{}}>
                    <CheckBox
                      value={isActive}
                      onValueChange={() => this.setState({isActive: !isActive})}
                      style={{
                        backgroundColor: '#E9ECEF',
                        margin: 5,
                        height: 20,
                        width: 20,
                      }}
                    />
                  </View>
                </View>
              </View>
              <View>
                <View style={{marginVertical: hp('5%'), alignSelf: 'center'}}>
                  <Text
                    style={{
                      fontSize: 20,
                      color: '#492813',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Invoice Address -
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{flexDirection: 'row'}}>
                      <View style={{width: wp('40%')}}></View>
                      <View style={{width: wp('40%')}}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-Bold',
                          }}>
                          Bar
                        </Text>
                      </View>
                      <View style={{width: wp('40%')}}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-Bold',
                          }}>
                          Kitchen
                        </Text>
                      </View>
                      <View style={{width: wp('40%')}}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-Bold',
                          }}>
                          Retail
                        </Text>
                      </View>
                      <View style={{width: wp('40%')}}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-Bold',
                          }}>
                          Other
                        </Text>
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
                          <Text
                            style={{
                              color: '#161C27',
                              fontSize: 14,
                              fontFamily: 'Inter-Regular',
                            }}>
                            Cost of goods sold:{' '}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text>Waste: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text>Staff: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text>R&D: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text>Other: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text>Grainz correction: </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text
                            style={{
                              color: '#161C27',
                              fontSize: 14,
                              fontFamily: 'Inter-Bold',
                            }}>
                            Total inventory cost:{' '}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                          <Text
                            style={{
                              color: '#161C27',
                              fontSize: 14,
                              fontFamily: 'Inter-Bold',
                            }}>
                            Total gross margin:{' '}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              borderRadius: 5,
                              width: wp('20%'),
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: wp('40%'),
                          }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              padding: 10,
                              width: wp('20%'),
                              borderRadius: 5,
                            }}
                          />
                          <Text style={{marginLeft: 5}}>%</Text>
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
                  height: hp('5%'),
                  width: wp('30%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                  borderWidth: 1,
                  borderRadius: 100,
                  borderColor: '#482813',
                }}>
                <View style={{}}>
                  <Text
                    style={{color: '#492813', fontFamily: 'Inter-SemiBold'}}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{}}>
              {updateLoader ? (
                <View
                  style={{
                    height: hp('6%'),
                    width: wp('30%'),
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <View style={{}}>
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => this.updateFun()}
                  style={{
                    height: hp('5%'),
                    width: wp('30%'),
                    backgroundColor: '#94C036',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                    borderRadius: 100,
                  }}>
                  <View style={{}}>
                    <Text style={{color: '#fff', fontFamily: 'Inter-SemiBold'}}>
                      Update
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
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

export default connect(mapStateToProps, {UserTokenAction})(Account);
