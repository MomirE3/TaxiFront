import { FC, useEffect, useState } from 'react';
import { DriverServiceType } from '../Services/DriverService';
import { Driver, DriverStatus, UpdateDriverStatusData } from '../models/Driver';
import { Table, Button, Container } from 'react-bootstrap';

interface IProps {
	driverService: DriverServiceType;
}

const Verification: FC<IProps> = (props) => {
	const [driversData, setDriversData] = useState<Driver[]>([]);

	useEffect(() => {
		const fetchDrivers = async () => {
			const data = await props.driverService.GetAllDrivers();
			if (data) {
				const driversWithRatings = await Promise.all(
					data.map(async (driver) => {
						const rating =
							await props.driverService.GetDriverRating(
								driver.email
							);
						return { ...driver, rating };
					})
				);
				setDriversData(driversWithRatings);
			}
		};
		fetchDrivers();
	}, [props.driverService]);

	const handleVerify = (driver: Driver) => {
		updateDriverStatus(driver, DriverStatus.VERIFIED, 'verified');
	};

	const handleBan = (driver: Driver) => {
		updateDriverStatus(driver, DriverStatus.BANNED, 'banned');
	};

	const handleUnban = (driver: Driver) => {
		updateDriverStatus(driver, DriverStatus.VERIFIED, 'unbanned');
	};

	async function updateDriverStatus(
		driver: Driver,
		status: DriverStatus,
		action: string
	) {
		const request: UpdateDriverStatusData = {
			Email: driver.email,
			Status: status,
		};

		try {
			const response = await props.driverService.UpdateDriverStatus(
				request
			);

			if (response && response.status === 200) {
				alert(
					`Driver ${driver.username} has been ${action} successfully.`
				);
				const data = await props.driverService.GetAllDrivers();
				if (data) {
					setDriversData(data);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<Container className='mt-4'>
			<h2>Driver Verification</h2>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Username</th>
						<th>Email</th>
						<th>Full Name</th>
						<th>Date of Birth</th>
						<th>Address</th>
						<th>Rating</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{driversData.map((driver) => (
						<tr key={driver.username}>
							<td>{driver.username}</td>
							<td>{driver.email}</td>
							<td>{driver.fullname}</td>
							<td>{driver.dateOfBirth}</td>
							<td>{driver.address}</td>
							<td>
								{driver.rating === 0 ? 'N/A' : driver.rating}
							</td>
							<td>{driver.status}</td>
							<td>
								{driver.status ===
									DriverStatus.NOT_VERIFIED && (
									<Button
										variant='primary'
										onClick={() => handleVerify(driver)}
									>
										Verify
									</Button>
								)}
								{driver.status === DriverStatus.VERIFIED && (
									<Button
										variant='danger'
										onClick={() => handleBan(driver)}
									>
										Ban
									</Button>
								)}
								{driver.status === DriverStatus.BANNED && (
									<Button
										variant='success'
										onClick={() => handleUnban(driver)}
									>
										Unban
									</Button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Container>
	);
};

export default Verification;
