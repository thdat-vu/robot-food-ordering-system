
export const saveListToLocalStorage = <T>(key: string, list: T[]): void => {
    localStorage.setItem(key, JSON.stringify(list));
};


export const addProduction = <T>(key: string, item: T): void => {
    const data = localStorage.getItem(key);
    const list: T[] = data ? JSON.parse(data) : [];
    list.push(item);
    saveListToLocalStorage(key, list);
};


export const updateProduction = <T>(
    key: string,
    updatedItem: T,
    index: number
): void => {
    const data = localStorage.getItem(key);
    let list: T[] = data ? JSON.parse(data) : [];
    if (index >= 0 && index < list.length) {
        list[index] = updatedItem;
        saveListToLocalStorage(key, list);
    }
};


export const removeProduction = <T>(
    key: string,
    index: number
): void => {
    const data = localStorage.getItem(key);
    const list: T[] = data ? JSON.parse(data) : [];
    if (index >= 0 && index < list.length) {
        list.splice(index, 1);
        saveListToLocalStorage(key, list);
    }
};

export const loadListFromLocalStorage = <T>(key: string): T[] => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Lỗi khi load từ localStorage:", e);
        return [];
    }
};
