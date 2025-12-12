from num2words import num2words
import sys

def number_to_uzbek_text(number):
    scales = ["", "ming", "million", "milliard", "trillion"]

    if number == 0:
        return "nol"

    if number < 0:
        return "minus " + number_to_uzbek_text(abs(number))

    parts = []
    scale_index = 0

    while number > 0:
        part = number % 1000
        if part > 0:
            parts.append(_convert_three_digits(part) + " " + scales[scale_index])
        number //= 1000
        scale_index += 1

    return " ".join(reversed([part.strip() for part in parts if part.strip()]))

def _convert_three_digits(number):
    ones = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"]
    tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"]
    hundreds = ["", "bir yuz", "ikki yuz", "uch yuz", "to'rt yuz", "besh yuz", "olti yuz", "yetti yuz", "sakkiz yuz", "to'qqiz yuz"]

    result = []
    if number >= 100:
        result.append(hundreds[number // 100])
        number %= 100
    if number >= 10:
        result.append(tens[number // 10])
        number %= 10
    if number > 0:
        result.append(ones[number])

    return " ".join(result)


def num_to_words(num, lang):
    if lang == "ru":
        return num2words(num, lang='ru')
    else:
        return number_to_uzbek_text(num)



if __name__ == '__main__':
    try:
        number = int(sys.argv[1])  # Terminal argumentini o‘qing
        lang = sys.argv[2]
        # Chiqishni UTF-8 da majburlang
        sys.stdout.reconfigure(encoding='utf-8')
        print(num_to_words(number, lang))  # Chiqishni UTF-8 formatda qaytaring
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
