import React, {Component} from 'react';
import {View, Text, Modal, ActivityIndicator} from 'react-native';
import styles from './style';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.loaderComp}>
          <View style={styles.modalContainer}>
            <View style={styles.modalSubContainer}>
              <ActivityIndicator size="large" color={'#ffffff'} />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default index;
