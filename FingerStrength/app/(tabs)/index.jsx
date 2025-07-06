import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'

import logo from "@/assets/images/react-logo.png"

const app = () => {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={logo}
        resizeMode='cover'
        style={styles.image}>
        
      <Text style={styles.title}>Finger Strenght</Text>
      
      <Link style={{marginHorizontal: 'auto'}} 
      href={"/contact"} asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Contact Us</Text>
        </Pressable>
      </Link>
      </ImageBackground>
    </View>
  )
}

export default app

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize:42,
    fontWeight:'bold',
    textAlign:'center',
    backgroundColor:'rgba(0,0,0,0.5)',
    marginBottom:120,
  },
  link: {
    color: 'blue',
    fontSize:32,
    fontWeight:'bold',
    textAlign:'center',
    textDecorationLine: 'underline',
    backgroundColor:'rgba(0,0,0,0.5)',
    padding:4
  },
  button: {
    height:60,
    borderRadius:20,
    justifyContent:'center',
    backgroundColor:'rgba(0,0,0,0.75)',
    //padding:6,
  },
  buttonText: {
    color: 'rgba(0,255,255,1)',
    fontSize:16,
    fontWeight:'bold',
    textAlign:'center',
    padding:4
  }
})