import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
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
  getManualLogList,
  deleteManualLog,
  updateManualLogApi,
} from '../../connectivity/api';
import Accordion from 'react-native-collapsible/Accordion';
import moment from 'moment';
import {translate} from '../../utils/translations';
import styles from './style';
import {ARRAY} from '../../constants/dummy';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      activeSections: [],
      SECTIONS: [],
      recipeLoader: false,
      modalVisibleRecipeDetails: false,
      isMakeMeStatus: true,
      recipeID: '',
      selectedItems: [],
      loading: false,
      buttonsSubHeader: [],
      collapseStatus: true,
    };
  }

  componentDidMount() {
    this.getData();
    this.props.navigation.addListener('focus', () => {
      this.getManualLogsData();
    });
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
    getManualLogList()
      .then(res => {
        function extract() {
          var groups = {};

          res.data.forEach(function (val) {
            var date = val.loggedDate.split('T')[0];
            if (date in groups) {
              groups[date].push(val);
            } else {
              groups[date] = new Array(val);
            }
          });

          return groups;
        }

        let final = extract();

        let finalArray = Object.keys(final).map((item, index) => {
          return {
            title: item,
            content: final[item],
          };
        });

        const result = finalArray.reduce((temp, value) => {
          if (temp.length < 5) temp.push(value);
          return temp;
        }, []);

        this.setState({
          SECTIONS: [...result],
          recipeLoader: false,
        });
      })
      .catch(err => {
        console.log('ERR MEP', err);

        this.setState({
          recipeLoader: false,
        });
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  addNewFun = item => {
    this.props.navigation.navigate('AddManualLogScreen');
  };

  onPressCollapseFun = () => {
    this.setState({
      activeSections: [],
      collapseStatus: true,
    });
  };

  onPressUnCollapseFun = () => {
    this.setState({
      activeSections: ARRAY,
      collapseStatus: false,
    });
  };

  _renderHeader = (section, index, isActive) => {
    var todayFinal = moment(new Date()).format('dddd, MMM DD YYYY');

    const finalData = moment(section.title).format('dddd, MMM DD YYYY');

    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: '#F0F0F0',
          borderLeftColor: '#F0F0F0',
          borderRightWidth: 1,
          borderRightColor: '#F0F0F0',
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
            fontSize: 15,
            marginLeft: wp('2%'),
            fontFamily: 'Inter-Regular',
          }}>
          {todayFinal === finalData ? 'Today' : finalData}
        </Text>
      </View>
    );
  };

  updateReviewedStatusFun = section => {
    let payload = {
      id: section.id,
      itemId: section.itemId,
      name: section.name,
      loggedDate: section.loggedDate,
      quantity: section.quantity,
      itemTypeId: section.itemTypeId,
      typeId: section.typeId,
      departmentId: section.departmentId,
      unitId: section.unitId,
      departmentName: section.departmentName,
      category: section.category,
      itemTypeName: section.itemTypeName,
      typeName: section.typeName,
      reviewed: !section.reviewed,
      unit: section.unit,
      userId: section.userId,
      userFullName: section.userFullName,
      units: [
        {
          id: section.units[0].id,
          inventoryId: section.units[0].inventoryId,
          name: section.units[0].name,
          isDefault: true,
          isVariable: false,
          quantity: null,
          converter: 1,
          notes: null,
          action: null,
        },
      ],
      notes: section.notes,
      inUse: section.inUse,
      countInInventory: section.countInInventory,
    };
    updateManualLogApi(payload)
      .then(res => {
        this.setState(
          {
            modalVisibleRecipeDetails: false,
          },
          () => this.getManualLogsData(),
        );
      })
      .catch(err => {
        console.warn('ERRUPDATE', err.response);
      });
  };

  _renderContent = section => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{backgroundColor: '#fff'}}>
          {section.content.map((item, index) => {
            let finaUnitVal =
              item &&
              item.units.map((subItem, subIndex) => {
                if (subItem.isDefault === true) {
                  return subItem.name;
                }
              });
            const filteredUnit = finaUnitVal.filter(elm => elm);
            return (
              <View style={{paddingHorizontal: 10}} key={index}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Switch
                    style={{}}
                    trackColor={{
                      false: '#767577',
                      true: '#94C036',
                    }}
                    value={!item.reviewed}
                    onValueChange={() => this.updateReviewedStatusFun(item)}
                    thumbColor="#fff"
                  />
                  <View style={{marginLeft: wp('2%'), width: wp('20%')}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('EditManualLogScreen', {
                          manualId: item.id,
                        })
                      }>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          textAlign: 'center',
                        }}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{alignItems: 'center', width: wp('20%')}}>
                    <Text
                      style={{
                        fontSize: 14,
                      }}>
                      {item.quantity} {item.unit ? item.unit : filteredUnit[0]}
                    </Text>
                  </View>
                  <View style={{alignItems: 'center', width: wp('20%')}}>
                    <Text
                      style={{
                        fontSize: 14,
                      }}>
                      {item.typeName}
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      width: wp('20%'),
                      marginLeft: wp('2%'),
                    }}>
                    <TouchableOpacity
                      onPress={() => this.deleteMepFun(item)}
                      style={{
                        backgroundColor: 'red',
                        padding: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: wp('15%'),
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={img.deleteIconNew}
                        style={{
                          height: 15,
                          width: 15,
                          tintColor: 'white',
                          resizeMode: 'contain',
                        }}
                      />
                      {/* <Text
                        style={{
                          fontSize: 14,
                          color: '#fff',
                          textAlign: 'center',
                        }}>
                        Delete
                      </Text> */}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{marginVertical: hp('1%')}}>
                  <Text
                    style={{
                      marginLeft: wp('18%'),
                      fontSize: 12,
                      color: 'grey',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {item.notes}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  _updateSections = activeSections => {
    this.setState({
      activeSections,
    });
  };

  toggleSwitchNotif = data => {
    this.setState(
      {
        modalVisibleRecipeDetails: false,
      },
      () => this.updateReviewedStatusFun(data),
    );
  };

  deleteMepFunSec = section => {
    let payload = {
      id: section.id,
      itemId: section.itemId,
      name: section.name,
      loggedDate: section.loggedDate,
      quantity: section.quantity,
      itemTypeId: section.itemTypeId,
      typeId: section.typeId,
      departmentId: section.departmentId,
      unitId: section.unitId,
      departmentName: section.departmentName,
      category: section.category,
      itemTypeName: section.itemTypeName,
      typeName: section.typeName,
      reviewed: section.reviewed,
      unit: section.unit,
      userId: section.userId,
      userFullName: section.userFullName,
      units: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          inventoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'string',
          isDefault: true,
          isVariable: true,
          quantity: 0,
          converter: 0,
          notes: 'string',
          action: 'string',
        },
      ],
      notes: section.notes,
      inUse: section.inUse,
      countInInventory: section.countInInventory,
    };
    deleteManualLog(payload)
      .then(res => {
        this.setState(
          {
            modalVisibleRecipeDetails: false,
          },
          () => this.getManualLogsData(),
        );
      })
      .catch(err => {
        console.warn('ERRDeleteMep', err.response);
      });
  };

  deleteMepFun = data => {
    Alert.alert('Are you sure?', "You won't be able to revert this!", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => this.deleteMepFunSec(data)},
    ]);
  };

  render() {
    const {
      recipeLoader,
      SECTIONS,
      activeSections,
      firstName,
      buttonsSubHeader,
      collapseStatus,
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
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <View style={{flex: 1}}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Manual Log small')}
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
          </View>
          <TouchableOpacity
            onPress={() => this.addNewFun()}
            style={{
              height: hp('6%'),
              width: wp('80%'),
              backgroundColor: '#94C036',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('2%'),
              borderRadius: 100,
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={img.addIcon}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: '#fff',
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  color: 'white',
                  marginLeft: 10,
                  fontFamily: 'Inter-SemiBold',
                }}>
                {translate('Add new')}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              {collapseStatus ? (
                <TouchableOpacity
                  style={{flex: 1}}
                  onPress={() => this.onPressUnCollapseFun()}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Uncollapse All')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{flex: 1}}
                  onPress={() => this.onPressCollapseFun()}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Collapse All')}
                  </Text>
                </TouchableOpacity>
              )}
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

export default connect(mapStateToProps, {UserTokenAction})(index);
