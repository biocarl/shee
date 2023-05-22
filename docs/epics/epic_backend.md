# Epic: Backend

Currently, we are using ntfy for our message broker. This brings several problems with it
- We do not host nfty ourselves (if the owner decides to take down the server shee.app stops working)
- Even though the project is open source we can not easily extend ntfy to our needs (encryption, locked channels, unlimited number of subscribers)

We want to build our own message broker which would have the same feature set as ntfy but can also do more
- backend would be close-sourced and the frontend open-source: Someone in the open-source world could still clone the frontend and use ntfy as the backend
- this means we need to make sure that the frontend can deal with ntfy as the simple backend and our fancy backend at the same time
- this allows to make most of the project open source but still have an option to make some premium version of it and eventually earn something with it (if you stick to the bitter end ;))
