// *** NPM ***
import React, { useEffect } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, View, Text, ActivityIndicator, Image, Button, Dimensions } from 'react-native';
import { observer } from 'mobx-react';

// *** OTHER ***
import photoStore from '../stores/store';  
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

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => navigation.navigate('PhotoView', { photoUrl: item.urls.regular })}>
      <Image
        style={{ width: windowWidth * 0.49, height: windowHeight * 0.33, margin: 2 }}
        source={{ uri: item.urls.regular }} 
      />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (photoStore.loading && photoStore.page > 1) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    } else if (!photoStore.hasMore) {
      return <Text style={{ textAlign: 'center', padding: 10 }}>Больше фотографий нет</Text>;
    } else {
      return null;
    }
  };

  return (
    <>
      {photoStore.error && (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{photoStore.error}</Text>
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
        contentContainerStyle={{ paddingBottom: 100 }}
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

export default PhotoGallery;
