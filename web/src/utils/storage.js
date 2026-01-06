export const saveItem = async (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error("Failed to save item:", err);
  }
};

export const getItem = async (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error("Failed to get item:", err);
    return null;
  }
};

export const deleteItem = async (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to delete item:", err);
  }
};
