import { FC, useEffect, useState } from 'react';
import { RideServiceType } from '../Services/RideService';
import { CreateRideResponse } from '../models/Ride';
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
} from '@mui/material';

interface IProps {
	rideService: RideServiceType;
}

const PreviousRidesUser: FC<IProps> = (props) => {
	const [rideData, setRideData] = useState<CreateRideResponse[]>([]);

	useEffect(() => {
		const fetchRides = async () => {
			const data = await props.rideService.GetUserRides();
			if (data) {
				setRideData(data);
			}
		};
		fetchRides();
	}, [props.rideService]);

	return (
		<Box sx={{ padding: 2 }}>
			<Typography variant='h4' gutterBottom>
				Previous Rides
			</Typography>
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
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default PreviousRidesUser;
