import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Button } from 'react-native';
import * as FileSystem from 'expo-file-system';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

export default class App extends Component {
  state = {
    locationData: [],
    location: null,
    errorMessage: null,
  };

  componentDidMount(){
    console.log("FileSystem.documentDirectory = "+FileSystem.documentDirectory)
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    let updatedLocationData = this.state.locationData
    updatedLocationData.push(location)
    this.setState({ location, locationData: updatedLocationData });
  };

  _writeDataToFileSystem = async () => {
    // FileSystem.deleteAsync(FileSystem.documentDirectory + 'LocationData')

    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'LocationData').then(() => {
      console.log("Directory created")
    }, (error) => {
      console.log("Directory already exists (or there's another problem...) " + error)
    })
    
    // const fileName = new Date(locationData[0].timestamp)
    const fileName = Date(this.state.locationData[0].timestamp).split(' ').slice(0,6).join('_')
    const fileUri = FileSystem.documentDirectory + 'LocationData/' + fileName
    
    await FileSystem.writeAsStringAsync(
      fileUri, 
      JSON.stringify(this.state.locationData), 
        {encoding:FileSystem.EncodingType.UTF8}
      )
    .then(
      (result) =>{
        console.log("write success")
        console.log(result)
      }, 
      (error) => {
        console.log("write failed")
        console.log(error)
      }
    )
    
    const storedData = await FileSystem.readAsStringAsync(fileUri)
    console.log(storedData)

    this.setState({locationData: []})
    
  }

  render() {
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }

    return (
      <View style={styles.container}>
        <Button
          onPress={this._getLocationAsync}
          title="Update Location Data"
          color="#ff0000"
          accessibilityLabel="This is a red button"
        />
        <Text style={styles.paragraph}>{text}</Text>
        <Text style={styles.paragraph}> Total data points: {this.state.locationData.length}</Text>

        <Button
          disabled={this.state.locationData.length == 0}
          onPress={this._writeDataToFileSystem}
          title="SAVE"
          color="#00ff00"
          accessibilityLabel="This is a green button"
        />

      </View>
    );
  }


  // render() {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.welcome}>Welcome to React Native!</Text>
  //       <Text style={styles.instructions}>To get started, edit App.js</Text>
  //       <Text style={styles.instructions}>{instructions}</Text>
  //     </View>
  //   );
  // }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  buttonFont: {
    fontSize: 40
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
