import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../../constants/images';
import SubHeader from '../../../../../components/SubHeader';
import Header from '../../../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  lookupInsideCategoriesApi,
  mapProductAdminApi,
} from '../../../../../connectivity/api';
import LoaderComp from '../../../../../components/Loader';
import styles from '../style';

import {translate} from '../../../../../utils/translations';

class MapProductsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      sectionName: '',
      modalLoader: true,
      searchItem: '',
      modalDataBackup: [],
      modalData: [],
      productId: '',
      loaderCompStatus: false,
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
    const {item, section, inventoryId} =
      this.props.route && this.props.route.params;
    this.setState(
      {
        sectionName: section.title,
        finalName: item.name,
        productId: inventoryId,
      },
      () => this.getInsideCatFun(item.id),
    );
  }

  getInsideCatFun = catId => {
    lookupInsideCategoriesApi(catId)
      .then(res => {
        this.setState({
          modalData: res.data,
          modalLoader: false,
          modalDataBackup: res.data,
        });
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  mapKnowFun = item => {
    Alert.alert('Grainz', 'Would you like to map this product?', [
      {
        text: 'Yes',
        onPress: () =>
          this.setState(
            {
              loaderCompStatus: true,
            },
            () => this.hitMapApi(item),
          ),
      },
      {
        text: 'No',
      },
    ]);
  };

  hitMapApi = item => {
    let payload = {
      inventoryId: item.id,
      productId: this.state.productId,
    };
    mapProductAdminApi(payload)
      .then(res => {
        this.setState({
          loaderCompStatus: false,
        });
        Alert.alert('Grainz', 'Product mapped successfully', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  searchFun = txt => {
    this.setState(
      {
        searchItem: txt,
      },
      () => this.filterData(txt),
    );
  };

  filterData = text => {
    //passing the inserted text in textinput
    const newData = this.state.modalDataBackup.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      modalData: newData,
      searchItem: text,
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
      searchItem,
      loaderCompStatus,
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
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}
        <LoaderComp loaderComp={loaderCompStatus} />
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}> {sectionName}</Text>
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
          <View
            style={{
              borderWidth: 0.4,
              height: hp('7%'),
              width: wp('70%'),
              borderRadius: 100,
              backgroundColor: '#fff',
              alignSelf: 'center',
              marginVertical: hp('2%'),
              justifyContent: 'center',
              paddingLeft: 15,
            }}>
            <TextInput
              placeholder="Search..."
              placeholderTextColor="grey"
              value={searchItem}
              style={{
                width: wp('60%'),
                paddingVertical: 10,
              }}
              onChangeText={value => this.searchFun(value)}
            />
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
                    <ScrollView
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
                                <Text style={{textAlign: 'center'}}>
                                  {finalName}
                                </Text>
                              </View>
                            </View>
                            <View>
                              {modalData && modalData.length > 0 ? (
                                modalData.map((item, index) => {
                                  return (
                                    <View
                                      key={index}
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
                                          justifyContent: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            textAlign: 'center',
                                          }}>
                                          {item.name}
                                        </Text>
                                      </View>

                                      <View
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}></View>
                                      <TouchableOpacity
                                        onPress={() => this.mapKnowFun(item)}
                                        style={{
                                          width: wp('30%'),
                                          alignItems: 'center',
                                          backgroundColor: '#94C036',
                                          justifyContent: 'center',
                                          borderRadius: 100,
                                          height: hp('5%'),
                                        }}>
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Regular',
                                            color: '#fff',
                                          }}>
                                          Map now
                                        </Text>
                                      </TouchableOpacity>
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
                          </View>
                        </ScrollView>
                      </View>
                    </ScrollView>
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

export default connect(mapStateToProps, {UserTokenAction})(MapProductsList);
