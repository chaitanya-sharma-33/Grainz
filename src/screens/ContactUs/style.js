import {StyleSheet, Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#EEF2FD'},
  subContainer: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
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
  textStyling: {fontFamily: 'Inter-SemiBold', fontSize: 14},
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
  errorContainer: {
    alignItems: 'center',
  },
  errorStyling: {fontSize: 14, color: 'red'},
});
export default styles;
