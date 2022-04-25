import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import img from '../../constants/images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translate, setI18nConfig} from '../../utils/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';

type Item = typeof data[0];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text: {
    color: '#727272',
    textAlign: 'justify',
    marginHorizontal: wp('6%'),
  },
  nextButton: {
    color: '#8BC303',
    fontSize: 20,
  },
  skipButton: {
    color: '#727272',
    fontSize: 20,
  },
  buttonContainer: {
    marginHorizontal: wp('4%'),
  },
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
      loader: false,
      data: [
        {
          page: '1',
          title: translate('What is Grainz?'),
          image: img.introFirstIcon,
          bg: '#F5F5F5',
          text: translate('IntroFirstText'),
        },
        {
          page: '2',
          title: translate('Who can use it?'),
          image: img.introSecIcon,
          bg: '#F5F5F5',
          text: translate('IntroSecText'),
        },
        {
          page: '3',
          title: translate('What are the benefits?'),
          image: img.introFirstIcon,
          bg: '#F5F5F5',
          text: translate('IntroThirdText'),
        },
      ],
    };
  }

  async componentDidMount() {
    setI18nConfig();
    console.log('MOUNT');

    const lang = await AsyncStorage.getItem('Language');
    if (lang !== null && lang !== undefined) {
      if (lang == 'en') {
        this.setState({
          switchValue: false,
          loader: false,
          data: [
            {
              page: '1',
              title: translate('What is Grainz?'),
              image: img.introFirstIcon,
              bg: '#F5F5F5',
              text: translate('IntroFirstText'),
            },
            {
              page: '2',
              title: translate('Who can use it?'),
              image: img.introSecIcon,
              bg: '#F5F5F5',
              text: translate('IntroSecText'),
            },
            {
              page: '3',
              title: translate('What are the benefits?'),
              image: img.introFirstIcon,
              bg: '#F5F5F5',
              text: translate('IntroThirdText'),
            },
          ],
        });
        setI18nConfig();
      } else {
        this.setState({
          switchValue: true,
          loader: false,
          data: [
            {
              page: '1',
              title: translate('What is Grainz?'),
              image: img.introFirstIcon,
              bg: '#F5F5F5',
              text: translate('IntroFirstText'),
            },
            {
              page: '2',
              title: translate('Who can use it?'),
              image: img.introSecIcon,
              bg: '#F5F5F5',
              text: translate('IntroSecText'),
            },
            {
              page: '3',
              title: translate('What are the benefits?'),
              image: img.introFirstIcon,
              bg: '#F5F5F5',
              text: translate('IntroThirdText'),
            },
          ],
        });
        setI18nConfig();
      }
    } else {
      await AsyncStorage.setItem('Language', 'en');
      this.setState({
        switchValue: false,
        loader: false,
        data: [
          {
            page: '1',
            title: translate('What is Grainz?'),
            image: img.introFirstIcon,
            bg: '#F5F5F5',
            text: translate('IntroFirstText'),
          },
          {
            page: '2',
            title: translate('Who can use it?'),
            image: img.introSecIcon,
            bg: '#F5F5F5',
            text: translate('IntroSecText'),
          },
          {
            page: '3',
            title: translate('What are the benefits?'),
            image: img.introFirstIcon,
            bg: '#F5F5F5',
            text: translate('IntroThirdText'),
          },
        ],
      });
      setI18nConfig();
    }
  }

  _renderItem = ({item}: {item: Item}) => {
    return (
      <View
        style={{
          backgroundColor: item.bg,
          flex: 1,
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: wp('90%'),
            justifyContent: 'space-between',
            height: hp('13%'),
          }}>
          <View>
            <Image
              source={img.grainzLogo}
              style={{width: 100, height: 100, resizeMode: 'contain'}}
            />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => this.props.navigation.navigate('LoginScreen')}>
              <Text
                style={{
                  color: '#1E1E1E',
                  fontWeight: 'bold',
                }}>
                Log In{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.toggleSwitch(false)}>
              <Text
                style={{
                  color: '#1E1E1E',
                  fontWeight: 'bold',
                }}>
                en /{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.toggleSwitch(true)}>
              <Text
                style={{
                  color: '#1E1E1E',
                  fontWeight: 'bold',
                }}>
                fr{' '}
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity>
              <Text
                style={{
                  color: '#1E1E1E',
                  fontWeight: 'bold',
                }}>
                nl
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}>
          <Text style={styles.title}>{item.title}</Text>
          <Image source={item.image} style={styles.image} />
          <Text style={styles.text}>{item.text}</Text>
          {item.page === '1' ? (
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('ContactUsScreen')}
              style={{
                backgroundColor: '#427EA3',
                marginTop: hp('5%'),
                padding: 10,
              }}>
              <Text
                style={{
                  color: '#fff',
                }}>
                {translate('Contact Us')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  _keyExtractor = (item: Item) => item.title;

  renderDoneButton = () => {
    this.props.navigation.navigate('LoginScreen');
  };

  _renderNextButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.nextButton}>{translate('Next')}</Text>
      </View>
    );
  };

  _renderSkipButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.skipButton}>{translate('Skip')}</Text>
      </View>
    );
  };

  _renderPrevButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.skipButton}>{translate('Back')}</Text>
      </View>
    );
  };

  _renderDoneButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.nextButton}>{translate('Done')}</Text>
      </View>
    );
  };

  toggleSwitch = value => {
    console.log('va', value);
    this.setState({switchValue: value, loader: true}, () =>
      this.languageSelector(),
    );
  };

  languageSelector = async () => {
    let language = '';
    this.state.switchValue === true ? (language = 'fr') : (language = 'en');
    await AsyncStorage.setItem('Language', language);
    setI18nConfig();
    setTimeout(
      () =>
        this.setState({
          loader: false,
          data: [
            {
              page: '1',
              title: translate('What is Grainz?'),
              image: img.introFirstIcon,
              bg: '#F5F5F5',
              text: translate('IntroFirstText'),
            },
            {
              page: '2',
              title: translate('Who can use it?'),
              image: img.introSecIcon,
              bg: '#F5F5F5',
              text: translate('IntroSecText'),
            },
            {
              page: '3',
              title: translate('What are the benefits?'),
              image: img.introFirstIcon,
              bg: '#F5F5F5',
              text: translate('IntroThirdText'),
            },
          ],
        }),
      2000,
    );
  };

  render() {
    const {loader, data} = this.state;
    return (
      <View style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />
        <Loader loaderComp={loader} />
        <AppIntroSlider
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          showSkipButton
          showPrevButton
          data={data}
          onDone={() => this.renderDoneButton()}
          renderNextButton={this._renderNextButton}
          renderSkipButton={this._renderSkipButton}
          renderPrevButton={this._renderPrevButton}
          renderDoneButton={this._renderDoneButton}
        />
      </View>
    );
  }
}
