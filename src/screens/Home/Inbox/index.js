import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../constants/images';
import SubHeader from '../../../components/SubHeader';
import Header from '../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../redux/actions/UserTokenAction';
import {getMyProfileApi} from '../../../connectivity/api';
import styles from './style';

import {translate} from '../../../utils/translations';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.props.navigation.navigate(item.screen);
  };

  render() {
    const {buttonsSubHeader, loader} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: '#F0F4FE'}}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="large" color="grey" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={2} />
        )} */}

        <View
          style={{
            marginTop: hp('2%'),
          }}>
          <View style={styles.firstContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.adminTextStyle}>{translate('Setup')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>{translate('Go Back')}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('5%'),
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 18}}>
              Work in Progress
            </Text>
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

export default connect(mapStateToProps, {UserTokenAction})(index);
