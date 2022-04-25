import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
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
  getAdvanceRecipeByIdsApi,
} from '../../connectivity/api';

import styles from './style';

import {translate} from '../../utils/translations';

class ViewRecipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      pageData: '',
      modalLoader: true,
      batchQuantity: '',
      batchUnit: '',
      recipeInstructions: '',
      recipeId: '',
      batchValue: '',
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
    const {data} = this.props.route && this.props.route.params;

    this.setState(
      {
        finalName: data.name,
        pageData: data,
        recipeId: data.recipeId,
      },
      () => this.getAdvanceRecipeData(data.recipeId),
    );
  }

  getAdvanceRecipeData = catId => {
    getAdvanceRecipeByIdsApi(catId)
      .then(res => {
        this.setState({
          modalData: res.data && res.data.recipeVersions[0].ingredients,
          modalLoader: false,
          batchQuantity: res.data && res.data.recipeVersions[0].batchQuantity,
          batchUnit: res.data && res.data.recipeVersions[0].batchUnit,
          recipeInstructions:
            res.data && res.data.recipeVersions[0].instructions,
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

  showAdvanceView = () => {
    const {recipeId} = this.state;
    this.props.navigation.navigate('MepAdvanceScreen', {
      recipeID: recipeId,
    });
  };

  viewInventoryFun = (item, index) => {
    this.props.navigation.navigate('ViewInventoryMepScreen', {
      pageData: item,
    });
  };

  editCustomPriceFun = (index, type, value, modalDataNew) => {
    if (index === 'index') {
      this.setState(
        {
          batchValue: value,
        },
        () => this.editTotalPriceFun(index, type, value, modalDataNew),
      );
    } else {
      const {modalData, batchValue, batchQuantity} = this.state;
      let finalValue = parseFloat(value);
      let finalQuantity = parseFloat(modalDataNew[index].quantity);
      let finalBatchQuantity = parseFloat(modalDataNew[index].quantity);
      let difference = finalValue / finalQuantity;
      let finalBatchValue = batchQuantity * difference;

      let newArr = modalData.map((item, i) =>
        index === i
          ? {
              ...item,
              [type]: value,
            }
          : {
              ...item,
              [type]:
                difference * item.quantity
                  ? (difference * item.quantity).toFixed(2)
                  : null,
            },
      );

      this.setState({
        modalData: [...newArr],
        batchValue: finalBatchValue ? finalBatchValue.toFixed(2) : '0',
      });
    }
  };

  editTotalPriceFun = (index, type, value, modalDataNew) => {
    const {modalData, batchQuantity, batchValue} = this.state;

    let finalValue = parseFloat(value);
    let finalBatchQuantity = batchQuantity;
    let difference = finalValue / finalBatchQuantity;
    let finalBatchValue = batchQuantity * difference;

    let newArr = modalData.map((item, i) =>
      index === i
        ? {
            ...item,
            [type]:
              difference * item.quantity
                ? (difference * item.quantity).toFixed(2)
                : null,
          }
        : {
            ...item,
            [type]:
              difference * item.quantity
                ? (difference * item.quantity).toFixed(2)
                : null,
          },
    );

    this.setState({
      modalData: [...newArr],
    });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      finalName,
      modalLoader,
      batchQuantity,
      batchUnit,
      recipeInstructions,
      batchValue,
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
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
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
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Inter-Regular',
                    color: '#523622',
                  }}>
                  {translate('Recipe name')}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#151B26',
                    fontSize: 16,
                  }}>
                  {finalName}
                </Text>
              </View>
            </View>
          </View>
          <View style={{}}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Inter-Regular',
                    color: '#523622',
                  }}>
                  {translate('Version name')}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#151B26',
                    fontSize: 16,
                  }}>
                  {finalName}
                </Text>
              </View>
            </View>
          </View>

          <View style={{}}>
            <ScrollView>
              {modalLoader ? (
                <ActivityIndicator size="large" color="#94C036" />
              ) : (
                <View
                  style={{
                    padding: hp('2%'),
                  }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                              backgroundColor: '#EFFBCF',
                            }}>
                            <View
                              style={{
                                width: wp('25%'),
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                Ingredient
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('25%'),
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                {translate('Quantity')}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('25%'),
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'Inter-SemiBold',
                                }}>
                                Custom
                              </Text>
                            </View>
                            {/* <View
                              style={{
                                width: wp('15%'),
                                alignItems: 'center',
                              }}></View> */}
                          </View>
                          <View>
                            {modalData && modalData.length > 0 ? (
                              modalData.map((item, index) => {
                                let finaUnitVal =
                                  item &&
                                  item.units.map((subItem, subIndex) => {
                                    if (subItem.isDefault === true) {
                                      return subItem.name;
                                    }
                                  });
                                const filteredUnit = finaUnitVal.filter(
                                  elm => elm,
                                );
                                return (
                                  <View
                                    style={{
                                      paddingVertical: 10,
                                      paddingHorizontal: 5,
                                      flexDirection: 'row',
                                      backgroundColor:
                                        index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                                    }}>
                                    <View
                                      style={{
                                        width: wp('25%'),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <Text
                                        style={{
                                          textAlign: 'center',
                                          fontSize: 12,
                                        }}>
                                        {item.name}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        width: wp('25%'),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      <Text style={{fontSize: 12}}>
                                        {item.quantity} {filteredUnit[0]}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        width: wp('25%'),
                                        alignItems: 'center',
                                      }}>
                                      <TextInput
                                        placeholder="0"
                                        value={
                                          item.customPrice &&
                                          item.customPrice.toString()
                                        }
                                        style={{
                                          borderWidth: 0.8,
                                          paddingVertical: 8,
                                          paddingLeft: 10,
                                          width: wp('18%'),
                                          borderRadius: 4,
                                        }}
                                        onChangeText={value => {
                                          this.editCustomPriceFun(
                                            index,
                                            'customPrice',
                                            value,
                                            modalData,
                                          );
                                        }}
                                      />
                                    </View>
                                    {/* <TouchableOpacity
                                      onPress={() =>
                                        this.viewInventoryFun(item, index)
                                      }
                                      style={{
                                        width: wp('15%'),
                                        alignItems: 'center',
                                        backgroundColor: '#94C036',
                                        padding: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                      }}>
                                      <Image
                                        source={img.beakerIcon}
                                        style={{
                                          height: 18,
                                          width: 18,
                                          resizeMode: 'contain',
                                        }}
                                      />
                                    </TouchableOpacity> */}
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
                          <View
                            style={{
                              paddingVertical: 15,
                              paddingHorizontal: 5,
                              flexDirection: 'row',
                              backgroundColor: '#EFFBCF',
                            }}>
                            <View
                              style={{
                                width: wp('25%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 12,
                                }}>
                                Total
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('25%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 12,
                                }}>
                                {batchQuantity} {batchUnit}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: wp('25%'),
                                alignItems: 'center',
                              }}>
                              <TextInput
                                placeholder="0"
                                onChangeText={value => {
                                  this.editCustomPriceFun(
                                    'index',
                                    'customPrice',
                                    value,
                                    modalData,
                                  );
                                }}
                                style={{
                                  borderWidth: 0.8,
                                  paddingVertical: 8,
                                  paddingLeft: 10,
                                  width: wp('18%'),
                                  borderRadius: 4,
                                }}
                                value={batchValue.toString()}
                              />
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  </ScrollView>
                </View>
              )}
              <View
                style={{
                  backgroundColor: '#fff',
                  marginHorizontal: 18,
                  borderRadius: 6,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: wp('5%'),
                    marginVertical: hp('2%'),
                    borderBottomWidth: 1,
                    paddingBottom: 5,
                    borderBottomColor: '#0000001A',
                  }}>
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Inter-Regular',
                        color: '#151B26',
                      }}>
                      {translate('Instructions')}:
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: wp('5%'),
                    marginBottom: hp('2%'),
                  }}>
                  <Text
                    style={{
                      color: '#94C01F',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {recipeInstructions}
                  </Text>
                </View>
              </View>
              {/* <View>
                <View
                  style={{
                    marginTop: hp('2%'),
                  }}>
                  <TouchableOpacity
                    onPress={() => this.showAdvanceView()}
                    style={{
                      height: hp('5%'),
                      alignSelf: 'center',
                      paddingHorizontal: 10,
                      backgroundColor: '#94C036',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 100,
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                      {translate('Advance view')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => alert('print')}
                    style={{
                      height: hp('5%'),
                      paddingHorizontal: 10,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: wp('2%'),
                      borderRadius: 100,
                      backgroundColor: '#CECBD0',
                      marginTop: hp('2%'),
                    }}>
                    <Text
                      style={{
                        color: '#482813',
                        fontSize: 15,
                        fontWeight: 'bold',
                      }}>
                      {translate('Print fiche technique')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View> */}
            </ScrollView>
          </View>
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
