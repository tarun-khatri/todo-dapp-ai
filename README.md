Below is a complete README content for your project. You can copy this into your `README.md` file.

---

```markdown
# Decentralized To-Do Application with AI Agent Integration

## Overview

This project is a decentralized to-do application that integrates blockchain technology and an AI agent to enhance task management. Users can manage their tasks securely, verify task completions on-chain, and receive AI-driven task prioritization, reminders, and motivational tips.

## Features

- **Task Management:**  
  - Create, edit, delete, and mark tasks as complete.
  - Display task analytics such as a progress bar and completion percentage.

- **Blockchain Integration:**  
  - Verify task completions by storing a unique task hash on a blockchain (testnet).
  - Interact with a Solidity smart contract via Web3.js.

- **AI Agent Integration:**  
  - **Task Prioritization & Analysis:** AI provides a bullet-point analysis for each task with assigned priorities (High, Medium, Low, or Overdue) and actionable recommendations.
  - **Smart Reminders:** Generate clear, actionable reminders for tasks that are overdue or due soon.
  - **Motivational Tips:** Receive a concise, creative motivational tip to boost productivity.
  - Powered by the free Hugging Face Inference API using the `google/flan-t5-base` model.

- **Responsive UI:**  
  - Built with React (Vite) and Material-UI.
  - Modern, mobile-friendly design with features like modals, a floating AI suggestion panel, and a task completion bar.

## Technology Stack

- **Frontend:**  
  - React.js (via Vite)
  - Material-UI (MUI)
  - Axios, React Router, and WAGMI for wallet connectivity

- **Backend:**  
  - Node.js with Express
  - MongoDB (via Mongoose)
  - JSON Web Tokens (JWT) for authentication
  - Axios for API calls
  - Web3.js for blockchain interactions

- **Blockchain:**  
  - Solidity smart contract deployed on a testnet (e.g., Sepolia or Goerli)
  - Interaction via Web3.js

- **AI Integration:**  
  - Hugging Face Inference API using the free `google/flan-t5-base` model
  - Custom endpoints in Express for generating task analysis, reminders, and motivational tips

## Project Structure

```
decentralized-todo/
├── backend/
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Business logic for tasks and authentication
│   ├── middleware/           # Authentication and other middleware
│   ├── models/               # Mongoose schemas (User, Task, etc.)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── ai.js             # AI endpoints for task analysis, reminders, and tips
│   ├── abi/                  # Smart contract ABI (if applicable)
│   ├── index.js              # Main server file
│   └── .env                  # Environment variables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskCompletionBar.jsx
│   │   │   └── AISuggestions.jsx  # AI integration component
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local instance or MongoDB Atlas)
- A testnet wallet (e.g., MetaMask) for blockchain interactions
- A Hugging Face account to obtain a free API token

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd decentralized-todo/backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**  
   Create a `.env` file in the `backend/` directory with the following:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   HUGGINGFACE_API_TOKEN=your_huggingface_api_token
   RPC_URL=your_rpc_url_for_blockchain_interaction
   CONTRACT_ADDRESS=your_smart_contract_address
   ```

4. **Start the Backend Server:**

   ```bash
   npm run dev  # or node index.js
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure API URLs:**  
   Update the API endpoints in your Axios instances if necessary to point to your backend’s URL.

4. **Start the Frontend Server:**

   ```bash
   npm run dev
   ```

## Deployment

### Backend Deployment

- Deploy your Node/Express backend on free hosting platforms such as Render, Railway, or Fly.io.
- Ensure that environment variables (including your Hugging Face API token) are set on your deployment platform.

### Frontend Deployment

- Deploy your React frontend on platforms such as Vercel or Netlify.
- Ensure the API endpoints point to your deployed backend’s URL.

## Blockchain & Smart Contract

- Develop and deploy your Solidity smart contract (using Remix IDE or Hardhat) to a testnet (e.g., Sepolia or Goerli).
- Update the `CONTRACT_ADDRESS` in your backend’s `.env` file.
- Use Web3.js in your backend to interact with the smart contract for task completion verification.

## AI Integration

- The backend AI endpoints in `backend/routes/ai.js` use the Hugging Face Inference API with the `google/flan-t5-base` model.
- Obtain a free API token from [Hugging Face](https://huggingface.co) and add it to your `.env` file.
- The endpoints generate task analysis, reminders, and motivational tips based on custom prompts.

## License

This project is licensed under the MIT License.
```