import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FE',
  },
  secondContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    height: hp('15%'),
    justifyContent: 'center',
    marginHorizontal: wp('5%'),
  },
  textStylingLogo: {
    color: '#222526',
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
  },
  logoStyling: {
    height: 180,
    width: 180,
    resizeMode: 'contain',
  },
  insideContainer: {
    marginHorizontal: wp('5%'),
  },
  textStyling: {
    color: '#4A4C55',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  textInputStyling: {
    paddingVertical: hp('1%'),
    marginLeft: '5%',
    marginTop: '1%',
    width: wp('70%'),
  },
  errorContainer: {
    height: hp('5%'),
    justifyContent: 'center',
  },
  passContainer: {marginTop: '2%', marginLeft: '5%'},
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
    backgroundColor: '#5297C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('18%'),
    width: wp('85%'),
    borderRadius: 10,
    alignSelf: 'center',
  },
  LoginStyling: {
    height: hp('7%'),
    backgroundColor: '#5297C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
    width: wp('85%'),
    borderRadius: 10,
    alignSelf: 'center',
  },
  forgotPassStyling: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('3%'),
  },
  signInStylingText: {
    fontSize: 18,
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
