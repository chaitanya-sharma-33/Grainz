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
  getManualLogsById,
  updateManualLogApi,
} from '../../connectivity/api';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import DropDownPicker from 'react-native-dropdown-picker';
import {translate} from '../../utils/translations';
import styles from './style';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

class EditManualLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      firstName: '',
      recipeLoader: false,
      sectionData: {},
      isMakeMeStatus: true,
      isDatePickerVisible: false,
      finalDate: moment(new Date()).format('DD-MM-YYYY'),
      itemsTypesArr: [],
      productionDate: moment.utc(new Date()).format(),
      detailsLoader: false,
      quantity: '',
      notes: '',
      recipeID: '',
      quantityName: '',
      selectedItems: [],
      items: [],
      departmentName: '',
      itemTypes: '',
      loading: false,
      selectedItemObjects: '',
      viewStatus: false,
      buttonsSubHeader: [],
      collapseStatus: true,
      quantityList: [],
      manualId: '',
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const manualId = route.params.manualId;
    this.getData();
    this.setState(
      {
        manualId,
      },
      () => this.manualDataFun(),
    );
  }

  manualDataFun = () => {
    const {manualId} = this.state;
    getManualLogsById(manualId)
      .then(res => {
        this.setState({
          sectionData: res.data,
          detailsLoader: false,
          quantity: JSON.stringify(res.data && res.data.quantity),
          notes: res.data && res.data.notes,
          viewStatus: false,
        });
      })
      .catch(err => {
        this.setState({
          detailsLoader: false,
        });
        console.warn('ERR', err);
      });
  };

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

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
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
        this.setState({}, () => this.getManualLogsData());
      })
      .catch(err => {
        console.warn('ERRUPDATE', err.response);
      });
  };

  updateRecipeDetailsFun = () => {
    const {sectionData, quantity, notes, itemTypes, selectedItemObjects} =
      this.state;
    let payload = {
      id: sectionData.id,
      itemId: sectionData.itemId,
      name: selectedItemObjects[0].name,
      loggedDate: sectionData.loggedDate,
      quantity: parseInt(quantity),
      itemTypeId: sectionData.itemTypeId,
      typeId: itemTypes.value,
      departmentId: selectedItemObjects[0].departmentId,
      unitId: sectionData.unitId,
      departmentName: selectedItemObjects[0].departmentName,
      category: selectedItemObjects[0].category,
      itemTypeName: sectionData.itemTypeName,
      typeName: itemTypes.label,
      reviewed: sectionData.reviewed,
      unit: sectionData.unit,
      userId: sectionData.userId,
      userFullName: sectionData.userFullName,
      units: [
        {
          id: sectionData.units[0].id,
          inventoryId: sectionData.units[0].inventoryId,
          name: sectionData.units[0].name,
          isDefault: true,
          isVariable: false,
          quantity: null,
          converter: 1,
          notes: null,
          action: null,
        },
      ],
      notes: notes,
      inUse: sectionData.inUse,
      countInInventory: sectionData.countInInventory,
    };
    updateManualLogApi(payload)
      .then(res => {
        this.setState(
          {
            sectionData: '',
          },
          () => this.getManualLogsData(),
        );
      })
      .catch(err => {
        console.warn('ERRDeleteMep', err.response);
      });
  };

  onSelectedItemsChange = selectedItems => {
    this.setState({selectedItems});
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  handleConfirm = date => {
    let newdate = moment(date).format('DD-MM-YYYY');
    this.setState({
      finalDate: newdate,
      productionDate: date,
    });

    this.hideDatePicker();
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  onSelectedItemObjectsChange = selectedItemObjects => {
    let finalArray = selectedItemObjects[0].units.map((item, index) => {
      return {
        label: item.name,
        value: item.id,
      };
    });

    this.setState({
      selectedItemObjects,
      quantityList: finalArray,
      quantityName:
        selectedItemObjects[0] && selectedItemObjects[0].units[0].id,
    });
  };

  selectQuantityFun = item => {
    if (item) {
      this.setState({
        quantityName: item.id,
      });
    }
  };
  render() {
    const {
      recipeLoader,
      SECTIONS,
      activeSections,
      firstName,
      sectionData,
      isDatePickerVisible,
      finalDate,
      itemsTypesArr,
      detailsLoader,
      quantity,
      notes,
      items,
      viewStatus,
      buttonsSubHeader,
      collapseStatus,
      productionDate,
      departmentName,
      selectedItemObjects,
      itemTypes,
      quantityName,
      quantityList,
    } = this.state;
    const finalDateData = moment(sectionData.loggedDate).format(
      'dddd, MMM DD YYYY',
    );
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
                    {translate('Manual Log small')} - {sectionData.name}
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

            <View style={{}}>
              <View>
                <View style={{}}>
                  {detailsLoader ? (
                    <ActivityIndicator color="#94C036" size="large" />
                  ) : (
                    <View style={{flex: 1}}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{padding: hp('3%')}}>
                          <View style={{}}>
                            <TouchableOpacity
                              onPress={() => this.showDatePickerFun()}
                              style={{
                                padding: 12,
                                marginBottom: hp('3%'),
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderRadius: 6,
                                backgroundColor: '#fff',
                              }}>
                              <TextInput
                                placeholder="dd-mm-yy"
                                value={finalDateData}
                                editable={false}
                              />
                              <Image
                                source={img.calenderIcon}
                                style={{
                                  width: 20,
                                  height: 20,
                                  resizeMode: 'contain',
                                }}
                              />
                            </TouchableOpacity>

                            <TextInput
                              placeholder="Quantity"
                              value={quantity}
                              style={{
                                padding: 12,
                                marginBottom: hp('3%'),
                                justifyContent: 'space-between',
                                borderRadius: 6,
                                backgroundColor: '#fff',
                              }}
                              keyboardType="number-pad"
                              onChangeText={value => {
                                this.setState({
                                  quantity: value,
                                });
                              }}
                            />

                            <View>
                              {/* <DropDownPicker
                                  disabled={true}
                                  placeholder="Select Department"
                                  items={[
                                    {
                                      label: 'Bar',
                                      value: 'Bar',
                                    },
                                    {
                                      label: 'Kitchen',
                                      value: 'Kitchen',
                                    },
                                    {
                                      label: 'Retail',
                                      value: 'Retail',
                                    },
                                    {
                                      label: 'Other',
                                      value: 'Other',
                                    },
                                  ]}
                                  zIndex={1000000}
                                  containerStyle={{
                                    height: 50,
                                    marginBottom: hp('3%'),
                                  }}
                                  style={{
                                    backgroundColor: '#fff',
                                    borderColor: '#fff',
                                  }}
                                  itemStyle={{
                                    justifyContent: 'flex-start',
                                  }}
                                  dropDownStyle={{backgroundColor: '#fff'}}
                                  onChangeItem={item =>
                                    this.selectDepartementNameFun(item)
                                  }
                                /> */}

                              {viewStatus ? (
                                <SectionedMultiSelect
                                  styles={{
                                    container: {
                                      paddingTop: hp('2%'),
                                      marginTop: hp('7%'),
                                    },
                                    selectToggle: {
                                      paddingVertical: 10,
                                      paddingHorizontal: 10,
                                      backgroundColor: '#fff',
                                      borderRadius: 6,
                                    },
                                  }}
                                  loadingComponent={
                                    <View
                                      style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <ActivityIndicator
                                        size="large"
                                        color="#94C036"
                                      />
                                    </View>
                                  }
                                  loading={this.state.loading}
                                  // hideSearch={true}
                                  single={true}
                                  items={items}
                                  IconRenderer={Icon}
                                  uniqueKey="id"
                                  subKey="children"
                                  selectText="Select"
                                  showDropDowns={true}
                                  readOnlyHeadings={true}
                                  onSelectedItemObjectsChange={
                                    this.onSelectedItemObjectsChange
                                  }
                                  onSelectedItemsChange={
                                    this.onSelectedItemsChange
                                  }
                                  selectedItems={this.state.selectedItems}
                                />
                              ) : (
                                <View>
                                  <Text
                                    style={{
                                      padding: 12,
                                      marginBottom: hp('3%'),
                                      justifyContent: 'space-between',
                                      backgroundColor: '#fff',
                                    }}>
                                    {sectionData.name}
                                  </Text>
                                </View>
                              )}
                              {viewStatus ? (
                                <DropDownPicker
                                  placeholder="Select Type"
                                  items={itemsTypesArr}
                                  containerStyle={{
                                    height: 50,
                                    marginTop: hp('3%'),
                                  }}
                                  defaultValue={this.state.itemTypes}
                                  style={{
                                    backgroundColor: '#fff',
                                    borderColor: '#fff',
                                  }}
                                  itemStyle={{
                                    justifyContent: 'flex-start',
                                  }}
                                  dropDownStyle={{backgroundColor: '#fff'}}
                                  onChangeItem={item =>
                                    this.setState({
                                      itemTypes: item,
                                    })
                                  }
                                />
                              ) : (
                                <View>
                                  <Text
                                    style={{
                                      padding: 12,
                                      marginBottom: hp('3%'),
                                      justifyContent: 'space-between',
                                      backgroundColor: '#fff',
                                    }}>
                                    {sectionData.typeName}
                                  </Text>
                                </View>
                              )}
                              <View
                                style={{
                                  padding: 15,
                                  backgroundColor: '#fff',
                                  borderRadius: 6,
                                  marginTop: viewStatus ? hp('3%') : null,
                                }}>
                                <TextInput
                                  placeholder="Note"
                                  onChangeText={value =>
                                    this.setState({
                                      notes: value,
                                    })
                                  }
                                  value={notes}
                                />
                              </View>
                              {/* <View
                                  style={{
                                    alignItems: 'center',
                                    marginTop: hp('4%'),
                                  }}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      this.deleteMepFun(sectionData)
                                    }
                                    style={{
                                      backgroundColor: 'red',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      width: wp('30%'),
                                      height: hp('5%'),
                                      justifyContent: 'center',
                                      borderRadius: 100,
                                    }}>
                                    <Image
                                      source={img.cancelIcon}
                                      style={{
                                        height: 15,
                                        width: 15,
                                        tintColor: 'white',
                                        resizeMode: 'contain',
                                      }}
                                    />
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: '#fff',
                                        textAlign: 'center',
                                      }}>
                                      {translate('Delete')}
                                    </Text>
                                  </TouchableOpacity>
                                </View> */}
                            </View>

                            <DateTimePickerModal
                              // is24Hour={true}
                              isVisible={isDatePickerVisible}
                              mode={'date'}
                              onConfirm={this.handleConfirm}
                              onCancel={this.hideDatePicker}
                              minimumDate={minTime}

                              // maximumDate={maxTime}
                              // minimumDate={new Date()}
                            />
                          </View>
                        </View>
                      </ScrollView>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 15,
                        }}>
                        <TouchableOpacity
                          onPress={() => this.updateRecipeDetailsFun()}
                          style={{
                            width: wp('30%'),
                            height: hp('5%'),
                            alignSelf: 'flex-end',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 100,
                            borderColor: '#482813',
                            backgroundColor: '#97C03D',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 15,
                              fontFamily: 'Inter-Regular',
                            }}>
                            {translate('Save')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.props.navigation.goBack()}
                          style={{
                            width: wp('30%'),
                            height: hp('5%'),
                            alignSelf: 'flex-end',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: wp('2%'),
                            borderColor: '#482813',
                            borderWidth: 1,
                            borderRadius: 100,
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
                  )}
                </View>
              </View>
            </View>
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

export default connect(mapStateToProps, {UserTokenAction})(EditManualLog);
