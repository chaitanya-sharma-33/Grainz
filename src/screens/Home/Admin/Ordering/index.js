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
  getOrderingCountApi,
} from '../../../../connectivity/api';
import styles from './style';

import {translate} from '../../../../utils/translations';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [
        {
          name: translate('New'),
          icon: img.addIconNew,
          screen: 'NewOrderScreen',
          id: 0,
        },
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
      token: '',
      buttonsSubHeader: [],
      loader: true,
      countData: '',
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
    this.props.navigation.addListener('focus', () => {
      this.getOrderingData();
    });
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
    const {buttons, buttonsSubHeader, loader, countData} = this.state;

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

        <View style={styles.subContainer}>
          <View style={styles.firstContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.adminTextStyle}>{translate('Ordering')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>{translate('Go Back')}</Text>
            </TouchableOpacity>
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
                    padding: 15,
                  }}>
                  {item.id > 0 ? (
                    <View
                      style={{
                        backgroundColor: '#ED5184',
                        position: 'absolute',
                        width: 25,
                        height: 25,
                        borderRadius: 60 / 2,
                        borderColor: 'black',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-end',
                        right: 5,
                        top: 5,
                      }}>
                      {item.id === 1 ? (
                        <Text style={{color: '#fff', fontSize: 10}}>
                          {countData.draftOrdersCount}
                        </Text>
                      ) : item.id === 2 ? (
                        <Text style={{color: '#fff', fontSize: 10}}>
                          {countData.pendingOrdersCount}
                        </Text>
                      ) : item.id === 3 ? (
                        <Text style={{color: '#fff', fontSize: 10}}>
                          {countData.deliveredOrdersCount}
                        </Text>
                      ) : (
                        <Text
                          style={{color: '#fff', fontSize: 10}}
                          numberOfLines={1}>
                          {countData.historyOrdersCount}
                        </Text>
                      )}
                    </View>
                  ) : null}

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

export default connect(mapStateToProps, {UserTokenAction})(index);
