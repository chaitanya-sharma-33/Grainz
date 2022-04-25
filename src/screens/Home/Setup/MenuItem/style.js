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
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  itemContainer: {
    width: Dimensions.get('window').width / numColumns,
    height: Dimensions.get('window').width / numColumns,
    borderRadius: 50,
  },
  item: {
    flex: 1,
    margin: 5,
    backgroundColor: 'lightblue',
    borderRadius: 50,
  },
  firstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5%'),
    marginVertical: hp('2%'),
  },
  adminTextStyle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#523622',
  },
  goBackContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  goBackTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#523622',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
});
export default styles;
