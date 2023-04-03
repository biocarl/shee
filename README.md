# VAG.app

The application consists of two main components
- Client (where interactions with the participants happens)
- Presenter (where the results are shown or new interactions are triggered)

Current client/presenter modules
- [`poll`](src/app/poll) : Presenter triggers a poll which can be viewed and voted on by the participants
    - [Example URL](http://localhost:4200/java-2022/presenter?interaction=poll&questions=Why%20is%20the%20universe%20green%3F,%20What%20about%20the%20ocean,why%20today%3F) for presenter
    - [Example URL](http://localhost:4200/java-2022) for client
- [`counter`](src/app/counter) : A simple Hello World module which counts how many participants are currently listenting to the presenter

## Collection of useful things
#### Convert json into url parameters (works in browser)
```javascript
const myParams = {'foo': 'hi', 'another': ["1", "2", "3"] ,'bar': '???'};
const u = new URLSearchParams(myParams).toString();
console.log(u);
```



## Contributors
- Sebastian  
- Bodo      
- Marc       
- Tamayo    
- Alina     
- Tarik     
- Christian 
- Rene      
- Josi      
- Minh      
- Bacdasch Baco98
- Carl
