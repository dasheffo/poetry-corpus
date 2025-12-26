// src/components/FilterPanel.jsx
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Search } from "lucide-react";

const FilterPanel = ({
  onApplyFilters,
  poems = [],
  activeFilters = {},
  lemmas = {},
}) => {
  const lemmaList = useMemo(() => {
    const set = new Set();
    Object.values(lemmas).forEach((arr) =>
      arr.forEach((a) => set.add(a.normal_form))
    );
    return [...set].sort((a, b) => a.localeCompare(b, "ru"));
  }, [lemmas]);

  const [lemmaInput, setLemmaInput] = useState(activeFilters.lemma || "");

  const datalistOptions = useMemo(() => {
    if (!lemmaInput) return [];
    const low = lemmaInput.toLowerCase();
    return lemmaList
      .filter((l) => l.toLowerCase().startsWith(low))
      .slice(0, 50);
  }, [lemmaInput, lemmaList]);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      search: "",
      poemType: "",
      section: "",
      minLines: "",
      maxLines: "",
      hasEpigraph: false,
      hasDedication: false,
      lemma: "",
      ...activeFilters,
    },
  });

  const sections = useMemo(() => {
    const s = [...new Set(poems.map((p) => p.section_name).filter(Boolean))];
    return s.sort((a, b) => a.localeCompare(b, "ru"));
  }, [poems]);

  const onSubmit = (data) => {
    const filtered = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== "" && v !== false && v != null
      )
    );
    if (lemmaInput.trim()) filtered.lemma = lemmaInput.trim();
    onApplyFilters(filtered);
  };

  const handleReset = () => {
    reset({
      search: "",
      poemType: "",
      section: "",
      minLines: "",
      maxLines: "",
      hasEpigraph: false,
      hasDedication: false,
      lemma: "",
    });
    setLemmaInput("");
    onApplyFilters({});
  };

  useMemo(() => setValue("lemma", lemmaInput), [lemmaInput, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск по лемме
        </label>
        <input
          type="text"
          value={lemmaInput}
          onChange={(e) => setLemmaInput(e.target.value)}
          list="lemma-list"
          placeholder="Начните вводить лемму…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <datalist id="lemma-list">
          {datalistOptions.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск по тексту, эпиграфам и посвящениям
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Введите текст для поиска..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип стихотворения
        </label>
        <select
          {...register("poemType")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все стихотворения</option>
          <option value="cycles">Все циклы</option>
          <option value="cycles_with_names">Циклы с названиями</option>
          <option value="cycles_without_names">Циклы без названий</option>
          <option value="individual">Только отдельные стихи</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Раздел книги
        </label>
        <select
          {...register("section")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все разделы</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Строк от
          </label>
          <input
            type="number"
            {...register("minLines")}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Строк до
          </label>
          <input
            type="number"
            {...register("maxLines")}
            placeholder="∞"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("hasEpigraph")}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Только с эпиграфами</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("hasDedication")}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Только с посвящениями</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Применить
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Сбросить
        </button>
      </div>
    </form>
  );
};

export default FilterPanel;
