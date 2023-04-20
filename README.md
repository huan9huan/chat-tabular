# Chat Tabular - Talking to your Tabular Data

## Key workflow:
- submit a csv, got the csv header and sample lines
- call ChatGPT with prompt
- parse the result js code, and execute the function, got new Table content, then Show.

### create .env file, with 
```
REACT_APP_OPENAI_KEY=<your openai api key>
```

## local
```
npm run start
```


## production
```
npm run build
```