Storage Management
====================
The local storge is managed by the ``LocalStorageManager``. The ``LocalStorageManager``
has members that are derived from ``LocalStorageWriter`` treat ``LocalStorageWriter`` as an abstract class.
Each value saved to the local storage shall be stored with a class derived from ``LocalStorageWriter`` this way
misspelling and creating duplicates is avoided and logic to retrieve and save data is moved to a fix place.

LocalStorageWriter
-------------------
Supports writing and reading values from and to the local storage of the browser

Save a new Value or Object
---------------------------
::

    class SomeValueToSave extends LocalStorageWriter{

        constructor() {
            super("<keyName e.g. ClassName>");
        }

        save(){
            super.set(pageName);
        }

        load() {
            let [success, pageName] = super.get()
            if (!success) {
                this.save("newLandingPage");
            }
            return [true, pageName]
        }
    }

Each class should support save and load functions.

    - load() returns the object or value loaded
    - save() takes in the object or value converts it to a json string if it is a object or a plain string otherwise
    - constructor() defines the key used in the local storage

Each object derived from ``LocalStorageWriter`` has the ``_get``, ``_set`` and ``_delete`` methods treat them as private.
Those directly interact with the local storage using them would defeat the purpose of the extended classes.