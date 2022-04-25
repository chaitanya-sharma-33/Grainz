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
  FlatList,
  Platform,
  Dimensions,
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
import {
  getMyProfileApi,
  getUserLocationApi,
  getCurrentUserApi,
  revenuePostReportApi,
} from '../../connectivity/api';
import moment from 'moment';
import styles from './style';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {translate} from '../../utils/translations';
import {StackedBarChart} from 'react-native-chart-kit';
import PureChart from 'react-native-pure-chart';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      modalLoaderDrafts: false,
      finalData: '',
      isDatePickerVisibleFirstDate: false,
      isDatePickerVisibleSecondDate: false,
      locationList: [],
      revenueData: '',
      viewValue: '',
      locationValue: '',
      currentUserData: '',
      finalFirstDate: '',
      apiFirstDate: '',
      finalSecondDate: '',
      apiSecondDate: '',
      showMap: false,
      sampleData: [
        {
          seriesName: 'series1',
          data: [
            {x: 'A', y: 30},
            {x: 'B', y: 60},
            {x: 'C', y: 70},
            {x: 'D', y: 80},
          ],
          color: 'red',
        },
        {
          seriesName: 'series2',
          data: [
            {x: 'A', y: 30},
            {x: 'B', y: 60},
            {x: 'C', y: 70},
            {x: 'D', y: 80},
          ],
          color: 'yellow',
        },
      ],
      mapData: {
        labels: ['Test1', 'Test2'],
        legend: ['L1', 'L2', 'L3'],
        data: [
          [60, 60, 60],
          [30, 30, 60],
        ],
        barColors: ['#dfe4ea', '#ced6e0', '#a4b0be'],
      },
      screenWidth: Dimensions.get('window').width,
      chartConfig: {
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
      },
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
    this.getData();
    this.getLocationListData();
    this.getCurrentUserFun();
  }

  revenuePostReportFun = () => {
    const {apiFirstDate, apiSecondDate, locationValue, viewValue} = this.state;
    const finalType =
      viewValue === 'Daily' ? '0' : viewValue === 'Weekly' ? '1' : '2';
    let payload = {
      endDate: apiSecondDate,
      startDate: apiFirstDate,
      type: finalType,
      locations: [locationValue],
    };
    revenuePostReportApi(payload)
      .then(res => {
        const {data} = res;
        this.setState({
          modalLoaderDrafts: false,
          revenueData: data,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  getCurrentUserFun = () => {
    getCurrentUserApi()
      .then(res => {
        const {data} = res;
        let todaydate = moment(new Date()).format('MM/DD/YYYY');
        let todaydateApi = new Date().toISOString();
        var currentTime = new Date();
        let periods = data && data.dashBoardPreferences.periods;
        currentTime.setDate(currentTime.getDate() - periods);
        let previousDate = moment(currentTime).format('MM/DD/YYYY');
        let previousDateApi = currentTime.toISOString();
        this.setState(
          {
            currentUserData: data,
            viewValue: data && data.dashBoardPreferences.view,
            locationValue: data && data.dashBoardPreferences.locationList[0],
            finalSecondDate: todaydate,
            apiSecondDate: todaydateApi,
            finalFirstDate: previousDate,
            apiFirstDate: previousDateApi,
            modalLoaderDrafts: true,
          },
          () => this.revenuePostReportFun(),
        );
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  getLocationListData = () => {
    getUserLocationApi()
      .then(res => {
        const {data} = res;
        let finalLocationList = data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        this.setState({
          locationList: finalLocationList,
          recipeLoader: false,
          showMap: true,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  showDatePickerFirstDate = () => {
    this.setState({
      isDatePickerVisibleFirstDate: true,
    });
  };

  handleConfirmFirstDate = date => {
    let newdate = moment(date).format('MM/DD/YYYY');
    let apiFirstDate = date.toISOString();
    this.setState(
      {
        finalFirstDate: newdate,
        apiFirstDate,
        modalLoaderDrafts: true,
      },
      () => this.revenuePostReportFun(),
    );
    this.hideDatePickerFirstDate();
  };

  hideDatePickerFirstDate = () => {
    this.setState({
      isDatePickerVisibleFirstDate: false,
    });
  };

  showDatePickerSecondDate = () => {
    this.setState({
      isDatePickerVisibleSecondDate: true,
    });
  };

  handleConfirmSecondDate = date => {
    let newdate = moment(date).format('MM/DD/YYYY');
    let apiSecondDate = date.toISOString();
    this.setState(
      {
        finalSecondDate: newdate,
        apiSecondDate,
        modalLoaderDrafts: true,
      },
      () => this.revenuePostReportFun(),
    );
    this.hideDatePickerSecondDate();
  };

  hideDatePickerSecondDate = () => {
    this.setState({
      isDatePickerVisibleSecondDate: false,
    });
  };

  selectLocationFun = value => {
    if (value) {
      this.setState(
        {
          locationValue: value,
          modalLoaderDrafts: true,
        },
        () => this.revenuePostReportFun(),
      );
    }
  };

  viewFun = value => {
    if (value) {
      this.setState(
        {
          viewValue: value,
        },
        () => this.revenuePostReportFun(),
      );
    }
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalLoaderDrafts,
      finalFirstDate,
      isDatePickerVisibleFirstDate,
      isDatePickerVisibleSecondDate,
      finalSecondDate,
      locationValue,
      locationList,
      revenueData,
      viewValue,
      chartConfig,
      mapData,
      screenWidth,
      showMap,
      sampleData,
    } = this.state;

    const {currentMonthRevenueCosts, previousDayRevenueCosts} = revenueData;

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
                  {translate('Dashboard')}
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
          <View style={{marginHorizontal: wp('5%')}}>
            <View>
              <View
                style={{
                  marginTop: hp('3%'),
                }}>
                <View style={{marginBottom: hp('2%')}}>
                  <Text style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                    {translate('View')} :
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    width: wp('90%'),
                    backgroundColor: '#fff',
                    paddingVertical: Platform.OS === 'ios' ? 15 : 5,
                    borderRadius: 5,
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      width: wp('80%'),
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}>
                    <RNPickerSelect
                      placeholder={{
                        label: 'View*',
                        value: null,
                        color: 'grey',
                      }}
                      onValueChange={value => this.viewFun(value)}
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
                      items={[
                        {
                          label: 'Daily',
                          value: 'Daily',
                        },
                        {
                          label: 'Weekly',
                          value: 'Weekly',
                        },
                        {
                          label: 'Monthly',
                          value: 'Monthly',
                        },
                      ]}
                      value={viewValue}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                  <View style={{marginRight: wp('5%')}}>
                    <Image
                      source={img.arrowDownIcon}
                      resizeMode="contain"
                      style={{
                        height: 20,
                        width: 20,
                        marginTop: Platform.OS === 'ios' ? 0 : 15,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp('3%'),
                justifyContent: 'space-between',
              }}>
              <View>
                <View style={{marginBottom: hp('2%')}}>
                  <Text style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                    {translate('Date Range')} :
                  </Text>
                </View>
                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => this.showDatePickerFirstDate()}
                    style={{
                      width: wp('40%'),
                      padding: Platform.OS === 'ios' ? 15 : 5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: '#fff',
                      borderRadius: 5,
                    }}>
                    <TextInput
                      placeholder="First Date"
                      value={finalFirstDate}
                      editable={false}
                    />
                    <Image
                      source={img.calenderIcon}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        marginTop: Platform.OS === 'android' ? 15 : 0,
                        marginRight: Platform.OS === 'android' ? 15 : 0,
                      }}
                    />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisibleFirstDate}
                    mode={'date'}
                    onConfirm={this.handleConfirmFirstDate}
                    onCancel={this.hideDatePickerFirstDate}
                  />
                </View>
              </View>
              <View>
                <View style={{marginBottom: hp('5%')}}></View>
                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => this.showDatePickerSecondDate()}
                    style={{
                      width: wp('40%'),
                      padding: Platform.OS === 'ios' ? 15 : 5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: '#fff',
                      borderRadius: 5,
                    }}>
                    <TextInput
                      placeholder="Second Date"
                      value={finalSecondDate}
                      editable={false}
                    />
                    <Image
                      source={img.calenderIcon}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        marginTop: Platform.OS === 'android' ? 15 : 0,
                        marginRight: Platform.OS === 'android' ? 15 : 0,
                      }}
                    />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisibleSecondDate}
                    mode={'date'}
                    onConfirm={this.handleConfirmSecondDate}
                    onCancel={this.hideDatePickerSecondDate}
                  />
                </View>
              </View>
            </View>
            <View>
              <View
                style={{
                  marginTop: hp('3%'),
                }}>
                <View style={{marginBottom: hp('2%')}}>
                  <Text style={{fontFamily: 'Inter-Regular', fontSize: 15}}>
                    {translate('Select location(s)')} :
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    width: wp('90%'),
                    backgroundColor: '#fff',
                    paddingVertical: Platform.OS === 'ios' ? 15 : 5,
                    borderRadius: 5,
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      width: wp('80%'),
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}>
                    <RNPickerSelect
                      placeholder={{
                        label: 'Select Location*',
                        value: null,
                        color: 'grey',
                      }}
                      onValueChange={value => this.selectLocationFun(value)}
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
                      items={locationList}
                      value={locationValue}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                  <View style={{marginRight: wp('5%')}}>
                    <Image
                      source={img.arrowDownIcon}
                      resizeMode="contain"
                      style={{
                        height: 20,
                        width: 20,
                        marginTop: Platform.OS === 'ios' ? 0 : 15,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('4%')}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View style={{marginHorizontal: wp('4%')}}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                            backgroundColor: '#EFFBCF',
                            paddingVertical: hp('3%'),
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                            paddingHorizontal: 20,
                          }}>
                          <View
                            style={{
                              width: wp('40%'),
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}></Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              justifyContent: 'center',
                              marginLeft: wp('5%'),
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Previous day
                            </Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              justifyContent: 'center',
                              marginLeft: wp('5%'),
                            }}>
                            <Text
                              style={{
                                color: '#161C27',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Today
                            </Text>
                          </View>
                        </View>
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                Revenue HTVA
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {previousDayRevenueCosts &&
                                  previousDayRevenueCosts.revenueHTVA}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {currentMonthRevenueCosts &&
                                  currentMonthRevenueCosts.revenueHTVA}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                {translate('Cost of sales')}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {previousDayRevenueCosts &&
                                  previousDayRevenueCosts.costOfSale}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {currentMonthRevenueCosts &&
                                  currentMonthRevenueCosts.costOfSale}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                {translate('Gross Margin')}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {previousDayRevenueCosts &&
                                  previousDayRevenueCosts.grosMargin}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {currentMonthRevenueCosts &&
                                  currentMonthRevenueCosts.grosMargin}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                Personnel costs
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {previousDayRevenueCosts &&
                                  previousDayRevenueCosts.staffCost}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {currentMonthRevenueCosts &&
                                  currentMonthRevenueCosts.staffCost}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                Overheads
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {previousDayRevenueCosts &&
                                  previousDayRevenueCosts.overheads}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {currentMonthRevenueCosts &&
                                  currentMonthRevenueCosts.overheads}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 1,
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                              paddingVertical: hp('3%'),
                              borderTopLeftRadius: 5,
                              borderTopRightRadius: 5,
                              paddingHorizontal: 20,
                            }}>
                            <View
                              style={{
                                width: wp('40%'),
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                Net margin
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {previousDayRevenueCosts &&
                                  previousDayRevenueCosts.neMargin}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('30%'),
                                justifyContent: 'center',
                                marginLeft: wp('5%'),
                              }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-Regular',
                                }}>
                                €{' '}
                                {currentMonthRevenueCosts &&
                                  currentMonthRevenueCosts.neMargin}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          {/* {showMap ? (
            <View
              style={{
                marginHorizontal: wp('5%'),
                marginTop: hp('5%'),
              }}>
              <StackedBarChart
                style={{
                  marginLeft: 10,
                }}
                data={{
                  labels: [
                    'Test1',
                    'Test2',
                    'Test3',
                    'Test4',
                    'Test5',
                    'Test6',
                  ],
                  legend: ['L1', 'L2', 'L3', 'L4', 'L5'],
                  data: [
                    [60, 60, 60, 80, 100],
                    [30, 30, 60, 80, 100],
                    [30, 30, 60, 80, 100],
                    [30, 30, 60, 80, 100],
                    [30, 30, 60, 80, 100],
                    [30, 30, 60, 80, 100],
                  ],
                  barColors: ['red', 'pink', 'orange', 'blue', 'grey'],
                }}
                width={320}
                height={320}
                chartConfig={chartConfig}
              />
            </View>
          ) : null} */}
          {/* <View
            style={{
              marginHorizontal: wp('5%'),
              marginTop: hp('5%'),
            }}>
            <PureChart data={sampleData} type="bar" />
          </View> */}
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

export default connect(mapStateToProps, {UserTokenAction})(index);
