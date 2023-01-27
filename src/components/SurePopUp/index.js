import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate, setI18nConfig} from '../../utils/translations';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchItem: '',
      dataSource: this.props.dataSource,
    };
  }

  searchFun = txt => {
    this.setState(
      {
        searchItem: txt,
      },
      () => this.filterData(txt),
    );
  };

  filterData = text => {
    //passing the inserted text in textinput
    const newData = this.props.dataSource.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      dataSource: newData,
      searchItem: text,
    });
  };

  render() {
    const {searchItem, dataSource} = this.state;
    return (
      <View>
        <Modal isVisible={this.props.pickerModalStatus} backdropOpacity={0.35}>
          <View
            style={{
              width: wp('80%'),
              height: this.props.extraButton ? hp('40%') : hp('32%'),
              backgroundColor: '#fff',
              alignSelf: 'center',
              borderRadius: 6,
            }}>
            <View
              style={{
                height: hp('7%'),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 3,
                  marginLeft: wp('15%'),
                }}>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                  {this.props.headingText ? this.props.headingText : ''}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}>
                <TouchableOpacity onPress={this.props.crossFun}>
                  <Image
                    source={img.cancelIcon}
                    style={{
                      height: 22,
                      width: 22,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView>
              <View style={{padding: hp('3%')}}>
                <View style={{alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                    }}>
                    {this.props.bodyText}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={this.props.saveFun}
                  style={{
                    width: wp('70%'),
                    height: hp('5%'),
                    backgroundColor: '#5297c1',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 6,
                    marginBottom: 5,
                    alignSelf: 'center',
                    marginTop: hp('3%'),
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                    {this.props.yesStatus
                      ? translate('Yes')
                      : translate('Save')}
                  </Text>
                </TouchableOpacity>
                {this.props.extraButton ? (
                  <TouchableOpacity
                    onPress={this.props.discardFun}
                    style={{
                      width: wp('70%'),
                      height: hp('5%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 6,
                      marginBottom: 5,
                      alignSelf: 'center',
                      marginTop: hp('2%'),
                      borderWidth: 1,
                      borderColor: '#5297c1',
                    }}>
                    <Text
                      style={{
                        color: '#5297c1',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {this.props.extraButtonText}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={this.props.cancelFun}
                  style={{
                    width: wp('90%'),
                    height: hp('5%'),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                    marginBottom: 5,
                    alignSelf: 'center',
                    marginTop: hp('1%'),
                  }}>
                  <Text
                    style={{
                      color: '#5297c1',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                    {this.props.yesStatus
                      ? translate('No')
                      : translate('Cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}

export default index;
