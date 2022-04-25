import {StyleSheet, Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const numColumns = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FE',
  },
  subContainer: {
    marginTop: hp('2%'),
  },
  itemContainer: {
    width: Dimensions.get('window').width / numColumns,
    height: Dimensions.get('window').width / numColumns,
    borderRadius: 50,
  },
  tileContainer: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 10,
    borderRadius: 8,
    padding: 10,
  },
  tileImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileImageStyling: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
  },
  tileTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTextStyling: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
export default styles;
