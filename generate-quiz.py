"""
A simple script to generate a coding quiz using Anthropic's Claude API.
"""

import os
import json
import logging
from jinja2 import Environment, FileSystemLoader
from anthropic import Anthropic

API_KEY_PATH = "secrets\\anthropic-coding-interviews.key"
JSON_PATH = "coding-quiz.json"
HTML_PATH = "coding-quiz.html"

TAG = "TEST"
NUM_QUESTIONS = 10

# PROMPT = """
# Please generate a JSON array of {N} coding-related quiz questions.

# Each question should:
# - Be about programming concepts, algorithms, or Python language-specific knowledge
# - Include a clear, concise question
# - Have a correct answer that demonstrates understanding
# - Vary in difficulty from beginner to intermediate level

# Return the response in strict JSON format like this:
# [
#     {{
#     "question": "What does the term 'closure' mean in JavaScript?",
#     "answer": "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. It allows a function to 'remember' and access variables from its original context."
#     }},
#     ...
# ]
# Ensure the JSON is valid and parseable.

# Each question or answer can include HTML or code snippets or preformatted code blocks if needed.
# """.format(
#     N=NUM_QUESTIONS,
# )


# PROMPT = """
# Please generate a JSON array of C++ coding-related quiz questions.

# The questions are as follows:
# - Compare enums vs enum classes in C++?
# - What does the mutable keyword do in C++?
# - What does the static keyword do in C++?
# - What does the explicit keyword do in C++?
# - What is the difference between a struct and a class in C++?
# - Compare pointers vs references in C++?
# - What is the difference between the stack and the heap in C++?
# - Compare pass by value vs pass by reference in C++?
# - What is the difference between a copy constructor and an assignment operator in C++?
# - Compare static cast vs dynamic cast vs C-style cast in C++?
# - Explain std::optional in C++?
# - Explain std::variant in C++?
# - Explain std::any in C++?
# - Explain std::function in C++?
# - Explain std::bind in C++?
# - Explain exception handling in C++? Compare with Java?
# - Compare memory management in C++ vs Java?

# Return the response in strict JSON format like this:
# [
#     {{
#     "question": "What does the term 'closure' mean in JavaScript?",
#     "answer": "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. It allows a function to 'remember' and access variables from its original context."
#     }},
#     ...
# ]
# Ensure the JSON is valid and parseable.

# Do not include anything else in the response but the JSON array.

# Each question or answer can include HTML or code snippets or preformatted code blocks if needed.
# """.format(
#     N=NUM_QUESTIONS,
# )


PROMPT = """
Please generate a JSON array of C++ coding-related quiz questions. 

The questions are as follows:
- Compare enums vs enum classes in C++?
- What does the mutable keyword do in C++?
- What does the static keyword do in C++?
- What does the explicit keyword do in C++?
- What is the difference between a struct and a class in C++?

Return the response in strict JSON format like this:
[
    {{
    "question": "What does the term 'closure' mean in JavaScript?",
    "answer": "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. It allows a function to 'remember' and access variables from its original context."
    }},
    ...
]
Ensure the JSON is valid and parseable.

Do not include anything else in the response but the JSON array.

Each question or answer can include HTML or code snippets or preformatted code blocks if needed.
""".format(
    N=NUM_QUESTIONS,
)


def load_api_key():
    with open(API_KEY_PATH, "r") as f:
        return f.read().strip()


def load_coding_quiz_json(filename):
    if not os.path.isfile(filename):
        return None

    with open(filename, "r") as f:
        try:
            quiz = json.load(f)
            logger.info(f"Loaded quiz from '{filename}'")
            return quiz
        except json.JSONDecodeError as e:
            logger.error(f"Error loading quiz from '{filename}': {e}")
            return None


def save_coding_quiz_json(filename, quiz):
    with open(filename, "w") as f:
        json.dump(quiz, f, indent=2)
        logger.info(f"Saved quiz to '{filename}'")


def dump_repr_file(response):
    logger.info("Dumping response to 'temp-response.repr'")
    with open("temp-response.repr", "w") as f:
        f.write(repr(response))
        logger.info("Dumped response to 'temp-response.repr'")


def dump_attrs_file(response):
    logger.info("Dumping response to 'temp-response.attrs'")
    with open("temp-response.attrs", "w") as f:
        for attr in sorted(dir(response)):
            if not attr.startswith("_"):
                f.write(f"{attr}: {repr(getattr(response, attr))}\n")
        logger.info("Dumped response to 'temp-response.attrs'")


def dump_json_file(response):
    data = {
        "id": response.id,
        "type": response.type,
        "role": response.role,
        "content": [
            {"type": content.type, "text": content.text} for content in response.content
        ],
        "model": response.model,
        "stop_reason": response.stop_reason,
        "stop_sequence": response.stop_sequence,
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        },
    }
    logger.info("Dumping response to 'temp-response.json'")
    with open("temp-response.json", "w") as f:
        json.dump(data, f, indent=2)
        logger.info("Dumped response to 'temp-response.json'")


def generate_coding_quiz():
    client = Anthropic(api_key=load_api_key())

    try:
        # Send the request to Claude.
        logger.info("Send request to Anthropic's Claude API")
        response = client.messages.create(
            # model="claude-3-opus-20240229",
            model="claude-3-5-haiku-20241022",
            max_tokens=5000,
            messages=[{"role": "user", "content": PROMPT}],
        )
        logger.info("Got response from Anthropic's Claude API")

        dump_repr_file(response)
        dump_attrs_file(response)
        dump_json_file(response)

        # Extract and parse the response.
        quiz_json = response.content[0].text.strip()

        # Validate JSON.
        quiz_questions = json.loads(quiz_json)

        return quiz_questions
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        return None


def generate_html_quiz(filename, quiz):
    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template("quiz.html")
    rendered_html = template.render(subject=TAG, pairs=quiz)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(rendered_html)
        logger.info(f"Saved quiz to '{filename}'")


if __name__ == "__main__":
    print()
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    quiz = load_coding_quiz_json(JSON_PATH)
    if not quiz:
        quiz = generate_coding_quiz()
        if not quiz:
            logger.error("No quiz generated.")
            exit(1)
        save_coding_quiz_json(JSON_PATH, quiz)

    generate_html_quiz(HTML_PATH, quiz)
