import { FC, useState, useEffect } from 'react';
import {
	CreateRide,
	CreateRideResponse,
	DriverRating,
	EstimateRide,
	EstimateRideResponse,
	GetRideStatusRequest,
	RideStatus,
	UpdateRideRequest,
} from '../models/Ride';
import { RideServiceType } from '../Services/RideService';
import { DriverServiceType } from '../Services/DriverService';
import {
	Box,
	TextField,
	Button,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import Rating from '../components/ui/Rating';

interface IProps {
	rideService: RideServiceType;
	driverService: DriverServiceType;
}

const NewRide: FC<IProps> = (props) => {
	const [formData, setFormData] = useState<EstimateRide>({
		StartAddress: '',
		EndAddress: '',
	});
	const [newRide, setNewRide] = useState<CreateRide | null>(null);
	const [newRideResponse, setNewRideResponse] =
		useState<CreateRideResponse | null>(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const [estimateResponse, setEstimateResponse] =
		useState<EstimateRideResponse | null>(null);
	const [arrivalTime, setArrivalTime] = useState<number | null>(null);
	const [rideDuration, setRideDuration] = useState<number | null>(null);
	const [isRideActive, setIsRideActive] = useState(false);
	const [rideAccepted, setRideAccepted] = useState(false);
	const [isRatingOpen, setIsRatingOpen] = useState<boolean>(false);
	const [ratingDriverInformation, setRatingDriverInformation] =
		useState<DriverRating | null>(null);

	const [acceptedRide, setAcceptedRide] = useState<CreateRideResponse | null>(
		null
	);

	const toggleModal = () => {
		setModalOpen(!isModalOpen);
	};

	const toggleModalRating = () => {
		setIsRatingOpen(false);
	};

	const handleOrderClick = async () => {
		const response = await props.rideService.NewRide(formData);
		if (response !== null) {
			setEstimateResponse(response.data);
			toggleModal();
		}
	};

	const handleNewRideClick = async () => {
		setNewRide({
			StartAddress: formData.StartAddress,
			EndAddress: formData.EndAddress,
			Price: estimateResponse?.priceEstimate!,
			EstimatedDriverArrivalSeconds:
				estimateResponse?.estimatedDriverArrivalSeconds!,
		});
		setArrivalTime(estimateResponse?.estimatedDriverArrivalSeconds!);
		setIsRideActive(true);
	};

	useEffect(() => {
		const createNewRide = async () => {
			if (newRide !== null) {
				const response = await props.rideService.CreateNewRide(newRide);
				setNewRideResponse(response?.data || null);
			}
		};
		createNewRide();
	}, [newRide, props.rideService]);

	useEffect(() => {
		let arrivalInterval: NodeJS.Timeout | null = null;
		let rideInterval: NodeJS.Timeout | null = null;

		if (isRideActive && !rideAccepted) {
			const interval = setInterval(async () => {
				const request: GetRideStatusRequest = {
					ClientEmail: newRideResponse?.clientEmail!,
					RideCreatedAtTimestamp:
						newRideResponse?.createdAtTimestamp!,
				};
				const response = await props.rideService.GetRideStatus(request);

				if (response !== null) {
					const rideStatus: CreateRideResponse =
						response.data as CreateRideResponse;

					if (rideStatus.status === RideStatus.ACCEPTED) {
						setAcceptedRide(response.data as CreateRideResponse);
						setRideAccepted(true);
						clearInterval(interval);
						setRideDuration(
							convertToSecondsDifference(
								rideStatus.estimatedRideEnd!
							)
						);
						setArrivalTime(
							convertToSecondsDifference(
								rideStatus.estimatedDriverArrival
							)
						);

						setRatingDriverInformation({
							ClientEmail: rideStatus.clientEmail!,
							RideTimestamp: rideStatus.createdAtTimestamp!,
							DriverEmail: rideStatus.driverEmail!,
							Value: 0!,
						});

						arrivalInterval = setInterval(() => {
							setArrivalTime((prevTime) => {
								if (prevTime !== null && prevTime > 0) {
									return prevTime - 1;
								} else {
									clearInterval(arrivalInterval!);

									if (!rideInterval) {
										rideInterval = setInterval(() => {
											setRideDuration((prevTime) =>
												prevTime !== null &&
												prevTime > 0
													? prevTime - 1
													: 0
											);
										}, 1000);
									}
									return 0;
								}
							});
						}, 1000);
					}
				}
			}, 5000);

			return () => clearInterval(interval);
		}

		return () => {
			if (arrivalInterval) {
				clearInterval(arrivalInterval);
			}
			if (rideInterval) {
				clearInterval(rideInterval);
			}
		};
	}, [
		isRideActive,
		rideAccepted,
		arrivalTime,
		rideDuration,
		newRideResponse,
		props.rideService,
	]);

	const handleRate = async (rating: number) => {
		if (ratingDriverInformation !== null) {
			const ratingRequest = {
				...ratingDriverInformation,
				Value: rating,
			};
			try {
				await props.driverService.RateDriver(ratingRequest);
				toggleModalRating();
			} catch (error) {
				console.error('Failed to accept ride:', error);
				alert('Failed to accept ride.');
			}
		}
	};

	useEffect(() => {
		const finishRide = async () => {
			if (newRideResponse?.clientEmail !== undefined) {
				const updateRequest: UpdateRideRequest = {
					ClientEmail: newRideResponse?.clientEmail,
					RideCreatedAtTimestamp: newRideResponse?.createdAtTimestamp,
					Status: RideStatus.COMPLETED,
				};

				try {
					const response = await props.rideService.UpdateRideRequests(
						updateRequest
					);
				} catch (error) {
					console.error('Failed to accept ride:', error);
					alert('Failed to accept ride.');
				}
			}
		};

		if (rideDuration === 0) {
			finishRide();
			setIsRideActive(false);
			setModalOpen(false);
			setIsRatingOpen(true);
		}
	}, [rideDuration, newRideResponse, props.rideService]);

	const convertToSecondsDifference = (isoTimestamp: number): number => {
		const date = new Date(isoTimestamp);
		const now = new Date();
		const differenceInMilliseconds = date.getTime() - now.getTime();
		return Math.floor(differenceInMilliseconds / 1000);
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes} minutes and ${remainingSeconds} seconds`;
	};

	return (
		<>
			<Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
				<Typography variant='h4' gutterBottom>
					Create a new Ride
				</Typography>
				<Box sx={{ marginBottom: 2 }}>
					<TextField
						label='Start Address'
						value={formData.StartAddress}
						type='text'
						onChange={(e) => {
							setFormData((prevState) => ({
								...prevState,
								StartAddress: e.target.value,
							}));
						}}
						fullWidth
						variant='outlined'
					/>
				</Box>
				<Box sx={{ marginBottom: 2 }}>
					<TextField
						label='End Address'
						value={formData.EndAddress}
						type='text'
						onChange={(e) => {
							setFormData((prevState) => ({
								...prevState,
								EndAddress: e.target.value,
							}));
						}}
						fullWidth
						variant='outlined'
					/>
				</Box>
				<Button
					variant='contained'
					color='primary'
					onClick={handleOrderClick}
					disabled={isRideActive}
					fullWidth
				>
					Order
				</Button>
			</Box>
			{estimateResponse && (
				<Dialog open={isModalOpen} onClose={toggleModal}>
					<DialogTitle>Ride Details</DialogTitle>
					<DialogContent>
						<Typography>
							Price: {estimateResponse.priceEstimate}
						</Typography>
						{arrivalTime === null && (
							<Typography>
								Estimate time{' '}
								{formatTime(
									estimateResponse.estimatedDriverArrivalSeconds
								)}
							</Typography>
						)}
						<Typography>
							Countdown to driver's arrival:{' '}
							{arrivalTime !== null
								? formatTime(arrivalTime)
								: ''}
						</Typography>
						{rideDuration !== null && (
							<Typography>
								Countdown to end of ride:{' '}
								{formatTime(rideDuration)}
							</Typography>
						)}
					</DialogContent>
					<DialogActions>
						<Button
							onClick={toggleModal}
							disabled={isRideActive}
							color='secondary'
						>
							Close
						</Button>
						<Button
							onClick={handleNewRideClick}
							disabled={isRideActive}
							color='primary'
						>
							Accept ride
						</Button>
					</DialogActions>
				</Dialog>
			)}
			{isRatingOpen && (
				<Dialog open={isRatingOpen} onClose={toggleModalRating}>
					<DialogTitle>Rate the Ride</DialogTitle>
					<DialogContent>
						<Typography gutterBottom>
							Leave us your rating for the ride!
						</Typography>
						<Rating onRate={handleRate} />
					</DialogContent>
					<DialogActions>
						<Button onClick={toggleModalRating} color='primary'>
							Close
						</Button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
};

export default NewRide;
