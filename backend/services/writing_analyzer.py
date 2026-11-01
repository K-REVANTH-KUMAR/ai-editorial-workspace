import re


def analyze_writing(content):
    issues = []

    # 1. Detect long sentences.
    sentences = re.split(r"(?<=[.!?])\s+", content.strip())

    for sentence in sentences:
        words = sentence.split()

        if len(words) > 25:
            issues.append({
                "type": "Long Sentence",
                "passage": sentence,
                "explanation": "This sentence contains more than 25 words.",
                "suggestion": "Consider splitting this sentence into shorter sentences.",
                "replacement": None
            })

    # 2. Detect every occurrence of selected filler words.
    filler_words = ["basically", "actually", "really", "very"]

    for word in filler_words:
        for match in re.finditer(r"\b" + re.escape(word) + r"\b", content, re.IGNORECASE):
            issues.append({
                "type": "Filler Word",
                "passage": match.group(),
                "explanation": "This filler word may be unnecessary.",
                "suggestion": "Remove this word to make the sentence more direct.",
                "replacement": ""
            })

    # 3. Detect common passive-voice patterns.
    # This is a heuristic: it catches common forms such as "are trained",
    # "is being used", "must be reviewed" and "has been updated".
    passive_pattern = re.compile(
        r"\b(?:"
        r"(?:am|is|are|was|were|be|been|being)\s+(?:(?:now|also|often|usually|currently)\s+)*(?:(?:being|been)\s+)?[a-z]+(?:ed|en)"
        r"|(?:must|should|could|would|might|may|can|will)\s+be\s+[a-z]+(?:ed|en)"
        r"|(?:has|have|had)\s+been\s+[a-z]+(?:ed|en)"
        r")\b",
        re.IGNORECASE
    )

    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and passive_pattern.search(sentence):
            issues.append({
                "type": "Passive Voice",
                "passage": sentence,
                "explanation": "This sentence may use passive voice.",
                "suggestion": "Rewrite the sentence to make the subject performing the action clearer.",
                "replacement": None
            })

    return issues
