import { HttpException, HttpStatus } from "@nestjs/common";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { diskStorage } from "multer";
import { extname, join, resolve } from "path";
import { v4 } from "uuid";
import { appConfig } from "src/config/app.config";
import { ErrorCreatingFile, ErrorDeletingFile } from "./exception/file.exception";

const storage = diskStorage({
	destination: (req: any, file: any, cb: any) => {
		const upload_path = resolve(__dirname, "..", "..", "..", "..", "..", appConfig.PATH_FOR_FILE_UPLOAD);
		if (!existsSync(upload_path)) {
			mkdirSync(upload_path, { recursive: true });
		}
		cb(null, upload_path);
	},
	filename: (req: any, file: any, cb: any): void => {
		cb(null, `${file.mimetype.split("/")[0]}__${v4()}.${file.mimetype.split("/")[1]}`);
	},
});

export const fileFilters = {
	image: (req: any, file: any, cb: any) => {
		if (file.mimetype.split("/")[0] === "image") {
			cb(null, true);
		} else {
			cb(
				new HttpException(
					`Unsupported file type ${extname(
						file.originalname,
					)}, there should only be a image`,
					HttpStatus.BAD_REQUEST,
				),
				false,
			);
		}
	},
	excel: (req: any, file: any, cb: any) => {
		if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
			cb(null, true);
		} else {
			cb(
				new HttpException(
					`Unsupported file type ${extname(
						file.originalname,
					)}, there should only be a excel`,
					HttpStatus.BAD_REQUEST,
				),
				false,
			);
		}
	},
	image_video: (req: any, file: any, cb: any) => {

		if (file.mimetype.split("/")[0] === "image") {
			cb(null, true);
		} else if (file.mimetype.split("/")[0] === "video") {
			cb(null, true);
		} else {
			cb(
				new HttpException(
					`Unsupported file type ${extname(
						file.originalname,
					)}, there should only be a image or video`,
					HttpStatus.BAD_REQUEST,
				),
				false,
			);
		}
	},
	all: (req: any, file: any, cb: any) => {
		cb(null, true);
	},
};

export const multerImageUpload = {
	fileFilter: fileFilters.image,
	storage: storage,
	limits: { fileSize: Number(appConfig.FILE_SIZE) * 1024 * 1024 },
};

export const multerOptionAll = {
	fileFilter: fileFilters.all,
	storage: storage,
	limits: { fileSize: Number(appConfig.FILE_SIZE) * 1024 * 1024 },
};

export const multerImageVideoUpload = {
	fileFilter: fileFilters.image_video,
	storage: storage,
	limits: { fileSize: Number(appConfig.FILE_SIZE) * 1024 * 1024 },
};

export async function deleteFile(file_name: string) {
	try {		
		const file_path = join(process.cwd(), '..',file_name)
		if (existsSync(file_path)) {
			unlinkSync(file_path);
		}
	} catch (err) {
		throw new ErrorDeletingFile();
	}
}

export async function createFile(file: any): Promise<string> {
	try {
		const file_name = `${file.mimetype.split("/")[0]}__${v4()}.${file.mimetype.split("/")[1]}`;
		const file_path = resolve(__dirname, "..", "..", "..", "..", appConfig.PATH_FOR_FILE_UPLOAD);
		if (!existsSync(file_path)) {
			mkdirSync(file_path, { recursive: true });
		}
		writeFileSync(join(file_path, file_name), file.buffer);
		return file_name;
	} catch (error) {
		throw new ErrorCreatingFile();
	}

}
