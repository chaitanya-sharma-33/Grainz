import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  secondContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('30%'),
  },
  logoStyling: {
    height: 180,
    width: 180,
    resizeMode: 'contain',
  },
  insideContainer: {
    marginHorizontal: wp('10%'),
  },
  textStyling: {
    color: '#4A4C55',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  textInputStyling: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    paddingVertical: hp('1%'),
    marginTop: hp('2%'),
    width: wp('72%'),
  },
  errorContainer: {
    height: hp('5%'),
    justifyContent: 'center',
  },
  passContainer: {marginTop: hp('4%')},
  errorStyling: {fontSize: 14, color: 'red'},
  langContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  langStyling: {
    fontSize: wp('4%'),
    color: 'grey',
    padding: '2%',
    fontFamily: 'Inter-Regular',
  },
  signInStyling: {
    height: hp('7%'),
    backgroundColor: '#99C13E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('8%'),
    width: wp('55%'),
    borderRadius: 100,
    alignSelf: 'center',
  },
  signInStylingText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubContainer: {
    flexDirection: 'row',
    backgroundColor: '#00000090',
    alignContent: 'center',
    justifyContent: 'center',
    width: wp('1000%'),
    height: hp('100%'),
  },
});
export default styles;
