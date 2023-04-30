# SHEE.app

The application consists of two main components
- Client (where interactions with the participants happens)
- Presenter (where the results are shown or new interactions are triggered)

Current client/presenter modules
- [`poll`](src/app/poll) : Presenter triggers a poll which can be viewed and voted on by the participants
    - [Example URL](http://localhost:4200/java-2022/presenter?interaction=poll&questions=Why%20is%20the%20universe%20green%3F,%20What%20about%20the%20ocean,why%20today%3F) for presenter
    - [Example URL](http://localhost:4200/java-2022) for client
- [`counter`](src/app/pair) : A simple Hello World module which counts how many participants are currently listenting to the presenter

## Collection of useful things
#### Convert json into url parameters (works in browser)
```javascript
const myParams = {'foo': 'hi', 'another': ["1", "2", "3"] ,'bar': '???'};
const u = new URLSearchParams(myParams).toString();
console.log(u);
```

## ntfy.js script

The ntfy script is located in the `/scripts/ntfy` folder. To use the script, navigate to the root directory of the project and run the following commands:

After installing the modules, you can run the script in the following ways.
(Alternatively you can also run the scripts from the `package.json` - but be aware that some arguments are expected. Set those in the run configuration)

**Publish message to presenter/client topic**
- Note that the topic name is the channel name and presenter/client (with `/` delimiter) value (e.g. `java-2022/presenter` or `java-2022/client`)
```sh
npm run publish -- <channel/audience> <message.json>
```
**Listen to client/presenter topic**
```sh
npm run subscribeLive -- <channel/audience>
```

**Retrieve last published event**
```sh
npm run subscribe -- <channel/audience>
```

# Running VAG.app

## 2 step Development environment
### Step #1 ⬇️

**To run VAG.app in a development environment, use the following command:**
```sh
ng serve --configuration development
```


### Step #2 ⬇️

#### Using Docker 🐳🏗️

**VAG.app can also be deployed localy using the ntfy api Docker-Image with the docker-compose file named "local-setup.yaml". To deploy the application using Docker, run the following command (for dev enviroment only):**
```sh
docker-compose -f local-setup.yaml up
```


### Installing Docker on MAC

Installing the Package Manager HOMEBREW for macOS:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

If your not sure whether you have a clean **homebrew** docker installation, use this command in terminal to delete your current docker installation:
```sh
brew remove docker
```
Install the docker application:
```sh
brew install --cask docker
```
Install the docker command line tools:
```sh
brew install docker
```
---

## Debugging Angular Apps
### How to access the module in the Developer tools?
- As an example for the `poll-presenter` component (assumes there is only one such component in the dom)
- Here you either can access or trigger a method manually
```javascript
ng.getComponent(document.getElementsByTagName("app-poll-presenter")[0])
```


## Special notes
### Polling user management
- For now, if you want to flush the stored user, run the following command in the Developer Tools console
```javascript
ng.getComponent(document.getElementsByTagName("app-poll-presenter")[0]).clearUserHistory();
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
