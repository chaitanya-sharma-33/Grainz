import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Switch,
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
import {translate} from '../../utils/translations';
import styles from './style';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      modalVisibleAdd: false,
      activeSections: [],
      SECTIONS: [],
      recipeLoader: true,
      modalVisibleRecipeDetails: false,
      sectionData: {},
      isMakeMeStatus: true,
      makeMeText: 'Make me',
      SECTIONS_HISTORY: [],
      activeSectionsHistory: [],
      recipeLoaderHistory: true,
      isDatePickerVisible: false,
      finalDate: '',
      selectectedItems: [],
      isShownPicker: false,
      items: [],
      productionDate: '',
      applyStatus: false,
      detailsLoader: false,
      quantity: '',
      notes: '',
      advanceDetailsLoader: true,
      sectionAdvanceData: {},
      buttonsSubHeader: [],
    };
  }

  getProfileDataFun = async () => {
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
          firstName: res.data.firstName,
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getProfileDataFun();
    this.setState(
      {
        recipeID: this.props.route && this.props.route.params.recipeID,
      },
      () => this.getAdvanceRecipeDetails(),
    );
  }

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    if (item.name === 'Edit') {
      alert('Edit');
    } else if (item.name === 'Back') {
      this.props.navigation.goBack();
    }
  };

  getAdvanceRecipeDetails = () => {
    const {recipeID} = this.state;
    this.setState(
      {
        advanceDetailsLoader: true,
      },
      () =>
        getAdvanceRecipeByIdsApi(recipeID)
          .then(res => {
            this.setState({
              sectionAdvanceData: res.data,
              advanceDetailsLoader: false,
            });
          })
          .catch(err => {
            this.setState({
              advanceDetailsLoader: false,
            });
            console.warn('ERR', err);
          }),
    );
  };

  render() {
    const {
      firstName,
      advanceDetailsLoader,
      sectionAdvanceData,
      recipeLoader,
      notes,
      buttonsSubHeader,
    } = this.state;
    return (
      <View style={styles.container}>
        <Header
          logout={firstName}
          logoutFun={this.myProfileFun}
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
          <View style={{}}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Recipe name')}
                </Text>
              </View>
              <View style={styles.goBackContainer}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter-Regular',
                    color: '#523622',
                  }}>
                  {sectionAdvanceData.name}
                </Text>
              </View>
            </View>
          </View>
          <View style={{}}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Version name')}
                </Text>
              </View>
              <View style={styles.goBackContainer}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter-Regular',
                    color: '#523622',
                  }}>
                  {sectionAdvanceData.name}
                </Text>
              </View>
            </View>
          </View>

          <View style={{}}>
            <View style={styles.firstContainer}>
              <TouchableOpacity
                onPress={() => alert('edit')}
                style={{
                  height: 110,
                  width: 110,
                  borderRadius: 6,
                  backgroundColor: '#fff',
                }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={img.editIconGreen}
                    style={{width: 30, height: 30, resizeMode: 'contain'}}
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
                      fontSize: 16,
                      fontFamily: 'Inter-Regular',
                      color: '#000000',
                    }}>
                    {translate('Edit')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {advanceDetailsLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <ScrollView>
              <View style={{padding: hp('3%')}}>
                <View style={{marginTop: 10}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                    }}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text
                        style={{
                          color: '#4C4B4B',
                          fontWeight: 'bold',
                        }}>
                        Ingredient
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text style={{color: '#212529'}}>
                        {translate('Quantity')}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: '#E5E5E5',
                      marginVertical: hp('1%'),
                    }}></View>
                  {Object.keys(sectionAdvanceData).length !== 0
                    ? sectionAdvanceData.recipeVersions[0].ingredients.map(
                        item => {
                          return (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 10,
                              }}>
                              <View
                                style={{
                                  flex: 1,
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    color: '#4C4B4B',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                  }}>
                                  {item.name}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flex: 1,
                                  alignItems: 'center',
                                }}>
                                <Text style={{color: '#212529'}}>
                                  {item.quantity} g
                                </Text>
                              </View>
                            </View>
                          );
                        },
                      )
                    : null}

                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: '#E5E5E5',
                      marginVertical: hp('1%'),
                    }}></View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                    }}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text
                        style={{
                          color: '#4C4B4B',
                          fontWeight: 'bold',
                        }}>
                        Total
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text style={{color: '#212529'}}>50 g</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      marginTop: hp('2%'),
                      height: hp('20%'),
                      borderColor: '#C9CCD7',
                      borderRadius: 6,
                    }}>
                    <Text>
                      {Object.keys(sectionAdvanceData).length !== 0
                        ? sectionAdvanceData.recipeVersions[0].instructions
                        : null}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => alert('Print Done')}
                  style={{
                    width: wp('50%'),
                    height: hp('5%'),
                    backgroundColor: '#E2E6EA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginTop: hp('2%'),
                    borderRadius: 100,
                  }}>
                  <Text
                    style={{
                      color: '#64686C',
                      fontSize: 15,
                      fontWeight: 'bold',
                    }}>
                    Print fiche technique
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(index);
