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
import { Container, Form, Button, Modal, Row, Col } from 'react-bootstrap';
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
			<Container className='p-4' style={{ maxWidth: '600px' }}>
				<h2>Create a New Ride</h2>
				<Form>
					<Form.Group controlId='startAddress' className='mb-3'>
						<Form.Label>Start Address</Form.Label>
						<Form.Control
							type='text'
							placeholder='Enter start address'
							value={formData.StartAddress}
							onChange={(e) =>
								setFormData((prevState) => ({
									...prevState,
									StartAddress: e.target.value,
								}))
							}
						/>
					</Form.Group>
					<Form.Group controlId='endAddress' className='mb-3'>
						<Form.Label>End Address</Form.Label>
						<Form.Control
							type='text'
							placeholder='Enter end address'
							value={formData.EndAddress}
							onChange={(e) =>
								setFormData((prevState) => ({
									...prevState,
									EndAddress: e.target.value,
								}))
							}
						/>
					</Form.Group>
					<Button
						variant='primary'
						onClick={handleOrderClick}
						disabled={isRideActive}
						className='w-100'
					>
						Order
					</Button>
				</Form>
			</Container>

			{estimateResponse && (
				<Modal
					show={isModalOpen}
					onHide={toggleModal}
					backdrop={isRideActive ? 'static' : true}
					keyboard={!isRideActive}
				>
					<Modal.Header closeButton={!isRideActive}>
						<Modal.Title>Ride Details</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>Price: {estimateResponse.priceEstimate}</p>
						<p>
							Countdown to driver's arrival:{' '}
							{arrivalTime !== null
								? formatTime(arrivalTime)
								: ''}
						</p>
						{rideDuration !== null && (
							<p>
								Countdown to end of ride:{' '}
								{formatTime(rideDuration)}
							</p>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant='secondary'
							onClick={toggleModal}
							disabled={isRideActive}
						>
							Close
						</Button>
						<Button
							variant='primary'
							onClick={handleNewRideClick}
							disabled={isRideActive}
						>
							Accept ride
						</Button>
					</Modal.Footer>
				</Modal>
			)}

			{isRatingOpen && (
				<Modal show={isRatingOpen} onHide={toggleModalRating}>
					<Modal.Header closeButton>
						<Modal.Title>Rate the Ride</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>Leave us your rating for the ride!</p>
						<Rating onRate={handleRate} />
					</Modal.Body>
					<Modal.Footer>
						<Button variant='primary' onClick={toggleModalRating}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
			)}
		</>
	);
};

export default NewRide;
