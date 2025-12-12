// import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { CameraDevice, Employee, FaceLog } from "src/common/database/enity";
// import AxiosDigestAuth from "axios-digest";
// import { TrainScheduleService } from "../train-schedule/train-schedule.service";

// interface CameraListener {
// 	cameraDevice: CameraDevice;
// 	digestAuth: AxiosDigestAuth;
// 	isListening: boolean;
// }

// @Injectable()
// export class HikvisionListenerService implements OnModuleInit {
// 	private readonly logger = new Logger(HikvisionListenerService.name);
// 	private cameraListeners: Map<number, CameraListener> = new Map();

// 	constructor(
// 		@InjectRepository(FaceLog)
// 		private readonly faceLogRepo: Repository<FaceLog>,
// 		@InjectRepository(Employee)
// 		private readonly employeeRepo: Repository<Employee>,
// 		@InjectRepository(CameraDevice)
// 		private readonly cameraDeviceRepo: Repository<CameraDevice>,

// 		private readonly trainScheduleService: TrainScheduleService,
// 	) {}

// 	async onModuleInit() {
// 		await this.startListeningToAllCameras();
// 	}

// 	private async startListeningToAllCameras() {
// 		this.logger.log("Loading camera devices from database...");

// 		const cameraDevices = await this.cameraDeviceRepo.find({ where: { isActive: true } });

// 		if (cameraDevices.length === 0) {
// 			this.logger.warn("No camera devices found in database!");
// 			return;
// 		}

// 		this.logger.log(`Found ${cameraDevices.length} camera device(s). Starting listeners...`);

// 		for (const cameraDevice of cameraDevices) {
// 			const listener: CameraListener = {
// 				cameraDevice,
// 				digestAuth: new AxiosDigestAuth(cameraDevice.username, cameraDevice.password),
// 				isListening: true,
// 			};

// 			this.cameraListeners.set(cameraDevice.id, listener);
// 			this.startListeningToCamera(listener);
// 		}
// 	}

// 	private async startListeningToCamera(listener: CameraListener) {
// 		const { cameraDevice, digestAuth } = listener;
// 		const cameraUrl = `http://${cameraDevice.ip}/ISAPI/Event/notification/alertStream`;

// 		this.logger.log(
// 			`Starting listener for camera: ${cameraDevice.ip} (Station: ${cameraDevice.stationId})`,
// 		);

// 		while (listener.isListening) {
// 			try {
// 				this.logger.log(`[*] Hikvision: Connecting to ${cameraUrl}`);

// 				const response = await digestAuth.get(cameraUrl, {
// 					responseType: "stream",
// 					timeout: 0,
// 				});

// 				if (response.status !== 200) {
// 					this.logger.error(`[-] Hikvision error: ${response.status}`);
// 					await this.sleep(3000);
// 					continue;
// 				}

// 				this.logger.log("[+] Connected. Listening forever...");

// 				let buffer = "";

// 				response.data.on("data", async (chunk: Buffer) => {
// 					try {
// 						const chunkStr = chunk.toString("utf-8");
// 						buffer += chunkStr;

// 						// Process MIME boundary
// 						while (buffer.includes("--MIME_boundary")) {
// 							const parts = buffer.split("--MIME_boundary");
// 							const part = parts[0];
// 							buffer = parts.slice(1).join("--MIME_boundary");

// 							if (!part.includes("AccessControllerEvent")) {
// 								continue;
// 							}

// 							try {
// 								const jsonStart = part.indexOf("{");
// 								const jsonEnd = part.lastIndexOf("}") + 1;

// 								if (jsonStart === -1) {
// 									continue;
// 								}

// 								const jsonStr = part.substring(jsonStart, jsonEnd);
// 								const data = JSON.parse(jsonStr);

// 								const acevent = data.AccessControllerEvent;
// 								console.log(data);

// 								if (!acevent) {
// 									continue;
// 								}

// 								const employeeId =
// 									acevent.employeeNoString ||
// 									acevent.employeeNo ||
// 									acevent.cardNo;
// 								const timestampStr = data.dateTime;
// 								let timestamp = new Date();

// 								if (timestampStr) {
// 									timestamp = new Date(timestampStr);
// 								}

