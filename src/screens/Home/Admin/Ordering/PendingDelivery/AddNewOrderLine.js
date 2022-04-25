import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import img from '../../../../../constants/images';
import Header from '../../../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {UserTokenAction} from '../../../../../redux/actions/UserTokenAction';
import {
  getMyProfileApi,
  getSupplierCatalogApi,
} from '../../../../../connectivity/api';
import Accordion from 'react-native-collapsible/Accordion';
import styles from '../style';
import {translate} from '../../../../../utils/translations';

class AddNewOrderLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      firstName: '',
      activeSections: [],
      SECTIONS: [],
      departmentName: '',
      finalName: '',
      modalLoader: false,
      supplierId: '',
      basketId: '',
      SECTIONS_SEC_SUPP: [],
      supplierName: '',
      listId: '',
    };
  }

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

  getSupplierData = () => {
    this.setState(
      {
        modalLoader: true,
      },
      () => this.createSupplierData(),
    );
  };

  createSupplierData = () => {
    const {supplierId} = this.state;
    getSupplierCatalogApi(supplierId)
      .then(res => {
        let finalArray = res.data.map((item, index) => {
          return {
            title: item,
            content: item,
          };
        });
        const result = finalArray;
        this.setState({
          SECTIONS: [...result],
          modalLoader: false,
          SECTIONS_SEC_SUPP: [...result],
        });
      })
      .catch(err => {
        Alert.alert(`Error - ${err.response.status}`, 'Something went wrong', [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      });
  };

  componentDidMount() {
    this.getData();
    this.props.navigation.addListener('focus', () => {
      const {supplierValue, basketId, supplierName, productId, listId} =
        this.props.route && this.props.route.params;
      this.setState(
        {
          supplierId: supplierValue,
          activeSections: [],
          basketId,
          departmentName: '',
          supplierName,
          productId,
          listId,
        },
        () => this.supplierFun(),
      );
    });
  }

  myProfile = () => {
    this.props.navigation.navigate('MyProfile');
  };

  onPressFun = () => {
    this.props.navigation.goBack();
  };

  _renderHeader = (section, index, isActive) => {
    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          borderWidth: 0.5,
          borderColor: '#F0F0F0',
          height: 60,
          marginTop: hp('2%'),
          alignItems: 'center',
          borderRadius: 6,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
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
              color: '#492813',
              fontSize: 14,
              marginLeft: wp('2%'),
              fontFamily: 'Inter-Regular',
            }}>
            {section.title}
          </Text>
        </View>

        <View style={{flex: 1}}>
          <Text
            style={{
              color: '#492813',
              fontSize: 14,
              fontFamily: 'Inter-Regular',
            }}>
            {section.departmentName}
          </Text>
        </View>
      </View>
    );
  };

  _renderContent = section => {
    return <View></View>;
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
    const {
      supplierId,
      SECTIONS,
      activeSections,
      basketId,
      supplierName,
      productId,
      listId,
    } = this.state;
    const catName = SECTIONS[activeSections].title;
    if (activeSections.length > 0) {
      this.props.navigation.navigate('SupplierListNewOrderLineScreen', {
        supplierId,
        catName,
        basketId,
        supplierName,
        productId,
        listId,
      });
    } else {
      this.setState({
        activeSections: [],
      });
    }
  };

  supplierFun = () => {
    this.setState(
      {
        activeSections: [],
      },
      () => this.getSupplierData(),
    );
  };

  render() {
    const {SECTIONS, activeSections, modalLoader} = this.state;

    return (
      <View style={styles.container}>
        <Header
          logoutFun={this.myProfile}
          logoFun={() => this.props.navigation.navigate('HomeScreen')}
        />
        <ScrollView
          style={{marginBottom: hp('5%')}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subContainer}>
            <View style={styles.firstContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.adminTextStyle}>
                  {translate('Order/Product List')}
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

          {modalLoader ? (
            <ActivityIndicator color="#94C036" size="large" />
          ) : (
            <View style={{marginTop: hp('2%'), marginHorizontal: wp('5%')}}>
              <Accordion
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

export default connect(mapStateToProps, {UserTokenAction})(AddNewOrderLine);
