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

## ntfy.js script

The ntfy script is located in the `/scripts/ntfy` folder. To use the script, navigate to the root directory of the project and run the following commands:

```sh
node scripts/ntfy/ntfy.js <command> <topic> <message.json>
```
For more information on how to use the script, use the --help command:
```sh
node scripts/ntfy/ntfy.js --help
```

## Contributors 🎉
- Tamayo ([@SETA1609)](https://github.com/SETA1609))  
- Bodo ([@Bohdoh](https://github.com/Bohdoh))
- Marc ([@Knollen](https://github.com/knollen))      
- Sebastian ([@JefCos](https://github.com/JefCos))  
- Alina ([@neko5687](https://github.com/neko5687))   
- Tarik ([@trklkddr](https://github.com/trklkddr))      
- Christian ([@Languste1](https://github.com/Languste1))
- Josi ([@Ru79jel](https://github.com/Ru79jel))
- Rene ([@MeisterRLampe](https://github.com/MeisterRLampe))      
- Minh ([@yungminox](https://github.com/yungminox))    
- Bacdasch ([@Baco98](https://github.com/Baco98))  
- Carl ([@biocarl](https://github.com/biocarl))