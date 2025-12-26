// src/App.jsx
import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { X } from "lucide-react";
import PoemList from "./components/PoemList";
import FilterPanel from "./components/FilterPanel";
import PoemPage from "./components/PoemPage";

/* ----------  нормализация лемм  ---------- */
const normalizeLemmas = (raw) => {
  const norm = {};
  Object.entries(raw).forEach(([w, arr]) => {
    const clean = w.toLowerCase().replace(/[.,;:!?()"\-–—]/g, "");
    norm[clean] = arr;
  });
  return norm;
};

/* ----------  обратный словарь: лемма → Set(словоформ)  ---------- */
const buildReverse = (norm) => {
  const rev = {}; // lemma -> Set(wordforms)
  Object.entries(norm).forEach(([word, arr]) => {
    arr.forEach((e) => {
      const nf = e.normal_form.toLowerCase();
      if (!rev[nf]) rev[nf] = new Set();
      rev[nf].add(word);
    });
  });
  return rev;
};

function AppContent() {
  const [poems, setPoems] = useState([]);
  const [filteredPoems, setFilteredPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const [lemmas, setLemmas] = useState({});
  const [reverseLemmas, setReverseLemmas] = useState({}); // lemma -> Set(wordforms)

  /* ----------  загрузка  ---------- */
  useEffect(() => {
    Promise.all([
      fetch("/poems_minimal.json").then((r) => r.json()),
      fetch("/lemmas.json").then((r) => r.json()),
    ])
      .then(([data, lemmasData]) => {
        const enriched = data.map((p) => ({
          ...p,
          lineCount: p.lines?.length || 0,
        }));
        const normalized = normalizeLemmas(lemmasData);
        setPoems(enriched);
        setFilteredPoems(enriched);
        setLemmas(normalized);
        setReverseLemmas(buildReverse(normalized));
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  /* ----------  фильтрация  ---------- */
  const applyFilters = useCallback(
    (filters) => {
      let res = [...poems];

      /* 1. обычный текстовый поиск */
      if (filters.search) {
        const s = filters.search.toLowerCase();
        res = res.filter((p) =>
          [p.title, p.display_title, p.text, p.epigraph, p.dedication]
            .filter(Boolean)
            .some((txt) => txt.toLowerCase().includes(s))
        );
      }

      /* 2. поиск по лемме без индекса */
      if (filters.lemma) {
        const lemma = filters.lemma.toLowerCase();
        const wordforms = reverseLemmas[lemma];
        console.log("🔍 Lemma:", lemma);
        console.log(
          "📦 Wordforms:",
          wordforms ? [...wordforms] : "нет словоформ"
        );
        if (!wordforms || !wordforms.size) {
          res = [];
        } else {
          res = res.filter((p) => {
            const text = [
              p.title,
              p.display_title,
              p.text,
              p.epigraph,
              p.dedication,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            const tokens = text
              .split(/[\s\n]+/) // по пробелам и переводам строк
              .map((t) => t.replace(/[.,;:!?()"\-–—]/g, ""))
              .filter((w) => w);
            if (p.id === 1) console.log("📜 Poem 1 tokens:", tokens);
            const hit = tokens.some((w) => wordforms.has(w));
            if (hit) console.log("✅ Hit poem ID:", p.id);
            return hit;
          });
        }
        console.log("📄 Отфильтровано стихов:", res.length);
        // временно: показать, в каких стихах есть хоть одна форма "дождь"
        if (lemma === "дождь") {
          const allHits = poems.filter((p) => {
            const text = [
              p.title,
              p.display_title,
              p.text,
              p.epigraph,
              p.dedication,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            const tokens = text
              .split(/[\s\n]+/) // по пробелам и переводам строк
              .map((t) => t.replace(/[.,;:!?()"\-–—]/g, ""))
              .filter((w) => w);
            return tokens.some((w) => wordforms.has(w));
          });
          console.log(
            "📂 Все стихи с формами 'дождь':",
            allHits.map((p) => p.id)
          );
        }
      }

      /* 3. остальные фильтры без изменений */
      if (filters.in_cycle !== undefined)
        res = res.filter((p) => p.in_cycle === filters.in_cycle);
      if (filters.cycle_has_title !== undefined)
        res = res.filter((p) => p.cycle_has_title === filters.cycle_has_title);
      if (filters.section)
        res = res.filter((p) => p.section_name === filters.section);
      if (filters.minLines)
        res = res.filter((p) => p.lineCount >= parseInt(filters.minLines));
      if (filters.maxLines)
        res = res.filter((p) => p.lineCount <= parseInt(filters.maxLines));
      if (filters.hasEpigraph) res = res.filter((p) => p.epigraph?.trim());
      if (filters.hasDedication) res = res.filter((p) => p.dedication?.trim());

      setFilteredPoems(res);
      setActiveFilters(filters);
      setShowFilters(false);
    },
    [poems, reverseLemmas]
  );

  /* ----------  шапка  ---------- */
  const ResultsHeader = () => {
    if (!activeFilters || !Object.keys(activeFilters).length)
      return (
        <div className="mb-6 text-center text-sm text-gray-600">
          Найдено: {filteredPoems.length}{" "}
          {filteredPoems.length === 1
            ? "стихотворение"
            : filteredPoems.length % 10 >= 2 &&
              filteredPoems.length % 10 <= 4 &&
              (filteredPoems.length % 100 < 10 ||
                filteredPoems.length % 100 >= 20)
            ? "стихотворения"
            : "стихотворений"}
        </div>
      );

    const labels = [];
    if (activeFilters.search) labels.push(`Поиск: «${activeFilters.search}»`);
    if (activeFilters.lemma) labels.push(`Лемма: «${activeFilters.lemma}»`);
    if (activeFilters.in_cycle !== undefined)
      labels.push(activeFilters.in_cycle ? "В циклах" : "Отдельные стихи");
    if (activeFilters.cycle_has_title !== undefined)
      labels.push(
        activeFilters.cycle_has_title
          ? "Циклы с названиями"
          : "Циклы без названий"
      );
    if (activeFilters.section) labels.push(`Раздел: ${activeFilters.section}`);
    if (activeFilters.minLines || activeFilters.maxLines) {
      const min = activeFilters.minLines || 0;
      const max = activeFilters.maxLines || "∞";
      labels.push(`Строк: ${min}–${max}`);
    }
    if (activeFilters.hasEpigraph) labels.push("С эпиграфами");
    if (activeFilters.hasDedication) labels.push("С посвящениями");

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">
              Активные фильтры:
            </span>
            <div className="flex flex-wrap gap-2">
              {labels.map((l, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setActiveFilters({});
              setFilteredPoems(poems);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-5 h-5" />
            Сбросить все
          </button>
        </div>
        <div className="text-center text-sm text-gray-600">
          Найдено: {filteredPoems.length}{" "}
          {filteredPoems.length === 1
            ? "стихотворение"
            : filteredPoems.length % 10 >= 2 &&
              filteredPoems.length % 10 <= 4 &&
              (filteredPoems.length % 100 < 10 ||
                filteredPoems.length % 100 >= 20)
            ? "стихотворения"
            : "стихотворений"}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Загрузка…
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="grid grid-cols-[128px_1fr_128px] gap-4 items-start mb-8">
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFilters ? "Скрыть" : "Фильтры"}
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Стихотворения Б.И. Непомнящего
          </h1>
          <p className="text-gray-600">Избранное, 2020</p>
        </div>
        <div />
      </div>

      <div className="grid grid-cols-[128px_1fr_128px] gap-4">
        <div />
        <ResultsHeader />
        <div />
      </div>

      {showFilters && (
        <div className="absolute top-24 left-4 w-96 z-50 bg-white p-4 rounded-lg shadow-lg border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Фильтры</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <FilterPanel
            onApplyFilters={applyFilters}
            poems={poems}
            activeFilters={activeFilters}
            lemmas={lemmas}
          />
        </div>
      )}

      <div className="grid grid-cols-[128px_1fr_128px] gap-4">
        <div />
        <div className="mb-16">
          <PoemList
            poems={filteredPoems}
            resetPageOnFilter={Object.keys(activeFilters).length > 0}
            key={JSON.stringify(activeFilters)}
          />
          {filteredPoems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Стихотворения по заданным фильтрам не найдены.
            </div>
          )}
        </div>
        <div />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/poem/:id" element={<PoemPage />} />
      </Routes>
    </Router>
  );
}
