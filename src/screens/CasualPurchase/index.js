import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {getMyProfileApi} from '../../connectivity/api';
import styles from './style';

import {translate} from '../../utils/translations';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [
        {
          id: 0,
          name: translate('New'),
        },
        {
          id: 1,
          name: translate('View'),
        },
      ],
      token: '',
      buttonsSubHeader: [],
      loader: true,
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

  removeToken = async () => {
    await AsyncStorage.removeItem('@appToken');
    this.props.UserTokenAction(null);
  };

  componentDidMount() {
    this.getData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    if (item.id === 0) {
      this.props.navigation.navigate('AddPurchaseScreen');
    } else if (item.id === 1) {
      this.props.navigation.navigate('ViewPurchaseScreen');
    }
  };

  render() {
    const {buttons, buttonsSubHeader, loader} = this.state;

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
        <View style={styles.subContainer}>
          <View style={styles.firstContainer}>
            <View style={styles.flex}>
              <Text style={styles.adminTextStyle}>
                {translate('Casual purchase')}
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

          <FlatList
            data={buttons}
            renderItem={({item}) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity
                  onPress={() => this.onPressFun(item)}
                  style={styles.tileContainer}>
                  <View style={styles.tileImageContainer}>
                    <Image
                      source={
                        item.id === 0
                          ? img.addIconNew
                          : item.id === 1
                          ? img.inventoryIcon
                          : null
                      }
                      style={styles.tileImageStyling}
                    />
                  </View>
                  <View style={styles.tileTextContainer}>
                    <Text style={styles.tileTextStyling} numberOfLines={1}>
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
