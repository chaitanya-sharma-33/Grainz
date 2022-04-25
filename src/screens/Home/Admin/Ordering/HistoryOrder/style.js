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
  itemContainer: {
    width: Dimensions.get('window').width / numColumns,
    height: Dimensions.get('window').width / numColumns,
    borderRadius: 50,
  },
  flex: {flex: 1},
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
    borderBottomColor: '#EAEAF0',
    marginHorizontal: wp('3%'),
    backgroundColor: '#EFFBCF',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  listSubHeading: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  listTextStyling: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#151B26',
  },
  listImageStyling: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    marginLeft: 5,
  },
  listDataHeadingContainer: {
    borderBottomColor: '#EAEAF0',
    marginHorizontal: wp('3%'),
    paddingVertical: 10,
  },
  listDataHeadingSubContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    alignItems: 'flex-start',
  },
  listDataContainer: {flex: 3},
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
