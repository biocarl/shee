# VagFrontend
- Client (where interactions happens)
- Presenter (where the results are shown)
Features
- If no cookies set, query for username
- Use route to set group name (from which question,polling and meta topics are derived)
- Use a dark mode with some ghost emojis moving around


## Useful things

#### Convert json into url parameters (works in browser)
```javascript
const myParams = {'foo': 'hi', 'another': ["1", "2", "3"] ,'bar': '???'};
const u = new URLSearchParams(myParams).toString();
console.log(u);
```
