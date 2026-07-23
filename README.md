# Safaricom Nexus VMS — Voucher Recovery Gateway & Simulator

An enterprise-grade voucher management and damaged scratch card recovery system. Designed to assist customer support agents and USSD automated services in recovering overscratched, degraded, or partially obscured recharge vouchers using intelligent vision processing and fuzzy PIN matching algorithms.

---

## 🌟 Key Features

### 1. 📷 Vision Recovery Engine (Mobile & Camera Upload)
* Upload physical scratch card images with damaged or partially missing PIN digits.
* Automated OCR (Optical Character Recognition) extracts visible serial numbers and digits.
* Multimodal Vision Analysis accurately identifies degraded digits, confidence scores, and potential character substitutions.

### 2. 📱 USSD Gateway Simulator (`*140*`)
* Simulates feature phone USSD dial string interactions (`*140*PIN*SERIAL#`).
* Bypasses image processing to directly execute high-speed fuzzy matching.
* Built-in rate limiting and anti-brute force security rules.

### 3. 🧠 Smart Fuzzy Matcher & Collision Resolver
* Cross-references partial digits against the database of valid scratch cards (`mock_vms_db.json`).
* Resolves serial collisions using checksum validation, region filtering, and batch sequence analysis.
* Prevents double-recharge fraud by verifying voucher status (`unused`, `used`, `expired`).

### 4. 📊 Platform Analytics & Audit Logs
* Real-time metrics tracking total recovery attempts, success rates, fraud rejections, and average processing latency.
* Complete event audit trail for forensic review and security reporting.

### 5. 💻 Interactive Validation & Recovery Terminal
* In-browser live terminal for inspecting raw API payloads, match confidences, database records, and execution logs.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────────────────────┐
                       │           Client Web Frontend           │
                       │   (React + TypeScript + Tailwind CSS)   │
                       └────────────────────┬────────────────────┘
                                            │
                                            │ HTTP / REST API
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │          Express Node.js Server         │
                       │             (API Gateway)               │
                       └───────────┬─────────────────┬───────────┘
                                   │                 │
            ┌──────────────────────┴┐               ┌┴──────────────────────┐
            │ Vision Recovery API   │               │ USSD Simulator API    │
            │  - Image Analysis     │               │  - Direct Text PIN    │
            │  - Digit OCR          │               │  - Rate Limiting      │
            └───────────┬───────────┘               └───────────┬───────────┘
                        │                                       │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │     Fuzzy Matching & Voucher Engine     │
                       │  - VMS Database Lookup (`/tests/`)     │
                       │  - Status & Expiry Validation          │
                       └─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
.
├── .env.example             # Example environment variable declarations
├── index.html               # Main HTML entry point
├── package.json             # Node.js dependencies and scripts
├── server.ts                # Express backend API gateway & static server
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
├── tests/
│   └── mock_vms_db.json     # Primary VMS database dataset (JSON format)
└── src/
    ├── App.tsx              # Main dashboard component
    ├── components/          # React components (Vision, USSD, Analytics, Terminal)
    ├── data/
    │   ├── mock_vms_db.json # Local copy of database records
    │   └── vouchers.ts      # Data importer and parser helpers
    ├── services/            # API client services
    └── types.ts             # Global TypeScript type declarations
```

---

## 🛠️ Prerequisites & Setup

### Requirements
* **Node.js**: v18.x or higher
* **npm**: v9.x or higher

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd safaricom-vms
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Vision API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/recover/vision` | Accepts base64 image data and runs intelligent OCR vision analysis |
| `POST` | `/api/v1/recover/ussd` | Accepts `msisdn`, `user_input_pin`, and `user_input_serial` payload |
| `GET`  | `/api/vms/vouchers` | Returns list of reference voucher records from the database |
| `GET`  | `/health` | Server health check endpoint |

---

## 📄 License

Internal Enterprise License — Designed for Safaricom Voucher Management System testing and simulation.
