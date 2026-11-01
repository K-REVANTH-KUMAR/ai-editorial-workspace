import unittest

from services.writing_analyzer import analyze_writing


class WritingAnalyzerTests(unittest.TestCase):
    def test_detects_filler_words(self):
        issues = analyze_writing("Basically, this is useful. Actually, it is simple.")
        filler_issues = [issue for issue in issues if issue["type"] == "Filler Word"]
        self.assertEqual([issue["passage"].lower() for issue in filler_issues], ["basically", "actually"])

    def test_detects_common_passive_voice_patterns(self):
        content = (
            "Large language models are trained on text. "
            "The generated code must be reviewed. "
            "The report has been updated."
        )
        issues = analyze_writing(content)
        passive_issues = [issue for issue in issues if issue["type"] == "Passive Voice"]
        self.assertEqual(len(passive_issues), 3)

    def test_detects_long_sentences(self):
        content = "This sentence contains many words and keeps adding more details so that it becomes longer than the twenty five word limit used by this simple writing checker."
        issues = analyze_writing(content)
        self.assertTrue(any(issue["type"] == "Long Sentence" for issue in issues))

    def test_returns_no_issues_for_short_direct_text(self):
        issues = analyze_writing("Writers need clear ideas. Readers value useful details.")
        self.assertEqual(issues, [])


if __name__ == "__main__":
    unittest.main()
