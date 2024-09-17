export interface EstimateRide {
	StartAddress: string;
	EndAddress: string;
}

export interface EstimateRideResponse {
	priceEstimate: number;
	estimatedDriverArrivalSeconds: number;
}

export interface CreateRide {
	StartAddress: string;
	EndAddress: string;
	Price: number;
	EstimatedDriverArrivalSeconds: number;
}

export interface CreateRideResponse {
	clientEmail: string;
	createdAtTimestamp: number;
	driverEmail: string | null;
	endAddress: string;
	price: number;
	startAddress: string;
	status: RideStatus;
	estimatedDriverArrival: number;
	estimatedRideEnd: number | null;
}

export interface UpdateRideRequest {
	ClientEmail: string;
	RideCreatedAtTimestamp: number;
	Status: RideStatus;
}

export enum RideStatus {
	CREATED = 0,
	ACCEPTED = 1,
	COMPLETED = 2,
}

export interface GetRideStatusRequest {
	ClientEmail: string;
	RideCreatedAtTimestamp: number;
}

export interface DriverRating {
	ClientEmail: string;
	RideTimestamp: number;
	DriverEmail: string;
	Value: number;
}
