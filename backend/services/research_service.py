
import re
import requests
import trafilatura

from bs4 import BeautifulSoup
from urllib.parse import urlparse
from collections import Counter


# --------------------------------------------------
# 1. CLEAN EXTRACTED ARTICLE CONTENT
# --------------------------------------------------

def clean_content(content):

    content = re.sub(r"\[\s*[a-zA-Z0-9]+\s*\]", "", content)
    content = re.sub(r"\[edit\]", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\s+", " ", content)

    return content.strip()


# --------------------------------------------------
# 2. SPLIT CONTENT INTO USEFUL SENTENCES
# --------------------------------------------------

def get_sentences(content):

    sentences = re.split(r'(?<=[.!?])\s+', content)

    useful_sentences = []

    unwanted_phrases = [
        "part of a series on",
        "main article",
        "see also",
        "references",
        "external links",
        "contents",
        "edit source",
        "citation needed",
        "jump to navigation",
        "jump to search"
    ]

    for sentence in sentences:

        sentence = sentence.strip()

        word_count = len(sentence.split())

        if word_count < 9 or word_count > 55:
            continue

        lower_sentence = sentence.lower()

        if any(phrase in lower_sentence for phrase in unwanted_phrases):
            continue

        # Avoid navigation and table fragments
        if sentence.count("|") > 1:
            continue

        if sentence.count("=") > 2:
            continue

        if lower_sentence.startswith(("category:", "file:", "template:")):
            continue

        useful_sentences.append(sentence)

    return useful_sentences


# --------------------------------------------------
# 3. SELECT IMPORTANT SENTENCES
# --------------------------------------------------

def get_important_sentences(content, limit=5):

    sentences = get_sentences(content)

    keywords = [
        "artificial intelligence",
        "generative ai",
        "large language model",
        "machine learning",
        "transformer",
        "automation",
        "business",
        "software",
        "technology",
        "research",
        "development",
        "application",
        "productivity",
        "retrieval augmented generation",
        "accuracy",
        "reliability",
        "training",
        "prediction",
        "reasoning",
        "healthcare",
        "finance"
    ]

    action_phrases = [
        "is used",
        "are used",
        "can be used",
        "allows",
        "enables",
        "developed",
        "introduced",
        "improves",
        "reduces",
        "increases",
        "requires",
        "is trained",
        "are trained",
        "helps",
        "supports",
        "generates",
        "predicts"
    ]

    scored_sentences = []

    for sentence in sentences:

        lower_sentence = sentence.lower()
        score = 0

        # Score sentences containing relevant keywords
        for keyword in keywords:

            if keyword in lower_sentence:
                score += 2

        # Prefer sentences that explain what something does
        for phrase in action_phrases:

            if phrase in lower_sentence:
                score += 1

        # Prefer sentences with a reasonable amount of information
        word_count = len(sentence.split())

        if 15 <= word_count <= 40:
            score += 1

        # Reduce the score of sentences that look like fragments
        if sentence.startswith(("The following", "These include", "For example")):
            score -= 2

        scored_sentences.append((score, sentence))

    # Highest-scoring sentences first
    scored_sentences.sort(
        key=lambda item: item[0],
        reverse=True
    )

    selected = []

    for score, sentence in scored_sentences:

        if sentence not in selected:

            selected.append(sentence)

        if len(selected) >= limit:
            break

    return selected


# --------------------------------------------------
# 4. IDENTIFY ARTICLE TOPIC
# --------------------------------------------------

def identify_topic(content, url=""):

    page = url.lower()
    lower_content = content.lower()

    # Known article URLs
    if "generative_artificial_intelligence" in page:
        return "Generative AI"

    if "large_language_model" in page:
        return "Large Language Models"

    if "artificial_intelligence" in page:
        return "Artificial Intelligence"

    # Keyword-based classification for other URLs
    if (
        "generative artificial intelligence" in lower_content
        or "generative ai" in lower_content
    ):
        return "Generative AI"

    if "large language model" in lower_content:
        return "Large Language Models"

    return "Artificial Intelligence"


# --------------------------------------------------
# 5. EXTRACT ARTICLE FROM URL
# --------------------------------------------------

def extract_article(url):

    parsed_url = urlparse(url)

    if parsed_url.scheme not in ["http", "https"]:
        raise ValueError("Only HTTP and HTTPS URLs are supported.")

    if not parsed_url.netloc:
        raise ValueError("Invalid article URL.")

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=20
    )

    response.raise_for_status()

    # First attempt: Trafilatura
    content = trafilatura.extract(
        response.text,
        include_comments=False,
        include_tables=False,
        favor_precision=True,
        deduplicate=True
    )

    # Fallback: BeautifulSoup
    if not content or len(content) < 250:

        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup([
            "script",
            "style",
            "nav",
            "footer",
            "header",
            "aside",
            "form"
        ]):
            tag.decompose()

        content = soup.get_text(
            separator=" ",
            strip=True
        )

    content = clean_content(content or "")

    if len(content) < 250:
        raise ValueError("Could not extract enough article content.")

    return content[:10000]


