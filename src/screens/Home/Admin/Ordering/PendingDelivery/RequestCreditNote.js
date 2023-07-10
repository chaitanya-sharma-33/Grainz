import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import React, {Component} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from '../style';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  viewCreditNoteApi,
  creditCreditNoteApi,
} from '../../../../../connectivity/api';
import img from '../../../../../constants/images';
import {translate} from '../../../../../utils/translations';
import CheckBox from '@react-native-community/checkbox';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class RequestCreditNote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromValue: '',
      toValue: '',
      ccValue: '',
      orderedValue: '',
      requestedPriceValue: '',
      buttonsSubHeader: [],
      loader: true,
      requestedPriceQty: 1,
      userId: '',
      userArr: [],
      pageData: '',
      finalOfferListArr: [],
      productId: '',
      isDatePickerVisibleDeliveryDate: false,
      finalDeliveryDate: '',
      apiDeliveryDate: '',
      imageData: '',
      isDatePickerVisibleArrivalDate: false,
      finalArrivalDate: '',
      apiArrivalDate: '',
      pageInvoiceNumber: '',
      pageDeliveryNoteReference: '',
      pageAmbientTemp: '',
      pageChilledTemp: '',
      pageFrozenTemp: '',
      pageNotes: '',
      pageOrderItems: [],
      finalApiData: [],
      loaderCompStatus: false,
      allSwitchStatus: false,
      modalVisibleEditElement: false,
      modalOrderedInventoryVolume: '',
      modalQuantityOrdered: '',
      modalQuantityDelivered: '',
      modalUserQuantityDelivered: '',
      modalQuantityInvoiced: '',
      modalUserQuantityInvoiced: '',
      modalPricePaid: '',
      modalNotes: '',
      modalData: '',
      flagStatus: false,
      initialValueAllCorrect: 'null',
      isCheckedEditableStatus: true,
      isDatePickerArrivalDateSpecific: false,
      supplierId: '',
      supplierName: '',
      totalValue: '',
      basketId: '',
      listId: '',
      showMoreStatus: false,
      chooseImageModalStatus: false,
      imageModalStatus: false,
      listIndex: '',
      finalData: '',
      switchValueAll: false,
      switchValueSingle: '',
      finalArrivedDate: '',
      productionDateArrived: '',
      checklistModalStatus: false,
      checklistNotes: '',
      inventoryName: '',
      productName: '',
      productCode: '',
      notArrivedStatus: false,
      flagAllStatus: false,
      deliveredQtyValue: '',
      mainPriceValue: '',
      orderItemId: '',
      supplierId: '',
      hasCreditNoteStatus: false,
      choicesProp: [
        {
          choiceCode: 'Y',
          choiceText: 'Y',
        },
        {
          choiceCode: 'N',
          choiceText: 'N',
        },
      ],
    };
  }

  getCreditNote = (id, emailDetails, modalData) => {
    viewCreditNoteApi(id)
      .then(res => {
        const {data} = res;
        console.log('DATA', data);
        this.setState({
          ccValue: data.ccEmail,
          toValue: data.email,
          imageData: data.image,
          modalNotes: data.message,
          requestedPriceQty: data.quantity,
          requestedPriceValue: parseFloat(data.requestedValue).toFixed(2),
          orderedNumberValue: modalData.quantityOrdered,
          deliveredQtyValue: modalData.quantityDelivered,
          orderedValue: parseFloat(modalData.orderValueExpected).toFixed(2),
          fromValue: emailDetails.subject,
        });
        console.log('Res', res);
      })
      .catch(err => {
        console.warn('ERr', err.response);
      });
  };

  componentDidMount = async () => {
    const location = await AsyncStorage.getItem('@location');
    const {modalData, emailDetails} =
      this.props.route && this.props.route.params;
    this.setState(
      {
        hasCreditNoteStatus: modalData.hasCreditNote > 0 ? true : false,
        locationId: location,
      },
      () => this.getFinalDataFun(modalData, emailDetails),
    );
  };

  getFinalDataFun = (modalData, emailDetails) => {
    console.log('modalData-->', modalData);

    const {hasCreditNoteStatus} = this.state;

    if (hasCreditNoteStatus) {
      this.getCreditNote(modalData.id, emailDetails, modalData);
    } else {
      this.setState({
        orderedNumberValue: modalData.quantityOrdered,
        deliveredQtyValue: modalData.quantityDelivered,
        orderedValue: parseFloat(modalData.orderValueExpected).toFixed(2),
        requestedPriceValue: parseFloat(
          modalData.unitPrice * modalData.packSize,
        ).toFixed(2),
        mainPriceValue: modalData.unitPrice * modalData.packSize,
        fromValue: emailDetails.subject,
        toValue: emailDetails.toRecipient,
        ccValue: emailDetails.ccRecipients,
        orderItemId: modalData.id,
        supplierId: modalData.supplierId,
      });
    }
  };

  sendRequestNoteFun = () => {
    const {
      ccValue,
      toValue,
      fromValue,
      requestedPriceValue,
      requestedPriceQty,
      orderItemId,
      supplierId,
      modalNotes,
      imageData,
      locationId,
    } = this.state;
    let payload = {
      ccEmail: ccValue,
      email: toValue,
      image: imageData,
      locationId: locationId,
      message: modalNotes,
      orderItemId: orderItemId,
      requestedValue: requestedPriceValue,
      quantity: requestedPriceQty,
      supplierId: supplierId,
    };

    console.log('PAYLOAD----->CREDIT', payload);

    creditCreditNoteApi(payload)
      .then(res => {
        console.log('RES-PROCESS ORDER', res);
        Alert.alert(
          `Grainz`,
          'Your request for a credit note was sent successfully.',
          [
            {
              text: 'Go back',
              onPress: () => this.props.navigation.goBack(),
            },
          ],
        );
      })
      .catch(err => {
        console.log('err', err);
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
          },
        ]);
      });
  };

  editCreditRequested = (type, value) => {
    const {requestedPriceValue, requestedPriceQty, mainPriceValue} = this.state;
    console.log('requestedPriceValue', requestedPriceValue);

    const Mainvalue = requestedPriceQty + 1;
    if (type === 'Minus') {
      this.setState({
        requestedPriceQty: parseInt(requestedPriceQty) - Number(1),
        requestedPriceValue:
          requestedPriceQty > 1
            ? parseFloat(requestedPriceValue).toFixed(2) - mainPriceValue
            : mainPriceValue,
      });
    } else if (type === 'Input') {
      this.setState({
        requestedPriceQty: value,
        requestedPriceValue:
          value > 0
            ? parseFloat(requestedPriceValue).toFixed(2) * value
            : mainPriceValue,
      });
    } else if (type === 'Add') {
      this.setState({
        requestedPriceQty: parseInt(requestedPriceQty) + Number(1),
        requestedPriceValue:
          requestedPriceQty > 0
            ? parseFloat(mainPriceValue).toFixed(2) * Mainvalue
            : mainPriceValue,
      });
    }
  };

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
    const {orderItemId} = this.state;
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
            console.log('image-FINAL', image);

            const finalImageData = {
              action: 'New',
              description: '',
              imageText: `data:image/png;base64,${image.data}`,
              name: '',
              path: image.path,
              position: 0,
              type: 'png',
              itemId: orderItemId,
            };

            console.log('image-finalImageData', finalImageData);

            this.setState({
              // imageModalStatus: true,
              imageData: finalImageData,
            });

            // this.setState({
            //   // imageModalStatus: true,
            //   imageData: image,
            // });
          });
        }, 500),
    );
  };

  clickPhotoFun = () => {
    const {orderItemId} = this.state;

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
          }).then(image => {
            const finalImageData = {
              action: 'New',
              description: '',
              imageText: `data:image/png;base64,${image.data}`,
              name: '',
              path: image.path,
              position: 0,
              type: 'png',
              itemId: orderItemId,
            };

            console.log('finalImageData', finalImageData);

            this.setState({
              // imageModalStatus: true,
              imageData: finalImageData,
            });
          });
        }, 500),
    );
  };

  render() {
    const {
      chooseImageModalStatus,
      buttonsSubHeader,
      loader,
      managerName,
      pageData,
      isDatePickerVisibleDeliveryDate,
      finalDeliveryDate,
      isDatePickerVisibleArrivalDate,
      finalArrivalDate,
      pageInvoiceNumber,
      pageDeliveryNoteReference,
      pageAmbientTemp,
      pageChilledTemp,
      pageFrozenTemp,
      pageNotes,
      pageOrderItems,
      loaderCompStatus,
      choicesProp,
      allSwitchStatus,
      initialValueAllCorrect,
      modalVisibleEditElement,
      modalOrderedInventoryVolume,
      modalQuantityOrdered,
      modalQuantityDelivered,
      modalUserQuantityDelivered,
      modalQuantityInvoiced,
      modalUserQuantityInvoiced,
      modalPricePaid,
      modalNotes,
      isDatePickerArrivalDateSpecific,
      finalArrivalDateSpecific,
      modalData,
      isCheckedStatus,
      isCheckedEditableStatus,
      totalValue,
      showMoreStatus,
      imageModalStatus,
      imageData,
      imageName,
      imageDesc,
      volume,
      packSize,
      unitPrizeModal,
      listIndex,
      finalData,
      switchSingleValue,
      switchValueAll,
      finalArrivedDate,
      isDatePickerVisibleArrived,
      productionDateArrived,
      checklistModalStatus,
      checklistNotes,
      inventoryName,
      productName,
      productCode,
      notArrivedStatus,
      flagStatus,
      priceExpected,
      priceActual,
      orderValueExpected,
      flagAllStatus,
      fromValue,
      toValue,
      ccValue,
      orderedValue,
      requestedPriceValue,
      orderedNumberValue,
      deliveredQtyValue,
      requestedPriceQty,
      hasCreditNoteStatus,
    } = this.state;
    console.log('hasCreditNoteStatus--->', hasCreditNoteStatus);
    // console.log('requestedPriceQty--->', requestedPriceQty);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#F5F8FE',
        }}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          enableOnAndroid>
          <View style={styles.secondContainer}>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: hp('10%'),
                marginHorizontal: wp('6%'),
              }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 100,
                  padding: 5,
                  marginRight: wp('2%'),
                }}>
                <Image
                  source={img.backIcon}
                  style={{
                    height: 15,
                    width: 15,
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View
                style={{
                  flex: 4,
                }}>
                {hasCreditNoteStatus ? (
                  <Text style={styles.textStylingLogo}>Credit note</Text>
                ) : (
                  <Text style={styles.textStylingLogo}>
                    {translate('_Request credit note')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <View
              style={{
                padding: 5,
                borderRadius: 6,
                flex: 1,
                marginHorizontal: wp('7%'),
              }}>
              <Text
                style={{
                  fontSize: 12,
                }}>
                {translate('From')}
              </Text>
              <TextInput
                value={fromValue}
                placeholder={translate('From')}
                style={{
                  paddingVertical: 10,
                  fontWeight: 'bold',
                  color: 'black',
                }}
                editable={false}
              />
            </View>

            <View
              style={{
                padding: 6,
                borderRadius: 6,
                flex: 1,
                marginHorizontal: wp('7%'),
                backgroundColor: hasCreditNoteStatus ? '#F2F2F2' : '#fff',
                marginBottom: hp('2%'),
              }}>
              <Text
                style={{
                  fontSize: 12,
                }}>
                {translate('To')}
              </Text>
              <TextInput
                value={toValue}
                editable={hasCreditNoteStatus ? false : true}
                placeholder={translate('To')}
                style={{
                  paddingVertical: 8,
                  fontWeight: 'bold',
                  color: 'black',
                }}
                onChangeText={value =>
                  this.setState({
                    toValue: value,
                  })
                }
              />
            </View>

            <View
              style={{
                padding: 6,
                borderRadius: 6,
                flex: 1,
                marginHorizontal: wp('7%'),
                backgroundColor: hasCreditNoteStatus ? '#F2F2F2' : '#fff',
                marginBottom: hp('2%'),
              }}>
              <Text
                style={{
                  fontSize: 12,
                }}>
                {translate('CC')}
              </Text>
              <TextInput
                value={ccValue}
                editable={hasCreditNoteStatus ? false : true}
                placeholder={translate('CC')}
                style={{
                  paddingVertical: 8,
                  fontWeight: 'bold',
                  color: 'black',
                }}
                onChangeText={value =>
                  this.setState({
                    ccValue: value,
                  })
                }
              />
            </View>

            <View
              style={{
                marginHorizontal: wp('3%'),
              }}>
              <View style={styles.insideContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    marginTop: hp('2%'),
                  }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#F4F4F4',
                      padding: 8,
                      borderRadius: 6,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                      }}>
                      {translate('_Ordered No')}
                    </Text>
                    <TextInput
                      placeholder={translate('_Ordered No')}
                      style={{
                        width: 80,
                        marginTop: 5,
                        fontWeight: 'bold',
                      }}
                      value={orderedNumberValue && String(orderedNumberValue)}
                      editable={false}
                    />
                  </View>
                  <View
                    style={{
                      flex: 0.3,
                    }}></View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#F4F4F4',
                      padding: 8,
                      borderRadius: 6,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                      }}>
                      {translate('_Delivered Qty')}
                    </Text>
                    <TextInput
                      placeholder="Delivered Qty."
                      value={deliveredQtyValue && String(deliveredQtyValue)}
                      style={{
                        width: 80,
                        marginTop: 5,
                        fontWeight: 'bold',
                      }}
                      editable={false}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    marginTop: hp('2%'),
                  }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#F4F4F4',
                      padding: 8,
                      borderRadius: 6,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                      }}>
                      {translate('Ordered Val')}
                    </Text>
                    <TextInput
                      placeholder={translate('Ordered Val')}
                      style={{
                        width: 80,
                        fontWeight: 'bold',
                        marginTop: 5,
                      }}
                      value={orderedValue && String(orderedValue)}
                      editable={false}
                    />
                  </View>

                  <View
                    style={{
                      flex: 0.3,
                    }}></View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: hasCreditNoteStatus ? '#F2F2F2' : '#fff',
                      padding: 8,
                      borderRadius: 6,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                      }}>
                      {translate('Requested price')}
                    </Text>
                    <TextInput
                      placeholder={translate('Requested price')}
                      editable={hasCreditNoteStatus ? false : true}
                      style={{
                        width: 80,
                        marginTop: 5,
                        fontWeight: 'bold',
                      }}
                      value={requestedPriceValue && String(requestedPriceValue)}
                      onChangeText={value =>
                        this.setState({
                          requestedPriceValue: value,
                        })
                      }
                    />
                  </View>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  marginHorizontal: wp('5%'),
                  marginTop: hp('3%'),
                  backgroundColor: hasCreditNoteStatus ? '#F2F2F2' : '#fff',
                  padding: 6,
                  borderRadius: 6,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                  }}>
                  {translate('Credit Requested Qty')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    disabled={hasCreditNoteStatus ? true : false}
                    onPress={() => this.editCreditRequested('Minus')}
                    style={{
                      width: wp('10%'),
                      height: hp('5%'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 29,
                        fontWeight: 'bold',
                        color: '#5197C1',
                      }}>
                      -
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    value={String(requestedPriceQty)}
                    editable={hasCreditNoteStatus ? false : true}
                    keyboardType="numeric"
                    style={{
                      borderRadius: 6,
                      padding: 10,
                      width: wp('15%'),
                      backgroundColor: '#fff',
                    }}
                    onChangeText={value =>
                      this.editCreditRequested('Input', value)
                    }
                  />
                  <TouchableOpacity
                    disabled={hasCreditNoteStatus ? true : false}
                    onPress={() => this.editCreditRequested('Add')}
                    style={{
                      width: wp('10%'),
                      height: hp('5%'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#5197C1',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{}}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <TextInput
                  placeholder={translate('Notes')}
                  multiline
                  style={{
                    padding: 10,
                    backgroundColor: hasCreditNoteStatus ? '#F2F2F2' : '#fff',
                    borderRadius: 10,
                    width: wp('85%'),
                    height: hp('12%'),
                    marginTop: 15,
                  }}
                  editable={hasCreditNoteStatus ? false : true}
                  value={modalNotes}
                  onChangeText={value =>
                    this.setState({
                      modalNotes: value,
                    })
                  }
                />
              </View>
            </View>

            {hasCreditNoteStatus ? null : (
              <TouchableOpacity
                onPress={() => this.handleChoosePhoto()}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginHorizontal: wp('7%'),
                  marginTop: hp('2%'),
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
            )}

            {imageData ? (
              <View
                style={{marginTop: 15, marginHorizontal: wp('6%')}}
                // onPress={() =>
                //   this.setState({
                //     imageModalStatus: true,
                //   })
                // }
              >
                <Image
                  style={{
                    width: wp('60%'),
                    height: 100,
                    resizeMode: 'cover',
                  }}
                  source={{uri: imageData.imageText}}
                />
              </View>
            ) : null}

            {hasCreditNoteStatus ? null : (
              <TouchableOpacity
                onPress={() => this.sendRequestNoteFun()}
                style={{
                  height: hp('7%'),
                  width: wp('87%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  alignSelf: 'center',
                  marginTop: hp('3%'),
                  backgroundColor: '#5197C1',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      marginLeft: 10,
                      fontFamily: 'Inter-SemiBold',
                    }}>
                    {translate('Send')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={{
                height: hp('7%'),
                width: wp('80%'),
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: hp('3%'),
                alignSelf: 'center',
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#5197C1',
                    marginLeft: 10,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {translate('Cancel')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

export default RequestCreditNote;
