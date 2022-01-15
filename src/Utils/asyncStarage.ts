import AsyncStorage from "@react-native-async-storage/async-storage";

export const asyncStorage = {
  async set(key: string, data: any) {
    try {
      if (data === null) {
        await AsyncStorage.setItem(key, '');
      } else {
        const userJson = JSON.stringify(data)
        await AsyncStorage.setItem(key, userJson);
      }
      return
    }
    catch (error) {
      alert(error)
    }
  },

  async get(key: string) {
    try {
      return await AsyncStorage.getItem(key)
    }
    catch (error) {
      alert(error)
    }
  },
}
