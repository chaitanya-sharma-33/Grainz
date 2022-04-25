import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pickerModalStatus: false,
      searchItem: '',
      dataSource: this.props.dataSource,
    };
  }

  closeModal = visible => {
    this.setState({
      pickerModalStatus: visible,
    });
  };

  openModal = () => {
    this.setState({
      pickerModalStatus: true,
    });
  };

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

  onPressFun = item => {
    this.setState(
      {
        pickerModalStatus: false,
      },
      () =>
        setTimeout(() => {
          this.props.onSelectFun(item);
        }, 100),
    );
  };

  render() {
    const {pickerModalStatus, searchItem, dataSource} = this.state;
    return (
      <View>
        <TouchableOpacity
          style={styles.pickerStyle}
          onPress={() => this.openModal()}>
          {this.props.selectedLabel ? (
            <Text style={styles.labelStyling}>{this.props.selectedLabel}</Text>
          ) : (
            <Text
              style={{
                ...styles.labelStyling,
                color: this.props.placeHolderLabelColor,
              }}>
              {this.props.placeHolderLabel}
            </Text>
          )}
          <Image
            source={img.arrowDownIcon}
            style={{
              height: 20,
              width: 20,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
        <Modal
          isVisible={pickerModalStatus}
          backdropOpacity={0.35}
          animationIn="slideInUp"
          animationOut="slideOutDown">
          <View
            style={{
              width: wp('85%'),
              height: hp('50%'),
              backgroundColor: '#F0F4FE',
              alignSelf: 'center',
            }}>
            <View
              style={{
                backgroundColor: '#9AC33F',
                height: hp('7%'),
                flexDirection: 'row',
                paddingLeft: 20,
              }}>
              <View
                style={{
                  flex: 3,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#fff',
                    fontFamily: 'Inter-SemiBold',
                  }}>
                  {this.props.placeHolderLabel}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity onPress={() => this.closeModal(false)}>
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
            <View
              style={{
                borderWidth: 0.4,
                height: hp('7%'),
                width: wp('70%'),
                borderRadius: 100,
                backgroundColor: '#fff',
                alignSelf: 'center',
                marginTop: hp('2%'),
                justifyContent: 'center',
                paddingLeft: 15,
              }}>
              <TextInput
                placeholder="Search..."
                placeholderTextColor="grey"
                value={searchItem}
                style={{
                  width: wp('60%'),
                  paddingVertical: 10,
                }}
                onChangeText={value => this.searchFun(value)}
              />
            </View>
            {this.props.dataListLoader ? (
              <ActivityIndicator size="small" color="grey" />
            ) : (
              <View style={{marginVertical: hp('2%'), flex: 1}}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  data={searchItem ? dataSource : this.props.dataSource}
                  renderItem={({item}) => (
                    <View style={{flex: 1}}>
                      <TouchableOpacity
                        onPress={() => this.onPressFun(item)}
                        style={{
                          backgroundColor: '#fff',
                          flex: 1,
                          borderRadius: 8,
                          paddingVertical: 10,
                          marginHorizontal: 15,
                          marginVertical: 10,
                        }}>
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 13,
                              textAlign: 'center',
                              fontFamily: 'Inter-Regular',
                            }}
                            numberOfLines={1}>
                            {' '}
                            {item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={item => item.id}
                />
              </View>
            )}
          </View>
        </Modal>
      </View>
    );
  }
}

export default index;
