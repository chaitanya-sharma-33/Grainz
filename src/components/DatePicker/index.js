import React, {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import DatePicker from 'react-native-datepicker';

class index extends Component {
    constructor(props){
        super(props);
        this.state = {date: '2021-03-26'};
    }
  render() {
    return (
      <View>
        <DatePicker
          style={{width: 200}}
          date={this.state.date}
          mode="date"
          placeholder="select date"
          format="YYYY-MM-DD"
          minDate="2016-05-01"
          maxDate="2016-06-01"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: 'absolute',
              left: 0,
              top: 4,
              marginLeft: 0,
            },
            dateInput: {
              marginLeft: 36,
            },
          }}
          onDateChange={date => {
            this.setState({date: date});
          }}
        />
      </View>
    );
  }
}

export default index;
