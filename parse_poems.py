import xml.etree.ElementTree as ET
import json


def parse_structured_xml(file_path):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except (ET.ParseError, FileNotFoundError) as e:
        print(f"Ошибка при загрузке файла: {e}")
        return []

    poems_list = []
    current_section_name = None

    def process_element(element, current_cycle_name=None, cycle_dedication=None):
        nonlocal current_section_name

        if element.tag == "SECTION":
            title_elem = element.find("TITLE")
            new_section_name = (
                title_elem.text.strip() if title_elem is not None else None
            )
            current_section_name = new_section_name
            for child in element:
                process_element(
                    child,
                    current_cycle_name=current_cycle_name,
                    cycle_dedication=cycle_dedication,
                )

        elif element.tag == "CYCLE":
            title_elem = element.find("TITLE")
            cycle_name = title_elem.text.strip() if title_elem is not None else None

            # Получаем посвящение цикла
            dedication_elem = element.find("DEDICATION")
            cycle_dedication = (
                dedication_elem.text.strip() if dedication_elem is not None else None
            )

            for child in element:
                process_element(
                    child,
                    current_cycle_name=cycle_name,
                    cycle_dedication=cycle_dedication,
                )

        elif element.tag == "POEM":
            number_elem = element.find("NUMBER")
            number = number_elem.text.strip() if number_elem is not None else None

            title_elem = element.find("TITLE")
            title = title_elem.text.strip() if title_elem is not None else ""

            verses = [v.text for v in element.findall("VERSE") if v.text is not None]

            # Получаем посвящение стиха или наследуем от цикла
            dedication_elem = element.find("DEDICATION")
            dedication = (
                dedication_elem.text.strip()
                if dedication_elem is not None
                else (cycle_dedication or "")
            )

            # Обрабатываем эпиграф (может содержать TEXT и AUTHOR)
            epigraph_elem = element.find("EPIGRAPH")
            epigraph = ""
            if epigraph_elem is not None:
                text_elem = epigraph_elem.find("TEXT")
                author_elem = epigraph_elem.find("AUTHOR")
                epigraph_parts = []
                if text_elem is not None and text_elem.text:
                    epigraph_parts.append(text_elem.text.strip())
                if author_elem is not None and author_elem.text:
                    epigraph_parts.append(f"— {author_elem.text.strip()}")
                epigraph = "\n".join(epigraph_parts)

            display_title = title
            if not display_title:
                for v in verses:
                    clean_v = v.strip()
                    if clean_v and clean_v != "***":
                        display_title = clean_v
                        break
                else:
                    display_title = "Без названия"

            poem_data = {
                "id": len(poems_list) + 1,
                "author": "Б.И. Непомнящий",
                "year": 2020,
                "source": 'Книга стихотворений "Избранное"',
                "title": title,
                "display_title": display_title,
                "text": "\n".join(verses),
                "hasTitle": bool(title),
                "in_cycle": current_cycle_name is not None,
                "cycle_name": current_cycle_name,
                "cycle_dedication": cycle_dedication,  # Добавляем для отладки
                "section_name": current_section_name,
                "lines": verses,
                "epigraph": epigraph,
                "dedication": dedication,
                "number": number,  # Добавляем номер для отображения
            }
            poems_list.append(poem_data)

        else:
            for child in element:
                process_element(
                    child,
                    current_cycle_name=current_cycle_name,
                    cycle_dedication=cycle_dedication,
                )

    process_element(root)
    return poems_list


def save_to_json(data, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    input_file = "text.xml"
    output_file = "public/poems_minimal.json"

    poems_data = parse_structured_xml(input_file)
    save_to_json(poems_data, output_file)
    print(
        f"Обработано {len(poems_data)} стихотворений. Результат сохранён в {output_file}."
    )
