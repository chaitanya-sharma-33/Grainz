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
  getUserNameEventsApi,
  addEventAdminApi,
  lookupDepartmentsApi,
  getMenuItemsSetupApi,
} from '../../../../connectivity/api';
import styles from './style';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {translate} from '../../../../utils/translations';
import ModalPicker from '../../../../components/ModalPicker';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';
import RNPickerSelect from 'react-native-picker-select';
import Modal from 'react-native-modal';

class AddNewEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
      token: '',
      buttonsSubHeader: [],
      loader: true,
      isDatePickerVisible: false,
      finalDate: '',
      hideEventDetails: false,
      kitchenItems: [],
      kitchenInstructions: false,
      timeValue: '',
      clientValue: '',
      peopleValue: '',
      placeHolderTextDept: 'Select User',
      selectedTextUser: '',
      userId: '',
      userArr: [],
      contactValue: '',
      externalNotesValue: '',
      internalNotesValue: '',
      kitchenNotesValue: '',
      productionDate: '',
      isConfirmedVaue: false,
      isPaidValue: false,
      finalOfferListArr: [],
      departmentArr: [],
      menuItemsArr: [],
      menuItemsModalStatus: false,
      searchMenuItem: '',
      menuItemsLoader: false,
      menuItemsArrBackUp: [],
      menuListItemsArr: [],
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
          buttons: [
            {
              name: translate('Invoice'),
              icon: img.addIconNew,
              // screen: 'GrossMarginAdminScreen',
            },
            {
              name: translate('Pro forma'),
              icon: img.menuAnalysisIcon,
              // screen: 'MenuAnalysisAdminScreen',
            },
          ],
          kitchenItems: [
            {
              id: 0,
              name: 'Add Menu Items',
              icon: img.addIconNew,
            },
            {
              id: 1,
              name: 'Margin',
              icon: img.marginIcon,
            },
          ],
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
    this.getUserData();
    this.getDeparmentData();
    this.getMenuData();
  }

  getDeparmentData = () => {
    lookupDepartmentsApi()
      .then(res => {
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        this.setState({
          departmentArr: finalUsersList,
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);

        this.setState({
          recipeLoader: false,
        });
      });
  };

  getMenuData = () => {
    this.setState(
      {
        menuItemsLoader: true,
      },
      () => this.getMenuDataSec(),
    );
  };

  getMenuDataSec = () => {
    getMenuItemsSetupApi()
      .then(res => {
        const finalArr = [];
        res.data.map(item => {
          finalArr.push({
            name: item.name,
            id: item.id,
          });
        });
        this.setState({
          menuItemsArr: [...finalArr],
          menuItemsLoader: false,
          menuItemsArrBackUp: [...finalArr],
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  getUserData = () => {
    getUserNameEventsApi()
      .then(res => {
        const finalArr = [];
        res.data.map(item => {
          finalArr.push({
            name: item.firstName,
            id: item.id,
          });
        });
        this.setState({
          userArr: [...finalArr],
          dataListLoader: false,
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

  onPressMenuItem = item => {
    this.setState({
      menuItemsModalStatus: true,
    });
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  handleConfirm = date => {
    let newdate = moment(date).format('L');
    let productionDate = moment(date).format();
    this.setState({
      finalDate: newdate,
      productionDate,
    });

    this.hideDatePicker();
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
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

  selectUserNameFun = item => {
    this.setState({
      userId: item.id,
      selectedTextUser: item.name,
    });
  };

  saveFun = () => {
    const {
      productionDate,
      clientValue,
      peopleValue,
      contactValue,
      userId,
      isConfirmedVaue,
      isPaidValue,
      externalNotesValue,
      internalNotesValue,
      kitchenNotesValue,
      finalOfferListArr,
      timeValue,
      menuListItemsArr,
    } = this.state;
    let payload = {
      clientDetails: contactValue,
      clientName: clientValue,
      eventDate: productionDate,
      eventItemList: menuListItemsArr,
      eventManager: userId,
      eventOfferList: finalOfferListArr,
      eventTime: timeValue,
      externalNotes: externalNotesValue,
      internalNotes: internalNotesValue,
      isConfirmed: isConfirmedVaue,
      isPaid: isPaidValue,
      kitchenNotes: kitchenNotesValue,
      pax: peopleValue,
    };

    if (peopleValue === '') {
      alert('Please enter all the data');
    } else {
      addEventAdminApi(payload)
        .then(res => {
          Alert.alert('Grainz', 'Event added successfully', [
            {
              text: 'Okay',
              onPress: () => this.props.navigation.goBack(),
            },
          ]);
        })
        .catch(err => {
          console.log('err', err);
        });
    }
  };

  addDataInArrFun = () => {
    let objSec = {};
    let newlist = [];
    const {finalOfferListArr} = this.state;
    objSec = {
      action: 'New',
      departmentId: '',
      description: '',
      isExTill: '',
      price: '',
      quantity: '',
      totalHTVA: '',
      totalTvac: '',
      vat: '',
    };
    newlist.push(objSec);
    this.setState({
      finalOfferListArr: [...finalOfferListArr, ...newlist],
    });
  };

  removeItemFun = index => {
    const {finalOfferListArr} = this.state;

    let temp = finalOfferListArr;
    temp.splice(index, 1);
    this.setState({finalOfferListArr: temp});
  };

  editOfferItemsFun = (index, type, value) => {
    const {finalOfferListArr} = this.state;
    const valueTotalHTVA = 50;
    const valueTotalTvac = 100;
    let newArr = finalOfferListArr.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
            ['totalHTVA']: valueTotalHTVA,
            ['totalTvac']: valueTotalTvac,
          }
        : item,
    );
    this.setState({
      finalOfferListArr: [...newArr],
    });
  };

  editMenuItemsFun = (index, type, value) => {
    const {menuListItemsArr} = this.state;

    let newArr = menuListItemsArr.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]: value,
          }
        : item,
    );
    this.setState({
      menuListItemsArr: [...newArr],
    });
  };

  searchFun = txt => {
    this.setState(
      {
        searchMenuItem: txt,
      },
      () => this.filterData(txt),
    );
  };

  filterData = text => {
    //passing the inserted text in textinput
    const newData = this.state.menuItemsArrBackUp.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      menuItemsArr: newData,
      searchMenuItem: text,
    });
  };

  closeModal = visible => {
    this.setState({
      menuItemsModalStatus: visible,
    });
  };

  onPressMenuItemSec = item => {
    let objSec = {};
    let newlist = [];
    const {menuListItemsArr} = this.state;
    objSec = {
      departmentId: null,
      eventId: 'a3d4a105-3d98-410d-9785-35be903cdf1b',
      id: 'c47f2c0a-3b61-4f00-b475-17f2d54c817b',
      isExTill: '',
      menuItemId: item.id,
      menuItemName: item.name,
      notes: '',
      quantity: '',
    };
    newlist.push(objSec);
    this.setState({
      menuListItemsArr: [...menuListItemsArr, ...newlist],
    });
  };

  removeMenuItemFun = index => {
    const {menuListItemsArr} = this.state;

    let temp = menuListItemsArr;
    temp.splice(index, 1);
    this.setState({menuListItemsArr: temp});
  };

  render() {
    const {
      buttons,
      buttonsSubHeader,
      loader,
      isDatePickerVisible,
      finalDate,
      hideEventDetails,
      kitchenItems,
      kitchenInstructions,
      timeValue,
      clientValue,
      peopleValue,
      dataListLoader,
      placeHolderTextDept,
      userArr,
      selectedTextUser,
      contactValue,
      externalNotesValue,
      internalNotesValue,
      kitchenNotesValue,
      isConfirmedVaue,
      isPaidValue,
      finalOfferListArr,
      departmentArr,
      menuItemsLoader,
      menuItemsArr,
      menuItemsModalStatus,
      searchMenuItem,
      menuListItemsArr,
    } = this.state;

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
                <View style={{flexDirection: 'row'}}>
                  {buttons.map((item, index) => {
                    return (
                      <View style={styles.itemContainer} key={index}>
                        <TouchableOpacity
                          onPress={() => this.onPressFun(item)}
                          style={{
                            backgroundColor: '#fff',
                            flex: 1,
                            borderRadius: 8,
                            padding: 10,
                            marginRight: wp('5%'),
                            elevation: 3,
                            shadowOpacity: 1.0,
                            shadowOffset: {
                              width: 1,
                              height: 1,
                            },
                            shadowRadius: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.05)',
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
                                height: 50,
                                width: 50,
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
                              {item.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
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
                    marginTop: hp('3%'),
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
                    <TouchableOpacity
                      onPress={() => this.showDatePickerFun()}
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
                        value={finalDate}
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
                    </TouchableOpacity>

                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Time"
                        value={timeValue}
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
                        keyboardType="number-pad"
                        onChangeText={value => {
                          this.setState({
                            timeValue: value,
                          });
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Client Name"
                        value={clientValue}
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
                        keyboardType="number-pad"
                        onChangeText={value => {
                          this.setState({
                            clientValue: value,
                          });
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="No. of people"
                        value={peopleValue}
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
                        keyboardType="default"
                        onChangeText={value => {
                          this.setState({
                            peopleValue: value,
                          });
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Contact Details"
                        value={contactValue}
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
                        keyboardType="default"
                        onChangeText={value => {
                          this.setState({
                            contactValue: value,
                          });
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Notes-External"
                        value={externalNotesValue}
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
                        keyboardType="default"
                        onChangeText={value => {
                          this.setState({
                            externalNotesValue: value,
                          });
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <TextInput
                        placeholder="Notes-Internal"
                        value={internalNotesValue}
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
                        keyboardType="default"
                        onChangeText={value => {
                          this.setState({
                            internalNotesValue: value,
                          });
                        }}
                      />
                    </View>
                    <View style={{marginBottom: hp('3%')}}>
                      <ModalPicker
                        dataListLoader={dataListLoader}
                        placeHolderLabel={placeHolderTextDept}
                        placeHolderLabelColor="grey"
                        dataSource={userArr}
                        selectedLabel={selectedTextUser}
                        onSelectFun={item => this.selectUserNameFun(item)}
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
                          value={isConfirmedVaue}
                          onValueChange={() =>
                            this.setState({isConfirmedVaue: !isConfirmedVaue})
                          }
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
                          value={isPaidValue}
                          onValueChange={() =>
                            this.setState({isPaidValue: !isPaidValue})
                          }
                          style={{
                            margin: 5,
                            height: 20,
                            width: 20,
                          }}
                        />
                      </View>
                    </View>

                    <DateTimePickerModal
                      // is24Hour={true}
                      isVisible={isDatePickerVisible}
                      mode={'date'}
                      onConfirm={this.handleConfirm}
                      onCancel={this.hideDatePicker}
                      // maximumDate={minTime}
                      // minimumDate={new Date()}
                    />
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
                          marginRight: wp('2%'),
                        }}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontSize: 14,
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Action
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                          marginRight: wp('2%'),
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
                      {finalOfferListArr.length > 0
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
                                <TouchableOpacity
                                  onPress={() => this.removeItemFun(index)}
                                  style={{
                                    width: wp('30%'),
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#ED3A4A',
                                  }}>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-SemiBold',
                                      color: '#fff',
                                    }}>
                                    Remove
                                  </Text>
                                </TouchableOpacity>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                  }}>
                                  <TextInput
                                    value={item.description}
                                    onChangeText={value =>
                                      this.editOfferItemsFun(
                                        index,
                                        'description',
                                        value,
                                      )
                                    }
                                    placeholder="Description"
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                      paddingVertical: 10,
                                      paddingLeft: 10,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    width: wp('28%'),
                                    backgroundColor: '#fff',
                                    borderRadius: 5,
                                    justifyContent: 'space-between',
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                  }}>
                                  <View
                                    style={{
                                      width: wp('20%'),
                                      alignSelf: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <RNPickerSelect
                                      placeholder={{
                                        label: 'Select department*',
                                        value: null,
                                        color: 'black',
                                      }}
                                      onValueChange={value => {
                                        this.editOfferItemsFun(
                                          index,
                                          'departmentId',
                                          value,
                                        );
                                      }}
                                      style={{
                                        inputIOS: {
                                          fontSize: 14,
                                          paddingHorizontal: '3%',
                                          color: '#161C27',
                                          width: '100%',
                                          alignSelf: 'center',
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
                                      items={departmentArr}
                                      value={item.departmentId}
                                      useNativeAndroidPickerStyle={false}
                                    />
                                  </View>
                                  <View style={{marginRight: wp('5%')}}>
                                    <Image
                                      source={img.arrowDownIcon}
                                      resizeMode="contain"
                                      style={{
                                        height: 15,
                                        width: 15,
                                        resizeMode: 'contain',
                                        marginTop:
                                          Platform.OS === 'ios' ? 10 : 15,
                                      }}
                                    />
                                  </View>
                                </View>

                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                  }}>
                                  <TextInput
                                    value={item.quantity}
                                    placeholder="#"
                                    onChangeText={value =>
                                      this.editOfferItemsFun(
                                        index,
                                        'quantity',
                                        value,
                                      )
                                    }
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                      paddingVertical: 10,
                                      paddingLeft: 10,
                                      width: wp('30%'),
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                  }}>
                                  <TextInput
                                    value={String(item.price)}
                                    placeholder="Price"
                                    onChangeText={value =>
                                      this.editOfferItemsFun(
                                        index,
                                        'price',
                                        value,
                                      )
                                    }
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                      paddingVertical: 10,
                                      paddingLeft: 10,
                                      width: wp('30%'),
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                  }}>
                                  <TextInput
                                    value={String(item.vat)}
                                    placeholder="VAT%"
                                    onChangeText={value =>
                                      this.editOfferItemsFun(
                                        index,
                                        'vat',
                                        value,
                                      )
                                    }
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                      paddingVertical: 10,
                                      paddingLeft: 10,
                                      width: wp('30%'),
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                  }}>
                                  <TextInput
                                    value={String(item.totalHTVA)}
                                    placeholder="Total HTVA"
                                    editable={false}
                                    // onChangeText={value =>
                                    //   this.editOfferItemsFun(
                                    //     index,
                                    //     'totalHTVA',
                                    //     value,
                                    //   )
                                    // }
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                      paddingVertical: 10,
                                      paddingLeft: 5,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    marginRight: wp('2%'),
                                    borderRadius: 6,
                                  }}>
                                  <TextInput
                                    value={String(item.totalTvac)}
                                    placeholder="Total TVAC"
                                    editable={false}
                                    // onChangeText={value =>
                                    //   this.editOfferItemsFun(
                                    //     index,
                                    //     'totalTvac',
                                    //     value,
                                    //   )
                                    // }
                                    style={{
                                      color: '#161C27',
                                      fontSize: 14,
                                      fontFamily: 'Inter-Regular',
                                      paddingVertical: 10,
                                      paddingHorizontal: 5,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                    marginRight: wp('2%'),
                                  }}>
                                  <CheckBox
                                    onValueChange={value =>
                                      this.editOfferItemsFun(
                                        index,
                                        'isExTill',
                                        value,
                                      )
                                    }
                                    value={item.isExTill}
                                    style={{
                                      margin: 8,
                                      height: 20,
                                      width: 20,
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
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => this.addDataInArrFun()}
                    style={{
                      height: hp('6%'),
                      width: wp('80%'),
                      backgroundColor: '#94C036',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: hp('3%'),
                      borderRadius: 100,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Image
                        source={img.addIcon}
                        style={{
                          width: 20,
                          height: 20,
                          tintColor: '#fff',
                          resizeMode: 'contain',
                        }}
                      />
                      <Text
                        style={{
                          color: 'white',
                          marginLeft: 10,
                          fontFamily: 'Inter-SemiBold',
                        }}>
                        Add Line
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{marginTop: hp('3%'), flexDirection: 'row'}}>
                  {kitchenItems.map((item, index) => {
                    return (
                      <View style={styles.itemContainer} key={index}>
                        <TouchableOpacity
                          onPress={() => this.onPressMenuItem(item)}
                          style={{
                            backgroundColor: '#fff',
                            flex: 1,
                            borderRadius: 8,
                            padding: 10,
                            marginRight: wp('5%'),
                            elevation: 3,
                            shadowOpacity: 1.0,
                            shadowOffset: {
                              width: 1,
                              height: 1,
                            },
                            shadowRadius: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.05)',
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
                                height: 50,
                                width: 50,
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
                              {item.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
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
                              Action
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
                          {menuListItemsArr.length > 0
                            ? menuListItemsArr.map((item, index) => {
                                return (
                                  <View
                                    key={index}
                                    style={{
                                      paddingVertical: 10,
                                      paddingHorizontal: 5,
                                      flexDirection: 'row',
                                      backgroundColor: '#fff',
                                    }}>
                                    <TouchableOpacity
                                      onPress={() =>
                                        this.removeMenuItemFun(index)
                                      }
                                      style={{
                                        width: wp('30%'),
                                        marginRight: wp('2%'),
                                        borderRadius: 6,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: '#ED3A4A',
                                      }}>
                                      <Text
                                        style={{
                                          fontFamily: 'Inter-SemiBold',
                                          color: '#fff',
                                        }}>
                                        Remove
                                      </Text>
                                    </TouchableOpacity>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        marginRight: wp('2%'),
                                        borderRadius: 6,
                                      }}>
                                      <TextInput
                                        value={item.menuItemName}
                                        placeholder="Item Name"
                                        editable={false}
                                        // onChangeText={value =>
                                        //   this.editOfferItemsFun(
                                        //     index,
                                        //     'totalTvac',
                                        //     value,
                                        //   )
                                        // }
                                        style={{
                                          color: '#161C27',
                                          fontSize: 14,
                                          fontFamily: 'Inter-Regular',
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                        }}
                                      />
                                    </View>
                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        marginRight: wp('2%'),
                                        borderRadius: 6,
                                      }}>
                                      <TextInput
                                        value={String(item.quantity)}
                                        placeholder="Quantity"
                                        onChangeText={value =>
                                          this.editMenuItemsFun(
                                            index,
                                            'quantity',
                                            value,
                                          )
                                        }
                                        style={{
                                          color: '#161C27',
                                          fontSize: 14,
                                          fontFamily: 'Inter-Regular',
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                        }}
                                      />
                                    </View>

                                    <View
                                      style={{
                                        width: wp('30%'),
                                        alignItems: 'center',
                                      }}>
                                      <CheckBox
                                        value={item.isExTill}
                                        onValueChange={value =>
                                          this.editMenuItemsFun(
                                            index,
                                            'isExTill',
                                            value,
                                          )
                                        }
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
                        value={kitchenNotesValue}
                        onChangeText={value =>
                          this.setState({
                            kitchenNotesValue: value,
                          })
                        }
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
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: hp('2%'),
                    }}>
                    <TouchableOpacity
                      onPress={() => this.saveFun()}
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
              </View>
            </ScrollView>
            <Modal
              isVisible={menuItemsModalStatus}
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
                      Menu Items
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
                <View
                  style={{
                    borderWidth: 0.4,
                    height: hp('6%'),
                    width: wp('70%'),
                    borderRadius: 100,
                    backgroundColor: '#fff',
                    alignSelf: 'center',
                    marginTop: hp('2%'),
                    justifyContent: 'center',
                    paddingLeft: 15,
                  }}>
                  <TextInput
                    placeholder="Search..."
                    placeholderTextColor="grey"
                    value={searchMenuItem}
                    style={{
                      width: wp('60%'),
                      paddingVertical: 10,
                    }}
                    onChangeText={value => this.searchFun(value)}
                  />
                </View>
                {menuItemsLoader ? (
                  <ActivityIndicator size="small" color="grey" />
                ) : (
                  <View style={{marginVertical: hp('2%'), flex: 1}}>
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={menuItemsArr}
                      renderItem={({item}) => (
                        <View style={{flex: 1}}>
                          <TouchableOpacity
                            onPress={() => this.onPressMenuItemSec(item)}
                            style={{
                              backgroundColor: '#fff',
                              flex: 1,
                              borderRadius: 8,
                              paddingVertical: 10,
                              marginHorizontal: 15,
                              marginVertical: 10,
                            }}>
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
                    />
                  </View>
                )}
              </View>
            </Modal>
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

export default connect(mapStateToProps, {UserTokenAction})(AddNewEvent);
