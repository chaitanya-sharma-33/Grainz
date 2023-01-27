import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import SubHeader from '../../components/SubHeader';
import Header from '../../components/Header';
import moment from 'moment';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {getMyProfileApi, getCasualPurchasesApi} from '../../connectivity/api';
import {translate} from '../../utils/translations';
import styles from './style';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

class ViewPurchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      casualPurchases: [],
      casualListLoader: false,
      recipeLoader: true,
      buttonsSubHeader: [],
      arrangeStatusSupplier: 0,
      arrangeStatusDate: 0,
      arrangeStatusHTVA: 0,
      searchItem: '',
      casualPurchasesBackup: [],
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
          recipeLoader: false,
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

  getCasualPurchasesData() {
    this.setState(
      {
        casualListLoader: true,
      },
      () =>
        getCasualPurchasesApi()
          .then(res => {
            this.setState({
              casualPurchases: res.data,
              casualListLoader: false,
              casualPurchasesBackup: res.data,
            });
          })
          .catch(err => {
            this.setState({casualListLoader: false});
            console.warn('errR', err);
          }),
    );
  }

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.getCasualPurchasesData();
    });
    this.getProfileDataFun();
  }

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  navigateToEditFun(order) {
    this.props.navigation.navigate('EditPurchase', {
      orderData: order,
    });
  }

  arrangeListFun = funType => {
    if (funType === 'SUPPLIER') {
      this.setState(
        {
          arrangeStatusSupplier: Number(1) + this.state.arrangeStatusSupplier,
        },
        () => this.arrangeListFunSec('SUPPLIER'),
      );
    } else if (funType === 'DATE') {
      this.setState(
        {
          arrangeStatusDate: Number(1) + this.state.arrangeStatusDate,
        },
        () => this.arrangeListFunSec('DATE'),
      );
    } else if (funType === 'HTVA') {
      this.setState(
        {
          arrangeStatusHTVA: Number(1) + this.state.arrangeStatusHTVA,
        },
        () => this.arrangeListFunSec('HTVA'),
      );
    }
  };

  arrangeListFunSec = type => {
    const {arrangeStatusSupplier, arrangeStatusDate, arrangeStatusHTVA} =
      this.state;
    const finalData =
      type === 'SUPPLIER'
        ? arrangeStatusSupplier
        : type === 'DATE'
        ? arrangeStatusDate
        : arrangeStatusHTVA;
    if (finalData % 2 == 0) {
      this.reverseFun();
    } else {
      this.descendingOrderFun(type);
    }
  };

  reverseFun = () => {
    const {casualPurchases} = this.state;
    const finalData = casualPurchases.reverse();

    this.setState({
      casualPurchases: finalData,
    });
  };

  descendingOrderFun = type => {
    const {casualPurchases} = this.state;

    if (type === 'SUPPLIER') {
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
      const finalKeyValue =
        type === 'SUPPLIER'
          ? 'supplierName'
          : type === 'DATE'
          ? 'orderDate'
          : 'htva';

      const finalData = casualPurchases.sort(dynamicSort(finalKeyValue));

      this.setState({
        casualPurchases: finalData,
      });
    } else {
      function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a, b) {
          var result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
          return result * sortOrder;
        };
      }
      const finalKeyValue =
        type === 'SUPPLIER'
          ? 'supplierName'
          : type === 'DATE'
          ? 'orderDate'
          : 'htva';

      const finalData = casualPurchases.sort(dynamicSort(finalKeyValue));

      this.setState({
        casualPurchases: finalData,
      });
    }
  };

  searchFun = txt => {
    console.log('value={searchItem}', txt);
    this.setState(
      {
        searchItem: txt,
      },
      () => this.filterData(txt),
    );
  };

  filterData = text => {
    console.log('casualPurchases', this.state.casualPurchases);
    // passing the inserted text in textinput
    const newData = this.state.casualPurchasesBackup.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.supplierName
        ? item.supplierName.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      casualPurchases: newData,
      searchItem: text,
    });
  };

  render() {
    const {
      casualPurchases,
      casualListLoader,
      buttonsSubHeader,
      recipeLoader,
      searchItem,
    } = this.state;
    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfileFun}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* {recipeLoader ? (
          <ActivityIndicator size="small" color="#94C036" />
        ) : (
          <SubHeader {...this.props} buttons={buttonsSubHeader} />
        )} */}
        {/* <ScrollView
          ref={ref => {
            this.scrollListReftop = ref;
          }}> */}
        <View>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={styles.goBackContainer}>
                <Image source={img.backIcon} style={styles.tileImageBack} />
              </TouchableOpacity>
              <View style={styles.flex}>
                <Text style={styles.adminTextStyle}>
                  {translate('Casual purchase')}
                </Text>
              </View>
              {/* <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.goBackContainer}>
                  <Text style={styles.goBackTextStyle}>
                    {' '}
                    {translate('Go Back')}
                  </Text>
                </TouchableOpacity> */}
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: wp('5%'),
          }}>
          <View
            style={{
              width: wp('60%'),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 5,
            }}>
            <TextInput
              placeholder="Search"
              style={{
                padding: 12,
                borderRadius: 5,
                width: '85%',
              }}
              value={searchItem}
              onChangeText={value => this.searchFun(value)}
            />
            <View>
              <Image
                style={{
                  width: 18,
                  height: 18,
                  resizeMode: 'contain',
                }}
                source={img.searchIcon}
              />
            </View>
          </View>
          <TouchableOpacity
            style={{
              width: wp('29%'),
              marginLeft: 10,
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 5,
            }}
            onPress={() =>
              this.props.navigation.navigate('FilterPurchaseScreen')
            }>
            <View>
              <Image
                style={{
                  width: 18,
                  height: 18,
                  resizeMode: 'contain',
                  marginLeft: 10,
                  tintColor: 'grey',
                }}
                source={img.filterIcon}
              />
            </View>
            <View>
              <Text
                style={{
                  padding: 12,
                  color: 'grey',
                }}>
                Filter
              </Text>
            </View>
            {/* <TextInput
              placeholder="Filter"
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 5,
              }}
              editable={false}
            /> */}
          </TouchableOpacity>
        </View>
        <View style={{marginTop: '5%'}}>
          <View style={styles.listHeading}>
            <TouchableOpacity
              style={styles.listSubHeading}
              onPress={() => this.arrangeListFun('DATE')}>
              <Text style={styles.listTextStyling}>{translate('Date')}</Text>
              <View>
                <Image
                  style={styles.listImageStyling}
                  source={img.doubleArrowIconNew}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listSubHeading}
              onPress={() => this.arrangeListFun('SUPPLIER')}>
              <Text style={styles.listTextStyling}>
                {translate('Supplier')}
              </Text>
              <View>
                <Image
                  style={styles.listImageStyling}
                  source={img.doubleArrowIconNew}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listSubHeading}
              onPress={() => this.arrangeListFun('HTVA')}>
              <Text style={styles.listTextStyling}>
                € {translate('Total')} HTVA
              </Text>
              <View>
                <Image
                  style={styles.listImageStyling}
                  source={img.doubleArrowIconNew}
                />
              </View>
            </TouchableOpacity>
            {/* <View style={styles.listSubHeading}></View> */}
          </View>

          <ScrollView>
            {casualListLoader ? (
              <ActivityIndicator color="grey" size="large" />
            ) : (
              casualPurchases.map((item, index) => {
                // console.log('ITEM', item);
                const date = moment(item.orderDate).format('DD/MM/YYYY');
                const price = Math.round(item.htva);
                return (
                  <TouchableOpacity
                    onPress={() => this.navigateToEditFun(item)}
                    style={{
                      ...styles.listDataHeadingContainer,
                      backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#EEF2FD',
                      borderColor: '#EAEAF0',
                      borderWidth: 1,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <View
                        style={styles.listSubHeading}
                        onPress={() => this.arrangeListFun('DATE')}>
                        <Text style={styles.listTextStyling}>{date}</Text>
                      </View>
                      <View
                        style={styles.listSubHeading}
                        onPress={() => this.arrangeListFun('SUPPLIER')}>
                        <Text
                          style={{
                            ...styles.listTextStyling,
                            width: wp('15%'),
                          }}
                          numberOfLines={1}>
                          {item.supplierName}
                        </Text>
                        <View>
                          {item.hasWarning ? (
                            <View style={styles.listDataContainer}>
                              <Image
                                style={{
                                  width: 15,
                                  height: 15,
                                  resizeMode: 'contain',
                                  marginLeft: 10,
                                }}
                                source={img.flagIcon}
                              />
                            </View>
                          ) : (
                            <View style={styles.listDataContainer}></View>
                          )}
                        </View>
                      </View>
                      <View
                        style={styles.listSubHeading}
                        onPress={() => this.arrangeListFun('HTVA')}>
                        <Text style={styles.listTextStyling}>€ {price}</Text>
                      </View>
                    </View>

                    {/* <TouchableOpacity
                      style={styles.listDataHeadingSubContainer}
                      onPress={() => this.navigateToEditFun(item)}>
                      <View style={styles.listDataContainer}>
                        <Text style={styles.listDataTextStyling}>{date}</Text>
                      </View>
                      <View style={styles.listDataContainer}>
                        <Text style={styles.listDataTextStyling}>
                          {item.supplierName}
                        </Text>
                      </View>
                      <View style={styles.listDataContainer}>
                        <Text style={styles.listDataTextStyling}>
                          € {price}
                        </Text>
                      </View>
                      {item.hasWarning ? (
                        <View style={styles.listDataContainer}>
                          <Image
                            style={{
                              width: 15,
                              height: 15,
                              resizeMode: 'contain',
                            }}
                            source={img.errorIcon}
                          />
                        </View>
                      ) : (
                        <View style={styles.listDataContainer}></View>
                      )}
                    </TouchableOpacity> */}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('AddPurchaseScreen', {
                item: '',
              })
            }
            style={{
              position: 'absolute',
              right: 20,
              top: hp('50%'),
              flexDirection: 'row',
              backgroundColor: '#5297c1',
              padding: 15,
              borderRadius: 5,
            }}>
            <View>
              <Image
                style={{...styles.listImageStyling, tintColor: '#fff'}}
                source={img.plusIcon}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter-SemiBold',
                color: 'black',
                marginLeft: 5,
                color: '#fff',
                fontWeight: 'bold',
              }}>
              {translate('New Purchase')}
            </Text>
          </TouchableOpacity>
        </View>
        {/* </ScrollView> */}
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

export default connect(mapStateToProps, {UserTokenAction})(ViewPurchase);
