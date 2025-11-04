import sys
import json
import unicodedata
import re
from html import unescape
from typing import List, Optional

import requests


def _normalize(text: str) -> str:
    """Return a lowercase, accent-insensitive, trimmed version of the text."""
    if text is None:
        return ""
    decomposed = unicodedata.normalize("NFD", str(text))
    stripped = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    return stripped.lower().strip()


def _strip_tags(html_text: str) -> str:
    """Remove all HTML tags from a small snippet.

    This is intentionally simple for short fragments and avoids extra deps.
    """
    return re.sub(r"<[^>]+>", "", html_text)


def _extract_item_palavra_text(snippet: str) -> str:
    """Extract the visible word inside <span class="item-palavra"> ... </span>.

    Falls back to stripping all tags if the span is not present.
    """
    if not isinstance(snippet, str) or not snippet:
        return ""
    s = unescape(snippet)
    m = re.search(r"<span\s+class=['\"]item-palavra['\"]>([\s\S]*?)</span>", s, re.IGNORECASE)
    inner = m.group(1) if m else s
    return _strip_tags(inner).strip()


def _extract_words(data: object) -> List[str]:
    """Extract candidate word strings from the API response, tolerating shape changes."""
    # Expected shapes include { "rows": [...] } and { "lista": [...] }
    if isinstance(data, dict):
        raw_list = data.get("rows") or data.get("lista") or []
    elif isinstance(data, list):
        raw_list = data
    else:
        raw_list = []

    words: List[str] = []
    for item in raw_list:
        if isinstance(item, str):
            words.append(item)
        elif isinstance(item, dict):
            # Prefer parsing the HTML snippet under the 'palavra' key when present
            if "palavra" in item and isinstance(item["palavra"], str):
                words.append(_extract_item_palavra_text(item["palavra"]))
                continue
            # Fallback to other possible keys as plain strings
            for key in ("titulo", "termo", "nome"):
                value = item.get(key)
                if isinstance(value, str) and value:
                    words.append(value)
                    break
    return words


def check_word_exists(word: str, timeout_seconds: int = 15) -> Optional[dict]:
    """
    Query the ABL API for a word and return a result dict.

    Returns a dict like:
      { "query": <str>, "exists": <bool>, "exactMatch": <bool>, "matches": <List[str]> }

    Returns None on non-200 HTTP responses.
    """
    url = "https://www.academia.org.br/ajax/abl/buscar-palavras"
    params = {"form": "vocabulario", "palavra": word}
    headers = {
        "accept": "application/json, text/html;q=0.9,*/*;q=0.8",
        "user-agent": "Mozilla/5.0",
    }

    response = requests.get(url, params=params, headers=headers, timeout=timeout_seconds)
    if not response.ok:
        return None

    parsed: Optional[object] = None
    try:
        parsed = response.json()
    except ValueError:
        parsed = None

    words = _extract_words(parsed) if parsed is not None else []

    input_norm = _normalize(word)
    exact = any(_normalize(w) == input_norm for w in words)

    result = {
        "query": word,
        "exists": bool(exact),  # true only for exact (accent-insensitive) match
        "exactMatch": bool(exact),
        "matches": words,
    }
    return result


def main() -> int:
    if len(sys.argv) < 2:
        print(
            "Please provide a word. Example: python scripts/check_word.py apice",
            file=sys.stderr,
        )
        return 2

    word = sys.argv[1].strip()
    try:
        result = check_word_exists(word)
    except requests.RequestException as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
        return 1

    if result is None:
        print("Request failed: non-200 response from API", file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("exists") else 3


if __name__ == "__main__":
    sys.exit(main())