// 								let employee: Employee | null = null;
// 								let cameraDevice: CameraDevice | null = null;
// 								if (employeeId) {
// 									try {
// 										[employee, cameraDevice] = await Promise.all([
// 											this.employeeRepo.findOne({
// 												where: { id: employeeId },
// 											}),
// 											this.cameraDeviceRepo.findOne({
// 												where: { ip: data?.ipAddress },
// 											}),
// 										]);
// 									} catch (err) {
// 										this.logger.warn(`Employee not found: ${employeeId}`);
// 									}
// 								}

// 								if (employee) {
// 									const faceLog = this.faceLogRepo.create({
// 										employeeId: employee.id,
// 										stationId:
// 											cameraDevice?.stationId ||
// 											listener.cameraDevice.stationId,
// 										status: employee ? "recognized" : "not_found",
// 										fullname: acevent.name,
// 										deviceIp: data?.ipAddress || listener.cameraDevice.ip,
// 										operatedAt: timestamp,
// 									});

// 									await this.faceLogRepo.save(faceLog);

// 									this.trainScheduleService.deportureArrivalTime({
// 										date: timestamp,
// 										stuff: employee.id,
// 										stationId:
// 											cameraDevice?.stationId ||
// 											listener.cameraDevice.stationId,
// 									});
// 									this.logger.log(
// 										`[LOG] ${listener.cameraDevice.ip} | ${timestamp.toISOString()} | ${employee.fullname}`,
// 									);
// 								}
// 							} catch (jsonError: any) {
// 								this.logger.error(`JSON parse error: ${jsonError.message}`);
// 							}
// 						}
// 					} catch (error: any) {
// 						this.logger.error(`Data processing error: ${error.message}`);
// 					}
// 				});

// 				response.data.on("error", (error: any) => {
// 					this.logger.error(`[!] ${cameraDevice.ip} - Stream error: ${error.message}`);
// 				});

// 				response.data.on("end", () => {
// 					this.logger.warn(`[!] ${cameraDevice.ip} - Stream ended`);
// 				});

// 				// Wait for stream to finish
// 				await new Promise((resolve, reject) => {
// 					response.data.on("end", resolve);
// 					response.data.on("error", reject);
// 				});
// 			} catch (error: any) {
// 				this.logger.error(
// 					`[!] ${cameraDevice.ip} - Stream disconnected! Reason: ${error.message}`,
// 				);
// 			}

// 			this.logger.log(`[*] ${cameraDevice.ip} - Reconnecting in 5 seconds...`);
// 			await this.sleep(5000);
// 		}
// 	}

// 	private sleep(ms: number): Promise<void> {
// 		return new Promise((resolve) => setTimeout(resolve, ms));
// 	}

// 	stopListening(cameraId?: number) {
// 		if (cameraId) {
// 			const listener = this.cameraListeners.get(cameraId);
// 			if (listener) {
// 				listener.isListening = false;
// 				this.cameraListeners.delete(cameraId);
// 				this.logger.log(`Stopped listening to camera ID: ${cameraId}`);
// 			}
// 		} else {
// 			// Stop all listeners
// 			this.cameraListeners.forEach((listener) => {
// 				listener.isListening = false;
// 			});
// 			this.cameraListeners.clear();
// 			this.logger.log("Stopped all Hikvision camera listeners");
// 		}
// 	}

// 	async addCameraListener(cameraId: number) {
// 		const cameraDevice = await this.cameraDeviceRepo.findOne({ where: { id: cameraId } });

// 		if (!cameraDevice) {
// 			this.logger.warn(`Camera device with ID ${cameraId} not found`);
// 			return;
// 		}

// 		if (this.cameraListeners.has(cameraId)) {
// 			this.logger.warn(`Camera ${cameraDevice.ip} is already being listened to`);
// 			return;
// 		}

// 		const listener: CameraListener = {
// 			cameraDevice,
// 			digestAuth: new AxiosDigestAuth(cameraDevice.username, cameraDevice.password),
// 			isListening: true,
// 		};

// 		this.cameraListeners.set(cameraDevice.id, listener);
// 		this.startListeningToCamera(listener);
// 		this.logger.log(`Added listener for camera: ${cameraDevice.ip}`);
// 	}
// }
