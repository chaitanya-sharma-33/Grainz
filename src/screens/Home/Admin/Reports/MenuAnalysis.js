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
  Alert,
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
  menuAnalysisAdminApi,
} from '../../../../connectivity/api';
import Modal from 'react-native-modal';
import Accordion from 'react-native-collapsible/Accordion';
import moment from 'moment';
import styles from './style';
import CheckBox from '@react-native-community/checkbox';

import {translate} from '../../../../utils/translations';

class MenuAnalysis extends Component {
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
      SECTIONS_BACKUP: [],
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
    menuAnalysisAdminApi()
      .then(res => {
        const {menus, location} = res.data;

        const name = location;

        let finalArray = menus.map((item, index) => {
          const finalArr = [];
          item.categories.map(subItem => {
            finalArr.push({
              title: subItem.name,
              content: subItem.menuItems,
              status: false,
            });
          });

          return {
            title: item.name,
            content: [...finalArr],
            inUse: item.inUse,
          };
        });

        const result = finalArray;

        this.setState({
          SECTIONS: [...result],
          menuAnalysisLoader: false,
          locationName: name,
          SECTIONS_SEC: [...result],
          recipeLoader: false,
        });
      })
      .catch(err => {
        this.setState({
          gmReportsArrStatus: false,
          menuAnalysisLoader: false,
        });
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getData();
    this.getManualLogsData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
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
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 15,
          }}>
          <Text
            style={{
              color: '#492813',
              fontSize: 14,
              fontFamily: 'Inter-Regular',
            }}>
            {translate('In use')}?
          </Text>
          <CheckBox
            value={section.inUse}
            // onValueChange={() =>
            //   this.setState({htvaIsSelected: !htvaIsSelected})
            // }
            style={{
              margin: 5,
              height: 20,
              width: 20,
            }}
          />
        </View>
      </View>
    );
  };
  openListFun = (index, section, sta, item) => {
    this.props.navigation.navigate('MenuAnalysisSec', {
      index,
      section,
      sta,
      item,
    });
  };

  _renderContent = section => {
    return (
      <View>
        {section.content.map((item, index) => {
          return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.openListFun(index, section, 'status', item)
                  }
                  style={{
                    borderWidth: 1,
                    paddingVertical: 15,
                    paddingHorizontal: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    borderRadius: 6,
                  }}>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>{item.title}</Text>
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
                </TouchableOpacity>
              </View>
            </ScrollView>
          );
        })}
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState({
      activeSections,
    });
  };

  render() {
    const {
      recipeLoader,
      SECTIONS,
      activeSections,
      firstName,
      buttonsSubHeader,
    } = this.state;

    return (
      <View style={styles.container}>
        <Header
          logout={firstName}
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
                <Text style={styles.adminTextStyle}>
                  {translate('Menu Analysis')}
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
            <View style={{marginHorizontal: wp('5%')}}>
              <Accordion
                expandMultiple
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

export default connect(mapStateToProps, {UserTokenAction})(MenuAnalysis);
