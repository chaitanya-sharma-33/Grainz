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
  Platform,
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
  getMepRecipeByIdsApi,
  updateMepListApi,
} from '../../connectivity/api';
import Modal from 'react-native-modal';
import Accordion from 'react-native-collapsible/Accordion';
import moment from 'moment';
import {translate} from '../../utils/translations';
import styles from './style';
import {ARRAY} from '../../constants/dummy';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      activeSections: [],
      SECTIONS: [],
      recipeLoader: false,
      modalVisibleRecipeDetails: false,
      sectionData: {},
      SECTIONS_HISTORY: [],
      activeSectionsHistory: [],
      recipeLoaderHistory: true,
      productionDate: '',
      detailsLoader: false,
      quantity: '',
      notes: '',
      recipeID: '',
      buttonsSubHeader: [],
      allDoneStatus: false,
      collapseStatus: true,
      collapseStatusMain: true,
    };
  }

  setModalVisible = visible => {
    this.setState({modalVisible: visible});
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
    this.props.navigation.addListener('focus', () => {
      this.getPendingMepsData();
    });
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

  onPressCollapseFun = () => {
    this.setState({
      activeSections: [],
      collapseStatusMain: true,
    });
  };

  onPressUnCollapseFun = () => {
    this.setState({
      activeSections: ARRAY,
      collapseStatusMain: false,
    });
  };

  onPressCollapseHisFun = () => {
    this.setState({
      activeSectionsHistory: [],
      collapseStatus: true,
    });
  };

  onPressUncollapseHisFun = () => {
    this.setState({
      activeSectionsHistory: ARRAY,
      collapseStatus: false,
    });
  };

  allDoneFun = (section, todayFinal, finalData, index, value) => {
    if (todayFinal === finalData) {
      const {allDoneStatus} = this.state;

      const value = !allDoneStatus;

      let newArr = section.content.map((item, i) =>
        index === i
          ? {
              ...item,
              ['isPrepared']: value,
            }
          : {
              ...item,
              ['isPrepared']: value,
            },
      );
      this.setState({
        allDoneStatus: value,
      });

      this.updateAllFun(newArr);
    }
  };

  _renderHeader = (section, index, isActive) => {
    var todayFinal = moment(new Date()).format('dddd, MMM DD YYYY');

    const finalData = moment(section.title).format('dddd, MMM DD YYYY');

    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: '#F0F0F0',
          borderLeftColor: '#F0F0F0',
          borderRightWidth: 1,
          borderRightColor: '#F0F0F0',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
          borderRadius: 6,
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            style={{
              height: 17,
              width: 17,
              resizeMode: 'contain',
              marginLeft: wp('2%'),
            }}
            source={isActive ? img.upArrowIcon : img.arrowRightIcon}
          />
          <Text
            style={{
              color: '#492813',
              fontSize: 15,
              marginLeft: wp('2%'),
              fontFamily: 'Inter-Regular',
            }}>
            {todayFinal === finalData ? 'Today' : finalData}
          </Text>
        </View>
        {todayFinal === finalData ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Switch
              style={{marginLeft: 5}}
              trackColor={{
                false: '#767577',
                true: '#94C036',
              }}
              value={!this.state.allDoneStatus}
              onValueChange={() =>
                this.allDoneFun(section, todayFinal, finalData, index)
              }
              thumbColor="#fff"
            />
            <Text
              style={{
                color: '#482813',
                fontFamily: 'Inter-SemiBold',
                marginLeft: 10,
                marginRight: 10,
              }}>
              All done
            </Text>
          </View>
        ) : null}
      </View>
    );
  };
  _renderHeaderHistory = (section, index, isActive) => {
    const finalData = moment(section.title).format('dddd, MMM DD YYYY');
    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: '#F0F0F0',
          borderLeftColor: '#F0F0F0',
          borderRightWidth: 1,
          borderRightColor: '#F0F0F0',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
          borderRadius: 6,
        }}>
        <Image
          style={{
            height: 17,
            width: 17,
            resizeMode: 'contain',
            marginLeft: wp('2%'),
          }}
          source={isActive ? img.upArrowIcon : img.arrowRightIcon}
        />
        <Text
          style={{
            color: '#492813',
            fontSize: 15,
            marginLeft: wp('2%'),
            fontFamily: 'Inter-Regular',
          }}>
          {finalData}
        </Text>
      </View>
    );
  };

  updateAllFun = newArr => {
    let payload = newArr;
    updateMepListApi(payload)
      .then(res => {
        this.getPendingMepsData();
      })
      .catch(err => {
        console.warn('ERRDeleteMep', err.response);
      });
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
      <View style={{}}>
        {section.content.map((item, index) => {
          return (
            <View style={{backgroundColor: '#fff', paddingVertical: 10}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Switch
                  style={{width: '14%', marginLeft: 5}}
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
                        marginLeft: wp('5%'),
                        fontFamily: 'Inter-Regular',
                        color: '#151B26',
                      }}>
                      {item.name}
                    </Text>
                    <View>
                      <Text style={{fontSize: 12, marginLeft: wp('5%')}}>
                        {item.notes}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter-Regular',
                      color: '#151B26',
                    }}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('ViewRecipeMepScreen', {
                        data: item,
                      })
                    }
                    style={{
                      backgroundColor: '#94C036',
                      padding: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={img.beakerIcon}
                      style={{height: 18, width: 18, resizeMode: 'contain'}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  _renderContentHistory = section => {
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}>
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
                        textAlign: 'left',
                        paddingVertical: 8,
                        fontFamily: 'Inter-Regular',
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text>{item.quantity} g</Text>
                </View>
              </View>
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

  render() {
    const {
      modalVisible,
      recipeLoader,
      SECTIONS,
      activeSections,
      firstName,
      modalVisibleRecipeDetails,
      sectionData,
      SECTIONS_HISTORY,
      activeSectionsHistory,
      recipeLoaderHistory,
      detailsLoader,
      quantity,
      notes,
      buttonsSubHeader,
      collapseStatus,
      collapseStatusMain,
    } = this.state;
    const finalDateData = moment(sectionData.productionDate).format(
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
        <ScrollView style={{marginBottom: hp('2%')}}>
          <View>
            <View style={styles.subContainer}>
              <View style={styles.firstContainer}>
                <View style={{flex: 1}}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Mise-en-Place')}
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
                {/* // Recipe History Modal */}
                <Modal isVisible={modalVisible} backdropOpacity={0.35}>
                  <View
                    style={{
                      width: wp('80%'),
                      height: hp('80%'),
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
                    <ScrollView
                      style={{marginBottom: hp('2%')}}
                      showsVerticalScrollIndicator={false}>
                      <View
                        style={{
                          padding: hp('3%'),
                        }}>
                        <View style={{}}>
                          {collapseStatus ? (
                            <TouchableOpacity
                              onPress={() => this.onPressUncollapseHisFun()}
                              style={{
                                height: hp('5%'),
                                width: wp('50%'),
                                backgroundColor: '#94C036',
                                alignSelf: 'center',
                                marginTop: hp('3%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 100,
                              }}>
                              <Text style={{color: '#fff', fontSize: 16}}>
                                {translate('Uncollapse All')}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() => this.onPressCollapseHisFun()}
                              style={{
                                height: hp('5%'),
                                width: wp('50%'),
                                backgroundColor: '#94C036',
                                alignSelf: 'center',
                                marginTop: hp('3%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 100,
                              }}>
                              <Text style={{color: '#fff', fontSize: 16}}>
                                {translate('Collapse All')}
                              </Text>
                            </TouchableOpacity>
                          )}
                          {recipeLoaderHistory ? (
                            <ActivityIndicator color="#94C036" size="large" />
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
                                  height: hp('5%'),
                                  width: wp('50%'),
                                  backgroundColor: '#CECBD0',
                                  alignSelf: 'center',
                                  marginTop: hp('5%'),
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 100,
                                }}>
                                <Text
                                  style={{
                                    color: '#492813',
                                    fontSize: 16,
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  View More
                                </Text>
                              </TouchableOpacity>
                              <View style={{marginVertical: hp('3%')}}>
                                <TouchableOpacity
                                  onPress={() => this.setModalVisible(false)}
                                  style={{
                                    width: wp('50%'),
                                    height: hp('5%'),
                                    alignSelf: 'center',
                                    backgroundColor: '#E7943B',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 100,
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 15,
                                      fontFamily: 'Inter-Regular',
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
                {/* // Recipe Details Modal */}
                <Modal
                  isVisible={modalVisibleRecipeDetails}
                  backdropOpacity={0.35}>
                  <View
                    style={{
                      width: wp('85%'),
                      height: hp('90%'),
                      backgroundColor: '#F0F4FE',
                      alignSelf: 'center',
                      borderRadius: 6,
                    }}>
                    <View
                      style={{
                        backgroundColor: '#84AC2F',
                        height: hp('6%'),
                        flexDirection: 'row',
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                      }}>
                      <View
                        style={{
                          flex: 3,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#fff',
                            fontFamily: 'Inter-Regular',
                          }}>
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
                      <View style={{flex: 1}}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                          <View style={{padding: hp('5%')}}>
                            <View style={{}}>
                              <View style={{}}>
                                <Text
                                  style={{
                                    color: '#7F7F7F',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    marginBottom: 5,
                                    fontFamily: 'Inter-Regular',
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
                                  borderRadius: 100,
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
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  Delete
                                </Text>
                              </TouchableOpacity>
                              <View
                                style={{
                                  marginTop: hp('3%'),
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    color: '#151B26',
                                  }}>
                                  Requested By
                                </Text>
                              </View>
                              <View
                                style={{
                                  borderWidth: 1,
                                  padding: Platform.OS === 'ios' ? 10 : 3,
                                  marginTop: hp('2%'),
                                  borderColor: '#C9CCD7',
                                  backgroundColor: '#EEEEEE',
                                  borderRadius: 6,
                                }}>
                                <TextInput
                                  value={sectionData.requestedBy}
                                  editable={false}
                                />
                              </View>
                              <View
                                style={{
                                  borderWidth: 1,
                                  padding: Platform.OS === 'ios' ? 10 : 3,
                                  marginTop: hp('2%'),
                                  borderColor: '#C9CCD7',
                                  backgroundColor: '#EEEEEE',
                                  borderRadius: 6,
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
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    color: '#151B26',
                                  }}>
                                  Made By
                                </Text>
                              </View>
                              <View
                                style={{
                                  borderWidth: 1,
                                  padding: 10,
                                  marginTop: hp('2%'),
                                  borderColor: '#C9CCD7',
                                  backgroundColor: '#EEEEEE',
                                  borderRadius: 6,
                                }}>
                                <TextInput
                                  value={sectionData.madeBy}
                                  editable={false}
                                />
                              </View>
                              <View
                                style={{
                                  borderWidth: 1,
                                  padding: Platform.OS === 'ios' ? 10 : 3,
                                  marginTop: hp('2%'),
                                  borderColor: '#C9CCD7',
                                  backgroundColor: '#EEEEEE',
                                  borderRadius: 6,
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
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    color: '#151B26',
                                  }}>
                                  {translate('Quantity')}
                                </Text>
                              </View>
                              <View
                                style={{
                                  borderWidth: 1,
                                  padding: Platform.OS === 'ios' ? 10 : 3,
                                  marginTop: hp('2%'),
                                  borderColor: '#C9CCD7',
                                  borderRadius: 6,
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
                                  padding: Platform.OS === 'ios' ? 10 : 3,
                                  marginTop: hp('2%'),
                                  borderColor: '#C9CCD7',
                                  backgroundColor: '#EEEEEE',
                                  borderRadius: 6,
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
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    color: '#151B26',
                                  }}>
                                  Note
                                </Text>
                              </View>
                              <View
                                style={{
                                  borderWidth: 1,
                                  padding: Platform.OS === 'ios' ? 10 : 3,
                                  marginTop: hp('2%'),
                                  height: hp('20%'),
                                  borderColor: '#C9CCD7',
                                  borderRadius: 6,
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
                          </View>
                        </ScrollView>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: hp('3%'),
                            paddingHorizontal: hp('5%'),
                            paddingVertical: hp('2%'),
                          }}>
                          <TouchableOpacity
                            onPress={() => this.updateRecipeDetailsFun()}
                            style={{
                              width: wp('30%'),
                              height: hp('5%'),
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
                              Save
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              this.setModalVisibleRecipeDetailsClose(false)
                            }
                            style={{
                              width: wp('30%'),
                              height: hp('5%'),
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 100,
                              borderWidth: 1,
                              borderColor: '#482813',
                            }}>
                            <Text
                              style={{
                                color: '#482813',
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
                </Modal>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('AddBuilderMepScreen')
            }
            style={{
              height: hp('6%'),
              width: wp('80%'),
              backgroundColor: '#94C036',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('3%'),
              borderRadius: 100,
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={img.addIcon}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: '#fff',
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  color: 'white',
                  marginLeft: 10,
                  fontFamily: 'Inter-SemiBold',
                }}>
                {translate('Add new')}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.subContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: wp('5%'),
                marginTop: hp('2%'),
              }}>
              {collapseStatusMain ? (
                <TouchableOpacity
                  style={{flex: 1}}
                  onPress={() => this.onPressUnCollapseFun()}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Uncollapse All')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{flex: 1}}
                  onPress={() => this.onPressCollapseFun()}>
                  <Text style={styles.adminTextStyle}>
                    {translate('Collapse All')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => this.setModalVisible(true)}
                style={styles.goBackContainer}>
                <Text style={styles.goBackTextStyle}>
                  {translate('History')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
