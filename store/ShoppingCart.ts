export const saveListToLocalStorage = <T>(key: string, list: T[]): void => {
    localStorage.setItem(key, JSON.stringify(list));
};



export const addProduction = <T>(key: string, item: T): void => {
    const data = localStorage.getItem(key);
    const list: T[] = data ? JSON.parse(data) : [];
    list.push(item);
    saveListToLocalStorage(key, list);
};



export const updateProduction = <T extends { id: string }>(
    key: string,
    updatedItem: T
): void => {
    const data = localStorage.getItem(key);
    let list: T[] = data ? JSON.parse(data) : [];
    list = list.map(item => (item.id === updatedItem.id ? updatedItem : item));
    saveListToLocalStorage(key, list);
};


export const removeProduction = <T extends { id: string }>(
    key: string,
    id: string
): void => {
    const data = localStorage.getItem(key);
    const list: T[] = data ? JSON.parse(data) : [];
    const newList = list.filter(item => item.id !== id);
    saveListToLocalStorage(key, newList);
};
