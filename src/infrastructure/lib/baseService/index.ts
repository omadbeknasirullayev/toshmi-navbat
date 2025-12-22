import { HttpException, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { IFindOptions, IResponsePagination } from "./interface";
import { RepositoryPager } from "../pagination";

export class BaseService<CreateDto, UpdateDto, Entity> {
	constructor(
		private readonly repository: Repository<any>,
		private readonly entityName: string,
	) {}

	get getRepository() {
		return this.repository;
	}

	async create(dto: CreateDto): Promise<Entity> {
		let created_data = this.repository.create(dto) as unknown as Entity;
		created_data = await this.repository.save(created_data);
		return created_data;
	}

	async findAll(options?: IFindOptions<Entity>): Promise<Entity[]> {
		const data = (await this.repository.find({
			...options,
		})) as Entity[];
		return data;
	}

	async findAllWithPagination(
		options?: IFindOptions<Entity>,
	): Promise<IResponsePagination<Entity>> {
		return await RepositoryPager.findAll(this.getRepository, options);
	}

	async findOneBy(options: IFindOptions<Entity>): Promise<Entity> {
		const data = (await this.repository.findOne({
			select: options.select || {},
			relations: options.relations || [],
			where: options.where,
		})) as Entity;
		if (!data) {
			const error_data = {
				status: "NOT_FOUND",
				message: {
					uz: `${this.entityName} topilmadi`,
					ru: `${this.entityName} не найден`,
				},
				statusCode: 404,
			};
			console.log("error_data", error_data);
			Logger.error({
				message: error_data.message,
				statusCode: error_data.statusCode,
				user: "none",
				stack: error_data,
				context: `${BaseService.name}  function findOneBy`,
			});
			throw new HttpException(error_data, error_data.statusCode);
		}
		return data;
	}

	async findOneById(id: number, options?: IFindOptions<Entity>): Promise<Entity> {
		const data = (await this.repository.findOne({
			select: options?.select || {},
			relations: options?.relations || [],
			where: { id, ...options?.where },
		})) as unknown as Entity;
		if (!data) {
			const error_data = {
				status: "NOT_FOUND",
				message: {
					uz: `${this.entityName} topilmadi`,
					ru: `${this.entityName} не найден`,
				},
				statusCode: 404,
			};
			Logger.error({
				message: error_data.message,
				statusCode: error_data.statusCode,
				user: "none",
				stack: error_data,
				context: `${BaseService.name}  function findOneById `,
			});
			throw new HttpException(error_data, error_data.statusCode);
		}
		return data;
	}

	async update(id: number, dto: UpdateDto) {
		await this.findOneById(id);
		await this.repository.update(id, {
			...dto,
			updatedAt: new Date(),
		});
		return {};
	}

	async disactive(id: number): Promise<Entity> {
		await this.findOneById(id);
		const data = (await this.repository.update(
			{ id },
			{ isActive: false },
		)) as unknown as Entity;
		return data;
	}

	async delete(id: number): Promise<Entity> {
		await this.findOneById(id);
		const data = (await this.repository.update(
			{ id },
			{
				isDeleted: true,
				isActive: false,
				deletedAt: new Date(),
			},
		)) as unknown as Entity;
		return data;
	}
}
