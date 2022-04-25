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
  getPendingMepsApi,
  deleteMepApi,
  getMepsHistoryApi,
  getMepsOldHistoryApi,
  getMepRecipesApi,
  newMepListApi,
  getMepRecipeByIdsApi,
  updateMepListApi,
  getAdvanceRecipeByIdsApi,
} from '../../connectivity/api';
import Modal from 'react-native-modal';
import Accordion from 'react-native-collapsible/Accordion';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {MultipleSelectPicker} from 'react-native-multi-select-picker';
import {translate} from '../../utils/translations';

var minTime = new Date();
minTime.setHours(0);
minTime.setMinutes(0);
minTime.setMilliseconds(0);

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [
        {name: translate('History'), icon: img.historyIcon, id: 0},
        {name: translate('Add new'), icon: img.addIcon, id: 1},
        {name: translate('Back'), id: 2},
      ],
      token: '',
      modalVisible: false,
      firstName: '',
      modalVisibleAdd: false,
      activeSections: [],
      SECTIONS: [],
      recipeLoader: false,
      modalVisibleRecipeDetails: false,
      sectionData: {},
      isMakeMeStatus: true,
      SECTIONS_HISTORY: [],
      activeSectionsHistory: [],
      recipeLoaderHistory: true,
      isDatePickerVisible: false,
      finalDate: '',
      selectectedItems: [],
      isShownPicker: false,
      items: [],
      productionDate: '',
      applyStatus: false,
      detailsLoader: false,
      quantity: '',
      notes: '',
      advanceDetailsLoader: false,
      sectionAdvanceData: {},
      recipeID: '',
    };
  }

  setModalVisible = visible => {
    this.setState({modalVisible: visible});
  };

  setModalVisibleAdd = visible => {
    this.setState({modalVisibleAdd: visible});
  };

  setModalVisibleRecipeDetails = (visible, data) => {
    this.setState(
      {
        modalVisibleRecipeDetails: visible,
        detailsLoader: true,
      },
      () =>
        getMepRecipeByIdsApi(data.id)
          .then(res => {
            this.setState({
              modalVisibleRecipeDetails: visible,
              sectionData: res.data,
              detailsLoader: false,
              quantity: JSON.stringify(res.data && res.data.quantity),
              notes: res.data && res.data.notes,
            });
          })
          .catch(err => {
            this.setState({
              detailsLoader: false,
            });
            console.warn('ERR', err);
          }),
    );
  };
  setModalVisibleRecipeDetailsClose = visible => {
    this.setState({
      modalVisibleRecipeDetails: visible,
    });
  };

  setModalAdvanceRecipeDetails = (visible, data) => {
    this.setState(
      {
        modalAdvanceRecipeDetails: visible,
        advanceDetailsLoader: true,
      },
      () =>
        getAdvanceRecipeByIdsApi(data.recipeId)
          .then(res => {
            this.setState({
              modalAdvanceRecipeDetails: visible,
              sectionAdvanceData: res.data,
              advanceDetailsLoader: false,
              recipeID: data.recipeId,
            });
          })
          .catch(err => {
            this.setState({
              advanceDetailsLoader: false,
            });
            console.warn('ERR', err);
          }),
    );
  };

  setModalAdvanceRecipeDetailsClose = visible => {
    this.setState({
      modalAdvanceRecipeDetails: visible,
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
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  getPendingMepsData = () => {
    this.setState(
      {
        recipeLoader: true,
      },
      () =>
        getPendingMepsApi()
          .then(res => {
            function extract() {
              var groups = {};

              res.data.forEach(function (val) {
                var date = val.productionDate.split('T')[0];
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

            const reversedArray = finalArray.reverse();

            this.setState({
              SECTIONS: [...reversedArray],
              recipeLoader: false,
            });
          })
          .catch(err => {
            console.log('ERR MEP', err);

            this.setState({
              recipeLoader: false,
            });
          }),
    );
  };

  componentDidMount() {
    this.getData();
    this.getPendingMepsData();
    this.getHistoryMepData();
  }

  getHistoryMepData = () => {
    this.setState(
      {
        recipeLoaderHistory: true,
      },
      () =>
        getMepsHistoryApi()
          .then(res => {
            function extract() {
              var groups = {};

              res.data.forEach(function (val) {
                var date = val.productionDate.split('T')[0];
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

            this.setState({
              SECTIONS_HISTORY: [...finalArray],
              recipeLoaderHistory: false,
            });
          })
          .catch(err => {
            console.log('ERR MEP', err);

            this.setState({
              recipeLoaderHistory: false,
            });
          }),
    );
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = item => {
    if (item.id === 0) {
      this.setModalVisible(true);
      this.getHistoryMepData();
    } else if (item.id === 1) {
      this.setModalVisibleAdd(true);
      this.setState({
        selectectedItems: [],
        preparedDate: '',
        finalDate: '',
        items: [],
        isShownPicker: false,
        applyStatus: false,
      });
    } else if (item.id === 2) {
      this.props.navigation.goBack();
    }
  };

  onPressCollapseFun = () => {
    this.setState({
      activeSections: [],
    });
  };

  onPressCollapseHisFun = () => {
    this.setState({
      activeSectionsHistory: [],
    });
  };

  _renderHeader = (section, index, isActive) => {
    var todayFinal = moment(new Date()).format('dddd, MMM DD YYYY');

    const finalData = moment(section.title).format('dddd, MMM DD YYYY');

    return (
      <View
        style={{
          backgroundColor: '#EAEAF1',
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: '#D1D1D6',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
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
            color: '#98989B',
            fontSize: 15,
            fontWeight: 'bold',
            marginLeft: wp('2%'),
          }}>
          {todayFinal === finalData ? 'Today' : finalData}
        </Text>
      </View>
    );
  };
  _renderHeaderHistory = (section, index, isActive) => {
    const finalData = moment(section.title).format('dddd, MMM DD YYYY');
    return (
      <View
        style={{
          backgroundColor: '#EAEAF1',
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: '#D1D1D6',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
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
            color: '#98989B',
            fontSize: 15,
            fontWeight: 'bold',
            marginLeft: wp('2%'),
          }}>
          {finalData}
        </Text>
      </View>
    );
  };

  updatePreparedStatusFun = section => {
    let payload = [
      {
        id: section.id,
        recipeVersionId: section.recipeVersionId,
        userId: section.userId,
        preparedById: 'string',
        madeBy: 'string',
        requestedBy: 'string',
        preparedBy: 'string',
        isPrepared: !section.isPrepared,
        isRecycled: section.isRecycled,
        isTracked: section.isTracked,
        name: section.name,
        unit: section.unit,
        productionDate: section.productionDate,
        preparedDate: section.preparedDate,
        recipeId: section.recipeId,
        quantity: section.quantity,
        notes: section.notes,
      },
    ];
    updateMepListApi(payload)
      .then(res => {
        this.setState(
          {
            modalVisibleRecipeDetails: false,
            sectionData: '',
          },
          () => this.getPendingMepsData(),
        );
      })
      .catch(err => {
        console.warn('ERRDeleteMep', err.response);
      });
  };

  _renderContent = section => {
    return (
      <View style={{marginTop: hp('2%')}}>
        {section.content.map((item, index) => {
          return (
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Switch
                  style={{width: '14%'}}
                  trackColor={{
                    false: '#767577',
                    true: '#94C036',
                  }}
                  value={!item.isPrepared}
                  onValueChange={() => this.updatePreparedStatusFun(item)}
                  thumbColor="#fff"
                />
                <View style={{flex: 2}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setModalVisibleRecipeDetails(true, item)
                    }>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginLeft: wp('2%'),
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setModalAdvanceRecipeDetails(true, item)
                    }
                    style={{backgroundColor: '#94C036', padding: 5}}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#fff',
                        textAlign: 'center',
                      }}>
                      {translate('View Recipe')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text style={{fontSize: 12, marginLeft: wp('5%')}}>
                  {item.notes}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  _renderContentHistory = section => {
    return (
      <View style={{marginTop: hp('2%')}}>
        {section.content.map((item, index) => {
          return (
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 2}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState(
                        {
                          modalVisible: false,
                        },
                        () =>
                          setTimeout(() => {
                            this.setModalVisibleRecipeDetails(true, item);
                          }, 500),
                      )
                    }>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        textAlign: 'left',
                        paddingVertical: 8,
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text>{item.quantity} g</Text>
                </View>
              </View>
              <View style={{borderBottomWidth: 1}}></View>
            </View>
          );
        })}
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState({
      activeSections,
    });
  };
  _updateSectionsHistory = activeSectionsHistory => {
    this.setState({
      activeSectionsHistory,
    });
  };

  updateRecipeDetailsFun = () => {
    const {sectionData, quantity, notes} = this.state;
    let payload = [
      {
        id: sectionData.id,
        recipeVersionId: sectionData.recipeVersionId,
        userId: sectionData.userId,
        preparedById: 'string',
        madeBy: 'string',
        requestedBy: 'string',
        preparedBy: 'string',
        isPrepared: sectionData.isPrepared,
        isRecycled: sectionData.isRecycled,
        isTracked: sectionData.isTracked,
        name: sectionData.name,
        unit: sectionData.unit,
        productionDate: sectionData.productionDate,
        preparedDate: sectionData.preparedDate,
        recipeId: sectionData.recipeId,
        quantity: quantity,
        notes: notes,
      },
    ];
    updateMepListApi(payload)
      .then(res => {
        this.setState(
          {
            modalVisibleRecipeDetails: false,
            sectionData: '',
          },
          () => this.getPendingMepsData(),
        );
      })
      .catch(err => {
        console.warn('ERRDeleteMep', err.response);
      });
  };

  toggleSwitchNotif = data => {
    this.setState(
      {
        modalVisibleRecipeDetails: false,
      },
      () => this.updatePreparedStatusFun(data),
    );
  };

  deleteMepFunSec = () => {
    const {sectionData} = this.state;
    let payload = {
      id: sectionData.id,
      recipeVersionId: sectionData.recipeVersionId,
      userId: sectionData.userId,
      preparedById: 'string',
      madeBy: 'string',
      requestedBy: 'string',
      preparedBy: 'string',
      isPrepared: sectionData.isPrepared,
      isRecycled: sectionData.isRecycled,
      isTracked: sectionData.isTracked,
      name: sectionData.name,
      unit: sectionData.unit,
      productionDate: sectionData.productionDate,
      preparedDate: sectionData.preparedDate,
      recipeId: sectionData.recipeId,
      quantity: sectionData.quantity,
      notes: sectionData.notes,
    };
    deleteMepApi(payload)
      .then(res => {
        this.setState(
          {
            modalVisibleRecipeDetails: false,
            sectionData: '',
          },
          () => this.getPendingMepsData(),
        );
      })
      .catch(err => {
        console.warn('ERRDeleteMep', err.response);
      });
  };

  deleteMepFun = () => {
    Alert.alert('Are you sure?', "You won't be able to revert this!", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => this.deleteMepFunSec()},
    ]);
  };

  getOldMepHistoryData = () => {
    const {SECTIONS_HISTORY} = this.state;
    this.setState(
      {
        recipeLoaderHistory: true,
      },
      () =>
        getMepsOldHistoryApi()
          .then(res => {
            function extract() {
              var groups = {};

              res.data.forEach(function (val) {
                var date = val.productionDate.split('T')[0];
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

            this.setState({
              SECTIONS_HISTORY: [...SECTIONS_HISTORY, ...finalArray],
              recipeLoaderHistory: false,
            });
          })
          .catch(err => {
            console.log('ERR MEP', err);

            this.setState({
              recipeLoaderHistory: false,
            });
          }),
    );
  };

  onPressApplyFun = () => {
    const {selectectedItems, productionDate, applyStatus} = this.state;
    if (productionDate === '' || selectectedItems.length === 0) {
      alert('Please select date and recipe');
    } else if (applyStatus === false) {
      this.setState(
        {
          isShownPicker: false,
          applyStatus: true,
        },
        () => this.createpayloadFun(),
      );
    }
  };

  createpayloadFun = () => {
    let newData = [];
    const {selectectedItems, productionDate} = this.state;
    selectectedItems.map(item => {
      const obj = {};
      obj.isSelected = true;
      obj.notes = '';
      obj.productionDate = productionDate;
      obj.quantity = item.quantity;
      obj.recipeId = item.value;
      obj.name = item.label;
      newData = [...newData, obj];
    });
    this.setState({
      selectectedItems: newData,
    });
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  getRecipesData = () => {
    const {finalDate} = this.state;
    getMepRecipesApi(finalDate)
      .then(res => {
        const {data} = res;
        let newData = [];
        data.map(item => {
          const obj = {};
          obj.label = item.name;
          obj.value = item.id;
          obj.quantity = item.batchQuantity;
          newData = [...newData, obj];
        });
        this.setState({
          items: newData,
        });
      })
      .catch(err => {
        console.warn('Err', err);
      });
  };

  handleConfirm = date => {
    let newdate = moment(date).format('L');
    this.setState(
      {
        finalDate: newdate,
        productionDate: date,
      },
      () => this.getRecipesData(),
    );

    this.hideDatePicker();
  };

  showDatePickerFun = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  addMepListFun = () => {
    const {selectectedItems, productionDate} = this.state;

    if (productionDate === '' || selectectedItems.length === 0) {
      alert('Please select date and recipe');
    } else {
      newMepListApi(selectectedItems)
        .then(res => {
          this.setState(
            {
              modalVisibleAdd: false,
              selectectedItems: [],
            },
            () => this.getPendingMepsData(),
          );
        })
        .catch(err => {
          console.warn('ERRDeleteMep', err.response);
        });
    }
  };

  openRecipeDropDown = () => {
    const {applyStatus, finalDate} = this.state;
    if (finalDate) {
      if (applyStatus) {
        this.setState({
          isShownPicker: false,
        });
      } else {
        this.setState({
          isShownPicker: true,
        });
      }
    } else {
      alert('Please select date first.');
    }
  };

  showAdvanceView = () => {
    const {recipeID} = this.state;
    this.setState(
      {
        modalAdvanceRecipeDetails: false,
      },
      () =>
        this.props.navigation.navigate('MepAdvanceScreen', {
          recipeID: recipeID,
        }),
    );
  };

  render() {
    const {
      modalVisible,
      modalVisibleAdd,
      recipeLoader,
      SECTIONS,
      activeSections,
      firstName,
      buttons,
      modalVisibleRecipeDetails,
      sectionData,
      isMakeMeStatus,
      SECTIONS_HISTORY,
      activeSectionsHistory,
      recipeLoaderHistory,
      isDatePickerVisible,
      finalDate,
      isShownPicker,
      selectectedItems,
      items,
      applyStatus,
      detailsLoader,
      quantity,
      notes,
      advanceDetailsLoader,
      modalAdvanceRecipeDetails,
      sectionAdvanceData,
    } = this.state;
    const finalDateData = moment(sectionData.productionDate).format(
      'dddd, MMM DD YYYY',
    );
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Header
          logout={firstName}
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        {/* <SubHeader /> */}
        <ScrollView style={{marginBottom: hp('5%')}}>
          <View
            style={{
              backgroundColor: '#412916',
              alignItems: 'center',
              paddingVertical: hp('3%'),
            }}>
            <Text style={{fontSize: 22, color: 'white'}}>
              {translate('Mise-en-Place')}
            </Text>
            {buttons.map((item, index) => {
              return (
                <View style={{}} key={index}>
                  <TouchableOpacity
                    onPress={() => this.onPressFun(item)}
                    style={{
                      flexDirection: 'row',
                      height: hp('6%'),
                      width: wp('70%'),
                      backgroundColor: '#94C036',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                    }}>
                    <View style={{}}>
                      <Image
                        source={item.icon}
                        style={{
                          height: 22,
                          width: 22,
                          tintColor: 'white',
                          resizeMode: 'contain',
                        }}
                      />
                    </View>
                    <View style={{}}>
                      <Text style={{color: 'white', marginLeft: 5}}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View>
                    {/* // Recipe History Modal */}
                    <Modal isVisible={modalVisible} backdropOpacity={0.35}>
                      <View
                        style={{
                          width: wp('80%'),
                          height: hp('80%'),
                          backgroundColor: '#fff',
                          alignSelf: 'center',
                        }}>
                        <View
                          style={{
                            backgroundColor: '#412916',
                            height: hp('6%'),
                            flexDirection: 'row',
                          }}>
                          <View
                            style={{
                              flex: 3,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 16, color: '#fff'}}>
                              {translate('MISE-EN-PLACE HISTORY')}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              onPress={() => this.setModalVisible(false)}>
                              <Image
                                source={img.cancelIcon}
                                style={{
                                  height: 22,
                                  width: 22,
                                  tintColor: 'white',
                                  resizeMode: 'contain',
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <ScrollView style={{marginBottom: hp('2%')}}>
                          <View
                            style={{
                              padding: hp('3%'),
                            }}>
                            <View style={{}}>
                              <TouchableOpacity
                                onPress={() => this.onPressCollapseHisFun()}
                                style={{
                                  height: hp('5%'),
                                  width: wp('50%'),
                                  backgroundColor: '#94C036',
                                  alignSelf: 'center',
                                  marginTop: hp('5%'),
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Text style={{color: '#fff', fontSize: 16}}>
                                  {translate('Collapse All')}
                                </Text>
                              </TouchableOpacity>
                              {recipeLoaderHistory ? (
                                <ActivityIndicator
                                  color="#94C036"
                                  size="large"
                                />
                              ) : (
                                <View
                                  style={{
                                    marginTop: hp('3%'),
                                  }}>
                                  <Accordion
                                    expandMultiple
                                    underlayColor="#fff"
                                    sections={SECTIONS_HISTORY}
                                    activeSections={activeSectionsHistory}
                                    renderHeader={this._renderHeaderHistory}
                                    renderContent={this._renderContentHistory}
                                    onChange={this._updateSectionsHistory}
                                  />
                                  <TouchableOpacity
                                    onPress={() => this.getOldMepHistoryData()}
                                    style={{
                                      height: hp('8%'),
                                      width: wp('60%'),
                                      backgroundColor: '#F5F5F5',
                                      alignSelf: 'center',
                                      marginTop: hp('5%'),
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <Text
                                      style={{color: '#717171', fontSize: 16}}>
                                      {translate('view more (7 more days)')}
                                    </Text>
                                  </TouchableOpacity>
                                  <View style={{marginVertical: hp('3%')}}>
                                    <TouchableOpacity
                                      onPress={() =>
                                        this.setModalVisible(false)
                                      }
                                      style={{
                                        width: wp('50%'),
                                        height: hp('5%'),
                                        alignSelf: 'center',
                                        backgroundColor: '#E7943B',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <Text
                                        style={{
                                          color: '#fff',
                                          fontSize: 15,
                                          fontWeight: 'bold',
                                        }}>
                                        {translate('Close')}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )}
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                    </Modal>
                    {/* // Add Recipe Modal */}
                    <Modal isVisible={modalVisibleAdd} backdropOpacity={0.35}>
                      <View
                        style={{
                          width: wp('80%'),
                          height: isShownPicker ? hp('90%') : hp('60%'),
                          backgroundColor: '#fff',
                          alignSelf: 'center',
                        }}>
                        <View
                          style={{
                            backgroundColor: '#412916',
                            height: hp('6%'),
                            flexDirection: 'row',
                          }}>
                          <View
                            style={{
                              flex: 3,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 16, color: '#fff'}}>
                              {translate('MISE-EN-PLACE BUILDER')}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              onPress={() => this.setModalVisibleAdd(false)}>
                              <Image
                                source={img.cancelIcon}
                                style={{
                                  height: 22,
                                  width: 22,
                                  tintColor: 'white',
                                  resizeMode: 'contain',
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <ScrollView>
                          <View style={{padding: hp('3%')}}>
                            <View style={{}}>
                              <View style={{marginBottom: 10}}>
                                <Text>{translate('Production Date')}</Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => this.showDatePickerFun()}
                                style={{
                                  borderWidth: 1,
                                  padding: 10,
                                  marginBottom: hp('4%'),
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}>
                                <TextInput
                                  placeholder="dd-mm-yy"
                                  value={finalDate}
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
                              <TouchableOpacity
                                onPress={() => {
                                  this.openRecipeDropDown();
                                }}
                                style={{
                                  borderWidth: 1,
                                  padding: 10,
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}>
                                {selectectedItems.length > 0 ? (
                                  <View>
                                    {applyStatus ? (
                                      <View>
                                        {selectectedItems.map(item => {
                                          return (
                                            <View style={{marginTop: hp('1%')}}>
                                              <Text>{item.name}</Text>
                                            </View>
                                          );
                                        })}
                                      </View>
                                    ) : selectectedItems.length > 0 ? (
                                      <View>
                                        {selectectedItems.map(item => {
                                          return (
                                            <View style={{marginTop: hp('1%')}}>
                                              <Text>{item.label}</Text>
                                            </View>
                                          );
                                        })}
                                      </View>
                                    ) : null}
                                  </View>
                                ) : (
                                  <Text>Select recipe</Text>
                                )}
                                <Image
                                  source={img.arrowDownIcon}
                                  style={{
                                    width: 15,
                                    height: 15,
                                    resizeMode: 'contain',
                                  }}
                                />
                              </TouchableOpacity>
                              {isShownPicker ? (
                                <MultipleSelectPicker
                                  items={items}
                                  onSelectionsChange={ele => {
                                    this.setState({selectectedItems: ele});
                                  }}
                                  selectedItems={selectectedItems}
                                  buttonStyle={{
                                    height: 100,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                  buttonText="hello"
                                  checkboxStyle={{height: 20, width: 20}}
                                />
                              ) : null}

                              <TouchableOpacity
                                onPress={() => this.onPressApplyFun()}
                                style={{
                                  height: hp('5%'),
                                  width: wp('60%'),
                                  backgroundColor: '#94C036',
                                  alignSelf: 'center',
                                  marginTop: hp('5%'),
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Text style={{color: '#fff', fontSize: 16}}>
                                  {translate('Apply')}
                                </Text>
                              </TouchableOpacity>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  marginTop: hp('5%'),
                                }}>
                                <TouchableOpacity
                                  onPress={() => this.addMepListFun()}
                                  style={{
                                    height: hp('5%'),
                                    alignSelf: 'flex-end',
                                    backgroundColor: '#94C036',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: wp('2%'),
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
                                <TouchableOpacity
                                  onPress={() => this.setModalVisibleAdd(false)}
                                  style={{
                                    width: wp('15%'),
                                    height: hp('5%'),
                                    alignSelf: 'flex-end',
                                    backgroundColor: '#E7943B',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginLeft: wp('2%'),
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 15,
                                      fontWeight: 'bold',
                                    }}>
                                    {translate('Close')}
                                  </Text>
                                </TouchableOpacity>
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
                      </View>
                    </Modal>
                    {/* // Advance Recipe Details Modal */}
                    <Modal
                      isVisible={modalAdvanceRecipeDetails}
                      backdropOpacity={0.35}>
                      <View
                        style={{
                          width: wp('80%'),
                          height: hp('90%'),
                          backgroundColor: '#fff',
                          alignSelf: 'center',
                        }}>
                        <View
                          style={{
                            backgroundColor: '#412916',
                            height: hp('6%'),
                            flexDirection: 'row',
                          }}>
                          <View
                            style={{
                              flex: 3,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 14, color: '#fff'}}>
                              Recipe Details - {sectionAdvanceData.name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              onPress={() =>
                                this.setModalAdvanceRecipeDetailsClose(false)
                              }>
                              <Image
                                source={img.cancelIcon}
                                style={{
                                  height: 22,
                                  width: 22,
                                  tintColor: 'white',
                                  resizeMode: 'contain',
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {advanceDetailsLoader ? (
                          <ActivityIndicator color="#94C036" size="large" />
                        ) : (
                          <ScrollView>
                            <View style={{padding: hp('3%')}}>
                              <View style={{}}>
                                <ScrollView
                                  horizontal
                                  showsHorizontalScrollIndicator={false}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      paddingVertical: 8,
                                    }}>
                                    <View
                                      style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        marginLeft: wp('5%'),
                                      }}>
                                      <Text
                                        style={{
                                          color: '#4C4B4B',
                                          fontWeight: 'bold',
                                        }}>
                                        {translate('Recipe Name')}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        marginLeft: wp('5%'),
                                      }}>
                                      <Text style={{color: '#212529'}}>
                                        {sectionAdvanceData.name}
                                      </Text>
                                    </View>
                                  </View>
                                </ScrollView>
                                <ScrollView
                                  horizontal
                                  showsHorizontalScrollIndicator={false}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      paddingVertical: 8,
                                    }}>
                                    <View
                                      style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        marginLeft: wp('5%'),
                                      }}>
                                      <Text
                                        style={{
                                          color: '#4C4B4B',
                                          fontWeight: 'bold',
                                        }}>
                                        {translate('Version name')}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        marginLeft: wp('5%'),
                                      }}>
                                      <Text style={{color: '#212529'}}>
                                        {sectionAdvanceData.name}
                                      </Text>
                                    </View>
                                  </View>
                                </ScrollView>

                                <View
                                  style={{
                                    borderTopWidth: 1,
                                    borderTopColor: '#E5E5E5',
                                    marginVertical: hp('2%'),
                                  }}></View>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                  }}>
                                  <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text
                                      style={{
                                        color: '#4C4B4B',
                                        fontWeight: 'bold',
                                      }}>
                                      {translate('Ingredient')}
                                    </Text>
                                  </View>
                                  <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text style={{color: '#212529'}}>
                                      {translate('Quantity')}
                                    </Text>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    borderTopWidth: 1,
                                    borderTopColor: '#E5E5E5',
                                    marginVertical: hp('1%'),
                                  }}></View>
                                {Object.keys(sectionAdvanceData).length !== 0
                                  ? sectionAdvanceData.recipeVersions[0].ingredients.map(
                                      item => {
                                        return (
                                          <View
                                            style={{
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                              paddingVertical: 10,
                                            }}>
                                            <View
                                              style={{
                                                flex: 1,
                                                alignItems: 'center',
                                              }}>
                                              <Text
                                                style={{
                                                  color: '#4C4B4B',
                                                  fontWeight: 'bold',
                                                  textAlign: 'center',
                                                }}>
                                                {item.name}
                                              </Text>
                                            </View>
                                            <View
                                              style={{
                                                flex: 1,
                                                alignItems: 'center',
                                              }}>
                                              <Text style={{color: '#212529'}}>
                                                {item.quantity} g
                                              </Text>
                                            </View>
                                          </View>
                                        );
                                      },
                                    )
                                  : null}

                                <View
                                  style={{
                                    borderTopWidth: 1,
                                    borderTopColor: '#E5E5E5',
                                    marginVertical: hp('1%'),
                                  }}></View>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                  }}>
                                  <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text
                                      style={{
                                        color: '#4C4B4B',
                                        fontWeight: 'bold',
                                      }}>
                                      {translate('Total')}
                                    </Text>
                                  </View>
                                  <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text style={{color: '#212529'}}>50 g</Text>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    height: hp('20%'),
                                    borderColor: '#C9CCD7',
                                  }}>
                                  <TextInput
                                    placeholder="No instructions yet..."
                                    editable={false}
                                    value={
                                      Object.keys(sectionAdvanceData).length !==
                                      0
                                        ? sectionAdvanceData.recipeVersions[0]
                                            .instructions
                                        : 'No instructions yet...'
                                    }
                                  />
                                </View>
                              </View>
                              <TouchableOpacity
                                onPress={() => alert('Print Done')}
                                style={{
                                  width: wp('50%'),
                                  height: hp('5%'),
                                  backgroundColor: '#E2E6EA',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  marginTop: hp('2%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#64686C',
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                  }}>
                                  Print fiche technique
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{
                                  marginTop: hp('3%'),
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <TouchableOpacity
                                  onPress={() => this.showAdvanceView()}
                                  style={{
                                    width: wp('40%'),
                                    height: hp('5%'),
                                    backgroundColor: '#94C036',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 15,
                                      fontWeight: 'bold',
                                    }}>
                                    {translate('Advance view')}
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    this.setModalAdvanceRecipeDetailsClose(
                                      false,
                                    )
                                  }
                                  style={{
                                    width: wp('40%'),
                                    height: hp('5%'),
                                    backgroundColor: '#E7943B',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: hp('3%'),
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 15,
                                      fontWeight: 'bold',
                                    }}>
                                    {translate('Close')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </ScrollView>
                        )}
                      </View>
                    </Modal>
                    {/* // Recipe Details Modal */}
                    <Modal
                      isVisible={modalVisibleRecipeDetails}
                      backdropOpacity={0.35}>
                      <View
                        style={{
                          width: wp('85%'),
                          height: hp('90%'),
                          backgroundColor: '#fff',
                          alignSelf: 'center',
                        }}>
                        <View
                          style={{
                            backgroundColor: '#412916',
                            height: hp('6%'),
                            flexDirection: 'row',
                          }}>
                          <View
                            style={{
                              flex: 3,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 16, color: '#fff'}}>
                              MISE-EN-PLACE DETAILS
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              onPress={() =>
                                this.setModalVisibleRecipeDetailsClose(false)
                              }>
                              <Image
                                source={img.cancelIcon}
                                style={{
                                  height: 22,
                                  width: 22,
                                  tintColor: 'white',
                                  resizeMode: 'contain',
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {detailsLoader ? (
                          <ActivityIndicator color="#94C036" size="large" />
                        ) : (
                          <ScrollView>
                            <View style={{padding: hp('5%')}}>
                              <View style={{}}>
                                <View style={{}}>
                                  <Text
                                    style={{
                                      color: '#7F7F7F',
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                      marginBottom: 5,
                                    }}>
                                    {sectionData.name}
                                  </Text>
                                  <View
                                    style={{
                                      marginTop: hp('1%'),
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      marginVertical: hp('2%'),
                                    }}>
                                    <Switch
                                      style={{width: '20%'}}
                                      trackColor={{
                                        false: '#767577',
                                        true: '#94C036',
                                      }}
                                      value={!sectionData.isPrepared}
                                      onValueChange={() =>
                                        this.toggleSwitchNotif(sectionData)
                                      }
                                      thumbColor="#fff"
                                    />
                                    <Text
                                      style={{
                                        color: '#7F7F7F',
                                        marginLeft: wp('4%'),
                                        fontWeight: '900',
                                      }}>
                                      {!sectionData.isPrepared
                                        ? 'Make me'
                                        : 'Done'}
                                    </Text>
                                  </View>
                                </View>

                                <TouchableOpacity
                                  style={{
                                    height: hp('5%'),
                                    width: wp('62%'),
                                    backgroundColor: 'red',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                  }}
                                  onPress={() => this.deleteMepFun()}>
                                  <Image
                                    source={img.cancelIcon}
                                    style={{
                                      height: 22,
                                      width: 22,
                                      tintColor: 'white',
                                      resizeMode: 'contain',
                                    }}
                                  />
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                      marginLeft: 10,
                                    }}>
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                                <View
                                  style={{
                                    marginTop: hp('3%'),
                                  }}>
                                  <Text>Requested By</Text>
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    borderColor: '#C9CCD7',
                                    backgroundColor: '#EEEEEE',
                                  }}>
                                  <TextInput
                                    value={sectionData.requestedBy}
                                    editable={false}
                                  />
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    borderColor: '#C9CCD7',
                                    backgroundColor: '#EEEEEE',
                                  }}>
                                  <TextInput
                                    editable={false}
                                    value={finalDateData}
                                  />
                                </View>
                                <View
                                  style={{
                                    marginTop: hp('3%'),
                                  }}>
                                  <Text>Made By</Text>
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    borderColor: '#C9CCD7',
                                    backgroundColor: '#EEEEEE',
                                  }}>
                                  <TextInput
                                    value={sectionData.madeBy}
                                    editable={false}
                                  />
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    borderColor: '#C9CCD7',
                                    backgroundColor: '#EEEEEE',
                                  }}>
                                  <TextInput
                                    value={sectionData.madeBy}
                                    editable={false}
                                  />
                                </View>
                                <View
                                  style={{
                                    marginTop: hp('3%'),
                                  }}>
                                  <Text>Quantity</Text>
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    borderColor: '#C9CCD7',
                                  }}>
                                  <TextInput
                                    placeholder="Quantity"
                                    onChangeText={val =>
                                      this.setState({
                                        quantity: val,
                                      })
                                    }
                                    value={quantity}
                                  />
                                </View>
                                <View
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    borderColor: '#C9CCD7',
                                    backgroundColor: '#EEEEEE',
                                  }}>
                                  <TextInput
                                    value={sectionData.unit}
                                    editable={false}
                                  />
                                </View>
                                <View
                                  style={{
                                    marginTop: hp('3%'),
                                  }}>
                                  <Text>Note</Text>
                                </View>
                                <View
                                  onPress={() => this.showDatePickerFun()}
                                  style={{
                                    borderWidth: 1,
                                    padding: 10,
                                    marginTop: hp('2%'),
                                    height: hp('20%'),
                                    borderColor: '#C9CCD7',
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
                              </View>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  marginTop: hp('3%'),
                                }}>
                                <TouchableOpacity
                                  onPress={() => this.updateRecipeDetailsFun()}
                                  style={{
                                    width: wp('30%'),
                                    height: hp('5%'),
                                    backgroundColor: '#94C036',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 15,
                                      fontWeight: 'bold',
                                    }}>
                                    Save
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    this.setModalVisibleRecipeDetailsClose(
                                      false,
                                    )
                                  }
                                  style={{
                                    width: wp('30%'),
                                    height: hp('5%'),
                                    backgroundColor: '#E7943B',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 15,
                                      fontWeight: 'bold',
                                    }}>
                                    {translate('Close')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </ScrollView>
                        )}
                      </View>
                    </Modal>
                  </View>
                </View>
              );
            })}
          </View>
          <TouchableOpacity
            onPress={() => this.onPressCollapseFun()}
            style={{
              flexDirection: 'row',
              height: hp('6%'),
              width: wp('70%'),
              backgroundColor: '#94C036',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
              alignSelf: 'center',
            }}>
            <View style={{}}>
              <Text style={{color: 'white', marginLeft: 5}}>
                {translate('Collapse All')}
              </Text>
            </View>
          </TouchableOpacity>
          {recipeLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View style={{marginTop: hp('3%'), marginHorizontal: wp('5%')}}>
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
