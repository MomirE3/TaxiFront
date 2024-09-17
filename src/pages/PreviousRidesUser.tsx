import { FC, useEffect, useState } from 'react';
import { RideServiceType } from '../Services/RideService';
import { CreateRideResponse } from '../models/Ride';
import { Table, Container } from 'react-bootstrap';

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
		<Container className='mt-4'>
			<h2>Previous Rides</h2>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Created At</th>
						<th>Start Address</th>
						<th>End Address</th>
						<th>Client Email</th>
						<th>Driver Email</th>
						<th>Status</th>
						<th>Price</th>
					</tr>
				</thead>
				<tbody>
					{rideData.map((ride) => (
						<tr key={ride.createdAtTimestamp}>
							<td>{ride.createdAtTimestamp}</td>
							<td>{ride.startAddress}</td>
							<td>{ride.endAddress}</td>
							<td>{ride.clientEmail}</td>
							<td>
								{ride.driverEmail ? ride.driverEmail : 'N/A'}
							</td>
							<td>{ride.status}</td>
							<td>{ride.price}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Container>
	);
};

export default PreviousRidesUser;
