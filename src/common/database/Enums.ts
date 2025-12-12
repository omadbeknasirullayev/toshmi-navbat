export enum RolesEnum {
	SUPER_ADMIN = "super_admin",
	SUPERVISOR = "supervisor",
	STUDENT = "student",
}

export enum GenderEnum {
	MALE = "male",
	FEMALE = "female",
}

export enum StaffRole {
	TRAIN_CHIEF = "train_chief",
	WAGON_SUPERVISOR = "wagon_supervisor",
}

export enum EmployeeAttendanceStatus {
	EXPECTED = "expected", // Kutilmoqda
	ARRIVED = "arrived", // Keldi
	LEFT = "left", // Chiqdi
	LATE = "late", // Kech qoldi
	ABSENT = "absent", // Kelmadi
}

export enum CatchupScheduleStudentStatus {
	PENDING = "pending",
	ARRIVED = "arrived",
	CANCELLED = "cancelled",
	ABSENT = "absent",
}
