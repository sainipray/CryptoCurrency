import idb from 'idb';

let config = require('../../../config');


function GetCreateDB(name = 'dummy') {
    return idb.open(name, 1, upgradeDB => {
        upgradeDB.createObjectStore('keyval');
    });
}


const idbKeyval = {

    get(database, key) {
        return GetCreateDB(database).then(db => {
            return db.transaction('keyval')
                .objectStore('keyval').get(key);
        });
    },
    set(database, key, val) {
        return GetCreateDB(database).then(db => {
            this.count(database).then(value => {
                const tx = db.transaction('keyval', 'readwrite');
                if (value >= config['DB_ROW_SIZE']) {
                }
                else {
                    tx.objectStore('keyval').put(val, key);
                    return tx.complete;
                }
            });
        });
    },
    delete(database, key) {
        return GetCreateDB(database).then(db => {
            const tx = db.transaction('keyval', 'readwrite');
            tx.objectStore('keyval').delete(key);
            return tx.complete;
        });
    },
    clear(database) {
        return GetCreateDB(database).then(db => {
            const tx = db.transaction('keyval', 'readwrite');
            tx.objectStore('keyval').clear();
            return tx.complete;
        });
    },
    keys(database) {
        return GetCreateDB(database).then(db => {
            const tx = db.transaction('keyval');
            const keys = [];
            const store = tx.objectStore('keyval');
            // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
            // openKeyCursor isn't supported by Safari, so we fall back
            (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                if (!cursor) return;
                keys.push(cursor.key);
                cursor.continue();
            });

            return tx.complete.then(() => keys);
        });
    },
    count(database) {
        return GetCreateDB(database).then(db => {
            return db.transaction('keyval')
                .objectStore('keyval').count();
        });
    },
    getAll(database) {
        return GetCreateDB(database).then(db => {
            return db.transaction('keyval')
                .objectStore('keyval').getAll();
        })

    }
};
module.exports = {GetCreateDB, idbKeyval};

