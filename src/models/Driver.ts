import { Profile } from './Auth/Profile';

export enum DriverStatus {
	NOT_VERIFIED = 0,
	VERIFIED = 1,
	BANNED = 2,
}

export interface UpdateDriverStatusData {
	Email: string;
	Status: DriverStatus;
}

export interface Driver extends Profile {
	status: DriverStatus;
	rating?: number;
}
