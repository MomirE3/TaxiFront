import axios, { AxiosResponse } from 'axios';
import {
	CreateRide,
	CreateRideResponse,
	EstimateRide,
	UpdateRideRequest,
} from '../models/Ride';
import { JWTStorage } from './JWTStorage';

const backend = process.env.REACT_APP_BACKEND_URL;

async function NewRide(estimateRide: EstimateRide) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.post(
			`${backend}/ride/estimate-ride`,
			estimateRide,
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

async function CreateNewRide(createRide: CreateRide) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.post(
			`${backend}/ride/create-ride`,
			createRide,
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

async function GetNewRides() {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.get(`${backend}/ride/get-new-rides`, {
			headers: {
				Authorization: `Bearer ${jtwToken?.token}`,
			},
		});
		return res.data;
	} catch {
		return null;
	}
}

async function GetUserRides() {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.get(`${backend}/ride/get-user-rides`, {
			headers: {
				Authorization: `Bearer ${jtwToken?.token}`,
			},
		});
		return res.data;
	} catch {
		return null;
	}
}

async function UpdateRideRequests(updateRideRequest: UpdateRideRequest) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.patch(
			`${backend}/ride/update-ride-status`,
			updateRideRequest,
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

async function GetRideStatus(rideId: string) {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.get(
			`${backend}/ride/get-ride/${rideId}`,
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

export type RideServiceType = {
	NewRide: (
		estimateRide: EstimateRide
	) => Promise<null | AxiosResponse<any, any>>;
	CreateNewRide: (
		createRide: CreateRide
	) => Promise<null | AxiosResponse<any, any>>;
	GetNewRides: () => Promise<CreateRideResponse[] | null>;
	GetUserRides: () => Promise<CreateRideResponse[] | null>;
	UpdateRideRequests: (
		updateRideRequest: UpdateRideRequest
	) => Promise<null | AxiosResponse<any, any>>;
	GetRideStatus: (
		rideId: string
	) => Promise<null | AxiosResponse<any, any>>;
};

export const RideService: RideServiceType = {
	NewRide,
	CreateNewRide,
	GetNewRides,
	UpdateRideRequests,
	GetRideStatus,
	GetUserRides,
};
