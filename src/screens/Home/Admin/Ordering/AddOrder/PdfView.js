import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import SubHeader from '../../../../../components/SubHeader';
import Header from '../../../../../components/Header';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getSupplierProductsApi,
  addDraftApi,
  getCurrentLocUsersAdminApi,
  getBasketApi,
  updateBasketApi,
  sendOrderApi,
  viewShoppingBasketApi,
  downloadPDFApi,
  viewHTMLApi,
} from '../../../../../connectivity/api';
import styles from '../style';
import {translate} from '../../../../../utils/translations';
import {WebView} from 'react-native-webview';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LoaderComp from '../../../../../components/Loader';

class PdfView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      recipeLoader: false,
      buttonsSubHeader: [],
      htmlData: '',
      modalLoader: false,
      actionModalStatus: false,
      buttons: [],
      apiDeliveryDate: '',
      apiOrderDate: '',
      placedByValue: '',
      supplierId: '',
      finalApiData: [],
      modalVisible: false,
      supplierValue: '',
      finalOrderDate: '',
      isDatePickerVisibleOrderDate: false,
      finalDeliveryDate: '',
      placedByValue: '',
      supplierList: [],
      usersList: [],
      clonePreviouseModalStatus: false,
      cloneLoader: false,
      cloneOrderData: [],
      sentValue: 'No',
      apiDeliveryDate: '',
      itemType: '',
      basketId: '',
      finalArrData: [],
      editStatus: false,
      totalHTVAVal: '',
      mailModalVisible: false,
      productId: '',
      toRecipientValue: '',
      mailMessageValue: '',
      ccRecipientValue: '',
      mailTitleValue: '',
      supplierName: '',
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
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getData();
    const {
      htmlData,
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
    } = this.props.route && this.props.route.params;
    this.setState({
      htmlData,
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
    });
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  // isPermitted = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //         {
  //           title: 'External Storage Write Permission',
  //           message: 'App needs access to Storage data',
  //         },
  //       );
  //       return granted === PermissionsAndroid.RESULTS.GRANTED;
  //     } catch (err) {
  //       alert('Write permission err', err);
  //       return false;
  //     }
  //   } else {
  //     return true;
  //   }
  // };

  // createPDF = async () => {
  //   if (await this.isPermitted()) {
  //     let options = {
  //       //Content to print
  //       html: this.state.htmlData,
  //       //File Name
  //       fileName: 'order',
  //       //File directory
  //       directory: 'docs',
  //     };
  //     let file = await RNHTMLtoPDF.convert(options);
  //     Alert.alert('Grainz', `Pdf downloaded successfully - ${file.filePath}`, [
  //       {
  //         text: 'Okay',
  //         onPress: () => this.props.navigation.navigate('HomeScreen'),
  //       },
  //     ]);
  //   }
  // };

  sendFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.sendFunSec(),
    );
  };

  sendFunSec = () => {
    const {
      apiOrderDate,
      placedByValue,
      supplierId,
      finalApiData,
      basketId,
      apiDeliveryDate,
    } = this.state;
    if (
      apiOrderDate &&
      placedByValue &&
      supplierId &&
      finalApiData &&
      apiDeliveryDate
    ) {
      let payload = {
        id: basketId,
        supplierId: supplierId,
        orderDate: apiOrderDate,
        deliveryDate: apiDeliveryDate,
        placedBy: placedByValue,
        shopingBasketItemList: finalApiData,
      };
      addDraftApi(payload)
        .then(res => {
          this.setState(
            {
              loaderCompStatus: false,
            },
            () => this.openMailModal(res),
          );
        })
        .catch(err => {
          Alert.alert(
            `Error - ${err.response.status}`,
            'Something went wrong',
            [
              {
                text: 'Okay',
              },
            ],
          );
        });
    } else {
      Alert.alert('Grainz', 'Please select atleast one item', [
        {
          text: 'okay',
          onPress: () => this.closeLoader(),
          style: 'default',
        },
      ]);
    }
  };

  closeLoader = () => {
    this.setState({
      loaderCompStatus: false,
    });
  };

  openMailModal = res => {
    this.setState({
      mailModalVisible: true,
      toRecipientValue: res.data && res.data.emailDetails.toRecipient,
      ccRecipientValue: res.data && res.data.emailDetails.ccRecipients,
      mailTitleValue: res.data && res.data.emailDetails.subject,
      mailMessageValue: res.data && res.data.emailDetails.text,
    });
  };

  closeMailModal = () => {
    this.setState({
      mailModalVisible: false,
    });
  };

  sendMailFun = () => {
    this.setState(
      {
        loaderCompStatus: true,
      },
      () => this.sendMailFunSec(),
    );
  };

  sendMailFunSec = () => {
    const {
      basketId,
      toRecipientValue,
      mailMessageValue,
      ccRecipientValue,
      mailTitleValue,
    } = this.state;
    let payload = {
      emailDetails: {
        ccRecipients: ccRecipientValue,
        subject: mailTitleValue,
        text: mailMessageValue,
        toRecipient: toRecipientValue,
      },
      shopingBasketId: basketId,
    };

    sendOrderApi(payload)
      .then(res => {
        this.setState(
          {
            mailModalVisible: false,
            loaderCompStatus: false,
          },
          () => this.props.navigation.navigate('OrderingAdminScreen'),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  render() {
    const {
      buttonsSubHeader,
      recipeLoader,
      modalData,
      modalLoader,
      actionModalStatus,
      buttons,
      supplierValue,
      finalOrderDate,
      isDatePickerVisibleOrderDate,
      isDatePickerVisibleDeliveryDate,
      finalDeliveryDate,
      placedByValue,
      supplierList,
      usersList,
      clonePreviouseModalStatus,
      cloneLoader,
      cloneOrderData,
      sentValue,
      editStatus,
      totalHTVAVal,
      mailModalVisible,
      toRecipientValue,
      mailMessageValue,
      ccRecipientValue,
      mailTitleValue,
      supplierName,
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
        <View style={styles.subContainer}>
          <View style={styles.firstContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.adminTextStyle}>Order Details</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('BasketOrderScreen')
              }
              style={styles.goBackContainer}>
              <Text style={styles.goBackTextStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{flex: 3.5, backgroundColor: '#F0F4FE'}}>
          <WebView
            startInLoadingState={true}
            renderLoading={() => {
              return (
                <View style={{flex: 1}}>
                  <ActivityIndicator size="large" color="grey" />
                </View>
              );
            }}
            originWhitelist={['*']}
            source={{html: this.state.htmlData}}
            style={{
              flex: 1,
              backgroundColor: '#F0F4FE',
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => this.sendFun()}
              style={{
                height: hp('6%'),
                width: wp('80%'),
                backgroundColor: '#94C036',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                borderRadius: 100,
                marginBottom: hp('5%'),
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Send')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* <View style={{}}>
            <TouchableOpacity onPress={() => this.createPDF()}>
              <Text style={styles.goBackTextStyle}>Download</Text>
            </TouchableOpacity>
          </View> */}
        </View>
        <Modal isVisible={mailModalVisible} backdropOpacity={0.35}>
          <View
            style={{
              width: wp('80%'),
              height: hp('65%'),
              backgroundColor: '#F0F4FE',
              alignSelf: 'center',
              borderRadius: 6,
            }}>
            <View
              style={{
                backgroundColor: '#87AF30',
                height: hp('6%'),
                flexDirection: 'row',
                borderTopRightRadius: 6,
                borderTopLeftRadius: 6,
              }}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 16, color: '#fff'}}>Send Mail</Text>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  padding: hp('3%'),
                }}>
                <View style={{}}>
                  <View style={{}}>
                    <TextInput
                      value={mailTitleValue}
                      placeholder="Title"
                      style={{
                        padding: 15,
                        width: '100%',
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          mailTitleValue: value,
                        })
                      }
                    />
                  </View>
                  <View style={{marginTop: hp('3%')}}>
                    <TextInput
                      value={toRecipientValue}
                      placeholder="To"
                      style={{
                        padding: 15,
                        width: '100%',
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          toRecipientValue: value,
                        })
                      }
                    />
                  </View>
                  <View style={{marginTop: hp('3%')}}>
                    <TextInput
                      value={ccRecipientValue}
                      placeholder="CC"
                      style={{
                        padding: 15,
                        width: '100%',
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          ccRecipientValue: value,
                        })
                      }
                    />
                  </View>

                  <View style={{marginTop: hp('3%')}}>
                    <TextInput
                      value={mailMessageValue}
                      placeholder="Message"
                      style={{
                        padding: 15,
                        width: '100%',
                        backgroundColor: '#fff',
                        borderRadius: 5,
                      }}
                      onChangeText={value =>
                        this.setState({
                          mailMessageValue: value,
                        })
                      }
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: hp('4%'),
                    }}>
                    {loaderCompStatus ? (
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('5%'),
                          alignSelf: 'flex-end',
                          backgroundColor: '#94C036',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 100,
                        }}>
                        <ActivityIndicator size="small" color="#fff" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => this.sendMailFun()}
                        style={{
                          width: wp('30%'),
                          height: hp('5%'),
                          alignSelf: 'flex-end',
                          backgroundColor: '#94C036',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 100,
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 'bold',
                          }}>
                          {translate('Confirm')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => this.closeMailModal()}
                      style={{
                        width: wp('30%'),
                        height: hp('5%'),
                        alignSelf: 'flex-end',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: wp('2%'),
                        borderRadius: 100,
                        borderColor: '#482813',
                        borderWidth: 1,
                      }}>
                      <Text
                        style={{
                          color: '#482813',
                          fontSize: 15,
                          fontWeight: 'bold',
                        }}>
                        {translate('Cancel')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
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

export default connect(mapStateToProps, {UserTokenAction})(PdfView);
