import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { X } from "lucide-react";
import PoemList from "./components/PoemList";
import FilterPanel from "./components/FilterPanel";
import PoemPage from "./components/PoemPage";

function AppContent() {
  const [poems, setPoems] = useState([]);
  const [filteredPoems, setFilteredPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetch("/poems_minimal.json")
      .then((response) => response.json())
      .then((data) => {
        const poemsWithLineCount = data.map((poem) => ({
          ...poem,
          lineCount: poem.lines?.length || 0,
        }));
        setPoems(poemsWithLineCount);
        setFilteredPoems(poemsWithLineCount);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных:", error);
        setLoading(false);
      });
  }, []);

  const applyFilters = useCallback(
    (filters) => {
      let result = [...poems];

      // Поиск
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter((poem) => {
          const title = poem.title ? poem.title.toLowerCase() : "";
          const displayTitle = poem.display_title
            ? poem.display_title.toLowerCase()
            : "";
          const text = poem.text ? poem.text.toLowerCase() : "";
          const epigraph = poem.epigraph ? poem.epigraph.toLowerCase() : "";
          const dedication = poem.dedication
            ? poem.dedication.toLowerCase()
            : "";
          return (
            title.includes(searchLower) ||
            displayTitle.includes(searchLower) ||
            text.includes(searchLower) ||
            epigraph.includes(searchLower) ||
            dedication.includes(searchLower)
          );
        });
      }

      // Фильтрация по циклам
      if (filters.in_cycle !== undefined) {
        result = result.filter((poem) => poem.in_cycle === filters.in_cycle);
      }

      if (filters.cycle_has_title !== undefined) {
        result = result.filter(
          (poem) => poem.cycle_has_title === filters.cycle_has_title
        );
      }

      // Раздел
      if (filters.section) {
        result = result.filter((poem) => poem.section_name === filters.section);
      }

      // Строки
      if (filters.minLines) {
        result = result.filter(
          (poem) => poem.lineCount >= parseInt(filters.minLines)
        );
      }
      if (filters.maxLines) {
        result = result.filter(
          (poem) => poem.lineCount <= parseInt(filters.maxLines)
        );
      }

      // Эпиграфы и посвящения
      if (filters.hasEpigraph) {
        result = result.filter(
          (poem) => poem.epigraph && poem.epigraph.trim() !== ""
        );
      }
      if (filters.hasDedication) {
        result = result.filter(
          (poem) => poem.dedication && poem.dedication.trim() !== ""
        );
      }

      setFilteredPoems(result);
      setActiveFilters(filters);
      setShowFilters(false);
    },
    [poems]
  );

  // Вынесенный компонент активных фильтров и счетчика
  const ResultsHeader = () => {
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return (
        <div className="mb-6">
          <div className="text-center text-sm text-gray-600 mb-4">
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
    }

    const filterLabels = [];

    if (activeFilters.search) {
      filterLabels.push(`Поиск: "${activeFilters.search}"`);
    }
    if (activeFilters.in_cycle !== undefined) {
      filterLabels.push(
        activeFilters.in_cycle ? "В циклах" : "Отдельные стихи"
      );
    }
    if (activeFilters.cycle_has_title !== undefined) {
      filterLabels.push(
        activeFilters.cycle_has_title
          ? "Циклы с названиями"
          : "Циклы без названий"
      );
    }
    if (activeFilters.section) {
      filterLabels.push(`Раздел: ${activeFilters.section}`);
    }
    if (activeFilters.minLines || activeFilters.maxLines) {
      const min = activeFilters.minLines || 0;
      const max = activeFilters.maxLines || "∞";
      filterLabels.push(`Строк: ${min}-${max}`);
    }
    if (activeFilters.hasEpigraph) {
      filterLabels.push("С эпиграфами");
    }
    if (activeFilters.hasDedication) {
      filterLabels.push("С посвящениями");
    }

    return (
      <div className="mb-6">
        {/* Активные фильтры */}
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
          <div className="flex items-center">
            <div className="flex justify-between">
              <span className="text-[14px] font-medium text-blue-800">
                Активные фильтры:
              </span>
            </div>
            <div className="flex flex-wrap ml-4 gap-2">
              {filterLabels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-[14px] bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {label}
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
            <span className="text-[14px]">Сбросить все</span>
          </button>
        </div>

        {/* Счетчик */}
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

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Шапка */}
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
        <div></div>
      </div>

      {/* ВЫНЕСЕННЫЙ БЛОК: Активные фильтры и счетчик */}
      <div className="grid grid-cols-[128px_1fr_128px] gap-4">
        <div></div>
        <ResultsHeader />
        <div></div>
      </div>

      {/* Панель фильтров */}
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
          />
        </div>
      )}

      {/* Список стихотворений с фиксированным отступом */}
      <div className="grid grid-cols-[128px_1fr_128px] gap-4">
        <div></div>
        <div className="mb-16">
          {" "}
          {/* Фиксированный отступ снизу */}
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
        <div></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/poem/:id" element={<PoemPage />} />
      </Routes>
    </Router>
  );
}

export default App;
