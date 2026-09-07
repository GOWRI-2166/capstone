import os
import joblib
from typing import Optional, Dict, Any, Tuple, List
from app.utils.logger import logger

class ModelManager:
    """
    Centralized Model Lifecycle & Inference Manager.
    
    Loads pre-trained Linear SVM model and matching TF-IDF vectorizer via joblib.
    Performs startup validation, class inspection, and lightweight inference.
    Thread-safe singleton loaded once at application startup.
    """
    _instance: Optional['ModelManager'] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(
        self,
        model_path: str = "backend/models/prompt_injection_model.pkl",
        vectorizer_path: str = "backend/models/tfidf_vectorizer.pkl"
    ):
        if self._initialized:
            return
        
        # Primary and alternative relative paths
        self.model_paths = [
            model_path,
            os.path.join(os.path.dirname(__file__), "..", "..", "models", "prompt_injection_model.pkl"),
            "models/prompt_injection_model.pkl"
        ]
        self.vectorizer_paths = [
            vectorizer_path,
            os.path.join(os.path.dirname(__file__), "..", "..", "models", "tfidf_vectorizer.pkl"),
            "models/tfidf_vectorizer.pkl"
        ]
        
        self.model: Any = None
        self.vectorizer: Any = None
        self.is_loaded: bool = False
        self.model_type: str = "Unknown"
        self.classes: List[Any] = []
        self.has_decision_function: bool = False
        self.has_predict_proba: bool = False
        self.load_error: Optional[str] = None
        self.normal_class_label: int = 0
        self.injection_class_label: int = 1
        
        self._load_and_validate()
        self._initialized = True

    def _resolve_path(self, candidate_paths: List[str]) -> Optional[str]:
        for p in candidate_paths:
            normalized = os.path.normpath(p)
            if os.path.exists(normalized) and os.path.isfile(normalized):
                return normalized
        return None

    def _load_and_validate(self) -> None:
        """Safe startup loading and validation of model artifacts."""
        model_file = self._resolve_path(self.model_paths)
        vec_file = self._resolve_path(self.vectorizer_paths)

        if not model_file or not vec_file:
            missing = []
            if not model_file:
                missing.append("prompt_injection_model.pkl")
            if not vec_file:
                missing.append("tfidf_vectorizer.pkl")
            self.load_error = f"Missing model artifact(s): {', '.join(missing)} in backend/models/"
            self.is_loaded = False
            logger.warning(f"ModelManager: {self.load_error}. ML detection will report UNAVAILABLE.")
            return

        try:
            logger.info("ModelManager: Loading TF-IDF vectorizer and Linear SVM model...")
            self.vectorizer = joblib.load(vec_file)
            self.model = joblib.load(model_file)

            # 1. Validate Vectorizer
            if not hasattr(self.vectorizer, "transform"):
                raise TypeError("Loaded vectorizer does not implement 'transform(raw_documents)'")

            # 2. Validate Model
            if not hasattr(self.model, "predict"):
                raise TypeError("Loaded model does not implement 'predict(X)'")

            self.model_type = self.model.__class__.__name__
            self.has_decision_function = hasattr(self.model, "decision_function")
            self.has_predict_proba = hasattr(self.model, "predict_proba")

            # 3. Inspect Classes
            if hasattr(self.model, "classes_"):
                self.classes = [int(c) if isinstance(c, (int, float)) else str(c) for c in self.model.classes_]
            else:
                self.classes = [0, 1]

            # Verify known classes: 0 = Normal, 1 = Prompt Injection
            if len(self.classes) >= 2:
                self.normal_class_label = self.classes[0]
                self.injection_class_label = self.classes[1]

            # 4. Safe Test Vector Inference Verification
            test_prompt = "Sanity check test prompt"
            test_vec = self.vectorizer.transform([test_prompt])
            test_pred = self.model.predict(test_vec)
            if self.has_decision_function:
                _ = self.model.decision_function(test_vec)

            self.is_loaded = True
            self.load_error = None
            logger.info(
                f"ModelManager: Successfully loaded and verified {self.model_type} classifier "
                f"with {len(self.classes)} classes {self.classes}. Ready for inference."
            )
        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            logger.error(f"ModelManager: Failed to initialize ML model artifacts: {e}")

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Execute inference on raw user prompt without modifying model or refitting vectorizer.
        
        Returns:
            Dict with:
                - prediction: int (0 or 1)
                - model_prediction: str ("NORMAL" or "PROMPT_INJECTION")
                - model_score: Optional[float] (raw decision function score)
                - is_threat: bool
        """
        if not self.is_loaded or self.vectorizer is None or self.model is None:
            # Fallback when model artifacts are not present
            return {
                "prediction": 0,
                "model_prediction": "UNAVAILABLE",
                "model_score": None,
                "is_threat": False,
                "error": self.load_error or "Model is not loaded"
            }

        # 1. Transform raw text using fitted TF-IDF vectorizer (NEVER call fit or fit_transform)
        features = self.vectorizer.transform([text])

        # 2. Model prediction
        raw_pred = self.model.predict(features)[0]
        pred_label = int(raw_pred) if isinstance(raw_pred, (int, float)) else raw_pred

        # 3. Decision score (signed distance to separating hyperplane for LinearSVC)
        decision_score: Optional[float] = None
        if self.has_decision_function:
            df_val = self.model.decision_function(features)
            # For binary classification, decision_function returns shape (1,) or (1, 1)
            if hasattr(df_val, "__len__"):
                val = float(df_val[0])
            else:
                val = float(df_val)
            decision_score = round(val, 4)

        # 4. Threat classification based on verified classes
        is_threat = (pred_label == self.injection_class_label)
        model_prediction_str = "PROMPT_INJECTION" if is_threat else "NORMAL"

        return {
            "prediction": pred_label,
            "model_prediction": model_prediction_str,
            "model_score": decision_score,
            "is_threat": is_threat,
            "error": None
        }

    def get_status(self) -> Dict[str, Any]:
        """
        Return safe status metadata without exposing filesystem paths, internal pickle bytes, or secrets.
        """
        return {
            "model_status": "READY" if self.is_loaded else "UNAVAILABLE",
            "model_type": self.model_type if self.is_loaded else None,
            "vectorizer_status": "READY" if self.is_loaded else "UNAVAILABLE",
            "classes": self.classes if self.is_loaded else [],
            "prediction_method": "predict" if self.is_loaded else "unavailable",
            "decision_score_available": self.has_decision_function if self.is_loaded else False,
            "predict_proba_available": self.has_predict_proba if self.is_loaded else False,
            "detail": "Linear SVM classifier with TF-IDF N-gram feature extraction" if self.is_loaded else self.load_error
        }

# Global singleton instance
model_manager = ModelManager()
