// import React, {Component} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   TextInput,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {connect} from 'react-redux';
// import img from '../../../../../constants/images';
// import SubHeader from '../../../../../components/SubHeader';
// import Header from '../../../../../components/Header';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
// import {
//   getMyProfileApi,
//   getSupplierListAdminApi,
// } from '../../../../../connectivity/api';
// import styles from '../style';
// import {translate} from '../../../../../utils/translations';

// class NewOrder extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       token: '',
//       modalVisible: false,
//       firstName: '',
//       recipeLoader: false,
//       pageLoading: true,
//       selectedItemObjects: '',
//       buttonsSubHeader: [],
//       supplierValue: '',
//       supplierList: [],
//       searchItem: '',
//       supplierListBackup: [],
//     };
//   }

//   getData = async () => {
//     try {
//       const value = await AsyncStorage.getItem('@appToken');
//       if (value !== null) {
//         this.setState(
//           {
//             token: value,
//             recipeLoader: true,
//           },
//           () => this.getProfileData(),
//         );
//       }
//     } catch (e) {
//       console.warn('ErrHome', e);
//     }
//   };

//   getProfileData = () => {
//     getMyProfileApi()
//       .then(res => {
//         this.setState({
//           firstName: res.data.firstName,

//           buttonsSubHeader: [
//             {name: translate('ADMIN')},
//             {name: translate('Setup')},
//             {name: translate('INBOX')},
//           ],
//         });
//       })
//       .catch(err => {
//         console.warn('ERr', err);
//       });
//   };

//   componentDidMount() {
//     this.getData();
//     this.getSupplierListData();
//   }

//   getSupplierListData = () => {
//     getSupplierListAdminApi()
//       .then(res => {
//         const {data} = res;
//         let finalSupplierList = data.map((item, index) => {
//           return {
//             label: item.name,
//             value: item.id,
//           };
//         });
//         this.setState({
//           supplierList: finalSupplierList,
//           recipeLoader: false,
//           pageLoading: false,
//           supplierListBackup: finalSupplierList,
//         });
//       })
//       .catch(err => {
//         Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
//           {
//             text: 'Okay',
//             onPress: () => this.props.navigation.navigate('HomeScreen'),
//           },
//         ]);
//       });
//   };

//   myProfile = () => {
//     this.props.navigation.navigate('MyProfile');
//   };

//   addItemsFun = item => {
//     this.props.navigation.navigate('AddItemsOrderScreen', {
//       supplierValue: item.value,
//       screen: 'New',
//       supplierName: item.label,
//     });
//   };

//   searchFun = txt => {
//     this.setState(
//       {
//         searchItem: txt,
//       },
//       () => this.filterData(txt),
//     );
//   };

//   filterData = text => {
//     //passing the inserted text in textinput
//     const newData = this.state.supplierListBackup.filter(function (item) {
//       //applying filter for the inserted text in search bar
//       const itemData = item.label ? item.label.toUpperCase() : ''.toUpperCase();
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     this.setState({
//       //setting the filtered newData on datasource
//       //After setting the data it will automatically re-render the view
//       supplierList: newData,
//       searchItem: text,
//     });
//   };

//   render() {
//     const {
//       recipeLoader,
//       pageLoading,
//       firstName,
//       buttonsSubHeader,
//       supplierList,
//       searchItem,
//     } = this.state;

//     return (
//       <View style={styles.container}>
//         <Header
//           logout={firstName}
//           logoutFun={this.myProfile}
//           logoFun={() => this.props.navigation.navigate('HomeScreen')}
//         />
//         {/* {recipeLoader ? (
//           <ActivityIndicator size="small" color="#94C036" />
//         ) : (
//           <SubHeader {...this.props} buttons={buttonsSubHeader} index={0} />
//         )} */}
//         <ScrollView
//           style={{marginBottom: hp('2%')}}
//           showsVerticalScrollIndicator={false}>
//           <View style={styles.subContainer}>
//             <View style={styles.firstContainer}>
//               <View style={{flex: 1}}>
//                 <Text style={styles.adminTextStyle}>
//                   {translate('New Order')}
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 onPress={() => this.props.navigation.goBack()}
//                 style={styles.goBackContainer}>
//                 <Text style={styles.goBackTextStyle}>
//                   {translate('Go Back')}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               borderWidth: 1,
//               borderColor: '#E2E8F0',
//               height: hp('7%'),
//               width: wp('90%'),
//               borderRadius: 100,
//               backgroundColor: '#fff',
//               alignSelf: 'center',
//               justifyContent: 'space-between',
//               marginVertical: hp('2%'),
//             }}>
//             <TextInput
//               placeholder="Search"
//               value={searchItem}
//               style={{
//                 padding: 15,
//                 width: wp('75%'),
//               }}
//               onChangeText={value => this.searchFun(value)}
//             />
//             <Image
//               style={{
//                 height: 18,
//                 width: 18,
//                 resizeMode: 'contain',
//                 marginRight: wp('5%'),
//               }}
//               source={img.searchIcon}
//             />
//           </View>

//           {pageLoading ? (
//             <ActivityIndicator color="#94C036" size="large" />
//           ) : (
//             <View style={{marginHorizontal: wp('5%')}}>
//               {supplierList.map((item, index) => {
//                 return (
//                   <View style={{marginTop: hp('2%')}} key={index}>
//                     <TouchableOpacity
//                       onPress={() => this.addItemsFun(item)}
//                       style={{
//                         backgroundColor: '#FFFFFF',
//                         paddingVertical: 18,
//                         flexDirection: 'row',
//                         borderRadius: 6,
//                         borderWidth: 1,
//                         borderColor: '#F0F0F0',
//                       }}>
//                       <View
//                         style={{
//                           flex: 1,
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                         }}>
//                         <Image
//                           source={img.menusIcon}
//                           style={{
//                             width: 20,
//                             height: 20,
//                             resizeMode: 'contain',
//                           }}
//                         />
//                       </View>
//                       <View style={{flex: 4}}>
//                         <Text
//                           style={{
//                             fontFamily: 'Inter-Regular',
//                             fontSize: 16,
//                             color: '#482813',
//                           }}>
//                           {item.label}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 );
//               })}
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     );
//   }
// }

// const mapStateToProps = state => {
//   return {
//     UserTokenReducer: state.UserTokenReducer,
//     GetMyProfileReducer: state.GetMyProfileReducer,
//   };
// };

// export default connect(mapStateToProps, {UserTokenAction})(NewOrder);

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
import img from '../../../../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getSupplierListApi,
} from '../../../../../connectivity/api';
import {translate} from '../../../../../utils/translations';
import styles from '../style';

class NewOrder extends Component {
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
      ScreenType: '',
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
      const ScreenType = route.params.ScreenType;
      if (ScreenType) {
        this.setState({
          ScreenType,
        });
      }
      this.getSupplierListData();
    });
  }

  selectUserNameFun = item => {
    console.log('item', item);
    const {ScreenType} = this.state;
    if (ScreenType === 'NewOrderSec') {
      this.props.navigation.navigate('NewOrderSecScreen', {item: item});
    } else {
      this.props.navigation.navigate('OrderingAdminScreen', {item: item});
    }

    // this.props.navigation.navigate('AddItemsOrderScreen', {
    //   supplierValue: item.id,
    //   screen: 'New',
    //   supplierName: item.name,
    // });
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
    const {supplierList, dataListLoader, searchItem} = this.state;
    console.log('supplier List', supplierList);

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

export default connect(mapStateToProps, {UserTokenAction})(NewOrder);
