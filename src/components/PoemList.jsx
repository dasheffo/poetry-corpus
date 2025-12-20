// src/components/PoemList.jsx
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import PoemCard from "./PoemCard";
import ReactPaginate from "react-paginate";

const PoemList = ({ poems, resetPageOnFilter = false }) => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPageOptions = [5, 10, 20, 30, 50, 100, "все"];

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(0);
  }, [poems, resetPageOnFilter]);

  // УПРОЩЕННАЯ ФУНКЦИЯ - убрано отображение циклов
  const getDisplayTitle = (poem) => {
    // Если есть заголовок, возвращаем его
    if (poem.title && poem.title !== "***" && poem.title.trim() !== "") {
      return poem.title;
    }

    // Берем первую строку текста (как было изначально)
    const lines = poem.text ? poem.text.split("\n") : [];
    const firstLine = lines.find((line) => line.trim() !== "");
    if (firstLine) {
      const punctuationAndDotsAtEndRegex = /[.,\u2026\-–—:;!?\s]+$/;
      const processedFirstLine = firstLine.replace(
        punctuationAndDotsAtEndRegex,
        ""
      );
      return processedFirstLine + "...";
    }

    return "Без названия...";
  };

  const currentPoems = useMemo(() => {
    if (itemsPerPage === "все") {
      return poems;
    }
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return poems.slice(start, end);
  }, [poems, currentPage, itemsPerPage]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleItemsPerPageChange = (e) => {
    const value = e.target.value;
    setItemsPerPage(value === "все" ? "все" : parseInt(value, 10));
    setCurrentPage(0);
  };

  const pageCount =
    itemsPerPage === "все" ? 1 : Math.ceil(poems.length / itemsPerPage);

  return (
    <div className="w-full relative">
      <div className="mb-4 flex justify-end items-center">
        <div className="flex items-center">
          <label
            htmlFor="itemsPerPage"
            className="mr-2 text-sm text-gray-700 font-medium"
          >
            Стихов на странице:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition duration-200"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="space-y-2">
        {currentPoems.map((poem) => (
          <li
            key={poem.id}
            className="border-b border-gray-200 pb-2 last:border-b-0"
          >
            <div className="w-full text-left font-medium text-lg text-gray-800 hover:text-gray-600 focus:outline-none flex justify-between items-center group">
              <Link
                to={`/poem/${poem.id}`}
                className="group-hover:underline"
                target="_blank"
              >
                {getDisplayTitle(poem)}
              </Link>
              <PoemCard poem={poem} />
            </div>
          </li>
        ))}
      </ul>
      {itemsPerPage !== "все" && pageCount > 1 && (
        <div className="mt-6 absolute left-1/2 transform -translate-x-1/2 w-full flex justify-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            containerClassName="flex items-center space-x-0.5 text-sm"
            pageLinkClassName="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
            activeLinkClassName="bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
            previousClassName="px-3 py-1.5 border border-gray-300 rounded-l-md hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
            nextClassName="px-3 py-1.5 border border-gray-300 rounded-r-md hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
};

export default PoemList;
