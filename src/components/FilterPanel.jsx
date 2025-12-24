import { useForm } from "react-hook-form";
import { Search } from "lucide-react";
import { useMemo } from "react";

const FilterPanel = ({ onApplyFilters, poems = [], activeFilters = {} }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      search: "",
      poemType: "",
      section: "",
      minLines: "",
      maxLines: "",
      hasEpigraph: false,
      hasDedication: false,
      ...activeFilters,
    },
  });

  const sections = useMemo(() => {
    const uniqueSections = [
      ...new Set(poems.map((p) => p.section_name).filter(Boolean)),
    ];
    return uniqueSections.sort();
  }, [poems]);

  const onSubmit = (data) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) =>
          value !== "" &&
          value !== false &&
          value !== null &&
          value !== undefined
      )
    );

    // Преобразуем poemType и явно очищаем старые фильтры
    if (filteredData.poemType === "cycles") {
      filteredData.in_cycle = true;
      delete filteredData.cycle_has_title; // Очищаем, чтобы не осталось от старого выбора
    } else if (filteredData.poemType === "individual") {
      filteredData.in_cycle = false;
      delete filteredData.cycle_has_title;
    } else if (filteredData.poemType === "cycles_with_names") {
      filteredData.in_cycle = true;
      filteredData.cycle_has_title = true;
    } else if (filteredData.poemType === "cycles_without_names") {
      filteredData.in_cycle = true;
      filteredData.cycle_has_title = false;
    } else {
      // ❗ КРИТИЧНО: При "Все стихотворения" (пустое значение)
      // явно удаляем все фильтры циклов
      delete filteredData.in_cycle;
      delete filteredData.cycle_has_title;
    }

    delete filteredData.poemType;

    onApplyFilters(filteredData);
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
    });
    onApplyFilters({});
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Поиск */}
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

      {/* Тип стихотворения */}
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

      {/* Разделы */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Раздел книги
        </label>
        <select
          {...register("section")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все разделы</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Количество строк */}
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
            placeholder="100"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Дополнительные опции */}
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

      {/* Кнопки */}
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
