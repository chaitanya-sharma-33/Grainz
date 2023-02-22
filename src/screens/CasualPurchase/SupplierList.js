import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../redux/actions/UserTokenAction';
import {getMyProfileApi, getSupplierListApi} from '../../connectivity/api';
import {translate} from '../../utils/translations';
import styles from './style';

class SupplierList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      dataListLoader: true,
      supplierList: [],
      supplieReference: '',
      selectedTextUser: '',
      supplierListBackUp: [],
      buttonsSubHeader: [],
      chooseImageModalStatus: false,
      quantityError: '',
      priceError: '',
      clickPhoto: false,
      searchItem: '',
      screenType: '',
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

  getSupplierListData() {
    this.setState(
      {
        dataListLoader: true,
      },
      () =>
        getSupplierListApi()
          .then(res => {
            const finalArr = [];
            res.data.map(item => {
              finalArr.push({
                name: item.name,
                id: item.id,
              });
            });
            this.setState({
              supplierList: [...finalArr],
              supplierListBackUp: [...finalArr],
              dataListLoader: false,
            });
          })
          .catch(error => {
            console.log('err', error);
          }),
    );
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      const {route} = this.props;
      const screenType = route.params.screenType;
      const orderData = route.params.orderData;
      if (orderData) {
        this.setState({
          orderData,
        });
      } else {
        this.setState({
          orderData: '',
        });
      }
      console.log('screenType', screenType);
      this.getSupplierListData();
      if (screenType) {
        this.setState({
          screenType,
        });
      }
    });
  }

  selectUserNameFun = item => {
    const {screenType, orderData} = this.state;
    console.log('item', item);
    if (screenType === 'Add') {
      this.props.navigation.navigate('AddPurchaseScreen', {item: item});
    } else if (screenType === 'Filter') {
      this.props.navigation.navigate('FilterPurchaseScreen', {item: item});
    } else if (screenType === 'Edit') {
      this.props.navigation.navigate('EditPurchase', {
        item: item,
        orderData: orderData,
      });
    } else if (screenType === 'FilterOrder') {
      this.props.navigation.navigate('FilterOrderScreen', {
        item: item,
        orderData: orderData,
      });
    }
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
    const newData = this.state.supplierListBackUp.filter(function (item) {
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      supplierList: newData,
      searchItem: text,
    });
  };

  render() {
    const {supplierList, dataListLoader, searchItem, screenType} = this.state;
    console.log('supplier List', supplierList);
    console.log('screenType', screenType);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#efeded',
        }}>
        <View style={{marginBottom: hp('1%'), flex: 1}}>
          <View
            style={{
              flex: 1,
            }}>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.goBackContainer}>
                  <Image source={img.backIcon} style={styles.tileImageBack} />
                </TouchableOpacity>
                <View style={styles.flex}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Select Supplier')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{marginHorizontal: wp('6%'), marginTop: hp('2%')}}>
              {dataListLoader ? (
                <ActivityIndicator color="grey" size="large" />
              ) : (
                <View>
                  <View style={{}}>
                    <View style={{}}>
                      <View
                        style={{
                          borderRadius: 10,
                          backgroundColor: '#fff',
                          alignSelf: 'center',
                          marginTop: hp('2%'),
                          justifyContent: 'center',
                          padding: 10,
                          marginBottom: hp('3%'),
                        }}>
                        <TextInput
                          placeholder="Search..."
                          placeholderTextColor="grey"
                          value={searchItem}
                          style={{
                            width: wp('80%'),
                            paddingVertical: 5,
                          }}
                          onChangeText={value => this.searchFun(value)}
                        />
                      </View>

                      <View
                        style={{
                          height: hp('65%'),
                        }}>
                        <FlatList
                          showsVerticalScrollIndicator={false}
                          keyExtractor={item => item.id}
                          data={supplierList}
                          renderItem={({item}) => (
                            <View style={{flex: 1}}>
                              <TouchableOpacity
                                onPress={() => this.selectUserNameFun(item)}
                                style={{
                                  backgroundColor: '#fff',
                                  flex: 1,
                                  borderRadius: 10,
                                  paddingVertical: 15,
                                  marginVertical: 10,
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      textAlign: 'center',
                                      fontFamily: 'Inter-Regular',
                                    }}
                                    numberOfLines={1}>
                                    {' '}
                                    {item.name}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          )}
                          keyExtractor={item => item.id}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
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

export default connect(mapStateToProps, {UserTokenAction})(SupplierList);
