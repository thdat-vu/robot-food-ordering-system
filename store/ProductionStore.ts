

export interface ProductionStore {
    key: number;
    id: string;
    id_size: string;
    toppings: { id: string, quanlity: number }[];
}

let productionStore: ProductionStore[] = [];

let key = 1;

export const AddTolisProduction = ({toppings, id_size, id}: Omit<ProductionStore, 'key'>) => {
    const newItem: ProductionStore = {
        key: key++,
        id,
        id_size,
        toppings
    };
    productionStore.push(newItem);
};

export const getAllProductionsToCart = () => {
    return { productionStore };
};

export const getProductionCartByKey = (key: number) => {
    return productionStore.find(value => value.key === key);
};

export const updateProductionCart = (key: number, newProduction: Omit<ProductionStore, 'key'>) => {
    const index = productionStore.findIndex(p => p.key === key);
    if (index !== -1) {
        productionStore[index] = { key, ...newProduction };
    }
};

