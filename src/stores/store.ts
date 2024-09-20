import { makeAutoObservable, action, runInAction } from 'mobx';
import { fetchPhotos } from '../api/api';
import NetInfo from "@react-native-community/netinfo"

class PhotoStore {
  photos: any[] = [];
  page: number = 1;
  loading: boolean = false;
  error: string | null = null;
  hasMore: boolean = true;
  retrying: boolean = false; 

  constructor() {
    makeAutoObservable(this, {
      loadPhotos: action,
      refreshPhotos: action,
      retryLoadPhotos: action,
    });
  }

  loadPhotos = async () => {
    if (this.loading || !this.hasMore || this.retrying) return;

    this.loading = true;
    this.error = null;

    const state = await NetInfo.fetch();
    console.log(state)
    if (!state.isConnected) {
      runInAction(() => {
        this.error = 'Нет подключения к интернету.';
        this.loading = false;
      });
      return;
    }

    try {
      const response = await fetchPhotos(this.page);
      console.log('API response:', response);  // Проверка структуры ответа

      runInAction(() => {
        // Проверьте структуру ответа и обновите код соответственно
        console.log(`RESULT ${response.results}`)
        if (response && response.results) {
          const newPhotos = response.results;
          if (newPhotos.length > 0) {
            // Фильтрация уникальных фотографий по ID
            const uniquePhotos = newPhotos.filter(
              (newPhoto: { id: string }) => !this.photos.some((photo) => photo.id === newPhoto.id)
            );
            this.photos = [...this.photos, ...uniquePhotos];
            this.page++;
          } else {
            this.hasMore = false;
          }
        }
      });
    } catch (err) {
      console.log(`ERROR : ${err}`);
      runInAction(() => {
        this.error = 'Ошибка при загрузке изображений. Проверьте соединение с интернетом.';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  retryLoadPhotos = async () => {
    if (!this.error) return;

    this.retrying = true;
    await this.loadPhotos();
    runInAction(() => {
      this.retrying = false;
    });
  };

  refreshPhotos = async () => {
    this.page = 1;
    this.photos = [];
    this.hasMore = true;
    await this.loadPhotos();
  };
}

const photoStore = new PhotoStore();
export default photoStore;
