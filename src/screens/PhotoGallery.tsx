// *** NPM ***
import React, { useEffect } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, View, Text, ActivityIndicator, Image, Button, Dimensions, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';

// *** OTHER ***
import photoStore from '../store';  
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

// *** PROPS ***
interface IProps {
  navigation: StackNavigationProp<RootStackParamList, 'Gallery'>;
}


const PhotoGallery = observer(({ navigation }: IProps) => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // *** USE EFFECT ***
  useEffect(() => {
    photoStore.loadPhotos();
  }, []);

  useEffect(() => {
    return () => {
      photoStore.unsubscribeNetInfo();
    };
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => navigation.navigate('PhotoView', { photoUrl: item.urls.regular })}>
      <Image
        style={[styles.image, { width: windowWidth * 0.49, height: windowHeight * 0.33 }]}
        source={{ uri: item.urls.regular }} 
      />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (photoStore.loading && photoStore.page > 1) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    } else if (!photoStore.hasMore) {
      return <Text style={styles.noMorePhotosText}>Больше фотографий нет</Text>;
    } else {
      return null;
    }
  };

  return (
    <>
      {photoStore.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{photoStore.error}</Text>
          <Button
            title="Повторить загрузку"
            onPress={() => {
              photoStore.loadPhotos(); 
            }}
          />
        </View>
      )}
      <FlatList
        data={photoStore.photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        onEndReached={() => {
          if (!photoStore.loading && photoStore.hasMore && !photoStore.error) {
            photoStore.loadPhotos();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={photoStore.loading && photoStore.page === 1}
            onRefresh={() => {
              if (!photoStore.loading) {
                photoStore.refreshPhotos();
              }
            }}
          />
        }
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={() =>
          !photoStore.loading && (
            <View>
              <Text>{photoStore.error || 'Нет доступных фотографий'}</Text>
            </View>
          )
        }
      />
    </>
  );
});

const styles = StyleSheet.create({
  image: {
    margin: 2,
  },
  noMorePhotosText: {
    textAlign: 'center',
    padding: 10,
  },
  errorContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  flatListContent: {
    paddingBottom: 100,
  },
});

export default PhotoGallery;
