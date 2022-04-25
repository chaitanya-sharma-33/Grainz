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
  lookupInventoryApi,
  getStockDataApi,
} from '../../connectivity/api';
import Accordion from 'react-native-collapsible/Accordion';
import styles from './style';
import moment from 'moment';

import {translate} from '../../utils/translations';

class CategoryStockScreen extends Component {
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
      modalVisibleSetup: false,
      modalData: [],
      modalLoader: false,
      sectionName: '',
      categoryLoader: false,
      departmentId: '',
      pageDate: '',
      arrangeStatusName: 0,
      topValueStatus: '',
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
    const {departmentId, activeSections} = this.state;
    lookupInventoryApi(departmentId)
      .then(res => {
        let finalArray = res.data.map((item, index) => {
          return {
            title: item.name,
            content: item.id,
          };
        });

        const result = finalArray;

        this.setState(
          {
            SECTIONS: [...result],
            recipeLoader: false,
            activeSections,
          },
          () => this.updateSubFun(),
        );
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
    const {departmentId, pageDate, topValue, topValueStatus} =
      this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          departmentId,
          pageDate,
          topValue,
          topValueStatus,
          categoryLoader: true,
        },
        () => this.getManualLogsData(),
      );
    });
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

  editUnitsFun = item => {
    const {pageDate, departmentId, categoryId, topValueStatus, activeSections} =
      this.state;
    this.props.navigation.navigate('EditStockScreen', {
      item,
      pageDate,
      inventoryId: item.inventoryId,
      departmentId,
      categoryId,
      screenType: 'New',
      topValueStatus,
      activeSections,
    });
    // this.setState(
    //   {
    //     // activeSections: [],
    //     // SECTIONS: [],
    //   },
    //   () =>
    //     setTimeout(() => {
    //       this.props.navigation.navigate('EditStockScreen', {
    //         item,
    //         pageDate,
    //         inventoryId: item.inventoryId,
    //         departmentId,
    //         categoryId,
    //         screenType: 'New',
    //         topValueStatus,
    //       });
    //     }, 300),
    // );
  };

  arrangeListFun = funType => {
    if (funType === 'NAME') {
      this.setState(
        {
          arrangeStatusName: Number(1) + this.state.arrangeStatusName,
        },
        () => this.arrangeListFunSec('NAME'),
      );
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusName} = this.state;
    const finalData = type === 'NAME' ? arrangeStatusName : null;
    if (finalData % 2 == 0) {
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  reverseFun = () => {
    const {catArray} = this.state;
    console.log('catAA', catArray);
    const finalData = catArray.reverse();

    this.setState({
      catArray: finalData,
    });
  };

  descendingOrderFun = type => {
    const {catArray} = this.state;
    console.log('catAA', catArray);

    if (type === 'NAME') {
      function dynamicSort(property) {
        var sortOrder = 1;

        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }

        return function (a, b) {
          if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
          } else {
            return a[property].localeCompare(b[property]);
          }
        };
      }
      const finalKeyValue = type === 'NAME' ? 'name' : null;

      const finalData = catArray.sort(dynamicSort(finalKeyValue));

      this.setState({
        catArray: finalData,
      });
    }
  };

  _renderContent = section => {
    const {categoryLoader, catArray} = this.state;
    return (
      // <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={{
          backgroundColor: '#fff',
          marginVertical: hp('3%'),
        }}>
        <View
          style={{
            flexDirection: 'row',
            paddingBottom: 15,
            marginHorizontal: wp('5%'),
          }}>
          <TouchableOpacity
            style={{...styles.boxSizeNew}}
            onPress={() => this.arrangeListFun('NAME')}>
            <Text style={styles.boxTextHeadingStyling}>
              {translate('Name')}
            </Text>
            <View style={{padding: 5}}>
              <Image
                style={styles.listImageStyling}
                source={img.doubleArrowIconNew}
              />
            </View>
          </TouchableOpacity>
          <View
            style={{
              ...styles.boxSize,
              marginLeft: wp('3%'),
            }}>
            <Text style={styles.boxTextHeadingStyling}>
              {translate('Stock Take')}
            </Text>
          </View>
          <View
            style={{
              width: wp('12%'),
            }}></View>
          <View style={{...styles.boxSize, marginLeft: wp('2%')}}>
            <Text style={styles.boxTextHeadingStyling}>
              {translate('System says')}
            </Text>
          </View>
          {/* <View style={{...styles.boxSize, marginLeft: wp('2%')}}>
            <Text style={styles.boxTextHeadingStyling}>Correction</Text>
          </View> */}
        </View>
        {categoryLoader ? (
          <ActivityIndicator size="large" color="#94C036" />
        ) : (
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {catArray && catArray.length > 0 ? (
              catArray.map((item, index) => {
                let finaUnitVal =
                  item &&
                  item.units.map((subItem, subIndex) => {
                    if (subItem.isDefault === true) {
                      return subItem.name;
                    }
                  });
                const filteredUnit = finaUnitVal.filter(elm => elm);
                return (
                  <View>
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        borderTopWidth: 1,
                        paddingVertical: 10,
                        marginHorizontal: wp('5%'),
                        borderTopColor: '#0000001A',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <View
                          style={{
                            width: wp('25%'),
                            justifyContent: 'center',
                          }}
                          // onPress={() =>
                          //   this.expandScreenFun(item, index)
                          // }
                        >
                          <Text
                            style={{
                              ...styles.boxTextDataStyling,
                              fontWeight: 'bold',
                            }}>
                            {item.name && item.name}
                          </Text>
                          {item.stockTakeLastUpdate ? (
                            <Text
                              style={{
                                fontSize: 12,
                                color: '#161C27',
                                fontFamily: 'Inter-Regular',
                                marginTop: hp('2%'),
                              }}>
                              {moment(item.stockTakeLastUpdate).format(
                                'DD/MM/YYYY',
                              )}
                            </Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          onPress={() => this.editUnitsFun(item)}
                          style={{
                            ...styles.boxSizeSec,
                            marginLeft: wp('3%'),
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: item.quantity
                              ? '#E9ECEF'
                              : '#FDF851',
                            height: 35,
                            alignSelf: 'center',
                          }}>
                          <Text style={styles.boxTextDataStyling}>
                            {item.quantity}
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={{
                            width: wp('12%'),
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#161C27',
                              fontFamily: 'Inter-Regular',
                            }}>
                            {filteredUnit[0]}
                          </Text>
                        </View>

                        <View
                          style={{
                            ...styles.boxSizeSec,
                            marginLeft: wp('2%'),
                          }}>
                          <Text
                            style={styles.boxTextDataStyling}
                            numberOfLines={1}>
                            {item.systemSays && item.systemSays.toFixed(2)}{' '}
                            {filteredUnit[0]}
                          </Text>
                          {item.correction ? (
                            <Text
                              style={{
                                fontSize: 12,
                                color: item.correction > 0 ? '#94C01F' : 'red',
                                fontFamily: 'Inter-Regular',
                                marginTop: hp('2%'),
                              }}>
                              ({item.correction}) {filteredUnit[0]}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.notAvailableContainer}>
                {/* <Text style={styles.notAvailableStyling}>
                  {translate('No data available')}
                </Text> */}
              </View>
            )}
          </ScrollView>
        )}
      </View>
      // </ScrollView>
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
      const categoryId = SECTIONS[activeSections].content;
      const {departmentId, pageDate} = this.state;
      getStockDataApi(departmentId, categoryId, pageDate)
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

    console.log('activeSections-->CATSDCreem', activeSections);

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
        <ScrollView style={{}} showsVerticalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: wp('5%'),
              marginTop: hp('4%'),
            }}>
            <View style={styles.flex}>
              <Text style={styles.adminTextStyle}>
                {translate('Stock Take')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>{translate('Go Back')}</Text>
            </TouchableOpacity>
          </View>
          {recipeLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View style={{marginHorizontal: wp('5%'), marginTop: hp('2%')}}>
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

export default connect(mapStateToProps, {UserTokenAction})(CategoryStockScreen);
