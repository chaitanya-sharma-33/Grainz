import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
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
  lookupDepartmentsApi,
  lookupCategoriesApi,
} from '../../../../connectivity/api';
import Accordion from 'react-native-collapsible/Accordion';
import styles from './style';

import {translate} from '../../../../utils/translations';

class Inventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      activeSections: [],
      SECTIONS: [],
      recipeLoader: false,
      sectionData: {},
      isMakeMeStatus: true,
      productionDate: '',
      recipeID: '',
      selectedItems: [],
      items: [],
      departmentName: '',
      itemTypes: '',
      loading: false,
      selectedItemObjects: '',
      buttonsSubHeader: [],
      finalName: '',
      SECTIONS_SEC: [],
      modalVisibleSetup: false,
      modalData: [],
      modalLoader: false,
      sectionName: '',
      categoryLoader: false,
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
          firstName: res.data.firstName,
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

  getManualLogsData = () => {
    this.setState(
      {
        recipeLoader: true,
      },
      () => this.createFirstData(),
    );
  };

  createFirstData = () => {
    lookupDepartmentsApi()
      .then(res => {
        let finalArray = res.data.map((item, index) => {
          return {
            title: item.name,
            content: item.id,
          };
        });

        const result = finalArray;

        this.setState({
          SECTIONS: [...result],
          recipeLoader: false,
          SECTIONS_SEC: [...result],
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);

        this.setState({
          recipeLoader: false,
        });
      });
  };

  componentDidMount() {
    this.getData();
    this.getManualLogsData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  _renderHeader = (section, index, isActive) => {
    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          borderWidth: 0.5,
          borderColor: '#F0F0F0',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
          borderRadius: 6,
        }}>
        <Image
          style={{
            height: 18,
            width: 18,
            resizeMode: 'contain',
            marginLeft: wp('2%'),
          }}
          source={isActive ? img.upArrowIcon : img.arrowRightIcon}
        />
        <Text
          style={{
            color: '#492813',
            fontSize: 14,
            marginLeft: wp('2%'),
            fontFamily: 'Inter-Regular',
          }}>
          {section.title}
        </Text>
      </View>
    );
  };

  openListFun = (item, index, section) => {
    this.props.navigation.navigate('InventoryAdminSec', {
      item,
      section,
    });
  };

  _renderContent = section => {
    const {categoryLoader, catArray} = this.state;
    return (
      <View>
        {categoryLoader ? (
          <ActivityIndicator size="large" color="#94C036" />
        ) : (
          <View>
            {catArray &&
              catArray.map((item, index) => {
                return (
                  // <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <TouchableOpacity
                      onPress={() => this.openListFun(item, index, section)}
                      style={{
                        borderWidth: 1,
                        paddingVertical: 15,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        width: wp('89%'),
                        borderRadius: 6,
                        borderColor: '#00000099',
                      }}>
                      <View
                        style={
                          {
                            // width: wp('25%'),
                            // alignItems: 'center',
                          }
                        }>
                        <Text
                          style={{textAlign: 'center', color: '#161C27'}}
                          numberOfLines={1}>
                          {item.name}{' '}
                        </Text>
                      </View>
                      <View
                        style={
                          {
                            // width: wp('25%'),
                            // alignItems: 'center',
                          }
                        }>
                        <Text style={{textAlign: 'center', color: '#161C27'}}>
                          Current inventory
                        </Text>
                      </View>
                      <View
                        style={
                          {
                            // width: wp('25%'),
                            // alignItems: 'center',
                          }
                        }>
                        <Text style={{textAlign: 'center', color: '#161C27'}}>
                          On Order
                        </Text>
                      </View>
                      {/* <View
                          style={{
                            width: wp('30%'),
                            alignItems: 'center',
                          }}>
                          <Text>Events(+7d)</Text>
                        </View>
                        <View
                          style={{
                            width: wp('30%'),
                            alignItems: 'center',
                          }}>
                          <Text>Target</Text>
                        </View>
                        <View
                          style={{
                            width: wp('30%'),
                            alignItems: 'center',
                          }}>
                          <Text>Delta</Text>
                        </View>
                        <View
                          style={{
                            width: wp('30%'),
                            alignItems: 'center',
                          }}>
                          <Text>Order Now</Text>
                        </View> */}
                    </TouchableOpacity>
                  </View>
                  // </ScrollView>
                );
              })}
          </View>
        )}
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState(
      {
        activeSections,
        categoryLoader: true,
      },
      () => this.updateSubFun(),
    );
  };

  updateSubFun = () => {
    const {SECTIONS, activeSections} = this.state;
    if (activeSections.length > 0) {
      const deptId = SECTIONS[activeSections].content;
      lookupCategoriesApi(deptId)
        .then(res => {
          this.setState({
            catArray: res.data,
            categoryLoader: false,
          });
        })
        .catch(err => {
          console.log('ERR', err);
        });
    } else {
      this.setState({
        activeSections: [],
        categoryLoader: false,
      });
    }
  };

  setAdminModalVisible = visible => {
    this.setState({
      modalVisibleSetup: visible,
    });
  };

  render() {
    const {recipeLoader, SECTIONS, activeSections, buttonsSubHeader} =
      this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator color="#94C036" size="small" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Inventory Level')}
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
            <View style={{marginTop: hp('2%'), marginHorizontal: wp('5%')}}>
              <Accordion
                underlayColor="#fff"
                sections={SECTIONS}
                activeSections={activeSections}
                renderHeader={this._renderHeader}
                renderContent={this._renderContent}
                onChange={this._updateSections}
              />
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

export default connect(mapStateToProps, {UserTokenAction})(Inventory);
