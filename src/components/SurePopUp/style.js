import {StyleSheet, Dimensions, Platform} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FE',
  },
  labelStyling: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: 'black',
  },
  pickerStyle: {
    elevation: 3,
    shadowOpacity: 1.0,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: 10,
    backgroundColor: 'rgba(255,255,255,1)',
    // shadowColor: '#d3d3d3',
    borderRadius: 5,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
  },
});
export default styles;
