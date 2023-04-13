import { useEffect, useState } from 'react';
import { 
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View 
} from 'react-native';
import filter from 'lodash.filter';

const TIMEOUT = 3000; // 3 seconds
const ITEMS_PER_PAGE = 100;
const PAGE = 1;
const BASE_URL = 'https://randomuser.me';
const API_URL = `${BASE_URL}/api?results=${ITEMS_PER_PAGE}&page=${PAGE}`;

export default App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [fullData, setFullData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const init = () => {
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
      setFullData(results);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  const contains = ({name, email}, query) => {
    const { first, last } = name;
    if (first.includes(query) || last.includes(query) || email.includes(query)) {
      return true;
    }
    return false;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = filter(fullData, (user) => {
      return contains(user, formattedQuery);
    });
    setData(filteredData);
  };

  const onPressItem = ({ name: { first, last }, email }) => {
    Alert.alert(`${first} ${last}`, email);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color="#89CFF0" />
        <Text>Loading ...</Text>
      </View>
    );
  }

  if (!!error) {
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

  const renderItem = (item) => {
    return (
      <Pressable onPress={() => onPressItem(item)} style={styles.itemContainer}>
        <Image source={{uri: item.picture.thumbnail}} style={styles.image} />
        <View>
          <Text style={styles.textName}>{item.name.first} {item.name.last}</Text>
          <Text style={styles.textEmail}>{item.email}</Text>
        </View>
      </Pressable>
    );
  };

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
        <FlatList 
          data={data}
          keyExtractor={(item) => item.login.uuid}
          renderItem={({item}) => renderItem(item)}
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
    borderColor: '#CCC',
    marginVertical: 8
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCC',
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  textName: {
    fontSize: 17,
    marginLeft: 10,
    fontWeight: '600'
  },
  textEmail: {
    fontSize: 14,
    marginLeft: 10,
    color: 'grey'
  }
});
