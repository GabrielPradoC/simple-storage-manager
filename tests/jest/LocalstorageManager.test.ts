// Libs
import { expect, it, afterEach, beforeEach } from '@jest/globals';

// Types
import { TObject } from "../../src/common/types/TObject";

// Services
import LocalstorageManager from "../../src/Localstorage/LocalstorageManager";

describe('LocalstorageManager', () => {
    let mockStorage: TObject = {};
    let sut: LocalstorageManager;

    // Setup

    beforeEach(() => {
        jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
            mockStorage = {};
        });
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
            return mockStorage?.[key];
        });
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
            delete mockStorage[key];
        });
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
            mockStorage[key] = value;
        });

        sut = new LocalstorageManager();
    });

    afterEach(() => {
        mockStorage = {};
    });

    // Tests

    describe('#set', () => {
        it('should save an item to the storage', () => {
            // Arrange
            const key = 'test';
            const value = [1,2,3];
    
            // Act
            sut.set(key, value);
    
            // Assert
            expect(mockStorage).toHaveProperty(key);
            expect(mockStorage[key]).toBe(JSON.stringify(value));
            expect(Storage.prototype.setItem).toHaveBeenCalled();
        });
    
        it('should be able to store strings', () => {
            // Arrange
            const key = 'test';
            const value = 'abc';
    
            // Act
            sut.set(key, value);
    
            // Assert
            expect(mockStorage).toHaveProperty(key);
            expect(mockStorage[key]).toBe(value);
        });

        it('should be able to store objects', () => {
            // Arrange
            const key = 'test';
            const value = { prop: 'value', otherProp: ['another', 'value']};
    
            // Act
            sut.set(key, value);
    
            // Assert
            expect(mockStorage).toHaveProperty(key);
            expect(mockStorage[key]).toBe(JSON.stringify(value));
        });

        it('should be able to store numbers', () => {
            // Arrange
            const key = 'test';
            const value = 1;
    
            // Act
            sut.set(key, value);
    
            // Assert
            expect(mockStorage).toHaveProperty(key);
            expect(mockStorage[key]).toBe(value);
        });

        it('should throw when trying to store a function', () => {
            // Arrange
            const key = 'test';
            const value = () => {};

            // Act/Assert
            expect(() => {
                sut.set(key, value);
            }).toThrowError();
        });
    });

    describe('#get', () => {
        it('should return the respective value', () => {
            // Arrange
            const key = 'test'
            const mockValue = { a: 10, b: 'Hello world!' };
            mockStorage[key] = JSON.stringify(mockValue);

            // Act
            const result = sut.get<typeof mockValue>(key);

            // Assert
            expect(result).toEqual(mockValue);
        });

        it('should return nested properties in objects', () => {
            // Arrange
            const firstKey = 'test'
            const key = `${firstKey}.a.b`;
            const mockValue = { a: { b: 10 } };
            mockStorage[firstKey] = JSON.stringify(mockValue);

            // Act
            const result = sut.get<typeof mockValue.a>(key);

            // Assert
            expect(result).toBe(mockValue.a.b)
        });

        it('should return nested values in arrays', () => {
            // Arrange
            const firstKey = 'test'
            const key = `${firstKey}.a.0.b`;
            const mockValue = { a: [{ b: 10 }] };
            mockStorage[firstKey] = JSON.stringify(mockValue);

            // Act
            const result = sut.get<Pick<typeof mockValue.a[0], 'b'>>(key);

            // Assert
            expect(result).toBe(mockValue.a[0]!.b);
        });

        it('should return null if the key does not exist', () => {
            // Arrange
            const key = 'test';

            // Act
            const result = sut.get(key);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null if the nested property does not exist', () => {
            // Arrange
            const firstKey = 'test'
            const key = `${firstKey}.a.f`;
            const mockValue = { c: false };
            mockStorage[firstKey] = JSON.stringify(mockValue);

            // Act
            const result = sut.get(key);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null if the nested array value does not exist', () => {
            // Arrange
            const firstKey = 'test'
            const key = `${firstKey}.a.10.b`;
            const mockValue = { a: [{ b: 10 }] };
            mockStorage[firstKey] = JSON.stringify(mockValue);

            // Act
            const result = sut.get(key);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null if the key only contains dots', () => {
            // Arrange
            const key = '....';

            // Act
            const result = sut.get(key);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('#remove', () => {
        it('should remove the informed key from the storage', () => {
            // Arrange
            const key = 'test'
            const mockValue = { a: 10, b: 'Hello world!' };
            mockStorage[key] = JSON.stringify(mockValue);

            // Act
            sut.remove(key);

            // Assert
            expect(mockStorage).not.toHaveProperty(key);
        });

        it('should do nothing if the informed key does not exist', () => {
            // Arrange
            const key = 'test'

            // Act
            sut.remove(key);

            // Assert
            expect(mockStorage).not.toHaveProperty(key);
        });
    });

    describe('#clear', () => {
        it('should clear all properties from storage', () => {
            // Arrange
            const key1 = 'test';
            const value1 = true;
            mockStorage[key1] = value1;

            const key2 = 'test2';
            const value2 = { someProperty: [{ name: 'Rob' } ] };
            mockStorage[key2] = JSON.stringify(value2);

            // Act
            sut.clear();

            // Assert
            expect(Object.keys(mockStorage).length).toBe(0);
        });
    });
});