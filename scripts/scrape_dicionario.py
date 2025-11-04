import argparse
import re
import sys
from typing import Iterable, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup


DEFAULT_URL = "https://www.dicionarioinformal.com.br/caca-palavras/5-letras/a----/1"


def _build_page_url(base_url: str, page_number: int) -> str:
    # Replace trailing /<number> or append if missing
    if re.search(r"/\d+/?$", base_url):
        return re.sub(r"/\d+/?$", f"/{page_number}", base_url)
    return base_url.rstrip("/") + f"/{page_number}"


def _fetch_html(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(url, headers=headers, timeout=30)
    # Improve character decoding for pages that don't set it properly
    if not response.encoding or response.encoding.lower() == "iso-8859-1":
        response.encoding = response.apparent_encoding
    response.raise_for_status()
    return response.text


def _extract_pattern_token(url: str) -> Tuple[str, int]:
    """Return (token, dash_count) from the segment like 'a----' in the URL.

    Expects the URL form .../5-letras/<token>/<page> where token is letter + dashes.
    """
    m = re.search(r"/5-letras/([^/]+)/", url)
    if not m:
        raise ValueError("URL does not contain expected '/5-letras/<token>/' segment")
    token = m.group(1)
    # Count trailing dashes; if not present, assume 4 (for 5 letters total)
    dash_count = len(token) - 1 if len(token) >= 1 else 4
    return token, dash_count


def _build_letter_url(base_url: str, letter: str) -> str:
    token, dash_count = _extract_pattern_token(base_url)
    new_token = f"{letter}{'-' * dash_count}"
    return re.sub(r"(/5-letras/)([^/]+)(/)", rf"\1{new_token}\3", base_url)


def _iterate_letters(letters: Iterable[str]) -> Iterable[str]:
    for ch in letters:
        yield ch


def scrape_words_for_letter(url_for_letter: str, start_page: int, max_pages: Optional[int]) -> List[str]:
    collected: List[str] = []
    seen = set()

    page = start_page
    pages_fetched = 0
    while True:
        if max_pages is not None and pages_fetched >= max_pages:
            break

        page_url = _build_page_url(url_for_letter, page)
        print(f"[INFO] Scraping page {page}")
        html = _fetch_html(page_url)
        soup = BeautifulSoup(html, "html.parser")

        anchors = soup.select("div.a_cinza.definicoes.t-center a")
        if not anchors:
            # No target divs/anchors found -> stop
            print("[INFO] No target anchors found; stopping pagination for this letter.")
            break

        page_had_word = False
        for a in anchors:
            text = a.get_text(strip=True)
            if not text:
                continue
            if text not in seen:
                seen.add(text)
                collected.append(text)
            page_had_word = True

        if not page_had_word:
            break

        page += 1
        pages_fetched += 1

        print(f"[INFO] Page complete. Collected so far for this letter: {len(collected)}")

    return collected


def scrape_words(url: str, start_page: int = 1, max_pages: Optional[int] = None, letters: Optional[str] = None) -> List[str]:
    if not letters or letters == "all":
        letters_iterable = _iterate_letters("abcdefghijklmnopqrstuvwxyz")
    else:
        letters_iterable = _iterate_letters(letters)

    all_words: List[str] = []
    seen_global = set()

    for letter in letters_iterable:
        letter_url = _build_letter_url(url, letter)
        print(f"[INFO] === Letter '{letter}' ===")
        words_for_letter = scrape_words_for_letter(letter_url, start_page, max_pages)
        print(f"[INFO] Letter '{letter}' total words: {len(words_for_letter)}")
        for w in words_for_letter:
            if w not in seen_global:
                seen_global.add(w)
                all_words.append(w)

    print(f"[INFO] Grand total unique words: {len(all_words)}")
    return all_words


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Scrape words from dicionarioinformal.com.br within "
            'divs of class "a_cinza definicoes t-center".'
        )
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help=f"URL to scrape (default: {DEFAULT_URL})",
    )
    parser.add_argument(
        "--out",
        help=(
            "Optional output file path (.txt or .csv). If omitted, prints to stdout."
        ),
    )
    parser.add_argument(
        "--start-page",
        type=int,
        default=1,
        help="Starting page number (default: 1)",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        help="Maximum number of pages to fetch (optional)",
    )
    parser.add_argument(
        "--letters",
        default="all",
        help=(
            "Letters to iterate (e.g. 'abc' or 'all' for a-z; default: all)"
        ),
    )

    args = parser.parse_args()

    try:
        words = scrape_words(
            args.url,
            start_page=args.start_page,
            max_pages=args.max_pages,
            letters=args.letters,
        )
    except Exception as exc:
        print(f"Error scraping {args.url}: {exc}", file=sys.stderr)
        return 1

    if args.out:
        # Write one word per line (UTF-8)
        try:
            with open(args.out, "w", encoding="utf-8", newline="") as f:
                for w in words:
                    f.write(w + "\n")
            print(f"Saved {len(words)} words to {args.out}")
        except Exception as exc:
            print(f"Error writing to {args.out}: {exc}", file=sys.stderr)
            return 1
    else:
        for w in words:
            print(w)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())


