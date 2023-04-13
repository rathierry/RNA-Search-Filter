import { useEffect, useState } from 'react';
import { 
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View 
} from 'react-native';
import filter from 'lodash.filter';

const TIMEOUT = 3000; // 3 seconds
const ITEMS_PER_PAGE = 50;
const BASE_URL = 'https://randomuser.me';
const API_URL = `${BASE_URL}/api?results=${ITEMS_PER_PAGE}`;
const END_REACHED_THRESHOLD = 0.2;
const SCROLL_EVENT_THROTTLE = 250;

export default App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [fullData, setFullData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [page, setPage] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const totalItems = Array.isArray(data) ? data.length : 0;
  
  const delay = time => new Promise(result => setTimeout(result, time));
  
  const loadUserData = async () => {
    await delay(TIMEOUT);
    await fetchData(`${API_URL}&page=${page}`);
  };

  const init = () => {
    setIsLoading(true);
    loadUserData();
  };

  useEffect(() => {
    init();
  }, []);

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      const results = json.results;
      // after the response increasing the offset for the next API call
      setData([...data, ...results]);
      setFullData([...fullData, ...results]);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
      setIsRefreshing(false);
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
    setIsLoading(false);
    setIsRefreshing(false);
    setIsLoadingMore(false);
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

  const onRefreshUserData = () => {
    setIsRefreshing(true);
    loadUserData();
  };

  const onRetrieveMoreUserData = async (info) => {
    // if already loading more, or all loaded or searching, return
    if (isLoadingMore || allLoaded || !!searchQuery) {
      return;
    }
    // set loading more (also updates footer text)
    setIsLoadingMore(true);
    // get more data
    setPage(page + 1);
    loadUserData();
    await delay(2000);
    // TODO: check if any users data to loaded
    // TODO: // if no new items were fetched, set all loaded to true to prevent further requests
    // setAllLoaded(true);
    // TODO: // else process the newly fetched items
    // ...
    // load more complete, set loading more to false
    setIsLoadingMore(false);
  };

  const renderSpinner = () => {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color="#89CFF0" />
        <Text>Loading ...</Text>
      </View>
    );
  };

  const renderError = () => {
    return (
      <View style={styles.center}>
        <Text>Error on fetching data ...</Text>
        <Text>Please check your internet connection!</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={init} style={styles.button}>
          <Text>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => {
    if (!!searchQuery) {
      return;
    }
    return (
      <View style={styles.center}>
        <Text>No data at the moment</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={init} style={styles.button}>
          <Text>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = (item) => {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPressItem(item)} style={styles.itemContainer}>
        <Image source={{uri: item.picture.thumbnail}} style={styles.image} />
        <View>
          <Text style={styles.textName}>{item.name.first} {item.name.last}</Text>
          <Text style={styles.textEmail}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        {isLoadingMore && <ActivityIndicator size='large' color="#89CFF0" />}
        {allLoaded && <Text>No more users at the moment</Text>}
      </View>
    );
  };

  const render = () => {
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
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total users:</Text>
          <Text>{` ${data.length}`}</Text>
        </View>
        <FlatList 
          data={data}
          keyExtractor={(item) => item.login.uuid}
          renderItem={({item}) => renderItem(item)}
          refreshing={isRefreshing}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefreshUserData}
              colors={['#89CFF0']}
              progressBackgroundColor={'#F8F9F9'}
              tintColor={'#89CFF0'}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE}
          // how close to the end of list until next data request is made
          onEndReachedThreshold={END_REACHED_THRESHOLD}
          onEndReached={(info) => onRetrieveMoreUserData(info)}
        />
      </SafeAreaView>
    );
  };

  if (isLoading) {
    return renderSpinner();
  }

  if (!!error) {
    return renderError();
  }
  
  return render();
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
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCC',
    marginVertical: 8,
    backgroundColor: '#F8F9F9'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  totalText: {
    fontWeight: '600',
    textDecorationLine: 'underline'
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
  },
  footer: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
