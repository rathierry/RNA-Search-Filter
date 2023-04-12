import { useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput } from 'react-native';

export default App = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    console.log("🚀 ~ file: App.js:8 ~ handleSearch ~ query:", query)
    setSearchQuery(query);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder='Search'
        clearButtonMode='always'
        autoCapitalize='none'
        autoCorrect={false}
        value={searchQuery}
        onChangeText={(query) => handleSearch(query)}
        style={styles.searchBox}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCC'
  },
});
