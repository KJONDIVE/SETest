import { makeAutoObservable, action, runInAction } from 'mobx';
import { fetchPhotos } from '../api/api';
import NetInfo, { NetInfoState, NetInfoSubscription } from "@react-native-community/netinfo";

class PhotoStore {
  photos: any[] = [];
  page: number = 1;
  loading: boolean = false;
  error: string | null = null;
  hasMore: boolean = true;
  retrying: boolean = false;
  isConnected: boolean | null = true;
  netInfoSubscription: NetInfoSubscription | null = null;

  constructor() {
    makeAutoObservable(this, {
      loadPhotos: action,
      refreshPhotos: action,
      retryLoadPhotos: action,
      setConnectionStatus: action,
      unsubscribeNetInfo: action,
    });
    this.netInfoSubscription = NetInfo.addEventListener(this.handleConnectivityChange);
  }


  setConnectionStatus = (isConnected: boolean | null) => {
    this.isConnected = isConnected;
    if (isConnected === false) {
      runInAction(() => {
        this.error = 'Ошибка: соединение с интернетом потеряно.';
      });
    } else if (isConnected) {
      runInAction(() => {
        this.error = null;
      });
    }
  };


  handleConnectivityChange = (state: NetInfoState) => {
    this.setConnectionStatus(state.isConnected);
  };

  loadPhotos = async () => {
    if (this.loading || !this.hasMore || this.retrying || this.isConnected === false) return;

    this.loading = true;
    this.error = null;

    try {
      const response = await fetchPhotos(this.page);
      console.log('API response:', response);

      runInAction(() => {
        if (response && response.data.results) {
          const newPhotos = response.data.results;
          if (newPhotos.length > 0) {
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
        this.error = 'Ошибка: Загрузить фотографии не удалось';
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


  unsubscribeNetInfo = () => {
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
  };
}

const photoStore = new PhotoStore();
export default photoStore;
