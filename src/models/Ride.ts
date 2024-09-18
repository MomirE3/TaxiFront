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
	id: string;
	clientId: string;
	createdAtTimestamp: number;
	driverId: string | null;
	endAddress: string;
	price: number;
	startAddress: string;
	status: RideStatus;
	estimatedDriverArrival: number;
	estimatedRideEnd: number | null;
}

export interface UpdateRideRequest {
	RideId: string;
	Status: RideStatus;
}

export enum RideStatus {
	CREATED = 0,
	ACCEPTED = 1,
	COMPLETED = 2,
}

export interface DriverRating {
	RideId: string
	Value: number;
}
