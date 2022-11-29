import {StyleSheet, Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const numColumns = 3;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#EEF2FD'},
  subContainer: {
    marginTop: hp('2%'),
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
  itemContainer: {
    width: Dimensions.get('window').width / numColumns,
    height: Dimensions.get('window').width / numColumns,
    borderRadius: 50,
  },
  flex: {flex: 1, marginLeft: wp('3%')},
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
  tileImageBack: {
    height: 20,
    width: 20,
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
