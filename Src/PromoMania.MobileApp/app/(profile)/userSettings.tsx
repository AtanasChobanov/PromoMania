import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const UserSettings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Очаквайте скоро</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  }
})

export default UserSettings