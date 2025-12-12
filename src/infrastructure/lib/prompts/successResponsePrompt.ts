import { IResponseMap } from "./types";

export const SUCCESS_RESPONSE_PROMPT_MAP: IResponseMap = {
	create: {
		id: 1,
		messages: {
			en: `Created succesfully!`,
			ru: `Успешно создан!`,
			uz: `Muvaffaqiyatli yaratildi!`,
		},
	},
	update: {
		id: 2,
		messages: {
			en: `Updated succesfully!`,
			ru: `Успешно обновлено!`,
			uz: `Muvaffaqiyatli tahrirlandi!`,
		},
	},
	delete: {
		id: 3,
		messages: {
			en: `Deleted succesfully!`,
			ru: `Успешно Удалено!`,
			uz: `Muvaffaqiyatli o'chirildi!`,
		},
	},
	get_all: {
		id: 4,
		messages: {
			en: `Success!`,
			ru: `Успешно!`,
			uz: `Muvaffaqiyatli!`,
		},
	},
	get_one: {
		id: 5,
		messages: {
			en: `Success!`,
			ru: `Успешно!`,
			uz: `Muvaffaqiyatli!`,
		},
	},
	cash_regisrter_opened: {
		id: 6,
		messages: {
			en: "Cashier shift opened!",
			ru: "Открыта кассовая смена!",
			uz: "Kassa ochildi!",
		},
	},
	cash_regisrter_closed: {
		id: 7,
		messages: {
			en: "Cashier shift closed!",
			ru: "Кассовая смена закрыта!",
			uz: "Kassa yopildi!",
		},
	},
	excel_file_uploaded: {
		id: 7,
		messages: {
			en: "Excel File Uploaded Successfully!",
			ru: "Файл Excel успешно загружен!",
			uz: "Excel fayli muvaffaqiyatli yuklandi!",
		},
	},
};

export function responseByLang(
	method: keyof IResponseMap,
	lang: keyof (typeof SUCCESS_RESPONSE_PROMPT_MAP)[keyof IResponseMap]["messages"],
): string {
	if (SUCCESS_RESPONSE_PROMPT_MAP[method] && SUCCESS_RESPONSE_PROMPT_MAP[method].messages[lang]) {
		return SUCCESS_RESPONSE_PROMPT_MAP[method].messages[lang];
	} else {
		return "Message not found for the given language.";
	}
}

export function returnResponseMessage(labels: string[], lang: string) {
	let message = "";

	switch (lang) {
		case "en":
			message = labels[0];
			break;
		case "ru":
			message = labels[1];
			break;
		case "uz":
			message = labels[2];
			break;
		default:
			message = "Success Response";
	}
	return message;
}
