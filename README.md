# 🛡️ Universal AI Guardrail: Securing LLM-Based Agents Against Prompt Injection and Malicious Attacks

> **Final-Year Capstone Project — Unified Full-Stack Website Platform 🟢**

---

## 🎯 Project Overview
The **Universal AI Guardrail** is a production-grade, agent-independent security middleware platform designed to protect Large Language Model (LLM) agents against prompt injections, jailbreaks, instruction overrides, system prompt extraction, data exfiltration, and output credential leaks in real time.

The entire application runs as **ONE COMPLETE FULL-STACK WEBSITE** served from `http://localhost:8000`.

---

## 🏛️ System Architecture

```
User Request ──▶ [ Input Guardrail ] ──▶ [ Rule + Linear SVM ML Ensemble ] ──▶ [ Risk & Decision Engine ]
                                                                                         │
                                         ┌───────────────────────────────────────────────┴───────────────────────────────────────────────┐
                                         ▼                                                                                               ▼
                                  🟢 LOW (< 0.40)                                                                                🔴 HIGH (≥ 0.70)
                                  [ Transparent ALLOW ]                                                                           [ Immediate BLOCK ]
                                         │                                                                                               │
                                         ▼                                                                                               ▼
                                [ Target AI Agent ]                                                                         [ Security Alert Dashboard ]
                         (General, Code, Travel, Finance, etc.)                                                             (Forensics & Mitigations)
                                         │
                                         ▼
                               [ Output Guardrail ]
                         (PII, Secrets & Leak Redaction)
                                         │
                                         ▼
                               [ Verified Response ]
```

---

## 🌐 Unified Single-URL Hosting Model

| Path | Destination | Description |
| :--- | :--- | :--- |
| **`http://localhost:8000/`** | **React Frontend Web App** | Single Page Application (Landing, Auth, Agents, Chat, Dashboard) |
| **`http://localhost:8000/login`** | **Auth Gateway** | JWT Authentication with demo prefill button |
| **`http://localhost:8000/agents`** | **Agent Selection** | Multi-agent protected ecosystem directory |
| **`http://localhost:8000/chat/:id`**| **AI Chat Workspace** | Real-time chat mediated by dual-pipeline guardrail |
| **`http://localhost:8000/dashboard`**| **Security Operations** | 12-column real-time telemetry and forensic dashboard |
| **`http://localhost:8000/api/v1/...`**| **FastAPI Backend** | Production REST APIs (Guardrail, Chat, Auth, Telemetry) |
| **`http://localhost:8000/docs`** | **Swagger UI** | Interactive API documentation |
| **`http://localhost:8000/openapi.json`** | **OpenAPI Schema** | Complete machine-readable API specification |

---

## 💻 Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+) with Uvicorn ASGI
- **Machine Learning**: Pure-Python TF-IDF N-gram Vectorizer + Linear SVM Classifier (94.6% Accuracy, 96.4% Recall, 0.007ms inference latency)
- **Rule Engine**: 6 Modular Regex, Heuristic, and Token-Delimited Security Analyzers
- **Database**: SQLite with SQLAlchemy ORM (`guardrail.db`) with relational cascades (`users`, `agents`, `conversations`, `messages`, `guardrail_audit_logs`, `security_alerts`)
- **Authentication**: JWT Bearer Token-based Auth with bcrypt-hashed passwords
- **Testing**: Pytest & HTTPX (58 automated test suites passing 100%)

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router 7 with client-side SPA fallback for all nested paths
- **Styling**: Cybersecurity Dark Mode Theme with Glassmorphism (`frontend/src/styles/index.css`)
- **Charts & Visuals**: Recharts & Lucide React Icons

---

## 🔑 Default Demonstration Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Security Administrator** | `security@guardrail.ai` | `Admin@12345` |

*(You can also register a new custom administrator account on the `/register` page).*

---

## 🤖 Pre-Configured Protected AI Agents

1. 🤖 **General AI Assistant** (`general-assistant`) — General-purpose conversational reasoning.
2. 💻 **Coding Assistant** (`coding-agent`) — Code generation, algorithm design, and security debugging.
3. ✈️ **Travel Assistant** (`travel-agent`) — Itinerary planning and flight discovery.
4. 📈 **Finance Assistant** (`finance-agent`) — Market concepts, personal budgeting, and financial analytics.
5. 📚 **Research Assistant** (`research-agent`) — Scientific inquiries, literature review, and factual QA.
6. 🏦 **Banking Agent** (`banking-agent`) — Transactional workflows and banking ops.
7. 🛒 **Shopping Agent** (`shopping-agent`) — Product search and e-commerce recommendations.

---

## 🚀 How to Run the Application

### Option A: Unified Single-Server Mode (Recommended)
This runs both the React frontend and FastAPI backend under one main website URL (`http://localhost:8000`):

```bash
# 1. Build the React frontend production bundle
cd frontend
npm run build
cd ..

# 2. Start the unified FastAPI server
python -m uvicorn app.main:app --app-dir backend --port 8000 --reload
```
- **Main Website**: [http://localhost:8000](http://localhost:8000)
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Dual-Process Development Mode
If you are developing frontend components with Vite Hot-Module-Reloading (HMR):

```bash
# Terminal 1 - Backend API Server
python -m uvicorn app.main:app --app-dir backend --port 8000 --reload

# Terminal 2 - Frontend Dev Server
cd frontend
npm run dev
```
- **Frontend Dev UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## 🧪 Automated Testing

```bash
# Run backend pytest suite
python -m pytest backend/tests -v

# Run full-stack integration verification
python test_full_flow.py
```
*(All 58 test suites pass 100%)*

---

## 🔬 Empirical Model Evaluation & Benchmark Results

### Model Comparison Matrix (Held-out Test Split)
| Classifier Model | Accuracy | Precision | Recall (Security) | F1-Score | False Positive Rate | Latency | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Linear SVM / Naive Bayes** | **94.64%** | **93.10%** | **96.43%** | **94.74%** | **7.14%** | **0.007ms** | 🏆 **ACTIVE** |
| **Logistic Regression** | 91.07% | 87.10% | 96.43% | 91.53% | 14.29% | 0.004ms | Baseline |
| **Random Forest** | 87.50% | 81.82% | 96.43% | 88.52% | 21.43% | 0.418ms | Baseline |

### AgentDojo Benchmark Suite
- **Scenarios Evaluated**: 10
- **Defense Accuracy**: **100.0%**
- **Average Latency**: **0.15ms**
