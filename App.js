import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const TIMEOUT = 3000; // 3 seconds
const ITEMS_PER_PAGE = 100;
const PAGE = 1;
const BASE_URL = 'https://randomuser.me';
const API_URL = `${BASE_URL}/api?results=${ITEMS_PER_PAGE}&page=${PAGE}`;

export default App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const init = () => {
    console.log("init init");
    setIsLoading(true);
    setTimeout(() => {
      fetchData(API_URL);
    }, TIMEOUT);};

  useEffect(() => {
    init();
  }, []);

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      const results = json.results;
      setData(results);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color="#89CFF0" />
        <Text>Loading ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error on fetching data ...</Text>
        <Text>Please check your internet connection!</Text>
        <Pressable onPress={init} style={styles.button}>
          <Text>Refresh</Text>
        </Pressable>
      </View>
    );
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#89CFF0',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    elevation: 8
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCC'
  },
});
