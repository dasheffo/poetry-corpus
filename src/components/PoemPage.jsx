// src/components/PoemPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PoemCard from "./PoemCard";

const PoemPage = () => {
  const { id } = useParams();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [morphModalOpen, setMorphModalOpen] = useState(false);
  const [morphData, setMorphData] = useState(null);
  const [clickedWord, setClickedWord] = useState("");

  // новые стейты
  const [lemmas, setLemmas] = useState(null); // lemmas.json
  const [compactMorph, setCompactMorph] = useState(null); // poems_morphology_compact.json

  /* ---------- загрузка данных ---------- */
  useEffect(() => {
    Promise.all([
      fetch("/poems_minimal.json").then((r) => r.json()),
      fetch("/lemmas.json").then((r) => r.json()),
      fetch("/poems_morphology_compact.json").then((r) => r.json()),
    ])
      .then(([poemsData, lemmasData, compactData]) => {
        const found = poemsData.find((p) => p.id === parseInt(id, 10));
        if (found) setPoem(found);
        else setError("Стихотворение не найдено");

        setLemmas(lemmasData);
        setCompactMorph(compactData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ошибка загрузки данных");
        setLoading(false);
      });
  }, [id]);

  /* ---------- обработка клика ---------- */
  const handleWordClick = (word, lineIdx, wordIdx) => {
    setClickedWord(word);

    // разборы лежат в lemmas
    const analyses = lemmas?.[word] || [];
    if (analyses.length) setMorphData(analyses);
    else
      setMorphData([
        { word, normal_form: "Анализ недоступен", pos: "N/A", grammeme: "N/A" },
      ]);

    setMorphModalOpen(true);
  };

  /* ---------- вспомогательные функции ---------- */
  const getDisplayTitle = (p) => {
    /* ваша реализация */
  };
  const renderPoemText = () => {
    const lines = poem.lines || (poem.text ? poem.text.split("\n") : []);
    return lines.map((line, lineIndex) => (
      <div key={lineIndex} className="mb-1">
        {line.split(" ").map((w, wordIndex) => {
          const clean = w.replace(/[.,;:!?()"\-–—]/g, "");
          return clean ? (
            <span
              key={wordIndex}
              onClick={() => handleWordClick(clean, lineIndex, wordIndex)}
              className="cursor-pointer hover:bg-yellow-100 border-b border-dotted border-gray-400"
            >
              {w}{" "}
            </span>
          ) : (
            <span key={wordIndex}>{w} </span>
          );
        })}
      </div>
    ));
  };

  /* ---------- рендер ---------- */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Загрузка...
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
    );
  if (!poem)
    return (
      <div className="container mx-auto px-4 py-8">
        Стихотворение не найдено
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Вернуться к списку
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {getDisplayTitle(poem)}
          </h1>
          <PoemCard poem={poem} />
        </div>

        {/* epigraph, dedication, cycle … */}

        <div className="whitespace-pre-wrap text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
          {renderPoemText()}
        </div>
      </div>

      {/* модальное окно с morphData */}
      {morphModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">
                  Морфологический разбор: "{clickedWord}"
                </h3>
                <button
                  onClick={() => setMorphModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
                  aria-label="Закрыть"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {morphData && morphData.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {morphData.map((a, i) => (
                    <div
                      key={i}
                      className="p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <p className="text-sm">
                        <strong>Лемма:</strong> {a.normal_form}
                      </p>
                      <p className="text-sm">
                        <strong>Часть речи:</strong> {a.pos || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Граммемы:</strong> {a.grammeme}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Анализ недоступен</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoemPage;
