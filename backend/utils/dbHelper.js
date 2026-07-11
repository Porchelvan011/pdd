import * as Models from '../models/index.js';
import { mockDb } from '../config/mockDb.js';

// Generate lightweight unique IDs for mock DB additions
const generateId = (prefix) => {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
};

export const dbHelper = {
  // Query multiple documents
  find: async (modelName, query = {}) => {
    if (!global.isMockDatabase) {
      return await Models[modelName].find(query).lean();
    }

    // Mock search logic
    let list = mockDb[modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's'] || [];
    return list.filter(item => {
      for (let key in query) {
        if (query[key] && typeof query[key] === 'object' && query[key].$in) {
          // Handle $in operator
          if (!query[key].$in.includes(item[key])) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },

  // Query single document
  findOne: async (modelName, query = {}) => {
    if (!global.isMockDatabase) {
      return await Models[modelName].findOne(query).lean();
    }

    let list = mockDb[modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's'] || [];
    const found = list.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    return found ? { ...found } : null;
  },

  // Query by direct identifier
  findById: async (modelName, id) => {
    if (!global.isMockDatabase) {
      return await Models[modelName].findById(id).lean();
    }

    let list = mockDb[modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's'] || [];
    const found = list.find(item => item._id === id || item.userId === id);
    return found ? { ...found } : null;
  },

  // Insert a new record
  create: async (modelName, data) => {
    if (!global.isMockDatabase) {
      const newDoc = new Models[modelName](data);
      return await newDoc.save();
    }

    const collectionKey = modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's';
    const newDoc = {
      _id: generateId(modelName.toLowerCase().substring(0, 3)),
      ...data,
      createdAt: new Date()
    };

    if (!mockDb[collectionKey]) {
      mockDb[collectionKey] = [];
    }
    mockDb[collectionKey].push(newDoc);
    return newDoc;
  },

  // Find & update an existing record
  findOneAndUpdate: async (modelName, query, update, options = { new: true }) => {
    if (!global.isMockDatabase) {
      return await Models[modelName].findOneAndUpdate(query, update, options).lean();
    }

    let list = mockDb[modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's'] || [];
    const index = list.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index === -1) return null;

    // Apply updates (supports nested updates or simple key replacement)
    const current = list[index];
    const updatedFields = typeof update.$set === 'object' ? update.$set : update;
    
    list[index] = {
      ...current,
      ...updatedFields
    };
    return { ...list[index] };
  },

  // Find by ID and update directly
  findByIdAndUpdate: async (modelName, id, update, options = { new: true }) => {
    return await dbHelper.findOneAndUpdate(modelName, { _id: id }, update, options);
  },

  // Delete a record
  deleteOne: async (modelName, query) => {
    if (!global.isMockDatabase) {
      return await Models[modelName].deleteOne(query);
    }

    const collectionKey = modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's';
    let list = mockDb[collectionKey] || [];
    const index = list.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      list.splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  },

  // Find with specific population references simulated
  findWithPopulate: async (modelName, query = {}, popPath = '', popModel = 'User') => {
    const list = await dbHelper.find(modelName, query);
    
    // Simulate mongoose population for the UI presentation
    for (let item of list) {
      if (item[popPath]) {
        const related = await dbHelper.findById(popModel, item[popPath]);
        if (related) {
          item[popPath] = related;
        }
      }
    }
    return list;
  }
};
