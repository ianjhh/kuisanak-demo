# KuisAnak (offline demo)

An English version of [KuisAnak](https://github.com/ianjhh/quizanak), a quiz and facts website
for Indonesian children, that runs entirely in the browser. It is the live demo in my
[portfolio](https://ian-joseph.netlify.app): it opens instantly and keeps working without a
server, a database or email.

**The full-stack version, with accounts, email verification, MongoDB and Redis, is in
[ianjhh/quizanak](https://github.com/ianjhh/quizanak).**

## How it works

The pages are the same React app as the full-stack version. They still call the API with
axios, but axios's network layer is replaced by a small API that runs in the browser:

| File | What it does |
| --- | --- |
| [`src/api.js`](src/api.js) | Installs an axios adapter, so every request goes to the in-browser API instead of the network |
| [`src/offline/server.js`](src/offline/server.js) | The same routes, requests and responses as the real API: quiz lists, quizzes without answers, grading, scores, history, fact articles |
| [`src/offline/content.json`](src/offline/content.json) | The 29 quizzes and 26 fact articles from the production database, translated to English |

What changes compared with the full-stack version:

- **No accounts.** The visitor types a name instead of registering and verifying an email.
- **Scores stay in the browser.** The last 10 results per name are kept in `localStorage`.
- **English.** The original site is in Indonesian. The two quizzes that taught Indonesian
  children English words now teach English speakers Indonesian words instead.
- **Grading still happens behind the API.** The quiz page never receives the answers; it
  asks the (in-browser) API to check each one, as it does with the real server.

## Run it

```
npm install
npm start          # http://localhost:3000
npm test
npm run build      # static files in build/, servable from any folder
```

## Credits

Built with React 18, React Router, React Bootstrap and axios. Images are in
`src/assets/images`.
