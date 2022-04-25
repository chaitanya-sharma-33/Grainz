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
import {getMyProfileApi} from '../../../../connectivity/api';
import styles from './style';

import {translate} from '../../../../utils/translations';

class Reports extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
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
          buttons: [
            {
              name: translate('Gross Margin'),
              icon: img.grossMarginIcon,
              screen: 'GrossMarginAdminScreen',
            },
            {
              name: translate('Menu Analysis'),
              icon: img.menuAnalysisIcon,
              screen: 'MenuAnalysisAdminScreen',
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
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    this.props.navigation.navigate(item.screen);
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
          <ActivityIndicator size="small" color="#98C13E" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}

        <View style={styles.subContainer}>
          <View style={styles.firstContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.adminTextStyle}>
                {translate('Reports & Analysis')}
              </Text>
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

export default connect(mapStateToProps, {UserTokenAction})(Reports);
