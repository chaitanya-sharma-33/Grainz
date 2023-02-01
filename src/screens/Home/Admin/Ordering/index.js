import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../constants/images';
import SubHeader from '../../../../components/SubHeader';
import Header from '../../../../components/Header';
import {UserTokenAction} from '../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getOrderingCountApi,
} from '../../../../connectivity/api';
import styles from './style';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {translate, setI18nConfig} from '../../../../utils/translations';
import {widthPercentageToDP} from 'react-native-responsive-screen';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
      token: '',
      buttonsSubHeader: [],
      loader: false,
      selectedTextUser: 'All Supplier',
      countData: '',
      supplierData: '',
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
          buttons: [
            {
              name: translate('Draft Orders'),
              icon: img.draftIcon,
              screen: 'DraftOrderAdminScreen',
              id: 1,
            },

            {
              name: translate('Pending Deliveries'),
              icon: img.pendingIcon,
              screen: 'PendingDeliveryAdminScreen',
              id: 2,
            },

            {
              name: translate('Review'),
              icon: img.reviewIcon,
              screen: 'PendingDeliveryAdminScreen',
              id: 3,
            },
            {
              name: translate('History'),
              icon: img.historyIcon,
              screen: 'PendingDeliveryAdminScreen',
              id: 4,
            },
          ],
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
        Alert.alert('Grainz', err.response, [{text: 'OK'}]);
      });
  };

  componentDidMount() {
    this.getData();
    this.props.navigation.addListener('focus', () => {
      const {item} = this.props.route && this.props.route.params;
      this.getOrderingData();
      if (item) {
        this.setState({
          supplierData: item,
        });
      }
    });
    this.setLanguage();
  }

  getOrderingData = () => {
    getOrderingCountApi()
      .then(res => {
        this.setState({
          countData: res.data,
        });
      })
      .catch(err => {
        console.warn('Err', err);
      });
  };

  setLanguage = async () => {
    setI18nConfig();
    const lang = await AsyncStorage.getItem('Language');
    if (lang !== null && lang !== undefined) {
      setI18nConfig();
    } else {
      await AsyncStorage.setItem('Language', 'en');
      setI18nConfig();
    }
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    const listId =
      item.id === 1
        ? 1
        : item.id === 2
        ? 2
        : item.id === 3
        ? 3
        : item.id === 4
        ? 4
        : null;
    this.props.navigation.navigate(item.screen, {
      listId,
    });
  };

  render() {
    const {
      buttons,
      buttonsSubHeader,
      loader,
      selectedTextUser,
      countData,
      supplierData,
    } = this.state;

    console.log('supplierData', supplierData);

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="large" color="grey" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        {loader ? (
          <ActivityIndicator size="large" color="grey" />
        ) : (
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={styles.goBackContainer}>
                <Image source={img.backIcon} style={styles.tileImageBack} />
              </TouchableOpacity>
              <View style={{flex: 1, marginLeft: wp('3%')}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Ordering')}
                </Text>
              </View>
            </View>
            <View style={{marginHorizontal: wp('4%'), marginBottom: hp('2%')}}>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('NewOrderScreen', {
                    ScreenType: '',
                  })
                }
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  padding: Platform.OS === 'ios' ? 6 : 0,
                }}>
                <View
                  style={{
                    marginLeft: '3%',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Inter-Regular',
                    }}>
                    {translate('Supplier')}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      // color: '#4A4C55',
                      fontSize: 14,
                      fontFamily: 'Inter-Regular',
                      marginLeft: '3%',
                      marginTop: 10,
                      fontWeight: 'bold',
                    }}>
                    {supplierData ? supplierData.name : selectedTextUser}
                  </Text>
                  <Image
                    source={img.calenderIcon}
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'contain',
                      tintColor: 'grey',
                      alignSelf: Platform.OS === 'android' ? 'center' : null,
                      marginRight: Platform.OS === 'android' ? 10 : 6,
                      marginTop: 5,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                alignItems: 'center',
              }}>
              <FlatList
                data={buttons}
                renderItem={({item}) => (
                  <View style={styles.itemContainer}>
                    <TouchableOpacity
                      onPress={() => this.onPressFun(item)}
                      style={{
                        backgroundColor:
                          item.id === 1
                            ? '#CE428F'
                            : item.id === 2
                            ? '#B43B87'
                            : item.id === 3
                            ? '#963176'
                            : '#6D2156',
                        ...styles.tileContainer,
                      }}>
                      <View style={styles.tileImageContainer}>
                        <Image
                          source={item.icon}
                          style={{
                            ...styles.tileImageStyling,
                          }}
                        />
                      </View>
                      <View style={styles.tileTextContainer}>
                        <Text style={styles.tileTextStyling} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <View style={styles.tileTextContainerSec}>
                        <Text
                          style={styles.tileTextStylingSec}
                          numberOfLines={1}>
                          {item.id === 1
                            ? countData.draftOrdersCount
                            : item.id === 2
                            ? countData.pendingOrdersCount
                            : item.id === 3
                            ? countData.deliveredOrdersCount
                            : countData.historyOrdersCount}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={item => item.id}
                numColumns={2}
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('NewOrderSecScreen', {
                  item: '',
                })
              }
              // onPress={() =>
              //   this.props.navigation.navigate('OrderCreationScreen', {
              //     item: '',
              //   })
              // }
              style={{
                position: 'absolute',
                right: 20,
                top: hp('65%'),
                flexDirection: 'row',
                backgroundColor: '#5297c1',
                padding: 15,
                borderRadius: 5,
              }}>
              <View>
                <Image
                  style={{
                    tintColor: '#fff',
                    width: 15,
                    height: 15,
                    resizeMode: 'contain',
                    marginLeft: 5,
                  }}
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
          </View>
        )}
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
