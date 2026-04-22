# How to Run the Project Locally 

This guide is designed to take you step-by-step on how to download and run this project on your personal computer, even if you have zero prior experience in Front-End development or coding.

---

## 🛠️ Prerequisites (Software You Need)
Before starting, there are two essential programs that must be installed on your computer:

1. **Node.js** (This includes `npm`, the package manager used to download project dependencies and run the app).
   - To install: Go to the [Node.js website](https://nodejs.org/) and download the version labeled **(LTS)**. Install it just like any regular software (Next -> Next -> Finish).
2. **Git** (Used to clone/download a copy of the code from the internet to your device).
   - To install: Go to the [Git website](https://git-scm.com/downloads), download the version compatible with your system, and install it.

---

## 💻 Running on Windows (Primary Method)

Once you have installed the software mentioned above, follow these simple steps:

### Step 1: Open the Command Prompt (CMD)
- Go to the folder/directory on your PC where you want to save the project.
- In the file path bar at the top of the folder window (where it usually says `C:\Users\...`), delete the text, type `cmd`, and press **Enter**.
- A black screen (Command Prompt) will open up.

### Step 2: Clone the Project
- In the black screen, type the following command and press **Enter**:
```bash
git clone https://github.com/Mohamed-ALQarram/hayat-web.git
```
*(This command will create a new folder named `hayat-web` containing all the project files).*

### Step 3: Enter the Project Folder
- Type the following command and press **Enter**:
```bash
cd hayat-web
```

### Step 4: Install Required Dependencies
- Now you need to download the helper files (packages) the project needs to run. Type the following command and press **Enter**:
```bash
npm install
```
*(Wait a moment for the download to finish. It may take anywhere from a minute to several minutes depending on your internet speed. You will see a loading bar).*

### Step 5: Run the Project!
- Finally, to launch the project and get it ready for your browser, type the following command:
```bash
npm run dev
```
- Now, all you have to do is open your web browser (e.g., Google Chrome).
- In the Command Prompt, you will see a local link (usually `http://localhost:5173` or similar). Copy that link, paste it into your browser, and press **Enter**.
- **Congratulations! 🎉 The website is now running locally on your machine.**

> **Important Note:** To stop the server later, go back to the Command Prompt and press `Ctrl + C` together, then type `Y`, and press Enter.

---

## 🐧 Running on Linux (Ubuntu/Debian)

The process on Linux is quite similar via the Terminal, but the method of installing the prerequisites differs.

### Step 1: Install Requirements (Node.js & Git)
Open the Terminal (usually by pressing `Ctrl + Alt + T`), then run the following commands in order:

To install Git:
```bash
sudo apt update
sudo apt install git
```

To install Node.js and npm:
```bash
sudo apt install nodejs npm
```

### Step 2: Clone and Run the Project
Type these commands in order (press Enter after each line and wait for it to finish):

```bash
# 1. Download the project from the internet
git clone https://github.com/Mohamed-ALQarram/hayat-web.git

# 2. Enter the project folder
cd hayat-web

# 3. Install the required libraries/dependencies
npm install

# 4. Run the website
npm run dev
```

### Step 3: View the Project
Just like on Windows, open your web browser (e.g., Firefox or Chrome) and navigate to the link displayed in the Terminal (usually `http://localhost:5173`) to see the project running successfully.

---

## 💡 Common Issues & Troubleshooting:

- **`npm is not recognized` or `git is not recognized` error (on Windows):**
  This means that the software (Node.js or Git) was not installed correctly, or your system needs a restart after the installation to recognize the new commands. Try restarting your Command Prompt or your computer.

- **Seeing red error text when running `npm install`:**
  This could be due to a poor internet connection. Try running the `npm install` command again.

