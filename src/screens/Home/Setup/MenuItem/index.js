import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
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
  getMenuItemsSetupApi,
} from '../../../../connectivity/api';
import ModalPicker from '../../../../components/ModalPicker';
import styles from './style';
import {translate} from '../../../../utils/translations';
import CheckBox from '@react-native-community/checkbox';

class MenuItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      recipeLoader: false,
      recipeId: '',
      buttonsSubHeader: [],
      menuItemArr: [],
      placeHolderText: 'Select Menu Item',
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
      () => this.getRecipeData(),
    );
  }

  getRecipeData = () => {
    getMenuItemsSetupApi()
      .then(res => {
        const finalArr = [];
        res.data.map(item => {
          finalArr.push({
            name: item.name,
            id: item.id,
          });
        });
        this.setState({
          menuItemArr: [...finalArr],
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

  selectRecipeFun = item => {
    this.setState(
      {
        recipeId: item.id,
        selectedText: item.name,
      },
      () =>
        this.props.navigation.navigate('ViewMenuItemsScreen', {
          id: item.id,
        }),
    );
  };

  render() {
    const {
      recipeLoader,
      buttonsSubHeader,
      menuItemArr,
      placeHolderText,
      selectedText,
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
          <SubHeader {...this.props} buttons={buttonsSubHeader} index={1} />
        )} */}
        <ScrollView
          style={{marginBottom: hp('2%')}}
          showsVerticalScrollIndicator={false}>
          <View style={{...styles.subContainer, marginBottom: hp('2%')}}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Menu item')}
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
            <View>
              <View>
                <ModalPicker
                  dataListLoader={dataListLoader}
                  placeHolderLabel={placeHolderText}
                  dataSource={menuItemArr}
                  selectedLabel={selectedText}
                  onSelectFun={item => this.selectRecipeFun(item)}
                />
              </View>

              <TouchableOpacity
                onPress={() => alert('Add')}
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
                    Add New
                  </Text>
                </View>
              </TouchableOpacity>
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

export default connect(mapStateToProps, {UserTokenAction})(MenuItem);
