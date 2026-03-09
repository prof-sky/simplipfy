Session Tracking
===================

This page should explain how the session tracking via QR Codes is implemented and what the use case is.

Work flow
---------------

The idea behind session tracking is the following use case:
- a teacher creates a QR code from a circuit file, the tracking id with name is cached in the local storage
- the QR code can be shared with students
- when the teacher navigates to the QR Track Viewer and selects this tracking id, all live events are shown in a table
- only the live events will be shown there, not any events that happened before this time
- when the teacher leaves the website, all events for this session are deleted from the server database

Implementation
-----------------

On the server, a php script ``src/session.php`` is used to handle the database requests.
The script allowes the following actions:
- ``addSessionId``: Adds a session id to the list of valid session ids
- ``deleteSessionId``: Deletes a session id from the list of valid session ids
- ``send``: Posts an event to the database with a session id
- ``read``: Reads all events for a session id from the database

Only when a session id is added to the valid list of session ids, it can be used to post events to the database.
When a session id is deleted, all events for this session id are deleted from the database.
