import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getDepartmentsApi,
  getPreviousStockDatesApi,
} from '../../connectivity/api';
import styles from './style';
import CheckBox from '@react-native-community/checkbox';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import RNPickerSelect from 'react-native-picker-select';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import {translate} from '../../utils/translations';

class HistoryStock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      buttonsSubHeader: [],
      loader: true,
      departmentName: '',
      departmentArr: [],
      historyDatesArr: [],
      historyDate: '',
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
        this.setState({
          loader: false,
        });
      });
  };

  componentDidMount() {
    this.getData();
    this.getDeparmentData();
  }

  getDeparmentData = () => {
    getDepartmentsApi()
      .then(res => {
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        this.setState({
          departmentArr: finalUsersList,
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);
      });
  };

  getDatesData = id => {
    getPreviousStockDatesApi(id)
      .then(res => {
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: moment(item).format('DD/MM/YYYY'),
            value: moment(item).format('MM/DD/YYYY'),
          };
        });
        this.setState({
          historyDatesArr: finalUsersList,
          datesLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  selectDepartementNameFun = value => {
    this.setState(
      {
        departmentName: value,
        datesLoader: true,
      },

      () => this.getDatesData(value),
    );
  };

  selectDateFun = value => {
    if (value) {
      this.setState({
        historyDate: value,
      });
    }
  };

  getDataFun = () => {
    const {departmentName, historyDate} = this.state;
    if (departmentName && historyDate) {
      this.props.navigation.navigate('HistroyDataScreen', {
        departmentId: departmentName,
        historyDate,
      });
    } else {
      alert('Please select department and date first');
    }
  };

  render() {
    const {
      buttonsSubHeader,
      loader,
      departmentName,
      departmentArr,
      historyDate,
      historyDatesArr,
      datesLoader,
    } = this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={styles.flex}>
                <Text style={styles.adminTextStyle}>
                  {translate('Stock Take')} - History
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

            <View
              style={{
                flexDirection: 'row',
                borderRadius: 10,
                backgroundColor: '#fff',
                marginHorizontal: wp('5%'),
                marginVertical: hp('2%'),
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  width: wp('80%'),
                  height: hp('6%'),
                }}>
                <RNPickerSelect
                  placeholder={{
                    label: 'Select Department*',
                    value: null,
                    color: 'black',
                  }}
                  onValueChange={value => {
                    this.selectDepartementNameFun(value);
                  }}
                  style={{
                    inputIOS: {
                      fontSize: 14,
                      paddingHorizontal: '5%',
                      color: '#161C27',
                      width: '100%',
                      alignSelf: 'center',
                      paddingVertical: 15,
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
                  value={departmentName}
                  useNativeAndroidPickerStyle={false}
                />
              </View>
              <View style={{marginRight: wp('5%')}}>
                <Image
                  source={img.arrowDownIcon}
                  resizeMode="contain"
                  style={{
                    height: 18,
                    width: 18,
                    resizeMode: 'contain',
                    marginTop: Platform.OS === 'ios' ? 12 : 15,
                  }}
                />
              </View>
            </View>
            {datesLoader ? (
              <ActivityIndicator size="small" color="grey" />
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  borderRadius: 10,
                  backgroundColor: '#fff',
                  marginHorizontal: wp('5%'),
                  marginVertical: hp('2%'),
                }}>
                <View
                  style={{
                    alignSelf: 'center',
                    justifyContent: 'center',
                    width: wp('80%'),
                    height: hp('6%'),
                  }}>
                  <RNPickerSelect
                    placeholder={{
                      label: 'Select Date*',
                      value: null,
                      color: 'black',
                    }}
                    onValueChange={value => {
                      this.selectDateFun(value);
                    }}
                    style={{
                      inputIOS: {
                        fontSize: 14,
                        paddingHorizontal: '5%',
                        color: '#161C27',
                        width: '100%',
                        alignSelf: 'center',
                        paddingVertical: 15,
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
                    items={historyDatesArr}
                    value={historyDate}
                    useNativeAndroidPickerStyle={false}
                  />
                </View>
                <View style={{marginRight: wp('5%')}}>
                  <Image
                    source={img.arrowDownIcon}
                    resizeMode="contain"
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                      marginTop: Platform.OS === 'ios' ? 12 : 15,
                    }}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity
              onPress={() => this.getDataFun()}
              style={{
                width: wp('30%'),
                height: hp('5%'),
                backgroundColor: '#94C036',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
                marginTop: hp('2%'),
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                }}>
                Get Data
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(HistoryStock);
