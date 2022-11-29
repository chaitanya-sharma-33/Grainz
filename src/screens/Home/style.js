import {StyleSheet, Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const numColumns = 2;

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
    height: hp('15%'),
    borderRadius: 50,
  },
  tileContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 8,
    padding: 10,
    alignItems: 'flex-start',
  },
  tileImageContainer: {
    flex: 3,
    alignItems: 'center',
    marginTop: 5,
  },
  tileImageStyling: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  tileTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTextStyling: {
    fontSize: 13.5,
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
    color: '#fff',
  },
  tileTextContainerSec: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTextStylingSec: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
    color: '#fff',
  },
});
export default styles;
