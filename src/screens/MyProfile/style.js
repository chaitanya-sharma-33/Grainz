import {StyleSheet, Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#EEF2FD'},
  subContainer: {},
  flex: {flex: 1, marginLeft: wp('3%')},
  firstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5%'),
    marginVertical: hp('2%'),
  },
  adminTextStyle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1C',
    fontWeight: 'bold',
  },
  goBackContainer: {
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 5,
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
  tileImageBack: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  dataContainer: {
    height: hp('10%'),
    marginHorizontal: wp('5%'),
    flexDirection: 'row',
  },
  dataFirstContainer: {
    flex: 1.5,
    justifyContent: 'center',
  },
  dataSecondContainer: {flex: 3, justifyContent: 'center'},
  textStyling: {fontSize: 14},
  textInputStyling: {
    borderWidth: 0.5,
    paddingVertical: '5%',
    borderColor: 'grey',
    paddingLeft: wp('2%'),
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  logOutIconStyling: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: '5%',
  },
  langContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langStyling: {
    fontSize: wp('4%'),
    padding: '2%',
    fontFamily: 'Inter-Regular',
  },
});
export default styles;
