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

  useEffect(() => {
    fetch("/poems_minimal.json")
      .then((response) => response.json())
      .then((data) => {
        const foundPoem = data.find((p) => p.id === parseInt(id));
        if (foundPoem) {
          setPoem(foundPoem);
        } else {
          setError("Стихотворение не найдено");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки стихотворения:", err);
        setError("Ошибка загрузки данных");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Загрузка...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <Link to="/" className="text-blue-600 hover:underline inline-block">
          ← Вернуться к списку
        </Link>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Стихотворение не найдено
        </h1>
        <Link
          to="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Вернуться к списку
        </Link>
      </div>
    );
  }

  const getDisplayTitle = (p) => {
    if (p.title && p.title !== "***" && p.title.trim() !== "") {
      return p.title;
    } else {
      const lines = p.text ? p.text.split("\n") : [];
      const firstLine = lines.find((line) => line.trim() !== "");
      if (firstLine) {
        const punctuationAndDotsAtEndRegex = /[.,\u2026\-–—:;!?\s]+$/;
        const processedFirstLine = firstLine.replace(
          punctuationAndDotsAtEndRegex,
          ""
        );
        return processedFirstLine + "...";
      } else {
        return "Без названия...";
      }
    }
  };

  const handleWordClick = (word, lineIndex, wordInLineIndex) => {
    setClickedWord(word);
    if (
      poem.lines_morph &&
      poem.lines_morph[lineIndex] &&
      poem.lines_morph[lineIndex][wordInLineIndex]
    ) {
      const analyses = poem.lines_morph[lineIndex][wordInLineIndex];
      setMorphData(analyses);
      setMorphModalOpen(true);
    } else {
      setMorphData([
        { word, normal_form: "Анализ недоступен", pos: "N/A", grammeme: "N/A" },
      ]);
      setMorphModalOpen(true);
    }
  };

  const renderPoemText = () => {
    if (!poem.lines) {
      const lines = poem.text.split("\n");
      return lines.map((line, lineIndex) => (
        <div key={lineIndex} className="mb-1">
          {line.split(" ").map((word, wordIndex) => {
            const cleanWord = word.replace(/[.,;:!?()"\-]/g, "");
            if (cleanWord) {
              return (
                <span
                  key={wordIndex}
                  onClick={() =>
                    handleWordClick(cleanWord, lineIndex, wordIndex)
                  }
                  className="cursor-pointer hover:bg-yellow-100 border-b border-dotted border-gray-400"
                >
                  {word}{" "}
                </span>
              );
            } else {
              return <span key={wordIndex}>{word} </span>;
            }
          })}
        </div>
      ));
    } else {
      return poem.lines.map((line, lineIndex) => {
        const wordsInLine = line.split(" ");
        return (
          <div key={lineIndex} className="mb-1">
            {wordsInLine.map((word, wordIndex) => {
              const cleanWord = word.replace(/[.,;:!?()"\-]/g, "");
              if (cleanWord) {
                return (
                  <span
                    key={wordIndex}
                    onClick={() =>
                      handleWordClick(cleanWord, lineIndex, wordIndex)
                    }
                    className="cursor-pointer hover:bg-yellow-100 border-b border-dotted border-gray-400"
                  >
                    {word}{" "}
                  </span>
                );
              } else {
                return <span key={wordIndex}>{word} </span>;
              }
            })}
          </div>
        );
      });
    }
  };

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

        {poem.epigraph && poem.epigraph.trim() !== "" && (
          <div className="border-l-4 border-gray-300 pl-4 mb-6 italic text-gray-600">
            {poem.epigraph.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                {index < poem.epigraph.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        )}

        {poem.dedication && poem.dedication.trim() !== "" && (
          <div className="text-right mb-6 text-gray-600">
            <span className="italic">{poem.dedication}</span>
          </div>
        )}

        {poem.in_cycle && poem.cycle_display_name && (
          <div className="mb-6 text-gray-600">
            <span className="font-medium">Цикл: </span>
            <span>{poem.cycle_display_name}</span>
            {poem.number && <span>, №{poem.number}</span>}
          </div>
        )}

        <div className="whitespace-pre-wrap text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
          {renderPoemText()}
        </div>
      </div>

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
                  aria-label="Закрыть модальное окно"
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
                  {morphData.map((analysis, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <p className="text-sm">
                        <strong>Лемма:</strong> {analysis.normal_form}
                      </p>
                      <p className="text-sm">
                        <strong>Часть речи:</strong> {analysis.pos || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Граммемы:</strong> {analysis.grammeme}
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
