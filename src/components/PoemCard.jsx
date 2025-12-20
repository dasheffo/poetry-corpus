// src/components/PoemCard.jsx
import { useState } from "react";
import { Info } from "lucide-react";

const PoemCard = ({ poem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getOriginalTitle = () => {
    if (!poem.title || poem.title === "***" || poem.title.trim() === "") {
      return "Отсутствует";
    }
    return poem.title;
  };

  const formatMultilineText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        aria-label="Показать метаданные"
      >
        <Info className="h-5 w-5 text-gray-500" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">Метаданные</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
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
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">Автор:</dt>
                  <dd className="text-gray-900 text-right">{poem.author}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">Год:</dt>
                  <dd className="text-gray-900 text-right">{poem.year}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">Источник:</dt>
                  <dd className="text-gray-900 text-right">{poem.source}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">Размер:</dt>
                  <dd className="text-gray-900 text-right">{poem.metre}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">Строк:</dt>
                  <dd className="text-gray-900 text-right">
                    {poem.lineCount ||
                      (poem.text ? poem.text.split("\n").length : 0)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">Раздел:</dt>
                  <dd className="text-gray-900 text-right">
                    {poem.section_name}
                  </dd>
                </div>

                {poem.epigraph && poem.epigraph.trim() !== "" && (
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="font-medium text-gray-500 mb-1">Эпиграф:</dt>
                    <dd className="text-gray-900 text-sm italic">
                      {formatMultilineText(poem.epigraph)}
                    </dd>
                  </div>
                )}

                {poem.dedication && poem.dedication.trim() !== "" && (
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="font-medium text-gray-500 mb-1">
                      Посвящение:
                    </dt>
                    <dd className="text-gray-900 text-sm">{poem.dedication}</dd>
                  </div>
                )}

                {poem.in_cycle && poem.cycle_display_name && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <dt className="font-medium text-gray-500">Цикл:</dt>
                    <dd className="text-gray-900 text-right">
                      {poem.cycle_display_name}
                    </dd>
                  </div>
                )}
                {poem.number && (
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">№ в цикле:</dt>
                    <dd className="text-gray-900 text-right">{poem.number}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoemCard;
