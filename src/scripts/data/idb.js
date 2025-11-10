import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      const store = database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: false });
    }
  },
});

const Idb = {
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async getStory(id) {
    if (!id) return null; 
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async putStory(story) {
    if (!story || !story.id) return; 
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    if (!id) return;
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async clearAllStories() {
    return (await dbPromise).clear(OBJECT_STORE_NAME);
  },
};

export default Idb;
