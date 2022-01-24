import AsyncStorage from "@react-native-async-storage/async-storage";

export const asyncStorage = {
  async set(key: string, data: any) {
    try {
      if (data === null) {
        await AsyncStorage.setItem(key, '');
      } else {
        const dataJson = JSON.stringify(data)
        await AsyncStorage.setItem(key, dataJson);
      }
      return
    }
    catch (error) {
      console.error('AsyncStorageSet', error)
    }
  },

  async get(key: string) {
    try {
      const data = await AsyncStorage.getItem(key) as string;
      return JSON.parse(data);
    }
    catch (error) {
      console.error('AsyncStorageGet', error)
    }
  },
}
