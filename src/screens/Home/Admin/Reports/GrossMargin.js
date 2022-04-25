import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  getDepartmentsReportsAdminApi,
  getDepartmentsAdminApi,
} from '../../../../connectivity/api';
import styles from './style';
import {translate} from '../../../../utils/translations';
import ModalPicker from '../../../../components/ModalPicker';

class MenuAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      departmentId: '',
      buttonsSubHeader: [],
      departmentArr: [],
      gmReportsArrStatus: false,
      placeHolderTextDept: 'Select Department*',
      placeHolderTextPeriod: 'Select Period*',
      selectedTextDept: '',
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
    this.setState(
      {
        dataListLoader: true,
      },
      () => this.getDepartmentsData(),
    );
  }

  getDepartmentsData = () => {
    getDepartmentsAdminApi()
      .then(res => {
        const finalArr = [];
        res.data.map(item => {
          finalArr.push({
            name: item.name,
            id: item.id,
          });
        });
        this.setState({
          departmentArr: [...finalArr],
          dataListLoader: false,
        });
      })
      .catch(err => {
        console.warn('ERr', err);
      });
  };

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  selectDepartementNameFun = item => {
    this.setState(
      {
        departmentId: item.id,
        gmReportsArrStatus: true,
        selectedTextDept: item.name,
        placeHolderTextPeriod: 'Monthly',
      },
      () => {
        getDepartmentsReportsAdminApi(item.id, 'Monthly')
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
    if (departmentId) {
      this.setState(
        {
          gmReportsArrStatus: true,
          selectedTextPeriod: item.name,
        },
        () => {
          getDepartmentsReportsAdminApi(departmentId, item.id)
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
    } else {
      alert('Please select department first');
    }
  };

  render() {
    const {
      recipeLoader,
      buttonsSubHeader,
      departmentArr,
      gmReportsArrStatus,
      gmReportsArr,
      placeHolderTextPeriod,
      placeHolderTextDept,
      selectedTextPeriod,
      selectedTextDept,
      dataListLoader,
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
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Gross Margin')}
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

          <View style={{marginHorizontal: wp('5%')}}>
            <View style={{alignSelf: 'center', marginVertical: hp('2%')}}>
              <Text
                style={{
                  fontSize: 20,
                  color: '#492813',
                  fontFamily: 'Inter-Regular',
                }}>
                Order From
              </Text>
            </View>
            <View>
              <View>
                <ModalPicker
                  dataListLoader={dataListLoader}
                  placeHolderLabel={placeHolderTextDept}
                  dataSource={departmentArr}
                  selectedLabel={selectedTextDept}
                  onSelectFun={item => this.selectDepartementNameFun(item)}
                />
              </View>

              <View style={{marginVertical: hp('3%')}}>
                <ModalPicker
                  placeHolderLabel={placeHolderTextPeriod}
                  selectedLabel={selectedTextPeriod}
                  dataSource={[
                    {
                      id: 'Weekly',
                      name: 'Weekly',
                    },
                    {
                      id: 'Monthly',
                      name: 'Monthly',
                    },
                    {
                      id: 'Annual',
                      name: 'Annual',
                    },
                  ]}
                  onSelectFun={item => this.selectPeriodtNameFun(item)}
                />
              </View>

              <TouchableOpacity
                onPress={() => alert('Print')}
                style={{
                  flexDirection: 'row',
                  height: hp('6%'),
                  width: wp('80%'),
                  backgroundColor: '#94C036',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  alignSelf: 'center',
                  borderRadius: 100,
                }}>
                <View style={{}}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 14,
                    }}>
                    {translate('Print')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {gmReportsArrStatus ? (
            <ActivityIndicator size="large" color="grey" />
          ) : (
            <View style={{marginTop: hp('8%')}}>
              {gmReportsArr && gmReportsArr.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: wp('5%'),
                    }}>
                    <View style={{}}>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('6%'),
                          justifyContent: 'center',
                          backgroundColor: '#EFFBCF',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          $
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#FFFFFF',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Sales HTVA
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#F7F8F5',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Cost of sales (29%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#FFFFFF',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Waste (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#F7F8F5',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Staff (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#FFFFFF',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          R & D (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#F7F8F5',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Other (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#FFFFFF',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Grainz correction (1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#F7F8F5',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          Total costs(1%)
                        </Text>
                      </View>
                      <View
                        style={{
                          width: wp('30%'),
                          height: hp('10%'),
                          justifyContent: 'center',
                          backgroundColor: '#FFFFFF',
                        }}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
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
                              backgroundColor: '#EFFBCF',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {item.title}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#FFFFFF',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.salesHTVA}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#F7F8F5',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.costOfSales} {data.percentageCostOfSales}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#FFFFFF',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.waste} {data.percentageWaste}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#F7F8F5',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.stafFood} {data.percentageStaffFood}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#FFFFFF',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.rAndD} {data.percentageRAndD}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#F7F8F5',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.other} {data.percentageOther}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#FFFFFF',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.grainZError} {data.percentageGrainzError}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#F7F8F5',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                              {data.totalCost} {data.percentageTotalCost}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              width: wp('40%'),
                              height: hp('10%'),
                              justifyContent: 'center',
                              backgroundColor: '#FFFFFF',
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
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
