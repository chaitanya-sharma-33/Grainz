import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
import styles from './style';
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate} from '../../utils/translations';

class SubHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  subHeaderFun = (item, index) => {
    if (index === 0) {
      this.props.navigation.navigate('AdminScreen');
    } else if (index === 1) {
      this.props.navigation.navigate('SetupScreen');
    } else {
      this.props.navigation.navigate('InboxScreen');
    }
  };

  render() {
    return (
      <View
        style={{
          height: hp('11%'),
          flexDirection: 'row',
          borderBottomWidth: 0.5,
          borderBottomColor: 'grey',
          alignItems: 'center',
          marginHorizontal: wp('5%'),
        }}>
        {this.props.buttons.map((item, index) => {
          return (
            <View
              key={index}
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => this.subHeaderFun(item, index)}
                style={{
                  height: '47%',
                  width: '85%',
                  backgroundColor: '#9AC33F',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                }}>
                {index === this.props.index ? (
                  <Text
                    style={{
                      color: index === this.props.index ? '#496618' : 'white',
                      fontFamily: 'Inter-Bold',
                    }}>
                    {item.name}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Inter-Bold',
                    }}>
                    {item.name}
                  </Text>
                )}
              </TouchableOpacity>
              <View></View>
            </View>
          );
        })}
      </View>
    );
  }
}

export default SubHeader;
