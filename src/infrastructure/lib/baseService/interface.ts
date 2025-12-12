import { FindManyOptions } from "typeorm";

export interface IResponsePagination<T> {
	data: T[];
	totalElements: number;
	totalPages: number;
	pageSize: number;
	currentPage: number;
	from: number;
	to: number;
	statusCode: number;
}

export interface IFindOptions<T> extends FindManyOptions<T> {}
