import json
import re
from pymorphy3 import MorphAnalyzer
from collections import defaultdict

morph = MorphAnalyzer(lang="ru")


# === 1. Анализ одного слова ===
def analyze_word(word):
    parses = morph.parse(word)
    return [
        {
            "word": word,
            "normal_form": p.normal_form,
            "pos": p.tag.POS,
            "grammeme": str(p.tag),
        }
        for p in parses
    ]


# === 2. Первый проход: собираем леммы ===
def collect_lemmas(input_path):
    with open(input_path, encoding="utf-8") as f:
        poems = json.load(f)

    lemmas = defaultdict(set)

    for poem in poems:
        if "lines" not in poem:
            continue
        for line in poem["lines"]:
            for token in re.finditer(r"\b\w+\b", line):
                word = token.group()
                analyses = analyze_word(word)
                for analysis in analyses:
                    lemmas[word].add(
                        json.dumps(analysis, ensure_ascii=False, sort_keys=True)
                    )

    cleaned_lemmas = {}
    for word, analyses in lemmas.items():
        cleaned_lemmas[word] = [json.loads(a) for a in analyses]

    return cleaned_lemmas


# === 3. Второй проход: заменяем разборы на ссылки ===
def build_compact_poems(input_path, lemmas):
    with open(input_path, encoding="utf-8") as f:
        poems = json.load(f)

    compact_poems = {}
    for poem in poems:
        if "lines" not in poem:
            continue
        compact_lines = []
        for line in poem["lines"]:
            compact_line = []
            for token in re.finditer(r"\b\w+\b", line):
                word = token.group()
                compact_line.append({"ref": word})
            compact_lines.append(compact_line)
        compact_poems[poem["id"]] = compact_lines

    return compact_poems


# === 4. Основная функция ===
def build_morphology_compact(input_path, output_lemmas, output_poems):
    print("📚 Собираем леммы...")
    lemmas = collect_lemmas(input_path)

    print("✂️  Сжимаем стихи...")
    compact_poems = build_compact_poems(input_path, lemmas)

    print("💾 Сохраняем...")
    with open(output_lemmas, "w", encoding="utf-8") as f:
        json.dump(lemmas, f, ensure_ascii=False, indent=2)

    with open(output_poems, "w", encoding="utf-8") as f:
        json.dump(compact_poems, f, ensure_ascii=False, indent=2)

    print("✅ Готово!")


# === 5. Запуск ===
if __name__ == "__main__":
    build_morphology_compact(
        "public/poems_minimal.json",
        "public/lemmas.json",
        "public/poems_morphology_compact.json",
    )
