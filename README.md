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
| [`src/offline/server.js`](src/offline/server.js) | The same routes, requests, responses and rules as the real API: sign-up, email verification, login sessions, quizzes without answers, grading, scores and history, fact articles |
| [`src/offline/content.json`](src/offline/content.json) | The 29 quizzes and 26 fact articles from the production database, translated to English |

What is simulated compared with the full-stack version:

| Full-stack ([ianjhh/quizanak](https://github.com/ianjhh/quizanak)) | This demo |
| --- | --- |
| Accounts in MongoDB, emails checked against a Redis Bloom filter | Accounts in the browser's `localStorage` |
| Passwords hashed with bcrypt | Passwords hashed with salted SHA-256 (Web Crypto); never stored in plain text |
| Signed JWT sessions in a cookie | Random session tokens |
| Verification code emailed over HTTPS | The same email shown in a "demo inbox" on the verify page |

The sign-up rules are the same: username 3-30 characters, password 8-72, unique username
and email, a 6-digit code valid for 24 hours, at most 5 wrong tries, and a new code no more
than once a minute. Quizzes are still graded behind the API: the quiz page never receives
the answers.

- **Demo account.** "Use the demo account" signs in as `demo` (password `demo1234`), a
  verified user with a few scores already on the scoreboard.
- **English.** The original site is in Indonesian. The two quizzes that taught Indonesian
  children English words now teach English speakers Indonesian words instead.

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
