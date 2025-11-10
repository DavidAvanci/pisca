#!/usr/bin/env python3
"""
Script to generate JavaScript arrays from valid_answers.csv and valid_guesses.csv
"""

import csv
import json


def read_csv_words(filename):
    """Read words from a CSV file (one word per line)"""
    words = []
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if row and row[0].strip():  # Skip empty rows
                words.append(row[0].strip())
    return words


def generate_js_arrays(answers_file, guesses_file, output_file):
    """Generate JavaScript arrays from CSV files"""
    
    # Read the CSV files
    print(f"Reading {answers_file}...")
    valid_answers = read_csv_words(answers_file)
    print(f"  Found {len(valid_answers)} valid answers")
    
    print(f"Reading {guesses_file}...")
    valid_guesses = read_csv_words(guesses_file)
    print(f"  Found {len(valid_guesses)} valid guesses")
    
    # Generate JavaScript output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated JavaScript arrays from CSV files\n\n")
        
        # Write valid answers array
        f.write("export const VALID_ANSWERS = [\n")
        for i, word in enumerate(valid_answers):
            if i < len(valid_answers) - 1:
                f.write(f'  "{word}",\n')
            else:
                f.write(f'  "{word}"\n')
        f.write("];\n\n")
        
        # Write valid guesses array
        f.write("export const VALID_GUESSES = [\n")
        for i, word in enumerate(valid_guesses):
            if i < len(valid_guesses) - 1:
                f.write(f'  "{word}",\n')
            else:
                f.write(f'  "{word}"\n')
        f.write("];\n\n")
        
        # Write combined array (all valid words)
        f.write("export const ALL_VALID_WORDS = [...VALID_ANSWERS, ...VALID_GUESSES];\n")
    
    print(f"\nJavaScript arrays written to {output_file}")
    print(f"  VALID_ANSWERS: {len(valid_answers)} words")
    print(f"  VALID_GUESSES: {len(valid_guesses)} words")
    print(f"  Total unique words: {len(set(valid_answers + valid_guesses))}")


if __name__ == "__main__":
    # File paths
    answers_file = "valid_answers.csv"
    guesses_file = "valid_guesses.csv"
    output_file = "validWords.js"
    
    try:
        generate_js_arrays(answers_file, guesses_file, output_file)
        print("\n✓ Successfully generated JavaScript arrays!")
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e}")
    except Exception as e:
        print(f"Error: {e}")

