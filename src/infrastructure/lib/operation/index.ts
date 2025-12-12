export enum OperationOriginEnum {
	RABBITMQ = "RABBITMQ",
	CONTROLLER = "CONTROLLER",
	SERVICE = "SERVICE",
	REPO = "REPO",
	UNKNOWN = "UNKNOWN",
	UTIL = "UTIL",
	EXTERNAL = "EXTERNAL",
}

export enum OperationConditionEnum {
	RECEIVED_TO_PROCESS = "RECEIVED_TO_PROCESS",
	PROCESSING_COMPLETED_WITH_ERROR = "PROCESSING_COMPLETED_WITH_ERROR",
	PROCESSING_COMPLETED_WITH_SUCCESS = "PROCESSING_COMPLETED_WITH_SUCCESS",
	PROCESSING_COMPLETED_WITH_SUGGESTION = "PROCESSING_COMPLETED_WITH_SUGGESTION",
	PROCESSING_COMPLETED_WITH_WARNING = "PROCESSING_COMPLETED_WITH_WARNING",
	PROCESSING_COMPLETED_WITH_QUESTION = "PROCESSING_COMPLETED_WITH_QUESTION",
	PROCESSING_COMPLETED_WITH_UNKNOWN_RESULT = "PROCESSING_COMPLETED_WITH_UNKNOWN_RESULT",
	INFO = "INFO",
	DEBUG = "DEBUG",
}

export interface Operation {
	name: string;
	origin: OperationOriginEnum;
	condition: OperationConditionEnum;
	meta: unknown;
	[k: string]: any;
}

type ControllerMeta = {
	incomingData: Record<string | number, any>;
	outgoingData: Record<string | number, any>;
};

type MetaContainingResult = {
	result: Record<string | number, any>;
};

type OperationMeta<
	O extends OperationOriginEnum,
	C extends OperationConditionEnum,
> = O extends OperationOriginEnum.CONTROLLER
	? C extends OperationConditionEnum.RECEIVED_TO_PROCESS
		? Omit<ControllerMeta, "outgoingData"> & { [key: string]: any }
		: C extends
					| OperationConditionEnum.PROCESSING_COMPLETED_WITH_SUCCESS
					| OperationConditionEnum.PROCESSING_COMPLETED_WITH_ERROR
					| OperationConditionEnum.PROCESSING_COMPLETED_WITH_QUESTION
					| OperationConditionEnum.PROCESSING_COMPLETED_WITH_SUGGESTION
					| OperationConditionEnum.PROCESSING_COMPLETED_WITH_WARNING
			? Omit<ControllerMeta, "incomingData"> & { [key: string]: any }
			: unknown
	: O extends OperationOriginEnum.REPO
		? MetaContainingResult
		: O extends
					| OperationOriginEnum.SERVICE
					| OperationOriginEnum.UNKNOWN
					| OperationOriginEnum.UTIL
					| OperationOriginEnum.EXTERNAL
			? any
			: unknown;

export interface OperationParams<
	TOrigin extends OperationOriginEnum,
	TConditin extends OperationConditionEnum,
> {
	name: string;
	origin: TOrigin;
	condition: TConditin;
	meta: OperationMeta<TOrigin, TConditin>;
}

export class OperationObject {
	public name: string;

	public origin: OperationOriginEnum;

	public condition: OperationConditionEnum;

	public meta: unknown;

	private constructor(
		name: string,
		origin: OperationOriginEnum,
		condition: OperationConditionEnum,
		meta: unknown,
	) {
		this.name = name;
		this.origin = origin;
		this.condition = condition;
		this.meta = meta;
	}

	static create<TOrigin extends OperationOriginEnum, TCondition extends OperationConditionEnum>(
		params: OperationParams<TOrigin, TCondition>,
	) {
		return new OperationObject(params.name, params.origin, params.condition, params.meta);
	}
}
