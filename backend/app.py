from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from services.writing_analyzer import analyze_writing
from services.research_service import research_articles

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Editorial Workspace Backend is running"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "success", "message": "Backend is healthy"})


@app.route("/api/analyze-writing", methods=["POST"])
def analyze_content():
    data = request.get_json(silent=True) or {}
    content = data.get("content", "")

    if not isinstance(content, str) or not content.strip():
        return jsonify({
            "status": "error",
            "message": "Content must be a non-empty string."
        }), 400

    issues = analyze_writing(content)

    return jsonify({
        "status": "success",
        "total_issues": len(issues),
        "issues": issues
    })


@app.route("/api/research", methods=["POST"])
def research():
    data = request.get_json(silent=True) or {}
    urls = data.get("urls", [])

    if not isinstance(urls, list) or len(urls) < 3:
        return jsonify({
            "status": "error",
            "message": "Please provide at least 3 article URLs."
        }), 400

    if not all(isinstance(url, str) and url.startswith(("http://", "https://")) for url in urls):
        return jsonify({
            "status": "error",
            "message": "Every source must be a valid HTTP or HTTPS URL."
        }), 400

    if len(set(urls)) != len(urls):
        return jsonify({
            "status": "error",
            "message": "Duplicate source URLs are not allowed."
        }), 400

    try:
        result = research_articles(urls)
        return jsonify({
            "status": "success",
            "articles": result["articles"],
            "report": result["report"]
        })
    except ValueError as error:
        return jsonify({"status": "error", "message": str(error)}), 422
    except Exception:
        app.logger.exception("Research request failed")
        return jsonify({
            "status": "error",
            "message": "Research failed. One or more websites may be unavailable or block article extraction."
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
