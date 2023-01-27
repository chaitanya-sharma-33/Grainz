import {StyleSheet, Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const numColumns = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FE',
  },
  subContainer: {
    marginTop: hp('1%'),
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  item: {
    flex: 1,
    margin: 5,
    backgroundColor: 'lightblue',
    borderRadius: 50,
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
  itemContainer: {
    width: Dimensions.get('window').width / numColumns - wp('5%'),
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
    fontSize: 9,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  firstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5%'),
    marginVertical: hp('2%'),
  },
  goBackContainer: {
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 5,
  },
  adminTextStyle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1C',
    fontWeight: 'bold',
  },
  tileImageBack: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },

  addNewContainer: {
    height: hp('6%'),
    width: wp('80%'),
    backgroundColor: '#94C036',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: hp('4%'),
    marginTop: hp('2%'),
  },
  addNewSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageStyling: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  addTextStyling: {
    color: 'white',
    marginLeft: 10,
    fontFamily: 'Inter-SemiBold',
  },
  listHeading: {
    flexDirection: 'row',
    borderColor: '#EAEAF0',
    borderWidth: 1,
    marginHorizontal: wp('3%'),
    backgroundColor: '#C9C9C9',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  listSubHeading: {
    flexDirection: 'row',
    flex: 1,
  },
  listTextStyling: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'black',
  },
  listImageStyling: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginLeft: 5,
  },
  listDataHeadingContainer: {
    marginHorizontal: wp('3%'),
    paddingVertical: 10,
    // flexDirection: 'row',
    paddingHorizontal: 10,
  },
  listDataHeadingSubContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  listDataContainer: {flex: 1, flexDirection: 'row'},
  listDataTextStyling: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#151B26',
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  textInputStyling: {
    paddingVertical: hp('1%'),
    marginLeft: '5%',
    marginTop: '1%',
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
    height: hp('6%'),
    backgroundColor: '#5297C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('25%'),
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
    fontSize: 15,
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
  flex: {flex: 1, marginLeft: wp('3%')},
});
export default styles;
