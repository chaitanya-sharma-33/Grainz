import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getUserLocationApi,
  setCurrentLocation,
} from '../../connectivity/api';
import styles from './style';

import {translate, setI18nConfig} from '../../utils/translations';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
      token: '',
      buttonsSubHeader: [],
      loader: false,
      locationArr: [],
      finalLocation: '',
      finalLocationName: '',
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
          // buttons: [
          //   {
          //     id: 0,
          //     name: translate('Stock Take'),
          //     icon: img.stokeTakeIcon,
          //     screen: 'StockTakeScreen',
          //   },
          //   {
          //     id: 1,
          //     name: translate('Mise-en-Place'),
          //     icon: img.miscIcon,
          //     screen: 'MepScreen',
          //   },

          //   // {
          //   //   name: translate('Recipes'),
          //   //   icon: img.searchIcon,
          //   //   screen: 'RecipeScreen',
          //   // },
          //   // {
          //   //   name: translate('Menu-Items'),
          //   //   icon: img.searchIcon,
          //   //   screen: 'MenuItemsScreen',
          //   // },
          //   {
          //     id: 2,
          //     name: translate('Manual Log small'),
          //     icon: img.ManualIcon,
          //     screen: 'ManualLogScreen',
          //   },
          //   // {
          //   //   name: translate('Deliveries'),
          //   //   icon: img.addIcon,
          //   //   screen: 'DeliveriesScreen',
          //   // },
          //   {
          //     id: 4,
          //     name: translate('Casual purchase'),
          //     icon: img.CasualIcon,
          //     screen: 'CasualPurchaseScreen',
          //   },
          //   {
          //     id: 5,
          //     name: translate('Ordering'),
          //     icon: img.orderingIcon,
          //     screen: 'OrderingAdminScreen',
          //   },
          //   // {
          //   //   id: 6,
          //   //   name: translate('Dashboard'),
          //   //   icon: img.dashboardIcon,
          //   //   screen: 'DashboardScreen',
          //   // },
          //   // {name: translate('Events'), icon: img.addIcon, screen: 'EventsScreen'},
          // ],
          buttons: [
            {
              id: 0,
              name: translate('Ordering'),
              icon: img.orderingIcon,
              screen: 'OrderingAdminScreen',
            },
            {
              id: 1,
              name: translate('Suppliers'),
              icon: img.supplierIcon,
              screen: 'SupplierAdminScreen',
            },
            {
              id: 2,
              name: translate('Stock Take'),
              icon: img.stokeTakeIcon,
              screen: 'StockTakeScreen',
            },
            // {
            //   id: 1,
            //   name: translate('Casual purchase'),
            //   icon: img.CasualIcon,
            //   // screen: 'ViewPurchaseScreen',
            //   screen: '',
            // },
            // {
            //   id: 2,
            //   name: translate('Suppliers'),
            //   icon: img.supplierIcon,
            //   screen: 'SupplierAdminScreen',
            // },
            // {
            //   id: 3,
            //   name: translate('Reporting'),
            //   icon: img.reportsIcon,
            //   screen: 'ReportingAdminScreen',
            // },
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

        Alert.alert('Grainz', 'Session Timeout', [
          {text: 'OK', onPress: () => this.removeToken()},
        ]);
      });
  };

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      const locationName = await AsyncStorage.getItem('@locationName');
      const location = await AsyncStorage.getItem('@location');
      console.log('locationName', locationName);
      console.log('location', location);

      if (location === undefined || location === null || location === '') {
        this.getUserLocationFun();
      } else {
        this.setState(
          {
            finalLocation: location,
          },
          () => this.setCurrentLocFun(),
        );
      }
      this.getData();
      this.setState({
        finalLocationName: locationName,
      });
    });
    this.setLanguage();
  }

  getUserLocationFun = () => {
    getUserLocationApi()
      .then(res => {
        console.log('res-->LOC', res);
        let finalUsersList = res.data.map((item, index) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        console.log('res-->finalUsersList');

        let defaultUser = res.data.map((item, index) => {
          if (item.isDefault === true) {
            return item.id;
          }
        });
        let defaultUserName = res.data.map((item, index) => {
          if (item.isDefault === true) {
            return item.name;
          }
        });
        let finalData = defaultUser.filter(function (element) {
          return element !== undefined;
        });

        console.log('res-->finalData', finalData[0]);

        let finalDataName = defaultUserName.filter(function (element) {
          return element !== undefined;
        });
        this.setState(
          {
            locationArr: finalUsersList,
            finalLocation: finalData[0],
            // finalLocationName: finalDataName[0],
          },
          () => this.setCurrentLocFun(),
        );
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  setCurrentLocFun = () => {
    const {finalLocation} = this.state;
    console.log('FINAL-LOC', finalLocation);
    setCurrentLocation(finalLocation)
      .then(res => {
        console.log('res-SETLOC', res);

        this.storeLocationFun(res);
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  storeLocationFun = async res => {
    const {finalLocation} = this.state;
    console.log('res-STORE', finalLocation);
    await AsyncStorage.setItem('@location', finalLocation);
    const finalData = (res.data && res.data.isFreemium).toString();
    console.log('final', finalData);
    await AsyncStorage.setItem('@isFreemium', finalData);
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
    this.props.navigation.navigate(item.screen, {
      item: '',
    });
  };

  render() {
    const {buttons, loader, finalLocationName} = this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
          finalLocation={finalLocationName}
        />
        {loader ? (
          <ActivityIndicator size="large" color="grey" />
        ) : (
          <View style={styles.subContainer}>
            <FlatList
              data={buttons}
              renderItem={({item}) => (
                <View style={styles.itemContainer}>
                  <TouchableOpacity
                    onPress={() => this.onPressFun(item)}
                    style={{
                      backgroundColor:
                        item.screen === 'OrderingAdminScreen'
                          ? '#C7408A'
                          : item.screen === 'StockTakeScreen'
                          ? '#81A91D'
                          : item.screen === 'SupplierAdminScreen'
                          ? '#7662A9'
                          : '#DCDCDC',
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
                    {/* <View style={styles.tileTextContainerSec}>
                      <Text style={styles.tileTextStylingSec} numberOfLines={1}>
                        {item.screen === 'OrderingAdminScreen'
                          ? '1 Action'
                          : item.screen === 'ViewPurchaseScreen'
                          ? '2 Actions'
                          : item.screen === 'SupplierAdminScreen'
                          ? '3 Actions'
                          : 'Coming Soon'}
                      </Text>
                    </View> */}
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={item => item.id}
              numColumns={2}
            />
          </View>
        )}
        {/* <Footer
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        /> */}
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
