import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
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
  getSupplierListSetupApi,
} from '../../../../connectivity/api';
import moment from 'moment';
import styles from './style';

import {translate} from '../../../../utils/translations';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      buttonsSubHeader: [],
      finalName: '',
      modalLoaderDrafts: true,
      draftsOrderData: [],
      draftsOrderDataBackup: [],
      searchItem: '',
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
    this.getDraftOrderData();
  }

  getDraftOrderData = () => {
    getSupplierListSetupApi()
      .then(res => {
        this.setState({
          draftsOrderData: res.data,
          draftsOrderDataBackup: res.data,
          modalLoaderDrafts: false,
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
    const newData = this.state.draftsOrderDataBackup.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      draftsOrderData: newData,
      searchItem: text,
    });
  };

  viewSupplierFun = () => {
    this.props.navigation.navigate('ViewSupplierScreen');
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalLoaderDrafts,
      draftsOrderData,
      searchItem,
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
                  {translate('Suppliers List')}
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              height: hp('7%'),
              width: wp('90%'),
              borderRadius: 100,
              backgroundColor: '#fff',
              alignSelf: 'center',
              justifyContent: 'space-between',
            }}>
            <TextInput
              placeholder="Search"
              value={searchItem}
              style={{
                padding: 15,
                width: wp('75%'),
              }}
              onChangeText={value => this.searchFun(value)}
            />
            <Image
              style={{
                height: 18,
                width: 18,
                resizeMode: 'contain',
                marginRight: wp('5%'),
              }}
              source={img.searchIcon}
            />
          </View>

          {recipeLoader ? (
            <ActivityIndicator size="small" color="#94C036" />
          ) : (
            <View style={{marginTop: hp('3%')}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalLoaderDrafts ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      marginHorizontal: wp('4%'),
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flex: 1,
                        backgroundColor: '#EFFBCF',
                        paddingVertical: hp('3%'),
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                        paddingHorizontal: wp('5%'),
                      }}>
                      <View style={{}}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Supplier
                        </Text>
                      </View>
                      <View style={{}}>
                        <Text
                          style={{
                            color: '#161C27',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Action
                        </Text>
                      </View>
                    </View>
                    {draftsOrderData &&
                      draftsOrderData.map((item, index) => {
                        return (
                          <View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                                backgroundColor:
                                  index % 2 === 0 ? '#FFFFFF' : '#F7F8F5',
                                paddingVertical: hp('3%'),
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                                paddingHorizontal: wp('5%'),
                              }}>
                              <View style={{marginTop: 10}}>
                                <Text style={{}}>{item.name}</Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => this.viewSupplierFun()}
                                style={{
                                  backgroundColor: '#C9F9C5',
                                  paddingHorizontal: 10,
                                  paddingVertical: 10,
                                }}>
                                <Text>View</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
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

export default connect(mapStateToProps, {UserTokenAction})(index);
