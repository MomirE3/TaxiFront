import axios, { AxiosResponse } from 'axios';
import { DriverRating } from '../models/Ride';
import { JWTStorage } from './JWTStorage';
import { Driver, UpdateDriverStatusData } from '../models/Driver';

const backend = process.env.REACT_APP_BACKEND_URL;

async function RateDriver(driverRating: DriverRating) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.post(
			`${backend}/driver/rate-driver`,
			driverRating,
			{
				headers: {
					Authorization: `Bearer ${jtwToken?.token}`,
				},
			}
		);
		return res;
	} catch {
		return null;
	}
}

async function GetAllDrivers() {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.get(`${backend}/driver/list-drivers`, {
			headers: {
				Authorization: `Bearer ${jtwToken?.token}`,
			},
		});
		return res.data;
	} catch {
		return null;
	}
}

async function GetDriverStatus(email: string) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.post(
			`${backend}/driver/driver-status`,
			{
				Email: email,
			},
			{
				headers: {
					Authorization: `Bearer ${jtwToken?.token}`,
				},
			}
		);
		return res.data;
	} catch {
		return null;
	}
}

async function GetDriverRating(email: string) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.post(
			`${backend}/driver/avg-rating-driver`,
			{
				Email: email,
			},
			{
				headers: {
					Authorization: `Bearer ${jtwToken?.token}`,
				},
			}
		);
		return res.data;
	} catch {
		return null;
	}
}

async function UpdateDriverStatus(driverStatus: UpdateDriverStatusData) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.patch(
			`${backend}/driver/driver-status`,
			driverStatus,
			{
				headers: {
					Authorization: `Bearer ${jtwToken?.token}`,
				},
			}
		);
		return res;
	} catch {
		return null;
	}
}

export type DriverServiceType = {
	RateDriver: (
		driverRating: DriverRating
	) => Promise<null | AxiosResponse<any, any>>;
	GetAllDrivers: () => Promise<Driver[] | null>;
	GetDriverStatus: (email: string) => Promise<any>;
	GetDriverRating: (email: string) => Promise<any>;
	UpdateDriverStatus: (
		driverStatus: UpdateDriverStatusData
	) => Promise<null | AxiosResponse<any, any>>;
};

export const DriverService: DriverServiceType = {
	RateDriver,
	GetAllDrivers,
	GetDriverStatus,
	UpdateDriverStatus,
	GetDriverRating,
};
