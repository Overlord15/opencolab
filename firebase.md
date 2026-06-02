# 📡 Connecting Your Custom Database (Supabase & Firebase)

> 🚨 **IMPORTANT: YOU DO NOT NEED YOUR OWN DATABASE ACCOUNT FOR TESTING!**
> 
> OpenColab is already pre-configured with a **managed, 100% free sandbox database** built into this AI Studio preview context! 
> * You can **immediately** test user registration, create direct chats, edit whiteboards, and add custom tasks right inside the preview or in a new browser tab.
> * There is **no credit card, no registration, and no configuration required** on your part; the built-in configuration is fully connected and ready to run!
> * If you want to connect your own private custom database (Supabase or Firebase), follow the corresponding set of step-by-step instructions below.

---

## ⚡ Option A: Connecting a Custom Supabase Account (Recommended)

Supabase provides high-performance PostgreSQL databases, user authentication, and Postgres-level Postgres Realtime subscriptions.

### 🛠️ Step 1: Create a Project in the Supabase Dashboard
1. Open your web browser and navigate to the [Supabase Dashboard](https://supabase.com/dashboard/projects).
2. Log in with your preferred account (e.g., GitHub, Google, or Email).
3. Click the green **New project** button.
4. Choose an organization, then configure your project details:
   - **Name**: e.g., `OpenColab Workspace`
   - **Database Password**: Enter a strong password and save it somewhere secure.
   - **Region**: Select a Cloud Region closest to your primary user base.
5. Click **Create new project** and wait 1-2 minutes for the database to provision.

---

### 🗄️ Step 2: Import the Database Schema
Once your Postgres database is ready, you need to set up the appropriate structure:
1. In the left navigation menu of the Supabase dashboard, click the **SQL Editor** tab (the icon looks like `>_`).
2. Click **New query** (or the **+** button).
3. Clear any template layout, and open the file named `/supabase_schema.sql` inside this project's workspace.
4. Select all lines of `/supabase_schema.sql`, copy them, and paste them into the Supabase SQL editor panel.
5. Click **Run** at the bottom right.
6. Look for the "Success! Query returned 0 rows" message. This creates all necessary tables (`users`, `organizations`, `tasks`, `calendar_events`, `messages`, `whiteboards`) and enables real-time synchronization replication at the PostgreSQL level!

---

### 🔑 Step 3: Obtain URL and API Keys
To allow the React client to talk to your Supabase project:
1. Click the **Project Settings** (gear icon) at the bottom of the left sidebar.
2. Select **API** under the Infrastructure section.
3. Look for the following parameters:
   - **Project URL**: e.g., `https://abcdefghijklmnopqrst.supabase.co`
   - **Project API Keys (`anon` keys / public)**: e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Copy these values down safely.

---

### ✏️ Step 4: Configure Credentials in local JSON Config
1. In your workspace, open the configuration file named:
   `/supabase-applet-config.json`
2. Change the keys to match your custom keys gathered in **Step 3**:

```json
{
  "supabaseUrl": "https://your-custom-project-id.supabase.co",
  "supabaseAnonKey": "your-actual-anon-public-api-key"
}
```

3. Save the file. The workspace will automatically detect that Supabase credentials have been provided, activate the **Supabase Engine** badge on your navigation bar, and start loading/updating all data from your private Supabase cloud instances!

---

## 🔥 Option B: Connecting a Custom Firebase Account

Firebase manages real-time document stores (Firestore) and handles sign-ins using the built-in Client SDKs.

### 🛠️ Step 1: Create a Project in the Firebase Console
1. Open your web browser and navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Log in using your Google Account.
3. Click **Add project** (or **Create a project**).
4. Enter a descriptive project name (e.g., `OpenColab Workspace`) and click **Continue**.
5. Toggle Google Analytics to **Disabled** to speed up database provisioning, then click **Create project**.
6. Wait 10-15 seconds and click **Continue** to load the workspace dashboard.

---

### 🔑 Step 2: Register a Web Application to Obtain Config Keys
1. In the center of your project overview page, click the circular **Web ( `</>` )** icon.
2. Enter a friendly **App nickname** (e.g., `OpenColab Web App`).
3. Leave "Also set up Firebase Hosting" **unchecked**.
4. Click **Register app**.
5. Firebase will generate a code configuration snippet. Look for the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:12345:web:abcd12345",
  measurementId: ""
};
```

---

### 🔐 Step 3: Enable Email & Password Authentication
1. On the left sidebar menu of the Firebase Console, expand **Build** and select **Authentication**.
2. Click the blue **Get started** button.
3. Select the **Sign-in method** tab at the top of the panel.
4. Click on the **Email/Password** provider under Native providers list.
5. Toggle **Enable** to turn on Email and Password-based registration (leave "Email link (passwordless sign-in)" **disabled**).
6. Click **Save**.

---

### 🗄️ Step 4: Provision Cloud Firestore Database
1. In the left sidebar, click **Build** -> **Firestore Database**.
2. Click the orange **Create database** button.
3. **Database ID**: Keep this as **`(default)`**. *(Avoid names to remain on the Spark Free Tier)*.
4. **Location**: Select a region closest to your workspace team and click **Next**.
5. **Security Rules**: Select **Start in Test Mode** (we will publish strict rules in the next step anyway).
6. Click **Create** and wait a moment for the database dashboard to spin up.

---

### 🛡️ Step 5: Publish Firestore Security Rules
We have already created full, highly secure production rules in this repository to prevent unauthorized access and deny malicious actors.
1. In your Firestore Database screen, switch to the **Rules** tab at the top of the interface.
2. Open the file named `/firestore.rules` inside your local workspace.
3. Select all of the lines in `/firestore.rules` and copy them.
4. Delete all sample text inside the Rules editor on your console, and paste the database security rules you copied.
5. Click **Publish** at the top right of the editor to lock down your database immediately.

---

### ✏️ Step 6: Replace Credentials in Your local JSON Config
1. Open the configuration file named:
   `/firebase-applet-config.json`
2. Replace all placeholder values with your custom keys gathered in **Step 2**:

```json
{
  "projectId": "your-project-id",
  "appId": "1:12345:web:abcd12345",
  "apiKey": "AIzaSy...",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "1234567890",
  "measurementId": ""
}
```

---

## 🔒 Security Best Practices for Both Databases
1. **Disable Public SQL Signup in Supabase if needed**: By default, PostgreSQL permits registration. You can restrict sign-ups to email invitation schemes in the Supabase Auth -> Provider panel.
2. **Database Backups**: Always download automated snapshots or backup your workspace logs.
3. **Keep Client Secrets Hidden**: Never hardcode API private keys or service roles inside client-side JS or commit them directly to public cloud repositories.
