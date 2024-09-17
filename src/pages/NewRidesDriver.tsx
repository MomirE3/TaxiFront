import { FC, useEffect, useState, useRef } from 'react';
import { RideServiceType } from '../Services/RideService';
import {
	CreateRideResponse,
	RideStatus,
	UpdateRideRequest,
} from '../models/Ride';
import { DriverStatus } from '../models/Driver';
import { DriverServiceType } from '../Services/DriverService';
import { JWTStorageType } from '../Services/JWTStorage';
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Paper,
} from '@mui/material';

interface IProps {
	rideService: RideServiceType;
	driverService: DriverServiceType;
	jwtService: JWTStorageType;
}

const NewRidesDriver: FC<IProps> = (props) => {
	const [rideData, setRideData] = useState<CreateRideResponse[]>([]);
	const [isModalOpen, setModalOpen] = useState(false);
	const [isRideActive, setIsRideActive] = useState(false);
	const [arrivalTime, setArrivalTime] = useState<number | null>(null);
	const [rideDuration, setRideDuration] = useState<number | null>(null);

	const [driverStatus, setDriverStatus] = useState<DriverStatus>();
	const [userRole, setUserRole] = useState('');
	const [userMail, setUserMail] = useState('');

	const [acceptedRide, setAcceptedRide] = useState<CreateRideResponse | null>(
		null
	);

	const arrivalTimeRef = useRef<number | null>(null);
	const rideDurationRef = useRef<number | null>(null);

	const convertToSecondsDifference = (isoTimestamp: number): number => {
		const date = new Date(isoTimestamp);
		const now = new Date();
		const differenceInMilliseconds = date.getTime() - now.getTime();
		return Math.floor(differenceInMilliseconds / 1000);
	};

	useEffect(() => {
		const token = props.jwtService.getJWT();
		if (token !== null) {
			const decoded = props.jwtService.decodeJWT(token.token);
			if (decoded) {
				setUserRole(decoded.role);
				setUserMail(decoded.email);
			}
		}
	}, [props.jwtService]);

	useEffect(() => {
		if (userRole === 'DRIVER') {
			const fetchRides = async () => {
				const data = await props.driverService.GetDriverStatus(
					userMail
				);
				setDriverStatus(data);
			};

			fetchRides();
		}
	}, [props.driverService, userMail, userRole]);

	useEffect(() => {
		const fetchRides = async () => {
			const data = await props.rideService.GetNewRides();
			if (data) {
				setRideData(data);
			}
		};
		fetchRides();
	}, [props.rideService]);

	const handleAcceptRide = async (
		ClientEmail: string,
		RideCreatedAtTimestamp: number
	) => {
		const updateRequest: UpdateRideRequest = {
			ClientEmail,
			RideCreatedAtTimestamp,
			Status: RideStatus.ACCEPTED,
		};

		try {
			const response = await props.rideService.UpdateRideRequests(
				updateRequest
			);
			if (response !== null) {
				const acceptedRideRes = response.data as CreateRideResponse;
				if (acceptedRideRes !== null) {
					setAcceptedRide(acceptedRideRes);
				}

				const arrival = convertToSecondsDifference(
					response.data.estimatedDriverArrival
				);
				const duration = convertToSecondsDifference(
					response.data.estimatedRideEnd
				);

				setArrivalTime(arrival);
				setRideDuration(duration);
				arrivalTimeRef.current = arrival;
				rideDurationRef.current = duration;
			}
			const updatedData = await props.rideService.GetNewRides();
			if (updatedData) {
				setRideData(updatedData);
			}
			setIsRideActive(true);
			setModalOpen(true);
		} catch (error) {
			console.error('Failed to accept ride:', error);
			alert('Failed to accept ride.');
		}
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isRideActive) {
			interval = setInterval(() => {
				if (
					arrivalTimeRef.current !== null &&
					arrivalTimeRef.current > 0
				) {
					arrivalTimeRef.current -= 1;
					setArrivalTime(arrivalTimeRef.current);
				} else if (
					rideDurationRef.current !== null &&
					rideDurationRef.current > 0
				) {
					rideDurationRef.current -= 1;
					setRideDuration(rideDurationRef.current);
				}
			}, 1000);
		}

		return () => {
			clearInterval(interval);
		};
	}, [isRideActive]);

	useEffect(() => {
		if (rideDuration === 0) {
			setIsRideActive(false);
			setModalOpen(false);
		}
	}, [rideDuration]);

	const toggleModal = () => {
		if (!isRideActive) {
			setModalOpen(!isModalOpen);
		}
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes} minutes and ${remainingSeconds} seconds`;
	};

	return (
		<Box sx={{ padding: 2 }}>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Created At</TableCell>
							<TableCell>Start Address</TableCell>
							<TableCell>End Address</TableCell>
							<TableCell>Client Email</TableCell>
							<TableCell>Driver Email</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Price</TableCell>
							<TableCell>Accept</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rideData.map((ride) => (
							<TableRow key={ride.createdAtTimestamp}>
								<TableCell>{ride.createdAtTimestamp}</TableCell>
								<TableCell>{ride.startAddress}</TableCell>
								<TableCell>{ride.endAddress}</TableCell>
								<TableCell>{ride.clientEmail}</TableCell>
								<TableCell>
									{ride.driverEmail
										? ride.driverEmail
										: 'N/A'}
								</TableCell>
								<TableCell>{ride.status}</TableCell>
								<TableCell>{ride.price}</TableCell>
								<TableCell>
									<Button
										variant='contained'
										color='primary'
										onClick={() =>
											handleAcceptRide(
												ride.clientEmail,
												ride.createdAtTimestamp
											)
										}
										disabled={
											driverStatus ===
												DriverStatus.BANNED ||
											driverStatus ===
												DriverStatus.NOT_VERIFIED
										}
									>
										Accept
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Dialog
				open={isModalOpen}
				onClose={toggleModal}
				aria-labelledby='ride-modal-title'
			>
				<DialogTitle id='ride-modal-title'>Ride Details</DialogTitle>
				<DialogContent>
					<Typography>You accepted the ride</Typography>
					{arrivalTime === null && (
						<Typography>
							Estimate time {formatTime(arrivalTime!)}
						</Typography>
					)}
					<Typography>
						Countdown to driver's arrival:{' '}
						{arrivalTime !== null ? formatTime(arrivalTime) : ''}
					</Typography>
					{rideDuration !== null && (
						<Typography>
							Countdown to end of ride: {formatTime(rideDuration)}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={toggleModal}
						color='primary'
						disabled={isRideActive}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default NewRidesDriver;
