/**
 * LocalstorageManager
 *
 * Class for managing read/write to the localstorage
 */
export default class LocalstorageManager {
    /**
     * remove
     *
     * Removes the informed key from the localstorage
     *
     * @param key - Key to remove
     */
    public remove(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * clear
     *
     * Clear all values from the localstorage
     */
    public clear(): void {
        localStorage.clear();
    }

    /**
     * set
     *
     * Stores a value on the localtorage with the given key
     *
     * @param key - Key to store the value at
     * @param value - Value to be stored
     */
    public set(key: string, value: any): void {
        if (typeof value === 'function') {
            throw new Error('Invalid value type, cannot store a function.');
        }
        localStorage.setItem(
            key,
            typeof value === 'object' ? JSON.stringify(value) : value
        );
    }

    /**
     * get
     *
     * Returns the value stored with the given key or null if it does not exist
     *
     * @param key - Key to retrieve the value of
     * @returns Found value or null
     */
    public get<T>(key: string): T|null {
        if (key.includes('.')) {
            return this.getNestedProperty<T>(key);
        }

        const item = localStorage.getItem(key);

        try {
            return item ? JSON.parse(item) : null;
        } catch(err) {
            return item as T;
        }
    }

    /**
     * getNestedProperty
     *
     * Returns a nested property from the localstorage
     *
     * @param key - Full key to retrieve the value
     * @returns Value or null if it does not exist
     */
    protected getNestedProperty<T>(key: string): T|null {
        const keys = key.split('.');
        const firstKey = keys.shift();

        if (!firstKey) {
            return null;
        }

        const retrievedItem = localStorage.getItem(firstKey);

        if (!retrievedItem) {
            return null;
        }

        let current = JSON.parse(retrievedItem);

        for(const key of keys) {
            console.log(key, current);
            if (!current[/^\d+$/.test(key) ? Number(key) : key]) {
                current = null;
                break;
            }

            current = current[/^\d+$/.test(key) ? Number(key) : key];
        }

        return current;
    }
}