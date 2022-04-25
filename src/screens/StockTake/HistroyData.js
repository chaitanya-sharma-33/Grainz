import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getPreviousStockDatesDataApi,
} from '../../connectivity/api';
import styles from './style';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate} from '../../utils/translations';
import Accordion from 'react-native-collapsible/Accordion';

class HistoryData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      buttonsSubHeader: [],
      loader: true,
      departmentId: '',
      categoryId: '',
      pageDate: '',
      topValue: '',
      categoryLoader: true,
      topValueStatus: true,
      historyDate: '',
      activeSections: [],
      arrangeStatusName: 0,
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
          loader: false,
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        console.warn('ERr', err.response);
        this.setState({
          loader: false,
        });
      });
  };

  componentDidMount() {
    this.getData();
    const {departmentId, historyDate} =
      this.props.route && this.props.route.params;
    this.props.navigation.addListener('focus', () => {
      this.setState(
        {
          departmentId,
          historyDate,
          categoryLoader: true,
        },
        () => this.getStockDataFun(),
      );
    });
  }

  getStockDataFun = () => {
    const {historyDate} = this.state;
    getPreviousStockDatesDataApi(historyDate)
      .then(res => {
        function groupByKey(array, key) {
          return array.reduce((hash, obj) => {
            if (obj[key] === undefined) return hash;
            return Object.assign(hash, {
              [obj[key]]: (hash[obj[key]] || []).concat(obj),
            });
          }, {});
        }

        let groupedCategory = groupByKey(res.data, 'category');

        let finalArray = Object.keys(groupedCategory).map((item, index) => {
          return {
            name: item,
            id: index,
            children: groupedCategory[item],
          };
        });

        this.setState({
          categoryLoader: false,
          SECTIONS: finalArray,
        });
      })
      .catch(err => {
        console.log('ERR', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
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

  _renderHeader = (section, index, isActive) => {
    return (
      <View style={styles.renderHeaderContainer}>
        <Image
          style={styles.renderHeaderImageStyling}
          source={isActive ? img.upArrowIcon : img.arrowRightIcon}
        />
        <Text style={styles.renderHeaderTextStyling}>{section.name}</Text>
      </View>
    );
  };

  _renderContent = section => {
    const {categoryLoader} = this.state;
    return (
      // <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={{
          backgroundColor: '#fff',
          marginVertical: hp('3%'),
        }}>
        <View style={styles.renderContentSubContainer}>
          <TouchableOpacity
            // onPress={() => this.arrangeListFun('NAME')}
            style={{
              width: wp('20%'),
              justifyContent: 'center',
              paddingTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
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
              width: wp('20'),
              justifyContent: 'center',
              paddingTop: 10,
              marginLeft: wp('1%'),
            }}>
            <Text style={styles.boxTextHeadingStyling}>
              {translate('Stock Take')}
            </Text>
          </View>
          <View
            style={{
              width: wp('7%'),
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: wp('2%'),
            }}></View>
          <View style={{...styles.boxSize, marginLeft: wp('2%')}}>
            <Text style={{...styles.boxTextHeadingStyling}}>
              {translate('System says')}
            </Text>
          </View>
          <View
            style={{
              width: wp('7%'),
              justifyContent: 'center',
              paddingTop: 10,
              marginLeft: wp('2%'),
            }}></View>
          {/* <View style={{...styles.boxSize, marginLeft: wp('2%')}}>
              <Text style={styles.boxTextHeadingStyling}>Correction</Text>
            </View> */}
        </View>
        {categoryLoader ? (
          <ActivityIndicator size="large" color="#94C036" />
        ) : (
          <View>
            {section && section.children.length > 0 ? (
              section.children.map((item, index) => {
                let finaUnitVal =
                  item &&
                  item.units.map((subItem, subIndex) => {
                    if (subItem.isDefault === true) {
                      return subItem.name;
                    }
                  });
                const filteredUnit = finaUnitVal.filter(elm => elm);
                return (
                  <View key={index} style={styles.renderHeaderContentContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <View style={styles.boxSizeSec}>
                        <Text style={styles.boxTextDataStyling}>
                          {item.name && item.name}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => this.editUnitsFun(item)}
                        style={{
                          ...styles.boxSizeSec,
                          marginLeft: wp('1%'),
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
                          width: wp('7%'),
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: wp('2%'),
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
                          width: wp('25'),
                          justifyContent: 'center',
                          paddingTop: 10,
                          marginLeft: wp('2%'),
                        }}>
                        {item.systemSays ? (
                          <Text
                            style={styles.boxTextDataStyling}
                            numberOfLines={1}>
                            {item.systemSays && item.systemSays.toFixed(2)}{' '}
                            {filteredUnit[0]}
                          </Text>
                        ) : null}
                        {item.correction ? (
                          <Text
                            style={{
                              ...styles.boxTextDataStyling,
                              color: item.correction > 0 ? '#94C01F' : 'red',
                              marginTop: 10,
                              marginLeft: 5,
                            }}>
                            {item.correction} {filteredUnit[0]}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.notAvailableContainer}>
                <Text style={styles.notAvailableStyling}>
                  {translate('No data available')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      // </ScrollView>
    );
  };

  _updateSections = activeSections => {
    this.setState({
      activeSections,
    });
  };

  editUnitsFun = item => {
    console.log('item', item);
    const {departmentId, categoryId} = this.state;
    this.props.navigation.navigate('EditStockScreen', {
      item,
      pageDate: item.stockTakeDate,
      inventoryId: item.inventoryId,
      departmentId,
      categoryId,
      screenType: 'History',
    });
  };

  render() {
    const {buttonsSubHeader, loader, categoryLoader, SECTIONS, activeSections} =
      this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {loader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginBottom: hp('2%')}}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={styles.flex}>
                <Text style={styles.adminTextStyle}>
                  {translate('Stock Take')}
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

            {categoryLoader ? (
              <ActivityIndicator color="#94C036" size="large" />
            ) : (
              <View style={styles.margin}>
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

export default connect(mapStateToProps, {UserTokenAction})(HistoryData);
