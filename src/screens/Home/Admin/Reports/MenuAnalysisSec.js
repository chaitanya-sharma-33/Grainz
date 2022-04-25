import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
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

class MenuAnalysisSec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: true,
      buttonsSubHeader: [],
      finalName: '',
      sectionName: '',
      modalData: [],
      showSubList: false,
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

  componentDidMount() {
    this.getData();
    const {index, item, section, sta} =
      this.props.route && this.props.route.params;
    this.setState({
      finalName: item.title,
      sectionName: section.title,
      modalData: item,
    });
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  render() {
    const {recipeLoader, buttonsSubHeader, modalData, finalName} = this.state;

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
        <ScrollView style={{}} showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={{...styles.adminTextStyle, textAlign: 'center'}}>
                  {this.state.sectionName}
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
          </View>

          {recipeLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View style={{}}>
              <View
                style={{
                  padding: hp('2%'),
                }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 5,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: '#EFFBCF',
                      }}>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>{finalName}</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>Guide price</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>{translate('Price')}</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>TVA %</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>Net Revenue</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>Cost</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>Gross Margin</Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          alignItems: 'center',
                        }}>
                        <Text>%</Text>
                      </View>
                    </View>
                    <View>
                      {modalData && modalData.content.length > 0
                        ? modalData.content.map((item, index) => {
                            return (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingVertical: 10,
                                  paddingHorizontal: 5,
                                  backgroundColor:
                                    index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                                }}>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>{item.name}</Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    €{' '}
                                    {item.guidePrice
                                      ? item.guidePrice.toFixed(2)
                                      : '0.00'}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    €{' '}
                                    {item.price
                                      ? item.price.toFixed(2)
                                      : '0.00'}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    € {item.vat ? item.vat.toFixed(2) : '0.00'}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    €{' '}
                                    {item.netRevenue
                                      ? item.netRevenue.toFixed(2)
                                      : '0.00'}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    €{' '}
                                    {item.foodCost
                                      ? item.foodCost.toFixed(2)
                                      : '0.00'}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>
                                    €{' '}
                                    {item.grosMargin
                                      ? item.grosMargin.toFixed(2)
                                      : '0.00'}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: wp('30%'),
                                    alignItems: 'center',
                                  }}>
                                  <Text>%</Text>
                                </View>
                              </View>
                            );
                          })
                        : null}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
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

export default connect(mapStateToProps, {UserTokenAction})(MenuAnalysisSec);
