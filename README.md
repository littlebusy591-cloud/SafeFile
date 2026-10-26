# SafeFile — Secure Document Vault

A beginner-friendly full-stack web app where users register, log in, and keep their documents in a private vault.
Built as a college **Cloud Computing mini-project**. This first version runs **locally** with **MongoDB**.
AWS (S3, IAM, EC2, Docker, CloudWatch) is **not** implemented yet — the code is structured so it can be added later
(see [Future AWS integration](#9-future-aws-integration-not-implemented-yet)).

## What it does

- Register, log in and log out (passwords hashed with bcrypt, sessions stored in MongoDB)
- Upload documents (PDF, DOC, DOCX, TXT, PNG, JPG, max 10 MB) with a title, description and category
- Search by title, filter by category, download, delete
- Dashboard with total count, storage used, category overview, recent uploads and recent activity
- Activity history (upload / download / delete) and a profile page (change name and password)
- Every user can only see, download and delete **their own** files

## Tech stack

| Part | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (no frameworks) |
| Backend | Node.js + Express.js |
| Database | MongoDB with Mongoose (local MongoDB or MongoDB Atlas) |
| Login | express-session (cookies) + connect-mongo (sessions saved in MongoDB) |
| Passwords | bcryptjs (a pure-JavaScript bcrypt; no build tools needed on Windows) |
| File upload | multer (memory) + a storage layer that saves to the local `uploads/` folder |
| Security | helmet, express-rate-limit, express-validator |

---

## 1. Before you start

Install these once:

1. **Node.js 18 or newer** (LTS) from https://nodejs.org. Check: `node -v`
2. **MongoDB** — choose ONE:
   - **Option A:** MongoDB Community Server on your computer, or
   - **Option B:** a free MongoDB Atlas cloud database.
3. A code editor such as VS Code (optional but helpful).

## 2. Quick start (the exact commands)

Open a terminal **inside the SafeFile folder** (the one that contains `package.json`):

```bash
# 1. install the libraries
npm install

# 2. create your settings file  (see section 4 for how to fill it in)
#    macOS / Linux / Git Bash:
cp .env.example .env
#    Windows Command Prompt:
copy .env.example .env
#    Windows PowerShell:
Copy-Item .env.example .env

# 3. generate a secret and paste it into .env as SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 4. start the website
npm start
```

You should see:

```
✅ Connected to MongoDB
🔒 SafeFile is running at http://localhost:3000
```

Open **http://localhost:3000** in your browser.
To stop the server press `Ctrl + C`. While editing code you can use `npm run dev` (restarts automatically on changes).

## 3. Set up MongoDB

### Option A — MongoDB on your own computer

- **Windows:** download *MongoDB Community Server* from https://www.mongodb.com/try/download/community and run the installer.
  Keep **"Install MongoDB as a Service"** ticked. It then starts automatically. (Optional: tick *MongoDB Compass*, a visual tool to browse your data.)
- **macOS (Homebrew):**
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
- **Ubuntu/Linux:** follow the official guide at https://www.mongodb.com/docs/manual/administration/install-on-linux/ then
  `sudo systemctl start mongod`.

Your connection string is then simply:

```
MONGODB_URI=mongodb://127.0.0.1:27017/safefile
```

MongoDB creates the `safefile` database automatically the first time data is saved. Nothing else to set up.

### Option B — MongoDB Atlas (free cloud database)

1. Create an account at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access** → *Add New Database User* → choose a username and password (write them down).
   If the password has special characters like `@ : / ?`, either avoid them or URL-encode them (`@` becomes `%40`).
3. **Network Access** → *Add IP Address* → *Add Current IP Address*.
   (`0.0.0.0/0` allows everyone — use only for short-term testing.)
4. **Database** → *Connect* → *Drivers* → copy the connection string. It looks like:
   `mongodb+srv://myuser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your real password and add the database name `safefile` after `.net/`:
   ```
   MONGODB_URI=mongodb+srv://myuser:MyPassword123@cluster0.abcde.mongodb.net/safefile?retryWrites=true&w=majority
   ```

The app code is identical for both options — only `MONGODB_URI` changes.

## 4. Create the `.env` file

The `.env` file holds your private settings. It is **never** committed to Git (it is listed in `.gitignore`).

1. Copy `.env.example` to `.env` (commands in section 2).
2. Open `.env` and set:

   | Setting | What to put |
   |---|---|
   | `PORT` | `3000` (change if something else uses 3000) |
   | `NODE_ENV` | `development` |
   | `MONGODB_URI` | The local or Atlas string from section 3 |
   | `SESSION_SECRET` | A long random string. Generate it with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the result |
   | `STORAGE_DRIVER` | `local` |
   | `MAX_FILE_SIZE_MB` | `10` |

A finished local `.env` looks like this (your secret will be different):

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/safefile
SESSION_SECRET=9f1c0a...a very long random string...e47b
STORAGE_DRIVER=local
MAX_FILE_SIZE_MB=10
```

> **Windows tip:** make sure the file is called `.env` and not `.env.txt`. In File Explorer enable *View → File name extensions*.

## 5. How to test every feature

Use the website at http://localhost:3000. Create a few small test files first (a PDF, a `.txt`, a `.png`).

| # | Feature | Steps | Expected result |
|---|---|---|---|
| 1 | **Register** | Click *Create account*. Enter name, email, password (8+ chars, letter + number), confirm it. | Redirected to Log in with "Account created". Trying the same email again shows "An account with this email already exists." |
| 2 | **Login** | Log in with that email and password. | You land on the Dashboard; your name shows bottom-left. A wrong password shows "Incorrect email or password." |
| 3 | **Upload** | *Upload document* → choose a PDF → title, optional description, category → *Upload document*. | Green message "Document uploaded." The file appears in `uploads/<your-user-id>/`. |
| 4 | **Bad uploads** | Try an `.exe` file, a file bigger than 10 MB, and a text file renamed to `.pdf`. | Each is rejected with a clear message. |
| 5 | **List + counts** | Open *Dashboard* and *My documents*. | Total documents, storage used, category counts and recent uploads are correct. |
| 6 | **Search** | In *My documents*, type part of a title. | The list narrows while you type (not case-sensitive). |
| 7 | **Filter** | Pick a category in the dropdown, or click a category tile on the Dashboard. | Only documents in that category are shown. |
| 8 | **Download** | Click the download icon. | The file downloads with its original name and opens normally. |
| 9 | **Delete** | Click the trash icon → *Delete document*. | The document disappears and the file is removed from `uploads/`. |
| 10 | **Activity** | Open *Activity* or look at the Dashboard. | Lines like "Uploaded …", "Downloaded …", "Deleted …" with times. |
| 11 | **Privacy (important for viva)** | Register a **second** user in a private/incognito window. Look at My documents. | The second user sees none of the first user's files. Copy a download link `…/api/documents/<id>/download` from the first user and open it as the second user → "Document not found." |
| 12 | **Route protection** | Log out, then visit http://localhost:3000/dashboard. | You are sent to the login page. |
| 13 | **Logout** | Click *Log out*, then press the browser Back button. | You cannot see your documents again. |
| 14 | **MongoDB error** | Stop MongoDB, then restart `npm start`. | A clear "Could not connect to MongoDB" message (with things to check) and the server does not start. |

### Looking at the data in MongoDB

With Compass: connect to `mongodb://127.0.0.1:27017` and open the `safefile` database. Or with the shell:

```bash
mongosh
use safefile
db.users.find()        // note: passwordHash is a long bcrypt string, never the real password
db.documents.find()    // metadata only: title, category, owner, storageKey ...
db.activities.find()
db.sessions.find()
```

## 6. Project structure

```
SafeFile/
├── server.js               Starts everything: connect MongoDB -> security -> sessions -> routes
├── package.json            Libraries and the npm scripts
├── .env.example            Template for your private settings (copy to .env)
├── .gitignore              Keeps .env, node_modules and uploaded files out of Git
├── README.md
├── config/
│   ├── env.js              Reads .env and checks required values
│   ├── db.js               MongoDB connection (separate, so it is easy to change)
│   ├── categories.js       The list of categories (one place)
│   └── fileTypes.js        Allowed file extensions and their content types
├── models/                 Mongoose models = the shape of the data in MongoDB
│   ├── User.js
│   ├── Document.js         Only metadata; the file itself is in storage
│   └── Activity.js
├── middleware/             Small functions that run before the route code
│   ├── auth.js             "Is the user logged in?"
│   ├── upload.js           multer settings (file size, allowed extensions)
│   ├── validate.js         Reports input validation errors
│   ├── requireDatabase.js  "Is MongoDB connected?" -> clear 503 error if not
│   ├── requireAjaxHeader.js  Simple CSRF protection
│   └── errorHandler.js     Turns unexpected errors into safe messages
├── routes/
│   ├── auth.js             /api/auth      register, login, logout, me
│   ├── documents.js        /api/documents upload, list, download, delete
│   ├── activity.js         /api/activity
│   ├── profile.js          /api/profile
│   └── pages.js            Serves the HTML pages (protects dashboard pages)
├── services/
│   ├── activityService.js  Saves activity records
│   └── storage/
│       ├── index.js        Chooses the storage driver (local now, S3 later)
│       └── localStorage.js Saves/reads/deletes files in uploads/
├── utils/                  asyncHandler, escapeRegex, file-signature check
├── views/                  HTML pages (landing, login, register, dashboard, ...)
├── public/                 CSS, JavaScript and icons sent to the browser
│   ├── css/style.css
│   └── js/                 common.js (shared helpers) + one script per page
└── uploads/                Uploaded files (created automatically, not in Git)
```

> **Why are the HTML files in `views/` and not `public/`?** Everything in `public/` can be opened by anyone.
> The dashboard pages are served through `routes/pages.js`, which redirects visitors who are not logged in.

## 7. How it works (useful for your viva)

**Upload, step by step**

1. The browser sends the form (file + title + description + category) to `POST /api/documents`.
2. `requireAuth` checks the user is logged in. `multer` receives the file in memory and rejects wrong extensions or files over the size limit.
3. `express-validator` checks the title, description and category.
4. `utils/fileValidation.js` reads the first bytes of the file ("magic bytes") to confirm it really is a PDF/PNG/etc.
5. `storage.save()` writes the file to `uploads/<userId>/<random-name>.<ext>` and returns a *storage key*.
6. A `Document` record (title, category, owner, storage key, size ...) is saved in MongoDB. If this fails, the stored file is removed again.
7. An `Activity` record "upload" is saved. The browser gets a success message.

**Why the storage layer is separate:** route code never touches the file system directly. It only calls
`storage.save()`, `storage.getStream()`, `storage.exists()` and `storage.remove()`. Changing where files live later
means writing one new file, not editing every route.

**Security features**

| Risk | What SafeFile does | Where |
|---|---|---|
| Stolen passwords | Passwords are hashed with bcrypt (cost 12); only the hash is stored and it is never sent to the browser | `routes/auth.js`, `models/User.js` |
| Guessing passwords | Rate limit of 20 attempts per 15 minutes; same error for "wrong email" and "wrong password" | `routes/auth.js` |
| Session theft | HttpOnly + SameSite cookie, `secure` flag in production, new session id at login, secret from `.env` | `server.js` |
| Seeing other users' files | Every database query includes the logged-in user's id; other people's ids give "not found" | `routes/documents.js` |
| Dangerous uploads | Extension allow-list, size limit, magic-byte check, random stored file names | `middleware/upload.js`, `utils/fileValidation.js` |
| Path traversal | Storage keys are made by the server and checked to stay inside `uploads/` | `services/storage/localStorage.js` |
| NoSQL injection | Inputs must be plain strings; search text is escaped before use | `routes/*.js`, `utils/escapeRegex.js` |
| XSS | The frontend escapes all user text before showing it; helmet adds a Content-Security-Policy | `public/js/common.js`, `server.js` |
| CSRF | Cookies are SameSite and every change request must carry a custom header only our JavaScript sends | `middleware/requireAjaxHeader.js` |
| Browser attacks (clickjacking, sniffing) | `helmet` security headers | `server.js` |
| Database down | The server refuses to start, and returns a clear 503 if MongoDB drops later; nothing pretends to be saved | `server.js`, `middleware/requireDatabase.js` |

## 8. API reference

All `/api` routes except register/login need you to be logged in. Requests that change data (POST, PUT, DELETE) must send the header
`X-Requested-With: SafeFile` (the website does this automatically; use the same header if you test with Postman or curl).

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account (`name`, `email`, `password`, `confirmPassword`) |
| POST | `/api/auth/login` | Log in (`email`, `password`) |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/documents?search=&category=` | List my documents (search by title, filter by category) |
| GET | `/api/documents/categories` | Categories, max file size, allowed extensions |
| GET | `/api/documents/summary` | Dashboard numbers and recent uploads |
| POST | `/api/documents` | Upload (`multipart/form-data`: `file`, `title`, `description`, `category`) |
| GET | `/api/documents/:id/download` | Download my file |
| DELETE | `/api/documents/:id` | Delete my file |
| GET | `/api/activity?limit=` | My activity history |
| GET / PUT | `/api/profile` | View / change name |
| PUT | `/api/profile/password` | Change password |

## 9. Future AWS integration (NOT implemented yet)

> **Nothing in this section is in the code yet.** It is a plan showing where each AWS service plugs in, so you can build it after the local version is confirmed working.

| Service | Where it plugs in | What to do later |
|---|---|---|
| **Amazon S3** | `services/storage/` | Add `s3Storage.js` exporting the same four functions as `localStorage.js` (`save`, `getStream`, `exists`, `remove`) using the AWS SDK v3 (`@aws-sdk/client-s3`). Uncomment the `s3` line in `services/storage/index.js` and set `STORAGE_DRIVER=s3`, `AWS_REGION`, `S3_BUCKET` in `.env`. Route files do not change. Keep the bucket **private** (block public access); files are only reachable through the logged-in download route. |
| **IAM** | Credentials and permissions | Do not put access keys in code or `.env` on EC2. Create an IAM **role** for the EC2 instance with least privilege: only `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `arn:aws:s3:::YOUR-BUCKET/*`, plus CloudWatch Logs permissions. The SDK picks up role credentials automatically. |
| **EC2** | Hosting | Run the app on an EC2 instance behind HTTPS (Nginx or a load balancer). Then set `NODE_ENV=production`, `COOKIE_SECURE=true`, `TRUST_PROXY=true`. Open only ports 80/443 (and SSH from your IP) in the security group. Keep using Atlas, or run MongoDB separately. |
| **Docker** | Project root | Add a `Dockerfile` (Node image, `npm ci --omit=dev`, `node server.js`) and a `.dockerignore` (`node_modules`, `.env`, `uploads`). Pass settings as environment variables instead of copying `.env`. Optional `docker-compose.yml` with a `mongo` service for local use. Once files are on S3, the container no longer needs a persistent `uploads/` volume. |
| **CloudWatch** | `server.js`, `middleware/errorHandler.js`, `services/activityService.js` | Replace `console.log/error` with a small logger that writes structured JSON, and ship logs with the CloudWatch agent or Docker's `awslogs` driver. Create metric filters/alarms for 5xx errors and failed logins. |

## 10. Common errors and solutions

| Problem | Cause | Fix |
|---|---|---|
| `'node' is not recognized` / `node: command not found` | Node.js is not installed or the terminal was opened before installing | Install Node.js LTS, then close and reopen the terminal |
| `Cannot find module 'express'` | Libraries not installed, or you are in the wrong folder | `cd` into the folder that contains `package.json`, then run `npm install` |
| `❌ Missing environment variable: SESSION_SECRET` (or `MONGODB_URI`) | No `.env` file, wrong name (`.env.txt`), or the value is empty | Create `.env` from `.env.example` (section 4) |
| `SESSION_SECRET is too weak or still the example value` | You left the placeholder text | Generate a real secret (section 2, step 3) |
| `Could not connect to MongoDB … ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is not running | Windows: open *Services* → *MongoDB Server* → Start (or run `net start MongoDB` as administrator). macOS: `brew services start mongodb-community`. Linux: `sudo systemctl start mongod` |
| Atlas: `bad auth : Authentication failed` | Wrong database-user name or password (this is not your Atlas login) | Re-check the Database Access user; URL-encode special characters in the password |
| Atlas: `Server selection timed out` / `not authorized` / `ReplicaSetNoPrimary` | Your IP is not allowed | Atlas → Network Access → add your current IP address |
| Atlas: `querySrv ECONNREFUSED` / `ENOTFOUND _mongodb._tcp…` | College or office Wi-Fi blocks the `mongodb+srv` DNS lookup | Try a mobile hotspot, or use Atlas's non-SRV "standard connection string" |
| `EADDRINUSE: address already in use :::3000` | Another program (or an old copy of SafeFile) uses the port | Close the other terminal, or set `PORT=3001` in `.env` |
| Page looks unstyled or buttons do nothing | You opened an `.html` file by double-clicking | Always use http://localhost:3000 with the server running |
| Login succeeds but you are sent back to the login page | Cookie is marked `secure` but you use plain `http` | In `.env` use `NODE_ENV=development` and remove `COOKIE_SECURE` |
| `Too many attempts. Please wait…` (429) | Rate limit after many logins/registrations | Wait 15 minutes, or restart the server |
| `Request blocked for security reasons` (403) in Postman/curl | The CSRF header is missing | Add the header `X-Requested-With: SafeFile` |
| `The database is currently unavailable` (503) | MongoDB stopped while the server was running | Start MongoDB again; the server reconnects by itself |
| `File is too large` | File is over the limit | Use a smaller file, or raise `MAX_FILE_SIZE_MB` in `.env` and restart |
| `The file contents do not match its type` | A file was renamed (e.g. `.txt` renamed to `.pdf`) | Upload the real file |
| `The file is missing from storage` | The record exists but the file was removed from `uploads/` by hand | Delete the record from My documents and upload again |
| Old accounts/files seem to vanish | `MONGODB_URI` points to a different database, or the `uploads/` folder was deleted | Check the database name at the end of `MONGODB_URI` and keep `uploads/` |
| `npm install` fails with permission errors | Old Node version or restricted folder | Use Node 18+; avoid folders such as `C:\Program Files` |

## 11. Likely viva questions

- **Why is the password not stored directly?** If the database leaks, plain passwords would be exposed. bcrypt stores a salted, deliberately slow hash that cannot be reversed.
- **How does login stay active?** After login the server creates a session saved in MongoDB and sends the browser a cookie holding only the session id. The browser sends it with every request.
- **How do you stop user A seeing user B's files?** Each document stores its owner's id. Every query is `{ _id, user: <logged-in user> }`, so another user's document is simply not found.
- **Where are files stored and where is the metadata?** Files are in `uploads/`; title, category, owner, size and the file's storage key are in MongoDB.
- **Why a storage layer?** So local storage can be swapped for Amazon S3 by adding one file, without changing the routes.
- **What happens if MongoDB is down?** The server refuses to start with a clear message, and if it goes down while running, requests return 503 instead of pretending to save.
- **Why `.env`?** Secrets such as the database password stay out of the source code and out of Git.
- **How do you prevent malicious uploads?** Extension allow-list, size limit, magic-byte check, random file names, and files are only sent back through the authenticated download route.
