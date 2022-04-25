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
import img from '../../../../constants/images';
import SubHeader from '../../../../components/SubHeader';
import Header from '../../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getDepartmentsAdminApi,
  getDepartmentsReportsAdminApi,
  menuAnalysisAdminApi,
} from '../../../../connectivity/api';
import Modal from 'react-native-modal';
import Accordion from 'react-native-collapsible/Accordion';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import CheckBox from '@react-native-community/checkbox';
import styles from './style';
import {translate} from '../../../../utils/translations';

class MenuAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      modalVisible: false,
      firstName: '',
      activeSections: [],
      SECTIONS: [],
      recipeLoader: false,
      sectionData: {},
      isMakeMeStatus: true,
      productionDate: '',
      recipeID: '',
      selectedItems: [],
      items: [],
      departmentId: '',
      itemTypes: '',
      loading: false,
      selectedItemObjects: '',
      buttonsSubHeader: [],
      backStatus: false,
      grossMarginStatus: false,
      menuAnalysisStatus: false,
      periodName: 'Select Period',
      departmentArr: [],
      gmReportsArrStatus: false,
      menuAnalysisLoader: false,
      locationName: '',
      showSubList: false,
      SECTIONS_SEC: [],
      finalName: '',
      modalVisibleSetup: false,
      modalData: [],
      modalLoader: false,
      finalName: '',
      sectionName: '',
    };
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@appToken');
      if (value !== null) {
        this.setState(
          {
            recipeLoader: true,
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
          recipeLoader: false,
          buttonsSubHeader: [
            {name: translate('ADMIN')},
            {name: translate('Setup')},
            {name: translate('INBOX')},
          ],
        });
      })
      .catch(err => {
        this.setState({
          recipeLoader: false,
        });
        console.warn('ERr', err);
      });
  };

  componentDidMount() {
    this.getData();
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  goBackFun = () => {
    this.setState({
      backStatus: false,
      gmReportsArr: [],
      departmentArr: [],
      grossMarginStatus: false,
      menuAnalysisStatus: false,
      SECTIONS: [],
    });
  };

  grossMarginFun = () => {
    this.setState(
      {
        grossMarginStatus: true,
        backStatus: true,
        menuAnalysisStatus: false,
      },
      () => {
        getDepartmentsAdminApi()
          .then(res => {
            const finalArr = [];
            res.data.map(item => {
              finalArr.push({
                label: item.name,
                value: item.id,
              });
            });
            this.setState({
              departmentArr: [...finalArr],
            });
          })
          .catch(err => {
            console.warn('ERr', err);
          });
      },
    );
  };

  menuAnalysisFun = () => {
    this.setState(
      {
        grossMarginStatus: false,
        backStatus: true,
        menuAnalysisStatus: true,
        menuAnalysisLoader: true,
      },
      () => {
        menuAnalysisAdminApi()
          .then(res => {
            const {menus, location} = res.data;

            const name = location;

            let finalArray = menus.map((item, index) => {
              const finalArr = [];
              item.categories.map(subItem => {
                finalArr.push({
                  title: subItem.name,
                  content: subItem.menuItems,
                  status: false,
                });
              });

              return {
                title: item.name,
                content: [...finalArr],
                inUse: item.inUse,
              };
            });

            const result = finalArray;

            this.setState({
              SECTIONS: [...result],
              menuAnalysisLoader: false,
              locationName: name,
              SECTIONS_SEC: [...result],
            });
          })
          .catch(err => {
            this.setState({
              gmReportsArrStatus: false,
              menuAnalysisLoader: false,
            });
            console.warn('ERr', err);
          });
      },
    );
  };

  _renderHeader = (section, index, isActive) => {
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
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'row',
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
            {section.title}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#98989B',
              fontSize: 15,
              fontWeight: 'bold',
            }}>
            {translate('In use')}?
          </Text>
          <CheckBox
            value={section.inUse}
            // onValueChange={() =>
            //   this.setState({htvaIsSelected: !htvaIsSelected})
            // }
            style={{
              margin: 5,
              height: 20,
              width: 20,
            }}
          />
        </View>
      </View>
    );
  };

  openListFun = (index, section, sta, item) => {
    this.setState(
      {
        finalName: item.title,
        modalVisibleSetup: true,
        modalLoader: true,
        sectionName: section.title,
      },
      () => this.createDataFun(index, section, sta, item),
    );
  };

  createDataFun = (index, section, sta, subItem) => {
    const {SECTIONS, showSubList, finalName} = this.state;

    const status = true;
    // const status = !showSubList;

    let newArr = section.content.map((item, i) =>
      finalName === item.title
        ? {
            ...item,
            [sta]: status,
          }
        : {
            ...item,
            [sta]: false,
          },
    );

    // const finalArrSections = [];

    // SECTIONS.map((item, index) => {
    //   finalArrSections.push({
    //     title: item.title,
    //     content: newArr,
    //   });
    // });

    setTimeout(() => {
      this.setState({
        showSubList: status,
        modalData: newArr,
        modalLoader: false,
      });
    }, 300);

    // this.setState({
    //   // SECTIONS: [...finalArrSections],
    //   showSubList: status,
    // });
  };

  _renderContent = section => {
    const {activeSections, showSubList} = this.state;

    return (
      <View>
        {section.content.map((item, index) => {
          return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.openListFun(index, section, 'status', item)
                  }
                  style={{
                    borderWidth: 1,
                    paddingVertical: 15,
                    paddingHorizontal: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                  }}>
                  <Image
                    source={img.arrowRightIcon}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                    }}
                  />
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>{item.title}</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>Guide price</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>Price</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>TVA %</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>Net Revenue</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>Cost</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>Gross Margin</Text>
                  </View>
                  <View
                    style={{
                      width: wp('30%'),
                      alignItems: 'center',
                    }}>
                    <Text>%</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          );
        })}
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState(
      {
        activeSections,
      },
      () => this.updateSubFun(),
    );
  };

  updateSubFun = () => {
    this.setState({
      modalData: [],
    });
  };

  selectDepartementNameFun = item => {
    this.setState(
      {
        departmentId: item.value,
        gmReportsArrStatus: true,
        periodName: 'Monthly',
      },
      () => {
        getDepartmentsReportsAdminApi(item.value, 'Monthly')
          .then(res => {
            this.setState({
              gmReportsArr: res.data.reverse(),
              gmReportsArrStatus: false,
            });
          })
          .catch(err => {
            this.setState({
              gmReportsArrStatus: false,
            });
            console.warn('ERr', err);
          });
      },
    );
  };

  selectPeriodtNameFun = item => {
    const {departmentId} = this.state;
    this.setState(
      {
        periodName: item.value,
        gmReportsArrStatus: true,
      },
      () => {
        getDepartmentsReportsAdminApi(departmentId, item.value)
          .then(res => {
            this.setState({
              gmReportsArr: res.data,
              gmReportsArrStatus: false,
            });
          })
          .catch(err => {
            this.setState({
              gmReportsArrStatus: false,
            });
            console.warn('ERr', err);
          });
      },
    );
  };

  setAdminModalVisible = visible => {
    this.setState(
      {
        modalVisibleSetup: visible,
      },
      () => this.updateSubFun(),
    );
  };

  render() {
    const {
      recipeLoader,
      SECTIONS,
      activeSections,
      firstName,
      buttonsSubHeader,
      backStatus,
      grossMarginStatus,
      menuAnalysisStatus,
      departmentArr,
      gmReportsArrStatus,
      gmReportsArr,
      periodName,
      menuAnalysisLoader,
      locationName,
      modalVisibleSetup,
      modalData,
      modalLoader,
      finalName,
      sectionName,
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
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Reports & Analysis')}
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
          {!backStatus ? (
            <View style={{}}>
              <TouchableOpacity
                onPress={() => this.grossMarginFun()}
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
                    {translate('Gross Margin')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.menuAnalysisFun()}
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
                    {translate('Menu Analysis')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {grossMarginStatus && backStatus ? (
            <View style={{marginHorizontal: wp('10%')}}>
              <View style={{alignSelf: 'center', marginVertical: hp('2%')}}>
                <Text>GM ({periodName})</Text>
              </View>
              <View>
                <DropDownPicker
                  placeholder="Select Department"
                  items={departmentArr}
                  zIndex={1000000000}
                  containerStyle={{
                    height: 50,
                    marginBottom: hp('3%'),
                  }}
                  style={{
                    backgroundColor: '#fff',
                    borderColor: 'black',
                  }}
                  itemStyle={{
                    justifyContent: 'flex-start',
                  }}
                  dropDownStyle={{backgroundColor: '#fff'}}
                  onChangeItem={item => this.selectDepartementNameFun(item)}
                />
                <DropDownPicker
                  placeholder={periodName}
                  items={[
                    {
                      label: 'Weekly',
                      value: 'Weekly',
                    },
                    {
                      label: 'Monthly',
                      value: 'Monthly',
                    },
                    {
                      label: 'Annual',
                      value: 'Annual',
                    },
                  ]}
                  containerStyle={{
                    height: 50,
                    marginBottom: hp('3%'),
                  }}
                  style={{
                    backgroundColor: '#fff',
                    borderColor: 'black',
                  }}
                  itemStyle={{
                    justifyContent: 'flex-start',
                  }}
                  dropDownStyle={{backgroundColor: '#fff'}}
                  onChangeItem={item => this.selectPeriodtNameFun(item)}
                />
                <TouchableOpacity
                  onPress={() => alert('Print')}
                  style={{
                    flexDirection: 'row',
                    height: hp('6%'),
                    width: wp('70%'),
                    backgroundColor: '#94C036',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    alignSelf: 'center',
                  }}>
                  <View style={{}}>
                    <Text style={{color: 'white', marginLeft: 5}}>
                      {translate('Print')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {menuAnalysisStatus && backStatus ? (
            <View style={{marginHorizontal: wp('5%')}}>
              <View style={{alignSelf: 'center', marginTop: hp('2%')}}>
                <Text>{locationName}</Text>
              </View>
              {menuAnalysisLoader ? (
                <ActivityIndicator color="grey" size="large" />
              ) : (
                <View style={{}}>
                  <Accordion
                    // expandMultiple
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
          ) : null}
          <Modal isVisible={modalVisibleSetup} backdropOpacity={0.35}>
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
                  height: hp('7%'),
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    flex: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 16, color: '#fff'}}>
                    {sectionName}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.setAdminModalVisible(false)}>
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
                {modalLoader ? (
                  <ActivityIndicator size="large" color="grey" />
                ) : (
                  <View
                    style={{
                      padding: hp('3%'),
                    }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <View>
                        <View
                          style={{
                            borderWidth: 1,
                            paddingVertical: 15,
                            paddingHorizontal: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10,
                          }}>
                          <Image
                            source={img.arrowRightIcon}
                            style={{
                              width: 20,
                              height: 20,
                              resizeMode: 'contain',
                            }}
                          />
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>{finalName}</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Guide price</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Price</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>TVA %</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Net Revenue</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Cost</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>Gross Margin</Text>
                          </View>
                          <View
                            style={{
                              width: wp('30%'),
                              alignItems: 'center',
                            }}>
                            <Text>%</Text>
                          </View>
                        </View>
                        <View>
                          {modalData && modalData.length > 0
                            ? modalData.map((item, index) => {
                                if (item.status === true) {
                                  return item.content.map(
                                    (subItem, subIndex) => {
                                      return (
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingVertical: 10,
                                            paddingHorizontal: 5,
                                          }}>
                                          <View style={{width: 20}} />
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>{subItem.name}</Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>
                                              €{' '}
                                              {subItem.guidePrice
                                                ? subItem.guidePrice
                                                : '0.00'}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>
                                              €{' '}
                                              {subItem.price
                                                ? subItem.price
                                                : '0.00'}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>
                                              €{' '}
                                              {subItem.vat
                                                ? subItem.vat
                                                : '0.00'}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>
                                              €{' '}
                                              {subItem.netRevenue
                                                ? subItem.netRevenue
                                                : '0.00'}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>
                                              €{' '}
                                              {subItem.foodCost
                                                ? subItem.foodCost
                                                : '0.00'}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>
                                              €{' '}
                                              {subItem.grosMargin
                                                ? subItem.grosMargin
                                                : '0.00'}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              width: wp('30%'),
                                              alignItems: 'center',
                                            }}>
                                            <Text>%</Text>
                                          </View>
                                        </View>
                                      );
                                    },
                                  );
                                }
                              })
                            : null}
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            </View>
          </Modal>
          {gmReportsArrStatus ? (
            <ActivityIndicator size="large" color="grey" />
          ) : (
            <View>
              {gmReportsArr && gmReportsArr.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View
                    style={{
                      marginHorizontal: wp('2%'),
                      flexDirection: 'row',
                    }}>
                    <View style={{}}>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('6%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          €
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Sales HTVA
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Cost of sales (29%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Waste (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Staff (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          R & D (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Other (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Grainz correction (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Total costs(1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                          Gross Margin (1%)
                        </Text>
                      </View>
                    </View>
                    {gmReportsArr.map((item, index) => {
                      const {data} = item;
                      return (
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              height: hp('6%'),
                              width: wp('40%'),
                              alignItems: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {item.title}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.salesHTVA}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.costOfSales} {data.percentageCostOfSales}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.waste} {data.percentageWaste}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.stafFood} {data.percentageStaffFood}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.rAndD} {data.percentageRAndD}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.other} {data.percentageOther}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.grainZError} {data.percentageGrainzError}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.totalCost} {data.percentageTotalCost}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                            }}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                              {data.grossMargin} {data.percentageGrossMargin}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              ) : null}
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

export default connect(mapStateToProps, {UserTokenAction})(MenuAnalysis);
