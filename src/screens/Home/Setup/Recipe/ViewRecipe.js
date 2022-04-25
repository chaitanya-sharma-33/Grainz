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
import {
  getMyProfileApi,
  getRecipeDetailsApi,
} from '../../../../connectivity/api';

import styles from './style';

import {translate} from '../../../../utils/translations';

class ViewRecipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      sectionName: '',
      modalLoader: true,
      recipeArr: [],
      showMenuItems: false,
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
    const {id} = this.props.route && this.props.route.params;
    this.getRecipeDataFun(id);
  }

  getRecipeDataFun = catId => {
    getRecipeDetailsApi(catId)
      .then(res => {
        this.setState({
          modalData: res.data,
          modalLoader: false,
        });
      })
      .catch(err => {
        console.warn('err', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  showMenuItemsFun = () => {
    this.setState({
      showMenuItems: !this.state.showMenuItems,
    });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      finalName,
      modalLoader,
      sectionName,
      recipeArr,
      showMenuItems,
    } = this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={1} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {' '}
                  {translate('Recipe details')}
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
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{}}>
              <ScrollView>
                {modalLoader ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      padding: hp('2%'),
                    }}>
                    <View style={{marginBottom: hp('3%')}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Inter-Regular',
                              color: '#523622',
                            }}>
                            {' '}
                            {translate('Recipe name')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => alert('Edit FUn')}
                          style={styles.goBackContainer}>
                          <Text style={styles.goBackTextStyle}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Inter-Regular',
                              color: '#161C27',
                            }}>
                            {modalData.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => this.showMenuItemsFun()}
                      style={{
                        backgroundColor: '#FFFFFF',
                        flexDirection: 'row',
                        height: 60,
                        marginTop: hp('4%'),
                        alignItems: 'center',
                        borderRadius: 6,
                        justifyContent: 'space-between',
                        paddingHorizontal: wp('5%'),
                      }}>
                      <Text
                        style={{
                          color: '#492813',
                          fontSize: 14,

                          fontFamily: 'Inter-Regular',
                        }}>
                        Menu Item Name ({modalData.menuItems.length})
                      </Text>
                      <Image
                        style={{
                          height: 18,
                          width: 18,
                          resizeMode: 'contain',
                        }}
                        source={
                          showMenuItems ? img.upArrowIcon : img.arrowDownIcon
                        }
                      />
                    </TouchableOpacity>
                    {showMenuItems ? (
                      <View>
                        {modalData && modalData.menuItems.length > 0 ? (
                          modalData.menuItems.map((item, index) => {
                            return (
                              <View
                                style={{
                                  paddingVertical: 10,
                                  paddingHorizontal: wp('5%'),
                                  flexDirection: 'row',
                                  backgroundColor: '#FFFFFF',
                                }}>
                                <View
                                  style={{
                                    alignItems: 'center',
                                  }}>
                                  <Text style={{}}>{item.name}</Text>
                                </View>
                              </View>
                            );
                          })
                        ) : (
                          <View style={{marginTop: hp('3%')}}>
                            <Text style={{color: 'red', fontSize: 20}}>
                              {translate('No data available')}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : null}
                    <ScrollView
                      style={{marginTop: hp('3%')}}
                      horizontal
                      showsHorizontalScrollIndicator={false}>
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
                                backgroundColor: '#EFFBCF',
                              }}>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#161C27',
                                    fontSize: 14,
                                  }}>
                                  Ingredient
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#161C27',
                                    fontSize: 14,
                                  }}>
                                  {translate('Quantity')}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#161C27',
                                    fontSize: 14,
                                  }}>
                                  Cost
                                </Text>
                              </View>
                            </View>
                            <View>
                              {modalData &&
                              modalData.recipeVersions[0].ingredients.length >
                                0 ? (
                                modalData.recipeVersions[0].ingredients.map(
                                  (item, index) => {
                                    return (
                                      <View
                                        style={{
                                          paddingVertical: 10,
                                          paddingHorizontal: 5,
                                          flexDirection: 'row',
                                          backgroundColor:
                                            index % 2 === 0
                                              ? '#FFFFFF'
                                              : '#F7F8F5',
                                        }}>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text style={{textAlign: 'center'}}>
                                            {item.name}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text>
                                            {item.quantity.toFixed(2)}{' '}
                                            {item.unit}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: wp('30%'),
                                            alignItems: 'center',
                                          }}>
                                          <Text>$ {item.cost.toFixed(2)}</Text>
                                        </View>
                                      </View>
                                    );
                                  },
                                )
                              ) : (
                                <View style={{marginTop: hp('3%')}}>
                                  <Text style={{color: 'red', fontSize: 20}}>
                                    {translate('No data available')}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View
                              style={{
                                paddingVertical: 15,
                                paddingHorizontal: 5,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: '#F7F8F5',
                              }}>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#161C27',
                                    fontSize: 14,
                                  }}>
                                  Total
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#161C27',
                                    fontSize: 14,
                                  }}>
                                  {translate('Quantity')}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: wp('30%'),
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#161C27',
                                    fontSize: 14,
                                  }}>
                                  Cost
                                </Text>
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                    </ScrollView>
                    <View>
                      <View
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          backgroundColor: '#FFFFFF',
                          marginTop: hp('3%'),
                        }}>
                        <View style={{paddingBottom: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-SemiBold',
                              color: '#161C27',
                              fontSize: 18,
                            }}>
                            Instructions:
                          </Text>
                        </View>
                        <View style={{borderTopWidth: 0.5, paddingTop: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              color: '#161C27',
                              fontSize: 16,
                            }}>
                            No instructions yet.
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{marginTop: hp('3%')}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <TouchableOpacity
                          style={{
                            borderWidth: 1,
                            borderRadius: 100,
                            backgroundColor: '#CECBD0',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Inter-Regular',
                              color: '#492813',
                              paddingHorizontal: 15,
                              paddingVertical: 10,
                            }}>
                            {translate('Print fiche technique')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(ViewRecipe);
