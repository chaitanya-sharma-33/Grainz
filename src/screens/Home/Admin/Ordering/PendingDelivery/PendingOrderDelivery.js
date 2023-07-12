import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  Switch,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../../constants/images';
import SubHeader from '../../../../../components/SubHeader';
import Header from '../../../../../components/Header';
import CheckBox from '@react-native-community/checkbox';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import moment from 'moment';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  deliveredDateUpdateApi,
  uploadImageApi,
  getImageApi,
  deleteImageApi,
  processPendingOrderApi,
} from '../../../../../connectivity/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {translate} from '../../../../../utils/translations';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import styles from '../style';
import RNPickerSelect from 'react-native-picker-select';
import ModalPicker from '../../../../../components/ModalPicker';
import TreeSelect from 'react-native-tree-select';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

// let todayDate = moment(new Date()).format('DD/MM/YYYY');
// let todayDateProd = moment.utc(new Date()).format();

class PendingOrderDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      isDatePickerVisibleOrder: false,
      finalOrderDate: '',
      productionDateOrder: '',
      isDatePickerVisibleDelivery: false,
      finalDeliveryDate: '',
      productionDateDelivery: '',
      supplierName: 'Select Supplier',
      supplierId: '',
      items: [],
      selectedTextUser: 'Select Supplier',
      orderItemsFinal: [],
      saveLoader: false,
      saveTouchableStatus: false,
      recipeLoader: true,
      placedByData: '',
      finalData: '',
      isDatePickerVisibleArrived: false,
      finalArrivedDate: '',
      productionDateArrived: '',
      invoiceNumber: '',
      deliveryReference: '',
      pageAmbientTemp: '',
      pageChilledTemp: '',
      pageFrozenTemp: '',
      pageNotes: '',
      chooseImageModalStatus: false,
      imageModalStatus: false,
      imageData: '',
      itemId: '',
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
        const {firstName} = res.data;
        this.setState({
          recipeLoader: false,
          placedByData: firstName,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  getImageFun = id => {
    getImageApi(id)
      .then(res => {
        console.log('res,image', res);
        this.setState({
          imageData: res.data,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  async componentDidMount() {
    // this.props.navigation.addListener('focus', () => {
    const {route} = this.props;
    const finalData = route.params.finalData;
    const finalArrivedDate = route.params.finalArrivedDate;
    const pageOrderItems = route.params.pageOrderItems;
    console.log('finalData', finalData);
    console.log('finalArrivedDate', finalArrivedDate);

    this.setState({
      finalData,
      finalOrderDate: moment(finalData.orderDate).format('DD/MM/YYYY'),
      productionDateOrder: moment.utc(finalData.orderDate).format(),
      finalDeliveryDate: moment(finalData.deliveryDate).format('DD/MM/YYYY'),
      productionDateDelivery: moment.utc(finalData.deliveryDate).format(),
      productionDateArrived: moment.utc(finalData.deliveredDate).format(),
      deliveryReference: finalData.orderReference,
      pageAmbientTemp: finalData.ambientTemp
        ? finalData.ambientTemp.toString()
        : '',
      pageChilledTemp: finalData.chilledTemp
        ? finalData.chilledTemp.toString()
        : '',
      pageFrozenTemp: finalData.frozenTemp
        ? finalData.frozenTemp.toString()
        : '',
      pageNotes: finalData.notes,
      finalArrivedDate: finalArrivedDate,
      itemId: finalData.id,
      invoiceNumber: finalData.invoiceNumber,
      pageOrderItems,
      placedBy: finalData.placedBy,
    });
    this.getProfileDataFun();
    this.getImageFun(finalData.id);
    // });
  }

  myProfileFun = () => {
    this.props.navigation.navigate('MyProfile');
  };

  handleConfirmOrder = date => {
    let newdate = moment(date).format('DD/MM/YYYY');
    this.setState({
      finalOrderDate: newdate,
      productionDateOrder: date,
    });

    this.hideDatePickerOrder();
  };

  handleConfirmArrived = date => {
    let newdate = moment(date).format('DD/MM/YYYY');
    this.setState({
      finalArrivedDate: newdate,
      productionDateArrived: date,
    });

    this.hideDatePickerArrived();
  };

  handleConfirmDelivery = date => {
    let newdate = moment(date).format('DD/MM/YYYY');
    this.setState({
      finalDeliveryDate: newdate,
      productionDateDelivery: date,
    });

    this.hideDatePickerDelivery();
  };

  hideDatePickerOrder = () => {
    this.setState({
      isDatePickerVisibleOrder: false,
    });
  };

  hideDatePickerArrived = () => {
    this.setState({
      isDatePickerVisibleArrived: false,
    });
  };

  hideDatePickerDelivery = () => {
    this.setState({
      isDatePickerVisibleDelivery: false,
    });
  };

  showDatePickerFunOrder = () => {
    this.setState({
      isDatePickerVisibleOrder: true,
    });
  };

  showDatePickerFunArrived = () => {
    this.setState({
      isDatePickerVisibleArrived: true,
    });
  };

  showDatePickerFunDelivery = () => {
    this.setState({
      isDatePickerVisibleDelivery: true,
    });
  };

  payloadValidation = () => {
    let formIsValid = true;
    const {orderItemsFinal} = this.state;
    if (orderItemsFinal.length > 0) {
      for (let i of orderItemsFinal) {
        if (i.quantityOrdered === '') {
          i.error = 'Quantity is required';
          formIsValid = false;
        } else if (i.unitPrice === '') {
          i.error = 'Price is required';
          formIsValid = false;
        } else if (i.unitId === null) {
          i.error = 'Please select a unit';
          formIsValid = false;
        }
      }
    }
    this.setState({
      orderItemsFinal,
    });
    return formIsValid;
  };

  processOrderFun() {
    this.processOrderFunSec();
    this.processOrderFunThird();
  }

  processOrderFunSec = () => {
    const {
      finalData,
      finalOrderDate,
      productionDateOrder,
      finalDeliveryDate,
      productionDateDelivery,
      productionDateArrived,
      deliveryReference,
      pageAmbientTemp,
      pageChilledTemp,
      pageFrozenTemp,
      pageNotes,
      finalArrivedDate,
      itemId,
      invoiceNumber,
      pageOrderItems,
      placedBy,
    } = this.state;
    let payload = {
      ambientTemp: pageAmbientTemp,
      chilledTemp: pageChilledTemp,
      deliveredDate: productionDateArrived,
      deliveryDate: productionDateDelivery,
      deliveryNoteReference: deliveryReference,
      frozenTemp: pageFrozenTemp,
      id: itemId,
      invoiceNumber: invoiceNumber,
      notes: pageNotes,
      orderDate: productionDateOrder,
      orderItems: pageOrderItems,
      orderReference: deliveryReference,
      placedBy: placedBy,
      isChecked: false,
    };

    console.log('PAYLOAD----->PROCESS ORDER', payload);

    processPendingOrderApi(payload)
      .then(res => {})
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  processOrderFunThird() {
    const {
      supplierName,
      supplierId,
      productionDateDelivery,
      productionDateOrder,
      finalDeliveryDate,
      finalOrderDate,
      placedByData,
      finalData,
      productionDateArrived,
    } = this.state;

    console.log('final', finalData);

    const id = finalData.id;
    const deliveredDate = moment.utc(productionDateArrived).format();
    const deliveryDate = moment.utc(productionDateDelivery).format();

    console.log('id', id);
    console.log('deliveredDate', deliveredDate);
    console.log('deliveryDate', deliveryDate);

    deliveredDateUpdateApi(id, deliveredDate, deliveryDate)
      .then(res => {
        console.log('res', res);
        this.setState(
          {
            loaderCompStatus: false,
          },
          () => this.props.navigation.navigate('PendingDeliveryAdminScreen'),
        );
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  }

  handleChoosePhoto() {
    this.setState({
      chooseImageModalStatus: true,
    });
  }

  setModalVisibleImage = () => {
    this.setState({
      imageModalStatus: false,
      chooseImageModalStatus: false,
    });
  };

  choosePhotoFun = () => {
    this.setState(
      {
        chooseImageModalStatus: false,
      },
      () =>
        setTimeout(() => {
          ImagePicker.openPicker({
            width: 300,
            height: 400,
            includeBase64: true,
            cropping: true,
          }).then(image => {
            const finalImageData = [
              {
                action: 'New',
                description: '',
                imageText: `data:image/png;base64,${image.data}`,
                name: '',
                path: image.path,
                position: 1,
                type: 'png',
              },
            ];

            this.uploadImageApiFun(finalImageData);

            // this.setState(
            //   {
            //     // imageModalStatus: true,
            //     imageData: finalImageData,
            //   },
            //   () => this.uploadImageApiFun(),
            // );
          });
        }, 500),
    );
  };

  clickPhotoFun = () => {
    this.setState(
      {
        chooseImageModalStatus: false,
      },
      () =>
        setTimeout(() => {
          ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
            includeBase64: true,
          }).then(image => {
            const finalImageData = [
              {
                action: 'New',
                description: '',
                imageText: `data:image/png;base64,${image.data}`,
                name: '',
                path: image.path,
                position: 1,
                type: 'png',
              },
            ];

            this.uploadImageApiFun(finalImageData);

            // this.setState(
            //   {
            //     // imageModalStatus: true,
            //     imageData: finalImageData,
            //   },
            //   () => this.uploadImageApiFun(finalImageData),
            // );
          });
        }, 500),
    );
  };

  uploadImageApiFun = finalImageData => {
    const {itemId, imageData, finalData} = this.state;

    let payload = {
      itemId: itemId,
      images: finalImageData,
    };

    console.log('payload', payload);
    uploadImageApi(payload)
      .then(res => {
        console.log('RES-IMAGE', res);
        this.getImageFun(finalData.id);
      })
      .catch(err => {
        console.log('err', err);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  deleteImageFun = item => {
    Alert.alert(`Delete`, 'Do you really want to delete this image?', [
      {
        text: 'Yes',
        onPress: () => this.deleteImageFunSec(item),
      },
      {
        text: 'No',
      },
    ]);
  };

  deleteImageFunSec = item => {
    const {finalData} = this.state;

    let payload = {};

    console.log('payload', payload);
    deleteImageApi(item.id, payload)
      .then(res => {
        this.getImageFun(finalData.id);
        console.log('DELTEIMAGE', res);
      })
      .catch(err => {
        console.log('err', err);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });

    // this.setState({
    //   imageModalStatus: false,
    //   imageData: '',
    //   imageName: '',
    //   imageDesc: '',
    // });
  };

  saveImageFun = () => {
    this.setState({
      imageModalStatus: false,
    });
  };

  render() {
    const {
      isDatePickerVisibleOrder,
      isDatePickerVisibleDelivery,
      finalOrderDate,
      finalDeliveryDate,
      orderItemsFinal,
      saveLoader,
      saveTouchableStatus,
      selectedTextUser,
      supplierId,
      supplierName,
      placedByData,
      finalData,
      isDatePickerVisibleArrived,
      finalArrivedDate,
      invoiceNumber,
      deliveryReference,
      pageNotes,
      pageFrozenTemp,
      pageChilledTemp,
      pageAmbientTemp,
      chooseImageModalStatus,
      imageModalStatus,
      imageData,
      imageName,
      imageDesc,
    } = this.state;
    // console.log('finalData', finalData);
    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfileFun}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginBottom: hp('2%')}}
          ref={ref => {
            this.scrollListReftop = ref;
          }}>
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
                    {translate('Pending')} - {finalData.supplierName}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{marginHorizontal: wp('6%'), marginTop: hp('2%')}}>
              <View>
                <View
                  style={{
                    backgroundColor: '#F4F4F4',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Order No')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#4A4C55',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        fontWeight: 'bold',
                      }}>
                      {finalData.orderReference}
                    </Text>
                    {/* <Image
                      source={img.calenderIcon}
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'contain',
                        tintColor: 'grey',
                        marginRight: 10,
                        tintColor: 'grey',
                      }}
                    /> */}
                  </View>
                </View>

                <View style={{}}>
                  <TouchableOpacity
                    disabled={true}
                    // onPress={() => this.showDatePickerFunDelivery()}
                    style={{
                      backgroundColor: '#fff',
                      padding: 12,
                      marginBottom: hp('2%'),
                      borderRadius: 6,
                    }}>
                    <View style={{}}>
                      <Text>{translate('Delivery Date')}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <TextInput
                        placeholder={translate('DD/MM/YY')}
                        value={finalDeliveryDate}
                        editable={false}
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 20,
                          height: 20,
                          resizeMode: 'contain',
                          marginRight: 10,
                          tintColor: 'grey',
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleDelivery}
                  mode={'date'}
                  onConfirm={this.handleConfirmDelivery}
                  onCancel={this.hideDatePickerDelivery}
                  // minimumDate={minTime}
                />

                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => this.showDatePickerFunArrived()}
                    style={{
                      backgroundColor: '#fff',
                      padding: 12,
                      marginBottom: hp('2%'),
                      borderRadius: 6,
                    }}>
                    <View style={{}}>
                      <Text>{translate('Arrived Date')}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholder={translate('DD/MM/YY')}
                        value={finalArrivedDate}
                        editable={false}
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 20,
                          tintColor: 'grey',
                          height: 20,
                          resizeMode: 'contain',
                          marginRight: 10,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleArrived}
                  mode={'date'}
                  onConfirm={this.handleConfirmArrived}
                  onCancel={this.hideDatePickerArrived}
                  // minimumDate={minTime}
                />

                <View style={{}}>
                  <TouchableOpacity
                    disabled={true}
                    // onPress={() => this.showDatePickerFunOrder()}
                    style={{
                      backgroundColor: '#fff',
                      padding: 12,
                      marginBottom: hp('2%'),
                      borderRadius: 6,
                    }}>
                    <View style={{}}>
                      <Text>{translate('Order Date')}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholder={translate('DD/MM/YY')}
                        value={finalOrderDate}
                        editable={false}
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                        }}
                      />
                      <Image
                        source={img.calenderIcon}
                        style={{
                          width: 20,
                          tintColor: 'grey',
                          height: 20,
                          resizeMode: 'contain',
                          marginRight: 10,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={isDatePickerVisibleOrder}
                  mode={'date'}
                  onConfirm={this.handleConfirmOrder}
                  onCancel={this.hideDatePickerOrder}
                  // minimumDate={minTime}
                />
                <View
                  style={{
                    backgroundColor: '#F4F4F4',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Placed by')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#4A4C55',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        fontWeight: 'bold',
                      }}>
                      {placedByData}
                    </Text>
                    <Image
                      source={img.calenderIcon}
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'contain',
                        tintColor: 'grey',
                        marginRight: 10,
                        tintColor: 'grey',
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: '#F4F4F4',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Supplier')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <Text
                      style={{
                        color: '#4A4C55',
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        fontWeight: 'bold',
                      }}>
                      {finalData.supplierName}
                    </Text>
                    <Image
                      source={img.calenderIcon}
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'contain',
                        tintColor: 'grey',
                        marginRight: 10,
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: '#F4F4F4',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>
                      {translate('Delivery Note reference')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={deliveryReference}
                      editable={false}
                      onChangeText={value =>
                        this.setState({
                          deliveryReference: value,
                        })
                      }
                      style={{
                        fontWeight: 'bold',
                        color: 'black',
                        width: '80%',
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Invoice Number')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={invoiceNumber}
                      onChangeText={value =>
                        this.setState({
                          invoiceNumber: value,
                        })
                      }
                      style={{
                        fontWeight: 'bold',
                        color: 'black',
                        width: '80%',
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Ambient Temperature')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={pageAmbientTemp}
                      onChangeText={value =>
                        this.setState({
                          pageAmbientTemp: value,
                        })
                      }
                      style={{
                        fontWeight: 'bold',
                        color: 'black',
                        width: '80%',
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Chilled Temperature')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={pageChilledTemp}
                      onChangeText={value =>
                        this.setState({
                          pageChilledTemp: value,
                        })
                      }
                      style={{
                        fontWeight: 'bold',
                        color: 'black',
                        width: '80%',
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Frozen Temperature')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={pageFrozenTemp}
                      onChangeText={value =>
                        this.setState({
                          pageFrozenTemp: value,
                        })
                      }
                      style={{
                        fontWeight: 'bold',
                        color: 'black',
                        width: '80%',
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: hp('2%'),
                    height: hp('20%'),
                  }}>
                  <View style={{}}>
                    <Text style={{}}>{translate('Notes')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TextInput
                      value={pageNotes}
                      onChangeText={value =>
                        this.setState({
                          pageNotes: value,
                        })
                      }
                      style={{
                        fontWeight: 'bold',
                        color: 'black',
                        width: '90%',
                      }}
                      multiline
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => this.handleChoosePhoto()}
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Image
                    source={img.cameraIcon}
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'contain',
                      marginRight: 10,
                      tintColor: '#5297c1',
                    }}
                  />

                  <Text
                    style={{
                      color: '#5297c1',
                      fontSize: 15,
                      fontWeight: 'bold',
                      textDecorationLine: 'underline',
                    }}>
                    {translate('Add image')}
                  </Text>
                </TouchableOpacity>

                {imageData
                  ? imageData &&
                    imageData.map((item, index) => {
                      return (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{marginTop: 15}}
                            onPress={() =>
                              this.setState({
                                imageModalStatus: true,
                              })
                            }>
                            <Image
                              style={{
                                width: wp('60%'),
                                height: 100,
                                resizeMode: 'contain',
                              }}
                              source={{uri: item.imageText}}
                            />
                          </View>
                          <TouchableOpacity
                            style={{
                              backgroundColor: 'red',
                              padding: 10,
                              borderRadius: 6,
                            }}
                            onPress={() => this.deleteImageFun(item)}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: '#fff',
                                fontWeight: 'bold',
                              }}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  : null}
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal isVisible={chooseImageModalStatus} backdropOpacity={0.35}>
          <View
            style={{
              width: wp('80%'),
              height: hp('30%'),
              backgroundColor: '#fff',
              alignSelf: 'center',
              borderRadius: 10,
            }}>
            <View
              style={{
                height: hp('7%'),
                flexDirection: 'row',
              }}>
              <View
                style={{
                  flex: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 16, color: 'black'}}>
                  {translate('Add image')}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => this.setModalVisibleImage(false)}>
                  <Image
                    source={img.cancelIcon}
                    style={{
                      height: 22,
                      width: 22,
                      tintColor: 'black',
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{padding: hp('3%')}}>
              <TouchableOpacity
                onPress={() => this.choosePhotoFun()}
                style={{
                  width: wp('70%'),
                  height: hp('7%'),
                  alignSelf: 'flex-end',
                  backgroundColor: '#5297c1',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 6,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 'bold',
                  }}>
                  {translate('Choose image from gallery')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.clickPhotoFun()}
                style={{
                  width: wp('70%'),
                  height: hp('7%'),
                  alignSelf: 'flex-end',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#5297c1',
                    fontSize: 15,
                    fontWeight: 'bold',
                  }}>
                  {translate('Click Photo')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* <Modal isVisible={imageModalStatus} backdropOpacity={0.35}>
          <View
            style={{
              width: wp('80%'),
              height: hp('70%'),
              backgroundColor: '#fff',
              alignSelf: 'center',
            }}>
            <View
              style={{
                height: hp('7%'),
                flexDirection: 'row',
              }}>
              <View
                style={{
                  flex: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 16, color: 'black'}}>Add Photo</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => this.setModalVisibleImage(false)}>
                  <Image
                    source={img.cancelIcon}
                    style={{
                      height: 22,
                      width: 22,
                      tintColor: 'black',
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView>
              <View style={{padding: hp('3%')}}>
                <View>
                  <Image
                    style={{
                      width: wp('60%'),
                      height: 100,
                      resizeMode: 'cover',
                    }}
                    source={{uri: imageData.path}}
                  />
                </View>
                <View style={{}}>
                  <TextInput
                    placeholder="Enter Name"
                    value={imageName}
                    style={{
                      borderWidth: 1,
                      padding: 12,
                      marginBottom: hp('3%'),
                      justifyContent: 'space-between',
                      marginTop: 20,
                      borderRadius: 6,
                    }}
                    onChangeText={value => {
                      this.setState({
                        imageName: value,
                      });
                    }}
                  />
                </View>
                <View style={{}}>
                  <TextInput
                    placeholder="Enter Description"
                    value={imageDesc}
                    style={{
                      borderWidth: 1,
                      padding: 12,
                      marginBottom: hp('3%'),
                      justifyContent: 'space-between',
                      borderRadius: 6,
                    }}
                    onChangeText={value => {
                      this.setState({
                        imageDesc: value,
                      });
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => this.deleteImageFun()}
                  style={{
                    width: wp('70%'),
                    height: hp('7%'),
                    alignSelf: 'flex-end',
                    backgroundColor: 'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 6,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 'bold',
                    }}>
                    {translate('Delete')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.saveImageFun()}
                  style={{
                    width: wp('70%'),
                    height: hp('7%'),
                    alignSelf: 'flex-end',
                    backgroundColor: '#5297c1',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    borderRadius: 6,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 'bold',
                    }}>
                    {translate('Save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal> */}
        <View style={{}}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: hp('1%'),
            }}>
            <TouchableOpacity
              disabled={finalArrivedDate ? false : true}
              onPress={() => this.processOrderFun()}
              style={{
                width: wp('90%'),
                height: hp('7%'),
                backgroundColor: finalArrivedDate ? '#5297c1' : '#DCDCDC',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginBottom: 5,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                {saveLoader ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  translate('Save')
                )}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={{
                width: wp('90%'),
                height: hp('7%'),
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <Text
                style={{
                  color: '#5297c1',
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                {translate('Cancel')}
              </Text>
            </TouchableOpacity>
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

export default connect(mapStateToProps, {UserTokenAction})(
  PendingOrderDelivery,
);