# --------------------------------------------------
# 6. GENERATE RESEARCH REPORT
# --------------------------------------------------

def research_articles(urls):

    articles = []
    failed_urls = []

    # Extract all supplied URLs
    for url in urls:

        try:

            content = extract_article(url)

            articles.append({
                "url": url,
                "content": content
            })

        except Exception as error:

            print("Extraction failed:", url, error)

            failed_urls.append(url)

    # At least three articles must be extracted
    if len(articles) < 3:

        raise ValueError(
            f"Only {len(articles)} articles extracted. "
            f"Please check these URLs: {failed_urls}"
        )

    report = ""

    all_topics = []

    # Process each article separately
    for index, article in enumerate(articles):

        content = article["content"]

        topic = identify_topic(
            content,
            article["url"]
        )

        all_topics.append(topic)

        important_sentences = get_important_sentences(
            content,
            limit=5
        )

        summary = important_sentences[:3]

        report += f"""

==================================================
ARTICLE {index + 1}
==================================================

SOURCE:
{article['url']}

MAIN TOPIC:
{topic}


ARTICLE SUMMARY:

"""

        for sentence in summary:

            report += f"\n- {sentence}"

        report += """

IMPORTANT INFORMATION FROM THE SOURCE:

"""

        for sentence in important_sentences:

            report += f"\n- {sentence}"

        report += """

RELEVANCE TO FOUNDERS:

The extracted information can help founders evaluate
whether the technology creates a useful business opportunity.

They should consider customer needs, implementation costs,
reliability and practical value before adopting it.


RELEVANCE TO BUILDERS:

Developers and technology teams can examine the technical
approaches described in the source and consider how they
could be applied in real-world applications.


EDITORIAL ANALYSIS:

The following is an interpretation of the extracted
information, not an independently verified fact.

"""

        lower_content = content.lower()

        if any(word in lower_content for word in [
            "hallucination",
            "inaccurate",
            "bias",
            "accuracy",
            "reliability"
        ]):

            report += """
Reliability is an important consideration. Builders should
evaluate system accuracy and include suitable verification
and human-review processes.
"""

        elif any(word in lower_content for word in [
            "automation",
            "productivity",
            "business",
            "healthcare",
            "finance"
        ]):

            report += """
The information suggests possible applications across
business workflows. Product teams should identify specific
problems and evaluate whether AI provides a practical solution.
"""

        else:

            report += """
The information provides technical context that may help
builders understand developments in artificial intelligence.
Further investigation is needed before drawing conclusions.
"""

        report += """

POSSIBLE NEWSLETTER ANGLE:

"""

        if topic == "Generative AI":

            report += """
How generative AI is creating new opportunities and
challenges for businesses and technology builders.
"""

        elif topic == "Large Language Models":

            report += """
What developers should understand about large language
models, their capabilities and their limitations.
"""

        elif topic == "Artificial Intelligence":

            report += """
How artificial intelligence is evolving and what its
developments could mean for technology businesses.
"""

        report += """

FACT CHECKING NOTE:

These points were extracted from the linked source.
They have not been independently verified.

"""

    # --------------------------------------------------
    # 7. FIND RECURRING TOPICS
    # --------------------------------------------------

    topic_counts = Counter(all_topics)

    report += """

==================================================
CROSS-SOURCE OBSERVATIONS
==================================================

RECURRING TOPICS:

"""

    for topic, count in topic_counts.most_common():

        report += (
            f"\n- {topic}: Appears as the main topic "
            f"in {count} source(s)."
        )

    report += """

EDITORIAL OPPORTUNITIES:

1. Compare the technical developments discussed across
   the sources.

2. Explain how these developments could affect founders,
   software developers and technology businesses.

3. Examine practical limitations and reliability challenges
   before recommending adoption.

4. Connect technical information with real-world business
   problems in a newsletter.


RESEARCH LIMITATIONS:

This application uses rule-based extraction and keyword
selection. It does not use an LLM to generate summaries,
verify claims or independently reason about the sources.

All extracted information and editorial interpretations
should be checked against the original articles.

"""

    return {
        "articles": [
            {"url": article["url"]}
            for article in articles
        ],
        "report": report
    }
