import { IResponsePagination } from "src/infrastructure/lib/baseService/interface";

export class Pager<T> {
	public static of<T>(
		data: Array<T>,
		totalElements: number,
		pageSize: number,
		currentPage: number,
		statusCode: number,
	): IResponsePagination<T> {
		const from = (currentPage - 1) * pageSize + 1;
		const to = currentPage * pageSize;
		return new Pager(
			data,
			totalElements,
			Math.ceil(totalElements / pageSize),
			pageSize,
			currentPage,
			from,
			to,
			statusCode,
		).toPage();
	}

	private constructor(
		private data: Array<T>,
		private totalElements: number,
		private totalPages: number,
		private pageSize: number,
		private currentPage: number,
		private from: number,
		private to: number,
		private statusCode: number,
	) {}

	public toPage(): IResponsePagination<T> {
		return {
			data: this.data,
			totalElements: this.totalElements,
			totalPages: this.totalPages,
			pageSize: this.pageSize,
			currentPage: this.currentPage,
			from: this.from > this.totalElements ? this.totalElements : this.from,
			to: this.to > this.totalElements ? this.totalElements : this.to,
			statusCode: this.statusCode,
		};
	}
}
